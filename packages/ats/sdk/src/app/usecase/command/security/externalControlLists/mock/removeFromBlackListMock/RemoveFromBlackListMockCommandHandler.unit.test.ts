// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RemoveFromBlackListMockCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import {
  RemoveFromBlackListMockCommand,
  RemoveFromBlackListMockCommandResponse,
} from "./RemoveFromBlackListMockCommand.js";
import { RemoveFromBlackListMockCommandHandler } from "./RemoveFromBlackListMockCommandHandler.js";
import AccountService from "@service/account/AccountService";
import { RemoveFromBlackListMockCommandError } from "./error/RemoveFromBlackListMockCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("RemoveFromBlackListMockCommandHandler", () => {
  let handler: RemoveFromBlackListMockCommandHandler;
  let command: RemoveFromBlackListMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new RemoveFromBlackListMockCommandHandler(
      transactionServiceMock,
      contractServiceMock,
      accountServiceMock,
    );
    command = RemoveFromBlackListMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws RemoveFromBlackListMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(RemoveFromBlackListMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while removing from blacklist: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully remove from black list mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().removeFromBlackListMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(RemoveFromBlackListMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().removeFromBlackListMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().removeFromBlackListMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
