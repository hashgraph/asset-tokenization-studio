// SPDX-License-Identifier: Apache-2.0

import { ExecuteBondCashOutByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/ExecuteBondCashOutByAddressesCommandHandler";
import {
  ExecuteBondCashOutByAddressesCommand,
  ExecuteBondCashOutByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/ExecuteBondCashOutByAddressesCommand";
// eslint-disable-next-line max-len
import { ExecuteBondCashOutByAddressesCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/error/ExecuteBondCashOutByAddressesCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteBondCashOutByAddressesCommandHandler", () => {
  let handler: ExecuteBondCashOutByAddressesCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executeBondCashOutByAddresses: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteBondCashOutByAddressesCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteBondCashOutByAddressesCommand = {
      lifeCycleCashFlowId: EvmAddressPropsFixture.create().value,
      bond: EvmAddressPropsFixture.create().value,
      holders: [holder1, holder2],
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

    transactionHandlerMock.executeBondCashOutByAddresses.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.bond);

    expect(transactionHandlerMock.executeBondCashOutByAddresses).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      [new EvmAddress(holder1), new EvmAddress(holder2)],
    );

    expect(result).toBeInstanceOf(ExecuteBondCashOutByAddressesCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecuteBondCashOutByAddressesCommandError on failure", async () => {
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteBondCashOutByAddressesCommand = {
      lifeCycleCashFlowId: EvmAddressPropsFixture.create().value,
      bond: EvmAddressPropsFixture.create().value,
      holders: [holder1, holder2],
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecuteBondCashOutByAddressesCommandError);
  });
});
