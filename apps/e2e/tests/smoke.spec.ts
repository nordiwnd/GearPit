import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/GearPit/);
});

test('shows seeded data', async ({ page }) => {
    await page.goto('/');

    // Check for the seeded item "Storm Cruiser Jacket"
    // Adjust the selector based on actual implementation, using text locator is safest for now
    await expect(page.getByText('Storm Cruiser Jacket').first()).toBeVisible();
});
