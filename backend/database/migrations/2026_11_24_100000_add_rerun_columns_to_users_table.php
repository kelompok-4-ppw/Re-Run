<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Menambah kolom khusus Re-Run ke tabel `users` bawaan Laravel.
 * Pengecekan hasColumn() membuat file ini aman dijalankan
 * walaupun rekan setim sudah menambah salah satu kolomnya.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            if (! Schema::hasColumn('users', 'role')) {
                // customer = pembeli, admin = penjual/pengelola toko
                $table->enum('role', ['customer', 'admin'])->default('customer')->after('password');
            }
            if (! Schema::hasColumn('users', 'google_id')) {
                // diisi saat user login lewat Google (Socialite)
                $table->string('google_id')->nullable()->unique()->after('role');
            }
        });

        // Akun yang dibuat lewat Google tidak punya password, jadi kolomnya boleh kosong.
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropColumn(['phone', 'role', 'google_id']);
        });
    }
};
