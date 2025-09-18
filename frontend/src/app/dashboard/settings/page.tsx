'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  User,
  Settings,
  Bell,
  Shield,
  Key,
  CreditCard,
  Zap,
  Mail,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const SUBSCRIPTION_TIERS = [
  {
    name: 'Starter',
    price: '$19',
    period: 'month',
    features: ['5 social accounts', '1,000 AI posts/month', 'Basic analytics', 'Email support'],
    current: false
  },
  {
    name: 'Professional',
    price: '$49',
    period: 'month', 
    features: ['15 social accounts', '5,000 AI posts/month', 'Advanced analytics', 'Growth bot', 'Priority support'],
    current: true,
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'month',
    features: ['Unlimited accounts', 'Unlimited AI posts', 'Custom integrations', 'Dedicated support', 'White-label options'],
    current: false
  }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    company: '',
    timezone: 'America/New_York',
    phone: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_weekly_reports: true,
    email_growth_milestones: true,
    email_system_updates: false,
    push_content_published: true,
    push_growth_alerts: true,
    push_system_notifications: false,
    sms_critical_alerts: false
  })

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'private',
    data_sharing: false,
    analytics_tracking: true,
    marketing_emails: false
  })

  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Main API Key',
      key: 'sk-proj-abc123...xyz789',
      created: '2024-01-10',
      last_used: '2024-01-14',
      permissions: 'read-write'
    }
  ])

  const SETTINGS_TABS = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
  ]

  const handleSaveProfile = () => {
    // API call to save profile
    toast.success('Profile updated successfully')
  }

  const handleSaveNotifications = () => {
    // API call to save notification preferences
    toast.success('Notification settings updated')
  }

  const handleGenerateApiKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: 'New API Key',
      key: 'sk-proj-' + Math.random().toString(36).substr(2, 32),
      created: new Date().toISOString().split('T')[0],
      last_used: 'Never',
      permissions: 'read-write'
    }
    setApiKeys([...apiKeys, newKey])
    toast.success('New API key generated')
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
  }

  const handleDeleteApiKey = (keyId: number) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== keyId))
      toast.success('API key deleted')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({...prev, first_name: e.target.value}))}
                  />
                  <Input
                    label="Last Name" 
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({...prev, last_name: e.target.value}))}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company (Optional)"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({...prev, company: e.target.value}))}
                  />
                  <Input
                    label="Phone Number (Optional)"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData(prev => ({...prev, timezone: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Choose what email notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Weekly Growth Reports</p>
                      <p className="text-sm text-gray-600">Receive detailed weekly analytics and insights</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_weekly_reports}
                      onChange={(e) => setNotificationSettings(prev => ({...prev, email_weekly_reports: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Growth Milestones</p>
                      <p className="text-sm text-gray-600">Get notified when you hit follower or engagement milestones</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_growth_milestones}
                      onChange={(e) => setNotificationSettings(prev => ({...prev, email_growth_milestones: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-gray-600">Product updates, new features, and maintenance notices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_system_updates}
                      onChange={(e) => setNotificationSettings(prev => ({...prev, email_system_updates: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Manage browser and mobile push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Content Published</p>
                      <p className="text-sm text-gray-600">When your scheduled content goes live</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.push_content_published}
                      onChange={(e) => setNotificationSettings(prev => ({...prev, push_content_published: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Growth Alerts</p>
                      <p className="text-sm text-gray-600">Significant changes in follower count or engagement</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.push_growth_alerts}
                      onChange={(e) => setNotificationSettings(prev => ({...prev, push_growth_alerts: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacySettings.profile_visibility}
                    onChange={(e) => setPrivacySettings(prev => ({...prev, profile_visibility: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="contacts">Contacts Only</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Data Sharing</p>
                      <p className="text-sm text-gray-600">Share anonymized usage data to improve the platform</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.data_sharing}
                      onChange={(e) => setPrivacySettings(prev => ({...prev, data_sharing: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Analytics Tracking</p>
                      <p className="text-sm text-gray-600">Allow analytics to help us improve your experience</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.analytics_tracking}
                      onChange={(e) => setPrivacySettings(prev => ({...prev, analytics_tracking: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>

                <Button variant="outline">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>

                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage API keys for integrations and external access
                    </CardDescription>
                  </div>
                  <Button onClick={handleGenerateApiKey}>
                    <Key className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" size="sm">
                            {apiKey.permissions}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyApiKey(apiKey.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {showApiKey ? apiKey.key : apiKey.key.substring(0, 12) + '...'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>Created: {apiKey.created}</p>
                        <p>Last used: {apiKey.last_used}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">API Usage Guidelines</h4>
                      <ul className="mt-2 text-sm text-blue-800 space-y-1">
                        <li>• Keep your API keys secure and never share them publicly</li>
                        <li>• Rate limits apply based on your subscription tier</li>
                        <li>• Monitor usage in the Analytics dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-blue-900">Professional Plan</h4>
                    <p className="text-sm text-blue-700">$49/month • Next billing: Feb 15, 2024</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-600">Social Accounts</p>
                    <p className="text-xs text-gray-500">of 15 used</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">2,456</p>
                    <p className="text-sm text-gray-600">AI Posts</p>
                    <p className="text-xs text-gray-500">of 5,000 this month</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">✓</p>
                    <p className="text-sm text-gray-600">Growth Bot</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">✓</p>
                    <p className="text-sm text-gray-600">Analytics</p>
                    <p className="text-xs text-gray-500">Advanced</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your plan anytime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <div
                      key={tier.name}
                      className={cn(
                        'p-6 border rounded-lg relative',
                        tier.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                        tier.popular ? 'ring-2 ring-blue-500' : ''
                      )}
                    >
                      {tier.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold">{tier.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">{tier.price}</span>
                          <span className="text-gray-600">/{tier.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={tier.current ? 'secondary' : 'default'}
                        disabled={tier.current}
                      >
                        {tier.current ? 'Current Plan' : 'Choose Plan'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Update your billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and platform configuration
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)