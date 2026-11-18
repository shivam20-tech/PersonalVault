import { useEffect } from 'react'
import { IconClose } from './Icons'

const NAV_CONFIG = [
  { id: 'All Files',             icon: 'M3.5 6a2.5 2.5 0 0 1 5 0v8a2.5 2.5 0 0 1-5 0V6zM11.5 8a2.5 2.5 0 0 1 5 0v4a2.5 2.5 0 0 1-5 0V8z', label: 'All Files' },
  { id: 'Important Documents',   icon: 'M11.5 2.5H5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7L11.5 2.5zM11.5 2.5V7H16.5', label: 'Documents', shortLabel: 'Docs' },
  { id: 'Memories & Photos',     icon: 'M2.5 4a1.5 1.5 0 0 1 1.5-1.5h12A1.5 1.5 0 0 1 17.5 4v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V4zm4 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4 7 5-5.5 3 3 2-2 4 4.5', label: 'Photos', shortLabel: 'Photos' },
  { id: 'Personal Notes & Misc', icon: 'M3.5 4A1.5 1.5 0 0 1 5 2.5h10A1.5 1.5 0 0 1 16.5 4v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16V4zm3 4h7M6.5 10h7M6.5 13h4', label: 'Notes', shortLabel: 'Notes' },
  { id: 'Archive',               icon: 'M17.5 6.5v10A1.5 1.5 0 0 1 16 18H4a1.5 1.5 0 0 1-1.5-1.5v-10M1.5 2.5h17a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zM8 10.5h4', label: 'Archive', shortLabel: 'Archive' },
]

function NavIcon({ d }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  )
}

function NavList({ items, activeTab, onTabChange }) {
  return (
    <nav className="p-2 space-y-0.5">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
        >
          <NavIcon d={item.icon} />
          <span className="truncate">{item.label}</span>
          {activeTab === item.id && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-vault-accent shrink-0" />
          )}
        </button>
      ))}
    </nav>
  )
}

export default function Sidebar({ navItems, activeTab, onTabChange, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-vault-border bg-vault-surface">
        <div className="px-4 pt-5 pb-2">
          <span className="section-label">Folders</span>
        </div>
        <NavList items={NAV_CONFIG} activeTab={activeTab} onTabChange={onTabChange} />
        <div className="mt-auto px-4 py-4 border-t border-vault-border">
          <p className="text-vault-faint" style={{ fontSize: '0.6rem' }}>
            Stored in Google Drive<br />
            <span className="text-vault-accent">drive.file</span> scope only
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/70" onClick={onClose}
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <aside className="relative w-60 bg-vault-surface border-r border-vault-border flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-vault-border">
              <span className="text-xs font-semibold text-vault-subtle">Navigate</span>
              <button onClick={onClose} className="btn-icon w-7 h-7">
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>
            <NavList items={NAV_CONFIG} activeTab={activeTab} onTabChange={onTabChange} />
          </aside>
        </div>
      )}
    </>
  )
}
