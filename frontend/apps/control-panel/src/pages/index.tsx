import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { authService } from "../lib/auth";

function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const isAuthenticated = await authService.checkSession();
        
        if (isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <Layout>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        {isChecking ? 'Checking authentication...' : 'Redirecting...'}
      </div>
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default Home;