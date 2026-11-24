<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // GET /api/payments/{order_number}/status
    public function checkStatus(string $order_number): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }

    // POST /api/payments/midtrans/notification
    public function handleNotification(Request $request): JsonResponse
    {
        return $this->errorResponse('Endpoint belum diimplementasikan.', 501);
    }
}
