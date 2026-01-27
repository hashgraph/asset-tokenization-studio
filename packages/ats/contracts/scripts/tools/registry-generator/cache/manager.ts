// SPDX-License-Identifier: Apache-2.0

/**
 * Cache management for standalone registry generator.
 *
 * @module tools/registry-generator/cache/manager
 */

import { ContractMetadata, CacheEntry, RegistryCache } from "../types";
import { hashFile, readFile, writeFile, fileExists } from "../utils/fileUtils";

/**
 * Cache manager for registry generation.
 */
export class CacheManager {
  private cachePath: string;
  private cache: RegistryCache;

  /**
   * Create cache manager.
   *
   * @param cachePath - Path to cache file
   */
  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.cache = this.loadCache();
  }

  /**
   * Check if file should be reprocessed.
   *
   * @param filePath - File path to check
   * @returns true if file has changed and needs reprocessing
   */
  shouldReprocess(filePath: string): boolean {
    const entry = this.cache.entries[filePath];
    if (!entry) {
      return true; // New file
    }

    const currentHash = hashFile(filePath);
    return currentHash !== entry.fileHash;
  }

  /**
   * Get cached metadata for file.
   *
   * @param filePath - File path
   * @returns Cached metadata or undefined
   */
  getCached(filePath: string): ContractMetadata | undefined {
    return this.cache.entries[filePath]?.metadata;
  }

  /**
   * Store metadata in cache.
   *
   * @param filePath - File path
   * @param metadata - Metadata to cache
   */
  set(filePath: string, metadata: ContractMetadata): void {
    const fileHash = hashFile(filePath);
    this.cache.entries[filePath] = {
      filePath,
      fileHash,
      metadata,
      timestamp: Date.now(),
    };
  }

  /**
   * Save cache to disk.
   */
  save(): void {
    this.cache.created = Date.now();
    writeFile(this.cachePath, JSON.stringify(this.cache, null, 2));
  }

  /**
   * Load cache from disk.
   *
   * @returns Loaded cache or empty cache if file doesn't exist
   */
  private loadCache(): RegistryCache {
    if (!fileExists(this.cachePath)) {
      return {
        version: "1.0",
        created: Date.now(),
        entries: {},
      };
    }

    try {
      const content = readFile(this.cachePath);
      return JSON.parse(content);
    } catch {
      // Corrupt cache, start fresh
      return {
        version: "1.0",
        created: Date.now(),
        entries: {},
      };
    }
  }

  /**
   * Clear all cache entries.
   */
  clear(): void {
    this.cache = {
      version: "1.0",
      created: Date.now(),
      entries: {},
    };
  }

  /**
   * Get cache statistics.
   *
   * @returns Cache stats
   */
  getStats(): { totalEntries: number; oldestEntry: number; newestEntry: number } {
    const entries = Object.values(this.cache.entries);
    if (entries.length === 0) {
      return { totalEntries: 0, oldestEntry: 0, newestEntry: 0 };
    }

    const timestamps = entries.map((e) => e.timestamp);
    return {
      totalEntries: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }

  /**
   * Prune stale cache entries (files that no longer exist).
   *
   * @returns Number of entries pruned
   */
  prune(): number {
    let pruned = 0;
    const entries = Object.keys(this.cache.entries);

    for (const filePath of entries) {
      if (!fileExists(filePath)) {
        delete this.cache.entries[filePath];
        pruned++;
      }
    }

    return pruned;
  }
}
