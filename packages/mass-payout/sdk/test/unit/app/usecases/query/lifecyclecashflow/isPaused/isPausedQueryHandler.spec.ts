// SPDX-License-Identifier: Apache-2.0

import { IsPausedQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/isPaused/IsPausedQueryHandler";
import { IsPausedQuery, IsPausedQueryResponse } from "@app/usecase/query/lifeCycleCashFlow/isPaused/IsPausedQuery";
import { IsPausedQueryError } from "@app/usecase/query/lifeCycleCashFlow/isPaused/error/IsPausedQueryError";
import ContractService from "@app/services/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../fixture/DataFixture";

describe("IsPausedQueryHandler", () => {
  let handler: IsPausedQueryHandler;
  let contractService: jest.Mocked<ContractService>;
  let queryAdapter: jest.Mocked<RPCQueryAdapter>;

  beforeEach(() => {
    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    queryAdapter = {
      isPaused: jest.fn(),
    } as any;

    handler = new IsPausedQueryHandler(queryAdapter, contractService);
  });

  it("should return an IsPausedQueryResponse on success", async () => {
    // Arrange
    const query: IsPausedQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const paused = true;

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    (queryAdapter.isPaused as jest.Mock).mockResolvedValueOnce(paused);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(query.lifeCycleCashFlowId);
    expect(queryAdapter.isPaused).toHaveBeenCalledWith(mockEvmAddress);
    expect(result).toBeInstanceOf(IsPausedQueryResponse);
    expect(result).toEqual(new IsPausedQueryResponse(paused));
  });

  it("should throw IsPausedQueryError if contractService fails", async () => {
    const query: IsPausedQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(IsPausedQueryError);
  });

  it("should throw IsPausedQueryError if queryAdapter fails", async () => {
    const query: IsPausedQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    queryAdapter.isPaused.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(IsPausedQueryError);
  });
});
