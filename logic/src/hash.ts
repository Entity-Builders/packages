import Hashids from 'hashids';

// Use a salt and a Base62 alphabet to compress the hash as much as possible
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const hashids = new Hashids('Entity-Builders-Magic-Salt', 0, ALPHABET);

/**
 * Encodes a standard UUID into a short hash string (max ~8 chars).
 * Since a full 128-bit UUID cannot technically fit in 8 base62 chars,
 * we use the first 8 characters (32 bits) of the UUID as a pseudo-unique ID.
 */
export function encodeUuidToHash(uuid: string): string {
  try {
    // Extract the first block: e.g. "0f4b301c" from "0f4b301c-6d9b-4654-be88-1ea96bc6fcda"
    const hexPrefix = uuid.split('-')[0];
    return hashids.encodeHex(hexPrefix);
  } catch (error) {
    console.warn('Failed to encode UUID', uuid, error);
    return uuid; // Fallback
  }
}

/**
 * Decodes a short hash string back into the starting block of a UUID.
 * Returns the 8-character hex prefix (e.g. "0f4b301c").
 * Use this in your database queries with a SQL `ilike '0f4b301c-%'` pattern.
 */
export function decodeHashToUuidPrefix(hash: string): string | null {
  try {
    // Check if it's already a full UUID (fallback case)
    if (hash.length === 36 && hash.includes('-')) {
      return hash.split('-')[0];
    }
    
    let hex = hashids.decodeHex(hash);
    if (!hex || typeof hex !== 'string') return null;
    
    // Ensure it's padded to 8 hex characters in case leading zeros were lost
    return hex.padStart(8, '0');
  } catch (error) {
    console.warn('Failed to decode hash prefix', hash, error);
    return null;
  }
}
