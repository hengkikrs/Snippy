import { useRef } from 'react'
import { Icons } from './Icons'
import { parseImportFile } from '../utils/storage'
import styles from './Header.module.css'

export function Header({ search, onSearch, darkMode, onToggleDark, onAdd, onImport, onExport }) {
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
          <div className={styles.logoIcon}><Icons.Logo /></div>
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

          <button className="btn btn-primary" onClick={onAdd}>
            <Icons.Plus /><span>Tambah</span>
          </button>
        </div>
      </div>
    </header>
  )
}
