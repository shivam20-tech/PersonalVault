import { IconVault, IconUpload, IconSearch, IconSignOut, IconMenu, IconRefresh } from './Icons'

export default function TopBar({ userInfo, searchQuery, onSearch, onUpload, onSignOut, onMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-vault-border">
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-screen-2xl mx-auto">

        {/* Mobile menu */}
        <button onClick={onMenuToggle} className="btn-icon lg:hidden" aria-label="Menu">
          <IconMenu />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 select-none shrink-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5B7FFF, #8B5CF6)', boxShadow: '0 2px 8px rgba(91,127,255,0.4)' }}>
            <IconVault className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-vault-text tracking-tight hidden sm:block">My Vault</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative group">
            <IconSearch className="w-3.5 h-3.5 text-vault-faint absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-vault-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search files and tags…"
              className="input-field pl-9 text-xs py-2"
            />
            {searchQuery && (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-faint pointer-events-none"
                style={{ fontSize: '0.6rem' }}>
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={onUpload} className="btn-primary text-xs py-1.5 px-3">
            <IconUpload className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Upload</span>
          </button>

          <div className="w-px h-5 bg-vault-border mx-1" />

          {userInfo?.picture && (
            <img
              src={userInfo.picture}
              alt={userInfo.name}
              title={userInfo.email}
              className="w-6 h-6 rounded-full ring-1 ring-vault-border"
              referrerPolicy="no-referrer"
            />
          )}

          <button onClick={onSignOut} className="btn-icon" title={`Sign out (${userInfo?.email})`}>
            <IconSignOut />
          </button>
        </div>
      </div>
    </header>
  )
}
