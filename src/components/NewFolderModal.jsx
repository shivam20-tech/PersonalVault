import { useState, useRef, useEffect } from 'react'
import { IconClose, IconFolder } from './Icons'

export default function NewFolderModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const folderName = name.trim()
    if (!folderName) return
    setLoading(true)
    setError(null)
    try {
      await onConfirm(folderName)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={!loading ? onCancel : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-xs bg-vault-surface rounded-2xl overflow-hidden p-6 space-y-4"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>

        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(91,127,255,0.15)', border: '1px solid rgba(91,127,255,0.25)' }}>
            <IconFolder className="w-5 h-5 text-vault-accent" />
          </div>
          {!loading && (
            <button onClick={onCancel} className="btn-icon w-7 h-7">
              <IconClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-vault-text">Create New Folder</h3>
          <p className="text-xs text-vault-muted mt-0.5">
            Organize files into a custom vault folder.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg text-xs text-vault-danger"
            style={{ background: 'rgba(240,71,71,0.1)', border: '1px solid rgba(240,71,71,0.25)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name (e.g. Private Videos)"
            className="input-field text-xs py-2.5"
            maxLength={60}
          />

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-ghost flex-1 justify-center text-xs py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary flex-1 justify-center text-xs py-2 disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
