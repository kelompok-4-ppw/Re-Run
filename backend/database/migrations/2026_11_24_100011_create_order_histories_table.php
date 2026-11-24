<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('status', 20);                 // status baru yang dicatat
            $table->text('note')->nullable();
            // siapa (admin) yang mengubah; kosong bila dicatat otomatis oleh sistem
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();                         // created_at = waktu perubahan (timeline pesanan)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_histories');
    }
};
