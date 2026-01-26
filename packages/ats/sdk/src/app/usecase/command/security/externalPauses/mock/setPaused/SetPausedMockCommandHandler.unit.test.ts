// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SetPausedMockCommand, SetPausedMockCommandResponse } from "./SetPausedMockCommand.js";
import { SetPausedMockCommandHandler } from "./SetPausedMockCommandHandler.js";
import { SetPausedMockCommandFixture } from "@test/fixtures/externalPauses/ExternalPausesFixture";
import { SetPausedMockCommandError } from "./error/SetPausedMockCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("SetPausedMockCommandHandler", () => {
  let handler: SetPausedMockCommandHandler;
  let command: SetPausedMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new SetPausedMockCommandHandler(transactionServiceMock, contractServiceMock);
    command = SetPausedMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws SetPausedMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetPausedMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while setting external pause status: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully set pause mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      transactionServiceMock.getHandler().setPausedMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(SetPausedMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().setPausedMock).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);

      expect(transactionServiceMock.getHandler().setPausedMock).toHaveBeenCalledWith(
        contractEvmAddress,
        command.paused,
        command.contractId,
      );
    });
  });
});
