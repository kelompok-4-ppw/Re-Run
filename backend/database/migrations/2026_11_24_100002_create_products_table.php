<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            // Kategori tidak boleh dihapus selama masih ada produk di dalamnya.
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('name', 150);
            $table->string('slug', 170)->unique();          // /api/products/{slug}
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);                // harga dalam Rupiah
            $table->string('item_condition', 20)->default('new'); // new | preloved (badge di kartu produk)
            $table->boolean('is_limited')->default(false);        // badge "Limited"
            $table->boolean('is_featured')->default(false);       // tampil di "Produk Unggulan" (/api/home)
            $table->timestamps();
            $table->softDeletes();                           // hapus produk = diberi tanda, datanya tetap ada

            // Index = "daftar isi" agar pencarian/pengurutan cepat.
            $table->index('name');
            $table->index('price');
            $table->index('is_featured');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
