<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'size', 'stock', 'low_stock_threshold'];

    protected $casts = [
        'stock'               => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Status stok untuk halaman Inventory:
     * out_of_stock (0), low_stock (<= batas), atau in_stock.
     * Pemakaian: $variant->stock_status
     */
    protected function stockStatus(): Attribute
    {
        return Attribute::get(function () {
            if ($this->stock <= 0) {
                return 'out_of_stock';
            }

            return $this->stock <= $this->low_stock_threshold ? 'low_stock' : 'in_stock';
        });
    }
}
