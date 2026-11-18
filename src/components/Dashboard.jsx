import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  listFiles,
  listAllVaultFiles,
  searchFiles,
  trashFile,
  moveFile,
  createCustomFolder
} from '../lib/driveApi'
import { debounce } from '../lib/utils'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import FileGrid from './FileGrid'
import UploadModal from './UploadModal'
import LightboxModal from './LightboxModal'
import PDFViewer from './PDFViewer'
import NewFolderModal from './NewFolderModal'
import { IconPlus } from './Icons'

export default function Dashboard({ token, userInfo, vaultData, onSignOut }) {
  const { rootId } = vaultData
  const [folderMap, setFolderMap]       = useState(vaultData.folderMap || {})
  const allFolderIds                    = useMemo(() => Object.values(folderMap), [folderMap])
  const navItems                        = useMemo(() => ['All Files', ...Object.keys(folderMap)], [folderMap])

  const [activeTab, setActiveTab]       = useState('All Files')
  const [files, setFiles]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [showUpload, setShowUpload]     = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [lightboxFile, setLightboxFile] = useState(null)
  const [pdfFile, setPdfFile]           = useState(null)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [toast, setToast]               = useState(null)
  const toastRef                        = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3500)
  }, [])

  // Load files for current active tab
  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const result = activeTab === 'All Files'
        ? await listAllVaultFiles(token, allFolderIds)
        : await listFiles(token, folderMap[activeTab] || '')
      setFiles(result)
    } catch (err) {
      showToast(`Failed to load: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [token, activeTab, folderMap, allFolderIds, showToast])

  useEffect(() => { loadFiles() }, [loadFiles])

  // Create new custom folder
  const handleCreateFolder = useCallback(async (folderName) => {
    if (folderMap[folderName]) {
      throw new Error(`A folder named "${folderName}" already exists.`)
    }
    const newFolder = await createCustomFolder(token, folderName, rootId)
    setFolderMap(prev => ({ ...prev, [folderName]: newFolder.id }))
    setShowNewFolder(false)
    setActiveTab(folderName)
    showToast(`Folder "${folderName}" created`)
  }, [token, rootId, folderMap, showToast])

  // Live search
  const doSearch = useCallback(
    debounce(async q => {
      if (!q.trim()) { loadFiles(); return }
      setLoading(true)
      try {
        setFiles(await searchFiles(token, q.trim(), allFolderIds))
      } catch (err) {
        showToast(`Search failed: ${err.message}`, 'error')
      } finally {
        setLoading(false)
      }
    }, 400),
    [token, allFolderIds, loadFiles, showToast]
  )

  const handleSearch = useCallback(q => {
    setSearchQuery(q)
    doSearch(q)
  }, [doSearch])

  // Move to Archive
  const handleArchive = useCallback(async file => {
    const archiveId = folderMap['Archive']
    const parentId  = file.parents?.[0] || folderMap[activeTab]
    if (!parentId || !archiveId) return
    try {
      await moveFile(token, file.id, archiveId, parentId)
      showToast(`"${file.name}" moved to Archive`)
      setFiles(p => p.filter(f => f.id !== file.id))
      if (lightboxFile?.id === file.id) setLightboxFile(null)
    } catch (err) { showToast(`Archive failed: ${err.message}`, 'error') }
  }, [token, folderMap, activeTab, lightboxFile, showToast])

  // Move to Trash
  const handleTrash = useCallback(async file => {
    if (!confirm(`Move "${file.name}" to Drive Trash?`)) return
    try {
      await trashFile(token, file.id)
      showToast(`"${file.name}" moved to Trash`)
      setFiles(p => p.filter(f => f.id !== file.id))
      if (lightboxFile?.id === file.id) setLightboxFile(null)
      if (pdfFile?.id === file.id) setPdfFile(null)
    } catch (err) { showToast(`Delete failed: ${err.message}`, 'error') }
  }, [token, lightboxFile, pdfFile, showToast])

  const handleTabChange = useCallback(tab => {
    setActiveTab(tab)
    setSearchQuery('')
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-vault-bg flex flex-col text-vault-text">
      {/* Top Bar */}
      <TopBar
        userInfo={userInfo}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onUpload={() => setShowUpload(true)}
        onNewFolder={() => setShowNewFolder(true)}
        onSignOut={onSignOut}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNewFolder={() => { setSidebarOpen(false); setShowNewFolder(true); }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto min-w-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
          {/* Mobile Horizontal Pill Tabs */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-3 pt-3 pb-2 no-scrollbar border-b border-vault-border/40">
            {navItems.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => setShowNewFolder(true)}
              className="pill-tab flex items-center gap-1 text-vault-accent hover:text-white"
              title="Create new folder"
            >
              <IconPlus className="w-3 h-3" />
              <span>Folder</span>
            </button>
          </div>

          {/* Section Header */}
          <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-2 sm:pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-vault-text tracking-tight truncate max-w-[280px] sm:max-w-md">
                {activeTab}
              </h1>
              {!searchQuery && (
                <p className="text-xs text-vault-muted mt-0.5">
                  {activeTab === 'All Files'
                    ? 'All documents, photos, and videos in your vault'
                    : `Files stored in ${activeTab}`}
                </p>
              )}
            </div>

            {/* Folder action for custom folder */}
            {activeTab !== 'All Files' && activeTab !== 'Archive' && (
              <button
                onClick={() => setShowUpload(true)}
                className="btn-ghost text-xs py-1.5 px-2.5 hidden sm:flex items-center gap-1"
              >
                <span>+ Upload here</span>
              </button>
            )}
          </div>

          {/* File Grid */}
          <div className="px-3 sm:px-5 pb-8">
            <FileGrid
              files={files}
              loading={loading}
              token={token}
              folderMap={folderMap}
              activeTab={activeTab}
              searchQuery={searchQuery}
              onRefresh={loadFiles}
              onImageClick={setLightboxFile}
              onPDFClick={setPdfFile}
              onArchive={handleArchive}
              onTrash={handleTrash}
            />
          </div>
        </main>
      </div>

      {/* Upload Modal with PIN Encryption */}
      {showUpload && (
        <UploadModal
          token={token}
          folderMap={folderMap}
          defaultFolder={activeTab !== 'All Files' ? activeTab : Object.keys(folderMap)[0] || 'Important Documents'}
          onClose={() => setShowUpload(false)}
          onComplete={() => { setShowUpload(false); loadFiles(); showToast('Upload complete') }}
          onOpenNewFolder={() => setShowNewFolder(true)}
        />
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <NewFolderModal
          onConfirm={handleCreateFolder}
          onCancel={() => setShowNewFolder(false)}
        />
      )}

      {/* Lightbox / Video Player with PIN Decryption */}
      {lightboxFile && (
        <LightboxModal
          token={token}
          file={lightboxFile}
          folderMap={folderMap}
          onClose={() => setLightboxFile(null)}
          onArchive={handleArchive}
          onTrash={handleTrash}
        />
      )}

      {/* PDF Viewer */}
      {pdfFile && (
        <PDFViewer
          token={token}
          file={pdfFile}
          onClose={() => setPdfFile(null)}
          onTrash={handleTrash}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toast.type === 'error' ? 'bg-vault-danger' : 'bg-vault-success'}`} />
          <span className="text-vault-subtle text-xs sm:text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
