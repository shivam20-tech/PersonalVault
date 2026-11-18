import { useState, useEffect, useCallback, useRef } from 'react'
import { listFiles, listAllVaultFiles, searchFiles, trashFile, moveFile, DEFAULT_SUBFOLDERS } from '../lib/driveApi'
import { debounce } from '../lib/utils'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import FileGrid from './FileGrid'
import UploadModal from './UploadModal'
import LightboxModal from './LightboxModal'
import PDFViewer from './PDFViewer'

const NAV_ITEMS = ['All Files', ...DEFAULT_SUBFOLDERS]

export default function Dashboard({ token, userInfo, vaultData, onSignOut }) {
  const { rootId, folderMap } = vaultData
  const allFolderIds = Object.values(folderMap)

  const [activeTab, setActiveTab]       = useState('All Files')
  const [files, setFiles]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [showUpload, setShowUpload]     = useState(false)
  const [lightboxFile, setLightboxFile] = useState(null)
  const [pdfFile, setPdfFile]           = useState(null)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [toast, setToast]               = useState(null)
  const toastRef = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3500)
  }, [])

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
  }, [token, activeTab, folderMap])

  useEffect(() => { loadFiles() }, [loadFiles])

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
    [token, allFolderIds, loadFiles]
  )

  const handleSearch = useCallback(q => { setSearchQuery(q); doSearch(q) }, [doSearch])

  const handleArchive = useCallback(async file => {
    const archiveId = folderMap['Archive']
    const parentId  = file.parents?.[0] || folderMap[activeTab]
    if (!parentId) return
    try {
      await moveFile(token, file.id, archiveId, parentId)
      showToast(`"${file.name}" archived`)
      setFiles(p => p.filter(f => f.id !== file.id))
      if (lightboxFile?.id === file.id) setLightboxFile(null)
    } catch (err) { showToast(`Archive failed: ${err.message}`, 'error') }
  }, [token, folderMap, activeTab, lightboxFile])

  const handleTrash = useCallback(async file => {
    if (!confirm(`Move "${file.name}" to Drive Trash?`)) return
    try {
      await trashFile(token, file.id)
      showToast(`"${file.name}" moved to trash`)
      setFiles(p => p.filter(f => f.id !== file.id))
      if (lightboxFile?.id === file.id) setLightboxFile(null)
      if (pdfFile?.id === file.id) setPdfFile(null)
    } catch (err) { showToast(`Delete failed: ${err.message}`, 'error') }
  }, [token, lightboxFile, pdfFile])

  const handleTabChange = useCallback(tab => {
    setActiveTab(tab)
    setSearchQuery('')
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-vault-bg flex flex-col">
      <TopBar
        userInfo={userInfo}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onUpload={() => setShowUpload(true)}
        onSignOut={onSignOut}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navItems={NAV_ITEMS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-4 pt-3 pb-2 no-scrollbar">
            {NAV_ITEMS.map(tab => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className={`pill-tab ${activeTab === tab ? 'active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Page header */}
          <div className="px-5 pt-5 pb-3 lg:pt-6">
            <h1 className="text-base font-semibold text-vault-text tracking-tight">{activeTab}</h1>
            {!searchQuery && (
              <p className="text-xs text-vault-muted mt-0.5">
                {activeTab === 'All Files'
                  ? 'Everything in your vault'
                  : activeTab === 'Archive' ? 'Archived files'
                  : 'Files in this folder'}
              </p>
            )}
          </div>

          <div className="px-5 pb-8">
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

      {/* Modals */}
      {showUpload && (
        <UploadModal
          token={token}
          folderMap={folderMap}
          defaultFolder={activeTab !== 'All Files' ? activeTab : 'Important Documents'}
          onClose={() => setShowUpload(false)}
          onComplete={() => { setShowUpload(false); loadFiles(); showToast('Upload complete') }}
        />
      )}
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
      {pdfFile && (
        <PDFViewer
          token={token}
          file={pdfFile}
          onClose={() => setPdfFile(null)}
          onTrash={handleTrash}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toast.type === 'error' ? 'bg-vault-danger' : 'bg-vault-success'}`} />
          <span className="text-vault-subtle">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
