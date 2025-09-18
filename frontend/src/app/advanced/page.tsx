import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  Brain, 
  Users,
  Globe,
  TrendingUp,
  Target,
  MessageCircle,
  BarChart3,
  Settings,
  Lightbulb,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Award,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AudienceAnalysis {
  demographics: any;
  interests: string[];
  engagement_patterns: any;
  optimal_posting_times: string[];
  preferred_content_types: string[];
  hashtag_preferences: string[];
}

interface TrendingTopic {
  topic: string;
  engagement_score: number;
  trend_velocity: string;
  relevance_score: number;
  competition_level: string;
  content_opportunity: string;
  estimated_reach_boost: string;
}

interface BrandVoiceAnalysis {
  brand_consistency_score: number;
  tone_match_score: number;
  vocabulary_compliance: number;
  structure_alignment: number;
  recommendations: string[];
  flagged_issues: string[];
  suggested_improvements: string[];
}

export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState('audience');
  const [audienceAnalysis, setAudienceAnalysis] = useState<AudienceAnalysis | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [brandAnalysis, setBrandAnalysis] = useState<BrandVoiceAnalysis | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisContent, setAnalysisContent] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const response = await api.get('/advanced/multilang/languages');
      if (response.data.success) {
        setSupportedLanguages(response.data.supported_languages);
      }
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
    }
  };

  const analyzeAudience = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/advanced/audience/analyze', {
        platform: 'twitter'
      });

      if (response.data.success) {
        setAudienceAnalysis(response.data.audience_analysis);
        toast.success('Audience analysis completed! 📊');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to analyze audience');
    } finally {
      setIsLoading(false);
    }
  };

  const detectTrends = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/advanced/trends/detect?platform=twitter&industry=business');

      if (response.data.success) {
        setTrendingTopics(response.data.trending_topics);
        toast.success('Trending topics detected! 🔥');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to detect trends');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBrandVoice = async () => {
    if (!analysisContent.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/advanced/brand-voice/analyze', {
        content: analysisContent
      });

      if (response.data.success) {
        setBrandAnalysis(response.data.brand_voice_analysis);
        toast.success('Brand voice analysis completed! 🎯');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to analyze brand voice');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Needs Improvement';
  };

  const getTrendVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'rising': return 'text-green-600 bg-green-100';
      case 'peaking': return 'text-blue-600 bg-blue-100';
      case 'stable': return 'text-gray-600 bg-gray-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'audience', label: 'Audience Intelligence', icon: Users, color: 'indigo' },
    { id: 'trends', label: 'Trend Analysis', icon: TrendingUp, color: 'green' },
    { id: 'brand-voice', label: 'Brand Voice', icon: MessageCircle, color: 'purple' },
    { id: 'multilang', label: 'Global Reach', icon: Globe, color: 'blue' },
    { id: 'team', label: 'Team Collaboration', icon: Shield, color: 'orange' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  LetsGrow
                </Link>
                <span className="ml-4 text-gray-500">Advanced Features</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/automation"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Automation
                </Link>
                <span className="text-gray-600">Welcome, {user?.first_name}!</span>
                <button
                  onClick={logout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
              Advanced AI Features
            </h1>
            <p className="text-gray-600">
              Unlock powerful AI-driven insights to supercharge your social media strategy.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? `border-${tab.color}-500 text-${tab.color}-600`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Audience Intelligence Tab */}
          {activeTab === 'audience' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Target className="h-5 w-5 text-indigo-600 mr-2" />
                      Audience Intelligence Analysis
                    </h2>
                    <button
                      onClick={analyzeAudience}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Analyze Audience
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {audienceAnalysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Demographics */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-3">Demographics</h3>
                        <div className="space-y-2">
                          {audienceAnalysis.demographics.age_groups && 
                            Object.entries(audienceAnalysis.demographics.age_groups).map(([age, percentage]: [string, any]) => (
                              <div key={age} className="flex justify-between text-sm">
                                <span className="text-blue-700">{age}:</span>
                                <span className="font-medium text-blue-900">{(percentage * 100).toFixed(0)}%</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-3">Top Interests</h3>
                        <div className="space-y-1">
                          {audienceAnalysis.interests.slice(0, 6).map((interest, index) => (
                            <span key={index} className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Optimal Times */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-900 mb-3">Best Posting Times</h3>
                        <div className="space-y-2">
                          {audienceAnalysis.optimal_posting_times.map((time, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-purple-600 mr-2" />
                              <span className="text-purple-800">{time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Content Preferences */}
                      <div className="bg-orange-50 rounded-lg p-4 md:col-span-2">
                        <h3 className="font-semibold text-orange-900 mb-3">Preferred Content Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {audienceAnalysis.preferred_content_types.map((type, index) => (
                            <span key={index} className="bg-orange-200 text-orange-800 text-sm px-3 py-1 rounded-full">
                              {type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Hashtag Performance */}
                      <div className="bg-pink-50 rounded-lg p-4">
                        <h3 className="font-semibold text-pink-900 mb-3">Top Hashtags</h3>
                        <div className="space-y-1">
                          {audienceAnalysis.hashtag_preferences.slice(0, 6).map((hashtag, index) => (
                            <span key={index} className="inline-block bg-pink-200 text-pink-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Analysis Yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Run an audience analysis to see detailed insights about your followers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trend Analysis Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Rocket className="h-5 w-5 text-green-600 mr-2" />
                      Trending Topics & Opportunities
                    </h2>
                    <button
                      onClick={detectTrends}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      Detect Trends
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {trendingTopics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trendingTopics.slice(0, 6).map((trend, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{trend.topic}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTrendVelocityColor(trend.trend_velocity)}`}>
                              {trend.trend_velocity}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Engagement Score:</span>
                              <span className="font-medium text-green-600">{trend.engagement_score}/100</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Relevance:</span>
                              <span className="font-medium text-blue-600">{trend.relevance_score}/100</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Competition:</span>
                              <span className={`font-medium ${
                                trend.competition_level === 'low' ? 'text-green-600' : 
                                trend.competition_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {trend.competition_level}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700">
                              <Lightbulb className="h-4 w-4 inline mr-1" />
                              {trend.content_opportunity}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Potential reach boost:</span>
                            <span className="text-sm font-semibold text-indigo-600">{trend.estimated_reach_boost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Trends Detected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Analyze trending topics to discover content opportunities.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Brand Voice Tab */}
          {activeTab === 'brand-voice' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="h-5 w-5 text-purple-600 mr-2" />
                    Brand Voice Analysis
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {/* Content Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content to Analyze
                      </label>
                      <textarea
                        value={analysisContent}
                        onChange={(e) => setAnalysisContent(e.target.value)}
                        rows={4}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Paste your content here to analyze brand voice consistency..."
                      />
                      <button
                        onClick={analyzeBrandVoice}
                        disabled={isLoading || !analysisContent.trim()}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <MessageCircle className="h-4 w-4 mr-2" />
                        )}
                        Analyze Brand Voice
                      </button>
                    </div>

                    {/* Analysis Results */}
                    {brandAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Scores */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">Consistency Scores</h3>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Overall Consistency:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(brandAnalysis.brand_consistency_score)}`}>
                                {getScoreLabel(brandAnalysis.brand_consistency_score)} ({(brandAnalysis.brand_consistency_score * 100).toFixed(0)}%)
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Tone Match:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(brandAnalysis.tone_match_score)}`}>
                                {(brandAnalysis.tone_match_score * 100).toFixed(0)}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Vocabulary:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(brandAnalysis.vocabulary_compliance)}`}>
                                {(brandAnalysis.vocabulary_compliance * 100).toFixed(0)}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Structure:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(brandAnalysis.structure_alignment)}`}>
                                {(brandAnalysis.structure_alignment * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">Recommendations</h3>

                          {brandAnalysis.recommendations.length > 0 ? (
                            <div className="space-y-2">
                              {brandAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-blue-800">{rec}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No specific recommendations at this time.</p>
                          )}

                          {brandAnalysis.flagged_issues.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Flagged Issues</h4>
                              <div className="space-y-2">
                                {brandAnalysis.flagged_issues.map((issue, index) => (
                                  <div key={index} className="flex items-start p-2 bg-red-50 rounded">
                                    <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-red-800">{issue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Language Tab */}
          {activeTab === 'multilang' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="h-5 w-5 text-blue-600 mr-2" />
                    Global Content Localization
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 text-center">
                      <Globe className="mx-auto h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold text-blue-900 mb-2">Supported Languages</h3>
                      <p className="text-2xl font-bold text-blue-600">{supportedLanguages.length}</p>
                      <p className="text-sm text-blue-700">Languages available</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 text-center">
                      <Target className="mx-auto h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-semibold text-green-900 mb-2">Market Insights</h3>
                      <p className="text-2xl font-bold text-green-600">15+</p>
                      <p className="text-sm text-green-700">Countries supported</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-6 text-center">
                      <Zap className="mx-auto h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="font-semibold text-purple-900 mb-2">AI Translation</h3>
                      <p className="text-2xl font-bold text-purple-600">95%</p>
                      <p className="text-sm text-purple-700">Accuracy rate</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Available Languages</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {supportedLanguages.slice(0, 12).map((lang: any, index) => (
                        <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <span className="font-medium text-gray-900 mr-2">{lang.native}</span>
                          <span className="text-sm text-gray-500">({lang.code})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Collaboration Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 text-orange-600 mr-2" />
                    Team Collaboration & Workflow Management
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <Users className="h-8 w-8 text-orange-600 mb-3" />
                      <h3 className="font-semibold text-orange-900 mb-2">Role-Based Access</h3>
                      <p className="text-sm text-orange-700">
                        Manage team permissions with granular role-based access control.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <Settings className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold text-blue-900 mb-2">Approval Workflows</h3>
                      <p className="text-sm text-blue-700">
                        Custom approval workflows with automated routing and escalation.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <Award className="h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-semibold text-green-900 mb-2">Performance Tracking</h3>
                      <p className="text-sm text-green-700">
                        Monitor team productivity and content approval metrics.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Available Roles</h3>
                    <div className="space-y-3">
                      {[
                        { role: 'Admin', description: 'Full access to all features and settings', color: 'red' },
                        { role: 'Manager', description: 'Manage team, approve content, view analytics', color: 'blue' },
                        { role: 'Editor', description: 'Create and edit content, request reviews', color: 'green' },
                        { role: 'Reviewer', description: 'Review and approve content submissions', color: 'yellow' },
                        { role: 'Viewer', description: 'View content and basic analytics only', color: 'gray' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500 mr-3`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.role}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
