import styles from './TagsBar.module.css'

export function TagsBar({ allTags, activeTag, onSelect }) {
  const tags = ['All', 'Pinned', ...Object.keys(allTags)]

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {tags.map((t) => (
          <button
            key={t}
            className={`${styles.pill} ${activeTag === t ? styles.active : ''}`}
            onClick={() => onSelect(t)}
          >
            {t}
            {t !== 'All' && t !== 'Pinned' && (
              <span className={styles.count}>{allTags[t]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
