// SPDX-License-Identifier: Apache-2.0

import { ExecutePercentageSnapshotCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/ExecutePercentageSnapshotCommandHandler";
import {
  ExecutePercentageSnapshotCommand,
  ExecutePercentageSnapshotCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/ExecutePercentageSnapshotCommand";
import { ExecutePercentageSnapshotCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/error/ExecutePercentageSnapshotCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import BigDecimal from "@domain/shared/BigDecimal";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecutePercentageSnapshotCommandHandler", () => {
  let handler: ExecutePercentageSnapshotCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executePercentageSnapshot: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecutePercentageSnapshotCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const command: ExecutePercentageSnapshotCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: 1,
      pageIndex: 0,
      pageLength: 10,
      percentage: "25",
      paymentTokenDecimals: 6,
    } as any;

    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const mockAssetAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const percentageBd = BigDecimal.fromString("25", 2);

    (contractService.getContractEvmAddress as jest.Mock)
      .mockResolvedValueOnce(mockLifeCycleAddress)
      .mockResolvedValueOnce(mockAssetAddress);

    const failed = EvmAddressPropsFixture.create().value;
    const succeeded1 = EvmAddressPropsFixture.create().value;
    const succeeded2 = EvmAddressPropsFixture.create().value;
    const mockedRes = {
      response: [
        [failed],
        [succeeded1, succeeded2],
        [1000000, 2000000], // numeric values to transform with BigDecimal
        true,
      ],
      id: "tx123",
    };

    transactionHandlerMock.executePercentageSnapshot.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);

    expect(transactionHandlerMock.executePercentageSnapshot).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      1,
      0,
      10,
      percentageBd,
    );

    expect(result).toBeInstanceOf(ExecutePercentageSnapshotCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.executed).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecutePercentageSnapshotCommandError on failure", async () => {
    const command: ExecutePercentageSnapshotCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: 1,
      pageIndex: 0,
      pageLength: 10,
      percentage: "25",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecutePercentageSnapshotCommandError);
  });
});
