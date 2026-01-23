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
import ValidationService from "@service/validation/ValidationService";
import { RemoveExternalControlListCommandFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { RemoveExternalControlListCommandHandler } from "./RemoveExternalControlListCommandHandler";
import {
  RemoveExternalControlListCommand,
  RemoveExternalControlListCommandResponse,
} from "./RemoveExternalControlListCommand.js";
import { RemoveExternalControlListCommandError } from "./error/RemoveExternalControlListCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("RemoveExternalControlListCommandHandler", () => {
  let handler: RemoveExternalControlListCommandHandler;
  let command: RemoveExternalControlListCommand;

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
    handler = new RemoveExternalControlListCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = RemoveExternalControlListCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws RemoveExternalControlListCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(RemoveExternalControlListCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while removing external control list: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully remove external control list", async () => {
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(externalEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().removeExternalControlList.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(RemoveExternalControlListCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().removeExternalControlList).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._CONTROL_LIST_MANAGER_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, command.externalControlListAddress);

      expect(transactionServiceMock.getHandler().removeExternalControlList).toHaveBeenCalledWith(
        evmAddress,
        externalEvmAddress,
        command.securityId,
      );
    });
  });
});
