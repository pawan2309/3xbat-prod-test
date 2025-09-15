import ProtectedRoute from '../components/ProtectedRoute';
import Header from '@/components/Header';
import './globals.css';
import '../styles/casino.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0">
        {children}
      </body>
    </html>
  );
}
