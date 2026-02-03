// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AddToWhiteListMockCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import { AddToWhiteListMockCommand, AddToWhiteListMockCommandResponse } from "./AddToWhiteListMockCommand.js";
import { AddToWhiteListMockCommandHandler } from "./AddToWhiteListMockCommandHandler.js";
import AccountService from "@service/account/AccountService";
import { ErrorCode } from "@core/error/BaseError";
import { AddToWhiteListMockCommandError } from "./error/AddToWhiteListMockCommandError.js";

describe("AddToWhiteListMockCommandHandler", () => {
  let handler: AddToWhiteListMockCommandHandler;
  let command: AddToWhiteListMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new AddToWhiteListMockCommandHandler(transactionServiceMock, contractServiceMock, accountServiceMock);
    command = AddToWhiteListMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws AddToWhiteListMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(AddToWhiteListMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while adding to whitelist: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully add to white list mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().addToWhiteListMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(AddToWhiteListMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().addToWhiteListMock).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().addToWhiteListMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
