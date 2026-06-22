/**
 * Procurement suite — intake a new batch; verify stock reflects the addition.
 *
 * Real-life scenario: The owner receives 200 bags of Urea from BADC on an
 * allotment. He records the intake and the system creates both an
 * InventoryBatch and a journal entry (DR Inventory / CR AP-BADC).
 */
import { test, expect } from "@playwright/test";

const TIMESTAMP = Date.now();
const BATCH_NOTE = `E2E-Batch-${TIMESTAMP}`;

test.describe("Procurement intake", () => {

  test("procurement page loads", async ({ page }) => {
    await page.goto("http://localhost:3000/procurement");
    await expect(page.getByRole("heading", { name: /procurement/i })).toBeVisible({ timeout: 8_000 });
  });

  test("add inventory batch for Urea and see it reflected", async ({ page }) => {
    await page.goto("http://localhost:3000/procurement");

    // Open add-batch form / button
    const addBtn = page.getByRole("button", { name: /add batch|receive stock|intake/i });
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
    await addBtn.click();

    // Fill the form — product selector, bags count, cost per bag, note
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Select product (Urea)
    const productSelect = dialog.locator("select, [role='combobox']").first();
    await productSelect.selectOption({ label: "Urea" });

    // Bags
    const bagsInput = dialog.getByLabel(/bags/i);
    await bagsInput.fill("200");

    // Cost per bag — 1800 BDT
    const costInput = dialog.getByLabel(/cost|price/i).first();
    await costInput.fill("1800");

    // Note field (used for batch identification in tests)
    const noteInput = dialog.getByLabel(/note|remarks|supplier|allotment/i);
    if (await noteInput.count() > 0) {
      await noteInput.fill(BATCH_NOTE);
    }

    await dialog.getByRole("button", { name: /save|add|confirm/i }).click();

    // Dialog closes; page revalidates
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // The batch should appear somewhere on the page (table row)
    await expect(page.getByText("200")).toBeVisible({ timeout: 8_000 });
  });
});
