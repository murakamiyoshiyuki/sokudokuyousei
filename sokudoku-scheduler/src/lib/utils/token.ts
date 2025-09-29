import { customAlphabet } from 'nanoid'

// Base62 alphabet for URL-safe IDs
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// Generate public ID (22 characters)
export const generatePublicId = customAlphabet(alphabet, 22)

// Generate secure token (64 characters)
export const generateSecureToken = customAlphabet(alphabet, 64)

// Generate edit token (48 characters)
export const generateEditToken = customAlphabet(alphabet, 48)