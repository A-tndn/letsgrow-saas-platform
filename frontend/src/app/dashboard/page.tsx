import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  User, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Subscription {
  id: number;
  plan_type: string;
  billing_cycle: string;
  status: string;
  amount: number;
  currency: string;
  is_active: boolean;
  is_trial: boolean;
  trial_end: string | null;
  current_period_end: string | null;
  days_until_trial_end: number;
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats] = useState({
    posts_this_month: 0,
    engagement_rate: 0,
    followers_gained: 0,
    accounts_connected: 0
  });

  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for checkout success/failure
    const checkout = searchParams?.get('checkout');
    if (checkout === 'success') {
      toast.success('Subscription activated successfully! 🎉');
    } else if (checkout === 'demo-success') {
      toast.success('Demo subscription activated! 🚀');
    } else if (checkout === 'canceled') {
      toast.error('Checkout was canceled');
    }

    fetchSubscription();
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/billing/subscription');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'professional': return Crown;
      case 'enterprise': return Building2;
      default: return Zap;
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive) return 'text-green-600 bg-green-100';
    if (status === 'trialing') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-2xl font-bold text-indigo-600">LetsGrow</h1>
                <span className="ml-4 text-gray-500">Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Welcome, {user?.first_name}!
                </span>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to your Dashboard! 🎉
            </h2>
            <p className="text-gray-600">
              Here's an overview of your social media growth journey.
            </p>
          </div>

          {/* Subscription Status Card */}
          {subscription && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {(() => {
                    const IconComponent = getPlanIcon(subscription.plan_type);
                    return <IconComponent className="h-8 w-8 text-indigo-600 mr-3" />;
                  })()}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {subscription.plan_type} Plan
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {subscription.billing_cycle} billing • ${subscription.amount}/{subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status, subscription.is_active)}`}>
                    {subscription.is_trial ? 'Free Trial' : subscription.status}
                  </span>
                  {subscription.is_trial && (
                    <p className="text-sm text-gray-600 mt-1">
                      {subscription.days_until_trial_end} days left
                    </p>
                  )}
                </div>
              </div>

              {subscription.is_trial && subscription.days_until_trial_end <= 3 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800">
                      Your trial expires in {subscription.days_until_trial_end} day(s). 
                      <button 
                        onClick={() => router.push('/pricing')}
                        className="ml-2 font-medium underline hover:no-underline"
                      >
                        Upgrade now
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Posts This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.posts_this_month}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.engagement_rate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Followers Gained</p>
                  <p className="text-2xl font-bold text-gray-900">+{stats.followers_gained}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Connected Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.accounts_connected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/social-accounts" className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Connect Social Account</p>
                    <p className="text-sm text-gray-600">Link your social media profiles</p>
                  </div>
                </Link>

                <Link href="/content" className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generate Content</p>
                    <p className="text-sm text-gray-600">Create AI-powered posts</p>
                  </div>
                </Link>

                <Link href="/scheduler" className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Schedule Posts</p>
                    <p className="text-sm text-gray-600">Manage your content calendar</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-600">Welcome to LetsGrow!</p>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Connect Social Accounts</p>
                    <p className="text-sm text-gray-600">Link your first social media account</p>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Generate First Post</p>
                    <p className="text-sm text-gray-600">Let AI create your first post</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/pricing')}
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Billing & Plans</p>
                  <p className="text-sm text-gray-600">Manage subscription</p>
                </div>
              </button>

              <button className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <Settings className="h-6 w-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-600">Account preferences</p>
                </div>
              </button>

              <button className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-6 w-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Support</p>
                  <p className="text-sm text-gray-600">Get help</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
