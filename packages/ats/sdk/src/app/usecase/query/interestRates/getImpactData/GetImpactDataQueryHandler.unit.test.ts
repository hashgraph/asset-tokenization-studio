// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { container } from "tsyringe";
import { GetImpactDataQueryHandler } from "./GetImpactDataQueryHandler";
import { GetImpactDataQuery, GetImpactDataQueryResponse } from "./GetImpactDataQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { BigNumber } from "ethers";
import GetImpactDataQueryError from "./error/GetImpactDataQueryError";

describe("GetImpactDataQueryHandler", () => {
  let handler: GetImpactDataQueryHandler;
  let mockQueryAdapter: jest.Mocked<RPCQueryAdapter>;
  let mockAccountService: jest.Mocked<AccountService>;

  beforeEach(() => {
    mockQueryAdapter = {
      getImpactData: jest.fn(),
    } as any;

    mockAccountService = {
      getAccountEvmAddress: jest.fn(),
    } as any;

    container.registerInstance(RPCQueryAdapter, mockQueryAdapter);
    container.registerInstance(AccountService, mockAccountService);

    handler = container.resolve(GetImpactDataQueryHandler);
  });

  it("should return impact data successfully", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const evmAddress = new EvmAddress("0x1234567890123456789012345678901234567890");
    const mockResult: [BigNumber, BigNumber, BigNumber, number, BigNumber] = [
      BigNumber.from("2000"),
      BigNumber.from("1000"),
      BigNumber.from("500"),
      2,
      BigNumber.from("10000"),
    ];

    mockAccountService.getAccountEvmAddress.mockResolvedValue(evmAddress);
    mockQueryAdapter.getImpactData.mockResolvedValue(mockResult);

    const query = new GetImpactDataQuery(securityId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result).toBeInstanceOf(GetImpactDataQueryResponse);
    expect(result.maxDeviationCap).toBe("2000");
    expect(result.baseLine).toBe("1000");
    expect(result.maxDeviationFloor).toBe("500");
    expect(result.impactDataDecimals).toBe(2);
    expect(result.adjustmentPrecision).toBe("10000");
    expect(mockAccountService.getAccountEvmAddress).toHaveBeenCalledWith(securityId);
    expect(mockQueryAdapter.getImpactData).toHaveBeenCalledWith(evmAddress);
  });

  it("should throw GetImpactDataQueryError when service fails", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const error = new Error("Service error");

    mockAccountService.getAccountEvmAddress.mockRejectedValue(error);

    const query = new GetImpactDataQuery(securityId);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow(GetImpactDataQueryError);
  });
});
