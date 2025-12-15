'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DeleteOutlined } from '@ant-design/icons';
import { CartItem as CartItemType } from '@/hooks/useCart';
import { normalizeImageUrl } from '@/utils/imageUrl';

interface CartItemProps {
  item: CartItemType;
  onRemove: (courseId: number) => void;
  isRemoving?: boolean;
}

export function CartItem({ item, onRemove, isRemoving = false }: CartItemProps) {
  const formatPrice = (cents: number) => {
    if (cents === 0) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
      <Link
        href={`/courses/${item.course_id}`}
        className="relative w-16 h-10 bg-gray-200 rounded flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {item.thumbnail_url ? (
          <Image
            src={normalizeImageUrl(item.thumbnail_url)}
            alt={item.title}
            fill
            className="object-cover rounded"
            sizes="64px"
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
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
            {item.title}
          </h4>
        </Link>
        <p className="text-xs text-gray-500 mt-1">{item.instructor_name}</p>
        <p className="text-sm font-semibold text-red-600 mt-1">
          {formatPrice(item.price_cents)}
        </p>
      </div>
      <button
        onClick={() => onRemove(item.course_id)}
        disabled={isRemoving}
        className="p-1 text-gray-400 hover:text-red-600 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Xóa khỏi giỏ hàng"
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <DeleteOutlined className="text-lg" />
        )}
      </button>
    </div>
  );
}

