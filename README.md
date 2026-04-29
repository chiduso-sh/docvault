# DocVault

A private file vault for storing, organising, and sharing documents — built with React, Vite, and Supabase.

🔗 **Live demo → [docvault-sigma.vercel.app](https://docvault-sigma.vercel.app)**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Storage-3ECF8E?style=flat&logo=supabase)

---

## Features

- 🔐 **Authentication** — Sign up / sign in with email and password
- 📁 **File upload** — Drag and drop or browse. Supports PDF, Word, Excel, and images
- 👁️ **File retrieval** — Click any file to open PDFs/images in browser or download others
- 🗂️ **Collections** — Create named, colour-coded groups to organise files
- 🏷️ **Tags** — Tag files from the UI and filter the vault by tag
- 🔗 **Shared links** — Generate expiring signed URLs anyone can use to download a file
- ⭐ **Starring** — Star important files for quick access
- ✎ **Rename** — Inline rename directly on the file card
- 🔍 **Live search** — Filters the file grid instantly as you type
- 📊 **Stats dashboard** — Total files, storage used, PDF count, collection count
- 🕓 **Activity feed** — Log of recent uploads and changes
- 🌙 **Dark mode** — Toggleable, persisted across sessions
- ⚡ **Real-time updates** — Vault refreshes automatically when files change

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage |
| Auth | Supabase Auth |
| Deploy | Vercel |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourname/docvault.git
cd docvault
npm install
```

### 2. Set up Supabase

Create a free project at [supabase.com](https://supabase.com), then run this in **SQL Editor → New Query**:

```sql
create table collections (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#534AB7',
  created_at timestamptz default now()
);

create table files (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  mime_type     text,
  size_bytes    bigint,
  page_count    int,
  storage_path  text not null,
  collection_id uuid references collections(id) on delete set null,
  tag           text,
  starred       boolean default false,
  created_at    timestamptz default now()
);

create table activity_log (
  id         uuid primary key default gen_random_uuid(),
  icon       text not null default '+',
  message    text not null,
  detail     text,
  created_at timestamptz default now()
);

create or replace function get_vault_stats()
returns json language sql as $$
  select json_build_object(
    'total_files',        (select count(*) from files),
    'pdf_count',          (select count(*) from files where mime_type ilike '%pdf%'),
    'collection_count',   (select count(*) from collections),
    'shared_collections', 2,
    'files_this_week',    (select count(*) from files where created_at > now() - interval '7 days'),
    'pdfs_this_week',     (select count(*) from files where mime_type ilike '%pdf%' and created_at > now() - interval '7 days'),
    'storage_used_gb',    round((select coalesce(sum(size_bytes),0) from files)::numeric / 1e9, 2),
    'storage_pct',        round((select coalesce(sum(size_bytes),0) from files)::numeric / 5e9 * 100, 1)
  );
$$;

alter table files enable row level security;
alter table collections enable row level security;
alter table activity_log enable row level security;

create policy "authenticated insert files" on files for insert to authenticated with check (true);
create policy "authenticated select files" on files for select to authenticated using (true);
create policy "authenticated update files" on files for update to authenticated using (true);
create policy "authenticated delete files" on files for delete to authenticated using (true);
create policy "authenticated select collections" on collections for select to authenticated using (true);
create policy "authenticated insert collections" on collections for insert to authenticated with check (true);
create policy "authenticated insert activity" on activity_log for insert to authenticated with check (true);
create policy "authenticated select activity" on activity_log for select to authenticated using (true);
```

**Storage bucket** — go to Storage → New bucket:
- Name: `vault`
- Public: **off**
- Allowed MIME types: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*`

Add two storage policies (Storage → vault → Policies → For full customization):
- **INSERT** — role: `authenticated`, definition: `bucket_id = 'vault' AND auth.role() = 'authenticated'`
- **SELECT** — role: `authenticated`, definition: `bucket_id = 'vault' AND auth.role() = 'authenticated'`

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in from **Supabase Dashboard → Settings → API**:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

---

## Project structure

```
src/
├── components/
│   ├── DocVault.jsx        # Root component — owns all UI state
│   ├── Header.jsx          # Top bar: search, tabs, dark mode, upload, sign out
│   ├── StatsRow.jsx        # Four metric cards with loading skeletons
│   ├── FileCard.jsx        # File card with open, star, rename, tag, share, delete
│   ├── RightPanel.jsx      # Activity feed + tag filter cloud
│   ├── UploadModal.jsx     # Drag-and-drop upload dialog
│   ├── CollectionModal.jsx # Create a new collection
│   ├── ShareModal.jsx      # Generate expiring shareable links
│   ├── TagModal.jsx        # Edit file tags from the UI
│   ├── Toast.jsx           # Auto-dismissing notifications
│   └── LoginPage.jsx       # Sign in / sign up form
├── hooks/
│   └── useVault.js         # All Supabase data fetching, uploads, mutations
├── lib/
│   ├── supabase.js         # Supabase client singleton
│   ├── AuthContext.jsx     # Auth state + route guard via React Context
│   └── useDarkMode.js      # Dark mode toggle persisted to localStorage
└── main.jsx                # App entry point
```

---

## Deployment

```bash
npm run build
```

Deploy to [Vercel](https://vercel.com) — import the GitHub repo, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables, and deploy. Every `git push` to `main` triggers an automatic redeploy.

---

## Roadmap

- [ ] PDF preview modal (inline rendering with pdf.js)
- [ ] Upload progress bar
- [ ] Pagination / infinite scroll for large vaults
- [ ] Password reset flow
