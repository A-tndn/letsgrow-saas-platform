'use client'

import { useState } from 'react'
import { useAnalyticsOverview, usePlatformAnalytics, useSocialAccounts } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { formatNumber, getPlatformColor, getPlatformIcon } from '@/lib/utils'

const TIME_RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
]

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState(30)
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const { data: overviewData, isLoading: overviewLoading } = useAnalyticsOverview(selectedRange)
  const { data: platformData, isLoading: platformLoading } = usePlatformAnalytics(
    selectedPlatform === 'all' ? '' : selectedPlatform, 
    selectedRange
  )
  const { data: socialAccountsData } = useSocialAccounts()

  const socialAccounts = socialAccountsData?.accounts || []
  const analytics = overviewData?.overview || {}
  const dailyData = overviewData?.daily_data || []

  // Available platforms
  const platforms = [...new Set(socialAccounts.map(acc => acc.platform))]

  // Mock engagement data for charts (in real app, this would come from API)
  const mockEngagementData = [
    { date: '2024-01-01', posts: 5, likes: 150, comments: 25, shares: 15, views: 1200 },
    { date: '2024-01-02', posts: 3, likes: 120, comments: 18, shares: 12, views: 980 },
    { date: '2024-01-03', posts: 4, likes: 200, comments: 35, shares: 22, views: 1500 },
    { date: '2024-01-04', posts: 6, likes: 180, comments: 28, shares: 18, views: 1350 },
    { date: '2024-01-05', posts: 2, likes: 90, comments: 12, shares: 8, views: 750 },
    { date: '2024-01-06', posts: 5, likes: 220, comments: 42, shares: 28, views: 1800 },
    { date: '2024-01-07', posts: 4, likes: 160, comments: 22, shares: 14, views: 1100 },
  ]

  const platformDistribution = platforms.map((platform, index) => ({
    name: platform,
    value: socialAccounts.filter(acc => acc.platform === platform).length,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  const topPerformingContent = [
    { content: "Just launched our new product! 🚀", platform: 'twitter', likes: 245, comments: 56, shares: 32 },
    { content: "Here's what I learned this week...", platform: 'linkedin', likes: 189, comments: 41, shares: 28 },
    { content: "Behind the scenes of our latest project", platform: 'instagram', likes: 312, comments: 67, shares: 45 },
    { content: "Quick tip: Always backup your work!", platform: 'twitter', likes: 167, comments: 34, shares: 19 },
  ]

  const isLoading = overviewLoading || platformLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your social media performance and growth
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Time Range:</span>
              </div>
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedRange(range.value)}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      selectedRange === range.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Platform:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform} className="capitalize">
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.total_posts || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% from last period</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber((analytics.total_likes || 0) + (analytics.total_comments || 0) + (analytics.total_shares || 0))}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% from last period</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(analytics.average_engagement_rate || 0).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3% from last period</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{socialAccounts.length}</p>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">{platforms.length} platforms</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>
              Daily engagement metrics for the last {selectedRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEngagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="likes" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="comments" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="shares" 
                    stackId="1" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              Distribution of your connected social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>
              Your best performing posts from the last {selectedRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingContent.map((post, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getPlatformColor(post.platform)}`}>
                      {getPlatformIcon(post.platform)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        {formatNumber(post.likes)}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                        {formatNumber(post.comments)}
                      </div>
                      <div className="flex items-center">
                        <Share className="h-4 w-4 mr-1 text-green-500" />
                        {formatNumber(post.shares)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" size="sm" className="capitalize">
                    {post.platform}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>
              Engagement by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platforms.map((platform, index) => {
                const accountsCount = socialAccounts.filter(acc => acc.platform === platform).length
                const engagementRate = Math.random() * 5 + 1 // Mock data
                const totalPosts = Math.floor(Math.random() * 50) + 10 // Mock data

                return (
                  <div key={platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs ${getPlatformColor(platform)}`}>
                          {getPlatformIcon(platform)}
                        </div>
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{engagementRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{totalPosts} posts</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPlatformColor(platform)}`}
                        style={{ width: `${engagementRate * 20}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {accountsCount} account{accountsCount !== 1 ? 's' : ''} connected
                    </div>
                  </div>
                )
              })}

              {platforms.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    Connect social accounts to see platform analytics
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of your social media performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.total_views || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.total_likes || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.total_comments || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Comments</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                <Share className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.total_shares || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Shares</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}