# Modul & Acuan Pengerjaan Backend REST API — Re-Run

Dokumen ini merupakan acuan kerja bersama (_playbook_) bagi tim beranggotakan **4 orang** (**REST API**, **Backend**, **Database**, dan **QA**) dalam membangun sistem **Backend REST API berbasis Laravel** untuk aplikasi **Re-Run**, termasuk integrasi pembayaran **Midtrans Core API & Webhook** yang disesuaikan langsung dengan kebutuhan Alur Customer dan Alur Admin.

> **Ruang Lingkup Proyek:** Seluruh hasil kerja tim ini murni berupa **layanan REST API (JSON Response)** yang mencakup endpoint untuk sisi _Public/Customer_ (`/api/*`), webhook pembayaran Midtrans, maupun endpoint kebutuhan data _Admin_ (`/api/admin/*`). Pembuatan tampilan antarmuka (UI/Frontend) berada di luar cakupan dokumen ini.

---

## 1. Standar Kode, Keamanan & Aturan Kerja Tim

Agar seluruh anggota tim memiliki pola penulisan yang seragam, aman, dan minim konflik saat penggabungan kode (_Git merge_), sepakati standar berikut:

1. **Alur Controller Lurus & Ringkas:** Setiap method di Controller mengikuti alur: **Validasi Input $\rightarrow$ Logika / Query Eloquent $\rightarrow$ Return JSON**. Hindari pemecahan file ke terlalu banyak lapisan abstraksi agar alur data mudah ditelusuri saat _debugging_.
2. **Validasi Langsung di Controller:** Gunakan `$request->validate([...])` pada baris awal setiap method yang menerima input body atau query parameter.
3. **Format JSON Seragam:** Seluruh endpoint wajib mengembalikan struktur JSON standar menggunakan trait `ApiResponse` (`status`, `message`, `data`, serta `meta` untuk endpoint yang menggunakan pagination).
4. **Konsistensi HTTP Status Code:**
   - `200 OK` / `201 Created`: Permintaan berhasil diproses / data berhasil dibuat.
   - `401 Unauthorized`: Token Sanctum tidak ada atau tidak valid.
   - `403 Forbidden`: User login tidak memiliki role `admin` saat mengakses `/api/admin/*`, atau `signature_key` webhook Midtrans tidak valid.
   - `404 Not Found`: Data (produk, slug, pesanan, varian) atau endpoint tidak ditemukan.
   - `422 Unprocessable Entity`: Gagal validasi input atau aturan bisnis (misal: stok tidak mencukupi, kupon kedaluwarsa, minimal belanja tidak terpenuhi, `terms_accepted` tidak dicentang, pesanan sudah dibatalkan).
   - `502 Bad Gateway`: Gagal berkomunikasi dengan server eksternal (misal: Midtrans Core API timeout/error saat pembuatan tagihan).
5. **Aturan Keamanan & Integritas Transaksi:**
   - **Format `order_number` Acak:** Karena endpoint konfirmasi & status pesanan bersifat _Public_, gunakan kombinasi tanggal dan string acak (contoh: `RR-20261122-8F3K9A`), **bukan** nomor urut berpola (`ORD-0001`), untuk mencegah kebocoran data pesanan antar pelanggan. Nilai `order_number` ini juga digunakan sebagai `order_id` di Midtrans.
   - **Validasi Ulang Promo Saat Checkout:** Endpoint `POST /api/checkout` wajib menghitung ulang subtotal dan memvalidasi ulang syarat promo (`expires_at`, `min_purchase`) di dalam `DB::transaction`, serta menerima parameter opsional `promo_code` langsung dari payload agar mendukung _guest checkout_.
   - **Aturan Keranjang Saat Checkout & Payment Expired:** Sesuai alur customer, **item di keranjang JANGAN dihapus saat `POST /api/checkout` masih berstatus `pending`/`unpaid`**. Keranjang milik user baru dikosongkan otomatis ketika pembayaran berstatus **`paid`** (via webhook Midtrans atau `checkStatus`). Dengan demikian, jika waktu pembayaran habis (`expired`), pesanan dibatalkan + stok dikembalikan, dan item secara otomatis tetap utuh di keranjang.
   - **Pemisahan `DB::transaction` dengan HTTP Call Midtrans:** Pemanggilan Midtrans Core API (`CoreApi::charge`) di `CheckoutController@store` dilakukan **setelah** transaksi database (`lockForUpdate()` & potong stok) di-_commit_, agar baris stok tidak terkunci terlalu lama bila jaringan ke Midtrans lambat. Jika permintaan ke Midtrans gagal, tangani pada blok `catch` dengan mengembalikan stok dan menandai pesanan gagal/batal.
   - **Keamanan Webhook Midtrans & Idempotency:** Endpoint `POST /api/payments/midtrans/notification` wajib memverifikasi `signature_key` dari Midtrans menggunakan hash SHA-512 terhadap `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY` sebelum memproses data. Proses pembaruan status wajib bersifat _idempotent_ (aman jika notifikasi diterima berulang kali atau dipicu bersamaan dengan `checkStatus`) dan dieksekusi di dalam `DB::transaction` + `lockForUpdate()` agar _auto-restock_ tidak pernah terjadi ganda.
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

   _(Catatan: Lengkapi nilai kredensial rahasia di file `backend/.env` lokal masing-masing setelah dibagikan, mencakup Google OAuth dari Backend Engineer dan Midtrans Sandbox dari REST API Engineer):_

   ```env
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=

   MIDTRANS_MERCHANT_ID=
   MIDTRANS_CLIENT_KEY=
   MIDTRANS_SERVER_KEY=
   MIDTRANS_IS_PRODUCTION=false
   MIDTRANS_IS_SANITIZED=true
   MIDTRANS_IS_3DS=true
   ```

4. **Akses Layanan Lokal Tim:**
   - **Base URL API:** `http://localhost:8000/api`
   - **MySQL Host:** `127.0.0.1:3306` (`DB: rerun_db`, `User: rerun_user`, `Pass: rerun_password`)
   - **Mailpit Web UI (Cek Email Reset Password):** `http://localhost:8025`
   - **Midtrans Sandbox Dashboard & Payment Simulator:** `https://dashboard.sandbox.midtrans.com` & `https://simulator.sandbox.midtrans.com` _(gunakan `ngrok` atau `Cloudflare Tunnel` saat menguji pengiriman webhook langsung dari server Midtrans ke `localhost:8000`)_

---

## 4. Pembagian Peran Tim & Kepemilikan Direktori Git

Untuk mencegah _merge conflict_ saat bekerja paralel, kepemilikan file dibagi secara tegas per direktori dan per file Controller (path kode aplikasi berada di dalam `backend/`):

### 1. REST API Engineer (`be-api`)

- **Tanggung Jawab:** Arsitektur gerbang komunikasi API, struktur routing, trait response JSON, konfigurasi error JSON global, logika transaksi kritis (`DB::transaction` + `lockForUpdate()`), **integrasi pembayaran Midtrans Core API (`CoreApi::charge`, `Transaction::status`, & Webhook Notification)**, manajemen upload multi-gambar (`Storage`), serta query katalog dan analitik dashboard.
- **Alasan Payment dipegang `be-api`:** Seluruh logika pemotongan stok (`CheckoutController`), pengembalian stok otomatis saat pembayaran gagal/kedaluwarsa & sinkronisasi status (`PaymentController`), pengosongan keranjang saat lunas, serta pengembalian stok saat admin membatalkan order (`Admin\OrderController`) berada di bawah satu pengelola sehingga konsistensi transaksi dan pencegahan _race condition_ lebih terjaga.
- **Kepemilikan File:**
  - `backend/routes/api.php`
  - `backend/bootstrap/app.php` _(konfigurasi JSON exception & guest redirect API)_
  - `backend/config/midtrans.php` _(konfigurasi Midtrans SDK)_
  - `backend/app/Traits/ApiResponse.php`
  - `backend/app/Http/Controllers/Controller.php`
  - `backend/app/Http/Controllers/HomeController.php`
  - `backend/app/Http/Controllers/CategoryController.php`
  - `backend/app/Http/Controllers/ProductController.php`
  - `backend/app/Http/Controllers/CartController.php`
  - `backend/app/Http/Controllers/CheckoutController.php` _(checkout + Midtrans Core API charge)_
  - `backend/app/Http/Controllers/PaymentController.php` _(check payment status + webhook Midtrans + verifikasi SHA-512 + auto-restock)_
  - `backend/app/Http/Controllers/Admin/DashboardController.php`
  - `backend/app/Http/Controllers/Admin/ProductController.php`
  - `backend/app/Http/Controllers/Admin/OrderController.php`

### 2. Backend Engineer (`be-backend`)

- **Tanggung Jawab:** Keamanan autentikasi, manajemen profil pelanggan (`favorite_size` & alamat tersimpan), middleware hak akses (`role:admin`), konfigurasi CORS & layanan email/OAuth, serta endpoint interaksi pelanggan (wishlist, riwayat & detail pesanan, newsletter) dan manajemen inventori admin.
- **Kepemilikan File:**
  - `backend/app/Http/Middleware/*`
  - `backend/app/Mail/*`
  - `backend/config/*` _(selain `midtrans.php`, seperti `cors.php`, `sanctum.php`, `services.php`, `mail.php`)_
  - `backend/app/Http/Controllers/AuthController.php` _(termasuk `me` & `updateProfile`)_
  - `backend/app/Http/Controllers/SocialAuthController.php`
  - `backend/app/Http/Controllers/PasswordResetController.php`
  - `backend/app/Http/Controllers/WishlistController.php`
  - `backend/app/Http/Controllers/OrderController.php`
  - `backend/app/Http/Controllers/NewsletterController.php`
  - `backend/app/Http/Controllers/Admin/InventoryController.php`

### 3. Database Engineer (`be-database`)

- **Tanggung Jawab:** Perancangan skema penyimpanan data (termasuk tabel `payments`, kolom profil pada `users`, dan atribut detail produk pada `products`), integritas relasi tabel, optimasi index query, Eloquent Models, dan penyediaan data uji (`DatabaseSeeder`).
- **Kepemilikan File:**
  - `backend/database/migrations/*`
  - `backend/database/seeders/*`
  - `backend/database/factories/*`
  - `backend/app/Models/*` _(wajib mempertahankan trait `HasApiTokens` pada `User.php`)_

### 4. QA Engineer (`be-qa`)

- **Tanggung Jawab:** Dokumentasi koleksi API Postman untuk seluruh 38 endpoint, pengujian fungsional (_happy path_ & _negative case_), pengujian semua metode bayar Midtrans Core API (QRIS, VA, E-Wallet), simulasi webhook (valid/invalid signature & _idempotency_), validasi _edge case_ (keranjang tetap utuh saat expired), dan pelacakan _bug_.
- **Kepemilikan File:**
  - `docs/postman/*` _(koleksi Postman `.json`, environment variables, dan laporan hasil pengujian)_

---

## 5. Hasil Koreksi Modul Berdasarkan Permintaan Awal Customer & Admin

Berdasarkan audit menyeluruh terhadap dokumen **Alur Customer** dan **Alur Admin**, dilakukan penyesuaian berikut agar API tepat sasaran tanpa fitur kurang maupun mubazir:

### A. Perubahan Arsitektur Pembayaran: Midtrans Snap $\rightarrow$ Midtrans Core API

- **Masalah sebelumnya:** Midtrans Snap hanya membuka popup/halaman milik Midtrans dan **tidak** mengembalikan data nomor VA, gambar/string QRIS, atau link aplikasi E-Wallet untuk dirender sendiri oleh Frontend.
- **Koreksi sesuai Alur Customer:** Customer meminta halaman pembayaran custom langsung di aplikasi (pilih metode di Checkout $\rightarrow$ halaman QRIS dengan kode QR, halaman VA dengan nomor VA + nominal + instruksi ATM/m-banking, halaman E-Wallet dengan tombol buka aplikasi, timer, status _"Waiting for payment..."_, dan tombol **Check Payment Status**). Oleh karena itu, integrasi diubah ke **Midtrans Core API (`CoreApi::charge`)** yang juga gratis tanpa _monthly fee_.
- **Endpoint `GET /api/payments/{order_number}/status` (Disediakan Kembali di `be-api`):** Diperlukan secara khusus untuk mendukung polling otomatis dan tombol **"Check Payment Status"** yang mengecek langsung ke Midtrans Status API (`Transaction::status`) sekaligus menyinkronkan status database jika webhook terlambat masuk.
- **Catatan Penting Metode OVO & DANA di Midtrans:** Midtrans Core API mendukung langsung secara native: **QRIS**, **Virtual Account (BCA, BNI, BRI, Mandiri)**, **GoPay**, dan **ShopeePay**. Untuk **OVO dan DANA**, Midtrans tidak menyediakan channel direct deeplink Core API standar; keduanya tetap bisa dibayar pelanggan melalui **QRIS** (interoperable untuk seluruh e-wallet Indonesia). Solusi praktisnya dijelaskan pada Bagian 7.

### B. Penambahan & Perbaikan Fitur Sesuai Alur Customer

1. **Tambah Endpoint `PATCH /api/me` (Update Profil Customer):** Di Alur Customer bagian **Profil**, pelanggan dapat melihat data diri, **ukuran favorit**, alamat pengiriman, dan pesanan terbaru. Tabel `users` perlu kolom `favorite_size`, `address`, `city`, `postal_code` beserta endpoint `PATCH /api/me` untuk memperbaruinya.
2. **Aturan Keranjang Saat Payment Expired:** Di Alur Customer bagian **Checkout & Pembayaran**, disebutkan secara eksplisit: _"Kalau waktu habis... Pesanan dibatalkan, dan itemnya tetap ada di keranjang."_ Maka, `POST /api/checkout` **tidak menghapus cart**; cart baru dibersihkan saat status pembayaran berubah menjadi `paid`. Saat user menekan **Try Again**, Frontend mengarahkan ulang untuk membuat transaksi checkout baru (`order_number` baru).
3. **Kelengkapan Atribut Produk & Validasi Register:**
   - `POST /api/register`: wajib memvalidasi `terms_accepted` (`accepted`).
   - `products`: perlu kolom `badge` (`new`, `pre_loved`, `limited`), `condition`, `material`, `fit`, `size_guide`, `care_instructions`, dan `shipping_return_info` agar seluruh informasi di kartu Shop dan halaman Detail Produk tersedia dari API.
   - `GET /api/products` & `GET /api/wishlist`: wajib menyertakan ringkasan varian ukuran & ketersediaan stok (`variants`, `is_available`) untuk mendukung fitur **Quick Add** di Shop dan tombol **Add to Cart / Sold Out** di Wishlist.
4. **`POST /api/newsletter` Ditetapkan Menjadi Wajib:** Pada Alur Customer poin 6, footer secara eksplisit mencantumkan fitur newsletter, sehingga endpoint ini tidak lagi bersifat opsional.

### C. Penghapusan Endpoint & Fitur yang Tidak Diminta

1. **Hapus Modul Notifikasi Admin (2 Endpoint Dihapus):** `GET /api/admin/notifications` dan `PATCH /api/admin/notifications/read-all` (beserta `Admin\NotificationController` dan tabel `notifications`) **dihapus** karena sama sekali tidak terdapat pada Alur Admin (Dashboard, Products, Orders, Inventory, Logout).
2. **Grafik 7 Hari di `GET /api/admin/dashboard` (Ditandai Opsional):** Alur Admin hanya meminta 4 kartu ringkasan, tabel pesanan terbaru, dan ringkasan stok rendah & stok habis. Data grafik 7 hari boleh tidak dibuat jika UI Dashboard tidak menampilkannya.
3. **Halaman Statis Tanpa Endpoint Backend:** Halaman _About (cerita brand)_, tautan kontak di footer, dan _Quick Actions_ pada Dashboard Admin murni ditangani oleh Frontend.

---

## 6. Spesifikasi Modul & Pemetaan Kerja (38 Endpoint)

Seluruh endpoint dibagi ke dalam **7 Modul Kerja** agar progres tim dapat dipantau per fitur dari ujung ke ujung (_Database $\rightarrow$ Implementasi API/Backend $\rightarrow$ QA_).

### Modul 1: Autentikasi, Akun & Profil (`/api/...`) — 9 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `POST /api/register` | `AuthController@register` | Public | **DB:** Tabel `users` (`name`, `email`, `phone`, `password`, `role`, `favorite_size`, `address`, `city`, `postal_code`).<br>**BE:** Validasi input (wajib `terms_accepted` bernilai `accepted` & `password_confirmation`), hashing password, generate token Sanctum, & return JSON.<br>**QA:** Uji registrasi normal, email duplikat, password tidak cocok, & `terms_accepted` false (`422`). |
| `POST /api/login` | `AuthController@login` | Public | **BE:** Validasi input, verifikasi kredensial (untuk Customer & Admin), masa berlaku token (`remember_me`), & return JSON berisi `token` + profil user + `role`.<br>**QA:** Uji login customer & admin valid, password salah (`401`), & input kosong (`422`). |
| `POST /api/logout` | `AuthController@logout` | `auth:sanctum` | **BE:** Menghapus `currentAccessToken()` milik user (Customer & Admin).<br>**QA:** Uji akses endpoint terproteksi setelah token di-logout (`401`). |
| `GET /api/me` | `AuthController@me` | `auth:sanctum` | **BE:** Mengembalikan profil lengkap user login (`name`, `email`, `phone`, `role`, `favorite_size`, `address`, `city`, `postal_code`) beserta ringkasan 5 pesanan terbaru untuk halaman Profil.<br>**QA:** Uji dengan token valid (`200`) & tanpa token (`401`). |
| `PATCH /api/me` | `AuthController@updateProfile` | `auth:sanctum` | **BE:** Validasi & perbarui data diri (`name`, `phone`), `favorite_size`, serta alamat pengiriman tersimpan (`address`, `city`, `postal_code`).<br>**QA:** Uji update sebagian maupun seluruh field profil & pastikan data tersimpan. |
| `GET /api/auth/google`<br>`GET /api/auth/google/callback` | `SocialAuthController@redirectToGoogle`<br>`SocialAuthController@handleGoogleCallback` | Public | **DB:** Kolom `google_id` pada tabel `users`.<br>**BE:** Integrasi Laravel Socialite (`stateless`), auto-create/link akun, & return token Sanctum.<br>**QA:** Verifikasi alur redirect & callback token. |
| `POST /api/forgot-password`<br>`POST /api/reset-password` | `PasswordResetController@sendResetLink`<br>`PasswordResetController@reset` | Public | **DB:** Tabel `password_reset_tokens`.<br>**BE:** Generate token reset, kirim email via Mailpit/SMTP, & update password.<br>**QA:** Uji token valid, token kedaluwarsa, & email tidak terdaftar. |

---

### Modul 2: Katalog Publik & Halaman Utama (`/api/...`) — 4 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/home` | `HomeController@index` | Public | **DB:** Relasi `products` dengan `product_images` & `product_variants`.<br>**API:** Query Produk Unggulan (`is_featured = true`), New Arrivals (produk terbaru), & daftar kategori beserta gambar utama, `badge`, dan status stok.<br>**QA:** Pastikan response memuat gambar utama, `badge`, & daftar varian/stok. |
| `GET /api/categories` | `CategoryController@index` | Public | **DB:** Tabel `categories` (`id`, `name`, `slug`).<br>**API:** Ambil daftar seluruh kategori aktif untuk filter katalog & dropdown admin.<br>**QA:** Pastikan seluruh kategori terdaftar muncul. |
| `GET /api/products` | `ProductController@index` | Public | **DB:** Index kolom filter & pencarian pada tabel `products` (termasuk kolom `badge`).<br>**API:** Implementasi filter (`?search=`, `?category=`, `?available=1`, `?sort=`) & pagination (`?page=`). Sertakan `badge`, ringkasan `variants` (untuk _Quick Add_ saat hover), total produk di `meta.total`, & `is_wishlisted` (jika user mengirim token).<br>**QA:** Uji kombinasi filter, sorting harga/terbaru, _Quick Add_ varian, & struktur `meta` pagination. |
| `GET /api/products/{slug}` | `ProductController@show` | Public | **DB:** Kolom `slug` unik + kolom detail (`badge`, `condition`, `material`, `fit`, `size_guide`, `care_instructions`, `shipping_return_info`) pada `products`.<br>**API:** Ambil detail produk lengkap, galeri foto, daftar varian ukuran & stok (termasuk ukuran habis/stok `0`), serta 4 produk terkait.<br>**QA:** Uji slug valid (pastikan semua info bahan/fit/perawatan/retur muncul) & slug tidak ditemukan (`404`). |

---

### Modul 3: Wishlist, Keranjang, Checkout, Pembayaran (Midtrans Core API) & Newsletter (`/api/...`) — 13 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/wishlist`<br>`POST /api/wishlist/toggle` | `WishlistController@index`<br>`WishlistController@toggle` | `auth:sanctum` | **DB:** Tabel `wishlists` (`user_id`, `product_id`).<br>**BE:** Ambil daftar wishlist user lengkap dengan status `is_available` & varian (untuk tombol _Add to Cart_ vs _Sold Out_), serta logika toggle (attach/detach).<br>**QA:** Uji toggle berulang, tampilan produk stok habis (`is_available: false`), & akses tanpa login (`401`). |
| `GET /api/cart`<br>`POST /api/cart/items`<br>`PATCH /api/cart/items/{id}`<br>`DELETE /api/cart/items/{id}` | `CartController@index`<br>`CartController@storeItem`<br>`CartController@updateItem`<br>`CartController@destroyItem` | `auth:sanctum` | **DB:** Tabel `carts` & `cart_items`.<br>**API:** CRUD item keranjang berdasarkan `product_variant_id`, pengecekan batas stok varian, & kalkulasi subtotal/ringkasan pesanan.<br>**QA:** Uji tambah varian sama (akumulasi qty), qty melebihi stok (`422`), hapus item, & response saat keranjang kosong. |
| `POST /api/cart/promo` | `CartController@applyPromo` | Public / Opt Auth | **DB:** Tabel `promos` (`code`, `discount_type`, `discount_value`, `min_purchase`, `expires_at`).<br>**API:** Validasi masa berlaku promo, minimal belanja, & hitung estimasi diskon (mendukung cart user login maupun payload `subtotal` untuk _guest_).<br>**QA:** Uji kode valid, kode expired, belanja di bawah minimal, & akses sebagai guest maupun user login. |
| `POST /api/checkout` | `CheckoutController@store` | Public / Opt Auth | **DB:** Tabel `orders` (`status = pending`, `payment_status = unpaid`, data alamat lengkap), `order_items`, `order_histories`, & `payments`.<br>**API:** (1) Validasi alamat (`name`, `email`, `phone`, `address`, `city`, `postal_code`) & `payment_method` (`qris`, `va_bca`, `va_bni`, `va_bri`, `va_mandiri`, `gopay`, `shopeepay`, dll); (2) Dalam `DB::transaction` + `lockForUpdate()`, validasi ulang promo, potong stok varian, simpan snapshot item, buat `order_number` acak — **JANGAN hapus cart dulu**; (3) Setelah commit, panggil **Midtrans Core API (`CoreApi::charge`)**, simpan data bayar (`qr_url`/`qr_string`, `va_number`, `biller_code`, `deeplink_url`, `expired_at`) ke `payments`, lalu return data order + instruksi bayar. Jika Midtrans gagal, kembalikan stok & return `502`.<br>**QA:** Uji checkout untuk metode QRIS, VA (BCA/BNI/BRI/Mandiri), & E-Wallet; pastikan cart masih utuh saat status masih `pending`, dan uji barang habis saat checkout (`422`). |
| `GET /api/payments/{order_number}/status` | `PaymentController@checkStatus` | Public | **API:** Endpoint untuk polling otomatis & tombol **"Check Payment Status"**. Jika status di DB masih `unpaid`, panggil Midtrans Status API (`Transaction::status`), sinkronkan status `payments` & `orders` dalam `DB::transaction` + `lockForUpdate()`, kosongkan cart user jika baru berubah menjadi `paid`, atau jalankan _auto-restock_ (dan biarkan cart utuh) jika berubah menjadi `expired`/`failed`.<br>**QA:** Uji cek status saat `pending`, setelah dibayar di Simulator Midtrans (`paid`), & setelah melewati `expired_at` (`expired`). |
| `POST /api/payments/midtrans/notification` | `PaymentController@handleNotification` | Public (Webhook) | **DB:** Update record `payments`, `orders.payment_status`, `orders.status`, & insert `order_histories`.<br>**API:** Verifikasi `signature_key` SHA-512 (`403` jika tidak valid), petakan status Midtrans secara _idempotent_ di dalam `DB::transaction` + `lockForUpdate()`, kosongkan cart user saat `paid`, & jalankan _auto-restock_ (tanpa menghapus cart) saat transaksi `expire`/`cancel`/`deny`.<br>**QA:** Simulasi payload webhook Midtrans (`settlement`, `pending`, `expire`, `cancel`), uji signature palsu (`403`), uji pengiriman ganda (_idempotency_), pastikan stok kembali & cart tetap utuh saat `expire`, serta cart kosong saat `settlement`. |
| `GET /api/orders` | `OrderController@index` | `auth:sanctum` | **BE:** Ambil daftar riwayat pesanan milik user yang sedang login beserta `payment_status`, metode bayar, & ringkasan item (mendukung `?limit=` untuk tampilan Profil).<br>**QA:** Pastikan user hanya melihat pesanannya sendiri. |
| `GET /api/orders/{order_number}` | `OrderController@showByNumber` | Public | **BE:** Ambil ringkasan pesanan lengkap beserta objek `payment` (`payment_method`, `payment_status`, `va_number`, `biller_code`, `qr_url`, `deeplink_url`, `expired_at`, `paid_at`, & instruksi bayar) untuk halaman Pembayaran (saat reload) maupun halaman **Order Success**.<br>**QA:** Uji nomor order valid (status `pending`, `paid`, `expired`) & nomor order acak (`404`). |
| `POST /api/newsletter` | `NewsletterController@store` | Public | **DB:** Tabel `newsletters` (`email` unique).<br>**BE:** Validasi format email & simpan ke database untuk form newsletter di footer.<br>**QA:** Uji email baru (`201`) & email yang sudah terdaftar (`422`). |

---

### Modul 4: Endpoint Admin — Dashboard Analitik (`/api/admin/...`) — 1 Endpoint

_(Seluruh endpoint pada Modul 4–7 wajib melewati middleware `auth:sanctum` dan `role:admin`)_

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/admin/dashboard` | `Admin\DashboardController@index` | `auth:sanctum`, `role:admin` | **DB:** Query ringkasan produk, order, dan filter varian stok rendah/habis.<br>**API:** Susun JSON berisi 4 kartu ringkasan (`Total Products`, `Available Products`, `Total Orders`, `Pending Orders`), tabel 5 pesanan terbaru (beserta `payment_status`), & ringkasan daftar varian stok rendah dan stok habis _(data grafik 7 hari bersifat opsional)_.<br>**QA:** Cocokkan angka metrik JSON dengan data aktual di database. |

---

### Modul 5: Endpoint Admin — Manajemen Data Produk & Galeri (`/api/admin/...`) — 6 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/admin/products` | `Admin\ProductController@index` | `auth:sanctum`, `role:admin` | **API:** List produk admin dengan filter kategori, filter status stok, pencarian (`?search=`), sorting, & pagination.<br>**QA:** Uji seluruh parameter filter, pagination, & state kosong saat pencarian tidak ditemukan. |
| `POST /api/admin/products` | `Admin\ProductController@store` | `auth:sanctum`, `role:admin` | **API:** Validasi payload `multipart/form-data` (nama, deskripsi, kategori, harga, `badge`, `condition`, `material`, `fit`, `size_guide`, `care_instructions`, multi-gambar, & array varian ukuran + stok), simpan gambar ke `Storage`, & simpan data dalam transaksi.<br>**QA:** Uji buat produk dengan beberapa foto, atribut detail, & beberapa ukuran sekaligus. |
| `GET /api/admin/products/{id}` | `Admin\ProductController@show` | `auth:sanctum`, `role:admin` | **API:** Detail lengkap produk berdasarkan `id` (termasuk ID gambar & seluruh varian stok `0`) untuk form _Edit Product_ Admin.<br>**QA:** Uji ID valid & tidak ditemukan (`404`). |
| `POST /api/admin/products/{id}` | `Admin\ProductController@update` | `auth:sanctum`, `role:admin` | **API:** Tangani `_method=PUT` via `multipart/form-data`, update detail & atribut produk, tambah foto baru, & sinkronisasi stok varian.<br>**QA:** Uji perubahan data produk tanpa mengubah foto & dengan menambah foto baru. |
| `DELETE /api/admin/products/{id}` | `Admin\ProductController@destroy` | `auth:sanctum`, `role:admin` | **DB:** Konfigurasi `SoftDeletes` pada model `Product`.<br>**API:** Hapus produk (soft delete) agar tidak mengganggu histori pesanan lama.<br>**QA:** Pastikan produk terhapus tidak muncul lagi di endpoint katalog publik. |
| `DELETE /api/admin/products/images/{imageId}` | `Admin\ProductController@destroyImage` | `auth:sanctum`, `role:admin` | **API:** Hapus file fisik dari storage; jika foto yang dihapus berstatus `is_primary`, otomatis promosikan foto urutan berikutnya menjadi `is_primary`.<br>**QA:** Uji hapus foto biasa vs hapus foto utama (`is_primary`). |

---

### Modul 6: Endpoint Admin — Manajemen Data Pesanan (`/api/admin/...`) — 3 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/admin/orders` | `Admin\OrderController@index` | `auth:sanctum`, `role:admin` | **DB:** Query agregasi hitungan per tab status (`All`, `Pending`, `Processing`, `Completed`, `Cancelled`).<br>**API:** List pesanan dengan filter status order, filter `payment_status`, rentang tanggal, pencarian, & pagination.<br>**QA:** Verifikasi akurasi jumlah hitungan per tab status. |
| `GET /api/admin/orders/{id}` | `Admin\OrderController@show` | `auth:sanctum`, `role:admin` | **DB:** Relasi `order_items`, `order_histories`, dan `payment`.<br>**API:** Detail lengkap pesanan: info pesanan, data customer & alamat, info pembayaran Midtrans (`payment_method`, `payment_status`, `midtrans_transaction_id`, `paid_at`), produk yang dipesan, total, & timeline riwayat status.<br>**QA:** Pastikan seluruh data relasi & urutan timeline termuat lengkap. |
| `PATCH /api/admin/orders/{id}/status` | `Admin\OrderController@updateStatus` | `auth:sanctum`, `role:admin` | **API:** Validasi perubahan status, catat log ke `order_histories`, dan kembalikan stok varian otomatis (_auto-restock_) jika status diubah menjadi `cancelled` (cegah restock ganda jika sudah dibatalkan oleh Midtrans).<br>**QA:** Uji ubah status ke `processing` lalu ke `cancelled` dan pastikan stok varian bertambah kembali serta tercatat di timeline. |

---

### Modul 7: Endpoint Admin — Manajemen Inventori (`/api/admin/...`) — 2 Endpoint

| Method & Endpoint | Controller & Method | Akses | Rincian Kerja Tim |
| :--- | :--- | :--- | :--- |
| `GET /api/admin/inventory` | `Admin\InventoryController@index` | `auth:sanctum`, `role:admin` | **DB:** Query ringkasan kartu (`Total Stock`, `Low Stock`, `Out of Stock`) pada `product_variants`.<br>**BE:** Daftar seluruh baris varian per produk dan ukuran beserta status (`In Stock`, `Low Stock`, `Out of Stock`), filter status stok, & pencarian.<br>**QA:** Verifikasi pengelompokan varian berdasarkan `low_stock_threshold`. |
| `PATCH /api/admin/inventory/{variantId}` | `Admin\InventoryController@updateStock` | `auth:sanctum`, `role:admin` | **BE:** Pembaruan cepat nilai `stock` dan/atau `low_stock_threshold` langsung dari baris tabel inventori.<br>**QA:** Uji update stok ke `0` (berubah ke _Out of Stock_) & update ke angka di atas threshold (berubah ke _In Stock_). |

---

## 7. Panduan Teknis Integrasi Midtrans Core API & Alur Pembayaran

Bagian ini menjadi acuan bersama bagi **REST API Engineer (`be-api`)**, **Database Engineer (`be-database`)**, dan **QA Engineer (`be-qa`)** agar halaman pembayaran custom Frontend berjalan mulus.

### A. Pemetaan Pilihan Metode Bayar Frontend $\rightarrow$ Payload Midtrans Core API

| Pilihan Customer di Checkout | Nilai `payment_method` API | Parameter `CoreApi::charge()` Midtrans | Data yang Dikembalikan API ke Frontend |
| :--- | :--- | :--- | :--- |
| **QRIS** | `qris` | `payment_type: "qris"` | `qr_url` (dari `actions[name=generate-qr-code].url`), `qr_string`, `expired_at` |
| **VA BCA** | `va_bca` | `payment_type: "bank_transfer"`, `bank_transfer: { bank: "bca" }` | `va_number` (dari `va_numbers[0].va_number`), `bank: "bca"`, `gross_amount`, `expired_at` |
| **VA BNI** | `va_bni` | `payment_type: "bank_transfer"`, `bank_transfer: { bank: "bni" }` | `va_number` (dari `va_numbers[0].va_number`), `bank: "bni"`, `gross_amount`, `expired_at` |
| **VA BRI** | `va_bri` | `payment_type: "bank_transfer"`, `bank_transfer: { bank: "bri" }` | `va_number` (dari `va_numbers[0].va_number`), `bank: "bri"`, `gross_amount`, `expired_at` |
| **VA Mandiri** | `va_mandiri` | `payment_type: "echannel"`, `echannel: { bill_info1: "Payment:", bill_info2: "Re-Run Order" }` | `biller_code` (`70012`), `va_number` (diisi dari `bill_key`), `bank: "mandiri"`, `gross_amount`, `expired_at` |
| **GoPay** | `gopay` | `payment_type: "gopay"`, `gopay: { enable_callback: true, callback_url: ... }` | `deeplink_url` (dari `actions[name=deeplink-redirect].url`), `qr_url` (opsional untuk desktop), `expired_at` |
| **ShopeePay** | `shopeepay` | `payment_type: "shopeepay"`, `shopeepay: { callback_url: ... }` | `deeplink_url` (dari `actions[name=deeplink-redirect].url`), `expired_at` |
| **OVO / DANA** *(Catatan Khusus)* | `ovo` / `dana` $\rightarrow$ *QRIS Fallback* | `payment_type: "qris"` *(Midtrans Core API tidak memiliki direct deeplink native untuk OVO/DANA)* | Kembalikan `qr_url` + flag `payment_flow: "qris"` agar Frontend menampilkan QRIS dengan keterangan _"Scan menggunakan aplikasi OVO / DANA"_ (atau sepakati dengan Frontend untuk menyederhanakan E-Wallet langsung ke GoPay & ShopeePay sementara OVO/DANA memakai opsi QRIS). |

> **Catatan Timer Pembayaran:** Gunakan parameter `custom_expiry` pada payload `CoreApi::charge()` (misalnya `expiry_duration: 15`, `unit: "minute"` atau sesuai kesepakatan tim) agar waktu hitung mundur (_timer_) konsisten antara halaman Frontend dan server Midtrans.

### B. Alur Transaksi, Keranjang & Tombol "Try Again"

1. **Place Order (`POST /api/checkout`):**
   - Validasi input + cek stok + potong stok dalam `DB::transaction` + `lockForUpdate()`.
   - Simpan `orders` (`status = pending`, `payment_status = unpaid`). **Jangan hapus isi `cart_items` milik user.**
   - Setelah commit, panggil `CoreApi::charge()` ke Midtrans dan simpan hasilnya ke tabel `payments`. Return JSON berisi `order_number`, `grand_total`, `expired_at`, dan detail pembayaran sesuai metode.
2. **Halaman Pembayaran ("Waiting for payment..."):**
   - Frontend menampilkan QR / VA / tombol E-Wallet beserta _countdown timer_ berdasarkan `expired_at`.
   - Frontend melakukan polling berkala (misal tiap 5–10 detik) dan/atau menyediakan tombol **"Check Payment Status"** yang memanggil `GET /api/payments/{order_number}/status`.
3. **Saat Pembayaran Masuk (`paid`):**
   - Baik melalui Webhook (`POST /api/payments/midtrans/notification`) maupun `checkStatus`, sistem memperbarui `orders.payment_status = paid`, `orders.status = processing`, mencatat `paid_at`, menambah `order_histories`, dan **menghapus `cart_items` milik user** (jika checkout dilakukan oleh user login).
   - Frontend mendeteksi status `paid` dan mengarahkan customer ke halaman **Order Success** (`GET /api/orders/{order_number}`).
4. **Saat Waktu Habis (`Payment Expired` & Tombol `Try Again`):**
   - Begitu Midtrans mengirim status `expire` (atau `checkStatus` mendeteksi `expire`), sistem mengubah `orders.payment_status = expired`, `orders.status = cancelled`, dan mengembalikan stok varian (*auto-restock*). **Item di keranjang tetap utuh.**
   - Jika customer menekan **Try Again**, Frontend mengarahkan customer kembali ke Checkout / mengirim ulang `POST /api/checkout` untuk membuat `order_number` baru (karena `order_id` yang sudah expired di Midtrans tidak dapat dibayar atau di-_charge_ ulang).

### C. Acuan Lengkap Skema Database & Kontrak Model Eloquent (untuk `be-database`)

Agar query di sisi `be-api` dan `be-backend` langsung sinkron tanpa beda penamaan kolom maupun relasi, gunakan kontrak skema dan Eloquent berikut (**catatan: tabel `notifications` TIDAK dibuat** karena modul notifikasi admin sudah dihapus):

1. **`users`** _(catatan: migrasi bawaan Fase 0 `0001_01_01_000000_create_users_table.php` baru memuat kolom standar Laravel, sehingga seluruh kolom ekstra wajib ditambahkan oleh `be-database`)_:
   - `id`, `name`, `email` (`unique`), `email_verified_at` (`nullable`)
   - `password` (`string`, **`nullable`** — wajib `nullable` untuk mendukung akun yang mendaftar murni via Google OAuth)
   - `phone` (`string`, `nullable`), `role` (`string`, default `'customer'`: `'customer'`, `'admin'`), `google_id` (`string`, `nullable`, `unique`)
   - Kolom profil & alamat tersimpan: `favorite_size` (`string`, `nullable`), `address` (`text`, `nullable`), `city` (`string`, `nullable`), `postal_code` (`string`, `nullable`)
   - `remember_token`, `timestamps`
2. **`categories`:**
   - `id`, `name` (`string`), `slug` (`string`, `unique`), `is_active` (`boolean`, default `true`), `timestamps`
3. **`products`** _(wajib mengaktifkan `SoftDeletes` / kolom `deleted_at`)_:
   - `id`, `category_id` (`foreignId` ke `categories.id`), `name` (`string`, indexed), `slug` (`string`, `unique`), `description` (`text`, `nullable`)
   - **`base_price`** (`unsignedBigInteger` — wajib bernama `base_price` agar sesuai dengan Reference Controller `ProductController`)
   - `is_featured` (`boolean`, default `false`, indexed)
   - `badge` (`string`, `nullable`, indexed — nilai: `'new'`, `'pre_loved'`, `'limited'`)
   - Atribut detail produk: `condition` (`string`, `nullable`), `material` (`string`, `nullable`), `fit` (`string`, `nullable`), `size_guide` (`text`/`json`, `nullable`), `care_instructions` (`text`, `nullable`), `shipping_return_info` (`text`, `nullable`)
   - `timestamps`, `softDeletes`
4. **`product_images`:**
   - `id`, `product_id` (`foreignId` ke `products.id`, `cascadeOnDelete`), `image_path` (`string`), `is_primary` (`boolean`, default `false`), `sort_order` (`unsignedInteger`, default `0`), `timestamps`
5. **`product_variants`:**
   - `id`, `product_id` (`foreignId` ke `products.id`, `cascadeOnDelete`), `size` (`string`), `sku` (`string`, `nullable`, `unique`), `stock` (`unsignedInteger`, default `0`), `low_stock_threshold` (`unsignedInteger`, default `5`), `timestamps` _(unique komposit `['product_id', 'size']`)_
6. **`wishlists`:**
   - `id`, `user_id` (`foreignId` ke `users.id`, `cascadeOnDelete`), `product_id` (`foreignId` ke `products.id`, `cascadeOnDelete`), `timestamps` _(unique komposit `['user_id', 'product_id']`)_
7. **`carts` & `cart_items`:**
   - `carts`: `id`, `user_id` (`foreignId` ke `users.id`, `unique`, `cascadeOnDelete`), `timestamps`
   - `cart_items`: `id`, `cart_id` (`foreignId` ke `carts.id`, `cascadeOnDelete`), `product_variant_id` (`foreignId` ke `product_variants.id`, `cascadeOnDelete`), `quantity` (`unsignedInteger`, default `1`), `timestamps` _(unique komposit `['cart_id', 'product_variant_id']`)_
8. **`promos`:**
   - `id`, `code` (`string`, `unique`), `discount_type` (`string` — `'percentage'` atau `'fixed'`), `discount_value` (`unsignedBigInteger`), `min_purchase` (`unsignedBigInteger`, default `0`), `is_active` (`boolean`, default `true`), `expires_at` (`timestamp`, `nullable`), `timestamps`
9. **`orders`:**
   - `id`, **`user_id`** (`foreignId` ke `users.id`, **`nullable`**, `nullOnDelete` — wajib `nullable` untuk mendukung _guest checkout_)
   - `order_number` (`string`, `unique` — format acak misal `RR-20261124-8F3K9A`, sekaligus dipakai sebagai `order_id` Midtrans)
   - Data penerima & pengiriman: `name` (`string`), `email` (`string`), `phone` (`string`), `address` (`text`), `city` (`string`), `postal_code` (`string`), `notes` (`text`, `nullable`)
   - Data nominal & promo: `promo_code` (`string`, `nullable`), `subtotal` (`unsignedBigInteger`), `discount_amount` (`unsignedBigInteger`, default `0`), `shipping_cost` (`unsignedBigInteger`, default `0`), `grand_total` (`unsignedBigInteger`)
   - Status pesanan & pembayaran: `status` (`string`, default `'pending'`: `'pending'`, `'processing'`, `'completed'`, `'cancelled'`), `payment_method` (`string`), `payment_status` (`string`, default `'unpaid'`: `'unpaid'`, `'paid'`, `'expired'`, `'failed'`, `'refunded'`)
   - `timestamps`
10. **`order_items`** _(snapshot item saat checkout agar tidak berubah jika produk diedit/dihapus)_:
    - `id`, `order_id` (`foreignId` ke `orders.id`, `cascadeOnDelete`), `product_id` (`foreignId` ke `products.id`, `nullable`, `nullOnDelete`), `product_variant_id` (`foreignId` ke `product_variants.id`, `nullable`, `nullOnDelete`), `product_name` (`string`), `variant_size` (`string`), `unit_price` (`unsignedBigInteger`), `quantity` (`unsignedInteger`), `line_total` (`unsignedBigInteger`), `timestamps`
11. **`order_histories`** _(timeline riwayat status pesanan)_:
    - `id`, `order_id` (`foreignId` ke `orders.id`, `cascadeOnDelete`), `status` (`string`), `payment_status` (`string`, `nullable`), `note` (`text`, `nullable`), `created_by` (`foreignId` ke `users.id`, `nullable`, `nullOnDelete`), `timestamps`
12. **`payments`** _(relasi ke `orders` untuk Midtrans Core API)_:
    - `id`, `order_id` (`foreignId` ke `orders.id`, `cascadeOnDelete`)
    - `midtrans_transaction_id` (`string`, `nullable`, indexed)
    - `payment_method` (`string` — nilai pilihan user: `qris`, `va_bca`, `gopay`, dll)
    - `payment_type` (`string`, `nullable` — nilai dari Midtrans: `qris`, `bank_transfer`, `echannel`, `gopay`, `shopeepay`)
    - `gross_amount` (`unsignedBigInteger`)
    - `transaction_status` (`string`, default `'pending'`)
    - `fraud_status` (`string`, `nullable`)
    - `va_number` (`string`, `nullable` — menyimpan nomor VA BCA/BNI/BRI atau `bill_key` Mandiri)
    - `biller_code` (`string`, `nullable` — khusus Mandiri `echannel`)
    - `qr_url` (`text`, `nullable` — URL gambar QRIS dari Midtrans)
    - `qr_string` (`text`, `nullable` — payload string QRIS)
    - `deeplink_url` (`text`, `nullable` — tombol buka aplikasi GoPay / ShopeePay)
    - `expired_at` (`timestamp`, `nullable`)
    - `paid_at` (`timestamp`, `nullable`)
    - `raw_payload` (`json`, `nullable` — audit & debugging)
    - `timestamps`
13. **`newsletters`** _(wajib)_:
    - `id`, `email` (`string`, `unique`), `timestamps`

#### Kontrak Trait & Nama Method Relasi Eloquent (`backend/app/Models/*`)

- **`User` (`User.php`):** Wajib mempertahankan trait **`HasApiTokens`**; relasi: `orders()` (`hasMany`), `wishlists()` (`hasMany`), `cart()` (`hasOne`).
- **`Category` (`Category.php`):** Relasi `products()` (`hasMany(Product::class)`).
- **`Product` (`Product.php`):** Wajib memakai trait **`SoftDeletes`**; nama method relasi wajib sesuai `ProductController`:
  - `category()` $\rightarrow$ `belongsTo(Category::class)`
  - `images()` $\rightarrow$ `hasMany(ProductImage::class)->orderBy('sort_order')`
  - `primaryImage()` $\rightarrow$ `hasOne(ProductImage::class)->where('is_primary', true)`
  - `variants()` $\rightarrow$ `hasMany(ProductVariant::class)`
- **`ProductVariant` (`ProductVariant.php`):** Relasi `product()` $\rightarrow$ `belongsTo(Product::class)`.
- **`Cart` & `CartItem`:** `Cart::items()` $\rightarrow$ `hasMany(CartItem::class)`, `CartItem::variant()` $\rightarrow$ `belongsTo(ProductVariant::class, 'product_variant_id')`.
- **`Order` (`Order.php`):** Nama method relasi wajib seragam:
  - `user()` $\rightarrow$ `belongsTo(User::class)`
  - `items()` $\rightarrow$ `hasMany(OrderItem::class)`
  - `histories()` $\rightarrow$ `hasMany(OrderHistory::class)`
  - `payment()` $\rightarrow$ `hasOne(Payment::class)`
- **`Payment` (`Payment.php`):** Relasi `order()` $\rightarrow$ `belongsTo(Order::class)`, dengan casts `raw_payload => 'array'`, `expired_at => 'datetime'`, dan `paid_at => 'datetime'`.

### D. Tabel Pemetaan Status Midtrans (Webhook & `checkStatus`)

| `transaction_status` Midtrans | Kondisi Tambahan | `orders.payment_status` | `orders.status` | Aksi Sistem Tambahan |
| :--- | :--- | :--- | :--- | :--- |
| `settlement` | — | `paid` | `processing` | Catat `paid_at`, tambah `order_histories`, **kosongkan cart user**. |
| `capture` | `fraud_status = accept` | `paid` | `processing` | Sama seperti `settlement`. |
| `pending` | — | `unpaid` | `pending` | Pertahankan status menunggu & item cart tetap utuh. |
| `expire` | — | `expired` | `cancelled` | Jalankan **auto-restock** (jika sebelumnya belum `cancelled`), **biarkan cart tetap utuh**. |
| `cancel` / `deny` | — | `failed` | `cancelled` | Jalankan **auto-restock** (jika sebelumnya belum `cancelled`), **biarkan cart tetap utuh**. |
| `refund` / `partial_refund` | — | `refunded` | _(sesuai kebijakan)_ | Catat log refund ke `order_histories`. |

### E. Tips Uji Core API & Webhook di Lokal (untuk `be-api` & `be-qa`)

- **Uji Bayar Virtual Account / QRIS / GoPay di Sandbox:** Ambil `va_number` atau `qr_url` dari response `POST /api/checkout`, lalu buka **`https://simulator.sandbox.midtrans.com`** untuk menyimulasikan pembayaran tanpa uang sungguhan.
- **Cara 1 — Tunnel Publik (Webhook Real):** Jalankan `ngrok http 8000` (atau Cloudflare Tunnel), pasang `https://<domain-tunnel>/api/payments/midtrans/notification` di Midtrans Sandbox Dashboard (**Settings $\rightarrow$ Configuration $\rightarrow$ Payment Notification URL**).
- **Cara 2 — Tanpa Tunnel (Tombol Check Payment Status / Simulasi Postman):** Panggil `GET /api/payments/{order_number}/status` langsung setelah klik bayar di Midtrans Payment Simulator, atau kirim simulasi payload webhook dengan Pre-request Script SHA-512 di Postman ke `http://localhost:8000/api/payments/midtrans/notification`.

---

## 8. Tahapan Pengerjaan (Roadmap)

### Fase 0: Inisialisasi Proyek & Kerangka API

- **REST API & Backend:** Setup container Docker, instalasi **Laravel Sanctum**, **Laravel Socialite**, dan **Midtrans PHP SDK (`midtrans/midtrans-php`)**, pembuatan `config/midtrans.php` (`be-api`), pembuatan trait `ApiResponse`, konfigurasi exception JSON & middleware `role:admin`, penulisan kerangka 38 route di `routes/api.php`, serta penyediaan 1 _Reference Controller_ siap pakai.
- **Database:** Finalisasi rancangan skema tabel (ERD) termasuk `payments`, tambahan kolom profil di `users`, dan atribut detail produk di `products`, lalu mulai menyusun file migrasi inti.
- **QA:** Menyiapkan koleksi Postman dasar, _environment variables_ (`base_url`, `token`, `midtrans_server_key`), dan memverifikasi kontrak response JSON (`200`, `401`, `403`, `404`).

### Fase 1: Skema Database, Autentikasi, Profil & Katalog Publik

- **Database:** Menyelesaikan seluruh migrasi tabel, relasi Eloquent Models, dan `DatabaseSeeder` versi pertama (akun admin, customer dengan alamat/ukuran favorit, kategori, produk dummy lengkap dengan `badge`/atribut detail/varian, & promo).
- **Backend:** Menyelesaikan **Modul 1 (Register + `terms_accepted`, Login, Logout, `GET`/`PATCH /api/me`, Reset Password, & Google OAuth)** serta endpoint `Newsletter`.
- **REST API:** Menyelesaikan **Modul 2 (Home, Categories, Katalog + _Quick Add_ varian, & Detail Produk lengkap)**.
- **QA:** Menguji seluruh endpoint Fase 1 di Postman dan memastikan alur autentikasi, profil, serta katalog berjalan normal.

### Fase 2: Fitur Belanja Customer & Manajemen Produk/Inventori Admin

- **REST API:** Menyelesaikan **Modul 3 (`Cart` & `Apply Promo` untuk user login maupun guest)** dan **Modul 5 (`Admin\ProductController` termasuk atribut detail produk, upload multi-gambar, & update `_method=PUT`)**.
- **Backend:** Menyelesaikan **Modul 3 (`Wishlist` + status ketersediaan)** dan **Modul 7 (`Admin\InventoryController`)**.
- **Database:** Menambahkan skenario data uji khusus ke dalam `DatabaseSeeder` (produk stok habis, produk stok menipis, badge `New`/`Pre-loved`/`Limited`, dan kode promo kedaluwarsa).
- **QA:** Menguji alur keranjang belanja, perhitungan diskon promo (login & guest), wishlist (_Add to Cart_ vs _Sold Out_), upload/hapus gambar produk, manajemen stok inventori, dan validasi hak akses `role:admin`.

### Fase 3: Checkout, Pembayaran Midtrans Core API, Manajemen Order, Analitik & QA Sign-Off

- **REST API:** Menyelesaikan **`POST /api/checkout`** (`DB::transaction` + `lockForUpdate()` + Midtrans `CoreApi::charge`, tanpa menghapus cart dulu), **`GET /api/payments/{order_number}/status`** (`Transaction::status` + sinkronisasi DB), **`POST /api/payments/midtrans/notification`** (verifikasi SHA-512, _idempotency_, hapus cart saat `paid`, & _auto-restock_ saat `expire`/`cancel`), **Modul 6 (`Admin\OrderController` + _auto-restock_ + info pembayaran)**, dan **Modul 4 (`Admin\Dashboard`)**.
- **Backend:** Menyelesaikan **Modul 3 (`OrderController` riwayat pesanan untuk Profil & detail untuk halaman Pembayaran / Order Success)**.
- **QA & Seluruh Tim:** Menjalankan pengujian regresi menyeluruh pada ke-38 endpoint (termasuk simulasi bayar QRIS, VA BCA/BNI/BRI/Mandiri, & E-Wallet di Midtrans Simulator, verifikasi item cart tetap utuh saat `expired` & kosong saat `paid`), memperbaiki seluruh temuan _bug_, dan mengekspor koleksi Postman final ke `docs/postman/` untuk diserahkan kepada tim Frontend.