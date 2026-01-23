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
import { DeactivateInternalKycCommandHandler } from "./DeactivateInternalKycCommandHandler.js";
import { DeactivateInternalKycCommand, DeactivateInternalKycCommandResponse } from "./DeactivateInternalKycCommand.js";
import { DeactivateInternalKycCommandFixture } from "@test/fixtures/kyc/KycFixture";
import { DeactivateInternalKycCommandError } from "./error/DeactivateInternalKycCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("DeactivateInternalKycCommandHandler", () => {
  let handler: DeactivateInternalKycCommandHandler;
  let command: DeactivateInternalKycCommand;

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
    handler = new DeactivateInternalKycCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = DeactivateInternalKycCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws DeactivateInternalKycCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(DeactivateInternalKycCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while deactivating internal KYC: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully deactivate internal kyc", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().deactivateInternalKyc.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(DeactivateInternalKycCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().deactivateInternalKyc).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._INTERNAL_KYC_MANAGER_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

      expect(transactionServiceMock.getHandler().deactivateInternalKyc).toHaveBeenCalledWith(
        evmAddress,
        command.securityId,
      );
    });
  });
});
