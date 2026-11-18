import { useState } from 'react'
import { IconVault, IconUpload, IconSearch, IconSignOut, IconMenu, IconClose, IconPlus } from './Icons'

export default function TopBar({ userInfo, searchQuery, onSearch, onUpload, onNewFolder, onSignOut, onMenuToggle }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 glass border-b border-vault-border">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 max-w-screen-2xl mx-auto">

        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <button onClick={onMenuToggle} className="btn-icon lg:hidden w-8 h-8 -ml-1" aria-label="Open folders">
            <IconMenu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #5B7FFF, #8B5CF6)', boxShadow: '0 2px 8px rgba(91,127,255,0.4)' }}>
              <IconVault className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-vault-text tracking-tight">My Vault</span>
          </div>
        </div>

        {/* Center: Desktop search bar */}
        <div className="hidden sm:block flex-1 max-w-md mx-3">
          <div className="relative group">
            <IconSearch className="w-3.5 h-3.5 text-vault-faint absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-vault-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search files, notes and tags…"
              className="input-field pl-9 text-xs py-2"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-muted text-xs p-1"
              >
                <IconClose className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(o => !o)}
            className="btn-icon sm:hidden w-8 h-8"
            aria-label="Search"
          >
            <IconSearch className="w-4 h-4" />
          </button>

          {/* New Folder button */}
          <button
            onClick={onNewFolder}
            className="btn-ghost text-xs py-1.5 px-2.5 hidden md:flex items-center gap-1.5"
            title="Create new folder"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Folder</span>
          </button>

          {/* Primary Upload button */}
          <button onClick={onUpload} className="btn-primary text-xs py-1.5 px-3 font-medium">
            <IconUpload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          <div className="w-px h-4 bg-vault-border mx-0.5 hidden sm:block" />

          {/* User profile picture */}
          {userInfo?.picture && (
            <img
              src={userInfo.picture}
              alt={userInfo.name}
              title={userInfo.email}
              className="w-6 h-6 rounded-full ring-1 ring-vault-border hidden sm:block shrink-0"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Sign out */}
          <button onClick={onSignOut} className="btn-icon w-8 h-8" title={`Sign out (${userInfo?.email})`}>
            <IconSignOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search dropdown bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-2.5 pt-1 animate-fade-in border-t border-vault-border/50">
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 text-vault-faint absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search files and tags…"
              autoFocus
              className="input-field pl-9 pr-8 text-xs py-2 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-faint p-1"
              >
                <IconClose className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
