'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn, getPlatformColor, getPlatformIcon } from '@/lib/utils'
import { useSocialAccounts } from '@/hooks/useApi'
import { 
  Home,
  Zap, 
  Calendar,
  BarChart3,
  Users,
  Settings,
  PlusCircle,
  LogOut,
  X
} from 'lucide-react'

interface DashboardSidebarProps {
  onClose?: () => void
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Automations', href: '/dashboard/automations', icon: Zap },
  { name: 'Content Calendar', href: '/dashboard/content', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Social Accounts', href: '/dashboard/accounts', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { data: socialAccountsData } = useSocialAccounts()

  const socialAccounts = socialAccountsData?.accounts || []
  const connectedPlatforms = socialAccounts.map(account => account.platform)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Logout handles its own error display
    }
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg h-full">
      {/* Logo and Brand */}
      <div className="flex items-center justify-between h-16 bg-gradient-to-r from-blue-600 to-purple-600 px-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold text-lg">L</span>
          </div>
          <span className="text-white font-bold text-xl">LetsGrow</span>
        </div>
        
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose && onClose()}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Connected Platforms */}
      <div className="px-4 py-4">
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Connected Platforms
          </h3>
        </div>

        {socialAccounts.length > 0 ? (
          <div className="space-y-2">
            {socialAccounts.slice(0, 4).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={cn(
                    'w-6 h-6 rounded text-white text-xs flex items-center justify-center mr-2',
                    getPlatformColor(account.platform)
                  )}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-24">
                    @{account.username}
                  </span>
                </div>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  account.is_active ? 'bg-green-400' : 'bg-gray-400'
                )} />
              </div>
            ))}

            {socialAccounts.length > 4 && (
              <div className="text-xs text-gray-500 text-center">
                +{socialAccounts.length - 4} more accounts
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/dashboard/accounts"
            className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Connect Platform</span>
          </Link>
        )}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-semibold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.subscription_tier} plan
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}