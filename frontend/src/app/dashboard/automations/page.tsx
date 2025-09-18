'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAutomations, useToggleAutomation, useDeleteAutomation } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  Activity,
  AlertTriangle,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { formatRelativeDate, getPlatformColor, getPlatformIcon } from '@/lib/utils'
import { Automation } from '@/types/automation'

export default function AutomationsPage() {
  const { data: automationsData, isLoading } = useAutomations()
  const toggleMutation = useToggleAutomation()
  const deleteMutation = useDeleteAutomation()
  const [selectedAutomation, setSelectedAutomation] = useState<number | null>(null)

  const automations = automationsData?.automations || []

  const handleToggle = async (automationId: number) => {
    try {
      await toggleMutation.mutateAsync(automationId)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleDelete = async (automation: Automation) => {
    const confirmMessage = `Are you sure you want to delete "${automation.name}"? This action cannot be undone.`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      await deleteMutation.mutateAsync(automation.id)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'paused': return 'warning'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'error': return <AlertTriangle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-600 mt-2">
            Manage your social media automation rules and schedules
          </p>
        </div>

        <Link href="/dashboard/automations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {automations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {automations.filter(a => a.status === 'paused').length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {automations.filter(a => a.status === 'error').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations Grid */}
      {automations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((automation) => (
            <Card 
              key={automation.id} 
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {automation.description || 'No description provided'}
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={getStatusColor(automation.status)}
                      size="sm"
                    >
                      {getStatusIcon(automation.status)}
                      <span className="ml-1 capitalize">{automation.status}</span>
                    </Badge>

                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Platforms */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {automation.platforms.map((platform) => (
                        <div 
                          key={platform}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPlatformColor(platform)}`}
                        >
                          <span className="mr-1">{getPlatformIcon(platform)}</span>
                          <span className="capitalize">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Topic */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Topic</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {automation.content_settings.topic}
                    </p>
                  </div>

                  {/* Schedule Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {automation.posting_schedule.type} posting
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{automation.run_count} posts created</p>
                      {automation.error_count > 0 && (
                        <p className="text-red-600">{automation.error_count} errors</p>
                      )}
                    </div>
                  </div>

                  {/* Next Run */}
                  {automation.next_run && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Next scheduled run</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatRelativeDate(automation.next_run)}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {automation.status === 'error' && automation.last_error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-600 font-medium">Last Error</p>
                      <p className="text-sm text-red-700 mt-1">
                        {automation.last_error}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(automation.id)}
                      disabled={toggleMutation.isPending}
                      className="flex-1"
                    >
                      {automation.status === 'active' ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(automation)}
                      disabled={deleteMutation.isPending}
                      className="px-3 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Activity className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No automations yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first automation. Set up rules to automatically 
                generate and post content to your social media accounts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard/automations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Automation
                  </Button>
                </Link>

                <Link href="/dashboard/accounts">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Connect Social Accounts First
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}