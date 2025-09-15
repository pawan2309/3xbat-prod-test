// Redirect to login page
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null;
}
