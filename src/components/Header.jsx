import { useRef } from 'react'
import { Icons } from './Icons'
import { exportJSON, parseImportFile } from '../utils/storage'
import styles from './Header.module.css'

export function Header({ search, onSearch, darkMode, onToggleDark, onAdd, onImport, snippets }) {
  const fileRef = useRef(null)

  const handleExport = () => exportJSON(snippets)

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await parseImportFile(file)
      onImport(data)
    } catch (err) {
      alert(err.message)
    }
    e.target.value = ''
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Icons.Logo />
          </div>
          <span>
            Snip<em>py</em>
          </span>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Icons.Search />
          <input
            className={styles.searchInput}
            placeholder="Cari snippet... ⌘K"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className="btn hide-mobile" onClick={() => fileRef.current.click()}>
            <Icons.Import />
            <span>Import</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />

          <button className="btn hide-mobile" onClick={handleExport}>
            <Icons.Export />
            <span>Export</span>
          </button>

          <button className="btn btn-icon" onClick={onToggleDark} title="Toggle dark mode">
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <button className="btn btn-primary" onClick={onAdd}>
            <Icons.Plus />
            <span>Tambah</span>
          </button>
        </div>
      </div>
    </header>
  )
}
