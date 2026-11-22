# Modul & Acuan Pengerjaan Backend REST API — Re-Run

Dokumen ini merupakan acuan kerja bersama (_playbook_) bagi tim beranggotakan **4 orang** (**REST API**, **Backend**, **Database**, dan **QA**) dalam membangun sistem **Backend REST API berbasis Laravel** untuk aplikasi **Re-Run**.

> **Ruang Lingkup Proyek:** Seluruh hasil kerja tim ini murni berupa **layanan REST API (JSON Response)** yang mencakup endpoint untuk sisi _Public/Customer_ (`/api/*`) maupun endpoint kebutuhan data _Admin_ (`/api/admin/*`). Pembuatan tampilan antarmuka (UI/Frontend) berada di luar cakupan dokumen ini.

---

## 1. Standar Kode, Keamanan & Aturan Kerja Tim

Agar seluruh anggota tim memiliki pola penulisan yang seragam, aman, dan minim konflik saat penggabungan kode (_Git merge_), sepakati standar berikut:

1. **Alur Controller Lurus & Ringkas:** Setiap method di Controller mengikuti alur: **Validasi Input $\rightarrow$ Logika / Query Eloquent $\rightarrow$ Return JSON**. Hindari pemecahan file ke terlalu banyak lapisan abstraksi agar alur data mudah ditelusuri saat _debugging_.
2. **Validasi Langsung di Controller:** Gunakan `$request->validate([...])` pada baris awal setiap method yang menerima input body atau query parameter.
3. **Format JSON Seragam:** Seluruh endpoint wajib mengembalikan struktur JSON standar menggunakan trait `ApiResponse` (`status`, `message`, `data`, serta `meta` untuk endpoint yang menggunakan pagination).
4. **Konsistensi HTTP Status Code:**
   - `200 OK` / `201 Created`: Permintaan berhasil diproses / data berhasil dibuat.
   - `401 Unauthorized`: Token Sanctum tidak ada atau tidak valid.
   - `403 Forbidden`: User login tidak memiliki role `admin` saat mengakses `/api/admin/*`.
   - `404 Not Found`: Data (produk, slug, pesanan, varian) atau endpoint tidak ditemukan.
   - `422 Unprocessable Entity`: Gagal validasi input atau aturan bisnis (misal: stok tidak mencukupi, kupon kedaluwarsa, minimal belanja tidak terpenuhi).
5. **Aturan Keamanan & Integritas Transaksi:**
   - **Format `order_number` Acak:** Karena endpoint konfirmasi pesanan `GET /api/orders/{order_number}` bersifat _Public_, gunakan kombinasi tanggal dan string acak (contoh: `RR-20261122-8F3K9A`), **bukan** nomor urut berpola (`ORD-0001`), untuk mencegah kebocoran data pesanan antar pelanggan.
   - **Validasi Ulang Promo Saat Checkout:** Endpoint `POST /api/checkout` wajib menghitung ulang subtotal dan memvalidasi ulang syarat promo (`expires_at`, `min_purchase`) di dalam `DB::transaction`, serta menerima parameter opsional `promo_code` langsung dari payload agar mendukung _guest checkout_.
6. **Reference Controller sebagai Acuan Tim:** Contoh kerangka dan implementasi endpoint CRUD sederhana disediakan pada Fase 0 sebagai referensi standar penulisan validasi, query model, dan pemanggilan `$this->apiResponse()` bagi seluruh anggota tim.
7. **Code Review Sebelum Merge ke `dev-backend`:** Setiap _Pull Request_ (PR) wajib melalui _review_ cepat oleh REST API Engineer sebelum diuji oleh QA untuk memastikan keseragaman format JSON (`ApiResponse`), kelengkapan validasi input, dan pencegahan _N+1 query_.

---

## 2. Struktur Repository & Strategi Branch Git

Karena repository digunakan bersama antara tim Frontend dan Backend, struktur direktori dan alur _branching_ dipisahkan secara tegas agar tidak saling mengganggu:

### Struktur Folder Root Repository

```text
rerun-project/
├── frontend/       # Kode aplikasi Frontend
├── backend/        # Kode layanan REST API Laravel & Docker Compose
└── docs/           # Playbook & koleksi Postman (.json)
```

### Aturan Branch (1 Branch Tetap per Anggota)

Untuk menghindari kerumitan berpindah-pindah banyak branch fitur, setiap anggota tim Backend cukup menggunakan **1 branch pribadi yang tetap** dari awal hingga akhir proyek:

- **`main`**: Branch stabil untuk rilis per fase dan hasil akhir yang sudah lolos pengujian QA. **Dilarang push langsung ke `main`.**
- **`dev-backend`**: Branch integrasi utama tim Backend. Seluruh hasil kerja anggota tim Backend digabungkan ke branch ini terlebih dahulu sebelum dites oleh QA.
- **`dev-frontend`**: Branch integrasi utama tim Frontend.
- **Branch Pribadi Tim Backend** _(dibuat sekali dari `dev-backend`)_:
  - `be-api` $\rightarrow$ REST API Engineer
  - `be-backend` $\rightarrow$ Backend Engineer
  - `be-database` $\rightarrow$ Database Engineer
  - `be-qa` $\rightarrow$ QA Engineer

### Alur Harian Kerja Git Tim Backend

1. **Tarik pembaruan terbaru sebelum mulai bekerja (di branch masing-masing):**
   ```bash
   git pull origin dev-backend
   ```
2. **Simpan dan kirim progres setelah menyelesaikan satu fitur/modul:**
   ```bash
   git add .
   git commit -m "feat: deskripsi singkat fitur yang dikerjakan"
   git push origin <nama-branch-pribadi>
   ```
3. **Ajukan Pull Request (PR):** Buka PR dari branch pribadi menuju `dev-backend` untuk di-review oleh REST API Engineer dan digabungkan (_merge_).
4. **Lanjut fitur berikutnya:** Setelah PR di-merge, jalankan kembali `git pull origin dev-backend` di branch pribadi yang sama tanpa perlu membuat branch baru.

---

## 3. Setup Awal Lingkungan Lokal (Setelah Clone Repo)

Seluruh konfigurasi Docker, dependency aplikasi, dan kerangka API dasar sudah tersedia di dalam folder `backend/`. Anggota tim hanya perlu membuat branch pribadi dari `dev-backend` dan menyiapkan komponen lokal yang masuk dalam `.gitignore` (`.env`, `vendor/`, dan symlink `storage`):

1. **Clone Repo & Buat Branch Pribadi dari `dev-backend`:**

   ```bash
   git clone https://github.com/kelompok-4-ppw/Re-Run.git
   cd Re-Run
   git checkout dev-backend
   git checkout -b <nama-branch-pribadi>
   ```

2. **Salin Environment & Jalankan Container Docker:**

   ```bash
   cd backend
   cp .env.example .env
   docker compose up -d --build
   ```

3. **Install Dependency, Generate Key & Migrasi Database:**

   ```bash
   docker compose exec app composer install
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan storage:link
   docker compose exec app php artisan migrate --seed
   ```

   _(Catatan: Lengkapi nilai kredensial rahasia seperti `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di file `backend/.env` lokal masing-masing setelah dibagikan oleh Backend Engineer)._

4. **Akses Layanan Lokal Tim:**
   - **Base URL API:** `http://localhost:8000/api`
   - **MySQL Host:** `127.0.0.1:3306` (`DB: rerun_db`, `User: rerun_user`, `Pass: rerun_password`)
   - **Mailpit Web UI (Cek Email Reset Password):** `http://localhost:8025`

---

## 4. Pembagian Peran Tim & Kepemilikan Direktori Git

Untuk mencegah _merge conflict_ saat bekerja paralel, kepemilikan file dibagi secara tegas per direktori dan per file Controller (path kode aplikasi berada di dalam `backend/`):

### 1. REST API Engineer (`be-api`)

- **Tanggung Jawab:** Arsitektur gerbang komunikasi API, struktur routing, trait response JSON, konfigurasi error JSON global, logika transaksi kritis (`DB::transaction` + `lockForUpdate()`), manajemen upload multi-gambar (`Storage`), serta query katalog dan agregasi analitik.
- **Kepemilikan File:**
  - `backend/routes/api.php`
  - `backend/bootstrap/app.php` _(konfigurasi JSON exception & guest redirect API)_
  - `backend/app/Traits/ApiResponse.php`
  - `backend/app/Http/Controllers/Controller.php`
  - `backend/app/Http/Controllers/HomeController.php`
  - `backend/app/Http/Controllers/CategoryController.php`
  - `backend/app/Http/Controllers/ProductController.php`
  - `backend/app/Http/Controllers/CartController.php`
  - `backend/app/Http/Controllers/CheckoutController.php`
  - `backend/app/Http/Controllers/Admin/DashboardController.php`
  - `backend/app/Http/Controllers/Admin/ProductController.php`
  - `backend/app/Http/Controllers/Admin/OrderController.php`

### 2. Backend Engineer (`be-backend`)

- **Tanggung Jawab:** Keamanan autentikasi, middleware hak akses (`role:admin`), konfigurasi CORS, integrasi OAuth & pengiriman email, serta endpoint layanan interaksi pelanggan dan operasional admin.
- **Kepemilikan File:**
  - `backend/app/Http/Middleware/*`
  - `backend/app/Mail/*`
  - `backend/config/*`
  - `backend/app/Http/Controllers/AuthController.php`
  - `backend/app/Http/Controllers/SocialAuthController.php`
  - `backend/app/Http/Controllers/PasswordResetController.php`
  - `backend/app/Http/Controllers/WishlistController.php`
  - `backend/app/Http/Controllers/OrderController.php`
  - `backend/app/Http/Controllers/NewsletterController.php`
  - `backend/app/Http/Controllers/Admin/InventoryController.php`
  - `backend/app/Http/Controllers/Admin/NotificationController.php`

### 3. Database Engineer (`be-database`)

- **Tanggung Jawab:** Perancangan skema penyimpanan data, integritas relasi tabel, optimasi index query, Eloquent Models, dan penyediaan data uji (`DatabaseSeeder`).
- **Kepemilikan File:**
  - `backend/database/migrations/*`
  - `backend/database/seeders/*`
  - `backend/database/factories/*`
  - `backend/app/Models/*` _(wajib mempertahankan trait `HasApiTokens` pada `User.php`)_

### 4. QA Engineer (`be-qa`)

- **Tanggung Jawab:** Dokumentasi koleksi API Postman untuk seluruh 37 endpoint, pengujian fungsional (_happy path_ & _negative case_), validasi _edge case_, dan pelacakan _bug_.
- **Kepemilikan File:**
  - `docs/postman/*` _(koleksi Postman `.json`, environment variables, dan laporan hasil pengujian)_

---

## 5. Spesifikasi Modul & Pemetaan Kerja (37 Endpoint)

Seluruh endpoint dibagi ke dalam **7 Modul Kerja** agar progres tim dapat dipantau per fitur dari ujung ke ujung (_Database $\rightarrow$ Implementasi API/Backend $\rightarrow$ QA_).

### Modul 1: Autentikasi & Manajemen Akun (`/api/...`)

| Method & Endpoint                                         | Controller & Method                                                                    | Akses          | Rincian Kerja Tim                                                                                                                                                                                                                   |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/register`                                      | `AuthController@register`                                                              | Public         | **DB:** Tabel `users` (`name`, `email`, `phone`, `password`, `role`).<br>**BE:** Validasi input, hashing password, generate token Sanctum, & return JSON.<br>**QA:** Uji registrasi normal, email duplikat, & password tidak cocok. |
| `POST /api/login`                                         | `AuthController@login`                                                                 | Public         | **BE:** Validasi input, verifikasi kredensial, masa berlaku token (`remember_me`), & return JSON.<br>**QA:** Uji login valid, password salah (`401`), & input kosong (`422`).                                                       |
| `POST /api/logout`                                        | `AuthController@logout`                                                                | `auth:sanctum` | **BE:** Menghapus `currentAccessToken()` milik user.<br>**QA:** Uji akses endpoint terproteksi setelah token di-logout.                                                                                                             |
| `GET /api/me`                                             | `AuthController@me`                                                                    | `auth:sanctum` | **BE:** Mengembalikan profil user yang sedang login beserta `role` untuk kebutuhan cek sesi Frontend.<br>**QA:** Uji dengan token valid (`200`) & tanpa token (`401`).                                                              |
| `GET /api/auth/google`<br>`GET /api/auth/google/callback` | `SocialAuthController@redirectToGoogle`<br>`SocialAuthController@handleGoogleCallback` | Public         | **DB:** Kolom `google_id` pada tabel `users`.<br>**BE:** Integrasi Laravel Socialite (`stateless`), auto-create/link akun, & return token Sanctum.<br>**QA:** Verifikasi alur redirect & callback token.                            |
| `POST /api/forgot-password`<br>`POST /api/reset-password` | `PasswordResetController@sendResetLink`<br>`PasswordResetController@reset`             | Public         | **DB:** Tabel `password_reset_tokens`.<br>**BE:** Generate token reset, kirim email via Mailpit/SMTP, & update password.<br>**QA:** Uji token valid, token kadaluarsa, & email tidak terdaftar.                                     |

---

### Modul 2: Katalog Publik & Halaman Utama (`/api/...`)

| Method & Endpoint          | Controller & Method        | Akses  | Rincian Kerja Tim                                                                                                                                                                                                                                                       |
| :------------------------- | :------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/home`            | `HomeController@index`     | Public | **DB:** Relasi `products` dengan `product_images` & `product_variants`.<br>**API:** Query produk unggulan (`is_featured = true`), produk terbaru, & daftar kategori.<br>**QA:** Pastikan response memuat gambar utama & rentang harga/stok.                             |
| `GET /api/categories`      | `CategoryController@index` | Public | **DB:** Tabel `categories` (`id`, `name`, `slug`).<br>**API:** Ambil daftar seluruh kategori aktif untuk filter katalog & dropdown admin.<br>**QA:** Pastikan seluruh kategori terdaftar muncul.                                                                        |
| `GET /api/products`        | `ProductController@index`  | Public | **DB:** Index kolom filter & pencarian pada tabel `products`.<br>**API:** Implementasi query filter (`?search=`, `?category=`, `?available=1`, `?sort=`) & pagination (`?page=`).<br>**QA:** Uji kombinasi filter, sorting harga/terbaru, & struktur `meta` pagination. |
| `GET /api/products/{slug}` | `ProductController@show`   | Public | **DB:** Kolom `slug` unik pada `products`.<br>**API:** Ambil detail produk, seluruh galeri foto, daftar varian ukuran & stok, serta 4 produk terkait.<br>**QA:** Uji slug valid & slug tidak ditemukan (`404`).                                                         |

---

### Modul 3: Wishlist, Keranjang, Checkout & Newsletter (`/api/...`)

| Method & Endpoint                                                                                          | Controller & Method                                                                                                 | Akses             | Rincian Kerja Tim                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/wishlist`<br>`POST /api/wishlist/toggle`                                                         | `WishlistController@index`<br>`WishlistController@toggle`                                                           | `auth:sanctum`    | **DB:** Tabel `wishlists` (`user_id`, `product_id`).<br>**BE:** Ambil daftar wishlist user & logika toggle (attach jika belum ada, detach jika sudah ada).<br>**QA:** Uji toggle berulang & akses tanpa login (`401`).                                                                                                           |
| `GET /api/cart`<br>`POST /api/cart/items`<br>`PATCH /api/cart/items/{id}`<br>`DELETE /api/cart/items/{id}` | `CartController@index`<br>`CartController@storeItem`<br>`CartController@updateItem`<br>`CartController@destroyItem` | `auth:sanctum`    | **DB:** Tabel `carts` & `cart_items`.<br>**API:** CRUD item keranjang berdasarkan `product_variant_id`, pengecekan batas stok varian, & kalkulasi subtotal.<br>**QA:** Uji tambah varian sama (akumulasi qty), qty melebihi stok, & hapus item.                                                                                  |
| `POST /api/cart/promo`                                                                                     | `CartController@applyPromo`                                                                                         | `auth:sanctum`    | **DB:** Tabel `promos` (`code`, `discount_type`, `discount_value`, `min_purchase`, `expires_at`).<br>**API:** Validasi masa berlaku promo, minimal belanja, & hitung ulang total harga.<br>**QA:** Uji kode valid, kode expired, & belanja di bawah minimal.                                                                     |
| `POST /api/checkout`                                                                                       | `CheckoutController@store`                                                                                          | Public / Opt Auth | **DB:** Tabel `orders`, `order_items`, `order_histories`.<br>**API:** Eksekusi `DB::transaction` + `lockForUpdate()`, validasi ulang promo, potong stok varian, simpan snapshot item, buat `order_number` acak, & picu notifikasi admin.<br>**QA:** Uji checkout sukses, barang habis saat checkout, & penghitungan total akhir. |
| `GET /api/orders`                                                                                          | `OrderController@index`                                                                                             | `auth:sanctum`    | **BE:** Ambil daftar riwayat pesanan milik user yang sedang login beserta ringkasan item.<br>**QA:** Pastikan user hanya melihat pesanannya sendiri.                                                                                                                                                                             |
| `GET /api/orders/{order_number}`                                                                           | `OrderController@showByNumber`                                                                                      | Public            | **BE:** Ambil ringkasan pesanan berdasarkan `order_number` untuk kebutuhan halaman konfirmasi pesanan.<br>**QA:** Uji nomor order valid & nomor order acak (`404`).                                                                                                                                                              |
| `POST /api/newsletter`                                                                                     | `NewsletterController@store`                                                                                        | Public            | **DB:** Tabel `newsletters` (`email` unique).<br>**BE:** Validasi format email & simpan ke database.<br>**QA:** Uji email baru & pendaftaran email yang sudah terdaftar.                                                                                                                                                         |

---

### Modul 4: Endpoint Admin — Dashboard Analitik (`/api/admin/...`)

_(Seluruh endpoint pada Modul 4–7 wajib melewati middleware `auth:sanctum` dan `role:admin`)_

| Method & Endpoint          | Controller & Method               | Akses                        | Rincian Kerja Tim                                                                                                                                                                                                                                                                                                                                  |
| :------------------------- | :-------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/dashboard` | `Admin\DashboardController@index` | `auth:sanctum`, `role:admin` | **DB:** Query agregasi order 7 hari terakhir & filter varian stok rendah.<br>**API:** Susun JSON berisi 4 metrik ringkasan (`Total Products`, `Available Products`, `Total Orders`, `Pending Orders`), data grafik 7 hari, 5 pesanan terbaru, & daftar varian menipis/habis.<br>**QA:** Cocokkan angka metrik JSON dengan data aktual di database. |

---

### Modul 5: Endpoint Admin — Manajemen Data Produk & Galeri (`/api/admin/...`)

| Method & Endpoint                             | Controller & Method                    | Akses                        | Rincian Kerja Tim                                                                                                                                                                                                           |
| :-------------------------------------------- | :------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/products`                     | `Admin\ProductController@index`        | `auth:sanctum`, `role:admin` | **API:** List produk admin dengan filter kategori, status stok, search, sorting, & pagination.<br>**QA:** Uji seluruh parameter filter & pagination.                                                                        |
| `POST /api/admin/products`                    | `Admin\ProductController@store`        | `auth:sanctum`, `role:admin` | **API:** Validasi payload `multipart/form-data`, simpan file multi-gambar ke `Storage`, & simpan data produk + array varian dalam transaksi.<br>**QA:** Uji buat produk dengan beberapa foto & ukuran sekaligus.            |
| `GET /api/admin/products/{id}`                | `Admin\ProductController@show`         | `auth:sanctum`, `role:admin` | **API:** Detail lengkap produk berdasarkan `id` (termasuk ID gambar & seluruh varian stok `0`) untuk form _Edit Product_ Admin.<br>**QA:** Uji ID valid & tidak ditemukan (`404`).                                          |
| `POST /api/admin/products/{id}`               | `Admin\ProductController@update`       | `auth:sanctum`, `role:admin` | **API:** Tangani `_method=PUT` via `multipart/form-data`, update detail produk, tambah foto baru, & sinkronisasi stok varian.<br>**QA:** Uji perubahan data produk tanpa mengubah foto & dengan menambah foto baru.         |
| `DELETE /api/admin/products/{id}`             | `Admin\ProductController@destroy`      | `auth:sanctum`, `role:admin` | **DB:** Konfigurasi `SoftDeletes` pada model `Product`.<br>**API:** Hapus produk beserta pembersihan relasi/file terkait.<br>**QA:** Pastikan produk terhapus tidak muncul lagi di endpoint katalog publik.                 |
| `DELETE /api/admin/products/images/{imageId}` | `Admin\ProductController@destroyImage` | `auth:sanctum`, `role:admin` | **API:** Hapus file fisik dari storage; jika foto yang dihapus berstatus `is_primary`, otomatis promosikan foto urutan berikutnya menjadi `is_primary`.<br>**QA:** Uji hapus foto biasa vs hapus foto utama (`is_primary`). |

---

### Modul 6: Endpoint Admin — Manajemen Data Pesanan (`/api/admin/...`)

| Method & Endpoint                     | Controller & Method                  | Akses                        | Rincian Kerja Tim                                                                                                                                                                                                                                                           |
| :------------------------------------ | :----------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/orders`               | `Admin\OrderController@index`        | `auth:sanctum`, `role:admin` | **DB:** Query agregasi hitungan per status (`All`, `Pending`, `Processing`, `Completed`, `Cancelled`).<br>**API:** List pesanan dengan filter status, rentang tanggal, search, & pagination.<br>**QA:** Verifikasi akurasi jumlah hitungan per tab status.                  |
| `GET /api/admin/orders/{id}`          | `Admin\OrderController@show`         | `auth:sanctum`, `role:admin` | **DB:** Relasi `order_items` dan `order_histories`.<br>**API:** Detail lengkap pesanan, data pengiriman, snapshot item, & riwayat status.<br>**QA:** Pastikan seluruh data relasi termuat lengkap.                                                                          |
| `PATCH /api/admin/orders/{id}/status` | `Admin\OrderController@updateStatus` | `auth:sanctum`, `role:admin` | **API:** Validasi perubahan status, catat log ke `order_histories`, dan kembalikan stok varian otomatis (_auto-restock_) jika status diubah menjadi `cancelled`.<br>**QA:** Uji ubah status ke `processing` lalu ke `cancelled` dan pastikan stok varian bertambah kembali. |

---

### Modul 7: Endpoint Admin — Manajemen Inventori & Notifikasi (`/api/admin/...`)

| Method & Endpoint                                                           | Controller & Method                                                                  | Akses                        | Rincian Kerja Tim                                                                                                                                                                                                                                                                  |
| :-------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/inventory`                                                  | `Admin\InventoryController@index`                                                    | `auth:sanctum`, `role:admin` | **DB:** Query ringkasan kartu (`Total Stock`, `Low Stock`, `Out of Stock`).<br>**BE:** Daftar seluruh baris `product_variants` beserta filter status stok & pencarian.<br>**QA:** Verifikasi pengelompokan varian berdasarkan `low_stock_threshold`.                               |
| `PATCH /api/admin/inventory/{variantId}`                                    | `Admin\InventoryController@updateStock`                                              | `auth:sanctum`, `role:admin` | **BE:** Pembaruan cepat nilai `stock` dan/atau `low_stock_threshold` pada baris varian.<br>**QA:** Uji update stok ke `0` dan pastikan status berubah menjadi _Out of Stock_.                                                                                                      |
| `GET /api/admin/notifications`<br>`PATCH /api/admin/notifications/read-all` | `Admin\NotificationController@index`<br>`Admin\NotificationController@markAllAsRead` | `auth:sanctum`, `role:admin` | **DB:** Tabel `notifications` (`type`, `title`, `message`, `is_read`).<br>**BE:** Ambil daftar notifikasi admin & tandai seluruh notifikasi belum dibaca menjadi `is_read = true`.<br>**QA:** Uji pemicu notifikasi saat order masuk / stok menipis, lalu uji endpoint `read-all`. |

---

## 6. Tahapan Pengerjaan (Roadmap)

### Fase 0: Inisialisasi Proyek & Kerangka API

- **REST API & Backend:** Setup container Docker, instalasi **Laravel Sanctum** dan **Laravel Socialite**, pembuatan trait `ApiResponse`, konfigurasi exception JSON & middleware `role:admin`, penulisan kerangka 37 route di `routes/api.php`, serta penyediaan 1 _Reference Controller_ siap pakai.
- **Database:** Finalisasi rancangan skema tabel (ERD) dan mulai menyusun file migrasi inti.
- **QA:** Menyiapkan koleksi Postman dasar, _environment variables_ (`base_url`, `token`), dan memverifikasi kontrak response JSON (`200`, `401`, `403`, `404`).

### Fase 1: Skema Database, Autentikasi & Katalog Publik

- **Database:** Menyelesaikan seluruh migrasi tabel, relasi Eloquent Models, dan `DatabaseSeeder` versi pertama (akun admin, customer, kategori, produk dummy, varian, & promo).
- **Backend:** Menyelesaikan **Modul 1 (Autentikasi, `/me`, Reset Password, & Google OAuth)** serta endpoint `Newsletter`.
- **REST API:** Menyelesaikan **Modul 2 (Home, Categories, & Katalog Produk)**.
- **QA:** Menguji seluruh endpoint Fase 1 di Postman dan memastikan alur autentikasi token berjalan normal.

### Fase 2: Fitur Belanja Customer & Manajemen Produk Admin

- **REST API:** Menyelesaikan **Modul 3 (`Cart` & `Apply Promo`)** dan **Modul 5 (`Admin\ProductController` termasuk upload multi-gambar & update `_method=PUT`)**.
- **Backend:** Menyelesaikan **Modul 3 (`Wishlist`)** dan **Modul 7 (`Admin\InventoryController`)**.
- **Database:** Menambahkan skenario data uji khusus ke dalam `DatabaseSeeder` (produk stok habis, produk stok menipis, dan kode promo kadaluarsa).
- **QA:** Menguji alur keranjang belanja, perhitungan diskon promo, upload/hapus gambar produk, manajemen stok inventori, dan validasi hak akses `role:admin`.

### Fase 3: Checkout, Manajemen Order, Analitik & QA Sign-Off

- **REST API:** Menyelesaikan **`POST /api/checkout`** (`DB::transaction` + `lockForUpdate()`), **Modul 6 (`Admin\OrderController` + _auto-restock_)**, dan **Modul 4 (`Admin\Dashboard`)**.
- **Backend:** Menyelesaikan **Modul 3 (`OrderController` riwayat & tracking)** dan **Modul 7 (`Admin\NotificationController`)**.
- **QA & Seluruh Tim:** Menjalankan pengujian regresi menyeluruh pada ke-37 endpoint, memperbaiki seluruh temuan _bug_, dan mengekspor koleksi Postman final ke `docs/postman/` untuk diserahkan kepada tim Frontend.
