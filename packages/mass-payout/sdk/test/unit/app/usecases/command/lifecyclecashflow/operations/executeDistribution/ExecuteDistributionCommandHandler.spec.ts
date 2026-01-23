// SPDX-License-Identifier: Apache-2.0

import { ExecuteDistributionCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/ExecuteDistributionCommandHandler";
import {
  ExecuteDistributionCommand,
  ExecuteDistributionCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/ExecuteDistributionCommand";
import { ExecuteDistributionCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/error/ExecuteDistributionCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteDistributionCommandHandler", () => {
  let handler: ExecuteDistributionCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executeDistribution: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteDistributionCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const command: ExecuteDistributionCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      pageIndex: 0,
      pageLength: 10,
      distributionId: "distribution-999",
      paymentTokenDecimals: 6,
    } as any;

    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const mockAssetAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock)
      .mockResolvedValueOnce(mockLifeCycleAddress)
      .mockResolvedValueOnce(mockAssetAddress);

    const failed = EvmAddressPropsFixture.create().value;
    const succeeded1 = EvmAddressPropsFixture.create().value;
    const succeeded2 = EvmAddressPropsFixture.create().value;
    const mockedRes = {
      response: [[failed], [succeeded1, succeeded2], [1000000, 2000000], true],
      id: "tx123",
    };

    transactionHandlerMock.executeDistribution.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);

    expect(transactionHandlerMock.executeDistribution).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      "distribution-999",
      0,
      10,
    );

    expect(result).toBeInstanceOf(ExecuteDistributionCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.executed).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecuteDistributionCommandError on failure", async () => {
    const command: ExecuteDistributionCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      pageIndex: 0,
      pageLength: 10,
      distributionId: "distribution-999",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecuteDistributionCommandError);
  });
});
