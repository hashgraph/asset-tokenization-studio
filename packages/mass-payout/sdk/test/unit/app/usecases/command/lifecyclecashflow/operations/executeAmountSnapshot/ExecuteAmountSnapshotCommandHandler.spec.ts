// SPDX-License-Identifier: Apache-2.0

import { ExecuteAmountSnapshotCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/ExecuteAmountSnapshotCommandHandler";
import TransactionService from "@app/services/transaction/TransactionService";
import ContractService from "@app/services/contract/ContractService";
import EvmAddress from "@domain/contract/EvmAddress";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteAmountSnapshotCommand,
  ExecuteAmountSnapshotCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/ExecuteAmountSnapshotCommand";
import { ExecuteAmountSnapshotCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/error/ExecuteAmountSnapshotCommandError";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteAmountSnapshotCommandHandler", () => {
  let handler: ExecuteAmountSnapshotCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let mockExecuteAmountSnapshot: jest.Mock;

  beforeEach(() => {
    mockExecuteAmountSnapshot = jest.fn();

    transactionService = {
      getHandler: jest.fn().mockReturnValue({
        executeAmountSnapshot: mockExecuteAmountSnapshot,
      }),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteAmountSnapshotCommandHandler(transactionService, contractService);
  });

  it("should execute snapshot and return ExecuteAmountSnapshotCommandResponse", async () => {
    const command: ExecuteAmountSnapshotCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: 1,
      pageIndex: 0,
      pageLength: 10,
      amount: "123.45",
      paymentTokenDecimals: 6,
    } as any;

    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
    const mockAssetAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    contractService.getContractEvmAddress
      .mockResolvedValueOnce(mockLifeCycleAddress)
      .mockResolvedValueOnce(mockAssetAddress);

    const failed = EvmAddressPropsFixture.create().value;
    const succeeded1 = EvmAddressPropsFixture.create().value;
    const succeeded2 = EvmAddressPropsFixture.create().value;
    mockExecuteAmountSnapshot.mockResolvedValue({
      response: [
        [failed],
        [succeeded1, succeeded2],
        [1000000, 2000000], // numeric values to transform with BigDecimal
        true,
      ],
      id: "tx123",
    });

    const result = await handler.execute(command);

    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);

    const bd = BigDecimal.fromString("123.45", 6);
    expect(mockExecuteAmountSnapshot).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      1,
      0,
      10,
      bd,
    );

    // Validate returned response
    expect(result).toBeInstanceOf(ExecuteAmountSnapshotCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.executed).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should wrap errors in ExecuteAmountSnapshotCommandError", async () => {
    const command: ExecuteAmountSnapshotCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      snapshotId: 1,
      pageIndex: 0,
      pageLength: 10,
      amount: "123.45",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecuteAmountSnapshotCommandError);
  });
});
