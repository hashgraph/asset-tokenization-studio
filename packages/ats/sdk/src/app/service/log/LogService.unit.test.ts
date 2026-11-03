// SPDX-License-Identifier: Apache-2.0

import LogService, { LogLevel } from "./LogService";
import BaseError, { ErrorCode } from "@core/error/BaseError";
import * as winston from "winston";

jest.mock("winston", () => {
  const originalWinston = jest.requireActual("winston");
  return {
    ...originalWinston,
    createLogger: jest.fn(() => ({
      log: jest.fn(),
    })),
  };
});

describe("LogService", () => {
  const mockLogger = {
    log: jest.fn(),
  };

  beforeEach(() => {
    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);
    // Re-initialize LogService singleton to inject the mock logger
    new LogService();
    jest.clearAllMocks();
  });

  it("should log TRACE level messages", () => {
    LogService.logTrace("Trace message", { key: "value" });

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.TRACE, "Trace message", {
      timestamp: expect.any(String),
      other: [{ key: "value" }],
    });
  });

  it("should log INFO level messages", () => {
    LogService.logInfo("Info message", 123);

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.INFO, "Info message", {
      timestamp: expect.any(String),
      other: [123],
    });
  });

  it("should log ERROR level messages", () => {
    LogService.logError("Some error message");

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.ERROR, "Some error message", {
      timestamp: expect.any(String),
      other: [],
    });
  });

  it("should log BaseError properly", () => {
    class TestBaseError extends BaseError {
      constructor(code: ErrorCode, message: string) {
        super(code, message);
      }

      toString(): string {
        return `BaseError: ${this.message}`;
      }
    }

    const error = new TestBaseError(ErrorCode.Unexpected, "Something went wrong");

    LogService.logError(error, "context");

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.ERROR, "BaseError: Something went wrong", {
      timestamp: expect.any(String),
      other: ["context"],
    });
  });

  it("should fallback to default log when non-BaseError thrown", () => {
    LogService.logError(new Error("Generic error"), "extra");

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.ERROR, new Error("Generic error"), {
      timestamp: expect.any(String),
      other: ["extra"],
    });
  });
  it("should mask secrets in object parameters when formatting", () => {
    const info = LogService.defaultFormat.transform({
      level: LogLevel.INFO,
      message: "ConnectRequest",
      timestamp: "now",
      other: [{ apiKey: "API_KEY_SECRET", account: { accountId: "0.0.1", privateKey: "PK_SECRET" } }],
    }) as Record<string | symbol, unknown>;

    const output = info[Symbol.for("message")] as string;
    expect(output).toContain("ConnectRequest");
    expect(output).toContain("0.0.1");
    expect(output).not.toContain("API_KEY_SECRET");
    expect(output).not.toContain("PK_SECRET");
  });
  it("should mask secrets in object parameters before they reach the logger", () => {
    LogService.logInfo("ConnectRequest", { wallet: "DFNS", custodialWalletSettings: { apiSecretKey: "SECRET" } });

    expect(mockLogger.log).toHaveBeenCalledWith(LogLevel.INFO, "ConnectRequest", {
      timestamp: expect.any(String),
      other: [{ wallet: "DFNS", custodialWalletSettings: { apiSecretKey: "[REDACTED]" } }],
    });
  });
});
