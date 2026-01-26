// SPDX-License-Identifier: Apache-2.0

import { PauseCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/pause/PauseCommandHandler";
import {
  PauseCommand,
  PauseCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/pause/PauseCommand";
import { PauseCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/pause/error/PauseCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("PauseCommandHandler", () => {
  let handler: PauseCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      pause: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new PauseCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    // Arrange
    const command: PauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;

    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockLifeCycleAddress);

    const mockedRes = {
      error: undefined,
      id: "tx123",
    };

    transactionHandlerMock.pause.mockResolvedValue(mockedRes);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(transactionHandlerMock.pause).toHaveBeenCalledWith(mockLifeCycleAddress, command.lifeCycleCashFlowId);
    expect(result).toBeInstanceOf(PauseCommandResponse);
    expect(result.payload).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should return failure response if handler returns error", async () => {
    const command: PauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const lifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(lifeCycleAddress);

    const mockedRes = {
      error: "Some error",
      id: "tx123",
    };

    transactionHandlerMock.pause.mockResolvedValue(mockedRes);

    const result = await handler.execute(command);

    expect(result).toBeInstanceOf(PauseCommandResponse);
    expect(result.payload).toBe(false);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw PauseCommandError on failure", async () => {
    const command: PauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(PauseCommandError);
  });
});
