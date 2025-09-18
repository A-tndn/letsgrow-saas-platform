'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSocialAccounts, useCreateAutomation, useGenerateContent, useGenerateHashtags } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Users,
  Hash,
  Play,
  Save
} from 'lucide-react'
import { getPlatformColor, getPlatformIcon } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const automationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'humorous', 'inspiring']),
  content_type: z.enum(['post', 'story', 'article', 'announcement', 'question', 'tip']),
  target_audience: z.string().optional(),
  schedule_type: z.enum(['daily', 'weekly', 'hourly']),
  schedule_interval: z.number().min(1).max(24),
  schedule_time: z.string(),
  auto_generate_hashtags: z.boolean(),
  max_hashtags: z.number().min(1).max(30),
})

type AutomationFormData = z.infer<typeof automationSchema>

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Name and description' },
  { id: 2, name: 'Platforms', description: 'Select social accounts' },
  { id: 3, name: 'Content', description: 'Content preferences' },
  { id: 4, name: 'Schedule', description: 'Posting schedule' },
  { id: 5, name: 'Review', description: 'Preview and create' },
]

const TONES = [
  { value: 'professional', label: 'Professional', description: 'Business-focused and formal' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'formal', label: 'Formal', description: 'Structured and official' },
  { value: 'humorous', label: 'Humorous', description: 'Light-hearted and fun' },
  { value: 'inspiring', label: 'Inspiring', description: 'Motivational and uplifting' },
]

const CONTENT_TYPES = [
  { value: 'post', label: 'Regular Post', description: 'Standard social media post' },
  { value: 'question', label: 'Question', description: 'Engage audience with questions' },
  { value: 'tip', label: 'Tip/Advice', description: 'Share helpful tips' },
  { value: 'announcement', label: 'Announcement', description: 'Important updates' },
  { value: 'article', label: 'Article', description: 'Longer form content' },
]

export default function AutomationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [previewContent, setPreviewContent] = useState<string>('')

  const { data: socialAccountsData } = useSocialAccounts()
  const createAutomationMutation = useCreateAutomation()
  const generateContentMutation = useGenerateContent()
  const generateHashtagsMutation = useGenerateHashtags()

  const socialAccounts = socialAccountsData?.accounts || []

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    mode: 'onChange',
    defaultValues: {
      platforms: [],
      tone: 'professional',
      content_type: 'post',
      schedule_type: 'daily',
      schedule_interval: 1,
      schedule_time: '09:00',
      auto_generate_hashtags: true,
      max_hashtags: 5,
    }
  })

  const watchedValues = watch()

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof AutomationFormData)[] => {
    switch (step) {
      case 1: return ['name']
      case 2: return ['platforms']
      case 3: return ['topic', 'tone', 'content_type']
      case 4: return ['schedule_type', 'schedule_interval', 'schedule_time']
      default: return []
    }
  }

  const generatePreview = async () => {
    if (!watchedValues.topic || !watchedValues.platforms?.[0]) return

    try {
      const result = await generateContentMutation.mutateAsync({
        topic: watchedValues.topic,
        platform: watchedValues.platforms[0],
        tone: watchedValues.tone,
        content_type: watchedValues.content_type,
        target_audience: watchedValues.target_audience,
      })

      if (result.success) {
        setPreviewContent(result.content || '')
      }
    } catch (error) {
      toast.error('Failed to generate preview')
    }
  }

  const onSubmit = async (data: AutomationFormData) => {
    try {
      await createAutomationMutation.mutateAsync({
        name: data.name,
        description: data.description,
        platforms: data.platforms,
        content_settings: {
          topic: data.topic,
          tone: data.tone,
          content_type: data.content_type,
          target_audience: data.target_audience || '',
          include_call_to_action: true,
        },
        posting_schedule: {
          type: data.schedule_type,
          interval: data.schedule_interval,
          time_of_day: data.schedule_time,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        hashtag_settings: {
          auto_generate: data.auto_generate_hashtags,
          max_hashtags: data.max_hashtags,
          preferred_hashtags: [],
          avoid_hashtags: [],
        },
      })

      router.push('/dashboard/automations')
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Give your automation a name and description</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Automation Name *"
                placeholder="e.g., Daily Tech Updates"
                error={errors.name?.message}
                {...register('name')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this automation will do..."
                  {...register('description')}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Platforms</h2>
              <p className="text-gray-600">Choose which social media platforms to post to</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialAccounts.map((account) => (
                <Controller
                  key={account.id}
                  name="platforms"
                  control={control}
                  render={({ field }) => (
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        field.value?.includes(account.platform) 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : ''
                      }`}
                      onClick={() => {
                        const currentPlatforms = field.value || []
                        const isSelected = currentPlatforms.includes(account.platform)

                        if (isSelected) {
                          field.onChange(currentPlatforms.filter(p => p !== account.platform))
                        } else {
                          field.onChange([...currentPlatforms, account.platform])
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getPlatformColor(account.platform)}`}>
                            {getPlatformIcon(account.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">@{account.username}</p>
                            <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                          </div>
                          {field.value?.includes(account.platform) && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                />
              ))}
            </div>

            {socialAccounts.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No social accounts connected</p>
                  <Link href="/dashboard/accounts">
                    <Button variant="outline">
                      Connect Social Account
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {errors.platforms && (
              <p className="text-red-500 text-sm">{errors.platforms.message}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Settings</h2>
              <p className="text-gray-600">Configure how your content will be generated</p>
            </div>

            <div className="space-y-6">
              <Input
                label="Content Topic *"
                placeholder="e.g., Latest technology trends, fitness tips, marketing strategies"
                error={errors.topic?.message}
                {...register('topic')}
                helperText="This is what your content will be about"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Tone *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TONES.map((tone) => (
                    <Controller
                      key={tone.value}
                      name="tone"
                      control={control}
                      render={({ field }) => (
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === tone.value 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : ''
                          }`}
                          onClick={() => field.onChange(tone.value)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{tone.label}</p>
                                <p className="text-sm text-gray-500">{tone.description}</p>
                              </div>
                              {field.value === tone.value && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONTENT_TYPES.map((type) => (
                    <Controller
                      key={type.value}
                      name="content_type"
                      control={control}
                      render={({ field }) => (
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === type.value 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : ''
                          }`}
                          onClick={() => field.onChange(type.value)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{type.label}</p>
                                <p className="text-sm text-gray-500">{type.description}</p>
                              </div>
                              {field.value === type.value && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    />
                  ))}
                </div>
              </div>

              <Input
                label="Target Audience (Optional)"
                placeholder="e.g., Small business owners, fitness enthusiasts, developers"
                {...register('target_audience')}
                helperText="Help AI create more targeted content"
              />

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Content Preview</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePreview}
                    loading={generateContentMutation.isPending}
                    disabled={!watchedValues.topic}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>

                {previewContent ? (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-700">{previewContent}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Generate a preview to see how your content will look
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Posting Schedule</h2>
              <p className="text-gray-600">Set when and how often to post</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Schedule Type *
                </label>
                <Controller
                  name="schedule_type"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'daily', label: 'Daily', description: 'Post every day' },
                        { value: 'weekly', label: 'Weekly', description: 'Post weekly' },
                        { value: 'hourly', label: 'Hourly', description: 'Post every few hours' }
                      ].map((schedule) => (
                        <Card 
                          key={schedule.value}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === schedule.value 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : ''
                          }`}
                          onClick={() => field.onChange(schedule.value)}
                        >
                          <CardContent className="p-4 text-center">
                            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="font-medium">{schedule.label}</p>
                            <p className="text-sm text-gray-500">{schedule.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {watchedValues.schedule_type === 'hourly' ? 'Every X Hours' : 'Interval'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={watchedValues.schedule_type === 'hourly' ? 24 : 7}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register('schedule_interval', { valueAsNumber: true })}
                  />
                  {errors.schedule_interval && (
                    <p className="text-red-500 text-sm mt-1">{errors.schedule_interval.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register('schedule_time')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Controller
                    name="auto_generate_hashtags"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="auto_hashtags"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="auto_hashtags" className="text-sm font-medium text-gray-700">
                    Auto-generate hashtags
                  </label>
                </div>

                {watchedValues.auto_generate_hashtags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Hashtags
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register('max_hashtags', { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
              <p className="text-gray-600">Review your automation settings before creating</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{watchedValues.name}</CardTitle>
                {watchedValues.description && (
                  <CardDescription>{watchedValues.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.platforms?.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Topic:</strong> {watchedValues.topic}</div>
                    <div><strong>Tone:</strong> {watchedValues.tone}</div>
                    <div><strong>Type:</strong> {watchedValues.content_type}</div>
                    <div><strong>Hashtags:</strong> {watchedValues.auto_generate_hashtags ? 'Auto-generated' : 'None'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                  <p className="text-sm">
                    {watchedValues.schedule_type} at {watchedValues.schedule_time}
                    {watchedValues.schedule_interval > 1 && ` (every ${watchedValues.schedule_interval} ${watchedValues.schedule_type === 'hourly' ? 'hours' : watchedValues.schedule_type})`}
                  </p>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/automations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Automations
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Automation</h1>
          <p className="text-gray-600">Set up automated posting for your social media accounts</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  loading={createAutomationMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Create & Start
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}