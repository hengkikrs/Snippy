import { supabase } from './supabase'

// ─── TRACK ───────────────────────────────────────────────────────────────────

export async function trackEvent(event, snippet = null) {
  try {
    await supabase.from('analytics').insert({
      event,
      snippet_id: snippet?.id ?? null,
      snippet_title: snippet?.title ?? null,
    })
  } catch {
    // silent — never break UI for analytics
  }
}

export const EVENTS = {
  PAGE_VIEW: 'page_view',
  COPY: 'copy',
  ADD: 'snippet_add',
  EDIT: 'snippet_edit',
  DELETE: 'snippet_delete',
  SEARCH: 'search',
  IMPORT: 'import',
  EXPORT: 'export',
}

// ─── FETCH STATS ─────────────────────────────────────────────────────────────

export async function fetchStats() {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function computeStats(events) {
  if (!events || events.length === 0) return null

  const total = events.length
  const byEvent = {}
  events.forEach((e) => {
    byEvent[e.event] = (byEvent[e.event] || 0) + 1
  })

  // Copy stats per snippet
  const copyEvents = events.filter((e) => e.event === EVENTS.COPY)
  const copyBySnippet = {}
  copyEvents.forEach((e) => {
    if (!e.snippet_title) return
    const key = e.snippet_title
    copyBySnippet[key] = (copyBySnippet[key] || 0) + 1
  })
  const topSnippets = Object.entries(copyBySnippet)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([title, count]) => ({ title, count }))

  // Page views by day (last 30 days)
  const now = new Date()
  const days = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days[key] = 0
  }
  events
    .filter((e) => e.event === EVENTS.PAGE_VIEW)
    .forEach((e) => {
      const key = e.created_at.slice(0, 10)
      if (key in days) days[key]++
    })
  const pageViewsByDay = Object.entries(days).map(([date, count]) => ({ date, count }))

  // Activity heatmap by hour of day
  const byHour = Array(24).fill(0)
  events.forEach((e) => {
    const h = new Date(e.created_at).getHours()
    byHour[h]++
  })

  // Recent activity (last 20)
  const recent = [...events].reverse().slice(0, 20)

  return {
    total,
    byEvent,
    pageViews: byEvent[EVENTS.PAGE_VIEW] || 0,
    totalCopies: byEvent[EVENTS.COPY] || 0,
    totalAdds: byEvent[EVENTS.ADD] || 0,
    totalEdits: byEvent[EVENTS.EDIT] || 0,
    totalDeletes: byEvent[EVENTS.DELETE] || 0,
    totalSearches: byEvent[EVENTS.SEARCH] || 0,
    topSnippets,
    pageViewsByDay,
    byHour,
    recent,
    firstEvent: events[0]?.created_at,
    lastEvent: events[events.length - 1]?.created_at,
  }
}
