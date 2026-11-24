<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            // Tetap nullable: bila varian dihapus, riwayat pesanan tidak ikut hilang.
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();

            // "Snapshot": nama, ukuran, dan harga dicatat saat pesan,
            // jadi pesanan lama tidak berubah walau produknya diedit kemudian.
            $table->string('product_name', 150);
            $table->string('size', 20);
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
