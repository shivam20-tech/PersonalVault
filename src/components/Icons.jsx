/**
 * Complete inline SVG icon set.
 * All 1.5px stroke-width, rounded caps/joins for a modern look.
 */

const icon = (paths, extra = '') => ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...(extra ? { dangerouslySetInnerHTML: { __html: paths } } : {})}>
    {!extra && paths}
  </svg>
)

export function IconVault({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="9" width="15" height="9" rx="2"/>
      <path d="M6.5 9V7a3.5 3.5 0 0 1 7 0v2"/>
      <circle cx="10" cy="13.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export function IconUpload({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 13.5 10 10l-3.5 3.5"/>
      <path d="M10 10v8"/>
      <path d="M17 13.9A5 5 0 0 0 15 5h-.9A7 7 0 1 0 2.5 12.8"/>
    </svg>
  )
}

export function IconSearch({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5.5"/>
      <path d="M17 17 13.5 13.5"/>
    </svg>
  )
}

export function IconSignOut({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 17.5H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h3.5"/>
      <path d="M13.5 14 17.5 10l-4-4"/>
      <path d="M17.5 10H8"/>
    </svg>
  )
}

export function IconMenu({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5h15M2.5 10h15M2.5 15h15"/>
    </svg>
  )
}

export function IconClose({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5 5 15M5 5l10 10"/>
    </svg>
  )
}

export function IconDownload({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 13.5v2A1.5 1.5 0 0 1 16 17H4a1.5 1.5 0 0 1-1.5-1.5v-2"/>
      <path d="M6 8.5l4 4 4-4"/>
      <path d="M10 2.5v10"/>
    </svg>
  )
}

export function IconTrash({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5h15"/>
      <path d="M6.5 5V3.5A1 1 0 0 1 7.5 2.5h5A1 1 0 0 1 13.5 3.5V5"/>
      <path d="M4 5l1 11.5A1.5 1.5 0 0 0 6.5 18h7a1.5 1.5 0 0 0 1.5-1.5L16 5"/>
      <path d="M8 9v5M12 9v5"/>
    </svg>
  )
}

export function IconArchive({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 6.5v10A1.5 1.5 0 0 1 16 18H4a1.5 1.5 0 0 1-1.5-1.5v-10"/>
      <rect x="1.5" y="2.5" width="17" height="4" rx="1"/>
      <path d="M8 10.5h4"/>
    </svg>
  )
}

export function IconEdit({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3.5H4A1.5 1.5 0 0 0 2.5 5v11A1.5 1.5 0 0 0 4 17.5h11A1.5 1.5 0 0 0 16.5 16v-5"/>
      <path d="M15.1 2.9a2 2 0 0 1 2.9 2.9L10.5 13.3l-3.5.8.8-3.5 7.3-7.7z"/>
    </svg>
  )
}

export function IconTag({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 10.6 9.4 18.7a1.5 1.5 0 0 1-2.1 0L2 13.4a1.5 1.5 0 0 1 0-2.1L10.1 3h5.9a1.5 1.5 0 0 1 1.5 1.5V10.6z"/>
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export function IconShield({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 3.5 4.5v5.5c0 4 2.9 6.9 6.5 8 3.6-1.1 6.5-4 6.5-8V4.5L10 2z"/>
      <path d="M7 10.5l2 2 4-4"/>
    </svg>
  )
}

export function IconLayers({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7.5 10 12l7.5-4.5L10 3 2.5 7.5z"/>
      <path d="M2.5 12.5 10 17l7.5-4.5"/>
      <path d="M2.5 10 10 14.5l7.5-4.5"/>
    </svg>
  )
}

export function IconRefresh({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10A7 7 0 1 1 10 3c2.1 0 4 .9 5.4 2.3L17 7"/>
      <path d="M17 3v4h-4"/>
    </svg>
  )
}

export function IconChevronLeft({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 5 7.5 10l5 5"/>
    </svg>
  )
}

export function IconChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 5l5 5-5 5"/>
    </svg>
  )
}

export function IconZoomIn({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5.5"/>
      <path d="M17.5 17.5 13.5 13.5"/>
      <path d="M8.5 6v5M6 8.5h5"/>
    </svg>
  )
}

export function IconZoomOut({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5.5"/>
      <path d="M17.5 17.5 13.5 13.5"/>
      <path d="M6 8.5h5"/>
    </svg>
  )
}

export function IconGoogle({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ── File type icons — stroked SVG, NOT emoji ── */

export function IconFileImage({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="2"/>
      <circle cx="7" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M2.5 14 7 9.5l3 3 2.5-2.5 5 5"/>
    </svg>
  )
}

export function IconFilePDF({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5H5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7L11.5 2.5z"/>
      <path d="M11.5 2.5V7H16.5"/>
      <path d="M6.5 11.5h3M6.5 14h7M6.5 9h2"/>
    </svg>
  )
}

export function IconFileDoc({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5H5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7L11.5 2.5z"/>
      <path d="M11.5 2.5V7H16.5"/>
      <path d="M6.5 10.5h7M6.5 13h7M6.5 15.5h4"/>
    </svg>
  )
}

export function IconFileSheet({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/>
      <path d="M2.5 7.5h15M7.5 7.5v10"/>
    </svg>
  )
}

export function IconFileGeneric({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5H5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7L11.5 2.5z"/>
      <path d="M11.5 2.5V7H16.5"/>
    </svg>
  )
}

export function IconFileVideo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="11" height="11" rx="1.5"/>
      <path d="M13.5 8l4-2v8l-4-2"/>
    </svg>
  )
}

export function IconMove({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M4 12v3a1 1 0 0 0 1 1h3M16 8V5a1 1 0 0 0-1-1h-3M16 12v3a1 1 0 0 1-1 1h-3"/>
      <circle cx="10" cy="10" r="2"/>
    </svg>
  )
}

export function IconGrid({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1"/>
      <rect x="11.5" y="2.5" width="6" height="6" rx="1"/>
      <rect x="2.5" y="11.5" width="6" height="6" rx="1"/>
      <rect x="11.5" y="11.5" width="6" height="6" rx="1"/>
    </svg>
  )
}

export function IconList({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5h15M2.5 10h15M2.5 15h15"/>
    </svg>
  )
}

export function IconCheck({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4.5 4.5L16 6"/>
    </svg>
  )
}

export function IconFolder({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h3.5l2 2H16A1.5 1.5 0 0 1 17.5 7.5v7A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9z"/>
    </svg>
  )
}

export function IconPlus({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4.5v11M4.5 10h11"/>
    </svg>
  )
}

export function IconLock({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8.5" width="12" height="8.5" rx="2"/>
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5"/>
    </svg>
  )
}
