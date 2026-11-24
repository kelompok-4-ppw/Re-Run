<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('size', 20);                                   // S, M, L, XL, dst.
            $table->unsignedInteger('stock')->default(0);                 // unsigned = tidak bisa minus
            $table->unsignedInteger('low_stock_threshold')->default(5);   // batas "Low Stock" di halaman Inventory
            $table->timestamps();

            // Satu produk tidak boleh punya dua varian dengan ukuran yang sama.
            $table->unique(['product_id', 'size']);
            $table->index('stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
