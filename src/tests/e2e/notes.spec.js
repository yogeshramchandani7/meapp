import { test, expect } from '@playwright/test';

test.describe('Notes Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('User Journey: Complete Note Lifecycle', () => {
    test('should allow user to create folder, add notes, edit, and delete', async ({ page }) => {
      // Step 1: Verify app loads
      await expect(page.getByPlaceholder('Search')).toBeVisible();

      // Step 2: Create a folder
      await page.getByRole('button', { name: /new folder/i }).click();
      await page.getByPlaceholder('Folder name').fill('Work Tasks');
      await page.getByText('Add').click();

      // Verify folder appears in dropdown
      await expect(page.locator('select option:has-text("📁 Work Tasks")')).toBeVisible();

      // Step 3: Select the folder
      await page.locator('select').selectOption({ label: /📁 Work Tasks/ });

      // Step 4: Create a note
      await page.getByRole('button', { name: /new note/i }).click();

      // Step 5: Add content
      await page.getByPlaceholder('Note title...').fill('Meeting Notes');
      await page.getByPlaceholder('Start typing your note...').fill('Discuss Q4 goals and deliverables');

      // Wait for auto-save
      await page.waitForTimeout(600);

      // Step 6: Verify note appears in sidebar
      await expect(page.getByText('Meeting Notes')).toBeVisible();

      // Step 7: Pin the note
      await page.getByRole('button', { name: /📌 Pin/ }).click();
      await expect(page.getByRole('button', { name: /📌 Pinned/ })).toBeVisible();

      // Step 8: Create another note
      await page.getByRole('button', { name: /new note/i }).click();
      await page.getByPlaceholder('Note title...').fill('Quick Ideas');
      await page.getByPlaceholder('Start typing your note...').fill('Innovation brainstorm');

      await page.waitForTimeout(600);

      // Step 9: Verify both notes exist
      await expect(page.getByText('Meeting Notes')).toBeVisible();
      await expect(page.getByText('Quick Ideas')).toBeVisible();

      // Step 10: Delete a note
      await page.getByText('Quick Ideas').click();
      await page.waitForTimeout(200);

      // Accept confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /Delete Note/i }).click();

      // Verify note is deleted
      await expect(page.getByText('Quick Ideas')).not.toBeVisible();
      await expect(page.getByText('Meeting Notes')).toBeVisible();
    });

    test('should persist data across page reloads', async ({ page }) => {
      // Create data
      await page.getByRole('button', { name: /new folder/i }).click();
      await page.getByPlaceholder('Folder name').fill('Persistent Folder');
      await page.getByText('Add').click();

      await page.locator('select').selectOption({ label: /📁 Persistent Folder/ });
      await page.getByRole('button', { name: /new note/i }).click();
      await page.getByPlaceholder('Note title...').fill('Persistent Note');

      await page.waitForTimeout(600);

      // Reload page
      await page.reload();

      // Verify data persists
      await expect(page.locator('select option:has-text("📁 Persistent Folder")')).toBeVisible();
      await expect(page.getByText('Persistent Note')).toBeVisible();
    });
  });

  test.describe('Mode Switching', () => {
    test('should switch between Notes and Tasks modes', async ({ page }) => {
      // Start in Notes mode
      await expect(page.getByPlaceholder('Search')).toBeVisible();
      await expect(page.getByRole('button', { name: /new folder/i })).toBeVisible();

      // Switch to Tasks mode
      await page.getByRole('button', { name: 'Tasks' }).click();

      // Verify Tasks mode UI
      await expect(page.getByText('Boards')).toBeVisible();
      await expect(page.getByText('+ New Board')).toBeVisible();

      // Switch back to Notes mode
      await page.getByRole('button', { name: 'Notes' }).click();

      // Verify Notes mode UI
      await expect(page.getByPlaceholder('Search')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Setup test data
      await page.evaluate(() => {
        const folder = { id: 'f1', name: 'Test', noteCount: 3, createdAt: new Date().toISOString() };
        const notes = [
          { id: 'n1', folderId: 'f1', title: 'Apple Note', content: 'About apples', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPinned: false },
          { id: 'n2', folderId: 'f1', title: 'Banana Note', content: 'About bananas', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPinned: false },
          { id: 'n3', folderId: 'f1', title: 'Cherry Note', content: 'About cherries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPinned: false },
        ];
        localStorage.setItem('folders', JSON.stringify([folder]));
        localStorage.setItem('notes', JSON.stringify(notes));
      });
      await page.reload();
    });

    test('should filter notes by search query', async ({ page }) => {
      await page.getByPlaceholder('Search').fill('apple');

      await expect(page.getByText('Apple Note')).toBeVisible();
      await expect(page.getByText('Banana Note')).not.toBeVisible();
      await expect(page.getByText('Cherry Note')).not.toBeVisible();
    });

    test('should search case-insensitively', async ({ page }) => {
      await page.getByPlaceholder('Search').fill('BANANA');

      await expect(page.getByText('Banana Note')).toBeVisible();
      await expect(page.getByText('Apple Note')).not.toBeVisible();
    });

    test('should clear search results when query is cleared', async ({ page }) => {
      await page.getByPlaceholder('Search').fill('apple');
      await expect(page.getByText('Apple Note')).toBeVisible();

      await page.getByPlaceholder('Search').clear();

      await expect(page.getByText('Apple Note')).toBeVisible();
      await expect(page.getByText('Banana Note')).toBeVisible();
      await expect(page.getByText('Cherry Note')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByPlaceholder('Search')).toBeVisible();
      await expect(page.getByRole('button', { name: /new folder/i })).toBeVisible();

      // Should still be able to create notes
      await page.getByRole('button', { name: /new folder/i }).click();
      await page.getByPlaceholder('Folder name').fill('Mobile Folder');
      await page.getByText('Add').click();

      await expect(page.locator('select option:has-text("📁 Mobile Folder")')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByPlaceholder('Search')).toBeVisible();
      await expect(page.getByRole('button', { name: /new folder/i })).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should handle large number of notes', async ({ page }) => {
      // Create 50 notes
      await page.evaluate(() => {
        const folder = { id: 'f1', name: 'Big Folder', noteCount: 50, createdAt: new Date().toISOString() };
        const notes = [];
        for (let i = 0; i < 50; i++) {
          notes.push({
            id: `n${i}`,
            folderId: 'f1',
            title: `Note ${i}`,
            content: `Content for note ${i}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false
          });
        }
        localStorage.setItem('folders', JSON.stringify([folder]));
        localStorage.setItem('notes', JSON.stringify(notes));
      });

      await page.reload();

      // Verify UI loads within reasonable time
      await expect(page.getByText('Note 0')).toBeVisible({ timeout: 2000 });
      await expect(page.getByText('Note 49')).toBeVisible({ timeout: 2000 });

      // Search should still be fast
      const startTime = Date.now();
      await page.getByPlaceholder('Search').fill('Note 25');
      await expect(page.getByText('Note 25')).toBeVisible();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // Search should be fast
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle empty states gracefully', async ({ page }) => {
      // No folders or notes
      await expect(page.getByText('No notes yet')).toBeVisible();
      await expect(page.getByText('Click "New Note" to create one')).toBeVisible();
    });

    test('should handle special characters in note content', async ({ page }) => {
      await page.getByRole('button', { name: /new folder/i }).click();
      await page.getByPlaceholder('Folder name').fill('Test');
      await page.getByText('Add').click();

      await page.locator('select').selectOption({ label: /📁 Test/ });
      await page.getByRole('button', { name: /new note/i }).click();

      const specialChars = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';
      await page.getByPlaceholder('Note title...').fill(specialChars);

      await page.waitForTimeout(600);

      // Verify special characters are properly escaped
      await expect(page.getByPlaceholder('Note title...')).toHaveValue(specialChars);
    });
  });
});
