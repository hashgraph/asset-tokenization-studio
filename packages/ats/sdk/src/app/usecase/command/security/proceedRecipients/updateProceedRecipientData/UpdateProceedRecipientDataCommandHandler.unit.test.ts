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
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ErrorCode } from "@core/error/BaseError";
import { UpdateProceedRecipientDataCommandHandler } from "./UpdateProceedRecipientDataCommandHandler";
import {
  UpdateProceedRecipientDataCommand,
  UpdateProceedRecipientDataCommandResponse,
} from "./UpdateProceedRecipientDataCommand";

import { UpdateProceedRecipientDataCommandError } from "./error/UpdateProceedRecipientDataCommandError";
import { UpdateProceedRecipientDataCommandFixture } from "@test/fixtures/proceedRecipient/ProceedRecipientFixture";

describe("UpdateProceedRecipientDataCommandHandler", () => {
  let handler: UpdateProceedRecipientDataCommandHandler;
  let command: UpdateProceedRecipientDataCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const proceedRecipientEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateProceedRecipientDataCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = UpdateProceedRecipientDataCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws UpdateProceedRecipientDataCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(UpdateProceedRecipientDataCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while updating proceed recipient data: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });
    it("should successfully update proceed recipient", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(proceedRecipientEvmAddress);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      validationServiceMock.checkIsProceedRecipient.mockResolvedValue(true);
      transactionServiceMock.getHandler().updateProceedRecipientData.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(UpdateProceedRecipientDataCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().updateProceedRecipientData).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._PROCEED_RECIPIENT_MANAGER_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.proceedRecipient);

      expect(transactionServiceMock.getHandler().updateProceedRecipientData).toHaveBeenCalledWith(
        evmAddress,
        proceedRecipientEvmAddress,
        command.data,
        command.securityId,
      );
    });
  });
});
