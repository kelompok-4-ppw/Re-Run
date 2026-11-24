<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number',
        'customer_name', 'customer_email', 'customer_phone',
        'shipping_address', 'city', 'postal_code',
        'promo_code', 'subtotal', 'discount_amount', 'total',
        'status', 'payment_method', 'payment_status',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total'           => 'decimal:2',
    ];

    /** Bisa null: pesanan dari guest checkout tidak punya user. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Timeline perubahan status, yang terbaru di atas. */
    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class)->latest();
    }
}
