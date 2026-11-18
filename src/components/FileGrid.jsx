import { useState, useEffect, useCallback } from 'react'
import { fetchFileBlob } from '../lib/driveApi'
import { formatBytes, formatDate, getFileCategory, parseTags } from '../lib/utils'
import { IconArchive, IconTrash, IconRefresh, IconFileImage, IconFilePDF, IconFileDoc, IconFileSheet, IconFileVideo, IconFileGeneric } from './Icons'

/** Map category → { Icon component, colorClass, label } */
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
  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{
            border: '1px solid rgba(255,255,255,0.04)',
            animationDelay: `${i * 60}ms`
          }}>
            <div className="aspect-square skeleton" />
            <div className="p-2.5 space-y-2 bg-vault-card">
              <div className="h-2.5 rounded skeleton w-4/5" />
              <div className="h-2 rounded skeleton w-2/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Empty state ── */
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 select-none animate-fade-in">
        <div className="mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(91,127,255,0.07)', border: '1px solid rgba(91,127,255,0.12)' }}>
          <IconFileGeneric className="w-6 h-6 text-vault-faint" />
        </div>
        <p className="text-sm font-medium text-vault-subtle mb-1">
          {searchQuery ? `No results for "${searchQuery}"` : `${activeTab} is empty`}
        </p>
        <p className="text-xs text-vault-muted mb-5">
          {searchQuery ? 'Try a different keyword or tag' : 'Upload files to get started'}
        </p>
        <button onClick={onRefresh} className="btn-ghost text-xs">
          <IconRefresh className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Toolbar row */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <span className="text-xs text-vault-muted">
          <span className="font-medium text-vault-subtle">{files.length}</span>
          {' '}{files.length === 1 ? 'file' : 'files'}
          {searchQuery && <span className="text-vault-faint"> · search results</span>}
        </span>
        <button onClick={onRefresh} className="btn-icon w-7 h-7" title="Refresh">
          <IconRefresh className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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

/* ─────────────────────────────────────────────────────────────────────── */

function FileCard({ file, token, folderMap, index, onImageClick, onPDFClick, onArchive, onTrash }) {
  const [blobUrl, setBlobUrl]       = useState(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [hovered, setHovered]       = useState(false)
  const category = getFileCategory(file.mimeType)
  const isImage  = category === 'image'
  const isPDF    = category === 'pdf'
  const tags     = parseTags(file.description)
  const { Icon, cls, label } = FILE_TYPE_MAP[category] || FILE_TYPE_MAP.other
  const isArchive = file.parents?.includes(folderMap['Archive'])

  /* Authenticated image thumbnail */
  useEffect(() => {
    if (!isImage || blobUrl) return
    setImgLoading(true)
    fetchFileBlob(token, file.id)
      .then(url => { setBlobUrl(url); setImgLoading(false) })
      .catch(() => setImgLoading(false))
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [file.id, isImage, token])

  const handleClick = () => {
    if (isImage) onImageClick(file)
    else if (isPDF) onPDFClick(file)
  }

  return (
    <div
      className="file-card"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail / icon area */}
      <div
        className="aspect-square relative overflow-hidden flex items-center justify-center cursor-pointer"
        style={{ background: '#0a0c10' }}
        onClick={handleClick}
      >
        {isImage ? (
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

        {/* Hover overlay for clickable files */}
        {(isImage || isPDF) && (
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-150"
            style={{ opacity: hovered ? 1 : 0, background: 'rgba(0,0,0,0.5)' }}>
            <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(91,127,255,0.8)', backdropFilter: 'blur(8px)' }}>
              {isImage ? 'View' : 'Preview'}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className={`absolute top-1.5 left-1.5 text-2xs font-semibold px-1.5 py-0.5 rounded ${cls}`}
          style={{ backdropFilter: 'blur(8px)' }}>
          {label}
        </div>

        {/* Action buttons — appear on hover */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 transition-all duration-150"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(4px)' }}>
          {!isArchive && (
            <button
              onClick={e => { e.stopPropagation(); onArchive(file) }}
              title="Archive"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-vault-muted hover:text-vault-text transition-colors"
              style={{ background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <IconArchive className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onTrash(file) }}
            title="Delete"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-vault-danger transition-colors"
            style={{ background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(240,71,71,0.2)' }}
          >
            <IconTrash className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="px-2.5 py-2 space-y-1 bg-vault-card">
        <p className="text-xs font-medium text-vault-subtle truncate leading-snug" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-vault-faint" style={{ fontSize: '0.6rem' }}>
            {formatDate(file.modifiedTime || file.createdTime)}
          </span>
          <span className="text-vault-faint" style={{ fontSize: '0.6rem' }}>
            {formatBytes(file.size)}
          </span>
        </div>
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="tag-badge">{t}</span>
            ))}
            {tags.length > 2 && (
              <span className="tag-badge">+{tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function NonImagePreview({ Icon, cls }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cls}`}
        style={{ backdropFilter: 'blur(8px)' }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
