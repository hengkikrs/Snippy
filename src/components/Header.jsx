import { useRef } from 'react'
import { Icons } from './Icons'
import { parseImportFile } from '../utils/storage'
import styles from './Header.module.css'

export function Header({ search, onSearch, darkMode, onToggleDark, onAdd, onImport, onExport, onReport }) {
  const fileRef = useRef(null)

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    await onImport(file)
    e.target.value = ''
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/logo.png" alt="Snippy Logo" className={styles.logoImg} />
          </div>
          <span>Snip<em>py</em></span>
        </div>

        <div className={styles.searchWrap}>
          <Icons.Search />
          <input
            className={styles.searchInput}
            placeholder="Cari snippet... ⌘K"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className="btn hide-mobile" onClick={() => fileRef.current.click()}>
            <Icons.Import /><span>Import</span>
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

          <button className="btn hide-mobile" onClick={onExport}>
            <Icons.Export /><span>Export</span>
          </button>

          <button className="btn btn-icon" onClick={onToggleDark} title="Toggle dark mode">
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <button className="btn" onClick={onReport} title="Report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>Report</span>
          </button>

          <button className="btn btn-primary" onClick={onAdd}>
            <Icons.Plus /><span>Tambah</span>
          </button>
        </div>
      </div>
    </header>
  )
}
