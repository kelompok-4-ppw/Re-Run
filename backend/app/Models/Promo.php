<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $fillable = ['code', 'discount_type', 'discount_value', 'min_purchase', 'expires_at'];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_purchase'   => 'decimal:2',
        'expires_at'     => 'datetime',
    ];

    /** true bila promo punya tanggal kedaluwarsa dan tanggal itu sudah lewat. */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
