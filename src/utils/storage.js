export const STORAGE_KEY = 'snippy_v2'

export const SAMPLE_DATA = [
  {
    id: '1',
    title: 'ChatGPT System Prompt',
    content:
      'You are a helpful assistant. Be concise, accurate, and thoughtful. Format your responses clearly using markdown when helpful.',
    tags: ['Prompt', 'AI'],
    pinned: true,
    created: Date.now() - 86400000 * 3,
  },
  {
    id: '2',
    title: 'Instagram Caption Template',
    content:
      '✨ [Hook yang menarik perhatian]\n\n[Konten utama 2-3 kalimat]\n\n💬 [Call to action]\n\n#hashtag1 #hashtag2 #hashtag3',
    tags: ['Marketing', 'Template'],
    pinned: false,
    created: Date.now() - 86400000 * 2,
  },
  {
    id: '3',
    title: 'Python Async HTTP Request',
    content:
      'import aiohttp\nimport asyncio\n\nasync def fetch(url):\n    async with aiohttp.ClientSession() as s:\n        async with s.get(url) as r:\n            return await r.json()',
    tags: ['Code', 'Python'],
    pinned: false,
    created: Date.now() - 86400000,
  },
  {
    id: '4',
    title: 'Email Follow-up',
    content:
      'Hi [Name],\n\nI wanted to follow up on my previous email regarding [topic]. Have you had a chance to review it?\n\nPlease let me know if you need any additional information.\n\nBest regards,\n[Your Name]',
    tags: ['Template', 'Email'],
    pinned: false,
    created: Date.now(),
  },
]

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : SAMPLE_DATA
  } catch {
    return SAMPLE_DATA
  }
}

export function saveData(snippets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets))
  } catch {
    console.warn('localStorage not available')
  }
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function exportJSON(snippets) {
  const blob = new Blob([JSON.stringify(snippets, null, 2)], {
    type: 'application/json',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `snippy-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!Array.isArray(data)) throw new Error('Invalid format')
        resolve(data)
      } catch {
        reject(new Error('File tidak valid — harus berupa JSON array.'))
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.readAsText(file)
  })
}
