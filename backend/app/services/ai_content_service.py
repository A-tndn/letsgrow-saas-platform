from typing import Dict, List, Optional, Any
import openai
from datetime import datetime
import logging
import os
import json
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ContentRequest:
    topic: str
    platform: str
    tone: str = "professional"
    length: str = "medium"
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None
    include_hashtags: bool = True
    include_emoji: bool = False
    include_call_to_action: bool = True

@dataclass
class GeneratedContent:
    text: str
    hashtags: List[str]
    character_count: int
    platform_limit: int
    engagement_score: float
    viral_potential: float
    sentiment: str
    readability_score: float
    keywords_used: List[str]

class AIContentService:
    """Advanced AI Content Generation Service with OpenAI GPT integration"""

    def __init__(self):
        self.client = None
        self.api_key = os.environ.get('OPENAI_API_KEY')

        if self.api_key:
            openai.api_key = self.api_key
            self.client = openai
            logger.info("OpenAI client initialized successfully")
        else:
            logger.warning("OpenAI API key not found - using demo mode")

    async def generate_content(self, request: ContentRequest) -> GeneratedContent:
        """Generate AI-powered social media content"""
        try:
            if self.client and self.api_key:
                return await self._generate_with_openai(request)
            else:
                return self._generate_demo_content(request)
        except Exception as e:
            logger.error(f"Content generation failed: {str(e)}")
            return self._generate_fallback_content(request)

    async def _generate_with_openai(self, request: ContentRequest) -> GeneratedContent:
        """Generate content using OpenAI GPT"""

        # Build context-aware prompt
        prompt = self._build_prompt(request)

        try:
            response = await self.client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": self._get_system_prompt(request.platform, request.tone)
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7 if request.tone == "casual" else 0.5,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

            generated_text = response.choices[0].message.content.strip()

            # Extract hashtags and clean text
            text, hashtags = self._extract_hashtags(generated_text)

            # Generate additional analysis
            engagement_score = self._calculate_engagement_score(text, request)
            viral_potential = self._calculate_viral_potential(text, request)
            sentiment = self._analyze_sentiment(text)
            readability_score = self._calculate_readability(text)
            keywords_used = self._extract_keywords(text, request.keywords or [])

            return GeneratedContent(
                text=text,
                hashtags=hashtags,
                character_count=len(text),
                platform_limit=self._get_platform_limit(request.platform),
                engagement_score=engagement_score,
                viral_potential=viral_potential,
                sentiment=sentiment,
                readability_score=readability_score,
                keywords_used=keywords_used
            )

        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._generate_demo_content(request)

    def _build_prompt(self, request: ContentRequest) -> str:
        """Build a comprehensive prompt for content generation"""

        platform_context = {
            'twitter': 'Twitter/X (concise, engaging, news-worthy)',
            'instagram': 'Instagram (visual storytelling, lifestyle focused)',
            'linkedin': 'LinkedIn (professional, industry insights)',
            'reddit': 'Reddit (conversational, community-focused)',
            'facebook': 'Facebook (personal, shareable)',
            'tiktok': 'TikTok (trendy, youth-oriented, fun)'
        }

        length_context = {
            'short': 'Keep it brief and punchy',
            'medium': 'Provide moderate detail',
            'long': 'Include comprehensive information'
        }

        tone_context = {
            'professional': 'Use professional language and industry terminology',
            'casual': 'Use conversational, friendly language',
            'enthusiastic': 'Use energetic, motivating language with excitement'
        }

        prompt = f"""Create engaging social media content for {platform_context.get(request.platform, request.platform)}.

Topic: {request.topic}
Tone: {tone_context.get(request.tone, request.tone)}
Length: {length_context.get(request.length, request.length)}
"""

        if request.target_audience:
            prompt += f"Target Audience: {request.target_audience}\n"

        if request.keywords:
            prompt += f"Keywords to include: {', '.join(request.keywords)}\n"

        prompt += f"""
Requirements:
- Character limit: {self._get_platform_limit(request.platform)} characters
- {'' if not request.include_hashtags else 'Include relevant hashtags'}
- {'' if not request.include_emoji else 'Include appropriate emojis'}
- {'' if not request.include_call_to_action else 'Include a call-to-action'}
- Make it engaging and shareable
- Optimize for platform best practices

Generate content that maximizes engagement and reach."""

        return prompt

    def _get_system_prompt(self, platform: str, tone: str) -> str:
        """Get system prompt for the AI model"""
        return f"""You are an expert social media content creator specializing in {platform} content. 
        You understand platform algorithms, user behavior, and engagement optimization.

        Create content that:
        - Maximizes engagement (likes, comments, shares)
        - Follows platform best practices
        - Uses appropriate {tone} tone
        - Includes strategic hashtag placement
        - Incorporates trending topics when relevant
        - Drives meaningful user interaction

        Always prioritize quality, authenticity, and value for the audience."""

    def _extract_hashtags(self, text: str) -> tuple[str, List[str]]:
        """Extract hashtags from generated text"""
        hashtag_pattern = r'#\w+'
        hashtags = re.findall(hashtag_pattern, text)
        clean_text = re.sub(hashtag_pattern, '', text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)  # Clean up extra spaces

        return clean_text, hashtags

    def _calculate_engagement_score(self, text: str, request: ContentRequest) -> float:
        """Calculate predicted engagement score (0-100)"""
        score = 50.0  # Base score

        # Length optimization
        optimal_length = {
            'twitter': 100, 'instagram': 150, 'linkedin': 200,
            'reddit': 300, 'facebook': 150, 'tiktok': 100
        }

        platform_optimal = optimal_length.get(request.platform, 150)
        length_diff = abs(len(text) - platform_optimal)
        length_penalty = min(length_diff / platform_optimal * 20, 20)
        score -= length_penalty

        # Question marks increase engagement
        if '?' in text:
            score += 10

        # Call-to-action phrases
        cta_phrases = ['comment', 'share', 'like', 'follow', 'click', 'swipe', 'tag']
        if any(phrase in text.lower() for phrase in cta_phrases):
            score += 15

        # Emotional words
        emotional_words = ['amazing', 'incredible', 'shocking', 'surprising', 'love', 'hate', 'wow']
        emotion_count = sum(1 for word in emotional_words if word in text.lower())
        score += min(emotion_count * 5, 15)

        return max(0, min(100, score))

    def _calculate_viral_potential(self, text: str, request: ContentRequest) -> float:
        """Calculate viral potential score (0-100)"""
        score = 30.0  # Base score

        # Trending topics boost (simplified)
        trending_keywords = ['AI', 'automation', 'productivity', 'growth', 'success', 'tips']
        if any(keyword.lower() in text.lower() for keyword in trending_keywords):
            score += 20

        # Controversy/Opinion indicators
        opinion_indicators = ['unpopular opinion', 'controversial', 'hot take', 'disagree', 'debate']
        if any(indicator in text.lower() for indicator in opinion_indicators):
            score += 25

        # Numbers and statistics
        if re.search(r'\d+%|\d+x|\d+ ways|\d+ tips|\d+ reasons', text):
            score += 15

        return max(0, min(100, score))

    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis"""
        positive_words = ['great', 'amazing', 'excellent', 'fantastic', 'love', 'best', 'awesome']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing']

        positive_count = sum(1 for word in positive_words if word in text.lower())
        negative_count = sum(1 for word in negative_words if word in text.lower())

        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

    def _calculate_readability(self, text: str) -> float:
        """Simple readability score (0-100, higher is better)"""
        sentences = len(re.split(r'[.!?]+', text))
        words = len(text.split())

        if sentences == 0:
            return 50.0

        avg_words_per_sentence = words / sentences

        # Optimal: 10-15 words per sentence
        if 10 <= avg_words_per_sentence <= 15:
            return 85.0
        elif 8 <= avg_words_per_sentence <= 18:
            return 75.0
        elif 6 <= avg_words_per_sentence <= 22:
            return 65.0
        else:
            return 45.0

    def _extract_keywords(self, text: str, target_keywords: List[str]) -> List[str]:
        """Extract used keywords from text"""
        text_lower = text.lower()
        return [keyword for keyword in target_keywords if keyword.lower() in text_lower]

    def _get_platform_limit(self, platform: str) -> int:
        """Get character limit for platform"""
        limits = {
            'twitter': 280,
            'instagram': 2200,
            'linkedin': 3000,
            'reddit': 40000,
            'facebook': 63206,
            'tiktok': 150
        }
        return limits.get(platform, 280)

    def _generate_demo_content(self, request: ContentRequest) -> GeneratedContent:
        """Generate demo content when OpenAI is not available"""

        templates = {
            'professional': [
                "Exploring {topic}: Key insights and strategies for sustainable growth in today's market.",
                "The future of {topic} is evolving rapidly. Here's what industry leaders need to know.",
                "Deep dive into {topic} - actionable takeaways for strategic decision-making."
            ],
            'casual': [
                "Just discovered something amazing about {topic}! Here's what I learned 🤯",
                "Let's talk about {topic} - it's changing everything we thought we knew!",
                "Anyone else fascinated by {topic}? Here are my thoughts..."
            ],
            'enthusiastic': [
                "🔥 {topic} is absolutely GAME-CHANGING! Here's why you need to pay attention!",
                "MASSIVE breakthrough in {topic}! This is going to transform everything! 💪",
                "Incredible insights about {topic} that will blow your mind! Don't miss this! ✨"
            ]
        }

        hashtag_pools = {
            'twitter': ['#innovation', '#tech', '#growth', '#business', '#trends'],
            'instagram': ['#lifestyle', '#inspiration', '#motivation', '#growth', '#success'],
            'linkedin': ['#leadership', '#business', '#professional', '#industry', '#growth'],
            'reddit': ['#discussion', '#insights', '#community', '#learning'],
            'facebook': ['#sharing', '#community', '#discussion', '#insights'],
            'tiktok': ['#trending', '#viral', '#fyp', '#tips', '#growth']
        }

        import random

        template = random.choice(templates.get(request.tone, templates['professional']))
        text = template.format(topic=request.topic)

        # Adjust for length
        if request.length == 'long':
            text += " What are your thoughts? Share your experiences in the comments below!"
        elif request.length == 'short':
            text = text.split('.')[0] + '.'

        # Add hashtags
        hashtags = random.sample(hashtag_pools.get(request.platform, hashtag_pools['twitter']), 3)

        return GeneratedContent(
            text=text,
            hashtags=hashtags,
            character_count=len(text),
            platform_limit=self._get_platform_limit(request.platform),
            engagement_score=75.0,
            viral_potential=60.0,
            sentiment='positive',
            readability_score=80.0,
            keywords_used=[]
        )

    def _generate_fallback_content(self, request: ContentRequest) -> GeneratedContent:
        """Generate basic fallback content on error"""
        text = f"Sharing insights about {request.topic}. What are your thoughts?"
        return GeneratedContent(
            text=text,
            hashtags=['#insights', '#discussion'],
            character_count=len(text),
            platform_limit=self._get_platform_limit(request.platform),
            engagement_score=50.0,
            viral_potential=30.0,
            sentiment='neutral',
            readability_score=75.0,
            keywords_used=[]
        )

# Content optimization and analysis utilities
class ContentAnalyzer:
    """Analyze content performance and optimize for engagement"""

    @staticmethod
    def analyze_performance(posts_data: List[Dict]) -> Dict[str, Any]:
        """Analyze post performance data to identify trends"""
        if not posts_data:
            return {}

        # Calculate averages
        total_posts = len(posts_data)
        avg_engagement = sum(p.get('engagement_rate', 0) for p in posts_data) / total_posts

        # Find best performing content characteristics
        top_posts = sorted(posts_data, key=lambda p: p.get('engagement_rate', 0), reverse=True)[:5]

        # Analyze hashtags
        all_hashtags = []
        for post in posts_data:
            all_hashtags.extend(post.get('hashtags', []))

        hashtag_performance = {}
        for hashtag in set(all_hashtags):
            hashtag_posts = [p for p in posts_data if hashtag in p.get('hashtags', [])]
            if hashtag_posts:
                hashtag_performance[hashtag] = sum(p.get('engagement_rate', 0) for p in hashtag_posts) / len(hashtag_posts)

        best_hashtags = sorted(hashtag_performance.items(), key=lambda x: x[1], reverse=True)[:10]

        return {
            'total_posts': total_posts,
            'avg_engagement_rate': avg_engagement,
            'top_performing_posts': top_posts,
            'best_hashtags': best_hashtags,
            'recommendations': ContentAnalyzer._generate_recommendations(posts_data, avg_engagement)
        }

    @staticmethod
    def _generate_recommendations(posts_data: List[Dict], avg_engagement: float) -> List[str]:
        """Generate actionable recommendations based on performance data"""
        recommendations = []

        # Analyze posting patterns
        high_performers = [p for p in posts_data if p.get('engagement_rate', 0) > avg_engagement]

        if high_performers:
            # Time analysis (simplified)
            recommendations.append("Continue posting during your current optimal times")

            # Content length analysis
            avg_length_high = sum(len(p.get('text_content', '')) for p in high_performers) / len(high_performers)
            avg_length_all = sum(len(p.get('text_content', '')) for p in posts_data) / len(posts_data)

            if avg_length_high < avg_length_all:
                recommendations.append("Shorter posts tend to perform better for your audience")
            else:
                recommendations.append("Longer, detailed posts resonate well with your audience")

        return recommendations

# Initialize global service instance
ai_content_service = AIContentService()
content_analyzer = ContentAnalyzer()
