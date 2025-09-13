import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard-new');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#6b7280',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>
        <h1>Dashboard Loading...</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}