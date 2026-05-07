import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  fetchSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  reorderSnippets,
} from '../utils/storage'

export function useSnippets() {
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initial load
  useEffect(() => {
    fetchSnippets()
      .then(setSnippets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addSnippet = useCallback(async ({ title, content, tags, copyNumber }) => {
    const snippet = await createSnippet({ title, content, tags, copyNumber })
    setSnippets((s) => [snippet, ...s])
    return snippet
  }, [])

  const editSnippet = useCallback(async (id, fields) => {
    await updateSnippet(id, fields)
    setSnippets((s) => s.map((x) => (x.id === id ? { ...x, ...fields } : x)))
  }, [])

  const removeSnippet = useCallback(async (id) => {
    await deleteSnippet(id)
    setSnippets((s) => s.filter((x) => x.id !== id))
  }, [])

  const togglePin = useCallback(async (id) => {
    const snippet = snippets.find((x) => x.id === id)
    if (!snippet) return
    const pinned = !snippet.pinned
    await updateSnippet(id, { pinned })
    setSnippets((s) => s.map((x) => (x.id === id ? { ...x, pinned } : x)))
  }, [snippets])

  // dataOrFn: array baru atau (prev) => array (untuk import)
  const importSnippets = useCallback((dataOrFn) => {
    setSnippets(dataOrFn)
  }, [])

  const reorder = useCallback(async (orderedIds) => {
    setSnippets((prev) => {
      const map = Object.fromEntries(prev.map((s) => [s.id, s]))
      return orderedIds.map((id) => map[id]).filter(Boolean)
    })
    await reorderSnippets(orderedIds)
  }, [])

  const allTags = useMemo(() => {
    const map = {}
    snippets.forEach((s) =>
      s.tags?.forEach((t) => {
        map[t] = (map[t] || 0) + 1
      })
    )
    return map
  }, [snippets])

  return {
    snippets,
    loading,
    error,
    allTags,
    addSnippet,
    editSnippet,
    removeSnippet,
    togglePin,
    reorder,
    importSnippets,
  }
}

export function useFilteredSnippets(snippets, { search, activeTag }) {
  return useMemo(() => {
    let list = [...snippets].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

    if (activeTag === 'Pinned') {
      list = list.filter((s) => s.pinned)
    } else if (activeTag !== 'All') {
      list = list.filter((s) => s.tags?.includes(activeTag))
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [snippets, activeTag, search])
}
