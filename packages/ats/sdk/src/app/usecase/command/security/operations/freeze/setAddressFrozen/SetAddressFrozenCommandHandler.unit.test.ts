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
import { SetAddressFrozenCommandError } from "./error/SetAddressFrozenCommandError";
import { SetAddressFrozenCommand, SetAddressFrozenCommandResponse } from "./SetAddressFrozenCommand";
import { SetAddressFrozenCommandHandler } from "./SetAddressFrozenCommandHandler";
import { SetAddressFrozenCommandFixture } from "@test/fixtures/freeze/FreezeFixture";

describe("SetAddressFrozenCommandHandler", () => {
  let handler: SetAddressFrozenCommandHandler;
  let command: SetAddressFrozenCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetAddressFrozenCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetAddressFrozenCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws SetAddressFrozenCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetAddressFrozenCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while freezing address: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully freeze user", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);

      transactionServiceMock.getHandler().setAddressFrozen.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(SetAddressFrozenCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);

      expect(transactionServiceMock.getHandler().setAddressFrozen).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);

      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkAnyRole).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkAnyRole).toHaveBeenCalledWith(
        [SecurityRole._FREEZE_MANAGER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        command.securityId,
      );

      expect(transactionServiceMock.getHandler().setAddressFrozen).toHaveBeenCalledWith(
        evmAddress,
        command.status,
        evmAddress,
        command.securityId,
      );
    });
  });
});
