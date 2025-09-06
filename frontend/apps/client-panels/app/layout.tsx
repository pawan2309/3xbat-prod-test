import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0">
        <ProtectedRoute>
          <div className="min-h-screen bg-white flex flex-col h-full">
            <Header />
            <main className="pt-[70px] flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </ProtectedRoute>
      </body>
    </html>
  );
}
