import { useEffect } from 'react'
import { IconClose, IconPlus, IconFolder } from './Icons'

const DEFAULT_ICONS = {
  'All Files':             'M3.5 6a2.5 2.5 0 0 1 5 0v8a2.5 2.5 0 0 1-5 0V6zM11.5 8a2.5 2.5 0 0 1 5 0v4a2.5 2.5 0 0 1-5 0V8z',
  'Important Documents':   'M11.5 2.5H5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7L11.5 2.5zM11.5 2.5V7H16.5',
  'Memories & Photos':     'M2.5 4a1.5 1.5 0 0 1 1.5-1.5h12A1.5 1.5 0 0 1 17.5 4v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V4zm4 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4 7 5-5.5 3 3 2-2 4 4.5',
  'Personal Notes & Misc': 'M3.5 4A1.5 1.5 0 0 1 5 2.5h10A1.5 1.5 0 0 1 16.5 4v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16V4zm3 4h7M6.5 10h7M6.5 13h4',
  'Archive':               'M17.5 6.5v10A1.5 1.5 0 0 1 16 18H4a1.5 1.5 0 0 1-1.5-1.5v-10M1.5 2.5h17a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zM8 10.5h4',
}

function NavIcon({ d }) {
  if (!d) return <IconFolder className="w-4 h-4 shrink-0" />
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  )
}

function NavList({ items, activeTab, onTabChange, onNewFolder }) {
  return (
    <nav className="p-2 space-y-0.5">
      {items.map(folderName => (
        <button
          key={folderName}
          onClick={() => onTabChange(folderName)}
          className={`nav-item ${activeTab === folderName ? 'active' : ''}`}
        >
          <NavIcon d={DEFAULT_ICONS[folderName]} />
          <span className="truncate">{folderName}</span>
          {activeTab === folderName && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-vault-accent shrink-0" />
          )}
        </button>
      ))}

      {/* Inline Add Folder Button */}
      <button
        onClick={onNewFolder}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-vault-accent hover:text-vault-accentHover hover:bg-vault-accent/10 transition-colors mt-2"
      >
        <IconPlus className="w-3.5 h-3.5" />
        <span>New Folder</span>
      </button>
    </nav>
  )
}

export default function Sidebar({ navItems, activeTab, onTabChange, onNewFolder, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-vault-border bg-vault-surface">
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <span className="section-label">Folders</span>
          <button
            onClick={onNewFolder}
            className="text-vault-muted hover:text-vault-text p-1 rounded hover:bg-white/5 transition-colors"
            title="Create new folder"
          >
            <IconPlus className="w-3.5 h-3.5" />
          </button>
        </div>
        <NavList items={navItems} activeTab={activeTab} onTabChange={onTabChange} onNewFolder={onNewFolder} />
        <div className="mt-auto px-4 py-4 border-t border-vault-border">
          <p className="text-vault-faint" style={{ fontSize: '0.6rem' }}>
            Private Google Drive storage<br />
            <span className="text-vault-accent">AES-256</span> PIN protection
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/80" onClick={onClose}
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
          <aside className="relative w-64 bg-vault-surface border-r border-vault-border flex flex-col animate-slide-left h-full pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-vault-border">
              <span className="text-xs font-semibold text-vault-text">Folders</span>
              <button onClick={onClose} className="btn-icon w-8 h-8">
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList items={navItems} activeTab={activeTab} onTabChange={onTabChange} onNewFolder={onNewFolder} />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
