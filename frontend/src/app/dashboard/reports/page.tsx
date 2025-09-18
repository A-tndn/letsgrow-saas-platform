'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Lightbulb,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Download,
  Mail,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share,
  Zap,
  Brain
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data for weekly reports
const weeklyReport = {
  week_ending: '2024-01-14',
  overall_grade: 'A-',
  growth_score: 87,
  key_metrics: {
    followers_gained: 145,
    followers_lost: 28,
    net_growth: 117,
    engagement_rate: 6.8,
    content_posted: 12,
    top_performing_post: {
      content: "Just discovered this AI tool that's changing how we approach social media automation...",
      likes: 342,
      comments: 89,
      shares: 67
    }
  },
  insights: [
    {
      type: 'success',
      title: 'Content Strategy Working',
      description: 'AI-generated tech content performed 40% better than average this week',
      impact: 'high',
      action_taken: 'Increased AI/tech content frequency to 60%'
    },
    {
      type: 'opportunity',
      title: 'Optimal Posting Time Discovered',
      description: 'Posts at 2:30 PM get 3x more engagement than morning posts',
      impact: 'medium',
      recommendation: 'Schedule more content for 2:00-4:00 PM window'
    },
    {
      type: 'warning',
      title: 'Hashtag Performance Declining',
      description: '#startup hashtag showing diminishing returns (-15% reach)',
      impact: 'medium',
      recommendation: 'Test new hashtags: #entrepreneurship, #innovation, #founders'
    }
  ],
  recommendations: [
    {
      category: 'Content',
      priority: 'high',
      title: 'Double Down on Tutorial Content',
      description: 'Tutorial-style posts generated 85% more saves than other content types',
      expected_impact: '+25% engagement',
      effort: 'low'
    },
    {
      category: 'Growth',
      priority: 'high', 
      title: 'Engage with Competitor Audiences',
      description: 'Target followers of @competitor_account for strategic growth',
      expected_impact: '+50 followers/week',
      effort: 'automated'
    },
    {
      category: 'Optimization',
      priority: 'medium',
      title: 'A/B Test CTA Phrases',
      description: 'Test "Thoughts?" vs "What do you think?" vs "Agree?"',
      expected_impact: '+15% comments',
      effort: 'automated'
    }
  ],
  competitor_analysis: [
    {
      account: '@tech_leader_ai',
      followers: '45.2K',
      growth_rate: '+2.3%',
      avg_engagement: '4.2%',
      content_strategy: 'Daily AI insights + personal stories',
      opportunity: 'Less video content - could capture video audience'
    },
    {
      account: '@startup_guru',
      followers: '32.8K', 
      growth_rate: '+1.8%',
      avg_engagement: '5.1%',
      content_strategy: 'Business tips + case studies',
      opportunity: 'No automation content - niche gap to fill'
    }
  ],
  next_week_plan: {
    content_themes: ['AI automation tools', 'Productivity hacks', 'Startup journey'],
    posting_schedule: ['Daily at 2:30 PM', '3x weekly tutorials', 'Friday case study'],
    growth_targets: {
      followers: '+120',
      engagement_rate: '7.2%',
      content_saves: '+35%'
    }
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function WeeklyReportsPage() {
  const [selectedWeek, setSelectedWeek] = useState('current')

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default: return <Brain className="h-5 w-5 text-blue-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'opportunity': return 'border-yellow-200 bg-yellow-50'
      case 'warning': return 'border-orange-200 bg-orange-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  // Mock engagement distribution data
  const engagementData = [
    { name: 'Likes', value: 65, color: '#3B82F6' },
    { name: 'Comments', value: 20, color: '#10B981' },
    { name: 'Shares', value: 10, color: '#F59E0B' },
    { name: 'Saves', value: 5, color: '#EF4444' }
  ]

  const dailyGrowthData = [
    { day: 'Mon', followers: 15, engagement: 85 },
    { day: 'Tue', followers: 22, engagement: 94 },
    { day: 'Wed', followers: 18, engagement: 112 },
    { day: 'Thu', followers: 28, engagement: 89 },
    { day: 'Fri', followers: 31, engagement: 156 },
    { day: 'Sat', followers: 12, engagement: 67 },
    { day: 'Sun', followers: 19, engagement: 98 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Growth Report</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights and recommendations for your social media growth
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="current">This Week</option>
            <option value="last">Last Week</option>
            <option value="2weeks">2 Weeks Ago</option>
          </select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>

          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </div>
      </div>

      {/* Report Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {weeklyReport.overall_grade}
              </div>
              <p className="text-sm text-gray-600">Overall Grade</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {weeklyReport.growth_score}
              </div>
              <p className="text-sm text-gray-600">Growth Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                +{weeklyReport.key_metrics.net_growth}
              </div>
              <p className="text-sm text-gray-600">Net Followers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {weeklyReport.key_metrics.engagement_rate}%
              </div>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-700">
              Week ending {formatDate(weeklyReport.week_ending, 'MMM d, yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Key discoveries and patterns from this week's data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyReport.insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <Badge 
                        variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'warning' : 'secondary'}
                        size="sm"
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{insight.description}</p>
                    {insight.action_taken && (
                      <p className="text-sm text-green-700 font-medium">
                        ✅ Action taken: {insight.action_taken}
                      </p>
                    )}
                    {insight.recommendation && (
                      <p className="text-sm text-blue-700 font-medium">
                        💡 Recommendation: {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <CardDescription>Followers gained and engagement by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#3B82F6" name="New Followers" />
                  <Bar dataKey="engagement" fill="#10B981" name="Total Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>Breakdown of engagement types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {engagementData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Top Performing Content
          </CardTitle>
          <CardDescription>Your best content from this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 mb-3">{weeklyReport.key_metrics.top_performing_post.content}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                {formatNumber(weeklyReport.key_metrics.top_performing_post.likes)} likes
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                {formatNumber(weeklyReport.key_metrics.top_performing_post.comments)} comments
              </div>
              <div className="flex items-center">
                <Share className="h-4 w-4 mr-1 text-green-500" />
                {formatNumber(weeklyReport.key_metrics.top_performing_post.shares)} shares
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Actionable suggestions to accelerate your growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyReport.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={getPriorityColor(rec.priority)} size="sm">
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {rec.category}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-gray-700 mb-2">{rec.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600 font-medium">
                        Expected: {rec.expected_impact}
                      </span>
                      <span className="text-blue-600">
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>
            How you stack up against similar accounts in your niche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyReport.competitor_analysis.map((comp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{comp.account}</p>
                    <p className="text-sm text-gray-600">{comp.followers} followers</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className="font-medium text-green-600">{comp.growth_rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engagement</p>
                    <p className="font-medium">{comp.avg_engagement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Strategy</p>
                    <p className="text-sm">{comp.content_strategy}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Opportunity:</span> {comp.opportunity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Week's Plan */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Next Week's Growth Plan
          </CardTitle>
          <CardDescription>
            AI-optimized strategy based on this week's learnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Content Themes</h4>
              <div className="space-y-2">
                {weeklyReport.next_week_plan.content_themes.map((theme, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">{theme}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Posting Schedule</h4>
              <div className="space-y-2">
                {weeklyReport.next_week_plan.posting_schedule.map((schedule, index) => (
                  <div key={index} className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">{schedule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Growth Targets</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Followers</span>
                  <span className="text-sm font-medium">{weeklyReport.next_week_plan.growth_targets.followers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-sm font-medium">{weeklyReport.next_week_plan.growth_targets.engagement_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Saves</span>
                  <span className="text-sm font-medium">{weeklyReport.next_week_plan.growth_targets.content_saves}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}