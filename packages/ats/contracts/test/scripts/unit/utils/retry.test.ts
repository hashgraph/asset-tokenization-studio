// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for retry utility with exponential backoff.
 *
 * @module test/scripts/unit/utils/retry.test
 */

import { expect } from "chai";
import { withRetry, withRetryFn, DEFAULT_RETRYABLE_ERRORS } from "@scripts/infrastructure";

describe("retry utility", () => {
  describe("withRetry", () => {
    it("should return result on first success", async () => {
      let callCount = 0;
      const result = await withRetry(async () => {
        callCount++;
        return "success";
      });

      expect(result).to.equal("success");
      expect(callCount).to.equal(1);
    });

    it("should retry on retryable error and succeed", async () => {
      let callCount = 0;
      const result = await withRetry(
        async () => {
          callCount++;
          if (callCount < 3) {
            throw new Error("ETIMEDOUT: connection timed out");
          }
          return "success after retries";
        },
        { maxRetries: 3, initialDelayMs: 10 },
      );

      expect(result).to.equal("success after retries");
      expect(callCount).to.equal(3);
    });

    it("should throw after max retries exceeded", async () => {
      let callCount = 0;

      try {
        await withRetry(
          async () => {
            callCount++;
            throw new Error("ETIMEDOUT: always fails");
          },
          { maxRetries: 2, initialDelayMs: 10 },
        );
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect((err as Error).message).to.include("ETIMEDOUT");
      }

      // Initial attempt + 2 retries = 3 total calls
      expect(callCount).to.equal(3);
    });

    it("should throw immediately for non-retryable error", async () => {
      let callCount = 0;

      try {
        await withRetry(
          async () => {
            callCount++;
            throw new Error("Invalid argument: something wrong");
          },
          { maxRetries: 3, initialDelayMs: 10 },
        );
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect((err as Error).message).to.include("Invalid argument");
      }

      // Should only try once for non-retryable error
      expect(callCount).to.equal(1);
    });

    it("should use custom retryable errors", async () => {
      let callCount = 0;

      const result = await withRetry(
        async () => {
          callCount++;
          if (callCount < 2) {
            throw new Error("CUSTOM_ERROR: this is custom");
          }
          return "success";
        },
        {
          maxRetries: 3,
          initialDelayMs: 10,
          retryableErrors: ["CUSTOM_ERROR"],
        },
      );

      expect(result).to.equal("success");
      expect(callCount).to.equal(2);
    });

    it("should apply exponential backoff", async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      await withRetry(
        async () => {
          const now = Date.now();
          delays.push(now - lastTime);
          lastTime = now;
          if (delays.length < 4) {
            throw new Error("ETIMEDOUT");
          }
          return "success";
        },
        {
          maxRetries: 5,
          initialDelayMs: 50,
          backoffMultiplier: 2,
        },
      );

      // First call has no delay, subsequent calls should have increasing delays
      // delays[0] is small (no wait), delays[1] ~50ms, delays[2] ~100ms, delays[3] ~200ms
      expect(delays).to.have.lengthOf(4);
      // Second delay should be roughly initial delay
      expect(delays[1]).to.be.greaterThan(40); // Allow some variance
      // Each subsequent delay should be larger
      expect(delays[2]).to.be.greaterThan(delays[1]);
      expect(delays[3]).to.be.greaterThan(delays[2]);
    });

    it("should respect maxDelayMs cap", async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      await withRetry(
        async () => {
          const now = Date.now();
          delays.push(now - lastTime);
          lastTime = now;
          if (delays.length < 5) {
            throw new Error("rate limit");
          }
          return "success";
        },
        {
          maxRetries: 5,
          initialDelayMs: 50,
          backoffMultiplier: 10, // Aggressive multiplier
          maxDelayMs: 100, // But capped at 100ms
        },
      );

      // Delays should not exceed maxDelayMs
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).to.be.lessThan(150); // Some tolerance for timing
      }
    });
  });

  describe("withRetryFn", () => {
    it("should create a wrapped function with retry behavior", async () => {
      let callCount = 0;
      const originalFn = async (value: string): Promise<string> => {
        callCount++;
        if (callCount < 2) {
          throw new Error("nonce too low");
        }
        return `result: ${value}`;
      };

      const wrappedFn = withRetryFn(originalFn, {
        maxRetries: 3,
        initialDelayMs: 10,
      });

      const result = await wrappedFn("test");

      expect(result).to.equal("result: test");
      expect(callCount).to.equal(2);
    });

    it("should preserve function arguments", async () => {
      const originalFn = async (a: number, b: number, c: string): Promise<string> => {
        return `${a}-${b}-${c}`;
      };

      const wrappedFn = withRetryFn(originalFn, { maxRetries: 1, initialDelayMs: 10 });

      const result = await wrappedFn(1, 2, "three");

      expect(result).to.equal("1-2-three");
    });
  });

  describe("DEFAULT_RETRYABLE_ERRORS", () => {
    it("should include common network errors", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("ETIMEDOUT");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("ECONNRESET");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("ECONNREFUSED");
    });

    it("should include rate limit patterns", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("RATE_LIMIT");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("rate limit");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("429");
    });

    it("should include nonce errors", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("nonce too low");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("replacement transaction underpriced");
    });

    it("should include Hedera-specific errors", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("BUSY");
      expect(DEFAULT_RETRYABLE_ERRORS).to.include("PLATFORM_TRANSACTION_NOT_CREATED");
    });
  });
});
