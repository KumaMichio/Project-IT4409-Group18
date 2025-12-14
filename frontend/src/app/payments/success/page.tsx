'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { usePayment } from '@/hooks/usePayment';
import { CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

interface Order {
  id: number;
  order_number: string;
  total_amount_cents: number;
  status: string;
  items?: Array<{
    course_id: number;
    title: string;
    thumbnail_url: string;
    instructor_name: string;
  }>;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getOrderByOrderNumber, formatPrice, loading } = usePayment();
  const [order, setOrder] = useState<Order | null>(null);
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (orderNumber) {
      getOrderByOrderNumber(orderNumber).then(setOrder);
    }
  }, [orderNumber, getOrderByOrderNumber]);

  // Auto-redirect to first course after successful payment
  useEffect(() => {
    if (order && order.items && order.items.length > 0) {
      // Redirect to the first course's learn page after a short delay to show success message
      const firstCourseId = order.items[0].course_id;
      const timer = setTimeout(() => {
        router.push(`/courses/${firstCourseId}/learn`);
      }, 1500); // Wait 1.5 seconds to show success message

      return () => clearTimeout(timer);
    }
  }, [order, router]);

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.
            </p>
          </div>

          {/* Order Info */}
          {order && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold">{order.order_number}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(order.total_amount_cents)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Đã thanh toán
                </span>
              </div>
            </div>
          )}

          {/* Courses */}
          {order && order.items && order.items.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Khóa học đã mua</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.course_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Link href={`/courses/${item.course_id}`} className="relative w-20 h-14 bg-gray-200 rounded flex-shrink-0">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${item.course_id}`}>
                        <h3 className="font-semibold hover:text-blue-600 transition">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500">{item.instructor_name}</p>
                    </div>
                    <Link href={`/courses/${item.course_id}/learn`}>
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                        <PlayCircleOutlined />
                        <span>Vào học ngay</span>
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {order && order.items && order.items.length > 0 ? (
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <Link href="/courses" className="flex-1">
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Tiếp tục mua sắm
                </button>
              </Link>
              <Link href={`/courses/${order.items[0].course_id}/learn`} className="flex-1">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <PlayCircleOutlined />
                  <span>Vào học ngay</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <Link href="/courses" className="flex-1">
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Tiếp tục mua sắm
                </button>
              </Link>
              <Link href="/my-courses" className="flex-1">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Xem khóa học của tôi
                </button>
              </Link>
            </div>
          )}

          {/* Auto-redirect notice */}
          {order && order.items && order.items.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Đang chuyển hướng đến khóa học trong vài giây...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

