'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData.username, formData.password);
      
      console.log('Login response:', data); // Debug log

      if (data.success) {
        console.log('Login successful, redirecting...'); // Debug log
        console.log('User data:', data.user); // Debug log
        console.log('Token received:', !!data.token); // Debug log
        
        // Check if user should be redirected to a different domain (production only)
        if (data.redirectInfo?.shouldRedirect && process.env.NODE_ENV === 'production') {
          window.location.href = `https://${data.redirectInfo.targetDomain}`;
          return;
        }

        // Check for redirect path stored before login
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          console.log('Redirecting to stored path:', redirectPath);
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 500);
        } else {
          // Redirect to root page with a longer delay to ensure cookie is set
          console.log('Setting timeout for redirect...'); // Debug log
          setTimeout(() => {
            console.log('Executing redirect to root page...'); // Debug log
            // Use window.location.href to force a full page reload
            window.location.href = '/';
          }, 500);
        }
      } else {
        console.log('Login failed:', data.message); // Debug log
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center sm:justify-start py-4 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: 'url(/7282469.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white/80 backdrop-blur-md rounded-lg p-4 sm:p-6 lg:p-8 shadow-2xl mx-4 sm:ml-8 sm:mr-0">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Client Panel Login
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            Sign in to your client account
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
