// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for transaction utilities.
 *
 * Tests error extraction and error type detection functions.
 * These are pure functions that don't require contract interactions.
 *
 * @module test/scripts/unit/utils/transaction.test
 */

import { expect } from "chai";
import { extractRevertReason, isNonceTooLowError, isGasError, isNetworkError } from "@scripts/infrastructure";

describe("Transaction Utilities", () => {
  // ============================================================================
  // extractRevertReason Tests
  // ============================================================================

  describe("extractRevertReason", () => {
    it("should extract reason from ethers error with reason property", () => {
      const error = { reason: "Insufficient balance" };
      expect(extractRevertReason(error)).to.equal("Insufficient balance");
    });

    it("should extract message from error.data.message", () => {
      const error = {
        data: {
          message: "Contract reverted",
        },
      };
      expect(extractRevertReason(error)).to.equal("Contract reverted");
    });

    it("should extract message from Error instance", () => {
      const error = new Error("Something went wrong");
      expect(extractRevertReason(error)).to.equal("Something went wrong");
    });

    it("should convert string to string", () => {
      const error = "Plain string error";
      expect(extractRevertReason(error)).to.equal("Plain string error");
    });

    it("should convert number to string", () => {
      const error = 42;
      expect(extractRevertReason(error)).to.equal("42");
    });

    it("should return Unknown error for null", () => {
      expect(extractRevertReason(null)).to.equal("Unknown error");
    });

    it("should return Unknown error for undefined", () => {
      expect(extractRevertReason(undefined)).to.equal("Unknown error");
    });

    it("should prioritize reason over message", () => {
      const error = {
        reason: "Reason message",
        message: "Error message",
      };
      expect(extractRevertReason(error)).to.equal("Reason message");
    });

    it("should prioritize reason over data.message", () => {
      const error = {
        reason: "Reason message",
        data: { message: "Data message" },
      };
      expect(extractRevertReason(error)).to.equal("Reason message");
    });

    it("should prioritize data.message over Error message", () => {
      // Create an object with data.message that is also an Error
      const error = Object.assign(new Error("Error message"), {
        data: { message: "Data message" },
      });
      expect(extractRevertReason(error)).to.equal("Data message");
    });

    it("should handle object without expected properties", () => {
      const error = { foo: "bar" };
      expect(extractRevertReason(error)).to.equal("[object Object]");
    });
  });

  // ============================================================================
  // isNonceTooLowError Tests
  // ============================================================================

  describe("isNonceTooLowError", () => {
    it("should return true for nonce too low error", () => {
      const error = new Error("nonce too low");
      expect(isNonceTooLowError(error)).to.be.true;
    });

    it("should return true for nonce already used error", () => {
      const error = new Error("nonce already used");
      expect(isNonceTooLowError(error)).to.be.true;
    });

    it("should return true for mixed case nonce error", () => {
      const error = new Error("Nonce Too Low");
      expect(isNonceTooLowError(error)).to.be.true;
    });

    it("should return true for nonce error in longer message", () => {
      const error = new Error("Transaction failed: nonce too low for account 0x123");
      expect(isNonceTooLowError(error)).to.be.true;
    });

    it("should return false for unrelated nonce message", () => {
      // Contains 'nonce' but not 'too low' or 'already used'
      const error = new Error("Invalid nonce format");
      expect(isNonceTooLowError(error)).to.be.false;
    });

    it("should return false for gas error", () => {
      const error = new Error("out of gas");
      expect(isNonceTooLowError(error)).to.be.false;
    });

    it("should return false for null error", () => {
      expect(isNonceTooLowError(null)).to.be.false;
    });

    it("should handle error with reason property", () => {
      const error = { reason: "nonce too low" };
      expect(isNonceTooLowError(error)).to.be.true;
    });
  });

  // ============================================================================
  // isGasError Tests
  // ============================================================================

  describe("isGasError", () => {
    it("should return true for out of gas error", () => {
      const error = new Error("out of gas");
      expect(isGasError(error)).to.be.true;
    });

    it("should return true for gas required exceeds error", () => {
      const error = new Error("gas required exceeds allowance");
      expect(isGasError(error)).to.be.true;
    });

    it("should return true for insufficient funds for gas error", () => {
      const error = new Error("insufficient funds for gas * price + value");
      expect(isGasError(error)).to.be.true;
    });

    it("should return true for mixed case gas error", () => {
      const error = new Error("OUT OF GAS");
      expect(isGasError(error)).to.be.true;
    });

    it("should return true for gas error in longer message", () => {
      const error = new Error("Transaction failed: out of gas during execution");
      expect(isGasError(error)).to.be.true;
    });

    it("should return false for unrelated gas message", () => {
      const error = new Error("gas price too high");
      expect(isGasError(error)).to.be.false;
    });

    it("should return false for nonce error", () => {
      const error = new Error("nonce too low");
      expect(isGasError(error)).to.be.false;
    });

    it("should return false for null error", () => {
      expect(isGasError(null)).to.be.false;
    });

    it("should handle error with reason property", () => {
      const error = { reason: "out of gas" };
      expect(isGasError(error)).to.be.true;
    });
  });

  // ============================================================================
  // isNetworkError Tests
  // ============================================================================

  describe("isNetworkError", () => {
    it("should return true for network error", () => {
      const error = new Error("network error");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return true for timeout error", () => {
      const error = new Error("timeout exceeded");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return true for connection error", () => {
      const error = new Error("connection refused");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return true for ECONNREFUSED error", () => {
      const error = new Error("connect ECONNREFUSED 127.0.0.1:8545");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return true for mixed case network error", () => {
      const error = new Error("NETWORK ERROR");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return true for network error in longer message", () => {
      const error = new Error("Failed to connect: network unreachable");
      expect(isNetworkError(error)).to.be.true;
    });

    it("should return false for gas error", () => {
      const error = new Error("out of gas");
      expect(isNetworkError(error)).to.be.false;
    });

    it("should return false for nonce error", () => {
      const error = new Error("nonce too low");
      expect(isNetworkError(error)).to.be.false;
    });

    it("should return false for null error", () => {
      expect(isNetworkError(null)).to.be.false;
    });

    it("should handle error with reason property", () => {
      const error = { reason: "network timeout" };
      expect(isNetworkError(error)).to.be.true;
    });
  });
});
