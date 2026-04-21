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

import styles from './App.module.css'

export default function App() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
  const [modal, setModal] = useState({ open: false, editing: null })

  const {
    snippets,
    allTags,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    togglePin,
    importSnippets,
  } = useSnippets()

  const { toasts, addToast } = useToast()

  const filtered = useFilteredSnippets(snippets, { search, activeTag })

  const gridRef = useRef(null)
  const sortableRef = useRef(null)
  const filteredRef = useRef(filtered)

  // Keep filteredRef current without re-creating Sortable
  useEffect(() => {
    filteredRef.current = filtered
  }, [filtered])

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Drag & drop reorder via SortableJS — only init once on mount
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
        const filteredIds = current.map((s) => s.id)
        const reordered = [...filteredIds]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)

        importSnippets((prev) => {
          const orderMap = Object.fromEntries(reordered.map((id, i) => [id, i]))
          const inFiltered = prev.filter((s) => orderMap[s.id] !== undefined)
          const notInFiltered = prev.filter((s) => orderMap[s.id] === undefined)
          const sorted = [...inFiltered].sort((a, b) => orderMap[a.id] - orderMap[b.id])
          return [...sorted, ...notInFiltered]
        })
      },
    })

    return () => sortableRef.current?.destroy()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Cari"]')?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setModal({ open: true, editing: null })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Modal save handler
  const handleSave = ({ title, content, tags }) => {
    if (modal.editing) {
      updateSnippet(modal.editing.id, { title, content, tags })
      addToast('Snippet diperbarui ✓')
    } else {
      addSnippet({ title, content, tags })
      addToast('Snippet ditambahkan ✓')
    }
    setModal({ open: false, editing: null })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Hapus snippet ini?')) return
    deleteSnippet(id)
    addToast('Snippet dihapus')
  }

  const handleImport = (data) => {
    importSnippets(data)
    addToast(`${data.length} snippets di-import ✓`)
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
        snippets={snippets}
      />

      <TagsBar allTags={allTags} activeTag={activeTag} onSelect={setActiveTag} />

      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.statsBar}>
          <span className={styles.statsText}>
            <strong>{filtered.length}</strong> snippet{filtered.length !== 1 ? 's' : ''}
            {search && ` · "${search}"`}
          </span>

          <div className={styles.statsRight}>
            <span className={styles.kbdHints}>
              <kbd>⌘K</kbd> cari &nbsp;
              <kbd>⌘N</kbd> tambah
            </span>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <Icons.Grid />
              </button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
                onClick={() => setView('list')}
                title="List view"
              >
                <Icons.List />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
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
              <button
                className="btn btn-primary"
                onClick={() => setModal({ open: true, editing: null })}
              >
                <Icons.Plus /> Tambah Snippet
              </button>
            )}
          </div>
        ) : (
          <div
            ref={gridRef}
            className={`${styles.grid} ${view === 'grid' ? styles.grid2 : styles.grid1}`}
          >
            {filtered.map((s) => (
              <SnippetCard
                key={s.id}
                snippet={s}
                onCopy={() => addToast('Disalin ke clipboard! ✓')}
                onEdit={(s) => setModal({ open: true, editing: s })}
                onDelete={handleDelete}
                onTogglePin={togglePin}
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
