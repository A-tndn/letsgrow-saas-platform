import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AnalyticsData {
  total_posts: number;
  avg_engagement_rate: number;
  total_reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  follower_growth: number;
  top_performing_posts: any[];
  engagement_by_platform: any[];
  posting_frequency: any[];
  best_posting_times: string[];
  hashtag_performance: any[];
  growth_trends: any[];
}

interface AutomationAnalytics {
  total_executions: number;
  success_rate: number;
  average_per_day: number;
  rule_performance: any[];
  recent_activity: any;
}

export default function AnalyticsDashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [automationAnalytics, setAutomationAnalytics] = useState<AutomationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7_days');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedPlatform]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching analytics data
      // In a real implementation, this would call actual analytics endpoints
      setAnalyticsData(generateMockAnalyticsData());

      // Fetch automation analytics
      const automationResponse = await api.get('/automation/analytics');
      if (automationResponse.data.success) {
        setAutomationAnalytics(automationResponse.data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyticsData = (): AnalyticsData => {
    // Generate realistic mock data
    return {
      total_posts: 45,
      avg_engagement_rate: 4.2,
      total_reach: 12450,
      total_likes: 523,
      total_comments: 89,
      total_shares: 156,
      follower_growth: 127,
      top_performing_posts: [
        {
          id: 1,
          content: "5 productivity tips that changed my life...",
          platform: "twitter",
          engagement_rate: 8.5,
          likes: 45,
          comments: 12,
          shares: 8
        },
        {
          id: 2,
          content: "The future of AI in business automation...",
          platform: "linkedin",
          engagement_rate: 7.2,
          likes: 32,
          comments: 18,
          shares: 15
        }
      ],
      engagement_by_platform: [
        { platform: 'Twitter', engagement_rate: 4.5, posts: 20 },
        { platform: 'LinkedIn', engagement_rate: 6.1, posts: 15 },
        { platform: 'Instagram', engagement_rate: 3.8, posts: 10 }
      ],
      posting_frequency: [
        { day: 'Mon', posts: 7 },
        { day: 'Tue', posts: 5 },
        { day: 'Wed', posts: 8 },
        { day: 'Thu', posts: 6 },
        { day: 'Fri', posts: 9 },
        { day: 'Sat', posts: 4 },
        { day: 'Sun', posts: 6 }
      ],
      best_posting_times: ['09:00', '13:00', '17:00'],
      hashtag_performance: [
        { hashtag: '#productivity', usage: 12, avg_engagement: 5.2 },
        { hashtag: '#business', usage: 8, avg_engagement: 4.8 },
        { hashtag: '#AI', usage: 6, avg_engagement: 6.1 }
      ],
      growth_trends: [
        { date: '2024-01-01', followers: 1200, engagement: 3.5 },
        { date: '2024-01-07', followers: 1250, engagement: 4.1 },
        { date: '2024-01-14', followers: 1310, engagement: 4.2 },
        { date: '2024-01-21', followers: 1380, engagement: 4.5 }
      ]
    };
  };

  const exportData = () => {
    // Simulate data export
    toast.success('Analytics data exported! 📊');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                <span className="ml-4 text-gray-500">Analytics</span>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  Track your social media performance and automation efficiency.
                </p>
              </div>
              <div className="flex space-x-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="7_days">Last 7 days</option>
                  <option value="30_days">Last 30 days</option>
                  <option value="90_days">Last 90 days</option>
                </select>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                </select>
                <button
                  onClick={fetchAnalytics}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={exportData}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          {analyticsData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.total_posts}</p>
                      <p className="text-sm text-green-600">+12% from last period</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg. Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.avg_engagement_rate}%</p>
                      <p className="text-sm text-green-600">+0.8% from last period</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Reach</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.total_reach.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+18% from last period</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Follower Growth</p>
                      <p className="text-2xl font-bold text-gray-900">+{analyticsData.follower_growth}</p>
                      <p className="text-sm text-green-600">+5% from last period</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    Engagement Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-gray-600">Likes</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analyticsData.total_likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-600">Comments</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analyticsData.total_comments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Share className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">Shares</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analyticsData.total_shares}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 text-indigo-500 mr-2" />
                    Platform Performance
                  </h3>
                  <div className="space-y-4">
                    {analyticsData.engagement_by_platform.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{platform.platform}</p>
                          <p className="text-xs text-gray-500">{platform.posts} posts</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{platform.engagement_rate}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{width: `${(platform.engagement_rate / 10) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    Best Posting Times
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.best_posting_times.map((time, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-purple-800">{time}</span>
                        <span className="text-xs text-purple-600">High engagement</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">
                      Based on historical performance data
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Performing Posts */}
              <div className="bg-white rounded-lg shadow-sm border mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Performing Posts
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.top_performing_posts.map((post, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 mb-2">{post.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="capitalize bg-gray-100 px-2 py-1 rounded">{post.platform}</span>
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.comments}
                              </span>
                              <span className="flex items-center">
                                <Share className="h-4 w-4 mr-1" />
                                {post.shares}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-green-600">{post.engagement_rate}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hashtag Performance */}
              <div className="bg-white rounded-lg shadow-sm border mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hashtag Performance
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analyticsData.hashtag_performance.map((hashtag, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-indigo-600">{hashtag.hashtag}</span>
                          <span className="text-sm text-gray-500">{hashtag.usage} uses</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg. Engagement</span>
                          <span className="font-semibold text-green-600">{hashtag.avg_engagement}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Automation Analytics */}
          {automationAnalytics && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                  Automation Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{automationAnalytics.total_executions}</p>
                    <p className="text-sm text-gray-600">Total Executions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{automationAnalytics.success_rate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{automationAnalytics.average_per_day.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg. Per Day</p>
                  </div>
                </div>

                {automationAnalytics.rule_performance.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Rule Performance</h4>
                    <div className="space-y-2">
                      {automationAnalytics.rule_performance.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{rule.rule_name}</span>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">{rule.success_rate.toFixed(1)}%</span>
                            <p className="text-xs text-gray-500">{rule.executions} executions</p>
                          </div>
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
    </ProtectedRoute>
  );
}
