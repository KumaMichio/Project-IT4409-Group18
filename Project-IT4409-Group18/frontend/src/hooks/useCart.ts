'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { toast } from '@/lib/toast';

export interface CartItem {
  id: number;
  cart_id: number;
  course_id: number;
  added_at: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  price_cents: number;
  currency: string;
  instructor_id: number;
  instructor_name: string;
  avg_rating: string;
  enrollment_count: string;
  review_count: string;
}

export interface CartSummary {
  itemCount: number;
  totalPriceCents: number;
}

export interface CartData {
  cart: {
    id: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
  };
  items: CartItem[];
  summary: CartSummary;
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{
    add?: number;
    remove?: number;
    clear?: boolean;
  }>({});

  /**
   * Fetch cart data from API
   */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CartData>('/cart');
      setCartData(response.data);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      if (err.response?.status !== 401) {
        setError('Không thể tải giỏ hàng');
      }
      setCartData(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch cart on mount and when auth status changes
   */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Check if course is in cart
   */
  const isCourseInCart = useCallback((courseId: number): boolean => {
    return cartData?.items.some(item => item.course_id === courseId) || false;
  }, [cartData]);

  /**
   * Add course to cart with optimistic update
   */
  const addToCart = useCallback(async (courseId: number, courseData?: Partial<CartItem>) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }

    // Fetch cart if not loaded yet
    let currentCartData = cartData;
    if (!currentCartData) {
      try {
        const response = await apiClient.get<CartData>('/cart');
        currentCartData = response.data;
        setCartData(currentCartData);
      } catch (err) {
        console.error('Error fetching cart before add:', err);
        // Continue anyway, will handle error later
      }
    }

    // Check if already in cart (after fetching if needed)
    if (currentCartData && currentCartData.items.some(item => item.course_id === courseId)) {
      toast.info('Khóa học đã có trong giỏ hàng');
      return false;
    }

    // Optimistic update: Add item to cart immediately
    if (currentCartData && courseData) {
      const optimisticItem: CartItem = {
        id: Date.now(), // Temporary ID
        cart_id: currentCartData.cart.id,
        course_id: courseId,
        added_at: new Date().toISOString(),
        title: courseData.title || '',
        slug: courseData.slug || '',
        description: courseData.description || '',
        thumbnail_url: courseData.thumbnail_url || '',
        price_cents: courseData.price_cents || 0,
        currency: courseData.currency || 'VND',
        instructor_id: courseData.instructor_id || 0,
        instructor_name: courseData.instructor_name || '',
        avg_rating: '0',
        enrollment_count: '0',
        review_count: '0',
      };

      setCartData({
        ...currentCartData,
        items: [optimisticItem, ...currentCartData.items],
        summary: {
          itemCount: currentCartData.summary.itemCount + 1,
          totalPriceCents: currentCartData.summary.totalPriceCents + (courseData.price_cents || 0),
        },
      });
    }

    setActionLoading(prev => ({ ...prev, add: courseId }));
    const hideLoading = toast.loading('Đang thêm vào giỏ hàng...');

    try {
      setError(null);
      await apiClient.post('/cart/items', { courseId });
      hideLoading();
      toast.success('Đã thêm vào giỏ hàng!');
      
      // Refresh cart data to get real data from server
      await fetchCart();
      return true;
    } catch (err: any) {
      hideLoading();
      const errorMessage = err.response?.data?.error || 'Không thể thêm vào giỏ hàng';
      setError(errorMessage);
      
      // Revert optimistic update on error
      await fetchCart();
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next.add;
        return next;
      });
    }
  }, [isAuthenticated, router, fetchCart, cartData]);

  /**
   * Remove course from cart with optimistic update
   */
  const removeFromCart = useCallback(async (courseId: number) => {
    // Optimistic update: Remove item immediately
    let removedItem: CartItem | null = null;
    if (cartData) {
      removedItem = cartData.items.find(item => item.course_id === courseId) || null;
      if (removedItem) {
        setCartData({
          ...cartData,
          items: cartData.items.filter(item => item.course_id !== courseId),
          summary: {
            itemCount: cartData.summary.itemCount - 1,
            totalPriceCents: Math.max(0, cartData.summary.totalPriceCents - removedItem.price_cents),
          },
        });
      }
    }

    setActionLoading(prev => ({ ...prev, remove: courseId }));

    try {
      setError(null);
      await apiClient.delete(`/cart/items/${courseId}`);
      toast.success('Đã xóa khỏi giỏ hàng');
      
      // Refresh cart data to sync with server
      await fetchCart();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể xóa khỏi giỏ hàng';
      setError(errorMessage);
      
      // Revert optimistic update on error
      if (cartData && removedItem) {
        await fetchCart();
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next.remove;
        return next;
      });
    }
  }, [fetchCart, cartData]);

  /**
   * Clear entire cart with optimistic update
   */
  const clearCart = useCallback(async () => {
    // Optimistic update: Clear cart immediately
    const previousData = cartData;
    if (cartData) {
      setCartData({
        ...cartData,
        items: [],
        summary: {
          itemCount: 0,
          totalPriceCents: 0,
        },
      });
    }

    setActionLoading(prev => ({ ...prev, clear: true }));

    try {
      setError(null);
      await apiClient.delete('/cart');
      toast.success('Đã xóa toàn bộ giỏ hàng');
      
      // Refresh cart data to sync with server
      await fetchCart();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể xóa giỏ hàng';
      setError(errorMessage);
      
      // Revert optimistic update on error
      if (previousData) {
        setCartData(previousData);
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, clear: false }));
    }
  }, [fetchCart, cartData]);

  /**
   * Get cart summary (count and total)
   */
  const getSummary = useCallback(async (): Promise<CartSummary | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const response = await apiClient.get<CartSummary>('/cart/summary');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching cart summary:', err);
      return null;
    }
  }, [isAuthenticated]);

  return {
    cartData,
    loading,
    error,
    cartCount: cartData?.summary.itemCount || 0,
    cartTotal: cartData?.summary.totalPriceCents || 0,
    actionLoading,
    isCourseInCart,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    getSummary,
  };
}

