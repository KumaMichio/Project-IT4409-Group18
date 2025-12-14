'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { LoadingOutlined } from '@ant-design/icons';

export default function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // VNPay redirects to backend /api/payments/vnpay-return
    // Backend processes and redirects to /payments/success or /payments/cancel
    // This page should not be reached if backend redirect works correctly
    // But if reached, check params and redirect accordingly
    
    const responseCode = searchParams.get('vnp_ResponseCode');
    const orderNumber = searchParams.get('vnp_TxnRef');
    
    // If we have VNPay params, redirect to backend handler
    if (responseCode !== null || orderNumber) {
      // Build backend URL
      // NEXT_PUBLIC_API_URL already includes /api, so we don't need to add it again
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const backendUrl = `${apiBaseUrl}/payments/vnpay-return?${searchParams.toString()}`;
      
      console.log('Redirecting to backend:', backendUrl);
      
      // Redirect to backend (which will then redirect to success/cancel)
      window.location.href = backendUrl;
      return;
    }
    
    // Fallback: if no params, wait a bit then redirect to cart
    const timer = setTimeout(() => {
      router.push('/cart');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <LoadingOutlined className="text-6xl text-blue-600 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Đang xử lý thanh toán...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          <p className="text-sm text-gray-500 mt-2">Không đóng trình duyệt này</p>
        </div>
      </main>
    </div>
  );
}

