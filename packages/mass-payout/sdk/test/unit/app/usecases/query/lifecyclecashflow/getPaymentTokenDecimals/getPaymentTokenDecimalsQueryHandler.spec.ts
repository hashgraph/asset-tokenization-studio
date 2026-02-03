// SPDX-License-Identifier: Apache-2.0

import { GetPaymentTokenDecimalsQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/getPaymentTokenDecimals/GetPaymentTokenDecimalsQueryHandler";
import {
  GetPaymentTokenDecimalsQuery,
  GetPaymentTokenDecimalsQueryResponse,
} from "@app/usecase/query/lifeCycleCashFlow/getPaymentTokenDecimals/GetPaymentTokenDecimalsQuery";
import { GetPaymentTokenDecimalsQueryError } from "@app/usecase/query/lifeCycleCashFlow/getPaymentTokenDecimals/error/GetPaymentTokenDecimalsQueryError";
import ContractService from "@app/services/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../fixture/DataFixture";

describe("GetPaymentTokenDecimalsQueryHandler", () => {
  let handler: GetPaymentTokenDecimalsQueryHandler;
  let contractService: jest.Mocked<ContractService>;
  let queryAdapter: jest.Mocked<RPCQueryAdapter>;

  beforeEach(() => {
    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    queryAdapter = {
      getPaymentTokenDecimals: jest.fn(),
    } as any;

    handler = new GetPaymentTokenDecimalsQueryHandler(queryAdapter, contractService);
  });

  it("should return a GetPaymentTokenDecimalsQueryResponse on success", async () => {
    // Arrange
    const query: GetPaymentTokenDecimalsQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const decimals = 6;

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    (queryAdapter.getPaymentTokenDecimals as jest.Mock).mockResolvedValueOnce(decimals);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(query.lifeCycleCashFlowId);
    expect(queryAdapter.getPaymentTokenDecimals).toHaveBeenCalledWith(mockEvmAddress);
    expect(result).toBeInstanceOf(GetPaymentTokenDecimalsQueryResponse);
    expect(result).toEqual(new GetPaymentTokenDecimalsQueryResponse(decimals));
  });

  it("should throw GetPaymentTokenDecimalsQueryError if contractService fails", async () => {
    const query: GetPaymentTokenDecimalsQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(GetPaymentTokenDecimalsQueryError);
  });

  it("should throw GetPaymentTokenDecimalsQueryError if queryAdapter fails", async () => {
    const query: GetPaymentTokenDecimalsQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    queryAdapter.getPaymentTokenDecimals.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(GetPaymentTokenDecimalsQueryError);
  });
});
