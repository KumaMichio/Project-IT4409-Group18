import { API_URL } from '@/config/api';

/**
 * Normalizes image URLs to ensure they point to the correct backend server.
 * If the URL starts with /uploads/, it prepends the API_URL.
 * Otherwise, returns the URL as-is (for external URLs).
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-course.jpg';
  }

  // If already a full URL (http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a local upload path, prepend API_URL
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }

  // For relative paths that don't start with /uploads/, return as is
  return url;
}

