<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // GET /api/orders
    public function index(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // GET /api/orders/{order_number}
    public function showByNumber(string $order_number): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }
}
