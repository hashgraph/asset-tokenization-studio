// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateExternalControlListsCommandHandler } from "./UpdateExternalControlListsCommandHandler.js";
import {
  UpdateExternalControlListsCommand,
  UpdateExternalControlListsCommandResponse,
} from "./UpdateExternalControlListsCommand.js";
import ValidationService from "@service/validation/ValidationService";
import { UpdateExternalControlListsCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { UpdateExternalControlListsCommandError } from "./error/UpdateExternalControlListsCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("UpdateExternalControlListCommandHandler", () => {
  let handler: UpdateExternalControlListsCommandHandler;
  let command: UpdateExternalControlListsCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateExternalControlListsCommandHandler(
      accountServiceMock,
      contractServiceMock,
      transactionServiceMock,
      validationServiceMock,
    );
    command = UpdateExternalControlListsCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws UpdateExternalControlListsCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(UpdateExternalControlListsCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while updating external control list: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully update external control lists", async () => {
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(externalEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().updateExternalControlLists.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(UpdateExternalControlListsCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().updateExternalControlLists).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._CONTROL_LIST_MANAGER_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(
        2,
        command.externalControlListsAddresses[0],
      );

      expect(transactionServiceMock.getHandler().updateExternalControlLists).toHaveBeenCalledWith(
        evmAddress,
        [externalEvmAddress],
        command.actives,
        command.securityId,
      );
    });
  });
});
