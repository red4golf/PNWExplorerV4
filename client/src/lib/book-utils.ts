/**
 * Book utilities for dynamic thumbnail generation and ASIN extraction
 */

/**
 * Extract ASIN (Amazon Standard Identification Number) from Amazon URL
 * @param amazonUrl - Amazon product URL
 * @returns ASIN string or empty string if not found
 */
export function extractASIN(amazonUrl: string): string {
  if (!amazonUrl) return '';
  
  // Match ASIN patterns in Amazon URLs
  // Pattern 1: /dp/ASIN or /product/ASIN
  const dpMatch = amazonUrl.match(/\/(?:dp|product)\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1];
  
  // Pattern 2: /gp/product/ASIN
  const gpMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1];
  
  // Pattern 3: ASIN= parameter
  const asinMatch = amazonUrl.match(/asin=([A-Z0-9]{10})/i);
  if (asinMatch) return asinMatch[1];
  
  return '';
}

/**
 * Generate Amazon book thumbnail URL from ASIN
 * @param asin - Amazon Standard Identification Number
 * @param size - Image size (S, M, L)
 * @returns Amazon image URL
 */
export function getAmazonThumbnail(asin: string, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!asin) return '';
  
  // Amazon image URL pattern with size
  const sizeCode = size === 'S' ? '_SX150_' : size === 'M' ? '_SX300_' : '_SX500_';
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.${sizeCode}.jpg`;
}

/**
 * Generate Open Library thumbnail URL from ISBN
 * @param isbn - International Standard Book Number
 * @param size - Image size (S, M, L)
 * @returns Open Library image URL
 */
export function getOpenLibraryThumbnail(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!isbn) return '';
  
  // Open Library covers API
  const sizeCode = size === 'S' ? 'S' : size === 'M' ? 'M' : 'L';
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${sizeCode}.jpg`;
}

/**
 * Get book thumbnail URL with fallback strategy
 * @param amazonUrl - Amazon product URL
 * @param isbn - ISBN for fallback (optional)
 * @returns Primary thumbnail URL
 */
export function getBookThumbnail(amazonUrl: string, isbn?: string): string {
  // Try Amazon first
  const asin = extractASIN(amazonUrl);
  if (asin) {
    return getAmazonThumbnail(asin, 'M');
  }
  
  // Fallback to Open Library if ISBN available
  if (isbn) {
    return getOpenLibraryThumbnail(isbn, 'M');
  }
  
  return '';
}

/**
 * Validate if an image URL is loadable
 * @param url - Image URL to test
 * @returns Promise that resolves if image loads successfully
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}