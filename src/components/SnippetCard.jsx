import { useState } from 'react'
import { Icons } from './Icons'
import styles from './SnippetCard.module.css'

export function SnippetCard({ snippet, onCopy, onEdit, onDelete, onTogglePin, onTagClick }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content).then(() => {
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const isLong = snippet.content.length > 200

  return (
    <div
      className={`${styles.card} ${snippet.pinned ? styles.pinned : ''}`}
      data-id={snippet.id}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.dragHandle}>
          <Icons.Drag />
        </span>
        <span className={styles.cardTitle}>{snippet.title}</span>
        <div className={styles.cardActions}>
          <button
            className={`icon-btn fav-btn ${snippet.pinned ? 'active' : ''}`}
            onClick={() => onTogglePin(snippet.id)}
            title={snippet.pinned ? 'Unpin' : 'Pin'}
          >
            <Icons.Star filled={snippet.pinned} />
          </button>
          <button className="icon-btn edit-btn" onClick={() => onEdit(snippet)} title="Edit">
            <Icons.Edit />
          </button>
          <button
            className="icon-btn del-btn"
            onClick={() => onDelete(snippet.id)}
            title="Hapus"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`${styles.cardBody} ${expanded ? styles.expanded : ''}`}>
        {snippet.content}
      </div>

      {isLong && (
        <button className={styles.expandBtn} onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Tutup ↑' : 'Lihat semua ↓'}
        </button>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardTags}>
          {snippet.tags.map((t) => (
            <span
              key={t}
              className={styles.tagBadge}
              onClick={() => onTagClick(t)}
            >
              {t}
            </span>
          ))}
        </div>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Icons.Check /> Copied!
            </>
          ) : (
            <>
              <Icons.Copy /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
