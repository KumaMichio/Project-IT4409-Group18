'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';

interface CheckoutInfo {
  cartItems: Array<{
    id: number;
    course_id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    price_cents: number;
    currency: string;
    instructor_name: string;
  }>;
  totalAmountCents: number;
  itemCount: number;
}

interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount_cents: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  payment_provider: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items?: Array<{
    id: number;
    course_id: number;
    price_cents: number;
    title: string;
    slug: string;
    thumbnail_url: string;
    description: string;
    instructor_name: string;
  }>;
}

export function usePayment() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get checkout info from cart
   */
  const getCheckoutInfo = useCallback(async () => {
    // Check token directly instead of relying on isAuthenticated state
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast.warning('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CheckoutInfo>('/payments/checkout');
      setCheckoutInfo(response.data);
      return response.data;
    } catch (err: any) {
      // Don't show error toast if it's 401 - interceptor will handle logout
      if (err.response?.status !== 401) {
        const errorMessage = err.response?.data?.error || 'Không thể tải thông tin thanh toán';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Create order and redirect to payment
   */
  const createOrder = useCallback(async (paymentProvider: string = 'VNPAY') => {
    // Check token directly instead of relying on isAuthenticated state
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast.warning('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating order with provider:', paymentProvider);
      console.log('Token exists:', !!token);

      const response = await apiClient.post<{
        orderId: number;
        orderNumber: string;
        paymentUrl: string | null;
        paymentId: number;
        isFree?: boolean;
        message?: string;
      }>('/payments/create-order', { paymentProvider });

      console.log('Order created successfully:', response.data.orderNumber);

      // If free courses, redirect to success page
      if (response.data.isFree) {
        toast.success(response.data.message || 'Đã đăng ký khóa học miễn phí thành công!');
        router.push(`/payments/success?orderNumber=${response.data.orderNumber}`);
        return;
      }

      // Redirect to payment gateway for paid courses
      if (response.data.paymentUrl) {
        console.log('Redirecting to payment URL...');
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Không nhận được payment URL');
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Don't show error toast if it's 401 - interceptor will handle logout
      if (err.response?.status === 401) {
        const errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        setError(errorMessage);
        toast.error(errorMessage);
        // Let the interceptor handle the logout
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Không thể tạo đơn hàng';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Get order detail
   */
  const getOrderDetail = useCallback(async (orderId: number): Promise<Order | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<Order>(`/payments/orders/${orderId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể tải thông tin đơn hàng';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Get order by order number
   */
  const getOrderByOrderNumber = useCallback(async (orderNumber: string): Promise<Order | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      setLoading(true);
      // First get user orders, then find by order number
      const response = await apiClient.get<Order[]>('/payments/orders');
      const order = response.data.find(o => o.order_number === orderNumber);
      return order || null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể tải thông tin đơn hàng';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Format price
   */
  const formatPrice = useCallback((cents: number) => {
    if (cents === 0) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  }, []);

  return {
    loading,
    error,
    checkoutInfo,
    getCheckoutInfo,
    createOrder,
    getOrderDetail,
    getOrderByOrderNumber,
    formatPrice,
  };
}

