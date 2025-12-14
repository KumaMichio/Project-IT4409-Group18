'use client';

import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { cartCount } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 hover:text-gray-900 transition"
      aria-label="Giỏ hàng"
    >
      <ShoppingCartOutlined className="text-2xl" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
}

