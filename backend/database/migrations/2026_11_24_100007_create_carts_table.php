<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            // unique() = setiap user hanya punya satu keranjang
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            // promo yang sedang dipakai di keranjang (POST /api/cart/promo)
            $table->foreignId('promo_id')->nullable()->constrained('promos')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
