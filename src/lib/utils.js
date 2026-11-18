/**
 * Utility helpers used across the app.
 */

/** Format bytes into human-readable string */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/** Format ISO date string to readable date */
export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Determine file category from MIME type */
export function getFileCategory(mimeType) {
  if (!mimeType) return 'other'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'doc'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'sheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slide'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'other'
}

/** Returns a Tailwind color class for file type badge */
export function getFileTypeColor(mimeType) {
  const cat = getFileCategory(mimeType)
  const map = {
    image: 'text-purple-400 bg-purple-400/10',
    pdf:   'text-red-400 bg-red-400/10',
    doc:   'text-blue-400 bg-blue-400/10',
    sheet: 'text-green-400 bg-green-400/10',
    slide: 'text-orange-400 bg-orange-400/10',
    video: 'text-pink-400 bg-pink-400/10',
    audio: 'text-yellow-400 bg-yellow-400/10',
    other: 'text-vault-muted bg-vault-border',
  }
  return map[cat] || map.other
}

/** Extract tags array from file description field */
export function parseTags(description) {
  if (!description) return []
  return description.split(',').map(t => t.trim()).filter(Boolean)
}

/** Join tags array into comma-separated string for Drive description */
export function joinTags(tags) {
  return tags.filter(Boolean).join(', ')
}

/** Simple debounce for search input */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
