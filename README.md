# Snippy

Text snippet manager — simpan, cari, dan copy teks dengan 1 klik.

## Fitur

- **Copy 1 klik** dengan notifikasi "Copied!"
- **Search real-time** (judul, isi, tags)
- **Filter by tag** — klik tag badge atau tag bar
- **Tambah / Edit / Delete** snippet
- **Pin / Favorite** — snippet pinned naik ke atas
- **Dark mode** — auto-detect system + toggle manual
- **Grid / List view** toggle
- **Drag & drop** reorder (handle titik di kiri card)
- **Export JSON** — backup semua snippets
- **Import JSON** — restore dari file backup
- **Keyboard shortcuts**:
  - `Ctrl+K` / `⌘K` — focus search
  - `Ctrl+N` / `⌘N` — buka modal tambah
  - `Ctrl+Enter` / `⌘Enter` — submit form dalam modal
  - `Escape` — tutup modal
- **localStorage** — data persist setelah refresh

## Struktur Folder

```
snippy/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.module.css
    ├── styles/
    │   └── global.css
    ├── utils/
    │   └── storage.js        # localStorage, export/import, uid()
    ├── hooks/
    │   ├── useSnippets.js    # state management snippets
    │   └── useToast.js       # toast notifications
    └── components/
        ├── Icons.jsx
        ├── Header.jsx + .module.css
        ├── TagsBar.jsx + .module.css
        ├── SnippetCard.jsx + .module.css
        ├── Modal.jsx + .module.css
        └── Toast.jsx + .module.css
```

## Install & Run

```bash
# 1. Clone / copy folder snippy ke lokal

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
# → buka http://localhost:5173

# 4. Build untuk production
npm run build
```

## Tech Stack

- **React 18** — UI
- **Vite** — bundler (super fast HMR)
- **CSS Modules** — scoped styling, zero runtime
- **SortableJS** — drag & drop
- **localStorage** — persistent storage, no backend needed

## Extend / Kembangkan

- Tambah backend: ganti `loadData`/`saveData` di `src/utils/storage.js` dengan fetch ke API
- Tambah sync antar device: ganti localStorage dengan Supabase / Firebase
- Tambah kategori warna: extend model snippet dengan field `color`
