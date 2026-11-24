<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach (['T-Shirts', 'Shirts', 'Jackets', 'Pants', 'Dresses', 'Accessories'] as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],            // kunci pencarian
                ['name' => $name, 'is_active' => true]   // nilai yang diisi/diperbarui
            );
        }
    }
}
