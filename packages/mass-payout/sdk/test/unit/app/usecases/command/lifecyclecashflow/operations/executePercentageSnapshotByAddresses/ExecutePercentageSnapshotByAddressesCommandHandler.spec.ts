// SPDX-License-Identifier: Apache-2.0

import { ExecutePercentageSnapshotByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/ExecutePercentageSnapshotByAddressesCommandHandler";
import {
  ExecutePercentageSnapshotByAddressesCommand,
  ExecutePercentageSnapshotByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/ExecutePercentageSnapshotByAddressesCommand";
import { ExecutePercentageSnapshotByAddressesCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/error/ExecutePercentageSnapshotByAddressesCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import BigDecimal from "@domain/shared/BigDecimal";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecutePercentageSnapshotByAddressesCommandHandler", () => {
  let handler: ExecutePercentageSnapshotByAddressesCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executePercentageSnapshotByAddresses: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecutePercentageSnapshotByAddressesCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecutePercentageSnapshotByAddressesCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: "snapshot-456",
      holders: [holder1, holder2],
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
      response: [[failed], [succeeded1, succeeded2], [1000000, 2000000]],
      id: "tx123",
    };

    transactionHandlerMock.executePercentageSnapshotByAddresses.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);

    expect(transactionHandlerMock.executePercentageSnapshotByAddresses).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      "snapshot-456",
      [new EvmAddress(holder1), new EvmAddress(holder2)],
      percentageBd,
    );

    expect(result).toBeInstanceOf(ExecutePercentageSnapshotByAddressesCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecutePercentageSnapshotByAddressesCommandError on failure", async () => {
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecutePercentageSnapshotByAddressesCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: "snapshot-456",
      holders: [holder1, holder2],
      percentage: "25",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecutePercentageSnapshotByAddressesCommandError);
  });
});
