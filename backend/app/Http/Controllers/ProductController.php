<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Reference Controller (Fase 0) — Acuan standar penulisan bagi seluruh anggota tim:
 * 1. Validasi langsung di awal method via $request->validate([...])
 * 2. Query / logika Eloquent yang lurus & bebas N+1 query (with([...]))
 * 3. Return JSON seragam menggunakan trait ApiResponse (apiResponse, paginatedResponse, errorResponse)
 */
class ProductController extends Controller
{
    // GET /api/products
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'available' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:latest,price_asc,price_desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Product::with(['category', 'primaryImage', 'variants'])
            ->when($validated['search'] ?? null, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->when($validated['category'] ?? null, function ($q, $categorySlug) {
                $q->whereHas('category', fn ($cat) => $cat->where('slug', $categorySlug));
            })
            ->when(! empty($validated['available']), function ($q) {
                $q->whereHas('variants', fn ($var) => $var->where('stock', '>', 0));
            });

        match ($validated['sort'] ?? 'latest') {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            default => $query->latest(),
        };

        $products = $query->paginate($validated['per_page'] ?? 12);

        return $this->paginatedResponse($products, 'Daftar produk berhasil diambil');
    }

    // GET /api/products/{slug}
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'images', 'variants'])
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            return $this->errorResponse('Produk tidak ditemukan', 404);
        }

        $relatedProducts = Product::with(['primaryImage', 'variants'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->latest()
            ->limit(4)
            ->get();

        return $this->apiResponse([
            'product' => $product,
            'related_products' => $relatedProducts,
        ], 'Detail produk berhasil diambil');
    }
}
