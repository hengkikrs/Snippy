import { supabase } from './supabase'

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function fetchSnippets() {
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .order('order', { ascending: true })
    .order('created', { ascending: false })
  if (error) throw error
  return data
}

export async function createSnippet({ title, content, tags }) {
  const snippet = {
    id: uid(),
    title,
    content,
    tags,
    pinned: false,
    created: Date.now(),
    order: 0,
  }
  const { error } = await supabase.from('snippets').insert(snippet)
  if (error) throw error
  return snippet
}

export async function updateSnippet(id, fields) {
  const { error } = await supabase.from('snippets').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteSnippet(id) {
  const { error } = await supabase.from('snippets').delete().eq('id', id)
  if (error) throw error
}

export async function reorderSnippets(orderedIds) {
  const updates = orderedIds.map((id, i) => ({ id, order: i }))
  const { error } = await supabase.from('snippets').upsert(updates)
  if (error) throw error
}

export function exportJSON(snippets) {
  const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: 'application/json' })
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
