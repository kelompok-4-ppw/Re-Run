<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // GET /api/admin/inventory
    public function index(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // PATCH /api/admin/inventory/{variantId}
    public function updateStock(Request $request, string $variantId): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }
}
