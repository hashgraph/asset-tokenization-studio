// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RemoveFromWhiteListMockCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import AccountService from "@service/account/AccountService";
import {
  RemoveFromWhiteListMockCommand,
  RemoveFromWhiteListMockCommandResponse,
} from "./RemoveFromWhiteListMockCommand.js";
import { RemoveFromWhiteListMockCommandHandler } from "./RemoveFromWhiteListMockCommandHandler.js";
import { RemoveFromWhiteListMockCommandError } from "./error/RemoveFromWhiteListMockCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("RemoveFromWhiteListMockCommandHandler", () => {
  let handler: RemoveFromWhiteListMockCommandHandler;
  let command: RemoveFromWhiteListMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new RemoveFromWhiteListMockCommandHandler(
      transactionServiceMock,
      contractServiceMock,
      accountServiceMock,
    );
    command = RemoveFromWhiteListMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws RemoveFromWhiteListMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(RemoveFromWhiteListMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while removing from whitelist: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully remove from white list mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().removeFromWhiteListMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(RemoveFromWhiteListMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().removeFromWhiteListMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().removeFromWhiteListMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
