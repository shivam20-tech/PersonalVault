/**
 * Google Drive API v3 — All REST calls live here.
 * Uses modern fetch() with Bearer token auth.
 * Scope: drive.file — ONLY files created by this app are accessible.
 */

const DRIVE_API  = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

// ─── Folder names ───────────────────────────────────────────────────────────
export const ROOT_FOLDER_NAME = 'Personal_Vault_App'
export const DEFAULT_SUBFOLDERS = [
  'Important Documents',
  'Memories & Photos',
  'Personal Notes & Misc',
  'Archive',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build Authorization header object from stored token */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

/** Throw a readable error from a Drive API response */
async function checkResponse(res) {
  if (!res.ok) {
    let msg = `Drive API error ${res.status}`
    try {
      const json = await res.json()
      msg = json?.error?.message || msg
    } catch (_) {}
    throw new Error(msg)
  }
  return res
}

// ─── Folder Management ──────────────────────────────────────────────────────

/**
 * Find a folder by name inside a parent (or root-level if no parentId).
 * Returns the folder metadata object or null if not found.
 */
export async function findFolder(token, name, parentId = null) {
  let q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`
  if (parentId) q += ` and '${parentId}' in parents`

  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`
  const res = await fetch(url, { headers: authHeader(token) })
  await checkResponse(res)
  const data = await res.json()
  return data.files?.[0] || null
}

/**
 * Create a folder in Drive under parentId (or root if none).
 * Returns the new folder's metadata.
 */
export async function createFolder(token, name, parentId = null) {
  const meta = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  }
  const res = await fetch(`${DRIVE_API}/files?fields=id,name`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  })
  await checkResponse(res)
  return res.json()
}

/**
 * Ensure the root vault folder and default subfolders exist,
 * and load all subfolders (including user-created ones).
 * Returns { rootId, folderMap: { 'Folder Name': id, ... } }
 */
export async function initVaultFolders(token) {
  // 1. Find or create root folder
  let root = await findFolder(token, ROOT_FOLDER_NAME)
  if (!root) root = await createFolder(token, ROOT_FOLDER_NAME)

  // 2. Ensure each default subfolder exists
  const folderMap = {}
  for (const name of DEFAULT_SUBFOLDERS) {
    let folder = await findFolder(token, name, root.id)
    if (!folder) folder = await createFolder(token, name, root.id)
    folderMap[name] = folder.id
  }

  // 3. Fetch any additional custom folders created by the user
  const subfolders = await fetchSubfolders(token, root.id)
  for (const f of subfolders) {
    folderMap[f.name] = f.id
  }

  const result = { rootId: root.id, folderMap }
  localStorage.setItem('vault_folder_ids', JSON.stringify(result))
  return result
}

/**
 * Fetch all subfolders inside the root vault folder.
 */
export async function fetchSubfolders(token, rootId) {
  const q = `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&orderBy=name`
  const res = await fetch(url, { headers: authHeader(token) })
  await checkResponse(res)
  const data = await res.json()
  return data.files || []
}

/**
 * Create a new custom folder inside the root vault.
 */
export async function createCustomFolder(token, name, rootId) {
  const folder = await createFolder(token, name, rootId)
  clearFolderCache()
  return folder
}

/** Clear cached folder IDs (used on sign-out) */
export function clearFolderCache() {
  localStorage.removeItem('vault_folder_ids')
}

// ─── File Listing ────────────────────────────────────────────────────────────

/**
 * List files inside a folder (or all vault files if folderId is rootId).
 * Returns array of file metadata objects.
 */
export async function listFiles(token, folderId) {
  const q = `'${folderId}' in parents and trashed=false`
  const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,description,appProperties,thumbnailLink,imageMediaMetadata)'
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc&pageSize=100`
  const res = await fetch(url, { headers: authHeader(token) })
  await checkResponse(res)
  const data = await res.json()
  return data.files || []
}

/**
 * List files from ALL vault subfolders (for the "All Files" view).
 */
export async function listAllVaultFiles(token, folderIds) {
  const parentQ = folderIds.map(id => `'${id}' in parents`).join(' or ')
  const q = `(${parentQ}) and trashed=false`
  const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,description,appProperties,thumbnailLink,imageMediaMetadata,parents)'
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc&pageSize=200`
  const res = await fetch(url, { headers: authHeader(token) })
  await checkResponse(res)
  const data = await res.json()
  return data.files || []
}

// ─── File Upload ─────────────────────────────────────────────────────────────

/**
 * Upload a file using the Drive v3 multipart upload endpoint.
 * @param {string}   token       OAuth access token
 * @param {File}     file        Browser File object
 * @param {string}   folderId    Target Drive folder ID
 * @param {string}   tags        Custom tags string (stored in description)
 * @param {string}   notes       Additional notes (stored in appProperties)
 * @param {Function} onProgress  Called with progress 0-100
 * @returns {Object} Uploaded file metadata
 */
export async function uploadFile(token, file, folderId, tags = '', notes = '', onProgress, extraProperties = {}) {
  // Metadata
  const metadata = {
    name: file.name,
    parents: [folderId],
    description: tags,
    appProperties: { notes, uploadedBy: 'PersonalVaultApp', ...extraProperties },
  }

  // For small files (<= 5 MB), multipart upload is fast and single-request
  if (file.size <= 5 * 1024 * 1024) {
    const metaPart = JSON.stringify(metadata)

    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('metadata', new Blob([metaPart], { type: 'application/json' }))
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,description,appProperties`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)) }
          catch (e) { reject(new Error('Failed to parse upload response')) }
        } else {
          let msg = `Upload failed: ${xhr.status}`
          try { msg = JSON.parse(xhr.responseText)?.error?.message || msg } catch (_) {}
          reject(new Error(msg))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

      xhr.send(formData)
    })
  }

  // For larger files (> 5 MB, e.g. videos, large PDFs, media), use Google Drive resumable upload
  const initRes = await fetch(`${UPLOAD_API}/files?uploadType=resumable&fields=id,name,mimeType,size,createdTime,description,appProperties`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': file.type || 'application/octet-stream',
      'X-Upload-Content-Length': file.size.toString(),
    },
    body: JSON.stringify(metadata),
  })

  if (!initRes.ok) {
    let msg = `Failed to start upload: ${initRes.status}`
    try { msg = (await initRes.json())?.error?.message || msg } catch (_) {}
    throw new Error(msg)
  }

  const uploadUrl = initRes.headers.get('Location')
  if (!uploadUrl) throw new Error('Google Drive did not provide upload URL')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)) }
        catch (e) { reject(new Error('Failed to parse upload response')) }
      } else {
        let msg = `Upload failed: ${xhr.status}`
        try { msg = JSON.parse(xhr.responseText)?.error?.message || msg } catch (_) {}
        reject(new Error(msg))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.send(file)
  })
}

// ─── File Download (authenticated blob) ──────────────────────────────────────

/**
 * Fetch a file's binary content using the OAuth token (for private Drive files).
 * Returns an Object URL you can assign to <img src> or <iframe src>.
 */
export async function fetchFileBlob(token, fileId) {
  const blob = await fetchRawBlob(token, fileId)
  return URL.createObjectURL(blob)
}

/**
 * Fetch raw binary Blob from Google Drive.
 */
export async function fetchRawBlob(token, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: authHeader(token),
  })
  await checkResponse(res)
  return res.blob()
}

// ─── File Metadata Update ────────────────────────────────────────────────────

/**
 * Update a file's metadata (name, description/tags, notes).
 */
export async function updateFileMetadata(token, fileId, { name, description, appProperties }) {
  const body = {}
  if (name !== undefined) body.name = name
  if (description !== undefined) body.description = description
  if (appProperties !== undefined) body.appProperties = appProperties

  const res = await fetch(`${DRIVE_API}/files/${fileId}?fields=id,name,description,appProperties`, {
    method: 'PATCH',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await checkResponse(res)
  return res.json()
}

// ─── Move File ───────────────────────────────────────────────────────────────

/**
 * Move a file to a different folder.
 * Requires knowing the current parent (to remove it).
 */
export async function moveFile(token, fileId, newFolderId, currentParentId) {
  const url = `${DRIVE_API}/files/${fileId}?addParents=${newFolderId}&removeParents=${currentParentId}&fields=id,parents`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
  })
  await checkResponse(res)
  return res.json()
}

// ─── Delete / Trash ───────────────────────────────────────────────────────────

/**
 * Move file to Drive Trash (soft delete).
 */
export async function trashFile(token, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?fields=id,trashed`, {
    method: 'PATCH',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  })
  await checkResponse(res)
  return res.json()
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Full-text search across all vault files by name or description (tags).
 */
export async function searchFiles(token, query, folderIds) {
  const parentQ = folderIds.map(id => `'${id}' in parents`).join(' or ')
  const q = `(${parentQ}) and trashed=false and (name contains '${query}' or description contains '${query}')`
  const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,description,appProperties,thumbnailLink,imageMediaMetadata,parents)'
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc`
  const res = await fetch(url, { headers: authHeader(token) })
  await checkResponse(res)
  const data = await res.json()
  return data.files || []
}
