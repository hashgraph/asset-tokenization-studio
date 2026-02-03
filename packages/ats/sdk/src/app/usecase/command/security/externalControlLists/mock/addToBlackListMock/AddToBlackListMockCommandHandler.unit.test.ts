// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AddToBlackListMockCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import { AddToBlackListMockCommand, AddToBlackListMockCommandResponse } from "./AddToBlackListMockCommand.js";
import { AddToBlackListMockCommandHandler } from "./AddToBlackListMockCommandHandler.js";
import AccountService from "@service/account/AccountService";
import { ErrorCode } from "@core/error/BaseError";
import { AddToBlackListMockCommandError } from "./error/AddToBlackListMockCommandError.js";

describe("AddToBlackListMockCommandHandler", () => {
  let handler: AddToBlackListMockCommandHandler;
  let command: AddToBlackListMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new AddToBlackListMockCommandHandler(transactionServiceMock, contractServiceMock, accountServiceMock);
    command = AddToBlackListMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws AddToBlackListMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(AddToBlackListMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while adding to blacklist: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully add to black list mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().addToBlackListMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(AddToBlackListMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().addToBlackListMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().addToBlackListMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
