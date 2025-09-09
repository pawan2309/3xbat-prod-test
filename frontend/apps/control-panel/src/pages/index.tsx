import React from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

function Home() {
  const router = useRouter();

  // Redirect to dashboard
  React.useEffect(() => {
    router.push('/dashboard');
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
        Redirecting to Dashboard...
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