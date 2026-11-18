import { useState, useEffect, useCallback } from 'react'
import { initGIS, signIn, signOut } from './lib/auth'
import { initVaultFolders, clearFolderCache } from './lib/driveApi'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'

/**
 * Root app component — manages auth state and vault initialization.
 */
export default function App() {
  const [authState, setAuthState]     = useState('loading') // loading | unauthenticated | initializing | ready | error
  const [token, setToken]             = useState(null)
  const [userInfo, setUserInfo]       = useState(null)
  const [vaultData, setVaultData]     = useState(null)   // { rootId, folderMap }
  const [authError, setAuthError]     = useState(null)
  const [initProgress, setInitProgress] = useState('')

  // ── Initialise GIS on mount ──────────────────────────────────────────────
  useEffect(() => {
    // Wait for GIS script to load
    const tryInit = () => {
      if (typeof google === 'undefined' || !google?.accounts?.oauth2) {
        setTimeout(tryInit, 200)
        return
      }
      initGIS(
        handleAuthSuccess,
        (err) => {
          setAuthError(err)
          setAuthState('error')
        }
      )
      setAuthState('unauthenticated')
    }
    tryInit()
  }, [])

  // ── Handle successful OAuth token grant ─────────────────────────────────
  const handleAuthSuccess = useCallback(async ({ token: newToken, userInfo: ui }) => {
    setToken(newToken)
    setUserInfo(ui)
    setAuthState('initializing')
    setInitProgress('Setting up your vault folders…')

    try {
      const vault = await initVaultFolders(newToken)
      setVaultData(vault)
      setAuthState('ready')
    } catch (err) {
      setAuthError(`Vault initialization failed: ${err.message}`)
      setAuthState('error')
    }
  }, [])

  // ── Sign out ─────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(() => {
    signOut(token)
    clearFolderCache()
    setToken(null)
    setUserInfo(null)
    setVaultData(null)
    setAuthError(null)
    setAuthState('unauthenticated')
  }, [token])

  // ── Trigger sign-in ──────────────────────────────────────────────────────
  const handleSignIn = useCallback(() => {
    setAuthError(null)
    try { signIn() }
    catch (e) { setAuthError(e.message) }
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <div className="text-vault-muted text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  if (authState === 'ready' && token && vaultData) {
    return (
      <Dashboard
        token={token}
        userInfo={userInfo}
        vaultData={vaultData}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <LoginScreen
      onSignIn={handleSignIn}
      error={authError}
      isInitializing={authState === 'initializing'}
      initProgress={initProgress}
    />
  )
}
