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
import {
  SetNominalValueCurrencyCommand,
  SetNominalValueCurrencyCommandResponse,
} from "./SetNominalValueCurrencyCommand";
import { SetNominalValueCurrencyCommandHandler } from "./SetNominalValueCurrencyCommandHandler";
import { SetNominalValueCurrencyCommandFixture } from "@test/fixtures/nominalValue/NominalValueFixture";
import { SetNominalValueCurrencyCommandError } from "./error/SetNominalValueCurrencyCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { SecurityPaused } from "@domain/context/security/error/operations/SecurityPaused";
import { NotGrantedRole } from "@domain/context/security/error/operations/NotGrantedRole";

describe("SetNominalValueCurrencyCommandHandler", () => {
  let handler: SetNominalValueCurrencyCommandHandler;
  let command: SetNominalValueCurrencyCommand;

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
    handler = new SetNominalValueCurrencyCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetNominalValueCurrencyCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws SetNominalValueCurrencyCommandError when security is paused", async () => {
      const fakeError = new SecurityPaused();

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetNominalValueCurrencyCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while setting nominal value currency: ${fakeError.message}`,
        ),
        errorCode: ErrorCode.SecurityPaused,
      });

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
    });

    it("throws SetNominalValueCurrencyCommandError when account does not have ROLE_NOMINAL_VALUE", async () => {
      const fakeError = new NotGrantedRole(SecurityRole._NOMINAL_VALUE_ROLE);

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetNominalValueCurrencyCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while setting nominal value currency: ${fakeError.message}`,
        ),
        errorCode: ErrorCode.RoleNotAssigned,
      });

      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._NOMINAL_VALUE_ROLE,
        account.id.toString(),
        command.securityId,
      );
    });

    it("throws SetNominalValueCurrencyCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetNominalValueCurrencyCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while setting nominal value currency: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully set nominal value currency", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().setNominalValueCurrency.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(SetNominalValueCurrencyCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().setNominalValueCurrency).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._NOMINAL_VALUE_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      expect(transactionServiceMock.getHandler().setNominalValueCurrency).toHaveBeenCalledWith(
        evmAddress,
        command.nominalValueCurrency,
        command.securityId,
      );
    });
  });
});
