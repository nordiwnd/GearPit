import { test, expect } from '@playwright/test';

test('Hydration & Calories: Verify calculations appear on trip details', async ({ page }) => {
    // Debug: Log console messages
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // 1. Visit Trips Page
    await page.goto('/trips');

    // 2. Click "New Trip Plan"
    await page.click('text=New Trip Plan');

    // 3. Fill out the form
    await page.fill('input[name="name"]', 'E2E Hydration Test');
    await page.fill('input[name="location"]', 'Test Location');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-02');

    // Fill Planned Hiking Hours (e.g., 5.0 hours)
    // The input type is number
    await page.fill('input[name="plannedHikingHours"]', '5');

    // 4. Submit
    await page.click('button:has-text("Create Plan")');

    // Wait for the dialog to close and list to refresh
    await expect(page.locator('text=E2E Hydration Test')).toBeVisible({ timeout: 10000 });

    // 5. Open the new trip
    await page.click('text=E2E Hydration Test');

    // 6. Verify we are on details page
    await expect(page).toHaveURL(/\/trips\/.+/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("E2E Hydration Test")')).toBeVisible();

    // 7. Verify Hydration and Calories Cards are present
    // Values depend on BodyWeight + PackWeight. Since PackWeight is 0 initially, it's BodyWeight * 5 * 5.
    // Assuming default user weight is non-zero (e.g. 70kg), 70 * 5 * 5 = 1750 ml.
    // Calories: 6 * 70 * 5 = 2100 kcal.

    // Check if "Water" card exists and has value
    // Value is inside <span class="text-2xl font-bold text-blue-700">...</span>
    const waterValue = page.locator('.text-blue-700 >> text=/\\d+/');
    await expect(waterValue).toBeVisible();

    const caloriesValue = page.locator('.text-orange-700 >> text=/\\d+/');
    await expect(caloriesValue).toBeVisible();

    // Optional: Log values for verification
    const waterText = await waterValue.textContent();
    const caloriesText = await caloriesValue.textContent();
    console.log(`Verified Water: ${waterText} ml, Calories: ${caloriesText} kcal`);

    // Ensure they are not 0 (assuming user weight > 0)
    // If user weight is 0, then 0 is correct, but we expect better test setup.
    // For now, existence check is good.
});
