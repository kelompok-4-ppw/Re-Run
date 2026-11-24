<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Midtrans Core API Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi kredensial dan mode lingkungan Midtrans untuk pembuatan
    | transaksi Core API (CoreApi::charge), pengecekan status pembayaran
    | (Transaction::status), serta verifikasi SHA-512 webhook notification.
    |
    */

    'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => (bool) env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => (bool) env('MIDTRANS_IS_3DS', true),
    'expiry_duration' => (int) env('MIDTRANS_EXPIRY_DURATION', 15),

];
