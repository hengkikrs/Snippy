import { useState, useEffect, useRef } from 'react'
import { Icons } from './Icons'
import styles from './Modal.module.css'

export function Modal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { title: initial.title, content: initial.content, tags: initial.tags.join(', ') }
          : { title: '', content: '', tags: '' }
      )
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, initial])

  const handle = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = () => {
    if (!form.title.trim() || !form.content.trim()) return
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({ ...form, tags })
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
  }

  return (
    <div
      className={`${styles.overlay} ${open ? styles.visible : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} onKeyDown={handleKey}>
        <div className={styles.header}>
          <span className={styles.title}>
            {initial ? 'Edit Snippet' : 'Tambah Snippet'}
          </span>
          <button className="icon-btn" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className={styles.body}>
          <label>
            Judul
            <input
              ref={inputRef}
              type="text"
              value={form.title}
              onChange={handle('title')}
              placeholder="Nama snippet..."
            />
          </label>
          <label>
            Isi Teks
            <textarea
              value={form.content}
              onChange={handle('content')}
              placeholder="Tempel teks kamu di sini..."
              rows={6}
            />
          </label>
          <label>
            Tags <span style={{ fontWeight: 400 }}>(pisahkan dengan koma)</span>
            <input
              type="text"
              value={form.tags}
              onChange={handle('tags')}
              placeholder="Prompt, Marketing, Code..."
            />
          </label>
        </div>

        <div className={styles.footer}>
          <button className="btn" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={submit}>
            <Icons.Check />
            {initial ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}
