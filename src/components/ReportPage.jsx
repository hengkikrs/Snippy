import { useState, useEffect } from 'react'
import { fetchStats, computeStats } from '../utils/analytics'
import styles from './ReportPage.module.css'

const LABELS = {
  page_view: 'Kunjungan',
  copy: 'Copy',
  snippet_add: 'Tambah',
  snippet_edit: 'Edit',
  snippet_delete: 'Hapus',
  search: 'Search',
  import: 'Import',
  export: 'Export',
}

function fmt(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short',
  })
}

// Tiny bar chart using divs
function BarChart({ data, valueKey, labelKey, color = 'var(--accent)' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className={styles.barChart}>
      {data.map((d, i) => (
        <div key={i} className={styles.barItem}>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: color }}
              title={`${d[labelKey]}: ${d[valueKey]}`}
            />
          </div>
          <span className={styles.barLabel}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  )
}

// Heatmap by hour
function HourHeatmap({ byHour }) {
  const max = Math.max(...byHour, 1)
  return (
    <div className={styles.heatmap}>
      {byHour.map((count, h) => (
        <div
          key={h}
          className={styles.heatCell}
          style={{ opacity: 0.1 + (count / max) * 0.9 }}
          title={`${h}:00 — ${count} aktivitas`}
        >
          <span className={styles.heatHour}>{h}</span>
        </div>
      ))}
    </div>
  )
}

// Recent activity feed
function ActivityFeed({ events }) {
  const icon = {
    page_view: '👁',
    copy: '📋',
    snippet_add: '➕',
    snippet_edit: '✏️',
    snippet_delete: '🗑',
    search: '🔍',
    import: '⬇️',
    export: '⬆️',
  }
  return (
    <div className={styles.feed}>
      {events.map((e) => (
        <div key={e.id} className={styles.feedItem}>
          <span className={styles.feedIcon}>{icon[e.event] || '•'}</span>
          <div className={styles.feedInfo}>
            <span className={styles.feedEvent}>{LABELS[e.event] || e.event}</span>
            {e.snippet_title && (
              <span className={styles.feedSnippet}>"{e.snippet_title}"</span>
            )}
          </div>
          <span className={styles.feedTime}>{fmt(e.created_at)}</span>
        </div>
      ))}
    </div>
  )
}

export function ReportPage({ onBack }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
      .then((data) => setStats(computeStats(data)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className={styles.center}>
      <div className={styles.spinner} />
      <span>Memuat statistik...</span>
    </div>
  )

  if (error) return (
    <div className={styles.center}>
      <span style={{ color: 'var(--danger)' }}>Error: {error}</span>
    </div>
  )

  if (!stats) return (
    <div className={styles.center}>
      <span style={{ color: 'var(--text-muted)' }}>Belum ada data analytics.</span>
      <small>Mulai gunakan website untuk mengumpulkan data.</small>
    </div>
  )

  // Last 14 days for chart (less crowded)
  const chartDays = stats.pageViewsByDay.slice(-14).map((d) => ({
    count: d.count,
    date: fmtDate(d.date),
  }))

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>← Kembali</button>
          <div>
            <h1 className={styles.title}>📊 Report</h1>
            <p className={styles.subtitle}>
              Data sejak {fmt(stats.firstEvent)} · Terakhir {fmt(stats.lastEvent)}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Metric Cards */}
        <div className={styles.metrics}>
          {[
            { label: 'Total Kunjungan', value: stats.pageViews, color: 'var(--accent)' },
            { label: 'Total Copy', value: stats.totalCopies, color: '#16a34a' },
            { label: 'Snippet Ditambah', value: stats.totalAdds, color: '#9333ea' },
            { label: 'Snippet Diedit', value: stats.totalEdits, color: '#d97706' },
            { label: 'Snippet Dihapus', value: stats.totalDeletes, color: 'var(--danger)' },
            { label: 'Total Pencarian', value: stats.totalSearches, color: '#0891b2' },
          ].map((m) => (
            <div key={m.label} className={styles.metricCard}>
              <span className={styles.metricValue} style={{ color: m.color }}>
                {m.value.toLocaleString()}
              </span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.grid2}>
          {/* Page views chart */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Kunjungan 14 Hari Terakhir</h2>
            {chartDays.every((d) => d.count === 0) ? (
              <p className={styles.empty}>Belum ada data kunjungan.</p>
            ) : (
              <BarChart data={chartDays} valueKey="count" labelKey="date" />
            )}
          </div>

          {/* Top copied snippets */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Paling Banyak Dicopy</h2>
            {stats.topSnippets.length === 0 ? (
              <p className={styles.empty}>Belum ada copy.</p>
            ) : (
              <div className={styles.rankList}>
                {stats.topSnippets.map((s, i) => (
                  <div key={s.title} className={styles.rankItem}>
                    <span className={styles.rankNum}>{i + 1}</span>
                    <span className={styles.rankTitle}>{s.title}</span>
                    <div className={styles.rankBar}>
                      <div
                        className={styles.rankBarFill}
                        style={{
                          width: `${(s.count / stats.topSnippets[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className={styles.rankCount}>{s.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hourly heatmap */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Aktivitas per Jam (hover untuk detail)</h2>
          <HourHeatmap byHour={stats.byHour} />
        </div>

        {/* Event breakdown */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Breakdown Aktivitas</h2>
          <div className={styles.breakdown}>
            {Object.entries(stats.byEvent)
              .sort((a, b) => b[1] - a[1])
              .map(([event, count]) => (
                <div key={event} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>{LABELS[event] || event}</span>
                  <div className={styles.breakdownBar}>
                    <div
                      className={styles.breakdownFill}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className={styles.breakdownCount}>
                    {count} <span className={styles.pct}>({((count / stats.total) * 100).toFixed(1)}%)</span>
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Aktivitas Terbaru</h2>
          <ActivityFeed events={stats.recent} />
        </div>
      </div>
    </div>
  )
}
