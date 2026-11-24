<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    // GET /api/home
    public function index(): JsonResponse
    {
        return $this->apiResponse(['service' => 'Re-Run API'], 'API Active');
    }
}
