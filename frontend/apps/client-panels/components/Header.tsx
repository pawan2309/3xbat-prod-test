'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Mock user data for testing
  const user = {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    role: 'client',
    balance: 10000,
    isActive: true,
    code: 'TEST001',
    contactno: '1234567890',
    creditLimit: 50000,
    exposure: 2500
  }
  
  const liveBalance = 10000
  const exposure = 2500
  const isBalanceLoading = false

  // Set mounted state to prevent SSR execution
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)
    // For testing, just refresh the page
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // Don't render during SSR to prevent context errors
  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between h-[70px] border-b border-gray-200" style={{backgroundColor: '#1e3a8a'}}>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-600 rounded"></div>
          <span className="text-lg sm:text-xl font-bold text-white">Betting Panel</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-full"></div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between h-[70px] border-b border-gray-200" style={{backgroundColor: '#1e3a8a'}}>
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300 transition-colors p-2 -ml-1 active:bg-blue-800 rounded-md touch-manipulation"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors">
            <span className="text-lg sm:text-xl font-bold">Betting Panel</span>
          </Link>
        </div>

      {/* Right side - User Info and Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Balance Display - Hidden on very small screens */}
        <div className="text-white text-xs sm:text-sm hidden sm:block">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span>Balance:</span>
            <span className="font-semibold">
              {isBalanceLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `₹${liveBalance.toLocaleString()}`
              )}
            </span>
            {/* Manual refresh button */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="ml-1 sm:ml-2 p-1 text-blue-300 hover:text-white transition-colors"
              title="Refresh balance and exposure"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {exposure > 0 && (
            <div className="text-xs text-yellow-300">
              Exposure: ₹{exposure.toLocaleString()}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-gray-300 transition-colors p-1"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs sm:text-sm font-semibold">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="hidden sm:block text-sm sm:text-base">
              {user?.name || user?.username || 'User'}
            </span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link href="/profile" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </Link>
              <Link href="/change-password" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                Change Password
              </Link>
              <Link href="/ledger" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                Ledger
              </Link>
              <Link href="/myBets" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                My Bets
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Sidebar */}
    {isSidebarOpen && (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-full w-72 sm:w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2 active:bg-gray-100 rounded-md touch-manipulation"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">🏠</span>
                <span className="text-base font-medium">Dashboard</span>
              </Link>
              
              <Link 
                href="/cricket" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">🏏</span>
                <span className="text-base font-medium">Cricket</span>
              </Link>
              
              <Link 
                href="/casino" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">🎰</span>
                <span className="text-base font-medium">Live Casino</span>
              </Link>
              
              <Link 
                href="/myBets" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">🎯</span>
                <span className="text-base font-medium">My Bets</span>
              </Link>
              
              <Link 
                href="/ledger" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">📊</span>
                <span className="text-base font-medium">My Ledger</span>
              </Link>
              
              <Link 
                href="/profile" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">👤</span>
                <span className="text-base font-medium">Profile</span>
              </Link>
              
              <Link 
                href="/change-password" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">🔒</span>
                <span className="text-base font-medium">Change Password</span>
              </Link>
              
              <Link 
                href="/client-Statement" 
                className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors active:bg-blue-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-2xl">📋</span>
                <span className="text-base font-medium">Passbook</span>
              </Link>
            </nav>

            {/* User Info in Sidebar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base">
                    {user?.name || user?.username || 'User'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Balance: ₹{liveBalance.toLocaleString()}
                  </div>
                  {exposure > 0 && (
                    <div className="text-xs text-orange-600 font-medium">
                      Exposure: ₹{exposure.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}
