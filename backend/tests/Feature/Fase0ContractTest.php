<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Fase0ContractTest extends TestCase
{
    public function test_registers_all_38_api_routes(): void
    {
        $apiRoutes = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route) => str_starts_with($route->uri(), 'api/'));

        $this->assertCount(38, $apiRoutes);
    }

    public function test_home_endpoint_returns_standard_200_json_contract(): void
    {
        $response = $this->get('/api/home');

        $response->assertOk()
            ->assertJson([
                'status' => true,
                'message' => 'API Active',
                'data' => [
                    'service' => 'Re-Run API',
                ],
            ]);
    }

    public function test_unknown_api_endpoint_returns_404_json_without_accept_header(): void
    {
        $response = $this->get('/api/endpoint-tidak-terdaftar');

        $response->assertNotFound()
            ->assertExactJson([
                'status' => false,
                'message' => 'Data atau endpoint tidak ditemukan.',
                'data' => null,
            ]);
    }

    public function test_protected_endpoint_returns_401_json_for_guest_without_redirect(): void
    {
        $response = $this->get('/api/wishlist');

        $response->assertUnauthorized()
            ->assertExactJson([
                'status' => false,
                'message' => 'Unauthenticated. Token tidak valid atau tidak ditemukan.',
                'data' => null,
            ]);
    }

    public function test_admin_endpoint_returns_403_json_for_non_admin_user(): void
    {
        $customer = User::factory()->make();
        $customer->setAttribute('role', 'customer');

        Sanctum::actingAs($customer);

        $response = $this->get('/api/admin/dashboard');

        $response->assertForbidden()
            ->assertExactJson([
                'status' => false,
                'message' => 'Forbidden. Akses khusus admin.',
                'data' => null,
            ]);
    }

    public function test_admin_endpoint_allows_admin_user_past_role_middleware(): void
    {
        $admin = User::factory()->make();
        $admin->setAttribute('role', 'admin');

        Sanctum::actingAs($admin);

        $response = $this->get('/api/admin/dashboard');

        $this->assertNotEquals(401, $response->status());
        $this->assertNotEquals(403, $response->status());
    }
}
