// SPDX-License-Identifier: Apache-2.0

import { UnpauseCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/UnpauseCommandHandler";
import {
  UnpauseCommand,
  UnpauseCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/UnpauseCommand";
import { UnpauseCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/error/UnpauseCommandError";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

describe("UnpauseCommandHandler", () => {
  let handler: UnpauseCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let transactionHandlerMock: any;

  beforeEach(() => {
    transactionHandlerMock = {
      unpause: jest.fn(),
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue(transactionHandlerMock),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    handler = new UnpauseCommandHandler(transactionService, contractService);
  });

  it("should execute successfully and return a response", async () => {
    const command: UnpauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockLifeCycleAddress);

    const mockedRes = { error: undefined, id: "tx123" };
    transactionHandlerMock.unpause.mockResolvedValue(mockedRes);

    const result = await handler.execute(command);

    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.lifeCycleCashFlowId);
    expect(transactionHandlerMock.unpause).toHaveBeenCalledWith(mockLifeCycleAddress, command.lifeCycleCashFlowId);
    expect(result).toBeInstanceOf(UnpauseCommandResponse);
    expect(result.payload).toBe(true);
    expect(result.transactionId).toBe("tx123");
  });

  it("should return failure response if handler returns error", async () => {
    const command: UnpauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;
    const mockLifeCycleAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

    (contractService.getContractEvmAddress as jest.Mock).mockResolvedValueOnce(mockLifeCycleAddress);

    const mockedRes = { error: "Some error", id: "tx123" };
    transactionHandlerMock.unpause.mockResolvedValue(mockedRes);

    const result = await handler.execute(command);

    expect(result).toBeInstanceOf(UnpauseCommandResponse);
    expect(result.payload).toBe(false);
    expect(result.transactionId).toBe("tx123");
  });

  it("should throw UnpauseCommandError on failure", async () => {
    const command: UnpauseCommand = {
      lifeCycleCashFlowId: HederaIdPropsFixture.create().value,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(UnpauseCommandError);
  });
});
