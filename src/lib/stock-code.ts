/**
 * Generate a unique stock code for a product
 * Format: MS-[BRAND]-[HASH]-[ID_SUFFIX]
 * Example: MS-SAM-A8F2-1234
 */
export function generateStockCode(productId: string, brand?: string): string {
  // Create brand prefix (first 3 letters, uppercase)
  const brandPrefix = (brand || 'GEN')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  // Create hash from product ID (4 characters)
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashStr = Math.abs(hash).toString(36).toUpperCase().substring(0, 4).padEnd(4, '0');

  // Get last 4 characters of product ID (or first 4 if short)
  const idSuffix = productId.length >= 4 
    ? productId.substring(productId.length - 4)
    : productId.padStart(4, '0');

  return `MS-${brandPrefix}-${hashStr}-${idSuffix}`;
}


