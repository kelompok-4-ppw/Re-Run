<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                'data'    => null,
            ], 401);
        }

        if ($request->user()->role !== $role) {
            return response()->json([
                'status'  => false,
                'message' => 'Forbidden. Akses khusus ' . $role . '.',
                'data'    => null,
            ], 403);
        }

        return $next($request);
    }
}