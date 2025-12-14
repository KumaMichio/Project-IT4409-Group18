'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { QrcodeOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { toast } from '@/lib/toast';
import { usePayment } from '@/hooks/usePayment';

export default function QRCodePaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getOrderByOrderNumber } = usePayment();
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef<number>(0);
  
  const orderNumber = searchParams.get('orderNumber');
  const qrCodeUrl = searchParams.get('qrCodeUrl');

  // Polling để kiểm tra payment status và auto-redirect khi thanh toán thành công
  useEffect(() => {
    if (!orderNumber) return;

    const maxPolls = 60; // Poll tối đa 60 lần (5 phút nếu mỗi 5 giây)
    pollCountRef.current = 0;

    const checkPaymentStatus = async () => {
      try {
        setIsPolling(true);
        const order = await getOrderByOrderNumber(orderNumber);
        
        if (order) {
          setPaymentStatus(order.status);
          
          if (order.status === 'PAID') {
            // Thanh toán thành công - redirect đến trang success (sẽ tự redirect đến khóa học)
            toast.success('Thanh toán thành công! Đang chuyển hướng...');
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            router.push(`/payments/success?orderNumber=${orderNumber}`);
            return;
          } else if (order.status === 'FAILED' || order.status === 'CANCELLED') {
            // Thanh toán thất bại
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsPolling(false);
            return;
          }
        }

        pollCountRef.current++;
        if (pollCountRef.current >= maxPolls) {
          // Dừng polling sau maxPolls lần
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Bắt đầu polling sau 3 giây (để user có thời gian quét QR)
    const initialDelay = setTimeout(() => {
      checkPaymentStatus();
      // Poll mỗi 5 giây
      pollIntervalRef.current = setInterval(checkPaymentStatus, 5000);
    }, 3000);

    return () => {
      clearTimeout(initialDelay);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [orderNumber, getOrderByOrderNumber, router]);

  if (!orderNumber || !qrCodeUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin thanh toán không hợp lệ</h2>
            <Link href="/cart">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Quay lại giỏ hàng
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
          <div className="text-center mb-8">
            <QrcodeOutlined className="text-6xl text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quét mã QR để thanh toán</h1>
            <p className="text-gray-600">Sử dụng ứng dụng ngân hàng của bạn để quét mã QR</p>
            <p className="text-sm text-gray-500 mt-2">Mã đơn hàng: <span className="font-semibold">{orderNumber}</span></p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg mb-4">
              <Image
                src={qrCodeUrl}
                alt="QR Code thanh toán"
                width={300}
                height={300}
                className="rounded"
                unoptimized
              />
            </div>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Mở ứng dụng ngân hàng trên điện thoại, chọn tính năng quét QR và quét mã này để thanh toán
            </p>
          </div>


          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Hướng dẫn thanh toán:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Mở ứng dụng ngân hàng trên điện thoại</li>
              <li>Chọn tính năng "Quét QR" hoặc "Scan QR Code"</li>
              <li>Quét mã QR trên màn hình</li>
              <li>Xác nhận thông tin và hoàn tất thanh toán</li>
              <li>Hệ thống sẽ tự động cập nhật trạng thái đơn hàng</li>
            </ol>
          </div>

          {/* Status polling indicator */}
          {isPolling && (
            <div className="text-center text-gray-600 mb-4">
              <LoadingOutlined className="animate-spin mr-2" />
              <span>Đang kiểm tra trạng thái thanh toán...</span>
            </div>
          )}

          {/* Payment status indicator */}
          {paymentStatus === 'PAID' && (
            <div className="text-center text-green-600 mb-4">
              <CheckCircleOutlined className="mr-2" />
              <span>Thanh toán thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <Link href="/cart" className="text-center">
              <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                Quay lại giỏ hàng
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

