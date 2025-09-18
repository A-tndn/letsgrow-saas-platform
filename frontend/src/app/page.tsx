'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Zap, 
  BarChart3, 
  Calendar, 
  Users, 
  Sparkles, 
  Shield,
  ArrowRight,
  CheckCircle,
  Settings,
  Database,
  User,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { setupApi } from '@/lib/api'
import toast from 'react-hot-toast'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content',
    description: 'Generate engaging content automatically with advanced AI that understands your brand voice.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Optimize posting times across platforms for maximum reach and engagement.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track performance with detailed insights and grow your audience strategically.'
  },
  {
    icon: Users,
    title: 'Multi-Platform',
    description: 'Manage Twitter, Instagram, LinkedIn, and Reddit from one unified dashboard.'
  },
  {
    icon: Zap,
    title: 'Automation Rules',
    description: 'Set up custom automation rules that work around the clock to grow your presence.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee for your peace of mind.'
  }
]

const benefits = [
  'Save 10+ hours per week on social media management',
  'Increase engagement rates by up to 300%',
  'Grow your follower count organically and consistently',
  'Maintain consistent brand voice across all platforms',
  'Get detailed insights to optimize your strategy'
]

export default function HomePage() {
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [showSetupCard, setShowSetupCard] = useState(false)

  // Check setup status on page load
  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await setupApi.getSetupStatus()
      setSetupStatus(response.status)
      setShowSetupCard(!response.status?.ready_for_testing)
    } catch (error) {
      console.log('Could not check setup status - this is normal for first time setup')
      setShowSetupCard(true)
    }
  }

  const handleSetupApp = async () => {
    setIsSettingUp(true)
    try {
      const response = await setupApi.initializeApp()
      
      if (response.success) {
        toast.success('App setup completed successfully!')
        setSetupStatus(response.details)
        setShowSetupCard(false)
        
        // Show success details
        if (response.details?.email && response.details?.password) {
          toast.success(`Test account ready: ${response.details.email} / ${response.details.password}`, {
            duration: 8000
          })
        }
      } else {
        toast.error('Setup failed: ' + response.error)
      }
    } catch (error) {
      toast.error('Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Grow Your Social Media
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Automatically
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Let AI create engaging content, schedule posts at optimal times, and grow your audience 
              while you focus on what matters most - your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-4">
                  View Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Setup Card - Only show if app needs setup */}
            {showSetupCard && (
              <div className="max-w-2xl mx-auto mb-8">
                <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-blue-900">App Setup Required</CardTitle>
                    <CardDescription className="text-blue-700">
                      Click the button below to initialize the database and create a test account for this remixed app.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={handleSetupApp}
                      disabled={isSettingUp}
                      size="lg"
                      className="text-lg px-8 py-4 mb-4"
                    >
                      {isSettingUp ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-5 w-5" />
                          Setup App (One-Click)
                        </>
                      )}
                    </Button>
                    
                    <div className="text-sm text-blue-600 space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>Creates database tables</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Creates test account (test@example.com / test123)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Setup Status Display */}
            {setupStatus && !showSetupCard && (
              <div className="max-w-xl mx-auto mb-8">
                <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">App Ready for Testing</h3>
                      <p className="text-green-700 text-sm">
                        Database: {setupStatus.database} • Test User: {setupStatus.test_user}
                      </p>
                      {setupStatus.email && (
                        <p className="text-green-600 text-sm mt-2">
                          Test account: <strong>{setupStatus.email}</strong>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                14-day free trial
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to dominate social media
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform handles the heavy lifting so you can focus on building relationships and growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Join thousands of creators who are already growing faster
          </h2>

          <div className="space-y-4 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center text-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-4">
              View Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">LetsGrow</h3>
          <p className="text-gray-400 mb-8">
            Social Media Automation Made Simple
          </p>
          <div className="text-sm text-gray-500">
            © 2025 LetsGrow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}