'use client';

import { useState } from 'react';
import { authService } from '../lib/auth';

export default function DebugLoginPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🧪 Starting login test...');
      
      // Test 1: Try to login
      addResult('📝 Testing login with testadmin/test123...');
      const loginResult = await authService.login('testadmin', 'test123');
      
      if (loginResult.success) {
        addResult('✅ Login successful!');
        addResult(`👤 User: ${loginResult.user?.username} (${loginResult.user?.role})`);
        addResult(`🔑 Token received: ${!!loginResult.token}`);
      } else {
        addResult(`❌ Login failed: ${loginResult.message}`);
        return;
      }

      // Test 2: Check session
      addResult('🔍 Testing session check...');
      const sessionResult = await authService.checkSession();
      
      if (sessionResult) {
        addResult('✅ Session check successful!');
        const user = authService.getUser();
        addResult(`👤 Current user: ${user?.username} (${user?.role})`);
      } else {
        addResult('❌ Session check failed');
      }

      // Test 3: Check authentication status
      addResult('🔐 Checking authentication status...');
      const isAuth = authService.isAuthenticated();
      addResult(`🔐 Is authenticated: ${isAuth}`);

    } catch (error) {
      addResult(`❌ Test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    try {
      addResult('🚪 Testing logout...');
      const logoutResult = await authService.logout();
      addResult(`✅ Logout result: ${logoutResult}`);
      
      const isAuth = authService.isAuthenticated();
      addResult(`🔐 Is authenticated after logout: ${isAuth}`);
      
      // Test session check after logout
      addResult('🔍 Testing session check after logout...');
      const sessionResult = await authService.checkSession();
      addResult(`🔍 Session check after logout: ${sessionResult}`);
      
      if (!sessionResult && !isAuth) {
        addResult('✅ Logout completed successfully - user is fully logged out!');
      } else {
        addResult('❌ Logout may not have worked completely');
      }
    } catch (error) {
      addResult(`❌ Logout error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Control Panel Login Debug
          </h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={testLogout}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-2"
            >
              Test Logout
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md ml-2"
            >
              Clear Results
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
            <div className="space-y-1">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet. Click "Test Login" to start.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Test Credentials:</h3>
            <p className="text-sm text-yellow-700">
              <strong>Username:</strong> testadmin<br/>
              <strong>Password:</strong> test123<br/>
              <strong>Role:</strong> ADMIN
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Make sure the backend server is running and the test user exists in the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
