import { useState, useEffect } from 'react'
import { fetchFileBlob } from '../lib/driveApi'
import { formatBytes, formatDate, getFileCategory, parseTags } from '../lib/utils'
import { IconArchive, IconTrash, IconRefresh, IconFileImage, IconFilePDF, IconFileDoc, IconFileSheet, IconFileVideo, IconFileGeneric, IconLock } from './Icons'

const FILE_TYPE_MAP = {
  image: { Icon: IconFileImage, cls: 'ft-image', label: 'IMG' },
  pdf:   { Icon: IconFilePDF,   cls: 'ft-pdf',   label: 'PDF' },
  doc:   { Icon: IconFileDoc,   cls: 'ft-doc',   label: 'DOC' },
  sheet: { Icon: IconFileSheet, cls: 'ft-sheet',  label: 'XLS' },
  video: { Icon: IconFileVideo, cls: 'ft-video',  label: 'VID' },
  other: { Icon: IconFileGeneric, cls: 'ft-other', label: 'FILE' },
}

export default function FileGrid({
  files, loading, token, folderMap,
  activeTab, searchQuery,
  onRefresh, onImageClick, onPDFClick, onArchive, onTrash,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-white/5 bg-vault-card">
            <div className="aspect-square skeleton" />
            <div className="p-2 space-y-2">
              <div className="h-2.5 rounded skeleton w-4/5" />
              <div className="h-2 rounded skeleton w-2/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none animate-fade-in">
        <div className="mb-4 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.15)' }}>
          <IconFileGeneric className="w-5 h-5 text-vault-faint" />
        </div>
        <p className="text-sm font-medium text-vault-subtle mb-1">
          {searchQuery ? `No files found for "${searchQuery}"` : `${activeTab} is empty`}
        </p>
        <p className="text-xs text-vault-muted max-w-xs mb-5 leading-relaxed">
          {searchQuery ? 'Try another keyword, tag, or check another folder.' : 'Use the Upload button above to add files securely.'}
        </p>
        <button onClick={onRefresh} className="btn-ghost text-xs py-1.5 px-3">
          <IconRefresh className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-3">
      {/* Grid header count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-vault-muted">
          <span className="font-medium text-vault-subtle">{files.length}</span>
          {' '}{files.length === 1 ? 'file' : 'files'}
          {searchQuery && <span className="text-vault-faint"> · filtered</span>}
        </span>
        <button onClick={onRefresh} className="btn-icon w-7 h-7" title="Refresh">
          <IconRefresh className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive file grid (2 cols on small phone, up to 6 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {files.map((file, i) => (
          <FileCard
            key={file.id}
            file={file}
            token={token}
            folderMap={folderMap}
            index={i}
            onImageClick={onImageClick}
            onPDFClick={onPDFClick}
            onArchive={onArchive}
            onTrash={onTrash}
          />
        ))}
      </div>
    </div>
  )
}

function FileCard({ file, token, folderMap, index, onImageClick, onPDFClick, onArchive, onTrash }) {
  const [blobUrl, setBlobUrl]       = useState(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [hovered, setHovered]       = useState(false)

  const isEncrypted = file.appProperties?.encrypted === 'true'
  const category    = getFileCategory(file.appProperties?.originalMimeType || file.mimeType)
  const isImage     = category === 'image'
  const isPDF       = category === 'pdf'
  const isVideo     = category === 'video'
  const tags        = parseTags(file.description)
  const { Icon, cls, label } = FILE_TYPE_MAP[category] || FILE_TYPE_MAP.other
  const isArchive   = file.parents?.includes(folderMap['Archive'])

  // Load image thumbnail for unencrypted images
  useEffect(() => {
    if (!isImage || isEncrypted || blobUrl) return
    setImgLoading(true)
    fetchFileBlob(token, file.id)
      .then(url => { setBlobUrl(url); setImgLoading(false) })
      .catch(() => setImgLoading(false))
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [file.id, isImage, isEncrypted, token])

  const handleClick = () => {
    if (isEncrypted) {
      // Encrypted files open the unified decrypt viewer
      onImageClick(file)
    } else if (isImage || isVideo) {
      onImageClick(file)
    } else if (isPDF) {
      onPDFClick(file)
    }
  }

  return (
    <div
      className="file-card group relative"
      style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail area */}
      <div
        className="aspect-square relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
        style={{ background: '#090B0F' }}
        onClick={handleClick}
      >
        {isEncrypted ? (
          /* Encrypted lock preview */
          <div className="flex flex-col items-center justify-center gap-1.5 text-center p-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
              <IconLock className="w-5 h-5 text-vault-warning" />
            </div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-vault-warning">
              PIN Protected
            </span>
          </div>
        ) : isImage ? (
          <>
            {imgLoading && <div className="absolute inset-0 skeleton" />}
            {blobUrl && (
              <img
                src={blobUrl}
                alt={file.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
                draggable={false}
              />
            )}
            {!blobUrl && !imgLoading && <NonImagePreview Icon={Icon} cls={cls} />}
          </>
        ) : (
          <NonImagePreview Icon={Icon} cls={cls} />
        )}

        {/* Hover / Touch overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg"
            style={{ background: isEncrypted ? 'rgba(245,166,35,0.9)' : 'rgba(91,127,255,0.9)' }}>
            {isEncrypted ? '🔒 Unlock' : isVideo ? '▶ Play' : isImage ? 'View' : 'Open'}
          </span>
        </div>

        {/* Top-left Type badge */}
        <div className={`absolute top-1.5 left-1.5 text-2xs font-semibold px-1.5 py-0.5 rounded shadow-sm ${cls}`}
          style={{ backdropFilter: 'blur(8px)' }}>
          {isEncrypted ? 'ENC' : label}
        </div>

        {/* Action buttons (always visible on mobile touch, hover on desktop) */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 transition-all duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-1 sm:group-hover:translate-x-0">
          {!isArchive && (
            <button
              onClick={e => { e.stopPropagation(); onArchive(file) }}
              title="Archive"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-vault-muted hover:text-vault-text transition-colors"
              style={{ background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <IconArchive className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onTrash(file) }}
            title="Delete"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-vault-danger transition-colors"
            style={{ background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(240,71,71,0.25)' }}
          >
            <IconTrash className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="px-2.5 py-2 space-y-1 bg-vault-card">
        <p className="text-xs font-medium text-vault-subtle truncate leading-tight" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-vault-faint" style={{ fontSize: '0.62rem' }}>
            {formatDate(file.modifiedTime || file.createdTime)}
          </span>
          <span className="text-vault-faint font-mono" style={{ fontSize: '0.62rem' }}>
            {formatBytes(file.size)}
          </span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="tag-badge truncate max-w-[80px]">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NonImagePreview({ Icon, cls }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${cls}`}
        style={{ backdropFilter: 'blur(8px)' }}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
