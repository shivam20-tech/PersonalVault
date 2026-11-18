import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchFileBlob, updateFileMetadata } from '../lib/driveApi'
import { formatBytes, formatDate, parseTags } from '../lib/utils'
import { IconClose, IconDownload, IconTrash, IconArchive, IconZoomIn, IconZoomOut, IconEdit, IconTag, IconCheck } from './Icons'

export default function LightboxModal({ token, file, folderMap, onClose, onArchive, onTrash }) {
  const [blobUrl, setBlobUrl]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [zoom, setZoom]             = useState(1)
  const [panOffset, setPanOffset]   = useState({ x: 0, y: 0 })
  const [editing, setEditing]       = useState(false)
  const [tagInput, setTagInput]     = useState(file?.description || '')
  const [noteInput, setNoteInput]   = useState(file?.appProperties?.notes || '')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!file?.id) return
    setLoading(true)
    fetchFileBlob(token, file.id)
      .then(url => { setBlobUrl(url); setLoading(false) })
      .catch(() => setLoading(false))
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [file?.id, token])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  /* Zoom with scroll wheel */
  const handleWheel = useCallback(e => {
    e.preventDefault()
    setZoom(z => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)))
  }, [])

  /* Reset zoom on double-click */
  const handleDblClick = () => { setZoom(z => z !== 1 ? 1 : 2); setPanOffset({ x: 0, y: 0 }) }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await updateFileMetadata(token, file.id, {
        description: tagInput,
        appProperties: { ...(file.appProperties || {}), notes: noteInput },
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); setEditing(false) }, 1200)
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }, [token, file, tagInput, noteInput])

  const handleDownload = useCallback(() => {
    if (!blobUrl) return
    Object.assign(document.createElement('a'), { href: blobUrl, download: file.name }).click()
  }, [blobUrl, file.name])

  const tags = parseTags(tagInput)
  const displayTags = parseTags(file?.description || '')

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(5,7,10,0.97)' }}>

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-20 btn-icon w-8 h-8"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <IconClose className="w-3.5 h-3.5 text-vault-subtle" />
      </button>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full text-xs text-white font-mono"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image area */}
      <div
        className={`flex-1 flex items-center justify-center overflow-hidden ${zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onWheel={handleWheel}
        onDoubleClick={handleDblClick}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-vault-border border-t-vault-accent animate-spin" />
            <p className="text-xs text-vault-muted">Loading…</p>
          </div>
        )}
        {blobUrl && (
          <img
            src={blobUrl}
            alt={file.name}
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: 'transform 0.15s ease',
              userSelect: 'none',
            }}
          />
        )}
      </div>

      {/* Info panel */}
      <div className="w-64 shrink-0 flex flex-col border-l border-vault-border overflow-y-auto"
        style={{ background: '#0D1017' }}>

        {/* File name + meta */}
        <div className="p-4 border-b border-vault-border space-y-1">
          <p className="text-sm font-semibold text-vault-text break-words leading-snug">{file.name}</p>
          <p className="text-xs text-vault-muted">{formatBytes(file.size)}</p>
          <p className="text-xs text-vault-faint">{formatDate(file.modifiedTime)}</p>
        </div>

        {/* Tags & notes */}
        <div className="p-4 border-b border-vault-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-label flex items-center gap-1.5">
              <IconTag className="w-3 h-3" /> Tags & notes
            </span>
            <button onClick={() => setEditing(e => !e)}
              className="text-vault-faint hover:text-vault-muted text-xs transition-colors">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                placeholder="tag1, tag2…" className="input-field text-xs" />
              <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                placeholder="Notes…" rows={3} className="input-field text-xs" />
              <button onClick={handleSave} disabled={saving}
                className={`btn-primary w-full justify-center text-xs py-1.5 ${saved ? 'bg-vault-success' : ''}`}>
                {saved ? <><IconCheck className="w-3.5 h-3.5" /> Saved</> :
                 saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayTags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {displayTags.map(t => <span key={t} className="tag-badge">{t}</span>)}
                </div>
              ) : (
                <p className="text-xs text-vault-faint italic">No tags</p>
              )}
              {file.appProperties?.notes && (
                <p className="text-xs text-vault-muted leading-relaxed break-words">
                  {file.appProperties.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="p-4 border-b border-vault-border">
          <span className="section-label block mb-2">Zoom</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="btn-ghost flex-1 justify-center text-xs py-1.5">
              <IconZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-vault-faint font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="btn-ghost flex-1 justify-center text-xs py-1.5">
              <IconZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-1.5 mt-auto">
          <button onClick={handleDownload} className="btn-ghost w-full justify-start text-xs py-2 gap-3">
            <IconDownload className="w-3.5 h-3.5" /> Download
          </button>
          <button onClick={() => onArchive(file)} className="btn-ghost w-full justify-start text-xs py-2 gap-3">
            <IconArchive className="w-3.5 h-3.5" /> Move to Archive
          </button>
          <button onClick={() => onTrash(file)} className="btn-danger w-full justify-start text-xs py-2 gap-3">
            <IconTrash className="w-3.5 h-3.5" /> Move to Trash
          </button>
        </div>
      </div>
    </div>
  )
}
