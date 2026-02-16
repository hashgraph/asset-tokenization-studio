// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { container } from "tsyringe";
import { GetInterestRateQueryHandler } from "./GetInterestRateQueryHandler";
import { GetInterestRateQuery, GetInterestRateQueryResponse } from "./GetInterestRateQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import GetInterestRateQueryError from "./error/GetInterestRateQueryError";

describe("GetInterestRateQueryHandler", () => {
  let handler: GetInterestRateQueryHandler;
  let mockQueryAdapter: jest.Mocked<RPCQueryAdapter>;
  let mockAccountService: jest.Mocked<AccountService>;

  beforeEach(() => {
    mockQueryAdapter = {
      getInterestRate: jest.fn(),
    } as any;

    mockAccountService = {
      getAccountEvmAddress: jest.fn(),
    } as any;

    container.registerInstance(RPCQueryAdapter, mockQueryAdapter);
    container.registerInstance(AccountService, mockAccountService);

    handler = container.resolve(GetInterestRateQueryHandler);
  });

  it("should return interest rate data successfully", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const evmAddress = new EvmAddress("0x1234567890123456789012345678901234567890");
    const mockResult: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] = [
      1000n,
      500n,
      100n,
      1640995200n,
      400n,
      50n,
      30n,
      2n,
    ];

    mockAccountService.getAccountEvmAddress.mockResolvedValue(evmAddress);
    mockQueryAdapter.getInterestRate.mockResolvedValue(mockResult);

    const query = new GetInterestRateQuery(securityId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result).toBeInstanceOf(GetInterestRateQueryResponse);
    expect(result.maxRate).toBe("1000");
    expect(result.baseRate).toBe("500");
    expect(result.minRate).toBe("100");
    expect(result.startPeriod).toBe("1640995200");
    expect(result.startRate).toBe("400");
    expect(result.missedPenalty).toBe("50");
    expect(result.reportPeriod).toBe("30");
    expect(result.rateDecimals).toBe(2);
    expect(mockAccountService.getAccountEvmAddress).toHaveBeenCalledWith(securityId);
    expect(mockQueryAdapter.getInterestRate).toHaveBeenCalledWith(evmAddress);
  });

  it("should throw GetInterestRateQueryError when service fails", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const error = new Error("Service error");

    mockAccountService.getAccountEvmAddress.mockRejectedValue(error);

    const query = new GetInterestRateQuery(securityId);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow(GetInterestRateQueryError);
  });
});
