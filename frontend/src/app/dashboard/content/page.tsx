'use client'

import { useState, useMemo } from 'react'
import { useContentQueue, useScheduleContent, useDeleteContent, useGenerateContent } from '@/hooks/useApi'
import { useSocialAccounts } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Eye
} from 'lucide-react'
import { formatDate, formatRelativeDate, getPlatformColor, getPlatformIcon, cn } from '@/lib/utils'
import { ContentItem } from '@/types/content'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: contentData, isLoading } = useContentQueue()
  const { data: socialAccountsData } = useSocialAccounts()
  const deleteContentMutation = useDeleteContent()

  const content = contentData?.content_queue || []
  const socialAccounts = socialAccountsData?.accounts || []

  // Filter content based on current filters
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesPlatform = filterPlatform === 'all' || 
        socialAccounts.find(acc => acc.id === item.social_account_id)?.platform === filterPlatform

      const matchesStatus = filterStatus === 'all' || item.status === filterStatus

      const matchesSearch = searchQuery === '' || 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesPlatform && matchesStatus && matchesSearch
    })
  }, [content, filterPlatform, filterStatus, searchQuery, socialAccounts])

  // Group content by date for calendar view
  const contentByDate = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {}

    filteredContent.forEach(item => {
      const dateKey = format(new Date(item.scheduled_for), 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })

    return grouped
  }, [filteredContent])

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'success'
      case 'scheduled': return 'default'
      case 'posting': return 'warning'
      case 'failed': return 'destructive'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return <CheckCircle className="h-3 w-3" />
      case 'scheduled': return <Clock className="h-3 w-3" />
      case 'posting': return <Activity className="h-3 w-3" />
      case 'failed': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const handleDeleteContent = async (contentItem: ContentItem) => {
    if (!confirm(`Are you sure you want to delete this ${contentItem.status} content?`)) {
      return
    }

    try {
      await deleteContentMutation.mutateAsync(contentItem.id)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-2">
            Manage and schedule your social media content
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/dashboard/content/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {content.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {content.filter(c => c.status === 'posted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {content.filter(c => c.status === 'posting').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {content.filter(c => c.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Platforms</option>
                  {[...new Set(socialAccounts.map(acc => acc.platform))].map(platform => (
                    <option key={platform} value={platform} className="capitalize">
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="posting">Publishing</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    'px-3 py-1 text-sm font-medium transition-colors',
                    viewMode === 'calendar' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1 text-sm font-medium transition-colors',
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayContent = contentByDate[dateKey] || []
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isPast = isBefore(day, startOfDay(new Date()))

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={cn(
                      'bg-white p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-blue-50 ring-2 ring-blue-500',
                      isToday(day) && 'bg-yellow-50',
                      isPast && 'bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'text-sm font-medium',
                        isToday(day) ? 'text-yellow-600 font-bold' : 
                        isPast ? 'text-gray-400' : 'text-gray-700'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayContent.length > 0 && (
                        <Badge variant="secondary" size="sm">
                          {dayContent.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayContent.slice(0, 3).map(item => {
                        const account = socialAccounts.find(acc => acc.id === item.social_account_id)
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'text-xs p-1 rounded truncate',
                              getPlatformColor(account?.platform || ''),
                              'text-white'
                            )}
                            title={item.content}
                          >
                            <div className="flex items-center space-x-1">
                              <span>{getPlatformIcon(account?.platform || '')}</span>
                              <span className="truncate">{item.content.substring(0, 20)}...</span>
                            </div>
                          </div>
                        )
                      })}
                      {dayContent.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayContent.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date Content */}
      {selectedDate && contentByDate[format(selectedDate, 'yyyy-MM-dd')] && (
        <Card>
          <CardHeader>
            <CardTitle>
              Content for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentByDate[format(selectedDate, 'yyyy-MM-dd')].map(item => {
                const account = socialAccounts.find(acc => acc.id === item.social_account_id)
                return (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={cn(
                            'w-6 h-6 rounded flex items-center justify-center text-white text-xs',
                            getPlatformColor(account?.platform || '')
                          )}>
                            {getPlatformIcon(account?.platform || '')}
                          </div>
                          <span className="font-medium">@{account?.username}</span>
                          <Badge variant={getStatusColor(item.status)} size="sm">
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-2">{item.content}</p>

                        {item.hashtags && item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.hashtags.map(tag => (
                              <Badge key={tag} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Scheduled for {format(new Date(item.scheduled_for), 'h:mm a')}
                          {item.posted_at && (
                            <span> • Posted {formatRelativeDate(item.posted_at)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContent(item)}
                          className="hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>All Content</CardTitle>
            <CardDescription>
              {filteredContent.length} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredContent.length > 0 ? (
              <div className="space-y-4">
                {filteredContent
                  .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
                  .map(item => {
                    const account = socialAccounts.find(acc => acc.id === item.social_account_id)
                    return (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-white',
                                getPlatformColor(account?.platform || '')
                              )}>
                                {getPlatformIcon(account?.platform || '')}
                              </div>
                              <div>
                                <p className="font-medium">@{account?.username}</p>
                                <p className="text-sm text-gray-500 capitalize">{account?.platform}</p>
                              </div>
                              <Badge variant={getStatusColor(item.status)} size="sm">
                                {getStatusIcon(item.status)}
                                <span className="ml-1 capitalize">{item.status}</span>
                              </Badge>
                            </div>

                            <p className="text-gray-700 mb-2 line-clamp-2">{item.content}</p>

                            {item.hashtags && item.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.hashtags.slice(0, 5).map(tag => (
                                  <Badge key={tag} variant="secondary" size="sm">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.hashtags.length > 5 && (
                                  <Badge variant="secondary" size="sm">
                                    +{item.hashtags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>📅 {formatDate(item.scheduled_for, 'MMM d, yyyy')}</span>
                                <span>🕒 {format(new Date(item.scheduled_for), 'h:mm a')}</span>
                                {item.posted_at && (
                                  <span>✅ Posted {formatRelativeDate(item.posted_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContent(item)}
                              disabled={deleteContentMutation.isPending}
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterPlatform !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'Create your first scheduled post to get started'
                  }
                </p>
                <Link href="/dashboard/content/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Content
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}