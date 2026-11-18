/**
 * Zero-dependency Client-Side Encryption using standard Web Crypto API.
 * Uses AES-GCM 256-bit encryption with PBKDF2 (SHA-256, 100,000 iterations).
 * 
 * Format of encrypted payload:
 * [Magic Bytes: 8 bytes 'VAULTENC'] + [Salt: 16 bytes] + [IV: 12 bytes] + [Ciphertext]
 */

const MAGIC = new Uint8Array([86, 65, 85, 76, 84, 69, 78, 67]) // 'VAULTENC'
const ITERATIONS = 100000

/**
 * Derive AES-GCM 256-bit key from PIN and salt using PBKDF2
 */
async function deriveKey(pin, salt) {
  const enc = new TextEncoder()
  const pinKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    pinKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a File or Blob with a PIN.
 * Returns a new Blob containing [MAGIC, SALT, IV, CIPHERTEXT].
 */
export async function encryptFile(fileOrBlob, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pin, salt)

  const plaintextBuffer = await fileOrBlob.arrayBuffer()
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBuffer
  )

  const combined = new Uint8Array(MAGIC.length + salt.length + iv.length + ciphertextBuffer.byteLength)
  combined.set(MAGIC, 0)
  combined.set(salt, MAGIC.length)
  combined.set(iv, MAGIC.length + salt.length)
  combined.set(new Uint8Array(ciphertextBuffer), MAGIC.length + salt.length + iv.length)

  return new Blob([combined], { type: 'application/octet-stream' })
}

/**
 * Decrypt an encrypted File or Blob using a PIN.
 * Returns a new Blob with the original content and restored mimeType.
 */
export async function decryptFile(encryptedBlob, pin, originalMimeType = 'application/octet-stream') {
  const buffer = await encryptedBlob.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Verify magic header
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) {
      throw new Error('File is not in valid encrypted vault format')
    }
  }

  const saltOffset = MAGIC.length
  const ivOffset = saltOffset + 16
  const dataOffset = ivOffset + 12

  const salt = bytes.slice(saltOffset, ivOffset)
  const iv = bytes.slice(ivOffset, dataOffset)
  const ciphertext = bytes.slice(dataOffset)

  const key = await deriveKey(pin, salt)

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    return new Blob([decryptedBuffer], { type: originalMimeType })
  } catch (err) {
    throw new Error('Incorrect PIN. Decryption failed.')
  }
}

/**
 * Quick check if a blob begins with the VAULTENC header
 */
export async function isBlobEncrypted(blob) {
  if (blob.size < 36) return false
  const header = await blob.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(header)
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) return false
  }
  return true
}
