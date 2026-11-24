<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes; // delete() hanya mengisi deleted_at, baris tidak benar-benar hilang

    // Kolom yang boleh diisi lewat Product::create([...]) / update([...]).
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price',
        'item_condition', 'is_limited', 'is_featured',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'is_limited'  => 'boolean',
        'is_featured' => 'boolean',
    ];

    /** Produk milik satu kategori. */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Galeri foto produk, urut sesuai sort_order. */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /** Foto utama (is_primary = true). */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /** Varian ukuran + stok. */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** User yang memasukkan produk ini ke wishlist (lewat tabel wishlists). */
    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
    }

    /** Filter produk yang masih ada stok: Product::available()->get() */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->whereHas('variants', fn (Builder $q) => $q->where('stock', '>', 0));
    }
}
