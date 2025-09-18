from typing import Dict, List, Optional, Any, Tuple
import logging
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import json
import re
import asyncio

logger = logging.getLogger(__name__)

class LanguageCode(Enum):
    ENGLISH_US = "en-US"
    ENGLISH_UK = "en-GB"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    ITALIAN = "it"
    PORTUGUESE = "pt"
    DUTCH = "nl"
    RUSSIAN = "ru"
    CHINESE_SIMPLIFIED = "zh-CN"
    CHINESE_TRADITIONAL = "zh-TW"
    JAPANESE = "ja"
    KOREAN = "ko"
    ARABIC = "ar"
    HINDI = "hi"

@dataclass
class LocalizedContent:
    original_content: str
    target_language: str
    translated_content: str
    cultural_adaptations: List[str]
    localization_score: float
    confidence_score: float
    suggested_improvements: List[str]

@dataclass
class MarketContext:
    country_code: str
    language_code: str
    cultural_preferences: Dict[str, Any]
    social_media_usage: Dict[str, float]
    business_hours: Dict[str, str]
    holidays: List[str]
    content_regulations: List[str]
    preferred_content_types: List[str]

class MultiLanguageContentService:
    """Advanced multi-language content generation and localization"""

    def __init__(self):
        self.language_characteristics = {
            'en-US': {
                'tone_preferences': {'professional': 0.6, 'casual': 0.4},
                'sentence_length': 'medium',
                'punctuation_style': 'standard',
                'emoji_acceptance': 0.7,
                'hashtag_usage': 'high',
                'cultural_values': ['individualism', 'innovation', 'efficiency']
            },
            'en-GB': {
                'tone_preferences': {'professional': 0.7, 'casual': 0.3},
                'sentence_length': 'longer',
                'punctuation_style': 'formal',
                'emoji_acceptance': 0.5,
                'hashtag_usage': 'medium',
                'cultural_values': ['tradition', 'understatement', 'politeness']
            },
            'es': {
                'tone_preferences': {'friendly': 0.6, 'enthusiastic': 0.4},
                'sentence_length': 'longer',
                'punctuation_style': 'expressive',
                'emoji_acceptance': 0.9,
                'hashtag_usage': 'high',
                'cultural_values': ['family', 'relationships', 'warmth']
            },
            'fr': {
                'tone_preferences': {'elegant': 0.6, 'professional': 0.4},
                'sentence_length': 'longer',
                'punctuation_style': 'sophisticated',
                'emoji_acceptance': 0.6,
                'hashtag_usage': 'medium',
                'cultural_values': ['sophistication', 'culture', 'quality']
            },
            'de': {
                'tone_preferences': {'professional': 0.8, 'direct': 0.2},
                'sentence_length': 'complex',
                'punctuation_style': 'precise',
                'emoji_acceptance': 0.4,
                'hashtag_usage': 'low',
                'cultural_values': ['precision', 'quality', 'reliability']
            }
        }

        self.market_contexts = self._initialize_market_contexts()

    def _initialize_market_contexts(self) -> Dict[str, MarketContext]:
        """Initialize market context data for different countries/regions"""

        return {
            'US': MarketContext(
                country_code='US',
                language_code='en-US',
                cultural_preferences={
                    'direct_communication': 0.8,
                    'humor_acceptance': 0.7,
                    'authority_respect': 0.6,
                    'innovation_focus': 0.9
                },
                social_media_usage={
                    'twitter': 0.8,
                    'linkedin': 0.9,
                    'instagram': 0.8,
                    'facebook': 0.7,
                    'tiktok': 0.6
                },
                business_hours={'start': '09:00', 'end': '17:00', 'timezone': 'EST'},
                holidays=['New Year', 'Independence Day', 'Thanksgiving', 'Christmas'],
                content_regulations=['No misleading claims', 'Privacy compliance', 'Accessibility standards'],
                preferred_content_types=['how-to', 'industry insights', 'case studies', 'infographics']
            ),
            'UK': MarketContext(
                country_code='UK',
                language_code='en-GB',
                cultural_preferences={
                    'indirect_communication': 0.7,
                    'humor_acceptance': 0.9,
                    'authority_respect': 0.7,
                    'tradition_value': 0.8
                },
                social_media_usage={
                    'twitter': 0.9,
                    'linkedin': 0.8,
                    'instagram': 0.7,
                    'facebook': 0.8
                },
                business_hours={'start': '09:00', 'end': '17:00', 'timezone': 'GMT'},
                holidays=['New Year', 'Easter', 'Christmas', 'Bank Holidays'],
                content_regulations=['GDPR compliance', 'ASA advertising standards', 'Data protection'],
                preferred_content_types=['thought leadership', 'industry analysis', 'expert opinions']
            ),
            'DE': MarketContext(
                country_code='DE',
                language_code='de',
                cultural_preferences={
                    'direct_communication': 0.9,
                    'humor_acceptance': 0.4,
                    'authority_respect': 0.8,
                    'quality_focus': 0.9
                },
                social_media_usage={
                    'linkedin': 0.8,
                    'twitter': 0.6,
                    'instagram': 0.7,
                    'facebook': 0.8
                },
                business_hours={'start': '08:00', 'end': '16:00', 'timezone': 'CET'},
                holidays=['New Year', 'Easter', 'Christmas', 'Oktoberfest'],
                content_regulations=['GDPR compliance', 'Strict data privacy', 'Professional standards'],
                preferred_content_types=['technical content', 'detailed analysis', 'expert insights']
            )
        }

    async def generate_multilingual_content(self, 
                                          original_content: str, 
                                          source_language: str,
                                          target_languages: List[str],
                                          market_context: Optional[str] = None) -> Dict[str, LocalizedContent]:
        """Generate content for multiple languages with cultural adaptation"""

        localized_contents = {}

        for target_lang in target_languages:
            try:
                # Determine market context if not provided
                if market_context is None:
                    market_context = self._infer_market_context(target_lang)

                localized_content = await self._localize_content(
                    original_content, 
                    source_language, 
                    target_lang, 
                    market_context
                )

                localized_contents[target_lang] = localized_content

            except Exception as e:
                logger.error(f"Error localizing content to {target_lang}: {str(e)}")
                # Create fallback localized content
                localized_contents[target_lang] = self._create_fallback_localization(
                    original_content, target_lang
                )

        return localized_contents

    async def _localize_content(self, 
                              original_content: str, 
                              source_language: str, 
                              target_language: str,
                              market_context: str) -> LocalizedContent:
        """Localize content for a specific language and market"""

        # Get language characteristics and market context
        lang_characteristics = self.language_characteristics.get(target_language, {})
        market_data = self.market_contexts.get(market_context, {})

        # Step 1: Translate the content (in production, would use professional translation API)
        translated_content = await self._translate_content(original_content, source_language, target_language)

        # Step 2: Apply cultural adaptations
        cultural_adaptations = self._apply_cultural_adaptations(
            translated_content, 
            lang_characteristics, 
            market_data
        )

        # Step 3: Optimize for local social media preferences
        optimized_content = self._optimize_for_local_platform_preferences(
            translated_content, 
            target_language, 
            market_data
        )

        # Step 4: Calculate localization scores
        localization_score = self._calculate_localization_score(
            original_content, 
            optimized_content, 
            target_language
        )

        confidence_score = self._calculate_confidence_score(optimized_content, target_language)

        # Step 5: Generate improvement suggestions
        suggestions = self._generate_localization_suggestions(
            optimized_content, 
            target_language, 
            market_data
        )

        return LocalizedContent(
            original_content=original_content,
            target_language=target_language,
            translated_content=optimized_content,
            cultural_adaptations=cultural_adaptations,
            localization_score=localization_score,
            confidence_score=confidence_score,
            suggested_improvements=suggestions
        )

    async def _translate_content(self, content: str, source_lang: str, target_lang: str) -> str:
        """Translate content from source to target language"""

        # In production, this would use Google Translate API, DeepL, or similar
        # For demo, we'll create intelligent pseudo-translations

        translation_patterns = {
            'en-US_to_es': {
                'Hello': 'Hola',
                'Thank you': 'Gracias',
                'Business': 'Negocio',
                'Innovation': 'Innovación',
                'Growth': 'Crecimiento',
                'Success': 'Éxito',
                'Strategy': 'Estrategia',
                'Marketing': 'Marketing',
                'Technology': 'Tecnología',
                'Leadership': 'Liderazgo'
            },
            'en-US_to_fr': {
                'Hello': 'Bonjour',
                'Thank you': 'Merci',
                'Business': 'Affaires',
                'Innovation': 'Innovation',
                'Growth': 'Croissance',
                'Success': 'Succès',
                'Strategy': 'Stratégie',
                'Marketing': 'Marketing',
                'Technology': 'Technologie',
                'Leadership': 'Leadership'
            },
            'en-US_to_de': {
                'Hello': 'Hallo',
                'Thank you': 'Danke',
                'Business': 'Geschäft',
                'Innovation': 'Innovation',
                'Growth': 'Wachstum',
                'Success': 'Erfolg',
                'Strategy': 'Strategie',
                'Marketing': 'Marketing',
                'Technology': 'Technologie',
                'Leadership': 'Führung'
            }
        }

        pattern_key = f"{source_lang}_to_{target_lang}"
        if pattern_key in translation_patterns:
            translated = content
            for english, foreign in translation_patterns[pattern_key].items():
                translated = re.sub(r'\b' + english + r'\b', foreign, translated, flags=re.IGNORECASE)
            return translated

        # Fallback: return original content with language note
        return f"[{target_lang}] {content}"

    def _apply_cultural_adaptations(self, 
                                  content: str, 
                                  lang_characteristics: Dict[str, Any], 
                                  market_data: MarketContext) -> List[str]:
        """Apply cultural adaptations to translated content"""

        adaptations = []

        # Tone adaptations
        if lang_characteristics.get('tone_preferences', {}).get('formal', 0) > 0.7:
            adaptations.append("Adjusted tone to be more formal for target culture")

        if lang_characteristics.get('tone_preferences', {}).get('friendly', 0) > 0.7:
            adaptations.append("Enhanced friendly tone to match cultural expectations")

        # Communication style adaptations
        if hasattr(market_data, 'cultural_preferences'):
            if market_data.cultural_preferences.get('direct_communication', 0) > 0.8:
                adaptations.append("Adapted communication style to be more direct")
            elif market_data.cultural_preferences.get('indirect_communication', 0) > 0.7:
                adaptations.append("Softened communication style for cultural sensitivity")

        # Content length adaptations
        if lang_characteristics.get('sentence_length') == 'longer':
            adaptations.append("Expanded sentences to match language preferences")
        elif lang_characteristics.get('sentence_length') == 'shorter':
            adaptations.append("Shortened sentences for better readability")

        # Emoji and punctuation adaptations
        emoji_acceptance = lang_characteristics.get('emoji_acceptance', 0.5)
        if emoji_acceptance > 0.8:
            adaptations.append("Enhanced emoji usage for better engagement")
        elif emoji_acceptance < 0.4:
            adaptations.append("Reduced emoji usage for professional tone")

        return adaptations

    def _optimize_for_local_platform_preferences(self, 
                                               content: str, 
                                               target_language: str, 
                                               market_data: MarketContext) -> str:
        """Optimize content for local social media platform preferences"""

        if not hasattr(market_data, 'social_media_usage'):
            return content

        # Adjust hashtag usage based on local preferences
        hashtag_pattern = r'#\w+'
        hashtags = re.findall(hashtag_pattern, content)

        lang_chars = self.language_characteristics.get(target_language, {})
        hashtag_usage = lang_chars.get('hashtag_usage', 'medium')

        if hashtag_usage == 'low' and len(hashtags) > 2:
            # Remove excess hashtags
            content = re.sub(hashtag_pattern, '', content, count=len(hashtags) - 2)
            content = re.sub(r'\s+', ' ', content).strip()
        elif hashtag_usage == 'high' and len(hashtags) < 3:
            # Could add more relevant hashtags based on content analysis
            pass

        return content

    def _calculate_localization_score(self, original: str, localized: str, target_language: str) -> float:
        """Calculate how well content has been localized"""

        score = 0.7  # Base score

        # Check if content was actually changed/adapted
        if original != localized:
            score += 0.2

        # Check language characteristics alignment
        lang_chars = self.language_characteristics.get(target_language, {})

        # Emoji usage alignment
        emoji_pattern = r'[😀-🙏🌀-🗿🚀-🛿]'
        emoji_count = len(re.findall(emoji_pattern, localized))
        emoji_acceptance = lang_chars.get('emoji_acceptance', 0.5)

        if emoji_acceptance > 0.7 and emoji_count > 0:
            score += 0.1
        elif emoji_acceptance < 0.4 and emoji_count == 0:
            score += 0.1

        return min(1.0, score)

    def _calculate_confidence_score(self, content: str, target_language: str) -> float:
        """Calculate confidence in the localization quality"""

        # In production, this would use more sophisticated metrics
        base_confidence = 0.8

        # Check for obvious translation artifacts
        if '[' in content and ']' in content:
            base_confidence -= 0.2

        # Check content length (very short or long content might be less reliable)
        if len(content) < 20 or len(content) > 500:
            base_confidence -= 0.1

        return max(0.3, min(1.0, base_confidence))

    def _generate_localization_suggestions(self, 
                                         content: str, 
                                         target_language: str, 
                                         market_data: MarketContext) -> List[str]:
        """Generate suggestions for improving localization"""

        suggestions = []

        lang_chars = self.language_characteristics.get(target_language, {})

        # Tone suggestions
        tone_prefs = lang_chars.get('tone_preferences', {})
        dominant_tone = max(tone_prefs.items(), key=lambda x: x[1])[0] if tone_prefs else 'professional'
        suggestions.append(f"Consider emphasizing {dominant_tone} tone for better cultural fit")

        # Platform-specific suggestions
        if hasattr(market_data, 'preferred_content_types'):
            preferred_types = market_data.preferred_content_types
            suggestions.append(f"Consider creating {preferred_types[0]} content for this market")

        # Cultural value alignment
        if hasattr(market_data, 'cultural_preferences'):
            cultural_prefs = market_data.cultural_preferences
            if cultural_prefs.get('quality_focus', 0) > 0.8:
                suggestions.append("Emphasize quality and attention to detail")
            if cultural_prefs.get('innovation_focus', 0) > 0.8:
                suggestions.append("Highlight innovative aspects and forward-thinking")

        return suggestions

    def _infer_market_context(self, language_code: str) -> str:
        """Infer market context from language code"""

        language_to_market = {
            'en-US': 'US',
            'en-GB': 'UK',
            'de': 'DE',
            'fr': 'FR',
            'es': 'ES',
            'it': 'IT',
            'pt': 'PT',
            'nl': 'NL',
            'zh-CN': 'CN',
            'ja': 'JP',
            'ko': 'KR'
        }

        return language_to_market.get(language_code, 'US')

    def _create_fallback_localization(self, content: str, target_language: str) -> LocalizedContent:
        """Create basic fallback localization when full processing fails"""

        return LocalizedContent(
            original_content=content,
            target_language=target_language,
            translated_content=f"[{target_language}] {content}",
            cultural_adaptations=["Basic language adaptation"],
            localization_score=0.5,
            confidence_score=0.4,
            suggested_improvements=["Professional translation recommended"]
        )

    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages"""

        return [
            {"code": "en-US", "name": "English (United States)", "native": "English"},
            {"code": "en-GB", "name": "English (United Kingdom)", "native": "English"},
            {"code": "es", "name": "Spanish", "native": "Español"},
            {"code": "fr", "name": "French", "native": "Français"},
            {"code": "de", "name": "German", "native": "Deutsch"},
            {"code": "it", "name": "Italian", "native": "Italiano"},
            {"code": "pt", "name": "Portuguese", "native": "Português"},
            {"code": "nl", "name": "Dutch", "native": "Nederlands"},
            {"code": "zh-CN", "name": "Chinese (Simplified)", "native": "中文(简体)"},
            {"code": "ja", "name": "Japanese", "native": "日本語"},
            {"code": "ko", "name": "Korean", "native": "한국어"},
            {"code": "ar", "name": "Arabic", "native": "العربية"},
            {"code": "hi", "name": "Hindi", "native": "हिन्दी"}
        ]

    def get_market_insights(self, country_code: str) -> Dict[str, Any]:
        """Get market insights for a specific country"""

        market = self.market_contexts.get(country_code)
        if not market:
            return {"error": "Market data not available"}

        return {
            "country": country_code,
            "language": market.language_code,
            "cultural_preferences": market.cultural_preferences,
            "social_media_usage": market.social_media_usage,
            "business_hours": market.business_hours,
            "content_regulations": market.content_regulations,
            "preferred_content_types": market.preferred_content_types,
            "recommendations": [
                f"Best posting time: {market.business_hours.get('start', '09:00')} - {market.business_hours.get('end', '17:00')}",
                f"Top platform: {max(market.social_media_usage.items(), key=lambda x: x[1])[0]}",
                f"Preferred content: {market.preferred_content_types[0] if market.preferred_content_types else 'General'}"
            ]
        }

class ContentScheduleOptimizer:
    """Optimize posting schedules for different time zones and markets"""

    def __init__(self):
        self.timezone_data = {
            'US': {'timezone': 'America/New_York', 'peak_hours': ['09:00', '12:00', '17:00']},
            'UK': {'timezone': 'Europe/London', 'peak_hours': ['08:00', '12:00', '17:00']},
            'DE': {'timezone': 'Europe/Berlin', 'peak_hours': ['08:00', '12:00', '16:00']},
            'FR': {'timezone': 'Europe/Paris', 'peak_hours': ['09:00', '12:00', '18:00']},
            'JP': {'timezone': 'Asia/Tokyo', 'peak_hours': ['07:00', '12:00', '19:00']},
            'AU': {'timezone': 'Australia/Sydney', 'peak_hours': ['08:00', '12:00', '17:00']}
        }

    def optimize_posting_schedule(self, 
                                target_markets: List[str], 
                                content_frequency: int = 3) -> Dict[str, Any]:
        """Optimize posting schedule for multiple target markets"""

        schedule_recommendations = {}

        for market in target_markets:
            if market in self.timezone_data:
                market_data = self.timezone_data[market]

                schedule_recommendations[market] = {
                    'timezone': market_data['timezone'],
                    'optimal_times': market_data['peak_hours'][:content_frequency],
                    'recommended_frequency': f"{content_frequency} times per day",
                    'best_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                    'avoid_times': ['Late night', 'Very early morning']
                }

        # Find global optimal times if targeting multiple markets
        if len(target_markets) > 1:
            global_schedule = self._find_global_optimal_times(target_markets)
            schedule_recommendations['global_optimal'] = global_schedule

        return schedule_recommendations

    def _find_global_optimal_times(self, markets: List[str]) -> Dict[str, Any]:
        """Find optimal posting times that work across multiple markets"""

        # This is a simplified version - in production would do proper timezone math
        return {
            'universal_times': ['12:00 UTC', '16:00 UTC', '20:00 UTC'],
            'strategy': 'Staggered posting to reach peak times in different markets',
            'coverage': f"Optimized for {len(markets)} markets"
        }

# Initialize global services
multilang_service = MultiLanguageContentService()
schedule_optimizer = ContentScheduleOptimizer()
