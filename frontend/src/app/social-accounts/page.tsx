import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  User, 
  Plus,
  Trash2,
  RefreshCw,
  Users,
  MessageCircle,
  Heart,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
  max_text_length: number;
  supports_media: boolean;
  max_media_count: number;
}

interface SocialAccount {
  id: number;
  platform: string;
  platform_display_name: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  status: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  auto_post_enabled: boolean;
  is_active: boolean;
  needs_reauth: boolean;
  last_sync_at?: string;
  created_at: string;
}

export default function SocialAccountsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [connectForm, setConnectForm] = useState({
    username: '',
    display_name: ''
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPlatforms();
    fetchAccounts();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await api.get('/social/platforms');
      if (response.data.success) {
        setPlatforms(response.data.platforms);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
      toast.error('Failed to load platforms');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/social/accounts');
      if (response.data.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load social accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    if (!selectedPlatform || !connectForm.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(selectedPlatform.id);

    try {
      const response = await api.post('/social/accounts', {
        platform: selectedPlatform.id,
        username: connectForm.username,
        display_name: connectForm.display_name || connectForm.username
      });

      if (response.data.success) {
        toast.success('Account connected successfully! 🎉');
        await fetchAccounts();
        setShowConnectModal(false);
        setConnectForm({ username: '', display_name: '' });
        setSelectedPlatform(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to connect account');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnectAccount = async (accountId: number, username: string) => {
    if (!confirm(`Are you sure you want to disconnect @${username}?`)) {
      return;
    }

    try {
      const response = await api.delete(`/social/accounts/${accountId}`);
      if (response.data.success) {
        toast.success('Account disconnected successfully');
        await fetchAccounts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to disconnect account');
    }
  };

  const handleSyncAccount = async (accountId: number) => {
    try {
      const response = await api.post(`/social/accounts/${accountId}/sync`);
      if (response.data.success) {
        toast.success('Account synced successfully');
        await fetchAccounts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to sync account');
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive) return 'text-green-600 bg-green-100';
    if (status === 'pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'error') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (isActive) return CheckCircle;
    if (status === 'pending') return Clock;
    if (status === 'error') return AlertCircle;
    return AlertCircle;
  };

  const getPlatformIcon = (platform: string) => {
    // This would normally use platform-specific icons
    return User;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading social accounts...</p>
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
                <span className="ml-4 text-gray-500">Social Accounts</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Social Media Accounts
            </h1>
            <p className="text-gray-600">
              Connect your social media accounts to start automating your content.
            </p>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Connected Accounts ({accounts.length})
                </h2>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Account
                </button>
              </div>
            </div>

            <div className="p-6">
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No social accounts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by connecting your first social media account.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accounts.map((account) => {
                    const StatusIcon = getStatusIcon(account.status, account.is_active);
                    const PlatformIcon = getPlatformIcon(account.platform);

                    return (
                      <div key={account.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <PlatformIcon className="h-8 w-8 text-indigo-600 mr-3" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {account.platform_display_name}
                              </h3>
                              <p className="text-sm text-gray-600">@{account.username}</p>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status, account.is_active)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {account.is_active ? 'Active' : account.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-gray-900">
                              {account.followers_count.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">Followers</p>
                          </div>
                          <div className="text-center">
                            <User className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-gray-900">
                              {account.following_count.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">Following</p>
                          </div>
                          <div className="text-center">
                            <MessageCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-gray-900">
                              {account.posts_count.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">Posts</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleSyncAccount(account.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </button>
                          <button
                            onClick={() => handleDisconnectAccount(account.id, account.username)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Available Platforms */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Platforms
              </h2>
              <p className="text-sm text-gray-600">
                Choose from our supported social media platforms.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {platforms.map((platform) => {
                  const isConnected = accounts.some(acc => acc.platform === platform.id);
                  const PlatformIcon = getPlatformIcon(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`relative rounded-lg border p-4 text-center ${
                        isConnected
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isConnected) {
                          setSelectedPlatform(platform);
                          setShowConnectModal(true);
                        }
                      }}
                    >
                      <PlatformIcon className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                      <h3 className="text-sm font-medium text-gray-900">{platform.name}</h3>
                      {isConnected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Connect Account Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Connect {selectedPlatform?.name} Account
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Username *
                          </label>
                          <input
                            type="text"
                            value={connectForm.username}
                            onChange={(e) => setConnectForm(prev => ({ ...prev, username: e.target.value }))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter username without @"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={connectForm.display_name}
                            onChange={(e) => setConnectForm(prev => ({ ...prev, display_name: e.target.value }))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Optional display name"
                          />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Demo Mode:</strong> This will create a demo connection for testing purposes.
                            Real OAuth integration coming soon!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleConnectAccount}
                    disabled={isConnecting === selectedPlatform?.id}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isConnecting === selectedPlatform?.id ? 'Connecting...' : 'Connect Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setConnectForm({ username: '', display_name: '' });
                      setSelectedPlatform(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
