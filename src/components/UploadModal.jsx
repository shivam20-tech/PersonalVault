import { useState, useRef, useCallback } from 'react'
import { uploadFile } from '../lib/driveApi'
import { DEFAULT_SUBFOLDERS } from '../lib/driveApi'
import { formatBytes } from '../lib/utils'
import { IconClose, IconUpload, IconTag, IconCheck } from './Icons'

const ACCEPT = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.heic'

export default function UploadModal({ token, folderMap, defaultFolder, onClose, onComplete }) {
  const [files, setFiles]       = useState([])
  const [folder, setFolder]     = useState(defaultFolder)
  const [tags, setTags]         = useState('')
  const [notes, setNotes]       = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads]   = useState([])   // { name, progress, status, error }
  const [uploading, setUploading] = useState(false)
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
    const folderId = folderMap[folder]
    if (!folderId) return
    setUploading(true)
    setUploads(files.map(f => ({ name: f.name, progress: 0, status: 'pending', error: null })))

    for (let i = 0; i < files.length; i++) {
      setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'uploading' } : u))
      try {
        await uploadFile(token, files[i], folderId, tags, notes, pct =>
          setUploads(p => p.map((u, j) => j === i ? { ...u, progress: pct } : u))
        )
        setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'done', progress: 100 } : u))
      } catch (err) {
        setUploads(p => p.map((u, j) => j === i ? { ...u, status: 'error', error: err.message } : u))
      }
    }

    setUploading(false)
    setTimeout(onComplete, 900)
  }, [files, token, folderMap, folder, tags, notes, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={!uploading ? onClose : undefined} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-vault-surface rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          maxHeight: '90dvh'
        }}>

        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-vault-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-vault-border">
          <div>
            <h2 className="text-sm font-semibold text-vault-text">Upload files</h2>
            <p className="text-xs text-vault-muted mt-0.5">to {folder}</p>
          </div>
          {!uploading && (
            <button onClick={onClose} className="btn-icon w-7 h-7">
              <IconClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!uploading ? (
            <div className="p-5 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-7 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${dragging ? 'drop-active' : 'border-vault-border hover:border-vault-borderLight'}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: dragging ? 'rgba(91,127,255,0.15)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <IconUpload className={`w-5 h-5 transition-colors ${dragging ? 'text-vault-accent' : 'text-vault-muted'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-vault-subtle">Drop files or tap to browse</p>
                  <p className="text-xs text-vault-muted mt-0.5">Images, PDFs, documents…</p>
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
                  <div className="rounded-lg overflow-hidden border border-vault-border divide-y divide-vault-border">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-vault-card text-xs">
                        <span className="truncate text-vault-subtle flex-1">{f.name}</span>
                        <span className="text-vault-faint shrink-0">{formatBytes(f.size)}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                          className="text-vault-faint hover:text-vault-danger transition-colors shrink-0">
                          <IconClose className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {/* Folder */}
                <div className="space-y-1.5">
                  <label className="section-label">Destination</label>
                  <select value={folder} onChange={e => setFolder(e.target.value)}
                    className="input-field text-xs"
                    style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {DEFAULT_SUBFOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="section-label flex items-center gap-1.5">
                    <IconTag className="w-3 h-3" /> Tags
                  </label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="passport, 2024, important" className="input-field text-xs" />
                  <p className="text-vault-faint" style={{ fontSize: '0.6rem' }}>Comma-separated · stored in Drive file description · searchable</p>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="section-label">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Optional context…" rows={2}
                    className="input-field text-xs" style={{ background: 'rgba(0,0,0,0.3)' }} />
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
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
          <div className="px-5 py-4 border-t border-vault-border flex gap-2.5">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center text-xs py-2">
              Cancel
            </button>
            <button
              onClick={startUpload}
              disabled={!files.length}
              className="btn-primary flex-1 justify-center text-xs py-2 disabled:opacity-40 disabled:pointer-events-none"
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
