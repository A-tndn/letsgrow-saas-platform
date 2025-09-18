import tweepy
from typing import Dict, List, Optional
from flask import current_app
from app.utils.encryption import decrypt_token
from app.models.social_accounts import SocialAccount
import logging
import requests

logger = logging.getLogger(__name__)

class TwitterService:
    def __init__(self, social_account: SocialAccount):
        self.social_account = social_account
        self.client = None
        self.api = None
        self._initialize_client()

    def _initialize_client(self):
        """Initialize Twitter API client"""
        try:
            access_token = decrypt_token(self.social_account.access_token_encrypted)
            access_token_secret = decrypt_token(self.social_account.refresh_token_encrypted)

            # Twitter API v2 client
            self.client = tweepy.Client(
                consumer_key=current_app.config['TWITTER_CLIENT_ID'],
                consumer_secret=current_app.config['TWITTER_CLIENT_SECRET'],
                access_token=access_token,
                access_token_secret=access_token_secret,
                wait_on_rate_limit=True
            )

            # OAuth 1.0a for media upload
            auth = tweepy.OAuthHandler(
                consumer_key=current_app.config['TWITTER_CLIENT_ID'],
                consumer_secret=current_app.config['TWITTER_CLIENT_SECRET']
            )
            auth.set_access_token(access_token, access_token_secret)
            self.api = tweepy.API(auth, wait_on_rate_limit=True)

        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {str(e)}")
            raise

    def post_content(self, content: str, media_urls: List[str] = None) -> Dict:
        """Post a tweet"""
        try:
            media_ids = []

            # Upload media if provided
            if media_urls:
                for media_url in media_urls:
                    media_id = self._upload_media(media_url)
                    if media_id:
                        media_ids.append(media_id)

            # Post tweet
            tweet = self.client.create_tweet(
                text=content,
                media_ids=media_ids if media_ids else None
            )

            return {
                'success': True,
                'post_id': tweet.data['id'],
                'url': f"https://twitter.com/{self.social_account.username}/status/{tweet.data['id']}"
            }

        except Exception as e:
            logger.error(f"Failed to post tweet: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_user_timeline(self, count: int = 10) -> List[Dict]:
        """Get user's recent tweets"""
        try:
            tweets = self.client.get_users_tweets(
                id=self.social_account.platform_user_id,
                max_results=min(count, 100),
                tweet_fields=['created_at', 'public_metrics', 'context_annotations']
            )

            timeline = []
            if tweets.data:
                for tweet in tweets.data:
                    timeline.append({
                        'id': tweet.id,
                        'text': tweet.text,
                        'created_at': tweet.created_at.isoformat(),
                        'metrics': tweet.public_metrics,
                        'url': f"https://twitter.com/{self.social_account.username}/status/{tweet.id}"
                    })

            return timeline

        except Exception as e:
            logger.error(f"Failed to get timeline: {str(e)}")
            return []

    def get_post_metrics(self, post_id: str) -> Dict:
        """Get metrics for a specific post"""
        try:
            tweet = self.client.get_tweet(
                id=post_id,
                tweet_fields=['public_metrics']
            )

            if tweet.data:
                return tweet.data.public_metrics
            return {}

        except Exception as e:
            logger.error(f"Failed to get post metrics: {str(e)}")
            return {}

    def get_analytics(self, days: int = 7) -> Dict:
        """Get analytics for the account"""
        try:
            user = self.client.get_me(user_fields=['public_metrics'])

            if user.data:
                return {
                    'followers_count': user.data.public_metrics['followers_count'],
                    'following_count': user.data.public_metrics['following_count'],
                    'tweet_count': user.data.public_metrics['tweet_count'],
                    'listed_count': user.data.public_metrics['listed_count']
                }
            return {}

        except Exception as e:
            logger.error(f"Failed to get analytics: {str(e)}")
            return {}

    def _upload_media(self, media_url: str) -> Optional[str]:
        """Upload media to Twitter"""
        try:
            # Download media
            response = requests.get(media_url)
            if response.status_code == 200:
                # Upload to Twitter
                media = self.api.media_upload(filename='temp', file=response.content)
                return media.media_id_string
        except Exception as e:
            logger.error(f"Failed to upload media: {str(e)}")
        return None
