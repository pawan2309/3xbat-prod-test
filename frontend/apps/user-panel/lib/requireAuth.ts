// Authentication wrapper for pages
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { authService } from './auth';

export interface AuthUser {
  id: string;
  username: string;
  name: string | null;
  role: string;
  status: string;
  limit: number;
  contactno: string | null;
  userCommissionShare: any;
}

export interface AuthProps {
  user: AuthUser;
}

export function requireAuth(handler: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    const { req } = context;
    
    // Check for session cookie
    const sessionCookie = req.cookies.betx_session;
    
    if (!sessionCookie) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    try {
      // Verify session with backend
      const response = await fetch('http://localhost:5000/api/auth/unified-session-check', {
        method: 'GET',
        headers: {
          'Cookie': `betx_session=${sessionCookie}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success || !data.valid || !data.user) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      // Add user to props
      const result = await handler(context);
      
      if ('props' in result) {
        return {
          ...result,
          props: {
            ...result.props,
            user: data.user,
          },
        };
      }

      return result;
    } catch (error) {
      console.error('Auth verification error:', error);
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  };
}
