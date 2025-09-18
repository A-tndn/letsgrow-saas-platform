import openai
from typing import Dict, List, Optional
from flask import current_app
from app.models.user import User
import logging
import re

logger = logging.getLogger(__name__)

class ContentGeneratorService:
    def __init__(self, user: User):
        self.user = user
        self.client = openai.OpenAI(
            api_key=current_app.config['OPENAI_API_KEY']
        )

    def generate_content(self, 
                        topic: str, 
                        platform: str, 
                        tone: str = "professional",
                        content_type: str = "post",
                        hashtags: List[str] = None,
                        target_audience: str = None,
                        include_call_to_action: bool = True) -> Dict:
        """Generate social media content using AI"""
        try:
            # Check user's API limits
            if not self.user.can_make_api_call():
                return {
                    'success': False,
                    'error': 'API limit exceeded'
                }

            # Build prompt based on parameters
            prompt = self._build_content_prompt(
                topic=topic,
                platform=platform,
                tone=tone,
                content_type=content_type,
                hashtags=hashtags,
                target_audience=target_audience,
                include_call_to_action=include_call_to_action
            )

            # Generate content using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Cost-effective model
                messages=[
                    {"role": "system", "content": "You are a professional social media content creator specializing in organic growth strategies."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

            content = response.choices[0].message.content.strip()

            # Update user's API usage
            self.user.increment_api_usage()

            # Extract hashtags from generated content
            generated_hashtags = self._extract_hashtags(content)

            # Validate content length for platform
            is_valid, validation_message = self._validate_content_length(content, platform)

            return {
                'success': True,
                'content': content,
                'hashtags': generated_hashtags,
                'word_count': len(content.split()),
                'character_count': len(content),
                'is_valid_length': is_valid,
                'validation_message': validation_message,
                'platform_optimized': True
            }

        except Exception as e:
            logger.error(f"Content generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def _build_content_prompt(self, **kwargs) -> str:
        """Build AI prompt based on parameters"""
        platform_specs = {
            'twitter': {'limit': 280, 'style': 'concise and engaging with trending hashtags'},
            'instagram': {'limit': 2200, 'style': 'visual storytelling with relevant hashtags'},
            'linkedin': {'limit': 1300, 'style': 'professional and thought-provoking'},
            'reddit': {'limit': 10000, 'style': 'conversational and community-focused'}
        }

        spec = platform_specs.get(kwargs['platform'], {'limit': 1000, 'style': 'engaging'})

        prompt = f"""Create a {kwargs['tone']} {kwargs['content_type']} for {kwargs['platform']} about: {kwargs['topic']}

Platform Requirements:
- Maximum {spec['limit']} characters
- Style: {spec['style']}
- Tone: {kwargs['tone']}
- Platform: {kwargs['platform']}"""

        if kwargs.get('target_audience'):
            prompt += f"\n- Target audience: {kwargs['target_audience']}"

        if kwargs.get('hashtags'):
            prompt += f"\n- Include relevant hashtags from: {', '.join(kwargs['hashtags'])}"

        if kwargs.get('include_call_to_action'):
            prompt += "\n- Include a subtle call-to-action to drive engagement"

        prompt += f"""

Content Guidelines:
- Create engaging content that drives organic growth
- Use platform-specific best practices
- Include relevant emojis where appropriate
- Ensure content is authentic and valuable
- Focus on building genuine connections and community
- Avoid overly promotional language"""

        return prompt

    def _extract_hashtags(self, content: str) -> List[str]:
        """Extract hashtags from generated content"""
        hashtags = re.findall(r'#\w+', content)
        return [tag.lower() for tag in hashtags]

    def _validate_content_length(self, content: str, platform: str) -> tuple:
        """Validate content length for specific platform"""
        limits = {
            'twitter': 280,
            'instagram': 2200,
            'linkedin': 1300,
            'reddit': 10000
        }

        limit = limits.get(platform, 1000)
        content_length = len(content)

        if content_length <= limit:
            return True, f"Content length ({content_length}) is within {platform} limit ({limit})"
        else:
            return False, f"Content too long ({content_length} chars) for {platform} (limit: {limit})"

    def generate_hashtags(self, topic: str, platform: str, count: int = 10) -> List[str]:
        """Generate relevant hashtags for a topic"""
        try:
            # Check API limits
            if not self.user.can_make_api_call():
                return []

            prompt = f"""Generate {count} relevant and effective hashtags for {platform} about: {topic}

Requirements:
- Mix of popular and niche hashtags for optimal reach
- Platform-appropriate hashtags for {platform}
- Focus on hashtags that drive organic engagement
- Include trending hashtags when relevant
- Avoid banned or shadowbanned hashtags
- Format as #hashtag

Return only the hashtags, one per line, no explanations."""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a social media hashtag expert focused on organic growth."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.5
            )

            # Update API usage
            self.user.increment_api_usage()

            hashtags = response.choices[0].message.content.strip().split('\n')
            return [tag.strip() for tag in hashtags if tag.strip().startswith('#')]

        except Exception as e:
            logger.error(f"Hashtag generation failed: {str(e)}")
            return []

    def generate_content_variations(self, base_content: str, platform: str, count: int = 3) -> List[Dict]:
        """Generate multiple variations of content"""
        try:
            if not self.user.can_make_api_call():
                return []

            prompt = f"""Create {count} variations of this social media content for {platform}:

Original: {base_content}

Requirements:
- Keep the core message and value proposition
- Vary the tone, structure, and approach
- Maintain platform-specific best practices
- Each variation should be unique but equally engaging
- Format each variation clearly separated

Provide variations that offer different angles on the same topic."""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a creative social media content strategist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.8
            )

            self.user.increment_api_usage()

            # Parse variations (simplified parsing)
            variations_text = response.choices[0].message.content.strip()
            variations = []

            # Split by numbers or clear separators
            parts = re.split(r'\n\s*\d+[.)]\s*|\n\s*Variation\s*\d+:?\s*', variations_text)

            for i, part in enumerate(parts[1:count+1]):  # Skip first empty part
                if part.strip():
                    variations.append({
                        'content': part.strip(),
                        'variation_number': i + 1,
                        'character_count': len(part.strip()),
                        'hashtags': self._extract_hashtags(part)
                    })

            return variations

        except Exception as e:
            logger.error(f"Content variation generation failed: {str(e)}")
            return []
