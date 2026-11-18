import { useState, useRef, useCallback } from 'react'
import { uploadFile } from '../lib/driveApi'
import { encryptFile } from '../lib/crypto'
import { formatBytes } from '../lib/utils'
import { IconClose, IconUpload, IconTag, IconCheck, IconLock, IconPlus } from './Icons'

const ACCEPT = 'image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.heic,.mp4,.mov,.mkv,.webm,.avi,.m4v,.3gp'

export default function UploadModal({ token, folderMap, defaultFolder, onClose, onComplete, onOpenNewFolder }) {
  const folderNames = Object.keys(folderMap).filter(k => k !== 'All Files')
  const [files, setFiles]               = useState([])
  const [folder, setFolder]             = useState(defaultFolder || folderNames[0] || 'Important Documents')
  const [tags, setTags]                 = useState('')
  const [notes, setNotes]               = useState('')
  const [encryptWithPin, setEncrypt]    = useState(false)
  const [pin, setPin]                   = useState('')
  const [dragging, setDragging]         = useState(false)
  const [uploads, setUploads]           = useState([])
  const [uploading, setUploading]       = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback(incoming => {
    setFiles(prev => {
      const seen = new Set(prev.map(f => f.name + f.size))
      return [...prev, ...[...incoming].filter(f => !seen.has(f.name + f.size))]
    })
  }, [])

  const onDrop = e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }

  const startUpload = useCallback(async () => {
    if (!files.length) return
    if (encryptWithPin && !pin.trim()) {
      alert('Please enter a PIN to encrypt these files.')
      return
    }

    const folderId = folderMap[folder]
    if (!folderId) return
    setUploading(true)
    setUploads(files.map(f => ({ name: f.name, progress: 0, status: 'pending', error: null })))

    for (let i = 0; i < files.length; i++) {
      const fileToUpload = files[i]
      setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'uploading' } : u))
      try {
        let payload = fileToUpload
        const extraProperties = {}

        if (encryptWithPin && pin.trim()) {
          // Encrypt client-side before sending to Google Drive
          payload = await encryptFile(fileToUpload, pin.trim())
          // Re-attach file name property to the encrypted blob for uploadFile helper
          payload.name = fileToUpload.name
          extraProperties.encrypted = 'true'
          extraProperties.originalMimeType = fileToUpload.type || 'application/octet-stream'
        }

        await uploadFile(
          token,
          payload,
          folderId,
          tags,
          notes,
          pct => setUploads(p => p.map((u, j) => j === i ? { ...u, progress: pct } : u)),
          extraProperties
        )
        setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'done', progress: 100 } : u))
      } catch (err) {
        setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'error', error: err.message } : u))
      }
    }

    setUploading(false)
    setTimeout(onComplete, 900)
  }, [files, token, folderMap, folder, tags, notes, encryptWithPin, pin, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={!uploading ? onClose : undefined} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-vault-surface rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92dvh]"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>

        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-vault-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-vault-border">
          <div>
            <h2 className="text-sm font-semibold text-vault-text">Upload files</h2>
            <p className="text-xs text-vault-muted mt-0.5 truncate max-w-[240px]">to {folder}</p>
          </div>
          {!uploading && (
            <button onClick={onClose} className="btn-icon w-8 h-8">
              <IconClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!uploading ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-6 sm:p-7 flex flex-col items-center gap-2.5 cursor-pointer transition-all duration-200 ${dragging ? 'drop-active' : 'border-vault-border hover:border-vault-borderLight'}`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: dragging ? 'rgba(91,127,255,0.15)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <IconUpload className={`w-5 h-5 transition-colors ${dragging ? 'text-vault-accent' : 'text-vault-muted'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-vault-subtle">Tap to browse or drop files</p>
                  <p className="text-xs text-vault-muted mt-0.5">Photos, videos, PDFs, documents…</p>
                </div>
                <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden"
                  onChange={e => addFiles(e.target.files)} />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="section-label">{files.length} selected</span>
                    <button onClick={() => setFiles([])} className="text-vault-faint hover:text-vault-muted text-xs transition-colors">
                      Clear all
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-vault-border divide-y divide-vault-border max-h-36 overflow-y-auto">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-vault-card text-xs">
                        <span className="truncate text-vault-subtle flex-1">{f.name}</span>
                        <span className="text-vault-faint shrink-0">{formatBytes(f.size)}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                          className="text-vault-faint hover:text-vault-danger transition-colors shrink-0 p-1">
                          <IconClose className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security & Destination Options */}
              <div className="space-y-3.5 pt-1">
                {/* PIN Encryption Box */}
                <div className="p-3.5 rounded-xl space-y-2.5"
                  style={{ background: 'rgba(91,127,255,0.05)', border: '1px solid rgba(91,127,255,0.15)' }}>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={encryptWithPin}
                      onChange={e => setEncrypt(e.target.checked)}
                      className="w-4 h-4 rounded text-vault-accent bg-vault-surface border-vault-border focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <IconLock className="w-3.5 h-3.5 text-vault-accent" />
                      <span className="text-xs font-semibold text-vault-text">Encrypt with PIN (Zero-Knowledge)</span>
                    </div>
                  </label>
                  <p className="text-vault-muted leading-relaxed" style={{ fontSize: '0.65rem' }}>
                    Scrambles the file with AES-256 before uploading. Impossible to view inside Google Drive without your PIN.
                  </p>

                  {encryptWithPin && (
                    <div className="pt-1">
                      <input
                        type="password"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        placeholder="Enter 4-6 digit secret PIN"
                        className="input-field text-xs py-2 tracking-widest font-mono text-center"
                        maxLength={24}
                      />
                    </div>
                  )}
                </div>

                {/* Folder Selection + New Folder Button */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="section-label">Destination Folder</label>
                    {onOpenNewFolder && (
                      <button
                        type="button"
                        onClick={onOpenNewFolder}
                        className="text-vault-accent hover:text-vault-accentHover text-xs flex items-center gap-1 transition-colors"
                      >
                        <IconPlus className="w-3 h-3" /> New Folder
                      </button>
                    )}
                  </div>
                  <select
                    value={folder}
                    onChange={e => setFolder(e.target.value)}
                    className="input-field text-xs py-2"
                    style={{ background: '#111318' }}
                  >
                    {folderNames.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="section-label flex items-center gap-1.5">
                    <IconTag className="w-3 h-3" /> Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="private, bill, 2024"
                    className="input-field text-xs py-2"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="section-label">Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional details…"
                    rows={2}
                    className="input-field text-xs"
                    style={{ background: '#111318' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Upload progress */
            <div className="p-5 space-y-3">
              {uploads.map((u, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-vault-subtle flex-1">{u.name}</span>
                    <span className={`shrink-0 font-medium ${
                      u.status === 'done' ? 'text-vault-success' :
                      u.status === 'error' ? 'text-vault-danger' : 'text-vault-muted'
                    }`}>
                      {u.status === 'done'      ? <IconCheck className="w-3.5 h-3.5 inline" /> :
                       u.status === 'error'     ? 'Failed' :
                       u.status === 'uploading' ? `${u.progress}%` : '…'}
                    </span>
                  </div>
                  {u.status !== 'pending' && (
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full progress-fill" style={{ width: `${u.progress}%` }} />
                    </div>
                  )}
                  {u.error && <p className="text-xs text-vault-danger">{u.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!uploading && (
          <div className="px-5 py-3.5 border-t border-vault-border flex gap-2.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center text-xs py-2.5">
              Cancel
            </button>
            <button
              onClick={startUpload}
              disabled={!files.length}
              className="btn-primary flex-1 justify-center text-xs py-2.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <IconUpload className="w-3.5 h-3.5" />
              Upload {files.length > 0 ? `${files.length} ${files.length === 1 ? 'file' : 'files'}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
