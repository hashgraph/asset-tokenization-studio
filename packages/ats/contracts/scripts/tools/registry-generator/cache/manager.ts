// SPDX-License-Identifier: Apache-2.0

/**
 * Cache manager for registry generation results.
 *
 * Provides file-based caching of contract metadata to speed up registry generation
 * when most contracts haven't changed.
 *
 * @module registry-generator/cache/manager
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type { ContractMetadata } from "../types";

interface CacheEntry {
  filePath: string;
  timestamp: number;
  hash: string;
  metadata: ContractMetadata;
}

interface CacheData {
  version: string;
  entries: Record<string, CacheEntry>;
  createdAt: number;
  updatedAt: number;
}

export class CacheManager {
  private cacheDir: string;
  private cacheFile: string;
  private data: CacheData;
  private fileHashes: Map<string, string> = new Map();

  constructor(cacheDir: string) {
    this.cacheDir = path.join(cacheDir, ".registry-cache");
    this.cacheFile = path.join(this.cacheDir, "metadata.json");
    this.data = this.loadCache();
  }

  /**
   * Load cache from disk or return empty cache.
   */
  private loadCache(): CacheData {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const content = fs.readFileSync(this.cacheFile, "utf-8");
        return JSON.parse(content);
      }
    } catch {
      // Cache is corrupted or unreadable, start fresh
    }

    return {
      version: "1.0",
      entries: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Get file hash for change detection.
   */
  private getFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return crypto.createHash("sha256").update(content).digest("hex");
    } catch {
      return "";
    }
  }

  /**
   * Check if file should be reprocessed.
   */
  shouldReprocess(filePath: string): boolean {
    const normalized = path.normalize(filePath);
    const cached = this.data.entries[normalized];

    if (!cached) {
      return true; // Not in cache, always reprocess
    }

    // Check if file has changed
    const currentHash = this.getFileHash(filePath);
    this.fileHashes.set(normalized, currentHash);

    return currentHash !== cached.hash;
  }

  /**
   * Get cached metadata if available.
   */
  getCached(filePath: string): ContractMetadata | null {
    const normalized = path.normalize(filePath);
    const cached = this.data.entries[normalized];
    return cached?.metadata || null;
  }

  /**
   * Store metadata in cache.
   */
  set(filePath: string, metadata: ContractMetadata): void {
    const normalized = path.normalize(filePath);
    const hash =
      this.fileHashes.get(normalized) || this.getFileHash(filePath);

    this.data.entries[normalized] = {
      filePath: normalized,
      timestamp: Date.now(),
      hash,
      metadata,
    };

    this.data.updatedAt = Date.now();
  }

  /**
   * Get cache statistics.
   */
  getStats(): { entries: number; size: number } {
    const entries = Object.keys(this.data.entries).length;
    const size = JSON.stringify(this.data).length;
    return { entries, size };
  }

  /**
   * Prune stale cache entries (older than 7 days).
   */
  prune(): number {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    let pruned = 0;

    for (const key of Object.keys(this.data.entries)) {
      if (this.data.entries[key].timestamp < cutoff) {
        delete this.data.entries[key];
        pruned++;
      }
    }

    if (pruned > 0) {
      this.data.updatedAt = Date.now();
    }

    return pruned;
  }

  /**
   * Save cache to disk.
   */
  save(): void {
    try {
      // Ensure cache directory exists
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      fs.writeFileSync(this.cacheFile, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      // Silently fail - cache is not critical to functionality
      console.warn(`[WARN] Failed to save cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clear all cache entries.
   */
  clear(): void {
    this.data.entries = {};
    this.data.updatedAt = Date.now();
  }
}
