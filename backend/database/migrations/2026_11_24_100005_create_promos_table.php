<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();                       // contoh: WELCOME10
            $table->enum('discount_type', ['percent', 'fixed']);       // percent = persen, fixed = potongan Rupiah
            $table->decimal('discount_value', 12, 2);
            $table->decimal('min_purchase', 12, 2)->default(0);        // minimal belanja
            $table->timestamp('expires_at')->nullable();               // kosong = tidak pernah kedaluwarsa
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
