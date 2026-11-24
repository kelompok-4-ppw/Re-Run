<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    public function run(): void
    {
        // Diskon 10%, minimal belanja Rp100.000
        Promo::updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'discount_type'  => 'percent',
                'discount_value' => 10,
                'min_purchase'   => 100000,
                'expires_at'     => now()->addMonths(6),
            ]
        );

        // Potongan Rp25.000, minimal belanja Rp200.000
        Promo::updateOrCreate(
            ['code' => 'HEMAT25K'],
            [
                'discount_type'  => 'fixed',
                'discount_value' => 25000,
                'min_purchase'   => 200000,
                'expires_at'     => now()->addMonths(6),
            ]
        );
    }
}
