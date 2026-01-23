// SPDX-License-Identifier: Apache-2.0

import { ExecuteAmountSnapshotByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/ExecuteAmountSnapshotByAddressesCommandHandler";
import {
  ExecuteAmountSnapshotByAddressesCommand,
  ExecuteAmountSnapshotByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/ExecuteAmountSnapshotByAddressesCommand";
import { ExecuteAmountSnapshotByAddressesCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/error/ExecuteAmountSnapshotByAddressesCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteAmountSnapshotByAddressesCommandHandler", () => {
  let handler: ExecuteAmountSnapshotByAddressesCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executeAmountSnapshotByAddresses: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteAmountSnapshotByAddressesCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return response", async () => {
    // Arrange
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteAmountSnapshotByAddressesCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: "snapshot-123",
      holders: [holder1, holder2],
      amount: "1000",
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
      response: [[failed], [succeeded1, succeeded2], [1000000, 2000000]],
      id: "tx123",
    };

    transactionHandlerMock.executeAmountSnapshotByAddresses.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);
    expect(transactionHandlerMock.executeAmountSnapshotByAddresses).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      "snapshot-123",
      [new EvmAddress(holder1), new EvmAddress(holder2)],
      BigDecimal.fromString("1000", 6),
    );

    expect(result).toBeInstanceOf(ExecuteAmountSnapshotByAddressesCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecuteAmountSnapshotByAddressesCommandError when something fails", async () => {
    // Arrange
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteAmountSnapshotByAddressesCommand = {
      lifeCycleCashFlowId: EvmAddressPropsFixture.create().value,
      asset: EvmAddressPropsFixture.create().value,
      snapshotId: "snapshot-123",
      holders: [holder1, holder2],
      amount: "1000",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(ExecuteAmountSnapshotByAddressesCommandError);
  });
});
