/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if slug exists
 * @param {string} text - Text to convert to slug
 * @param {Function} checkExists - Async function to check if slug exists (slug) => Promise<boolean>
 * @param {number} excludeId - Optional course ID to exclude from check
 * @returns {Promise<string>} - Unique slug
 */
async function generateUniqueSlug(text, checkExists, excludeId = null) {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;
  
  while (await checkExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
};

