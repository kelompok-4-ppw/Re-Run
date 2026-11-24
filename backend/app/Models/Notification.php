<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Notifikasi untuk admin (pesanan baru, stok menipis).
 * Ini BUKAN notifikasi bawaan Laravel; tabelnya kita buat sendiri.
 */
class Notification extends Model
{
    protected $fillable = ['type', 'title', 'message', 'is_read'];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
