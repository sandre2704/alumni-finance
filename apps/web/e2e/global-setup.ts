/**
 * Global Setup for Playwright E2E Tests
 * 
 * This script runs ONCE before all tests to create a test user
 * with known credentials via the better-auth API.
 */

const API_BASE_URL = 'http://localhost:3000';

// Test user credentials - used in all login tests
export const TEST_USER = {
    email: 'e2etest@alumni.com',
    password: 'TestPassword123!',
    name: 'E2E Test User',
};

async function globalSetup() {
    console.log('🔧 Global Setup: Creating test user via API...');

    try {
        // Try to register the test user via better-auth sign-up endpoint
        const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
                name: TEST_USER.name,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Test user created successfully');
        } else if (data?.code === 'USER_ALREADY_EXISTS' || data?.message?.includes('already exists')) {
            console.log('ℹ️ Test user already exists, skipping creation');
        } else {
            console.log('⚠️ Sign-up response:', data);
            // Don't fail - user might already exist from previous run
        }
    } catch (error) {
        console.error('❌ Failed to create test user:', error);
        // Don't fail setup - tests might still work if user already exists
    }

    console.log('🔧 Global Setup completed');
}

export default globalSetup;
