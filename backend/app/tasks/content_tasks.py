from celery import current_app as celery_app
from app.models.content import ContentQueue, ContentStatus
from app.models.social_accounts import SocialAccount
from app.models import db
from app.services.social.twitter import TwitterService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def publish_scheduled_content(self, content_id: int):
    """Background task to publish scheduled content"""
    try:
        content = ContentQueue.query.get(content_id)
        if not content:
            logger.error(f"Content {content_id} not found")
            return

        if content.status != ContentStatus.SCHEDULED:
            logger.warning(f"Content {content_id} is not scheduled")
            return

        # Update status to posting
        content.status = ContentStatus.POSTING
        db.session.commit()

        # Get social media service
        social_service = _get_social_service(content.social_account)
        if not social_service:
            raise Exception("Failed to initialize social media service")

        # Publish content
        result = social_service.post_content(
            content=content.content,
            media_urls=content.media_urls or []
        )

        if result['success']:
            content.status = ContentStatus.POSTED
            content.posted_at = datetime.utcnow()
            content.platform_post_id = result['post_id']
            content.engagement_data = {'url': result.get('url')}
        else:
            content.status = ContentStatus.FAILED
            content.error_message = result['error']
            content.retry_count += 1

        db.session.commit()

        # Schedule analytics collection
        if content.status == ContentStatus.POSTED:
            collect_engagement_data.apply_async(
                args=[content.id],
                countdown=3600  # Collect after 1 hour
            )

        logger.info(f"Content {content_id} published successfully")

    except Exception as e:
        logger.error(f"Failed to publish content {content_id}: {str(e)}")
        content.status = ContentStatus.FAILED
        content.error_message = str(e)
        content.retry_count += 1
        db.session.commit()

        # Retry if under max retries
        if content.retry_count < 3:
            raise self.retry(countdown=60 * content.retry_count)

@celery_app.task
def collect_engagement_data(content_id: int):
    """Collect engagement data for published content"""
    try:
        content = ContentQueue.query.get(content_id)
        if not content or content.status != ContentStatus.POSTED:
            return

        social_service = _get_social_service(content.social_account)
        if not social_service:
            return

        # Get engagement metrics
        metrics = social_service.get_post_metrics(content.platform_post_id)
        if metrics:
            content.engagement_data = {
                **content.engagement_data,
                'metrics': metrics,
                'collected_at': datetime.utcnow().isoformat()
            }
            db.session.commit()

    except Exception as e:
        logger.error(f"Failed to collect engagement data for {content_id}: {str(e)}")

def _get_social_service(social_account: SocialAccount):
    """Factory function to get appropriate social media service"""
    services = {
        'twitter': TwitterService,
        # 'instagram': InstagramService,
        # 'linkedin': LinkedInService
    }

    service_class = services.get(social_account.platform.value)
    if service_class:
        return service_class(social_account)
    return None

@celery_app.task
def process_automation_schedule():
    """Process all active automations and create scheduled content"""
    from app.models.automation import Automation, AutomationStatus
    from app.services.ai.content_generator import ContentGeneratorService
    from datetime import datetime, timedelta

    try:
        # Find automations that need to run
        now = datetime.utcnow()
        automations = Automation.query.filter(
            Automation.status == AutomationStatus.ACTIVE,
            Automation.next_run <= now
        ).all()

        for automation in automations:
            try:
                # Generate content using AI
                content_generator = ContentGeneratorService(automation.user)

                for platform in automation.platforms:
                    social_account = SocialAccount.query.filter_by(
                        user_id=automation.user_id,
                        platform=platform,
                        is_active=True
                    ).first()

                    if not social_account:
                        continue

                    # Generate content
                    content_result = content_generator.generate_content(
                        topic=automation.content_settings.get('topic'),
                        platform=platform,
                        tone=automation.content_settings.get('tone', 'professional')
                    )

                    if content_result['success']:
                        # Create scheduled content
                        content = ContentQueue(
                            user_id=automation.user_id,
                            automation_id=automation.id,
                            social_account_id=social_account.id,
                            content=content_result['content'],
                            hashtags=content_result.get('hashtags', []),
                            scheduled_for=now + timedelta(minutes=5),
                            status=ContentStatus.SCHEDULED
                        )
                        db.session.add(content)

                # Update automation next run time
                schedule = automation.posting_schedule
                if schedule.get('type') == 'daily':
                    automation.next_run = now + timedelta(days=1)
                elif schedule.get('type') == 'weekly':
                    automation.next_run = now + timedelta(weeks=1)
                elif schedule.get('type') == 'hourly':
                    automation.next_run = now + timedelta(hours=schedule.get('interval', 1))

                automation.last_run = now
                automation.run_count += 1
                db.session.commit()

            except Exception as e:
                logger.error(f"Failed to process automation {automation.id}: {str(e)}")
                automation.status = AutomationStatus.ERROR
                automation.last_error = str(e)
                automation.error_count += 1
                db.session.commit()

    except Exception as e:
        logger.error(f"Failed to process automation schedule: {str(e)}")