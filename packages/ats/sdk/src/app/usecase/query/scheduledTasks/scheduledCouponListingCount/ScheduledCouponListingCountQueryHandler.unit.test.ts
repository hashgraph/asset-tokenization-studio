// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { container } from "tsyringe";
import { ScheduledCouponListingCountQueryHandler } from "./ScheduledCouponListingCountQueryHandler";
import {
  ScheduledCouponListingCountQuery,
  ScheduledCouponListingCountQueryResponse,
} from "./ScheduledCouponListingCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ScheduledCouponListingCountQueryError from "./error/ScheduledCouponListingCountQueryError";

describe("ScheduledCouponListingCountQueryHandler", () => {
  let handler: ScheduledCouponListingCountQueryHandler;
  let mockQueryAdapter: jest.Mocked<RPCQueryAdapter>;
  let mockAccountService: jest.Mocked<AccountService>;

  beforeEach(() => {
    mockQueryAdapter = {
      getScheduledCouponListingCount: jest.fn(),
    } as any;

    mockAccountService = {
      getAccountEvmAddress: jest.fn(),
    } as any;

    container.registerInstance(RPCQueryAdapter, mockQueryAdapter);
    container.registerInstance(AccountService, mockAccountService);

    handler = container.resolve(ScheduledCouponListingCountQueryHandler);
  });

  it("should return scheduled coupon listing count successfully", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const evmAddress = new EvmAddress("0x1234567890123456789012345678901234567890");
    const mockResult = 5;

    mockAccountService.getAccountEvmAddress.mockResolvedValue(evmAddress);
    mockQueryAdapter.getScheduledCouponListingCount.mockResolvedValue(mockResult);

    const query = new ScheduledCouponListingCountQuery(securityId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result).toBeInstanceOf(ScheduledCouponListingCountQueryResponse);
    expect(result.count).toBe(5);
    expect(mockAccountService.getAccountEvmAddress).toHaveBeenCalledWith(securityId);
    expect(mockQueryAdapter.getScheduledCouponListingCount).toHaveBeenCalledWith(evmAddress);
  });

  it("should throw ScheduledCouponListingCountQueryError when service fails", async () => {
    // Arrange
    const securityId = "0.0.123456";
    const error = new Error("Service error");

    mockAccountService.getAccountEvmAddress.mockRejectedValue(error);

    const query = new ScheduledCouponListingCountQuery(securityId);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow(ScheduledCouponListingCountQueryError);
  });
});
