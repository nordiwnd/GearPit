import { test, expect } from '@playwright/test';

test.describe('Extended Smoke Test', () => {
  const timestamp = Date.now();
  const gearName1 = `Test Gear A ${timestamp}`;
  const gearName2 = `Test Gear B ${timestamp}`;
  const loadoutName = `Test Loadout ${timestamp}`;
  const profileName = `Test Hiker ${timestamp}`;
  const tripName = `Test Trip ${timestamp}`;

  test('FULL SMOKE: Inventory -> Settings -> Loadouts -> Trips', async ({ page }) => {
    // タイムアウトを60秒（60000ms）に短縮。
    // 処理が遅い環境の場合は 90000 または 120000 に調整してください。
    test.setTimeout(60000);

    // =========================================================================
    // 1. Inventory: Create Unique Gears
    // =========================================================================
    await test.step('1. Inventory: Create Gear Items', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/GearPit/);

      const gears = [
        { name: gearName1, weight: '150' },
        { name: gearName2, weight: '300' }
      ];

      for (const gear of gears) {
        await page.getByRole('button', { name: 'Add Gear' }).click();
        await page.getByLabel('Item Name').fill(gear.name);
        await page.getByLabel('Brand').fill('TestBrand');
        await page.getByLabel('Weight (g)').fill(gear.weight);
        await page.getByLabel('Category').fill('TestCategory');
        await page.getByRole('button', { name: 'Save Item' }).click();

        await expect(page.getByText(gear.name)).toBeVisible();
      }

      await page.reload();
      await expect(page.getByText(gearName1)).toBeVisible();
      await expect(page.getByText(gearName2)).toBeVisible();
    });

    // =========================================================================
    // 2. Settings: Create Hiker Profile
    // =========================================================================
    await test.step('2. Settings: Create Profile', async () => {
      await page.goto('/settings');

      await page.getByRole('button', { name: 'Add Profile' }).click();
      await page.getByLabel('Name').fill(profileName);
      await page.getByLabel('Height (cm)').fill('175');
      await page.getByLabel('Weight (kg)').fill('70');
      await page.getByLabel('Age').fill('30');

      // Gender (Exact match required for Male/Female distinction)
      await page.getByRole('combobox', { name: 'Gender' }).click();
      const maleOption = page.getByRole('option', { name: 'Male', exact: true });
      await expect(maleOption).toBeVisible();
      await maleOption.click();

      await page.getByRole('button', { name: 'Create Profile' }).click();

      await expect(page.getByText(profileName)).toBeVisible();
      await page.reload();
      await expect(page.getByText(profileName)).toBeVisible();
    });

    // =========================================================================
    // 3. Loadouts: Create Loadout with Gear
    // =========================================================================
    await test.step('3. Loadouts: Create Loadout', async () => {
      await page.goto('/loadouts');

      await page.getByRole('button', { name: 'Create Loadout' }).click();
      await page.getByLabel('Name').fill(loadoutName);
      await page.getByLabel('Activity').fill('Hiking');

      // Select gears
      await page.getByRole('checkbox', { name: gearName1 }).check();
      await page.getByRole('checkbox', { name: gearName2 }).check();

      await page.getByRole('button', { name: 'Create Loadout' }).click();

      await expect(page.getByText(loadoutName)).toBeVisible();
      await page.reload();
      await expect(page.getByText(loadoutName)).toBeVisible();
    });

    // =========================================================================
    // 4. Trips: Create and Verify Logic
    // =========================================================================
    await test.step('4. Trips: Create and Manage', async () => {
      await page.goto('/trips');

      // Create Trip
      await page.getByRole('button', { name: 'New Trip Plan' }).click();
      await page.getByLabel('Trip Name').fill(tripName);

      // Select Profile (Partial match permitted for "Name (Height/Weight)")
      await page.getByRole('combobox', { name: 'Hiker Profile' }).click();
      const profileOption = page.getByRole('option', { name: profileName });
      await expect(profileOption).toBeVisible();
      await profileOption.click();

      await page.getByLabel('Location').fill('Mt. Test');
      await page.getByLabel('Hiking Hours').fill('5');
      await page.getByLabel('Start Date').fill('2026-06-01');
      await page.getByLabel('End Date').fill('2026-06-02');

      await page.getByRole('button', { name: 'Create Plan' }).click();

      // Enter Trip Details
      await page.getByText(tripName).click();
      await expect(page).toHaveURL(/\/trips\/.+/);

      // Add from Loadout
      await page.getByRole('button', { name: 'Add from Loadout' }).click();

      // --- FIX START: ロケーターの厳密化と待機処理 ---
      const dialog = page.getByRole('dialog', { name: 'Select Loadout to Copy' });

      // 1. 行を特定する: テキストを含み、かつ「ボタン(button)」を持っているdiv要素に絞り込む
      // これにより、テキストだけのdivではなく、ボタンを含む親コンテナ(行)を確実に掴みます
      const targetRow = dialog.locator('div')
        .filter({ hasText: loadoutName })
        .filter({ has: page.getByRole('button') })
        .last(); // 構造によっては複数マッチする場合があるので、一番近い要素(last)またはfirstを使用

      // 2. その行の中にあるボタンをクリック
      await targetRow.getByRole('button').click();

      // 3. 【重要】ダイアログが閉じるのを待つ
      // これを入れないと、ダイアログが邪魔で背面のGearが見えず "toBeVisible" が失敗することがあります
      await expect(dialog).toBeHidden();
      // --- FIX END ---

      await expect(page.getByText(gearName1)).toBeVisible();
      await expect(page.getByText(gearName2)).toBeVisible();

      // Verify Weight (150g + 300g = 450g)
      await expect(page.locator('main')).toContainText(/450\s*g|0\.45\s*kg/);

      // Verify Calorie/Water Calculation Updates
      const initialWaterText = await page.getByText(/Water Need/).textContent();
      const initialCalorieText = await page.getByText(/Calorie Need/).textContent();

      await page.getByRole('button', { name: 'Edit Trip' }).click();
      await page.getByLabel('Hiking Hours').fill('10');
      await page.getByRole('button', { name: 'Save Changes' }).click();

      await expect(page.getByText(/Water Need/)).not.toHaveText(initialWaterText!);
      await expect(page.getByText(/Calorie Need/)).not.toHaveText(initialCalorieText!);

      await page.reload();
      await expect(page.getByText('10 hours')).toBeVisible().or(expect(page.getByText('10 hr')).toBeVisible());

      // Carried Water Logic
      await page.getByPlaceholder('0').fill('1000');
      await page.getByPlaceholder('0').press('Enter');

      await expect(page.getByText('1450 g')).toBeVisible(); // 450 + 1000

      await page.reload();
      await expect(page.getByPlaceholder('0')).toHaveValue('1000');

      // Quantity Logic
      // ここも安全のために汎用的なロケーターを使用
      const gear1Container = page.locator('div').filter({ hasText: gearName1 }).last();
      await gear1Container.getByRole('button', { name: 'increase' }).or(gear1Container.getByRole('button').filter({ hasText: '+' })).click();

      await expect(page.getByText('1600 g')).toBeVisible(); // 1450 + 150

      // Complete Trip
      await page.getByRole('button', { name: 'Complete Trip' }).click();
      const okButton = page.getByRole('button', { name: 'OK' }).or(page.getByRole('button', { name: 'Confirm' }));
      if (await okButton.isVisible()) {
        await okButton.click();
      }

      await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Completed' })).toBeDisabled();
    });

    // =========================================================================
    // 5. Cleanup
    // =========================================================================
    await test.step('5. Cleanup Verification (Delete)', async () => {
      await page.goto('/loadouts');

      // Loadoutsリストも div 構造である可能性が高いため修正
      // リスト全体から特定のテキストを持つ要素を探す
      const loadoutContainer = page.locator('div').filter({ hasText: loadoutName }).last();

      await loadoutContainer.getByRole('button').filter({ hasText: /Delete|Trash/i }).click();

      if (await page.getByRole('button', { name: /Delete|Confirm/i }).isVisible()) {
        await page.getByRole('button', { name: /Delete|Confirm/i }).click();
      }
      await expect(page.getByText(loadoutName)).not.toBeVisible();
    });

  });
});