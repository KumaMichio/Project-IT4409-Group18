'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { ShoppingCartOutlined, CreditCardOutlined, LoadingOutlined } from '@ant-design/icons';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { checkoutInfo, getCheckoutInfo, createOrder, loading, formatPrice } = usePayment();
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    // Check token directly
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast.warning('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return;
    }

    getCheckoutInfo();
  }, [router, getCheckoutInfo]);

  const handleCheckout = async () => {
    if (!checkoutInfo || checkoutInfo.cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      setCreatingOrder(true);
      await createOrder('VNPAY');
      // For free courses, user will be redirected to success page
      // For paid courses, user will be redirected to VNPay
    } catch (error: any) {
      // Error already handled in usePayment
      console.error('Checkout error:', error);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading && !checkoutInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <LoadingOutlined className="text-4xl text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!checkoutInfo || checkoutInfo.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingCartOutlined className="text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có khóa học nào trong giỏ hàng</p>
            <Link href="/courses">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Khám phá khóa học
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Khóa học trong đơn hàng</h2>
              <div className="space-y-4">
                {checkoutInfo.cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <Link href={`/courses/${item.course_id}`} className="relative w-24 h-16 bg-gray-200 rounded flex-shrink-0">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${item.course_id}`}>
                        <h3 className="font-semibold text-lg hover:text-blue-600 transition">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{item.instructor_name}</p>
                      <p className="text-lg font-bold text-red-600 mt-2">
                        {formatPrice(item.price_cents)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính ({checkoutInfo.itemCount} khóa học):</span>
                  <span>{formatPrice(checkoutInfo.totalAmountCents)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Giảm giá:</span>
                  <span className="text-green-600">0 đ</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(checkoutInfo.totalAmountCents)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Phương thức thanh toán</h3>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <CreditCardOutlined className="text-2xl text-blue-600" />
                    <div>
                      <p className="font-semibold">VNPay</p>
                      <p className="text-sm text-gray-500">Thanh toán qua VNPay</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={creatingOrder || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingOrder ? (
                  <>
                    <LoadingOutlined className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CreditCardOutlined />
                    <span>Xác nhận thanh toán</span>
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

