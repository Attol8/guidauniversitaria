/**
 * University logo utilities for dynamic logo resolution
 */

import { useEffect, useState } from 'react';

export type UniversityAliases = Record<string, string>;

let cachedAliases: UniversityAliases | null = null;
let aliasesPromise: Promise<UniversityAliases> | null = null;

/**
 * Load university aliases from public JSON file
 */
export async function loadUniversityAliases(): Promise<UniversityAliases> {
  if (cachedAliases) {
    return cachedAliases;
  }

  if (aliasesPromise) {
    return aliasesPromise;
  }

  aliasesPromise = fetch('/images/uni_images/uni_logos/aliases.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load aliases: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      cachedAliases = data;
      return data;
    })
    .catch(error => {
      console.warn('Failed to load university aliases:', error);
      // Return fallback hardcoded aliases for backward compatibility
      return {
        "libera_universita_di_bolzano": "C3",
        "universita_degli_studi_suor_orsola_benincasa__napoli": "59", 
        "link_campus_university": "A6",
        "universita_telematica_ecampus": "D9",
        "universita_degli_studi_di_perugia": "23"
      };
    });

  return aliasesPromise;
}

/**
 * Hook to load university aliases
 */
export function useUniversityAliases(): {
  aliases: UniversityAliases | null;
  loading: boolean;
  error: Error | null;
} {
  const [aliases, setAliases] = useState<UniversityAliases | null>(cachedAliases);
  const [loading, setLoading] = useState(!cachedAliases);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedAliases) {
      return;
    }

    loadUniversityAliases()
      .then(loadedAliases => {
        setAliases(loadedAliases);
        setError(null);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { aliases, loading, error };
}

/**
 * Create slugified ID from university name
 */
export function slugify(input?: string): string {
  if (!input) return "";
  return input.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Build logo candidate URLs in priority order
 */
export function buildLogoCandidates(
  uniId?: string, 
  uniName?: string, 
  aliases?: UniversityAliases
): string[] {
  const base = "/images/uni_images/uni_logos";
  const slug = slugify(uniName);
  const id = (uniId || "").trim();
  
  const candidates: string[] = [];
  
  // PRIORITY 1: Use numeric alias if available
  if (aliases) {
    const numeric = aliases[id] || aliases[slug];
    if (numeric) {
      candidates.push(`${base}/${numeric}_logo.png`);
      candidates.push(`${base}/${numeric}_logo.jpg`);
      candidates.push(`${base}/${numeric}.png`);
      candidates.push(`${base}/${numeric}.jpg`);
    }
  }
  
  // PRIORITY 2: Use university ID as provided
  if (id && !candidates.length) {
    candidates.push(`${base}/${id}_logo.png`);
    candidates.push(`${base}/${id}_logo.jpg`);
    candidates.push(`${base}/${id}.png`);
    candidates.push(`${base}/${id}.jpg`);
  }
  
  // PRIORITY 3: Use slugified name if different from ID
  if (slug && slug !== id && !candidates.length) {
    candidates.push(`${base}/${slug}_logo.png`);
    candidates.push(`${base}/${slug}_logo.jpg`);
    candidates.push(`${base}/${slug}.png`);
    candidates.push(`${base}/${slug}.jpg`);
  }
  
  // PRIORITY 4: Fallback to default logo
  candidates.push("/images/logo/logo.svg");
  
  return candidates;
}

/**
 * Get the expected filename for a university logo
 */
export function getExpectedLogoFilename(
  uniId?: string, 
  uniName?: string,
  aliases?: UniversityAliases
): string {
  const slug = slugify(uniName);
  const id = (uniId || "").trim();
  
  if (aliases) {
    const numeric = aliases[id] || aliases[slug];
    if (numeric) {
      return `${numeric}_logo.png`;
    }
  }
  
  return `${id || slug}_logo.png`;
}