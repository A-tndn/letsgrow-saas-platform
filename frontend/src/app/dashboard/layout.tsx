'use client'

import { ReactNode, useState } from 'react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // AUTHENTICATION REMOVED FOR TESTING - All dashboard pages are now accessible without login
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <DashboardSidebar onClose={closeMobileMenu} />
          </div>
        </>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader onToggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="px-4 py-6 lg:px-6 lg:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}