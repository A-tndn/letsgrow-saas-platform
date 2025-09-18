'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  Brain,
  Rocket,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PREDEFINED_NICHES = [
  {
    id: 'tech',
    name: 'Technology & Software',
    description: 'Tech trends, software development, AI, startups',
    color: 'bg-blue-500',
    icon: '💻',
    examples: ['AI developments', 'Product launches', 'Tech tutorials'],
    audience: '500K+ tech professionals'
  },
  {
    id: 'business',
    name: 'Business & Entrepreneurship', 
    description: 'Business tips, entrepreneurship, marketing, sales',
    color: 'bg-green-500',
    icon: '💼',
    examples: ['Business strategies', 'Success stories', 'Market insights'],
    audience: '300K+ business owners'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Workout routines, nutrition, wellness, mental health',
    color: 'bg-red-500', 
    icon: '🏃',
    examples: ['Workout tips', 'Nutrition advice', 'Wellness content'],
    audience: '800K+ health enthusiasts'
  },
  {
    id: 'finance',
    name: 'Finance & Investing',
    description: 'Personal finance, investing, crypto, wealth building',
    color: 'bg-yellow-500',
    icon: '💰',
    examples: ['Investment tips', 'Market analysis', 'Financial advice'],
    audience: '400K+ investors'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Travel',
    description: 'Travel, food, fashion, lifestyle tips, experiences',
    color: 'bg-purple-500',
    icon: '✈️',
    examples: ['Travel guides', 'Lifestyle tips', 'Cultural content'],
    audience: '600K+ lifestyle enthusiasts'
  },
  {
    id: 'education',
    name: 'Education & Learning',
    description: 'Online learning, skills, tutorials, knowledge sharing',
    color: 'bg-indigo-500',
    icon: '📚',
    examples: ['Learning resources', 'Skill tutorials', 'Educational content'],
    audience: '350K+ learners'
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Art, design, creativity, digital creation, inspiration',
    color: 'bg-pink-500',
    icon: '🎨',
    examples: ['Design showcases', 'Creative processes', 'Art inspiration'],
    audience: '450K+ creators'
  },
  {
    id: 'food',
    name: 'Food & Cooking',
    description: 'Recipes, cooking tips, food reviews, culinary arts',
    color: 'bg-orange-500',
    icon: '🍳',
    examples: ['Recipe sharing', 'Cooking tips', 'Food reviews'],
    audience: '700K+ food lovers'
  }
]

const GROWTH_GOALS = [
  { 
    id: 'followers', 
    name: 'Grow Followers',
    description: 'Focus on building a large, engaged audience',
    icon: Users,
    metrics: ['Follower count', 'Reach', 'Profile visits']
  },
  { 
    id: 'engagement', 
    name: 'Increase Engagement',
    description: 'Maximize likes, comments, shares and interactions',
    icon: TrendingUp,
    metrics: ['Engagement rate', 'Comments', 'Shares']
  },
  { 
    id: 'brand', 
    name: 'Build Brand Awareness',
    description: 'Establish thought leadership and brand recognition',
    icon: Sparkles,
    metrics: ['Brand mentions', 'Impressions', 'Authority score']
  },
  { 
    id: 'leads', 
    name: 'Generate Leads',
    description: 'Drive traffic and convert followers to customers',
    icon: Target,
    metrics: ['Click-through rate', 'Conversions', 'Lead generation']
  }
]

const onboardingSchema = z.object({
  niche: z.string().min(1, 'Please select a niche'),
  custom_niche: z.string().optional(),
  goals: z.array(z.string()).min(1, 'Select at least one growth goal'),
  target_audience: z.string().min(5, 'Describe your target audience'),
  current_followers: z.string(),
  growth_timeline: z.string(),
  content_preferences: z.object({
    tone: z.string(),
    post_frequency: z.string(),
    include_media: z.boolean(),
    include_hashtags: z.boolean()
  }),
  competitor_accounts: z.array(z.string()).optional()
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function NicheOnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNiche, setSelectedNiche] = useState<typeof PREDEFINED_NICHES[0] | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [strategyPreview, setStrategyPreview] = useState<any>(null)

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      goals: [],
      content_preferences: {
        tone: 'professional',
        post_frequency: 'daily',
        include_media: true,
        include_hashtags: true
      },
      competitor_accounts: []
    }
  })

  const watchedValues = watch()

  const STEPS = [
    { id: 1, name: 'Select Niche', description: 'Choose your content focus area' },
    { id: 2, name: 'Set Goals', description: 'Define your growth objectives' }, 
    { id: 3, name: 'Target Audience', description: 'Describe your ideal followers' },
    { id: 4, name: 'Content Preferences', description: 'Set your content style' },
    { id: 5, name: 'Strategy Preview', description: 'Review your growth plan' },
  ]

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid && currentStep < STEPS.length) {
      if (currentStep === 4) {
        // Generate strategy preview before final step
        await generateStrategy()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1: return ['niche']
      case 2: return ['goals']
      case 3: return ['target_audience', 'current_followers']
      case 4: return ['content_preferences']
      default: return []
    }
  }

  const generateStrategy = async () => {
    setIsAnalyzing(true)

    // Simulate AI strategy generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const strategy = {
      posting_schedule: {
        frequency: watchedValues.content_preferences.post_frequency,
        optimal_times: ['9:00 AM', '1:00 PM', '6:00 PM'],
        platforms: ['twitter', 'linkedin']
      },
      content_themes: [
        `${selectedNiche?.name} industry insights`,
        'Practical tips and tutorials',
        'Behind-the-scenes content',
        'Community engagement posts'
      ],
      growth_tactics: [
        'Engage with top performers in niche',
        'Use trending hashtags strategically', 
        'Cross-promote with similar accounts',
        'Share user-generated content'
      ],
      expected_results: {
        followers_30d: '+150-300 followers',
        engagement_rate: '4.2-6.8%',
        content_reach: '5K-15K impressions/post'
      }
    }

    setStrategyPreview(strategy)
    setIsAnalyzing(false)
  }

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // Save onboarding data and redirect to dashboard
      console.log('Onboarding completed:', data)
      router.push('/dashboard?onboarded=true')
    } catch (error) {
      console.error('Onboarding error:', error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Niche</h2>
              <p className="text-gray-600">
                Select the area you want to focus on. Our AI will research trends and optimize your strategy.
              </p>
            </div>

            <Controller
              name="niche"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PREDEFINED_NICHES.map((niche) => (
                    <Card
                      key={niche.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-lg',
                        field.value === niche.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      )}
                      onClick={() => {
                        field.onChange(niche.id)
                        setSelectedNiche(niche)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{niche.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{niche.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{niche.description}</p>
                            <div className="mt-3 space-y-2">
                              <div className="text-xs text-gray-500">Popular content:</div>
                              <div className="flex flex-wrap gap-1">
                                {niche.examples.map((example, idx) => (
                                  <Badge key={idx} variant="secondary" size="sm">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {niche.audience}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            />

            <div>
              <Input
                label="Custom Niche (Optional)"
                placeholder="Or describe your specific niche..."
                {...register('custom_niche')}
              />
            </div>

            {errors.niche && (
              <p className="text-red-500 text-sm">{errors.niche.message}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Growth Goals</h2>
              <p className="text-gray-600">
                What do you want to achieve? Select all that apply.
              </p>
            </div>

            <Controller
              name="goals"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GROWTH_GOALS.map((goal) => {
                    const isSelected = field.value?.includes(goal.id)
                    return (
                      <Card
                        key={goal.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          isSelected
                            ? 'ring-2 ring-green-500 bg-green-50'
                            : ''
                        )}
                        onClick={() => {
                          const currentGoals = field.value || []
                          if (isSelected) {
                            field.onChange(currentGoals.filter(g => g !== goal.id))
                          } else {
                            field.onChange([...currentGoals, goal.id])
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <goal.icon className="h-6 w-6 text-green-500 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">Key metrics:</div>
                                <div className="flex flex-wrap gap-1">
                                  {goal.metrics.map((metric, idx) => (
                                    <Badge key={idx} variant="outline" size="sm">
                                      {metric}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            />

            {errors.goals && (
              <p className="text-red-500 text-sm">{errors.goals.message}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-purple-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Define Your Audience</h2>
              <p className="text-gray-600">
                Help us understand who you want to reach and your current status.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Target Audience *
                </label>
                <textarea
                  {...register('target_audience')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech entrepreneurs aged 25-40 who are interested in AI and startup growth strategies..."
                />
                {errors.target_audience && (
                  <p className="text-red-500 text-sm mt-1">{errors.target_audience.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Follower Count
                  </label>
                  <select
                    {...register('current_followers')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="0-100">0 - 100 followers</option>
                    <option value="100-500">100 - 500 followers</option>
                    <option value="500-1000">500 - 1,000 followers</option>
                    <option value="1000-5000">1,000 - 5,000 followers</option>
                    <option value="5000-10000">5,000 - 10,000 followers</option>
                    <option value="10000+">10,000+ followers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Timeline
                  </label>
                  <select
                    {...register('growth_timeline')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="1month">1 month</option>
                    <option value="3months">3 months</option>
                    <option value="6months">6 months</option>
                    <option value="1year">1 year</option>
                    <option value="ongoing">Ongoing growth</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Preferences</h2>
              <p className="text-gray-600">
                Customize how our AI will create and schedule your content.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Content Tone
                  </label>
                  <Controller
                    name="content_preferences.tone"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {[
                          { value: 'professional', label: 'Professional', desc: 'Business-focused and formal' },
                          { value: 'casual', label: 'Casual', desc: 'Relaxed and conversational' },
                          { value: 'inspiring', label: 'Inspiring', desc: 'Motivational and uplifting' },
                          { value: 'humorous', label: 'Humorous', desc: 'Light-hearted and fun' }
                        ].map(tone => (
                          <label key={tone.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              value={tone.value}
                              checked={field.value === tone.value}
                              onChange={() => field.onChange(tone.value)}
                              className="text-blue-600"
                            />
                            <div>
                              <p className="font-medium">{tone.label}</p>
                              <p className="text-sm text-gray-600">{tone.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Posting Frequency
                  </label>
                  <Controller
                    name="content_preferences.post_frequency"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="twice-daily">Twice daily</option>
                        <option value="daily">Daily</option>
                        <option value="every-other-day">Every other day</option>
                        <option value="3-times-week">3 times per week</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Content Features</h4>

                <div className="space-y-3">
                  <Controller
                    name="content_preferences.include_media"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-medium">Include Images & Media</p>
                          <p className="text-sm text-gray-600">Add relevant images to posts for better engagement</p>
                        </div>
                      </label>
                    )}
                  />

                  <Controller
                    name="content_preferences.include_hashtags"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-medium">Auto-generate Hashtags</p>
                          <p className="text-sm text-gray-600">Include trending hashtags optimized for your niche</p>
                        </div>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Rocket className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Growth Strategy</h2>
              <p className="text-gray-600">
                Based on your inputs, here's your personalized growth plan.
              </p>
            </div>

            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Our AI is analyzing your niche and generating your strategy...</p>
              </div>
            ) : strategyPreview ? (
              <div className="space-y-6">
                {/* Strategy Overview */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Strategy Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {strategyPreview.expected_results.followers_30d}
                        </div>
                        <div className="text-sm text-gray-600">Expected Growth (30 days)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {strategyPreview.expected_results.engagement_rate}
                        </div>
                        <div className="text-sm text-gray-600">Target Engagement Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {strategyPreview.expected_results.content_reach}
                        </div>
                        <div className="text-sm text-gray-600">Average Post Reach</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                        Posting Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Frequency:</span> {strategyPreview.posting_schedule.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Optimal Times:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {strategyPreview.posting_schedule.optimal_times.map((time: string, idx: number) => (
                              <Badge key={idx} variant="secondary" size="sm">{time}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                        Content Themes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {strategyPreview.content_themes.map((theme: string, idx: number) => (
                          <div key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {theme}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Growth Tactics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {strategyPreview.growth_tactics.map((tactic: string, idx: number) => (
                        <div key={idx} className="flex items-start text-sm">
                          <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                          {tactic}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Let's Set Up Your Growth Strategy</h1>
              <p className="text-gray-600 mt-2">
                Our AI will create a personalized plan to grow your social media presence organically.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  )}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'mx-4 h-px flex-1',
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="shadow-xl">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Growing My Account
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}