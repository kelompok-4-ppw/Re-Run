<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Produk dummy lengkap dengan varian ukuran (+ stok) dan 2 foto placeholder.
 * Path foto hanya contoh; file aslinya belum ada di storage.
 */
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['t-shirts',    'Vintage Band Tee',        85000,  'preloved', true,  false, 'Soft washed cotton tee with a faded band print.',         ['S' => 5, 'M' => 8, 'L' => 6, 'XL' => 3]],
            ['t-shirts',    'Oversized Graphic Tee',   99000,  'new',      true,  false, 'Boxy oversized fit with a bold front graphic.',            ['S' => 6, 'M' => 10, 'L' => 10, 'XL' => 4]],
            ['shirts',      'Flannel Check Shirt',     149000, 'preloved', false, false, 'Warm flannel shirt in a classic check pattern.',           ['S' => 3, 'M' => 6, 'L' => 5, 'XL' => 2]],
            ['shirts',      'Linen Button-Up Shirt',   179000, 'new',      true,  false, 'Breathable linen shirt for hot days.',                     ['S' => 4, 'M' => 7, 'L' => 7, 'XL' => 3]],
            ['jackets',     'Denim Trucker Jacket',    349000, 'preloved', true,  true,  'One-of-a-kind washed denim jacket.',                       ['S' => 2, 'M' => 3, 'L' => 3, 'XL' => 1]],
            ['jackets',     'Classic Bomber Jacket',   399000, 'new',      false, true,  'Limited run bomber with ribbed cuffs and hem.',            ['S' => 3, 'M' => 5, 'L' => 5, 'XL' => 2]],
            ['pants',       'Straight Cut Jeans',      229000, 'preloved', false, false, 'Mid-rise straight cut jeans in dark wash.',                ['S' => 4, 'M' => 6, 'L' => 6, 'XL' => 3]],
            ['pants',       'Utility Cargo Pants',     259000, 'new',      true,  false, 'Relaxed cargo pants with six pockets.',                    ['S' => 5, 'M' => 8, 'L' => 8, 'XL' => 4]],
            ['dresses',     'Floral Midi Dress',       249000, 'new',      false, false, 'Lightweight midi dress with a floral print.',              ['S' => 4, 'M' => 6, 'L' => 5, 'XL' => 2]],
            ['accessories', 'Canvas Tote Bag',         79000,  'new',      false, false, 'Sturdy canvas tote for everyday use.',                     ['All Size' => 20]],
        ];

        foreach ($products as [$categorySlug, $name, $price, $condition, $featured, $limited, $description, $sizes]) {
            $category = Category::where('slug', $categorySlug)->firstOrFail();
            $slug = Str::slug($name);

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id'    => $category->id,
                    'name'           => $name,
                    'description'    => $description,
                    'price'          => $price,
                    'item_condition' => $condition,
                    'is_featured'    => $featured,
                    'is_limited'     => $limited,
                ]
            );

            // Varian: satu baris per ukuran, lengkap dengan stoknya.
            foreach ($sizes as $size => $stock) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'size' => $size],
                    ['stock' => $stock, 'low_stock_threshold' => 5]
                );
            }

            // Foto: foto pertama jadi foto utama.
            foreach ([1, 2] as $order) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'sort_order' => $order - 1],
                    ['path' => "products/{$slug}-{$order}.jpg", 'is_primary' => $order === 1]
                );
            }
        }
    }
}
