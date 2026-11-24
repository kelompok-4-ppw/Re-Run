<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Re-Run REST API Routes (38 Endpoints — 7 Modul Kerja)
|--------------------------------------------------------------------------
*/

// Modul 1: Autentikasi, Akun & Profil (Public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

// Modul 2: Katalog Publik & Halaman Utama (Public)
Route::get('/home', [HomeController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Modul 3: Promo, Checkout, Pembayaran Midtrans & Newsletter (Public / Optional Auth)
Route::post('/cart/promo', [CartController::class, 'applyPromo']);
Route::post('/checkout', [CheckoutController::class, 'store']);
Route::get('/payments/{order_number}/status', [PaymentController::class, 'checkStatus']);
Route::post('/payments/midtrans/notification', [PaymentController::class, 'handleNotification']);
Route::get('/orders/{order_number}', [OrderController::class, 'showByNumber']);
Route::post('/newsletter', [NewsletterController::class, 'store']);

// Endpoint Terproteksi Pelanggan / User Login (auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Modul 1: Logout & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);

    // Modul 3: Wishlist, Keranjang & Riwayat Pesanan
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'storeItem']);
    Route::patch('/cart/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroyItem']);

    Route::get('/orders', [OrderController::class, 'index']);
});

// Endpoint Terproteksi Admin (auth:sanctum + role:admin)
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Modul 4: Dashboard Analitik
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Modul 5: Manajemen Data Produk & Galeri
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::delete('/products/images/{imageId}', [AdminProductController::class, 'destroyImage']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::post('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

    // Modul 6: Manajemen Data Pesanan
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // Modul 7: Manajemen Inventori
    Route::get('/inventory', [AdminInventoryController::class, 'index']);
    Route::patch('/inventory/{variantId}', [AdminInventoryController::class, 'updateStock']);
});
