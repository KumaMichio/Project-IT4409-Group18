import 'antd/dist/reset.css';
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'LMS',
  description: 'Learning platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
