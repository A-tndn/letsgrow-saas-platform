'use client'

import { useState } from 'react'
import { useSocialAccounts, useDisconnectSocialAccount } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Twitter,
  Instagram, 
  Linkedin,
  Plus,
  Settings,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { getPlatformColor, formatRelativeDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500',
    description: 'Share short updates and engage with your audience',
    features: ['280 character posts', 'Retweets & replies', 'Hashtag research', 'Tweet scheduling']
  },
  {
    id: 'instagram',
    name: 'Instagram', 
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Visual storytelling with photos and videos',
    features: ['Photo & video posts', 'Stories', 'Reels', 'Hashtag optimization'],
    comingSoon: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin, 
    color: 'bg-blue-600',
    description: 'Professional networking and thought leadership',
    features: ['Professional posts', 'Articles', 'Company updates', 'Industry insights'],
    comingSoon: true
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: () => <span className="text-orange-500 font-bold text-lg">R</span>,
    color: 'bg-orange-500',
    description: 'Community engagement and discussions',
    features: ['Subreddit posts', 'Comments', 'Community building', 'Trend analysis'],
    comingSoon: true
  }
]

export default function SocialAccountsPage() {
  const { data: socialAccountsData, isLoading } = useSocialAccounts()
  const disconnectMutation = useDisconnectSocialAccount()
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  const socialAccounts = socialAccountsData?.data?.accounts || []
  const connectedPlatforms = new Set(socialAccounts.map(account => account.platform))

  const handleConnect = async (platform: string) => {
    if (PLATFORMS.find(p => p.id === platform)?.comingSoon) {
      toast.error('This platform integration is coming soon!')
      return
    }

    setConnectingPlatform(platform)

    try {
      // Mock OAuth flow for demo
      if (platform === 'twitter') {
        // In real implementation, this would redirect to Twitter OAuth
        toast.success('Twitter OAuth flow would be initiated here')
      }
    } catch (error) {
      toast.error('Failed to connect platform')
    } finally {
      setConnectingPlatform(null)
    }
  }

  const handleDisconnect = async (accountId: number, username: string) => {
    if (!confirm(`Are you sure you want to disconnect @${username}?`)) {
      return
    }

    try {
      await disconnectMutation.mutateAsync(accountId)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded"></div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Social Media Accounts</h1>
        <p className="text-gray-600 mt-2">
          Connect your social media platforms to start automating your content
        </p>
      </div>

      {/* Connected Accounts */}
      {socialAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getPlatformColor(account.platform)}`}>
                        {(() => {
                          const platform = PLATFORMS.find(p => p.id === account.platform)
                          if (!platform) return null
                          const IconComponent = platform.icon
                          return <IconComponent className="h-5 w-5" />
                        })()}
                      </div>
                      <div>
                        <p className="font-medium">@{account.username}</p>
                        <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={account.is_active ? "success" : "secondary"}
                      size="sm"
                    >
                      {account.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>Display Name:</strong> {account.display_name}</p>
                      <p><strong>Connected:</strong> {formatRelativeDate(account.created_at)}</p>
                      {account.last_sync && (
                        <p><strong>Last Sync:</strong> {formatRelativeDate(account.last_sync)}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(account.id, account.username)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {socialAccounts.length > 0 ? 'Connect More Platforms' : 'Available Platforms'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORMS.map((platform) => {
            const isConnected = connectedPlatforms.has(platform.id)
            const Icon = platform.icon

            return (
              <Card 
                key={platform.id} 
                className={`relative overflow-hidden hover:shadow-lg transition-all duration-200 ${
                  isConnected ? 'ring-2 ring-green-500 bg-green-50' : ''
                } ${platform.comingSoon ? 'opacity-75' : ''}`}
              >
                {platform.comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="warning" size="sm">
                      <Clock className="h-3 w-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${platform.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{platform.name}</span>
                        {isConnected && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{platform.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {platform.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      {isConnected ? (
                        <div className="flex items-center justify-between">
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleConnect(platform.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Another
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleConnect(platform.id)}
                          disabled={connectingPlatform === platform.id || platform.comingSoon}
                          loading={connectingPlatform === platform.id}
                          className="w-full"
                        >
                          {platform.comingSoon ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Coming Soon
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Connect {platform.name}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Need Help?</CardTitle>
          <CardDescription className="text-blue-700">
            Having trouble connecting your accounts? Here are some tips:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
              Make sure you have admin access to the social media accounts
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
              Check that third-party app access is enabled in your account settings
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
              Ensure your browser allows popups for OAuth authentication
            </li>
          </ul>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}