import { useState } from 'react'
import { Icons } from './Icons'
import styles from './SnippetCard.module.css'

function ChevronIcon({ collapsed }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        width: 13,
        height: 13,
        transition: 'transform 200ms ease',
        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        flexShrink: 0,
        color: 'var(--text-muted)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function SnippetCard({ snippet, index, onCopy, onEdit, onDelete, onTogglePin, onTagClick }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(snippet.content).then(() => {
      setCopied(true)
      onCopy(snippet)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const isLong = snippet.content.length > 200

  return (
    <div
      className={`${styles.card} ${snippet.pinned ? styles.pinned : ''} ${collapsed ? styles.collapsed : ''}`}
      data-id={snippet.id}
    >
      {/* Header — click to collapse/expand */}
      <div
        className={styles.cardHeader}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Klik untuk expand' : 'Klik untuk collapse'}
      >
        <span className={styles.dragHandle} onClick={(e) => e.stopPropagation()}>
          <Icons.Drag />
        </span>
        {index < 9 && (
          <span className={styles.numBadge} title={"Tekan " + (index + 1) + " untuk copy"}>
            {index + 1}
          </span>
        )}
        <span className={styles.cardTitle}>{snippet.title}</span>
        <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
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
        <ChevronIcon collapsed={collapsed} />
      </div>

      {/* Collapsible content */}
      <div className={styles.collapsible}>
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
              <span key={t} className={styles.tagBadge} onClick={() => onTagClick(t)}>
                {t}
              </span>
            ))}
          </div>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  )
}
