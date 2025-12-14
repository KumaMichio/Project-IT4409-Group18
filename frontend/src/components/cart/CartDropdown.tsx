'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '@/hooks/useCart';
import { CartItem as CartItemComponent } from './CartItem';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const router = useRouter();
  const { cartData, removeFromCart, cartTotal, actionLoading, loading } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  const handleRemove = async (courseId: number) => {
    try {
      await removeFromCart(courseId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push('/cart');
  };

  if (!isOpen) return null;

  const items = cartData?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-96 max-h-[500px] flex flex-col"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Giỏ hàng của bạn</h3>
        <p className="text-sm text-gray-500 mt-1">
          {items.length} {items.length === 1 ? 'khóa học' : 'khóa học'}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Đang tải...</p>
        </div>
      ) : isEmpty ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            href="/courses"
            onClick={onClose}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto flex-1 max-h-[350px]">
            {items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onRemove={handleRemove}
                isRemoving={actionLoading?.remove === item.course_id}
              />
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-red-600">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Thanh toán
            </button>
            <Link
              href="/cart"
              onClick={onClose}
              className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              Xem giỏ hàng
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

