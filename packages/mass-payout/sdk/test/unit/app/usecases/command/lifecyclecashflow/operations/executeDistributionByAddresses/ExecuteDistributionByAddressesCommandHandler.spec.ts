// SPDX-License-Identifier: Apache-2.0

import { ExecuteDistributionByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/ExecuteDistributionByAddressesCommandHandler";
import {
  ExecuteDistributionByAddressesCommand,
  ExecuteDistributionByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/ExecuteDistributionByAddressesCommand";
import { ExecuteDistributionByAddressesCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/error/ExecuteDistributionByAddressesCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("ExecuteDistributionByAddressesCommandHandler", () => {
  let handler: ExecuteDistributionByAddressesCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      executeDistributionByAddresses: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new ExecuteDistributionByAddressesCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteDistributionByAddressesCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      holders: [holder1, holder2],
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
      response: [[failed], [succeeded1, succeeded2], [1000000, 2000000]],
      id: "tx123",
    };

    transactionHandlerMock.executeDistributionByAddresses.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);

    expect(transactionHandlerMock.executeDistributionByAddresses).toHaveBeenCalledWith(
      mockLifeCycleAddress,
      command.lifeCycleCashFlowId,
      mockAssetAddress,
      "distribution-999",
      [new EvmAddress(holder1), new EvmAddress(holder2)],
    );

    expect(result).toBeInstanceOf(ExecuteDistributionByAddressesCommandResponse);
    expect(result.failed).toStrictEqual([failed]);
    expect(result.succeeded).toStrictEqual([succeeded1, succeeded2]);
    expect(result.paidAmount).toEqual(["1", "2"]);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw ExecuteDistributionByAddressesCommandError on failure", async () => {
    const holder1 = EvmAddressPropsFixture.create().value;
    const holder2 = EvmAddressPropsFixture.create().value;
    const command: ExecuteDistributionByAddressesCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
      asset: HederaIdPropsFixture.create().value,
      holders: [holder1, holder2],
      distributionId: "distribution-999",
      paymentTokenDecimals: 6,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(ExecuteDistributionByAddressesCommandError);
  });
});
