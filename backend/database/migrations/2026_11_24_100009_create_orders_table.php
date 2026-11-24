<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // nullable = guest checkout (pembeli tanpa akun) tetap bisa memesan
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('order_number', 30)->unique();   // contoh: RR-20261122-8F3K9A (acak, bukan urut)

            // Data pengiriman diisi di form checkout (disimpan apa adanya saat pesan).
            $table->string('customer_name', 100);
            $table->string('customer_email');
            $table->string('customer_phone', 20);
            $table->text('shipping_address');
            $table->string('city', 100);
            $table->string('postal_code', 10);

            // Rincian harga disimpan sebagai "foto" saat checkout.
            $table->string('promo_code', 50)->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->string('payment_method', 30)->nullable();      // qris, va_bca, gopay, dst.
            $table->string('payment_status', 20)->default('unpaid'); // unpaid | paid | expired
            $table->timestamps();

            $table->index('status');       // tab All/Pending/Processing/... di admin
            $table->index('created_at');   // grafik 7 hari & pengurutan
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
