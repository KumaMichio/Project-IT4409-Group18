// Get base API URL, ensuring it doesn't end with /api
const getBaseApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Remove trailing /api if present to avoid duplication
  return url.endsWith('/api') ? url.replace(/\/api$/, '') : url;
};

export const API_URL = getBaseApiUrl();
