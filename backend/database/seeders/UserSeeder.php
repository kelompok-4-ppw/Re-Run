<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun untuk testing (hanya untuk lingkungan lokal, bukan produksi):
 *   admin@rerun.test     / password123  (role: admin)
 *   customer@rerun.test  / password123  (role: customer)
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->makeUser('Admin Re-Run', 'admin@rerun.test', '081200000001', 'admin');
        $this->makeUser('Customer Demo', 'customer@rerun.test', '081200000002', 'customer');
    }

    private function makeUser(string $name, string $email, string $phone, string $role): void
    {
        // firstOrNew = cari berdasarkan email, kalau belum ada buat baru (tidak dobel saat seeder diulang).
        // forceFill = isi semua kolom tanpa terhalang $fillable, jadi role pasti tersimpan.
        User::firstOrNew(['email' => $email])
            ->forceFill([
                'name'     => $name,
                'phone'    => $phone,
                'password' => Hash::make('password123'),
                'role'     => $role,
            ])
            ->save();
    }
}
