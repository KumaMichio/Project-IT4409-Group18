import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Course Platform',
  description: 'Hệ thống khóa học trực tuyến nhóm 18',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header đơn giản */}
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Online Course Platform
            </h1>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
