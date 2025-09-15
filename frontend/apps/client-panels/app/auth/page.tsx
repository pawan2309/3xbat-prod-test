// Redirect to login page
import { redirect } from 'next/navigation';

export default function AuthPage() {
  redirect('/login');
}
