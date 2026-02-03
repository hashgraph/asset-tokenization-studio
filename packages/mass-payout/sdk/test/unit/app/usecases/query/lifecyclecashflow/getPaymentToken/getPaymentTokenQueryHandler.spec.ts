// SPDX-License-Identifier: Apache-2.0

import { GetPaymentTokenQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/getPaymentToken/GetPaymentTokenQueryHandler";
import {
  GetPaymentTokenQuery,
  GetPaymentTokenQueryResponse,
} from "@app/usecase/query/lifeCycleCashFlow/getPaymentToken/GetPaymentTokenQuery";
import { GetPaymentTokenQueryError } from "@app/usecase/query/lifeCycleCashFlow/getPaymentToken/error/GetPaymentTokenQueryError";
import ContractService from "@app/services/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../fixture/DataFixture";

describe("GetPaymentTokenQueryHandler", () => {
  let handler: GetPaymentTokenQueryHandler;
  let contractService: jest.Mocked<ContractService>;
  let queryAdapter: jest.Mocked<RPCQueryAdapter>;

  beforeEach(() => {
    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    queryAdapter = {
      getPaymentToken: jest.fn(),
    } as any;

    handler = new GetPaymentTokenQueryHandler(queryAdapter, contractService);
  });

  it("should return a GetPaymentTokenQueryResponse on success", async () => {
    // Arrange
    const query: GetPaymentTokenQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const paymentTokenResult = "paymentToken";

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    (queryAdapter.getPaymentToken as jest.Mock).mockResolvedValueOnce(paymentTokenResult);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(query.lifeCycleCashFlowId);
    expect(queryAdapter.getPaymentToken).toHaveBeenCalledWith(mockEvmAddress);
    expect(result).toBeInstanceOf(GetPaymentTokenQueryResponse);
    expect(result.payload).toEqual(new GetPaymentTokenQueryResponse(paymentTokenResult).payload);
  });

  it("should throw GetPaymentTokenQueryError if contractService fails", async () => {
    const query: GetPaymentTokenQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(GetPaymentTokenQueryError);
  });

  it("should throw GetPaymentTokenQueryError if queryAdapter fails", async () => {
    const query: GetPaymentTokenQuery = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockEvmAddress);
    queryAdapter.getPaymentToken.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(query)).rejects.toThrow(GetPaymentTokenQueryError);
  });
});
