'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

/**
 * Test Payment Page - Simulates VNPay payment for testing
 * Only works when PAYMENT_TEST_MODE=true
 */
export default function TestPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');
  const status = searchParams.get('status'); // 'success' or 'cancel'
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!orderNumber) {
      router.push('/payments/cancel');
      return;
    }

    // Countdown before redirecting
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Simulate VNPay callback by calling backend
          if (status === 'success') {
            // Redirect to success page (backend will process the payment)
            window.location.href = `/api/payments/vnpay-return?vnp_TxnRef=${orderNumber}&vnp_ResponseCode=00&vnp_TransactionNo=TEST_${Date.now()}&vnp_Amount=${0}&vnp_SecureHash=test`;
          } else {
            router.push(`/payments/cancel?orderNumber=${orderNumber}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderNumber, status, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {status === 'success' ? (
            <>
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Mode: Thanh toán thành công</h1>
              <p className="text-gray-600 mb-4">
                Đây là chế độ test. Thanh toán sẽ được xử lý tự động.
              </p>
            </>
          ) : (
            <>
              <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Mode: Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-4">
                Đây là chế độ test. Thanh toán đã bị hủy.
              </p>
            </>
          )}
          
          <div className="mt-6">
            <p className="text-gray-500 mb-2">Mã đơn hàng: <span className="font-semibold">{orderNumber}</span></p>
            <p className="text-sm text-gray-400">Chuyển hướng sau {countdown} giây...</p>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Đây là chế độ test. Để sử dụng VNPay thật, vui lòng:
            </p>
            <ul className="text-sm text-yellow-800 mt-2 text-left list-disc list-inside">
              <li>Đăng ký tài khoản tại <a href="https://sandbox.vnpayment.vn" target="_blank" rel="noopener noreferrer" className="underline">VNPay Sandbox</a></li>
              <li>Lấy VNPAY_TMN_CODE và VNPAY_HASH_SECRET</li>
              <li>Thêm vào backend/.env</li>
              <li>Đặt PAYMENT_TEST_MODE=false</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

