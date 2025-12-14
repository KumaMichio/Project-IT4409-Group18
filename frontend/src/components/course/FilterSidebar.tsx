'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOutlined, ClearOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  priceRange: string | null;
  minRating: string | null;
  sortBy: string | null;
  sortOrder: string;
}

const PRICE_RANGES = [
  { value: 'free', label: 'Miễn phí' },
  { value: 'under_100k', label: 'Dưới 100.000đ' },
  { value: '100k_500k', label: '100.000đ - 500.000đ' },
  { value: '500k_1m', label: '500.000đ - 1.000.000đ' },
  { value: 'over_1m', label: 'Trên 1.000.000đ' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 sao trở lên' },
  { value: '4.0', label: '4.0 sao trở lên' },
  { value: '3.5', label: '3.5 sao trở lên' },
  { value: '3.0', label: '3.0 sao trở lên' },
];

const SORT_OPTIONS = [
  { value: 'date', order: 'desc', label: 'Mới nhất' },
  { value: 'price', order: 'asc', label: 'Giá tăng dần (Rẻ → Đắt)' },
  { value: 'price', order: 'desc', label: 'Giá giảm dần (Đắt → Rẻ)' },
  { value: 'rating', order: 'desc', label: 'Rating cao → thấp' },
  { value: 'rating', order: 'asc', label: 'Rating thấp → cao' },
];

export function FilterSidebar({ onFilterChange, isLoading = false }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>({
    priceRange: searchParams.get('price_range') || null,
    minRating: searchParams.get('min_rating') || null,
    sortBy: searchParams.get('sort_by') || null,
    sortOrder: searchParams.get('sort_order') || 'desc',
  });
  
  const [isApplying, setIsApplying] = useState(false);

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    setIsApplying(true);
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove params
    if (newFilters.priceRange) {
      params.set('price_range', newFilters.priceRange);
    } else {
      params.delete('price_range');
    }
    
    if (newFilters.minRating) {
      params.set('min_rating', newFilters.minRating);
    } else {
      params.delete('min_rating');
    }
    
    if (newFilters.sortBy) {
      params.set('sort_by', newFilters.sortBy);
      params.set('sort_order', newFilters.sortOrder);
    } else {
      params.delete('sort_by');
      params.delete('sort_order');
    }
    
    // Update URL without page reload
    router.push(`/courses?${params.toString()}`, { scroll: false });
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
    
    // Reset applying state after a short delay
    setTimeout(() => setIsApplying(false), 300);
  };

  // Load filters from URL on mount
  useEffect(() => {
    const newFilters: FilterState = {
      priceRange: searchParams.get('price_range') || null,
      minRating: searchParams.get('min_rating') || null,
      sortBy: searchParams.get('sort_by') || null,
      sortOrder: searchParams.get('sort_order') || 'desc',
    };
    setFilters(newFilters);
  }, [searchParams]);

  const handlePriceRangeChange = (value: string) => {
    const newFilters = {
      ...filters,
      priceRange: filters.priceRange === value ? null : value,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleRatingChange = (value: string) => {
    const newFilters = {
      ...filters,
      minRating: filters.minRating === value ? null : value,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleSortChange = (value: string) => {
    if (!value || value === '') {
      // Clear sort
      const newFilters = {
        ...filters,
        sortBy: null,
        sortOrder: 'desc',
      };
      setFilters(newFilters);
      updateURL(newFilters);
    } else {
      // Parse "price_asc" or "rating_desc" or "date" format
      if (value === 'date') {
        const newFilters = {
          ...filters,
          sortBy: 'date',
          sortOrder: 'desc',
        };
        setFilters(newFilters);
        updateURL(newFilters);
      } else {
        const [sortBy, order] = value.split('_');
        const newFilters = {
          ...filters,
          sortBy: sortBy,
          sortOrder: order,
        };
        setFilters(newFilters);
        updateURL(newFilters);
      }
    }
  };

  const handleClearFilters = () => {
    const newFilters: FilterState = {
      priceRange: null,
      minRating: null,
      sortBy: null,
      sortOrder: 'desc',
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const hasActiveFilters = filters.priceRange || filters.minRating || filters.sortBy;
  const activeFilterCount = [
    filters.priceRange,
    filters.minRating,
    filters.sortBy
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FilterOutlined className={isLoading || isApplying ? 'animate-pulse' : ''} />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            disabled={isLoading || isApplying}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClearOutlined />
            Xóa bộ lọc
          </button>
        )}
      </div>
      
      {(isLoading || isApplying) && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
            Đang áp dụng bộ lọc...
          </p>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Giá tiền
          {filters.priceRange && (
            <CheckCircleOutlined className="text-green-500 text-xs" />
          )}
        </h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isSelected = filters.priceRange === range.value;
            return (
              <label
                key={range.value}
                className={`flex items-center cursor-pointer p-2.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                } ${isLoading || isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={isSelected}
                  onChange={() => handlePriceRangeChange(range.value)}
                  disabled={isLoading || isApplying}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Đánh giá
          {filters.minRating && (
            <CheckCircleOutlined className="text-green-500 text-xs" />
          )}
        </h3>
        <div className="space-y-1">
          {RATING_OPTIONS.map((option) => {
            const isSelected = filters.minRating === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-center cursor-pointer p-2.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                } ${isLoading || isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="minRating"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleRatingChange(option.value)}
                  disabled={isLoading || isApplying}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Sắp xếp
          {filters.sortBy && (
            <CheckCircleOutlined className="text-green-500 text-xs" />
          )}
        </h3>
        <select
          value={
            filters.sortBy
              ? filters.sortBy === 'date'
                ? 'date'
                : `${filters.sortBy}_${filters.sortOrder}`
              : ''
          }
          onChange={(e) => handleSortChange(e.target.value)}
          disabled={isLoading || isApplying}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all ${
            filters.sortBy
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 bg-white'
          } ${isLoading || isApplying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <option value="">Mặc định</option>
          {SORT_OPTIONS.map((option, index) => (
            <option
              key={`${option.value}_${option.order}_${index}`}
              value={option.value === 'date' ? 'date' : `${option.value}_${option.order}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

