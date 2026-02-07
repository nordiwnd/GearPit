import { test, expect } from '@playwright/test';

test('Weight Analytics: Verify Base Weight excludes consumables', async ({ page }) => {
    // Debug: Log console messages
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // 1. Visit Loadouts Page
    await page.goto('/loadouts');

    // Verify list is loaded
    const loadoutLink = page.getByText('Overnight Winter (Heavy)');
    await expect(loadoutLink).toBeVisible({ timeout: 10000 });

    // 2. Click on "Overnight Winter (Heavy)"
    await loadoutLink.click();

    // 3. Verify we are on details page
    await expect(page).toHaveURL(/\/loadouts\/.+/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Overnight Winter (Heavy)' })).toBeVisible();

    // 4. Check Analytics Cards
    // Base Weight: 1.88
    await expect(page.getByText('1.88').first()).toBeVisible();

    // Consumable Weight: 3.25
    await expect(page.getByText('3.25').first()).toBeVisible();

    // Total Weight: 6.26
    await expect(page.getByText('6.26').first()).toBeVisible();
});
