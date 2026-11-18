# 🔒 Personal Digital Vault

> A free, private, single-user file vault built on **Google Drive** as the sole backend.  
> **₹0 hosting** · **₹0 database** · Google Drive 15 GB storage · Netlify + GitHub free tier.

---

## ✨ Features

- **Google Drive backend** — all files stored in a private `Personal_Vault_App/` folder
- **OAuth 2.0 Single-User Lock** — only your Gmail can sign in; any other account is instantly rejected
- **Narrow scope** — `drive.file` access only (app sees ONLY files it created, never your other Drive files)
- **Auto-folder setup** — 4 folders created on first login: Important Documents, Memories & Photos, Personal Notes & Misc, Archive
- **Image lightbox** — full-screen viewer with zoom, download, archive, delete
- **In-browser PDF viewer** — renders PDFs using authenticated blob URLs (no downloads on shared devices)
- **Drag-and-drop upload** — with real-time progress bars and per-file status
- **Custom tags & notes** — stored in Drive file metadata (no external database needed)
- **Live search** — searches file names and tags across all vault folders
- **Dark-mode UI** — Notion/iCloud-inspired design, mobile-first for iPhone 15 Safari

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/personal-vault.git
cd personal-vault
npm install
```

### 2. Set up Google Cloud OAuth (one-time, free)

Follow the checklist below — takes ~10 minutes.

### 3. Add environment variables

```bash
cp .env.example .env
# Edit .env with your Client ID and Gmail
```

### 4. Start dev server

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔑 Google Cloud OAuth Setup Checklist

### Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector (top-left) → **New Project**
3. Name: `PersonalVault` → **Create**
4. Wait ~30 seconds, then select the new project

### Step 2 — Enable Google Drive API

1. Left menu → **APIs & Services** → **Library**
2. Search: `Google Drive API` → Click it → **Enable**

### Step 3 — Configure OAuth Consent Screen

1. Left menu → **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → **Create**
3. Fill in:
   - **App name:** `My Personal Vault`
   - **User support email:** your Gmail
   - **Developer contact email:** your Gmail
4. Click **Save and Continue** (skip Scopes step)
5. On **Test users** page → **+ Add Users** → enter your Gmail → **Save**
6. Click **Back to Dashboard**

### Step 4 — Create OAuth 2.0 Client ID

1. Left menu → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Personal Vault Web Client`
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `https://YOUR_APP.netlify.app` ← your Netlify URL (add after deploy)
6. Leave **Authorized redirect URIs** empty (token flow, not code flow)
7. Click **Create**
8. **Copy the Client ID** (looks like `xxxx.apps.googleusercontent.com`)

### Step 5 — Add to `.env`

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_ALLOWED_EMAIL=your@gmail.com
```

> ⚠️ Never commit `.env` — it's in `.gitignore`

---

## 🌐 Deploy to Netlify (Free)

### Option A — Netlify Dashboard

1. Push repo to GitHub (make sure `.env` is NOT committed)
2. Go to [netlify.com](https://netlify.com) → **New site from Git**
3. Select your repo → Build settings are auto-detected from `netlify.toml`
4. Go to **Site settings** → **Environment variables** → Add:
   - `VITE_GOOGLE_CLIENT_ID` = your Client ID
   - `VITE_ALLOWED_EMAIL` = your Gmail
5. **Deploy site**
6. Copy the Netlify URL (e.g., `https://sparkling-vault-123.netlify.app`)
7. Add it to **Google Cloud Console → Credentials → OAuth → Authorized JavaScript origins**

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_GOOGLE_CLIENT_ID "your_client_id"
netlify env:set VITE_ALLOWED_EMAIL "your@gmail.com"
netlify deploy --prod
```

---

## 🏗️ Project Structure

```
personal-vault/
├── public/
│   └── vault-icon.svg          # App favicon
├── src/
│   ├── lib/
│   │   ├── auth.js             # Google Identity Services (GIS) auth
│   │   ├── driveApi.js         # All Google Drive REST API v3 calls
│   │   └── utils.js            # Helpers (format, parse, debounce)
│   ├── components/
│   │   ├── LoginScreen.jsx     # Sign-in splash
│   │   ├── Dashboard.jsx       # Main layout orchestrator
│   │   ├── TopBar.jsx          # Header with search + upload
│   │   ├── Sidebar.jsx         # Desktop nav / mobile drawer
│   │   ├── FileGrid.jsx        # Responsive file card grid
│   │   ├── UploadModal.jsx     # Drag-drop upload with progress
│   │   ├── LightboxModal.jsx   # Full-screen image viewer
│   │   ├── PDFViewer.jsx       # In-browser PDF preview
│   │   └── Icons.jsx           # Inline SVG icon library
│   ├── App.jsx                 # Auth state machine + routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind + custom CSS
├── .env.example                # Template — copy to .env
├── .gitignore
├── netlify.toml                # Netlify build + SPA redirect config
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🔐 Security Design

| Concern | Approach |
|---------|----------|
| Auth scope | `drive.file` — only files created by this app |
| Single-user enforcement | Email checked after OAuth; mismatched accounts have token revoked immediately |
| Private thumbnails | Images fetched via `Authorization: Bearer` header, never public URLs |
| PDF viewer | Blob URL in iframe — file never written to disk |
| Secrets | Client ID + allowed email in `.env` / Netlify env vars — never hardcoded |
| Drive isolation | App folder `Personal_Vault_App/` is separate from rest of Drive |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Auth | Google Identity Services (GIS) — modern token flow |
| Storage | Google Drive API v3 (REST + multipart upload) |
| Hosting | Netlify (free tier) |
| Backend | None — 100% client-side |

---

## 📱 Mobile (iPhone 15 Safari)

- Touch targets ≥ 44px
- Horizontal scrollable pill tab navigation
- Bottom-sheet style upload modal
- Native file picker via `<input type="file">`
- `theme-color` meta tag for Safari toolbar

---

## ⚡ Cost

| Resource | Cost |
|----------|------|
| Google Cloud OAuth | ₹0 (free forever) |
| Google Drive storage | ₹0 (15 GB free) |
| GitHub | ₹0 (free) |
| Netlify hosting | ₹0 (free tier: 100 GB bandwidth/month) |
| **Total** | **₹0** |

---

## 🐛 Troubleshooting

**"Missing VITE_GOOGLE_CLIENT_ID"** → Copy `.env.example` to `.env` and add your Client ID.

**"Unauthorized Access" on sign-in** → Check `VITE_ALLOWED_EMAIL` matches the Gmail you're signing in with exactly.

**403 on file fetch** → Token may have expired. Sign out and sign back in.

**Drive folders not created** → Clear localStorage and sign out/in again:  
`localStorage.removeItem('vault_folder_ids')`

**PDF doesn't render on iPhone Safari** → Safari has limited iframe PDF support. The file will download instead — this is a Safari OS limitation.
