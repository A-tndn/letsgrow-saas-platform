'use client'

import { useSocialAccounts, useAutomations, useContentQueue, useAnalyticsOverview } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Zap,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { formatNumber, formatRelativeDate, getPlatformColor, getPlatformIcon } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardOverview() {
  const { data: socialAccountsData, isLoading: socialLoading } = useSocialAccounts()
  const { data: automationsData, isLoading: automationsLoading } = useAutomations()
  const { data: contentData, isLoading: contentLoading } = useContentQueue()
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsOverview(30)

  const socialAccounts = socialAccountsData?.data?.accounts || []
  const automations = automationsData?.data?.automations || []
  const contentQueue = contentData?.data?.content_queue || []
  const analytics = analyticsData?.data?.overview || {}

  // Calculate key metrics
  const activeAutomations = automations.filter(auto => auto.status === 'active').length
  const scheduledContent = contentQueue.filter(content => content.status === 'scheduled').length
  const publishedToday = contentQueue.filter(content => {
    if (content.posted_at) {
      const today = new Date().toDateString()
      const postedDate = new Date(content.posted_at).toDateString()
      return today === postedDate
    }
    return false
  }).length

  const recentContent = contentQueue
    .filter(content => content.status !== 'cancelled')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const isLoading = socialLoading || automationsLoading || contentLoading || analyticsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 lg:p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-100">
          Here's what's happening with your social media automation today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(socialAccounts.map(acc => acc.platform)).size} platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAutomations}</div>
            <p className="text-xs text-muted-foreground">
              {automations.length - activeAutomations} paused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledContent}</div>
            <p className="text-xs text-muted-foreground">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedToday}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.total_posts || 0} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Connect Social Account */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/accounts">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Connect Social Account
              </Button>
            </Link>
            <Link href="/dashboard/automations">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Automation
              </Button>
            </Link>
            <Link href="/dashboard/content">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Content
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Connected Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
            <CardDescription>
              Your active social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {socialAccounts.length > 0 ? (
              <div className="space-y-3">
                {socialAccounts.slice(0, 4).map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${getPlatformColor(account.platform)}`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">@{account.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={account.is_active ? "success" : "secondary"}
                      size="sm"
                    >
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}

                {socialAccounts.length > 4 && (
                  <Link href="/dashboard/accounts">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {socialAccounts.length} accounts
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">
                  No social accounts connected yet
                </p>
                <Link href="/dashboard/accounts">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Account
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest content and automations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentContent.length > 0 ? (
              <div className="space-y-3">
                {recentContent.map((content) => (
                  <div key={content.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {content.status === 'posted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {content.status === 'scheduled' && <Clock className="h-4 w-4 text-blue-500" />}
                      {content.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {content.status === 'posting' && <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {content.content.substring(0, 50)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={
                            content.status === 'posted' ? 'success' :
                            content.status === 'scheduled' ? 'default' :
                            content.status === 'failed' ? 'destructive' : 'warning'
                          }
                          size="sm"
                        >
                          {content.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatRelativeDate(content.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/dashboard/content">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View content calendar
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">
                  No content activity yet
                </p>
                <Link href="/dashboard/automations">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Automation
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Analytics Preview */}
      {analytics.total_posts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Overview (Last 30 Days)</CardTitle>
            <CardDescription>
              Your social media performance summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analytics.total_posts)}
                </div>
                <p className="text-sm text-gray-600">Posts Published</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(analytics.total_likes || 0)}
                </div>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(analytics.total_comments || 0)}
                </div>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.average_engagement_rate?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-sm text-gray-600">Avg. Engagement</p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Link href="/dashboard/analytics">
                <Button variant="outline">
                  View Detailed Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}