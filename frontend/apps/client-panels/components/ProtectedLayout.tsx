'use client';

import ProtectedRoute from './ProtectedRoute';
import Header from './Header';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-[70px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
