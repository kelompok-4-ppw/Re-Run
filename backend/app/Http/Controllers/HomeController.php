<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function Index()
    {
        return $this->apiResponse(['service' => 'Re-Run API'], 'API Active');
    }
}
