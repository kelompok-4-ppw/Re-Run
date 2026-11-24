<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // GET /api/cart
    public function index(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // POST /api/cart/items
    public function storeItem(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // PATCH /api/cart/items/{id}
    public function updateItem(Request $request, string $id): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // DELETE /api/cart/items/{id}
    public function destroyItem(Request $request, string $id): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // POST /api/cart/promo (Public / Optional Auth)
    public function applyPromo(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }
}
