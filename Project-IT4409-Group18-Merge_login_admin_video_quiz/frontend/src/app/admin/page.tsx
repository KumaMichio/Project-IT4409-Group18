'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to system management page
    const token = getToken();
    const user = getUser();

    if (!token || !user || user.role !== 'admin') {
      router.replace('/auth/login');
      return;
    }

    // Redirect to system management page
    router.replace('/admin/system');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}


