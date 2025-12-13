'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { CloseCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Giao dịch thanh toán đã bị hủy hoặc thất bại. Vui lòng thử lại.'}
          </p>
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-6">
              Mã đơn hàng: <span className="font-semibold">{orderNumber}</span>
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/cart">
              <button className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                <ShoppingCartOutlined />
                <span>Quay lại giỏ hàng</span>
              </button>
            </Link>
            <Link href="/courses">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

