import { useState, useEffect, useCallback } from 'react'
import { fetchFileBlob } from '../lib/driveApi'
import { formatBytes, formatDate } from '../lib/utils'
import { IconClose, IconDownload, IconTrash, IconFilePDF } from './Icons'

export default function PDFViewer({ token, file, onClose, onTrash }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!file?.id) return
    setLoading(true); setError(null)
    fetchFileBlob(token, file.id)
      .then(url => { setBlobUrl(url); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [file?.id, token])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  const download = useCallback(() => {
    if (!blobUrl) return
    Object.assign(document.createElement('a'), { href: blobUrl, download: file.name }).click()
  }, [blobUrl, file.name])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0c10' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-vault-border shrink-0"
        style={{ background: '#0D1017' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center ft-pdf shrink-0">
          <IconFilePDF className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-vault-text truncate">{file.name}</p>
          <p className="text-xs text-vault-faint">{formatBytes(file.size)} · {formatDate(file.modifiedTime)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={download} className="btn-ghost text-xs py-1.5 px-2.5 gap-1.5">
            <IconDownload className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Download</span>
          </button>
          <button onClick={() => onTrash(file)} className="btn-danger text-xs py-1.5 px-2.5 gap-1.5">
            <IconTrash className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Delete</span>
          </button>
          <div className="w-px h-5 bg-vault-border mx-0.5" />
          <button onClick={onClose} className="btn-icon w-7 h-7">
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-vault-bg">
            <div className="w-8 h-8 rounded-full border-2 border-vault-border border-t-vault-accent animate-spin" />
            <p className="text-xs text-vault-muted">Loading document…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-vault-bg">
            <p className="text-sm text-vault-danger font-medium">Failed to load PDF</p>
            <p className="text-xs text-vault-muted">{error}</p>
            <button onClick={download} className="btn-primary text-xs mt-2 py-1.5">
              <IconDownload className="w-3.5 h-3.5" /> Download instead
            </button>
          </div>
        )}
        {blobUrl && !loading && (
          <iframe
            src={`${blobUrl}#toolbar=1&view=FitH`}
            title={file.name}
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  )
}
