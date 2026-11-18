import { IconVault, IconGoogle, IconShield, IconLayers, IconTag } from './Icons'

/** Features shown on login page */
const FEATURES = [
  { icon: IconShield,  label: 'Private by default', desc: 'Locked to your Gmail. Any other account is instantly rejected.' },
  { icon: IconLayers,  label: 'Your Drive, your rules', desc: 'Files live in a private folder only this app can touch.' },
  { icon: IconTag,     label: 'Tags & full-text search', desc: 'Find anything in seconds — stored in Drive metadata.' },
]

export default function LoginScreen({ onSignIn, error, isInitializing, initProgress }) {
  return (
    <div className="min-h-screen bg-vault-bg dot-grid flex items-center justify-center px-4 py-12">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(91,127,255,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">

        {/* Wordmark + icon */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #5B7FFF 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 24px rgba(91,127,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            <IconVault className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-vault-text">My Vault</h1>
            <p className="mt-1.5 text-sm text-vault-muted leading-relaxed">
              Personal file storage on top of Google Drive.
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(13,16,23,0.9)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>

          {/* Feature list */}
          <div className="px-6 pt-6 pb-5 space-y-4 border-b border-vault-border">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(91,127,255,0.1)', border: '1px solid rgba(91,127,255,0.15)' }}>
                  <Icon className="w-3.5 h-3.5 text-vault-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-vault-subtle leading-none mb-0.5">{label}</p>
                  <p className="text-xs text-vault-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sign-in area */}
          <div className="px-6 py-5 space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-xs text-vault-danger leading-relaxed"
                style={{ background: 'rgba(240,71,71,0.08)', border: '1px solid rgba(240,71,71,0.2)' }}>
                <span className="mt-px flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {isInitializing ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-2 border-vault-border" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-vault-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                <p className="text-xs text-vault-muted">{initProgress || 'Initialising vault…'}</p>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: '#fff',
                  color: '#1a1a1a',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'}
              >
                <IconGoogle className="w-4 h-4 flex-shrink-0" />
                Continue with Google
              </button>
            )}

            <p className="text-center text-vault-faint" style={{ fontSize: '0.65rem' }}>
              Access restricted to the registered owner only
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-vault-faint" style={{ fontSize: '0.65rem' }}>
          Runs entirely in your browser · ₹0 hosting · Google Drive storage
        </p>
      </div>
    </div>
  )
}
