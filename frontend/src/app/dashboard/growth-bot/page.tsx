'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Bot,
  Activity,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  UserMinus,
  Settings,
  Play,
  Pause,
  BarChart3,
  Clock,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { formatRelativeDate, formatNumber } from '@/lib/utils'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for the growth bot activities
const mockBotActivities = [
  {
    id: 1,
    action: 'follow',
    target: '@techleader_ai',
    platform: 'twitter',
    result: 'success',
    timestamp: '2024-01-15T10:30:00Z',
    engagement_score: 0.85,
    reason: 'High engagement in AI niche, 2.3K followers'
  },
  {
    id: 2,
    action: 'like',
    target: 'Post about startup growth',
    platform: 'linkedin',
    result: 'success', 
    timestamp: '2024-01-15T10:25:00Z',
    engagement_score: 0.72,
    reason: 'Trending topic in business niche'
  },
  {
    id: 3,
    action: 'comment',
    target: '@startup_mentor',
    platform: 'twitter',
    result: 'success',
    timestamp: '2024-01-15T10:20:00Z',
    engagement_score: 0.91,
    reason: 'AI-generated relevant comment, high influence target'
  },
  {
    id: 4,
    action: 'unfollow',
    target: '@inactive_account',
    platform: 'twitter',
    result: 'success',
    timestamp: '2024-01-15T10:15:00Z',
    engagement_score: 0.15,
    reason: 'No engagement for 30 days, cleaning follower ratio'
  }
]

const mockGrowthMetrics = [
  { date: '2024-01-08', followers: 1250, engagement: 145, actions: 25 },
  { date: '2024-01-09', followers: 1267, engagement: 168, actions: 32 },
  { date: '2024-01-10', followers: 1289, engagement: 192, actions: 28 },
  { date: '2024-01-11', followers: 1312, engagement: 178, actions: 30 },
  { date: '2024-01-12', followers: 1334, engagement: 203, actions: 35 },
  { date: '2024-01-13', followers: 1359, engagement: 187, actions: 29 },
  { date: '2024-01-14', followers: 1387, engagement: 219, actions: 33 },
]

export default function GrowthBotDashboard() {
  const [botStatus, setBotStatus] = useState<'active' | 'paused' | 'configuring'>('active')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [botSettings, setBotSettings] = useState({
    engagement_intensity: 'moderate',
    daily_action_limit: 150,
    follow_ratio_target: 1.2,
    engagement_threshold: 0.6,
    auto_unfollow: true,
    safe_mode: true
  })

  const todaysStats = {
    actions_taken: 47,
    actions_limit: botSettings.daily_action_limit,
    new_followers: 12,
    lost_followers: 3,
    engagement_received: 89,
    success_rate: 94.2
  }

  const toggleBotStatus = () => {
    setBotStatus(current => current === 'active' ? 'paused' : 'active')
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'follow': return <UserPlus className="h-3 w-3" />
      case 'unfollow': return <UserMinus className="h-3 w-3" />
      case 'like': return <Heart className="h-3 w-3" />
      case 'comment': return <MessageCircle className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'follow': return 'text-green-600 bg-green-100'
      case 'unfollow': return 'text-orange-600 bg-orange-100' 
      case 'like': return 'text-red-600 bg-red-100'
      case 'comment': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (result: string) => {
    return result === 'success' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Growth Bot Dashboard</h1>
            <p className="text-gray-600">Monitor and control your autonomous social media growth</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge 
            variant={botStatus === 'active' ? 'success' : 'warning'} 
            className="px-3 py-1"
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${botStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {botStatus === 'active' ? 'Active' : 'Paused'}
          </Badge>

          <Button 
            onClick={toggleBotStatus}
            variant={botStatus === 'active' ? 'outline' : 'default'}
          >
            {botStatus === 'active' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Bot
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions Today</p>
                <p className="text-2xl font-bold">
                  {todaysStats.actions_taken}<span className="text-sm text-gray-500">/{todaysStats.actions_limit}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(todaysStats.actions_taken / todaysStats.actions_limit) * 100}%` }}
                  />
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Followers</p>
                <p className="text-2xl font-bold text-green-600">
                  +{todaysStats.new_followers - todaysStats.lost_followers}
                </p>
                <p className="text-sm text-gray-500">
                  +{todaysStats.new_followers} -{todaysStats.lost_followers}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{todaysStats.engagement_received}</p>
                <p className="text-sm text-gray-500">likes, comments, shares</p>
              </div>
              <Heart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{todaysStats.success_rate}%</p>
                <p className="text-sm text-gray-500">of actions succeeded</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>
                Your account growth and bot activity over time
              </CardDescription>
            </div>
            <div className="flex rounded-md overflow-hidden border">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockGrowthMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                  name="Followers"
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                  name="Engagement"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities & Bot Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bot Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bot Activities</CardTitle>
                  <CardDescription>
                    Latest autonomous actions taken by your growth bot
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBotActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.action} • {activity.target}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" size="sm" className="capitalize">
                            {activity.platform}
                          </Badge>
                          {activity.result === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.reason}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatRelativeDate(activity.timestamp)}</span>
                          <span>Score: {(activity.engagement_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All Activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bot Settings & Controls */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Bot Settings
              </CardTitle>
              <CardDescription>
                Configure your growth bot behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Intensity
                </label>
                <select
                  value={botSettings.engagement_intensity}
                  onChange={(e) => setBotSettings(prev => ({...prev, engagement_intensity: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Action Limit
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={botSettings.daily_action_limit}
                  onChange={(e) => setBotSettings(prev => ({...prev, daily_action_limit: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Follow Ratio
                </label>
                <input
                  type="number"
                  min="0.8"
                  max="2.0"
                  step="0.1"
                  value={botSettings.follow_ratio_target}
                  onChange={(e) => setBotSettings(prev => ({...prev, follow_ratio_target: parseFloat(e.target.value)}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Unfollow</span>
                  <input
                    type="checkbox"
                    checked={botSettings.auto_unfollow}
                    onChange={(e) => setBotSettings(prev => ({...prev, auto_unfollow: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Safe Mode</span>
                  <input
                    type="checkbox"
                    checked={botSettings.safe_mode}
                    onChange={(e) => setBotSettings(prev => ({...prev, safe_mode: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              <Button className="w-full mt-4">
                <Settings className="h-4 w-4 mr-2" />
                Update Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Bot Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Daily Growth</span>
                  <span className="font-medium">+28 followers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Performing Time</span>
                  <span className="font-medium">2:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top Action Type</span>
                  <span className="font-medium">Strategic Follows</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="font-medium text-green-600">5.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Queue Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Upcoming Actions
          </CardTitle>
          <CardDescription>
            Next planned bot activities based on your strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Follow Tech Influencers</p>
              <p className="text-sm text-gray-600">15 targeted accounts</p>
              <p className="text-xs text-gray-500 mt-1">Next: 2:30 PM</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Heart className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Like Trending Posts</p>
              <p className="text-sm text-gray-600">25 high-engagement posts</p>
              <p className="text-xs text-gray-500 mt-1">Next: 3:15 PM</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Engage with Community</p>
              <p className="text-sm text-gray-600">10 AI-crafted comments</p>
              <p className="text-xs text-gray-500 mt-1">Next: 4:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}