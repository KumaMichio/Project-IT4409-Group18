'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DeleteOutlined, ShoppingCartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/lib/toast';
import { normalizeImageUrl } from '@/utils/imageUrl';

export default function CartPage() {
  const router = useRouter();
  const { cartData, removeFromCart, clearCart, loading, actionLoading, error } = useCart();

  const formatPrice = (cents: number) => {
    if (cents === 0) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  const handleRemove = async (courseId: number) => {
    try {
      await removeFromCart(courseId);
      // Toast notification is handled in useCart
    } catch (error) {
      // Error already handled in useCart with toast
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: 'Xóa toàn bộ giỏ hàng?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa tất cả khóa học khỏi giỏ hàng?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await clearCart();
          // Toast notification is handled in useCart
        } catch (error) {
          // Error already handled in useCart with toast
          console.error('Error clearing cart:', error);
        }
      },
    });
  };

  const handleCheckout = () => {
    router.push('/payments/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Đang tải giỏ hàng...</div>
          </div>
        </div>
      </div>
    );
  }

  const items = cartData?.items || [];
  const isEmpty = items.length === 0;
  const total = cartData?.summary.totalPriceCents || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <ExclamationCircleOutlined />
              <span>{error}</span>
            </div>
          </div>
        )}

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy khám phá các khóa học và thêm vào giỏ hàng
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">
                    {items.length} {items.length === 1 ? 'khóa học' : 'khóa học'}
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-start gap-4 hover:bg-gray-50 transition"
                    >
                      <Link
                        href={`/courses/${item.course_id}`}
                        className="relative w-32 h-20 bg-gray-200 rounded flex-shrink-0"
                      >
                        {item.thumbnail_url ? (
                          <Image
                            src={normalizeImageUrl(item.thumbnail_url)}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                            sizes="128px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/courses/${item.course_id}`}
                          className="block"
                        >
                          <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.instructor_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-red-600">
                            {formatPrice(item.price_cents)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.course_id)}
                            disabled={actionLoading?.remove === item.course_id}
                            className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Xóa khỏi giỏ hàng"
                          >
                            {actionLoading?.remove === item.course_id ? (
                              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <DeleteOutlined className="text-xl" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
                <h2 className="font-bold text-xl mb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Giảm giá:</span>
                    <span className="text-green-600">0 đ</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isEmpty || actionLoading?.clear}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading?.clear ? 'Đang xử lý...' : 'Thanh toán'}
                  </button>
                <Link
                  href="/courses"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

