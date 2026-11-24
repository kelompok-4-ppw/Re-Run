<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Pintu masuk seeder. Dijalankan oleh: php artisan migrate --seed
 * Urutan penting: kategori harus ada sebelum produk.
 * Fase 2 akan menambah skenario data uji (stok habis/menipis, promo kedaluwarsa).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            PromoSeeder::class,
        ]);
    }
}
