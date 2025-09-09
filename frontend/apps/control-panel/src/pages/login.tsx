import React from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

function Login() {
  const router = useRouter();

  // In demo mode, show a simple login form instead of redirecting
  const handleDemoLogin = () => {
    // In demo mode, just redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <Layout>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            🔐 Login
          </h1>
          <p style={{
            color: '#6b7280',
            margin: '0 0 24px 0',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            Control Panel - Demo Mode
          </p>
          <button
            onClick={handleDemoLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Enter Demo Mode
          </button>
        </div>
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

export default Login;