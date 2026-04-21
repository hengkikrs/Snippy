import styles from './Toast.module.css'

export function Toast({ toasts }) {
  return (
    <div className={styles.wrap}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${t.in ? styles.in : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
