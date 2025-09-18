from typing import Dict, List, Optional, Any, Tuple
import logging
from datetime import datetime
from dataclasses import dataclass
import re
import json
from collections import Counter
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class BrandVoiceProfile:
    brand_name: str
    tone_characteristics: Dict[str, float]  # e.g., {'professional': 0.8, 'casual': 0.2}
    vocabulary_preferences: List[str]
    avoided_words: List[str]
    sentence_structure: Dict[str, float]  # e.g., {'simple': 0.6, 'complex': 0.4}
    punctuation_style: Dict[str, Any]
    emoji_usage: Dict[str, float]
    hashtag_style: Dict[str, Any]
    content_pillars: List[str]
    messaging_guidelines: List[str]

@dataclass
class ContentAnalysisResult:
    content: str
    brand_consistency_score: float
    tone_match_score: float
    vocabulary_compliance: float
    structure_alignment: float
    recommendations: List[str]
    flagged_issues: List[str]
    suggested_improvements: List[str]

class BrandVoiceAnalyzer:
    """Advanced brand voice consistency analysis and enforcement"""

    def __init__(self):
        self.tone_keywords = {
            'professional': [
                'expertise', 'analysis', 'strategy', 'insights', 'solution', 'approach',
                'methodology', 'framework', 'optimize', 'efficiency', 'implementation'
            ],
            'casual': [
                'hey', 'awesome', 'cool', 'love', 'excited', 'amazing', 'fun',
                'totally', 'super', 'pretty', 'really', 'definitely'
            ],
            'enthusiastic': [
                'incredible', 'amazing', 'fantastic', 'breakthrough', 'revolutionary',
                'game-changing', 'exciting', 'thrilled', 'passionate', 'inspired'
            ],
            'authoritative': [
                'proven', 'established', 'demonstrated', 'evidence', 'research',
                'study', 'data', 'statistics', 'expert', 'authority', 'conclusive'
            ],
            'friendly': [
                'welcome', 'community', 'together', 'share', 'connect', 'support',
                'help', 'collaborate', 'join', 'invite', 'appreciate'
            ],
            'innovative': [
                'cutting-edge', 'pioneering', 'breakthrough', 'disruptive', 'novel',
                'advanced', 'next-generation', 'revolutionary', 'forward-thinking'
            ]
        }

        self.sentence_patterns = {
            'simple': r'^[^.!?]*[.!?]$',
            'compound': r'^[^.!?]*[,;][^.!?]*[.!?]$',
            'complex': r'^[^.!?]*(that|which|who|when|where|because|although|since)[^.!?]*[.!?]$'
        }

    def create_brand_voice_profile(self, 
                                   brand_name: str, 
                                   sample_content: List[str],
                                   manual_guidelines: Optional[Dict[str, Any]] = None) -> BrandVoiceProfile:
        """Create a brand voice profile from sample content and guidelines"""

        try:
            # Analyze tone characteristics from sample content
            tone_characteristics = self._analyze_tone_characteristics(sample_content)

            # Extract vocabulary preferences
            vocabulary_preferences = self._extract_vocabulary_preferences(sample_content)

            # Identify avoided words (words that appear rarely or never)
            avoided_words = self._identify_avoided_words(sample_content)

            # Analyze sentence structure preferences
            sentence_structure = self._analyze_sentence_structure(sample_content)

            # Analyze punctuation style
            punctuation_style = self._analyze_punctuation_style(sample_content)

            # Analyze emoji usage patterns
            emoji_usage = self._analyze_emoji_usage(sample_content)

            # Analyze hashtag style
            hashtag_style = self._analyze_hashtag_style(sample_content)

            # Extract content pillars from manual guidelines or infer from content
            content_pillars = []
            if manual_guidelines and 'content_pillars' in manual_guidelines:
                content_pillars = manual_guidelines['content_pillars']
            else:
                content_pillars = self._infer_content_pillars(sample_content)

            # Extract messaging guidelines
            messaging_guidelines = []
            if manual_guidelines and 'messaging_guidelines' in manual_guidelines:
                messaging_guidelines = manual_guidelines['messaging_guidelines']
            else:
                messaging_guidelines = self._generate_default_guidelines(tone_characteristics)

            return BrandVoiceProfile(
                brand_name=brand_name,
                tone_characteristics=tone_characteristics,
                vocabulary_preferences=vocabulary_preferences,
                avoided_words=avoided_words,
                sentence_structure=sentence_structure,
                punctuation_style=punctuation_style,
                emoji_usage=emoji_usage,
                hashtag_style=hashtag_style,
                content_pillars=content_pillars,
                messaging_guidelines=messaging_guidelines
            )

        except Exception as e:
            logger.error(f"Error creating brand voice profile: {str(e)}")
            return self._create_fallback_profile(brand_name)

    def analyze_content_consistency(self, 
                                   content: str, 
                                   brand_profile: BrandVoiceProfile) -> ContentAnalysisResult:
        """Analyze how well content matches the brand voice profile"""

        try:
            # Calculate individual scores
            tone_score = self._calculate_tone_match_score(content, brand_profile)
            vocabulary_score = self._calculate_vocabulary_compliance(content, brand_profile)
            structure_score = self._calculate_structure_alignment(content, brand_profile)

            # Calculate overall brand consistency score
            brand_score = (tone_score * 0.4 + vocabulary_score * 0.3 + structure_score * 0.3)

            # Generate recommendations and identify issues
            recommendations = self._generate_recommendations(content, brand_profile, tone_score, vocabulary_score, structure_score)
            flagged_issues = self._identify_flagged_issues(content, brand_profile)
            improvements = self._suggest_improvements(content, brand_profile, recommendations)

            return ContentAnalysisResult(
                content=content,
                brand_consistency_score=brand_score,
                tone_match_score=tone_score,
                vocabulary_compliance=vocabulary_score,
                structure_alignment=structure_score,
                recommendations=recommendations,
                flagged_issues=flagged_issues,
                suggested_improvements=improvements
            )

        except Exception as e:
            logger.error(f"Error analyzing content consistency: {str(e)}")
            return self._create_fallback_analysis(content)

    def _analyze_tone_characteristics(self, sample_content: List[str]) -> Dict[str, float]:
        """Analyze tone characteristics from sample content"""

        tone_scores = {tone: 0.0 for tone in self.tone_keywords.keys()}

        total_words = 0
        for content in sample_content:
            words = content.lower().split()
            total_words += len(words)

            for tone, keywords in self.tone_keywords.items():
                matches = sum(1 for word in words if word in keywords)
                tone_scores[tone] += matches

        # Normalize scores
        if total_words > 0:
            for tone in tone_scores:
                tone_scores[tone] = min(1.0, tone_scores[tone] / total_words * 10)

        # Ensure we have at least some tone characteristics
        if sum(tone_scores.values()) == 0:
            tone_scores['professional'] = 0.7
            tone_scores['friendly'] = 0.3

        return tone_scores

    def _extract_vocabulary_preferences(self, sample_content: List[str]) -> List[str]:
        """Extract preferred vocabulary from sample content"""

        all_words = []
        for content in sample_content:
            # Clean and tokenize
            words = re.findall(r'\b\w{3,}\b', content.lower())
            all_words.extend(words)

        # Count word frequency
        word_counts = Counter(all_words)

        # Filter out common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'from', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'our', 'your',
            'their', 'his', 'her', 'its', 'my', 'me', 'you', 'they', 'we', 'us'
        }

        preferred_words = []
        for word, count in word_counts.most_common(30):
            if word not in stop_words and len(word) > 3:
                preferred_words.append(word)

        return preferred_words[:20]  # Top 20 preferred words

    def _identify_avoided_words(self, sample_content: List[str]) -> List[str]:
        """Identify words that should be avoided based on brand voice"""

        # Common words that brands might want to avoid
        potentially_avoided = [
            'cheap', 'discount', 'basic', 'simple', 'easy', 'quick', 'fast',
            'okay', 'fine', 'average', 'normal', 'standard', 'regular',
            'try', 'maybe', 'perhaps', 'possibly', 'might', 'could'
        ]

        all_text = ' '.join(sample_content).lower()
        avoided_words = []

        for word in potentially_avoided:
            if word not in all_text:
                avoided_words.append(word)

        return avoided_words[:10]  # Top 10 avoided words

    def _analyze_sentence_structure(self, sample_content: List[str]) -> Dict[str, float]:
        """Analyze preferred sentence structure patterns"""

        structure_counts = {structure: 0 for structure in self.sentence_patterns.keys()}
        total_sentences = 0

        for content in sample_content:
            sentences = re.split(r'[.!?]+', content)
            sentences = [s.strip() for s in sentences if s.strip()]

            total_sentences += len(sentences)

            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue

                # Check against patterns
                for structure, pattern in self.sentence_patterns.items():
                    if re.search(pattern, sentence + '.'):
                        structure_counts[structure] += 1
                        break
                else:
                    # Default to simple if no pattern matches
                    structure_counts['simple'] += 1

        # Normalize
        if total_sentences > 0:
            for structure in structure_counts:
                structure_counts[structure] /= total_sentences

        return structure_counts

    def _analyze_punctuation_style(self, sample_content: List[str]) -> Dict[str, Any]:
        """Analyze punctuation usage patterns"""

        all_text = ' '.join(sample_content)

        punctuation_counts = {
            'exclamation_frequency': all_text.count('!') / max(1, len(sample_content)),
            'question_frequency': all_text.count('?') / max(1, len(sample_content)),
            'ellipsis_usage': all_text.count('...') / max(1, len(sample_content)),
            'dash_usage': all_text.count('—') + all_text.count('--') / max(1, len(sample_content)),
            'parentheses_usage': all_text.count('(') / max(1, len(sample_content))
        }

        return punctuation_counts

    def _analyze_emoji_usage(self, sample_content: List[str]) -> Dict[str, float]:
        """Analyze emoji usage patterns"""

        all_text = ' '.join(sample_content)

        # Simple emoji detection (in production, would use more sophisticated methods)
        emoji_pattern = r'[😀-🙏🌀-🗿🚀-🛿]'
        emojis = re.findall(emoji_pattern, all_text)

        return {
            'emoji_frequency': len(emojis) / max(1, len(sample_content)),
            'emoji_per_sentence': len(emojis) / max(1, all_text.count('.') + all_text.count('!') + all_text.count('?')),
            'uses_emojis': len(emojis) > 0
        }

    def _analyze_hashtag_style(self, sample_content: List[str]) -> Dict[str, Any]:
        """Analyze hashtag usage patterns"""

        all_text = ' '.join(sample_content)
        hashtags = re.findall(r'#\w+', all_text)

        return {
            'hashtag_frequency': len(hashtags) / max(1, len(sample_content)),
            'average_hashtags_per_post': len(hashtags) / max(1, len(sample_content)),
            'hashtag_length_preference': sum(len(h) for h in hashtags) / max(1, len(hashtags)),
            'uses_hashtags': len(hashtags) > 0
        }

    def _infer_content_pillars(self, sample_content: List[str]) -> List[str]:
        """Infer content pillars from sample content"""

        # Default content pillars based on common business themes
        return [
            'Industry Insights',
            'Thought Leadership', 
            'Company Updates',
            'Educational Content',
            'Community Building'
        ]

    def _generate_default_guidelines(self, tone_characteristics: Dict[str, float]) -> List[str]:
        """Generate default messaging guidelines based on tone analysis"""

        guidelines = []

        # Find dominant tone
        dominant_tone = max(tone_characteristics.items(), key=lambda x: x[1])[0]

        tone_guidelines = {
            'professional': [
                "Use industry-specific terminology appropriately",
                "Maintain formal language structure",
                "Focus on data-driven insights",
                "Avoid overly casual expressions"
            ],
            'casual': [
                "Use conversational language",
                "Include personal pronouns (we, you, us)",
                "Keep sentences shorter and more direct",
                "Use contractions where appropriate"
            ],
            'enthusiastic': [
                "Express genuine excitement about topics",
                "Use energetic language and action words",
                "Include motivational messaging",
                "Show passion for the subject matter"
            ],
            'friendly': [
                "Use inclusive language",
                "Encourage community interaction",
                "Show appreciation for audience",
                "Maintain warm, welcoming tone"
            ]
        }

        guidelines = tone_guidelines.get(dominant_tone, tone_guidelines['professional'])

        # Add universal guidelines
        guidelines.extend([
            "Stay consistent with brand values",
            "Proofread for grammar and spelling",
            "Ensure content aligns with content pillars"
        ])

        return guidelines

    def _calculate_tone_match_score(self, content: str, brand_profile: BrandVoiceProfile) -> float:
        """Calculate how well content matches the brand's tone characteristics"""

        content_lower = content.lower()
        words = content_lower.split()

        tone_scores = {}

        for tone, target_score in brand_profile.tone_characteristics.items():
            if tone in self.tone_keywords:
                matches = sum(1 for word in words if word in self.tone_keywords[tone])
                content_tone_score = matches / max(1, len(words)) * 10
                content_tone_score = min(1.0, content_tone_score)

                # Calculate how close the content tone is to the target
                tone_scores[tone] = 1.0 - abs(content_tone_score - target_score)

        return sum(tone_scores.values()) / max(1, len(tone_scores))

    def _calculate_vocabulary_compliance(self, content: str, brand_profile: BrandVoiceProfile) -> float:
        """Calculate vocabulary compliance with brand preferences"""

        content_words = set(re.findall(r'\b\w{3,}\b', content.lower()))

        # Check preferred words usage
        preferred_used = len(content_words.intersection(set(brand_profile.vocabulary_preferences)))
        preferred_score = preferred_used / max(1, len(brand_profile.vocabulary_preferences)) * 0.5

        # Check avoided words (penalty for using them)
        avoided_used = len(content_words.intersection(set(brand_profile.avoided_words)))
        avoided_penalty = avoided_used / max(1, len(content_words)) * 2

        return max(0.0, min(1.0, 0.7 + preferred_score - avoided_penalty))

    def _calculate_structure_alignment(self, content: str, brand_profile: BrandVoiceProfile) -> float:
        """Calculate how well content structure aligns with brand preferences"""

        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]

        if not sentences:
            return 0.5

        structure_counts = {structure: 0 for structure in self.sentence_patterns.keys()}

        for sentence in sentences:
            for structure, pattern in self.sentence_patterns.items():
                if re.search(pattern, sentence + '.'):
                    structure_counts[structure] += 1
                    break
            else:
                structure_counts['simple'] += 1

        # Calculate alignment score
        alignment_score = 0.0
        for structure, count in structure_counts.items():
            content_ratio = count / len(sentences)
            target_ratio = brand_profile.sentence_structure.get(structure, 0.0)
            alignment_score += 1.0 - abs(content_ratio - target_ratio)

        return alignment_score / len(structure_counts)

    def _generate_recommendations(self, content: str, brand_profile: BrandVoiceProfile, 
                                 tone_score: float, vocabulary_score: float, structure_score: float) -> List[str]:
        """Generate specific recommendations for improving brand consistency"""

        recommendations = []

        if tone_score < 0.7:
            dominant_tone = max(brand_profile.tone_characteristics.items(), key=lambda x: x[1])[0]
            recommendations.append(f"Adjust tone to be more {dominant_tone}. Consider using words like: {', '.join(self.tone_keywords[dominant_tone][:3])}")

        if vocabulary_score < 0.7:
            unused_preferred = set(brand_profile.vocabulary_preferences) - set(content.lower().split())
            if unused_preferred:
                recommendations.append(f"Consider incorporating preferred vocabulary: {', '.join(list(unused_preferred)[:3])}")

            for avoided_word in brand_profile.avoided_words:
                if avoided_word in content.lower():
                    recommendations.append(f"Consider replacing '{avoided_word}' with a more brand-appropriate alternative")

        if structure_score < 0.7:
            preferred_structure = max(brand_profile.sentence_structure.items(), key=lambda x: x[1])[0]
            recommendations.append(f"Adjust sentence structure to favor {preferred_structure} sentences")

        return recommendations

    def _identify_flagged_issues(self, content: str, brand_profile: BrandVoiceProfile) -> List[str]:
        """Identify specific issues that need attention"""

        issues = []

        # Check for avoided words
        for word in brand_profile.avoided_words:
            if word in content.lower():
                issues.append(f"Contains avoided word: '{word}'")

        # Check for brand name consistency
        if brand_profile.brand_name.lower() not in content.lower():
            pass  # Not always necessary to mention brand name

        # Check for excessive punctuation
        if content.count('!') > 3:
            issues.append("Excessive use of exclamation points")

        if content.count('?') > 2:
            issues.append("Too many question marks - consider consolidating questions")

        return issues

    def _suggest_improvements(self, content: str, brand_profile: BrandVoiceProfile, recommendations: List[str]) -> List[str]:
        """Suggest specific content improvements"""

        improvements = []

        # Suggest specific word replacements
        content_words = content.lower().split()

        for avoided_word in brand_profile.avoided_words:
            if avoided_word in content_words:
                # Suggest alternatives based on tone
                dominant_tone = max(brand_profile.tone_characteristics.items(), key=lambda x: x[1])[0]
                if dominant_tone == 'professional':
                    improvements.append(f"Replace '{avoided_word}' with a more professional alternative")
                elif dominant_tone == 'enthusiastic':
                    improvements.append(f"Replace '{avoided_word}' with a more energetic alternative")

        # Suggest adding preferred vocabulary
        if len(recommendations) > 0:
            improvements.append("Review tone and vocabulary recommendations above")

        # Suggest structure improvements
        sentences = re.split(r'[.!?]+', content)
        if len(sentences) > 3:
            avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
            if avg_length > 20:
                improvements.append("Consider breaking up longer sentences for better readability")
            elif avg_length < 5:
                improvements.append("Consider combining short sentences for better flow")

        return improvements

    def _create_fallback_profile(self, brand_name: str) -> BrandVoiceProfile:
        """Create a basic fallback brand voice profile"""

        return BrandVoiceProfile(
            brand_name=brand_name,
            tone_characteristics={'professional': 0.7, 'friendly': 0.3},
            vocabulary_preferences=['insights', 'solutions', 'expertise', 'value', 'growth'],
            avoided_words=['cheap', 'basic', 'simple'],
            sentence_structure={'simple': 0.6, 'compound': 0.3, 'complex': 0.1},
            punctuation_style={'exclamation_frequency': 0.5, 'question_frequency': 0.2},
            emoji_usage={'emoji_frequency': 0.1, 'uses_emojis': True},
            hashtag_style={'hashtag_frequency': 2.0, 'uses_hashtags': True},
            content_pillars=['Industry Insights', 'Company Updates'],
            messaging_guidelines=['Maintain professional tone', 'Focus on value proposition']
        )

    def _create_fallback_analysis(self, content: str) -> ContentAnalysisResult:
        """Create a basic fallback analysis result"""

        return ContentAnalysisResult(
            content=content,
            brand_consistency_score=0.7,
            tone_match_score=0.7,
            vocabulary_compliance=0.7,
            structure_alignment=0.7,
            recommendations=['Review content for brand alignment'],
            flagged_issues=[],
            suggested_improvements=['Consider brand voice guidelines']
        )

# Initialize global brand voice analyzer
brand_voice_analyzer = BrandVoiceAnalyzer()
