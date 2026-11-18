import { useState, useEffect, useCallback } from 'react'
import { fetchFileBlob, fetchRawBlob, updateFileMetadata } from '../lib/driveApi'
import { decryptFile } from '../lib/crypto'
import { formatBytes, formatDate, parseTags } from '../lib/utils'
import { IconClose, IconDownload, IconTrash, IconArchive, IconZoomIn, IconZoomOut, IconEdit, IconTag, IconCheck, IconLock } from './Icons'

export default function LightboxModal({ token, file, folderMap, onClose, onArchive, onTrash }) {
  const isEncrypted = file?.appProperties?.encrypted === 'true'
  const originalMime = file?.appProperties?.originalMimeType || file?.mimeType || ''
  const isVideo = originalMime.startsWith('video/')
  const isPDF = originalMime === 'application/pdf'

  const [blobUrl, setBlobUrl]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [zoom, setZoom]             = useState(1)
  const [panOffset, setPanOffset]   = useState({ x: 0, y: 0 })
  const [editing, setEditing]       = useState(false)
  const [tagInput, setTagInput]     = useState(file?.description || '')
  const [noteInput, setNoteInput]   = useState(file?.appProperties?.notes || '')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  // PIN decryption states
  const [pin, setPin]               = useState('')
  const [pinError, setPinError]     = useState(null)
  const [decrypting, setDecrypting] = useState(false)
  const [unlocked, setUnlocked]     = useState(!isEncrypted)

  // Fetch unencrypted file on mount
  useEffect(() => {
    if (!file?.id) return
    if (isEncrypted) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetchFileBlob(token, file.id)
      .then(url => { setBlobUrl(url); setLoading(false) })
      .catch(() => setLoading(false))

    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [file?.id, isEncrypted, token])

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  // Handle PIN unlock
  const handleUnlock = async (e) => {
    e?.preventDefault()
    if (!pin.trim()) return
    setDecrypting(true)
    setPinError(null)

    try {
      const rawEncryptedBlob = await fetchRawBlob(token, file.id)
      const decryptedBlob = await decryptFile(rawEncryptedBlob, pin.trim(), originalMime)
      const url = URL.createObjectURL(decryptedBlob)
      setBlobUrl(url)
      setUnlocked(true)
    } catch (err) {
      setPinError(err.message || 'Incorrect PIN')
    } finally {
      setDecrypting(false)
    }
  }

  const handleWheel = useCallback(e => {
    if (isVideo) return
    e.preventDefault()
    setZoom(z => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)))
  }, [isVideo])

  const handleDblClick = () => {
    if (isVideo) return
    setZoom(z => z !== 1 ? 1 : 2)
    setPanOffset({ x: 0, y: 0 })
  }

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

  const displayTags = parseTags(file?.description || '')

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-vault-bg/95 backdrop-blur-xl">

      {/* Close button (top right) */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 btn-icon w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
        aria-label="Close"
      >
        <IconClose className="w-4 h-4" />
      </button>

      {/* Zoom indicator (desktop images only) */}
      {!isVideo && !isEncrypted && zoom !== 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full text-xs text-white font-mono bg-black/60 border border-white/10">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Main Media Area */}
      <div
        className={`flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden min-h-[50vh] ${!isVideo && !isEncrypted && zoom > 1 ? 'cursor-zoom-out' : !isVideo && !isEncrypted ? 'cursor-zoom-in' : ''}`}
        onWheel={handleWheel}
        onDoubleClick={handleDblClick}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-vault-border border-t-vault-accent animate-spin" />
            <p className="text-xs text-vault-muted">Loading media…</p>
          </div>
        ) : isEncrypted && !unlocked ? (
          /* Locked PIN Prompt Card */
          <div className="w-full max-w-xs p-6 rounded-2xl space-y-4 bg-vault-surface border border-white/10 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
              <IconLock className="w-6 h-6 text-vault-warning" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-vault-text">Encrypted File</h3>
              <p className="text-xs text-vault-muted mt-1 truncate">
                Enter your secret PIN to decrypt and view
              </p>
            </div>

            {pinError && (
              <p className="text-xs text-vault-danger bg-vault-danger/10 py-1.5 px-2.5 rounded-lg">
                {pinError}
              </p>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="input-field text-center font-mono tracking-widest text-base py-2.5"
                maxLength={24}
                autoFocus
              />
              <button
                type="submit"
                disabled={decrypting || !pin.trim()}
                className="btn-primary w-full justify-center text-xs py-2.5 disabled:opacity-40"
              >
                {decrypting ? 'Decrypting…' : 'Unlock & View'}
              </button>
            </form>
          </div>
        ) : blobUrl ? (
          isVideo ? (
            <video
              src={blobUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl bg-black"
            />
          ) : isPDF ? (
            <iframe
              src={`${blobUrl}#toolbar=1`}
              title={file.name}
              className="w-full h-full max-h-[85vh] rounded-xl border border-white/10"
            />
          ) : (
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
          )
        ) : null}
      </div>

      {/* Info & Actions Sidebar (Desktop side, Mobile bottom-sheet) */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col bg-vault-surface border-t lg:border-t-0 lg:border-l border-vault-border max-h-[42vh] lg:max-h-full overflow-y-auto">

        {/* File Header */}
        <div className="p-4 border-b border-vault-border space-y-1">
          <div className="flex items-center gap-2">
            {isEncrypted && <IconLock className="w-4 h-4 text-vault-warning shrink-0" />}
            <p className="text-sm font-semibold text-vault-text truncate">{file.name}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-vault-muted">
            <span>{formatBytes(file.size)}</span>
            <span>·</span>
            <span>{formatDate(file.modifiedTime)}</span>
          </div>
        </div>

        {/* Tags & notes */}
        <div className="p-4 border-b border-vault-border space-y-2.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="section-label flex items-center gap-1.5">
              <IconTag className="w-3 h-3" /> Tags & notes
            </span>
            <button
              onClick={() => setEditing(e => !e)}
              className="text-vault-faint hover:text-vault-muted text-xs transition-colors"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="tag1, tag2…"
                className="input-field text-xs py-1.5"
              />
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add notes…"
                rows={2}
                className="input-field text-xs"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className={`btn-primary w-full justify-center text-xs py-1.5 ${saved ? 'bg-vault-success' : ''}`}
              >
                {saved ? <><IconCheck className="w-3.5 h-3.5" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayTags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {displayTags.map(t => <span key={t} className="tag-badge">{t}</span>)}
                </div>
              ) : (
                <p className="text-xs text-vault-faint italic">No tags attached</p>
              )}
              {file.appProperties?.notes && (
                <p className="text-xs text-vault-muted leading-relaxed break-words pt-1">
                  {file.appProperties.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Desktop zoom controls (images only) */}
        {!isVideo && !isPDF && !isEncrypted && (
          <div className="hidden lg:block p-4 border-b border-vault-border">
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
        )}

        {/* Actions */}
        <div className="p-3.5 sm:p-4 space-y-1.5 mt-auto">
          {blobUrl && (
            <button onClick={handleDownload} className="btn-ghost w-full justify-start text-xs py-2 gap-2.5">
              <IconDownload className="w-3.5 h-3.5" /> Download
            </button>
          )}
          <button onClick={() => onArchive(file)} className="btn-ghost w-full justify-start text-xs py-2 gap-2.5">
            <IconArchive className="w-3.5 h-3.5" /> Move to Archive
          </button>
          <button onClick={() => onTrash(file)} className="btn-danger w-full justify-start text-xs py-2 gap-2.5">
            <IconTrash className="w-3.5 h-3.5" /> Move to Trash
          </button>
        </div>
      </div>
    </div>
  )
}
