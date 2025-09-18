'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 Login page: Checking existing session...');
        const sessionData = await authService.getSessionData();
        console.log('🔍 Login page: Session check result:', sessionData);
        
        if (sessionData.success && sessionData.user) {
          console.log('🔍 Login page: User already authenticated, redirecting to dashboard');
          router.push('/');
          return;
        }
      } catch (error) {
        console.log('🔍 Login page: Session check failed:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', formData.username);
      const data = await authService.login(formData.username, formData.password);
      console.log('🔐 Login response:', data);

      if (data.success) {
        console.log('✅ Login successful, user:', data.user);
        console.log('🔐 Token received:', data.token ? 'Yes' : 'No');
        console.log('🔐 Navigation data:', data.navigation);
        console.log('🔐 Redirect info:', data.redirectInfo);
        
        // Check if user should be redirected to a different domain (production only)
        if (data.redirectInfo?.shouldRedirect && process.env.NODE_ENV === 'production') {
          console.log('🔄 Redirecting to production domain:', data.redirectInfo.targetDomain);
          window.location.href = `https://${data.redirectInfo.targetDomain}`;
          return;
        }

        // Use window.location.href for a full page reload to ensure cookies are set
        console.log('🔄 Redirecting to dashboard...');
        // Add a small delay to ensure cookies are properly set
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/images/3x.PNG"
                alt="3XBAT Logo"
                className="w-full h-full object-cover"
                style={{borderRadius: '50%'}}
              />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            <span className="text-2xl sm:text-3xl">3xBAT Gaming</span>
          </h1>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
            Sign In To Start Your Session
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full py-3 sm:py-3 pl-10 sm:pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={{ minHeight: '44px' }}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full py-3 sm:py-3 pl-10 sm:pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{ minHeight: '44px' }}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                style={{ minWidth: '16px', minHeight: '16px' }}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember Me
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ minHeight: '44px' }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
