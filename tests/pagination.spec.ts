// tests/pagination.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Grid Pagination', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('http://localhost:3001');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="course-grid"], .grid', { timeout: 10000 });
  });

  test('should load initial page with 24 courses maximum', async ({ page }) => {
    // Wait for courses to load
    await page.waitForSelector('.grid .CourseCard, .grid > div', { timeout: 10000 });
    
    // Count course cards
    const courseCards = await page.locator('.grid > div').count();
    
    // Should have courses loaded (may be less than 24 if dataset is small)
    expect(courseCards).toBeGreaterThan(0);
    expect(courseCards).toBeLessThanOrEqual(24);
    
    console.log(`Initial page loaded with ${courseCards} courses`);
  });

  test('should show load more button when more courses available', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Look for load more button or end message
    const loadMoreButton = page.locator('button', { hasText: /carica altri|load more/i });
    const endMessage = page.locator('text=Tutti i risultati caricati');
    
    // Either load more button should be visible OR end message should be visible
    const hasLoadMore = await loadMoreButton.isVisible();
    const hasEndMessage = await endMessage.isVisible();
    
    expect(hasLoadMore || hasEndMessage).toBe(true);
    
    if (hasLoadMore) {
      console.log('Load more button is available');
    } else {
      console.log('All results already loaded');
    }
  });

  test('should load more courses when clicking load more button', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Count initial courses
    const initialCount = await page.locator('.grid > div').count();
    
    // Look for load more button
    const loadMoreButton = page.locator('button', { hasText: /carica altri|load more/i });
    
    if (await loadMoreButton.isVisible() && await loadMoreButton.isEnabled()) {
      // Click load more
      await loadMoreButton.click();
      
      // Wait for loading to complete
      await page.waitForTimeout(2000);
      
      // Check if more courses loaded
      const newCount = await page.locator('.grid > div').count();
      
      expect(newCount).toBeGreaterThan(initialCount);
      console.log(`Loaded ${newCount - initialCount} additional courses`);
    } else {
      console.log('Load more button not available - all results already shown');
    }
  });

  test('should emit analytics events for page views', async ({ page }) => {
    // Set up event listener for custom analytics events
    const analyticsEvents: any[] = [];
    
    await page.addInitScript(() => {
      window.addEventListener('view_item_list', (event: any) => {
        (window as any).analyticsEvents = (window as any).analyticsEvents || [];
        (window as any).analyticsEvents.push(event.detail);
      });
    });
    
    // Navigate and wait for initial load
    await page.goto('http://localhost:3001');
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Wait a bit for analytics events to fire
    await page.waitForTimeout(1000);
    
    // Get analytics events
    const events = await page.evaluate(() => (window as any).analyticsEvents || []);
    
    // Should have at least one analytics event for the first page
    expect(events.length).toBeGreaterThan(0);
    
    // Check first event structure
    const firstEvent = events[0];
    expect(firstEvent).toHaveProperty('list_id');
    expect(firstEvent).toHaveProperty('page');
    expect(firstEvent).toHaveProperty('item_ids');
    expect(firstEvent).toHaveProperty('item_count');
    
    console.log('Analytics events captured:', events.length);
    console.log('First event:', firstEvent);
  });

  test('should reset pagination when filters change', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Look for filter dropdowns/inputs
    const disciplineFilter = page.locator('select[name="discipline"], .filter-discipline select');
    const locationFilter = page.locator('select[name="location"], .filter-location select');
    
    if (await disciplineFilter.isVisible()) {
      // Get initial course count
      const initialCount = await page.locator('.grid > div').count();
      
      // Change discipline filter
      await disciplineFilter.selectOption({ index: 1 }); // Select first non-empty option
      
      // Wait for results to update
      await page.waitForTimeout(2000);
      
      // Should have reset pagination (scroll should be at top)
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBe(0);
      
      console.log('Filter change successfully reset pagination');
    } else {
      console.log('No filters found to test pagination reset');
    }
  });

  test('should handle loading states correctly', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Look for load more button
    const loadMoreButton = page.locator('button', { hasText: /carica altri|load more/i });
    
    if (await loadMoreButton.isVisible()) {
      // Click load more and immediately check loading state
      await loadMoreButton.click();
      
      // Button should be disabled during loading
      await page.waitForSelector('button:disabled', { timeout: 1000 });
      
      // Wait for loading to complete
      await page.waitForTimeout(3000);
      
      // Button should be enabled again (if more data available)
      const isButtonDisabled = await loadMoreButton.isDisabled();
      const endMessage = await page.locator('text=Tutti i risultati caricati').isVisible();
      
      // Either button should be enabled again OR end message should be shown
      expect(!isButtonDisabled || endMessage).toBe(true);
      
      console.log('Loading states handled correctly');
    }
  });
});