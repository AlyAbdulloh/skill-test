# Take-Home Test: Document Request + Approval Line per Category

**Deadline:** 1x24 jam sejak brief ini kamu terima.
**Untuk:** Kandidat Engineer — Tim Pilar OPS.

---

## 1. Konteks Proyek

Proyek ini adalah skeleton **Document Request**: aplikasi internal manajemen dokumen SOP berbasis:

- **Next.js 15** (App Router) + **React 19** + **TypeScript** + **Tailwind** (shadcn/ui)
- **Drizzle ORM** (mendukung PostgreSQL & MySQL — dialihkan lewat env `DB_DIALECT`)
- **NextAuth v5** (login local username/password, session bawa `roles` & `permissions`)
- Arsitektur modular: `src/app/**` (HTTP/page shell tipis) → `src/modules/v1/server|client/<domain>/` (entities, repositories, usecases, presentations)

**Contoh modul yang sudah ada dan wajib kamu jadikan referensi pola:**

- Modul **Category** (`src/app/api/master-data/category`, `src/modules/v1/.../master-data/category`) — CRUD lengkap: list + pagination + search, create, update, soft delete.
- Modul **Approval Line** (`src/modules/v1/.../configuration/approval-line`) — konfigurasi workflow & steps approval (sudah ada tabel `approval_workflows`, `approval_steps`, `approval_instances`, `approval_instance_steps`, `approval_logs`).

Baca dan ikuti pola yang sudah ada. Jangan mengubah pola arsitektur yang sudah berjalan.

---

## 2. Aturan Main (PENTING)

1. **Schema yang sudah ada adalah PATEN.** Kamu **DILARANG** mengubah struktur tabel yang sudah ada di `src/core/db/schema/**` (pg dan mysql): tidak boleh menambah/menghapus/mengubah kolom, constraint, index, atau menghapus tabel. File `src/core/db/schema/**` yang sudah ada harus tetap utuh.
2. Kamu **BOLEH (dan kemungkinan besar HARUS)** menambah **tabel baru** untuk fitur ini — misalnya `trs_document_requests` dan tabel pendukung lain yang kamu rancang sendiri. Tambahkan definisi tabel barunya di file schema yang sesuai (pg **dan** mysql — keduanya harus konsisten).
3. Tabel approval yang sudah ada **boleh dibaca dan ditulis barisnya** (insert/update data), tapi strukturnya tidak boleh diubah.
4. Data seed (`src/core/db/seed.ts`) **boleh kamu ubah/tambah** — kamu butuh seed untuk demo (category dengan approval line berbeda, user approver, permission baru).

---

## 3. Fitur yang Dibangun

**Pengajuan dokumen (document request) yang wajib melewati approval, di mana approval line berbeda tergantung category dokumen.**

Contoh:
- Category **A** punya approval line **3 step** (berurutan).
- Category **B** punya approval line **2 step** (berurutan).

### 3.1 Flow

1. User mengajukan dokumen baru: **judul, deskripsi, category** (file upload **tidak** dibutuhkan — metadata saja).
2. Saat submit, sistem membuat **document request** dan **meresolve approval line berdasarkan category** tersebut, lalu **mensnapshot** step-step approver-nya (siapa yang harus approve di step berapa).
3. Approver melihat **inbox**: daftar request yang sedang menunggu action-nya di step aktif saat ini.
4. Approver **Approve** atau **Reject** (reject **wajib** mengisi comment).
   - Approve di step terakhir → status request menjadi **approved**.
   - Approve selain step terakhir → lanjut ke step berikutnya (approver berikutnya dapat giliran).
   - Reject → status request menjadi **rejected** dan proses berhenti.
4. Requester bisa melihat status pengajuannya (menunggu di step ke berapa, oleh siapa, sudah approved/rejected).

### 3.2 Guard (dinilai ketat — ini inti test)

- Hanya **approver pada step aktif** yang boleh melakukan approve/reject.
- Tidak bisa melakukan action **dua kali** pada step yang sama.
- Tidak bisa melakukan action pada request yang sudah **final** (approved/rejected).
- Requester **tidak boleh** approve pengajuannya sendiri (self-approval).
- Semua endpoint wajib dicek permission.

### 3.3 Permission

Tambahkan permission baru ke seed (penamaan bebas tapi konsisten, contoh):

- `document-request.view` — melihat daftar & detail request
- `document-request.manage` — submit request baru
- `approval.review` — approve/reject dari inbox

Assign ke role yang relevan di seed supaya bisa didemokan end-to-end.

### 3.4 Audit (cukup moderate)

- Setiap aksi penting dicatat: **create / approve / reject** — siapa, kapan, comment apa.
- Halaman detail request menampilkan **timeline/riwayat** aksi tersebut.

### 3.5 Seed (wajib untuk demo)

Sediakan data demo yang membuat test-mu bisa langsung dijalankan:

- Minimal **2 category** dengan approval line berbeda (3 step vs 2 step).
- User approver yang cukup (misalnya `admin` untuk beberapa step + 1-2 user lain) — kamu boleh menambah user approver baru di seed.
- Mapping category → approval line: **atur lewat seed data** (config UI untuk mengatur line per category adalah **bonus**, tidak wajib).

### 3.6 UI

- Form pengajuan dokumen baru + daftar request saya (dengan status & step saat ini) — bisa sebagai halaman baru di bawah `/dashboard`.
- **Approval inbox** — daftar request yang menunggu approval saya + tombol approve/reject (dengan input comment).
- **Halaman detail request** — info request, posisi approval (step ke berapa, siapa approver berikutnya), dan timeline audit.

Letak route & penamaan bebas, asal konsisten dengan pola yang ada.

---

## 4. Di Luar Scope (jangan dikerjakan)

- Upload file / penyimpanan dokumen fisik / versioning dokumen.
- Approval group PARALLEL / `minApproval` (cukup SEQUENTIAL).
- Approver berbasis job level / divisi (cukup user spesifik).
- Notifikasi (email/telegram), SSO, chart/dashboard analitik.
- Config UI untuk atur approval line per category (seed cukup; UI = bonus).

---

## 5. Standar Kualitas

- **Validasi input dengan Zod** (library sudah terpasang) untuk body/query endpoint baru.
- Ikuti pola module yang ada: `src/modules/v1/server|client/<domain>/` (entities → repositories → usecases → presentations), response memakai helper `apiSuccess` / `apiError` dari `src/shared/utils/api-response.ts`.
- `pnpm tsc --noEmit` **dan** `pnpm build` harus **lewat tanpa error**.
- Kode TypeScript strict, tidak ada `any` yang tidak perlu.
- **AI tooling (Cursor/Copilot/LLM dsb) boleh dipakai bebas** — yang dinilai hasil akhir dan pemahamanmu. Jawaban pertanyaan diskusi (bagian 7) wajib ditulis sendiri.

---

## 6. Cara Setup & Menjalankan

```bash
# 1. Install dependencies (Node 22, pnpm)
corepack enable && pnpm install

# 2. Siapkan env
cp .env.example .env
# sesuaikan DB_DIALECT (postgresql|mysql) dan connection string-nya

# 3. Jalankan database (contoh pakai Docker PostgreSQL)
docker run -d --name skeleton-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=db_skeleton postgres:16

# 4. Push schema + seed
pnpm db:push
pnpm db:seed

# 5. Jalankan aplikasi
pnpm dev
# buka http://localhost:3003 — login: admin / admin123
```

Verifikasi sebelum submit:

```bash
pnpm tsc --noEmit
pnpm build
```

---

## 7. Pertanyaan Diskusi (WAJIB dijawab, dikirim bersama submission)

Jawab singkat tapi padat (bullet point boleh) — ini bahan diskusi saat interview:

1. **Race condition:** bagaimana jika dua approver (atau approver yang sama) mengklik approve/reject hampir bersamaan? Apa yang bisa terjadi di desainmu dan bagaimana kamu menanganinya?
2. **Self-approval:** bagaimana jika requester adalah approver pada suatu step? Apakah desainmu mengizinkannya? Kenapa?
3. **Setelah rejected:** requester ingin memperbaiki dan mengajukan ulang. Bagaimana alur yang kamu rancang tanpa mengubah schema tabel yang sudah ada?
4. **Skema:** kalau kamu DIPERBOLEHKAN mengubah tepat satu tabel/satu kolom di schema yang sudah ada, kamu akan menambah/mengubah apa dan kenapa? (Tunjukkan pemahamanmu soal desain schema.)

---

## 8. Format Submission

1. Push hasil kerja ke repository/fork kamu sendiri (branch bebas, mis. `test/submission-namamu`). **Jangan push ke repository ini** jika belum diminta.
2. Sertakan **screenshot atau video singkat** (≤3 menit) yang menunjukkan:
   - Submit request di category line 3 step dan category line 2 step
   - Alur approve sampai final + 1 contoh reject dengan comment
   - Timeline audit di halaman detail
3. Kirim link repo + jawaban pertanyaan diskusi sebelum deadline.
4. Sertakan cara menjalankan hasil kerjamu (jika berbeda dari bagian 6).

**Selamat mengerjakan — yang dicari bukan sekadar jadi, tapi ketepatan logika dan kualitas keputusan teknismu.**
