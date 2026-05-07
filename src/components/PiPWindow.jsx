import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function PiPWindow({ onClose, onKeyDown, children }) {
  const [pipWindow, setPipWindow] = useState(null)

  useEffect(() => {
    let pipWin = null

    async function openPip() {
      try {
        if (!('documentPictureInPicture' in window)) {
          alert('Browser kamu tidak mendukung Document Picture-in-Picture. Coba gunakan Google Chrome versi terbaru.')
          onClose()
          return
        }

        pipWin = await window.documentPictureInPicture.requestWindow({
          width: 400,
          height: 600,
        })

        // Salin semua CSS dari window utama ke PiP window agar tampilannya sama
        const stylesheets = Array.from(document.styleSheets)
        stylesheets.forEach((sheet) => {
          try {
            if (sheet.href) {
              const link = document.createElement('link')
              link.rel = 'stylesheet'
              link.href = sheet.href
              pipWin.document.head.appendChild(link)
            } else {
              const style = document.createElement('style')
              style.textContent = Array.from(sheet.cssRules)
                .map((rule) => rule.cssText)
                .join('')
              pipWin.document.head.appendChild(style)
            }
          } catch (e) {
            // Abaikan error CORS untuk stylesheet eksternal
          }
        })

        // Terapkan atribut tema
        pipWin.document.documentElement.setAttribute(
          'data-theme',
          document.documentElement.getAttribute('data-theme')
        )

        pipWin.addEventListener('pagehide', () => {
          onClose()
        })

        if (onKeyDown) {
          pipWin.addEventListener('keydown', onKeyDown)
        }

        setPipWindow(pipWin)
      } catch (err) {
        console.error('PiP Error:', err)
        alert('Gagal membuka PiP. Pastikan kamu klik tombol langsung tanpa delay.')
        onClose()
      }
    }

    openPip()

    return () => {
      if (pipWin) pipWin.close()
    }
  }, [onClose, onKeyDown])

  if (!pipWindow) return null

  return createPortal(children, pipWindow.document.body)
}
