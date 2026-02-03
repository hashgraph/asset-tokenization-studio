// SPDX-License-Identifier: Apache-2.0

import { ExecuteBondCashOutCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/ExecuteBondCashOutCommandHandler";
import {
  ExecuteBondCashOutCommand,
  ExecuteBondCashOutCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/ExecuteBondCashOutCommand";
import { ExecuteBondCashOutCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/error/ExecuteBondCashOutCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteBondCashOutCommandHandler", () => {
  let handler: ExecuteBondCashOutCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executeBondCashOut: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteBondCashOutCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const command: ExecuteBondCashOutCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      bond: HederaIdPropsFixture.create().value,
      pageIndex: 0,
      pageLength: 10,
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

    transactionHandlerMock.executeBondCashOut.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.bond);

    expect(transactionHandlerMock.executeBondCashOut).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      0,
      10,
    );

    expect(result).toBeInstanceOf(ExecuteBondCashOutCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.executed).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecuteBondCashOutCommandError on failure", async () => {
    const command: ExecuteBondCashOutCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      bond: HederaIdPropsFixture.create().value,
      pageIndex: 0,
      pageLength: 10,
      paymentTokenDecimals: 18,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecuteBondCashOutCommandError);
  });
});
