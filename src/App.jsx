import { useState, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

import { Header } from './components/Header'
import { TagsBar } from './components/TagsBar'
import { SnippetCard } from './components/SnippetCard'
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { Icons } from './components/Icons'

import { useSnippets, useFilteredSnippets } from './hooks/useSnippets'
import { useToast } from './hooks/useToast'
import { parseImportFile, exportJSON, uid } from './utils/storage'
import { supabase } from './utils/supabase'

import styles from './App.module.css'

export default function App() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [view, setView] = useState('grid')
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
  const [modal, setModal] = useState({ open: false, editing: null })

  const {
    snippets,
    loading,
    error,
    allTags,
    addSnippet,
    editSnippet,
    removeSnippet,
    togglePin,
    reorder,
    importSnippets,
  } = useSnippets()

  const { toasts, addToast } = useToast()
  const filtered = useFilteredSnippets(snippets, { search, activeTag })

  const gridRef = useRef(null)
  const sortableRef = useRef(null)
  const filteredRef = useRef(filtered)

  useEffect(() => { filteredRef.current = filtered }, [filtered])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Sortable — init once
  useEffect(() => {
    if (!gridRef.current) return
    sortableRef.current = Sortable.create(gridRef.current, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      handle: '.drag-handle',
      onEnd({ oldIndex, newIndex }) {
        if (oldIndex === newIndex) return
        const current = filteredRef.current
        const ids = current.map((s) => s.id)
        const reordered = [...ids]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)
        reorder(reordered)
      },
    })
    return () => sortableRef.current?.destroy()
  }, []) // eslint-disable-line

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Cari"]')?.focus()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setModal({ open: true, editing: null })
        return
      }
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const snippet = filteredRef.current[num - 1]
          if (!snippet) return
          navigator.clipboard.writeText(snippet.content).then(() => {
            addToast(`#${num} "${snippet.title}" disalin ✓`)
          })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addToast])

  const handleSave = async ({ title, content, tags }) => {
    try {
      if (modal.editing) {
        await editSnippet(modal.editing.id, { title, content, tags })
        addToast('Snippet diperbarui ✓')
      } else {
        await addSnippet({ title, content, tags })
        addToast('Snippet ditambahkan ✓')
      }
      setModal({ open: false, editing: null })
    } catch (e) {
      addToast('Error: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus snippet ini?')) return
    try {
      await removeSnippet(id)
      addToast('Snippet dihapus')
    } catch (e) {
      addToast('Error: ' + e.message)
    }
  }

  const handleTogglePin = async (id) => {
    try {
      await togglePin(id)
    } catch (e) {
      addToast('Error: ' + e.message)
    }
  }

  const handleExport = () => exportJSON(snippets)

  const handleImport = async (file) => {
    try {
      const data = await parseImportFile(file)
      // Insert all into Supabase
      const rows = data.map((s, i) => ({
        id: s.id || uid(),
        title: s.title,
        content: s.content,
        tags: s.tags || [],
        pinned: s.pinned || false,
        created: s.created || Date.now(),
        order: i,
      }))
      const { error } = await supabase.from('snippets').upsert(rows)
      if (error) throw error
      importSnippets(rows)
      addToast(`${rows.length} snippets di-import ✓`)
    } catch (e) {
      addToast('Import error: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <span>Memuat snippets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loadingScreen}>
        <span style={{ color: 'var(--danger)' }}>⚠ Gagal konek ke database: {error}</span>
        <small>Cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env</small>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <Header
        search={search}
        onSearch={setSearch}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        onAdd={() => setModal({ open: true, editing: null })}
        onImport={handleImport}
        onExport={handleExport}
        snippets={snippets}
      />

      <TagsBar allTags={allTags} activeTag={activeTag} onSelect={setActiveTag} />

      <main className={styles.main}>
        <div className={styles.statsBar}>
          <span className={styles.statsText}>
            <strong>{filtered.length}</strong> snippet{filtered.length !== 1 ? 's' : ''}
            {search && ` · "${search}"`}
          </span>
          <div className={styles.statsRight}>
            <span className={styles.kbdHints}>
              <kbd>⌘K</kbd> cari &nbsp;
              <kbd>⌘N</kbd> tambah &nbsp;
              <kbd>1</kbd>–<kbd>9</kbd> copy
            </span>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
                onClick={() => setView('grid')}
              ><Icons.Grid /></button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
                onClick={() => setView('list')}
              ><Icons.List /></button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>{search ? 'Tidak ada hasil' : 'Belum ada snippet'}</h3>
            <p>
              {search
                ? `Tidak ada snippet yang cocok dengan "${search}"`
                : 'Tambahkan snippet pertama kamu!'}
            </p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setModal({ open: true, editing: null })}>
                <Icons.Plus /> Tambah Snippet
              </button>
            )}
          </div>
        ) : (
          <div
            ref={gridRef}
            className={`${styles.grid} ${view === 'grid' ? styles.grid2 : styles.grid1}`}
          >
            {filtered.map((s, i) => (
              <SnippetCard
                key={s.id}
                snippet={s}
                index={i}
                onCopy={() => addToast('Disalin ke clipboard! ✓')}
                onEdit={(s) => setModal({ open: true, editing: s })}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onTagClick={(tag) => setActiveTag(tag)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        open={modal.open}
        initial={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSave={handleSave}
      />
      <Toast toasts={toasts} />
    </div>
  )
}
