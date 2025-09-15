// Simple test script to create a test user and verify login
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: { username: 'testadmin' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.username);
      return existingUser;
    }

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: 'testadmin',
        password: 'test123', // Plain text password for testing
        name: 'Test Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        limit: 10000,
        contactno: '1234567890',
        userCommissionShare: {
          create: {
            share: 100,
            available_share_percent: 100,
            cshare: 0,
            session_commission_type: 'PERCENTAGE',
            matchcommission: 0,
            sessioncommission: 0,
            casinocommission: 0,
            commissionType: 'PERCENTAGE'
          }
        }
      },
      include: {
        userCommissionShare: true
      }
    });

    console.log('✅ Test user created successfully:', testUser.username);
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Create test user
    const user = await createTestUser();
    
    // Test login API
    const response = await fetch('http://localhost:4000/api/auth/unified-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'testadmin',
        password: 'test123'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login test successful!');
      console.log('User:', data.user.username, 'Role:', data.user.role);
      console.log('Token received:', !!data.token);
    } else {
      console.log('❌ Login test failed:', data.message);
    }

    // Test session check
    const sessionResponse = await fetch('http://localhost:4000/api/auth/unified-session-check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': response.headers.get('set-cookie') || ''
      }
    });

    const sessionData = await sessionResponse.json();
    
    if (sessionData.success && sessionData.valid) {
      console.log('✅ Session check successful!');
    } else {
      console.log('❌ Session check failed:', sessionData.message);
    }

    // Test logout
    console.log('🚪 Testing logout...');
    const logoutResponse = await fetch('http://localhost:4000/api/auth/unified-logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cookie': response.headers.get('set-cookie') || ''
      }
    });

    const logoutData = await logoutResponse.json();
    
    if (logoutData.success) {
      console.log('✅ Logout successful!');
    } else {
      console.log('❌ Logout failed:', logoutData.message);
    }

    // Test session check after logout
    console.log('🔍 Testing session check after logout...');
    const postLogoutSessionResponse = await fetch('http://localhost:4000/api/auth/unified-session-check', {
      method: 'GET',
      credentials: 'include'
    });

    const postLogoutSessionData = await postLogoutSessionResponse.json();
    
    if (!postLogoutSessionData.success || !postLogoutSessionData.valid) {
      console.log('✅ Session properly invalidated after logout!');
    } else {
      console.log('❌ Session still valid after logout - this is a problem!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testLogin();
