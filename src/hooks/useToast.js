import { useState, useCallback } from 'react'
import { uid } from '../utils/storage'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg) => {
    const id = uid()
    setToasts((t) => [...t, { id, msg, in: false }])

    // trigger CSS transition on next frame
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setToasts((t) => t.map((x) => (x.id === id ? { ...x, in: true } : x)))
      )
    )

    // slide out
    setTimeout(
      () => setToasts((t) => t.map((x) => (x.id === id ? { ...x, in: false } : x))),
      2200
    )
    // remove from DOM
    setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      2600
    )
  }, [])

  return { toasts, addToast }
}
