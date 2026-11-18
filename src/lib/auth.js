/**
 * Google Identity Services (GIS) authentication helpers.
 * Uses the modern token-based flow (NOT the deprecated gapi.auth2).
 * Scope: drive.file — ONLY files created by this app.
 */

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL
const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID

// In-memory token store
let _tokenClient = null
let _currentToken = null

/**
 * Initialise the GIS token client (call once on app load).
 * @param {Function} onSuccess  Called with { token, userInfo } on success
 * @param {Function} onError    Called with error message string
 */
export function initGIS(onSuccess, onError) {
  if (!CLIENT_ID) {
    onError('Missing VITE_GOOGLE_CLIENT_ID in environment. See .env.example.')
    return
  }

  _tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      if (tokenResponse.error) {
        onError(tokenResponse.error_description || tokenResponse.error)
        return
      }

      _currentToken = tokenResponse.access_token

      // Fetch user profile to enforce single-user lock
      try {
        const userInfo = await fetchUserInfo(_currentToken)

        if (ALLOWED_EMAIL && userInfo.email !== ALLOWED_EMAIL) {
          // Revoke the token immediately — unauthorized account
          revokeToken(_currentToken)
          _currentToken = null
          onError(`UNAUTHORIZED: This vault is locked to ${ALLOWED_EMAIL}. You signed in as ${userInfo.email}.`)
          return
        }

        onSuccess({ token: _currentToken, userInfo })
      } catch (err) {
        onError(err.message)
      }
    },
  })
}

/**
 * Trigger the Google sign-in popup.
 */
export function signIn() {
  if (!_tokenClient) throw new Error('GIS not initialised')
  _tokenClient.requestAccessToken({ prompt: 'consent' })
}

/**
 * Revoke the current token and sign out.
 */
export function signOut(token) {
  if (token) revokeToken(token)
  _currentToken = null
}

/**
 * Revoke a specific token via the GIS API.
 */
function revokeToken(token) {
  try {
    google.accounts.oauth2.revoke(token, () => {})
  } catch (_) {}
}

/**
 * Fetch the signed-in user's profile from Google's userinfo endpoint.
 */
async function fetchUserInfo(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}

/**
 * Returns the current access token (may be null before sign-in).
 */
export function getCurrentToken() {
  return _currentToken
}
