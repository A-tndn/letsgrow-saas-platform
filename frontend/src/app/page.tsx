import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  Loader2,
  Menu,
  X
} from 'lucide-react'
import { setupApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
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
  'Grow your following 5x faster with AI optimization',
  'Automated compliance with platform guidelines',
  'Real-time analytics and performance tracking',
  'Multi-team collaboration and workflow management'
]

interface SetupStatus {
  database: string;
  test_user: string;
  total_users: number;
  ready_for_testing: boolean;
}

// Navigation Component
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              LetsGrow
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-600 px-3 py-2 text-sm">
                    Welcome, {user?.first_name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-600 block px-3 py-2 text-base">
                    Welcome, {user?.first_name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default function HomePage() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)

  const checkSetupStatus = async () => {
    try {
      const status = await setupApi.getSetupStatus()
      setSetupStatus(status)
    } catch (error) {
      console.error('Failed to check setup status:', error)
      toast.error('Failed to check system status')
    }
  }

  const initializeApp = async () => {
    setIsInitializing(true)
    try {
      const result = await setupApi.initializeApp()
      toast.success(result.message)
      await checkSetupStatus()
    } catch (error: any) {
      toast.error(error.message || 'Initialization failed')
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    checkSetupStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Grow Your Social Media</span>
              <span className="block text-indigo-600">Automatically with AI</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The world's first dual-approach social media growth platform. Let AI handle everything automatically, or get data-driven insights for your own content.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button
                  onClick={() => setShowDevPanel(!showDevPanel)}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Developer Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Panel */}
      {showDevPanel && (
        <div className="bg-gray-100 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Status & Setup
                </h3>
                <button
                  onClick={() => setShowDevPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className={`text-sm ${setupStatus?.database === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {setupStatus?.database || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <User className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Test User</p>
                    <p className={`text-sm ${setupStatus?.test_user === 'Exists' ? 'text-green-600' : 'text-red-600'}`}>
                      {setupStatus?.test_user || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Users</p>
                    <p className="text-sm text-gray-600">
                      {setupStatus?.total_users ?? 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className={`h-5 w-5 mr-2 ${setupStatus?.ready_for_testing ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${setupStatus?.ready_for_testing ? 'text-green-700' : 'text-red-700'}`}>
                    {setupStatus?.ready_for_testing ? 'Ready for Testing' : 'Setup Required'}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={checkSetupStatus}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Refresh Status
                  </button>

                  <button
                    onClick={initializeApp}
                    disabled={isInitializing}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Initializing...
                      </>
                    ) : (
                      'Initialize App'
                    )}
                  </button>
                </div>
              </div>

              {setupStatus?.ready_for_testing && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    <strong>Test Account:</strong> test@example.com / test123
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center mt-2 text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    Sign in with test account →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to dominate social media
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-200 font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Transform your social media results
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-indigo-200 mr-3" />
                  <span className="text-lg text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:text-center">
            <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ready to grow your social media automatically?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Join thousands of creators and businesses who are already growing faster with LetsGrow.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2025 LetsGrow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
