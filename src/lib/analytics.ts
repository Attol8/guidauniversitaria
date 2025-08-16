// src/lib/analytics.ts

export interface ViewItemListParams {
  list_id: string;
  list_name: string; 
  page: number;
  items: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    index: number;
  }>;
}

/**
 * Tracks a view_item_list event for Google Analytics
 * No-ops on server side and when GA is not available
 */
export function trackViewItemList(params: ViewItemListParams): void {
  if (typeof window === "undefined") return;
  
  try {
    // Check if gtag is available (Google Analytics)
    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item_list", {
        list_id: params.list_id,
        list_name: params.list_name,
        items: params.items.map((item, idx) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category || "course",
          index: item.index || idx,
        })),
      });
    }
    
    // Also emit custom event for testing/debugging
    window.dispatchEvent(
      new CustomEvent("view_item_list", {
        detail: {
          list_id: params.list_id,
          list_name: params.list_name,
          page: params.page,
          item_ids: params.items.map(item => item.item_id),
          item_count: params.items.length,
        },
      })
    );
  } catch (error) {
    // Silent fail - analytics should never break the app
    console.debug("Analytics tracking failed:", error);
  }
}

/**
 * Generates a list name based on active filters
 */
export function buildListName(filters: {
  discipline?: string;
  location?: string; 
  university?: string;
}): string {
  const parts = ["Corsi"];
  
  if (filters.location) parts.push(filters.location);
  if (filters.discipline) parts.push(filters.discipline);
  if (filters.university) parts.push(filters.university);
  
  return parts.join(" | ");
}

// Global gtag type declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}