<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/admin/products
    public function index(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // POST /api/admin/products
    public function store(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // GET /api/admin/products/{id}
    public function show(string $id): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // POST /api/admin/products/{id} (_method=PUT)
    public function update(Request $request, string $id): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // DELETE /api/admin/products/{id}
    public function destroy(string $id): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // DELETE /api/admin/products/images/{imageId}
    public function destroyImage(string $imageId): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }
}
