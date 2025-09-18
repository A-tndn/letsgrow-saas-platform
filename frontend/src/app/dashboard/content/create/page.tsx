'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  useGenerateContent, 
  useGenerateHashtags, 
  useScheduleContent, 
  useSocialAccounts 
} from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft, 
  Sparkles, 
  Hash,
  Calendar,
  Clock,
  Send,
  Save,
  RefreshCw,
  Copy,
  Eye,
  Plus,
  X
} from 'lucide-react'
import { getPlatformColor, getPlatformIcon, cn } from '@/lib/utils'
import Link from 'next/link'
import { format, addDays, addHours } from 'date-fns'
import toast from 'react-hot-toast'

const contentSchema = z.object({
  social_account_id: z.number().min(1, 'Please select a social account'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  scheduled_for: z.string().min(1, 'Please select a date and time'),
  hashtags: z.array(z.string()).optional(),
  media_urls: z.array(z.string()).optional(),
})

type ContentFormData = z.infer<typeof contentSchema>

const QUICK_SCHEDULE_OPTIONS = [
  { label: 'Now', value: 'now' },
  { label: 'In 1 hour', value: '1hour' },
  { label: 'In 3 hours', value: '3hours' },
  { label: 'Tomorrow 9 AM', value: 'tomorrow' },
  { label: 'Custom', value: 'custom' },
]

const CONTENT_SUGGESTIONS = [
  { 
    topic: 'Technology trends', 
    tone: 'professional',
    example: 'Share insights about the latest tech innovations'
  },
  { 
    topic: 'Motivational quote', 
    tone: 'inspiring',
    example: 'Inspire your audience with an uplifting message'
  },
  { 
    topic: 'Industry tip', 
    tone: 'helpful',
    example: 'Share a valuable tip from your expertise'
  },
  { 
    topic: 'Behind the scenes', 
    tone: 'casual',
    example: 'Give a glimpse into your daily work process'
  },
  { 
    topic: 'Question for audience', 
    tone: 'engaging',
    example: 'Ask your followers an engaging question'
  },
]

export default function CreateContentPage() {
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [aiTopic, setAiTopic] = useState('')
  const [aiTone, setAiTone] = useState('professional')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([])
  const [customHashtag, setCustomHashtag] = useState('')
  const [scheduleOption, setScheduleOption] = useState('custom')
  const [previewMode, setPreviewMode] = useState(false)

  const { data: socialAccountsData } = useSocialAccounts()
  const generateContentMutation = useGenerateContent()
  const generateHashtagsMutation = useGenerateHashtags()
  const scheduleContentMutation = useScheduleContent()

  const socialAccounts = socialAccountsData?.accounts || []

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      hashtags: [],
      media_urls: [],
    }
  })

  const watchedValues = watch()
  const selectedAccount = socialAccounts.find(acc => acc.id === watchedValues.social_account_id)

  // Auto-select platform when account changes
  useEffect(() => {
    if (selectedAccount) {
      setSelectedPlatform(selectedAccount.platform)
    }
  }, [selectedAccount])

  // Update schedule field when quick option changes
  useEffect(() => {
    const now = new Date()
    let scheduledDate: Date

    switch (scheduleOption) {
      case 'now':
        scheduledDate = addMinutes(now, 1)
        break
      case '1hour':
        scheduledDate = addHours(now, 1)
        break
      case '3hours':
        scheduledDate = addHours(now, 3)
        break
      case 'tomorrow':
        scheduledDate = addDays(now, 1)
        scheduledDate.setHours(9, 0, 0, 0)
        break
      default:
        return
    }

    setValue('scheduled_for', format(scheduledDate, "yyyy-MM-dd'T'HH:mm"))
  }, [scheduleOption, setValue])

  const generateAIContent = async () => {
    if (!aiTopic.trim() || !selectedPlatform) {
      toast.error('Please enter a topic and select an account')
      return
    }

    try {
      const result = await generateContentMutation.mutateAsync({
        topic: aiTopic,
        platform: selectedPlatform,
        tone: aiTone,
        content_type: 'post',
      })

      if (result.success) {
        setGeneratedContent(result.content || '')
        setValue('content', result.content || '')

        if (result.hashtags) {
          setGeneratedHashtags(result.hashtags)
          setValue('hashtags', result.hashtags)
        }

        toast.success('Content generated successfully!')
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  const generateHashtags = async () => {
    if (!aiTopic.trim() || !selectedPlatform) {
      toast.error('Please enter a topic and select an account')
      return
    }

    try {
      const result = await generateHashtagsMutation.mutateAsync({
        topic: aiTopic,
        platform: selectedPlatform,
        count: 8,
      })

      setGeneratedHashtags(result.hashtags)
      setValue('hashtags', result.hashtags)
      toast.success('Hashtags generated!')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const addCustomHashtag = () => {
    if (!customHashtag.trim()) return

    const hashtag = customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`
    const currentHashtags = watchedValues.hashtags || []

    if (!currentHashtags.includes(hashtag)) {
      const newHashtags = [...currentHashtags, hashtag]
      setValue('hashtags', newHashtags)
      setCustomHashtag('')
    }
  }

  const removeHashtag = (hashtagToRemove: string) => {
    const currentHashtags = watchedValues.hashtags || []
    const newHashtags = currentHashtags.filter(tag => tag !== hashtagToRemove)
    setValue('hashtags', newHashtags)
  }

  const copyContent = () => {
    if (watchedValues.content) {
      navigator.clipboard.writeText(watchedValues.content)
      toast.success('Content copied to clipboard!')
    }
  }

  const useSuggestion = (suggestion: typeof CONTENT_SUGGESTIONS[0]) => {
    setAiTopic(suggestion.topic)
    setAiTone(suggestion.tone)
  }

  const onSubmit = async (data: ContentFormData) => {
    try {
      await scheduleContentMutation.mutateAsync({
        social_account_id: data.social_account_id,
        content: data.content,
        hashtags: data.hashtags || [],
        media_urls: data.media_urls || [],
        scheduled_for: data.scheduled_for,
      })

      router.push('/dashboard/content')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getCharacterCount = () => {
    const content = watchedValues.content || ''
    const hashtags = (watchedValues.hashtags || []).join(' ')
    return content.length + (hashtags ? hashtags.length + 1 : 0)
  }

  const getCharacterLimit = () => {
    switch (selectedPlatform) {
      case 'twitter': return 280
      case 'linkedin': return 1300
      case 'instagram': return 2200
      default: return 1000
    }
  }

  const isOverLimit = () => getCharacterCount() > getCharacterLimit()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/content">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
          <p className="text-gray-600">Schedule a new post for your social media accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Generate content with AI or use suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Topic
                </label>
                <Input
                  placeholder="e.g., latest tech trends, fitness tips..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspiring">Inspiring</option>
                </select>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={generateAIContent}
                  loading={generateContentMutation.isPending}
                  disabled={!aiTopic.trim() || !selectedPlatform}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateHashtags}
                  loading={generateHashtagsMutation.isPending}
                  disabled={!aiTopic.trim() || !selectedPlatform}
                  className="w-full"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Generate Hashtags
                </Button>
              </div>

              {/* Content Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Suggestions
                </label>
                <div className="space-y-2">
                  {CONTENT_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => useSuggestion(suggestion)}
                      className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <p className="font-medium text-gray-900">{suggestion.topic}</p>
                      <p className="text-gray-600 text-xs">{suggestion.example}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Social Account Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Account</CardTitle>
                <CardDescription>
                  Choose which social media account to post to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="social_account_id"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {socialAccounts.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => field.onChange(account.id)}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                            field.value === account.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                              getPlatformColor(account.platform)
                            )}>
                              {getPlatformIcon(account.platform)}
                            </div>
                            <div>
                              <p className="font-medium">@{account.username}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {account.platform}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {errors.social_account_id && (
                  <p className="text-red-500 text-sm mt-2">{errors.social_account_id.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Content Input */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content</CardTitle>
                    <CardDescription>
                      Write your post content
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyContent}
                      disabled={!watchedValues.content}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <textarea
                      {...register('content')}
                      rows={6}
                      placeholder="What's happening? Share your thoughts..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                    )}
                  </div>

                  {/* Character count */}
                  <div className="flex justify-between items-center text-sm">
                    <div className={cn(
                      'font-medium',
                      isOverLimit() ? 'text-red-500' : 'text-gray-500'
                    )}>
                      {getCharacterCount()} / {getCharacterLimit()} characters
                    </div>
                    {selectedPlatform && (
                      <Badge variant="secondary" size="sm" className="capitalize">
                        {selectedPlatform}
                      </Badge>
                    )}
                  </div>

                  {/* Preview */}
                  {previewMode && watchedValues.content && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={cn(
                          'w-6 h-6 rounded flex items-center justify-center text-white text-xs',
                          getPlatformColor(selectedPlatform)
                        )}>
                          {getPlatformIcon(selectedPlatform)}
                        </div>
                        <span className="font-medium text-sm">@{selectedAccount?.username}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{watchedValues.content}</p>
                      {watchedValues.hashtags && watchedValues.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {watchedValues.hashtags.map(tag => (
                            <Badge key={tag} variant="secondary" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Hashtags
                </CardTitle>
                <CardDescription>
                  Add hashtags to increase discoverability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Hashtags */}
                  {watchedValues.hashtags && watchedValues.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.hashtags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(tag)}
                            className="ml-1 hover:bg-gray-300 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Hashtag */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add custom hashtag..."
                      value={customHashtag}
                      onChange={(e) => setCustomHashtag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHashtag())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomHashtag}
                      disabled={!customHashtag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule
                </CardTitle>
                <CardDescription>
                  Choose when to publish this content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Quick Schedule Options */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {QUICK_SCHEDULE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setScheduleOption(option.value)}
                        className={cn(
                          'p-2 text-sm border rounded-lg transition-colors',
                          scheduleOption === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date/Time */}
                  {scheduleOption === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          {...register('scheduled_for')}
                          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.scheduled_for && (
                          <p className="text-red-500 text-sm mt-1">{errors.scheduled_for.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
              >
                Reset
              </Button>

              <Button
                type="submit"
                loading={scheduleContentMutation.isPending}
                disabled={!isValid || isOverLimit()}
              >
                <Send className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}