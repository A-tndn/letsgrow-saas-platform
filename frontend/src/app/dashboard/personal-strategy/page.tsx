'use client'

import { useState, useEffect } from 'react'
import { usePersonalAnalysis, useSocialAccounts, useGenerateContentIdeas } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  User,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Brain,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Hash,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Play,
  Sparkles
} from 'lucide-react'
import { formatNumber, formatDate, getPlatformColor, getPlatformIcon } from '@/lib/utils'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts'

// Mock data for personal analysis
const personalAnalysisData = {
  account: {
    username: '@your_handle',
    platform: 'twitter',
    followers: 2847,
    following: 892,
    posts_count: 156,
    analysis_period: '90 days'
  },
  performance_overview: {
    avg_engagement_rate: 4.2,
    total_likes: 1456,
    total_comments: 287,
    total_shares: 89,
    reach: 45600,
    impressions: 78200,
    growth_rate: 8.5
  },
  content_analysis: {
    top_themes: [
      { theme: 'Tech Tutorials', posts: 24, avg_engagement: 5.8, performance: 'excellent' },
      { theme: 'Industry Insights', posts: 19, avg_engagement: 4.1, performance: 'good' },
      { theme: 'Personal Updates', posts: 15, avg_engagement: 2.9, performance: 'average' },
      { theme: 'Behind the Scenes', posts: 12, avg_engagement: 6.2, performance: 'excellent' }
    ],
    content_formats: [
      { format: 'Text Posts', count: 45, engagement: 3.2 },
      { format: 'Images', count: 38, engagement: 4.8 },
      { format: 'Carousels', count: 12, engagement: 6.1 },
      { format: 'Videos', count: 8, engagement: 7.3 }
    ],
    optimal_times: [
      { time: '9:00 AM', engagement: 5.2, posts: 12 },
      { time: '1:00 PM', engagement: 4.8, posts: 15 },
      { time: '6:00 PM', engagement: 6.1, posts: 18 },
      { time: '8:00 PM', engagement: 4.5, posts: 9 }
    ]
  },
  voice_analysis: {
    tone: 'Professional & Approachable',
    personality_traits: ['Helpful', 'Knowledgeable', 'Engaging', 'Authentic'],
    unique_phrases: ['Let me break this down', 'Here is the thing', 'Pro tip:', 'What do you think?'],
    engagement_style: 'Question-driven with clear explanations'
  },
  hashtag_analysis: [
    { hashtag: '#TechTips', usage: 15, avg_engagement: 4.8, performance: 'excellent' },
    { hashtag: '#Programming', usage: 12, avg_engagement: 3.9, performance: 'good' },
    { hashtag: '#Startup', usage: 8, avg_engagement: 2.1, performance: 'poor' },
    { hashtag: '#Developer', usage: 18, avg_engagement: 4.2, performance: 'good' }
  ],
  improvement_opportunities: [
    {
      type: 'content',
      title: 'Increase Video Content',
      description: 'Your videos get 70% higher engagement than other formats but only represent 5% of your content',
      impact: 'high',
      effort: 'medium',
      potential_gain: '+35% engagement'
    },
    {
      type: 'timing',
      title: 'Post More at 6 PM',
      description: 'Your 6 PM posts perform best but you only post 12% of content at this time',
      impact: 'medium',
      effort: 'low',
      potential_gain: '+15% reach'
    },
    {
      type: 'engagement',
      title: 'Add More CTAs',
      description: 'Posts with clear calls-to-action get 40% more comments',
      impact: 'medium',
      effort: 'low',
      potential_gain: '+25% comments'
    },
    {
      type: 'hashtags',
      title: 'Replace Low-Performing Hashtags',
      description: '#Startup hashtag shows poor performance, consider alternatives',
      impact: 'low',
      effort: 'low',
      potential_gain: '+10% reach'
    }
  ],
  personalized_suggestions: [
    {
      category: 'Content Strategy',
      title: 'Create More Tutorial Series',
      description: 'Your tech tutorial posts have the highest engagement. Consider creating multi-part series.',
      action_items: [
        'Plan a 5-part JavaScript fundamentals series',
        'Create step-by-step visual guides',
        'End each post with "Part X of Y - What should I cover next?"'
      ],
      expected_impact: '+45% engagement',
      timeline: '2 weeks'
    },
    {
      category: 'Content Format',
      title: 'Weekly Video Tips',
      description: 'Your 8 videos averaged 7.3% engagement vs 4.2% overall. Aim for 1-2 videos weekly.',
      action_items: [
        'Create 60-second coding tips videos',
        'Show your screen while explaining concepts',
        'Use trending audio for better reach'
      ],
      expected_impact: '+30% overall engagement',
      timeline: '1 month'
    },
    {
      category: 'Community Building', 
      title: 'Engage More with Comments',
      description: 'Quick responses to comments boost algorithmic reach and build relationships.',
      action_items: [
        'Set up mobile notifications for comments',
        'Respond within 2 hours during peak times',
        'Ask follow-up questions to continue conversations'
      ],
      expected_impact: '+20% repeat engagement',
      timeline: 'Ongoing'
    }
  ]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function PersonalContentDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [contentIdeas, setContentIdeas] = useState<any[]>([])

  const { data: socialAccountsData } = useSocialAccounts()
  const socialAccounts = socialAccountsData?.accounts || []

  const runAnalysis = async () => {
    if (!selectedAccount) return

    setAnalysisLoading(true)
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 3000))
    setAnalysisLoading(false)
  }

  const generateContentIdeas = async () => {
    // Mock content ideas generation
    const ideas = [
      {
        id: 1,
        title: 'JavaScript Array Methods Explained',
        description: 'Visual guide to map, filter, reduce with real examples',
        format: 'Carousel',
        estimated_engagement: 'High',
        best_time: '6:00 PM',
        hashtags: ['#JavaScript', '#WebDev', '#Programming']
      },
      {
        id: 2,
        title: 'My Coding Setup Tour',
        description: 'Behind-the-scenes video of your development environment',
        format: 'Video',
        estimated_engagement: 'Very High',
        best_time: '8:00 PM', 
        hashtags: ['#CodingSetup', '#Developer', '#TechTips']
      },
      {
        id: 3,
        title: 'Common React Mistakes',
        description: 'Thread about mistakes you see junior developers make',
        format: 'Thread',
        estimated_engagement: 'High',
        best_time: '1:00 PM',
        hashtags: ['#React', '#WebDev', '#JavaScript']
      }
    ]
    setContentIdeas(ideas)
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'average': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  if (analysisLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Content</h3>
          <p className="text-gray-600">
            Our AI is analyzing your recent posts, engagement patterns, and audience behavior...
          </p>
          <div className="mt-6 max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal Content Strategy</h1>
            <p className="text-gray-600">AI-powered analysis of your existing content and personalized recommendations</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Account</option>
            {socialAccounts.map(account => (
              <option key={account.id} value={account.id}>
                @{account.username} ({account.platform})
              </option>
            ))}
          </select>

          <Button onClick={runAnalysis} disabled={!selectedAccount}>
            <Brain className="h-4 w-4 mr-2" />
            Analyze Account
          </Button>
        </div>
      </div>

      {socialAccounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Social Accounts Connected</h3>
            <p className="text-gray-600 mb-6">
              Connect your social media accounts to get personalized content analysis and recommendations.
            </p>
            <Button>
              Connect Social Account
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedAccount && (
        <>
          {/* Account Overview */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getPlatformColor(personalAnalysisData.account.platform)}`}>
                    {getPlatformIcon(personalAnalysisData.account.platform)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{personalAnalysisData.account.username}</h3>
                    <p className="text-gray-600">Analysis from last {personalAnalysisData.account.analysis_period}</p>
                  </div>
                </div>
                <Badge variant="success" className="px-3 py-1">
                  Account Analyzed
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(personalAnalysisData.account.followers)}</div>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{personalAnalysisData.account.posts_count}</div>
                  <p className="text-sm text-gray-600">Posts Analyzed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{personalAnalysisData.performance_overview.avg_engagement_rate}%</div>
                  <p className="text-sm text-gray-600">Avg. Engagement</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(personalAnalysisData.performance_overview.reach)}</div>
                  <p className="text-sm text-gray-600">Total Reach</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">+{personalAnalysisData.performance_overview.growth_rate}%</div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Themes */}
            <Card>
              <CardHeader>
                <CardTitle>Your Best Content Themes</CardTitle>
                <CardDescription>Topics that resonate most with your audience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalAnalysisData.content_analysis.top_themes.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-medium">{theme.theme}</h4>
                          <Badge size="sm" className={getPerformanceColor(theme.performance)}>
                            {theme.performance}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {theme.posts} posts • {theme.avg_engagement}% avg. engagement
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">{theme.avg_engagement}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Format Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Format Analysis</CardTitle>
                <CardDescription>How different post types perform for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personalAnalysisData.content_analysis.content_formats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="format" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="#3B82F6" name="Engagement %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Analysis & Optimal Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Your Unique Voice</CardTitle>
                <CardDescription>AI analysis of your content personality and style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Overall Tone</h4>
                  <Badge variant="secondary" size="sm" className="mb-3">{personalAnalysisData.voice_analysis.tone}</Badge>
                  <p className="text-sm text-gray-600">{personalAnalysisData.voice_analysis.engagement_style}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Personality Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {personalAnalysisData.voice_analysis.personality_traits.map((trait, index) => (
                      <Badge key={index} variant="outline" size="sm">{trait}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Your Signature Phrases</h4>
                  <div className="space-y-1">
                    {personalAnalysisData.voice_analysis.unique_phrases.map((phrase, index) => (
                      <p key={index} className="text-sm text-gray-700 italic">"{phrase}"</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimal Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle>Your Best Posting Times</CardTitle>
                <CardDescription>When your audience is most engaged</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalAnalysisData.content_analysis.optimal_times.map((timeSlot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{timeSlot.time}</p>
                          <p className="text-sm text-gray-600">{timeSlot.posts} posts analyzed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{timeSlot.engagement}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(timeSlot.engagement / 7) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Improvement Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-500" />
                Improvement Opportunities
              </CardTitle>
              <CardDescription>
                Specific areas where you can boost your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalAnalysisData.improvement_opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={getImpactColor(opportunity.impact)} size="sm">
                            {opportunity.impact} impact
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {opportunity.effort} effort
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h4>
                        <p className="text-sm text-gray-600">{opportunity.description}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <span className="font-medium text-green-800">Potential: {opportunity.potential_gain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Your Personalized Action Plan
              </CardTitle>
              <CardDescription>
                Step-by-step suggestions tailored to your content and audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {personalAnalysisData.personalized_suggestions.map((suggestion, index) => (
                  <div key={index} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" size="sm">{suggestion.category}</Badge>
                          <Badge variant="outline" size="sm">{suggestion.timeline}</Badge>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{suggestion.title}</h4>
                        <p className="text-gray-600 mt-1">{suggestion.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">{suggestion.expected_impact}</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Action Items:</h5>
                      <ul className="space-y-1">
                        {suggestion.action_items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start text-sm text-blue-800">
                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Ideas Generator */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                    Personalized Content Ideas
                  </CardTitle>
                  <CardDescription>
                    AI-generated content ideas based on your successful patterns
                  </CardDescription>
                </div>
                <Button onClick={generateContentIdeas}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Ideas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contentIdeas.length > 0 ? (
                <div className="space-y-4">
                  {contentIdeas.map((idea, index) => (
                    <div key={idea.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{idea.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="secondary" size="sm">{idea.format}</Badge>
                          <Badge variant={idea.estimated_engagement === 'Very High' ? 'success' : 'default'} size="sm">
                            {idea.estimated_engagement}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-600">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Best time: {idea.best_time}
                          </span>
                          <span className="flex items-center">
                            <Hash className="h-3 w-3 mr-1" />
                            {idea.hashtags.join(', ')}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Click "Generate Ideas" to get personalized content suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hashtag Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="h-5 w-5 mr-2 text-blue-500" />
                Hashtag Performance Analysis
              </CardTitle>
              <CardDescription>
                How your hashtags are performing and what to optimize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalAnalysisData.hashtag_analysis.map((hashtag, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <code className="text-sm bg-white px-2 py-1 rounded">{hashtag.hashtag}</code>
                      <div>
                        <Badge size="sm" className={getPerformanceColor(hashtag.performance)}>
                          {hashtag.performance}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">Used {hashtag.usage} times</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{hashtag.avg_engagement}%</div>
                      <div className="text-xs text-gray-500">avg. engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}