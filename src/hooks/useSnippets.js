import { useState, useEffect, useMemo } from 'react'
import { loadData, saveData, uid } from '../utils/storage'

export function useSnippets() {
  const [snippets, setSnippets] = useState(loadData)

  useEffect(() => {
    saveData(snippets)
  }, [snippets])

  const addSnippet = ({ title, content, tags }) => {
    setSnippets((s) => [
      { id: uid(), title, content, tags, pinned: false, created: Date.now() },
      ...s,
    ])
  }

  const updateSnippet = (id, { title, content, tags }) => {
    setSnippets((s) =>
      s.map((x) => (x.id === id ? { ...x, title, content, tags } : x))
    )
  }

  const deleteSnippet = (id) => {
    setSnippets((s) => s.filter((x) => x.id !== id))
  }

  const togglePin = (id) => {
    setSnippets((s) =>
      s.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x))
    )
  }

  const reorder = (fromId, toId) => {
    setSnippets((prev) => {
      const list = [...prev]
      const fromIdx = list.findIndex((x) => x.id === fromId)
      const toIdx = list.findIndex((x) => x.id === toId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      return list
    })
  }

  // Accepts either a new array or a functional updater (prev) => newArray
  const importSnippets = (dataOrUpdater) => {
    setSnippets(dataOrUpdater)
  }

  const allTags = useMemo(() => {
    const map = {}
    snippets.forEach((s) =>
      s.tags.forEach((t) => {
        map[t] = (map[t] || 0) + 1
      })
    )
    return map
  }, [snippets])

  return {
    snippets,
    allTags,
    addSnippet,
    updateSnippet,
    deleteSnippet,
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
      list = list.filter((s) => s.tags.includes(activeTag))
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [snippets, activeTag, search])
}
