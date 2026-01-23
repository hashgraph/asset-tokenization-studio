// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import {
  AccountPropsFixture,
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import { SetRevocationRegistryAddressCommandFixture } from "@test/fixtures/ssi/SsiFixture";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { SetRevocationRegistryAddressCommandHandler } from "./SetRevocationRegistryAddressCommandHandler";
import {
  SetRevocationRegistryAddressCommand,
  SetRevocationRegistryAddressCommandResponse,
} from "./SetRevocationRegistryAddressCommand";
import { SetRevocationRegistryAddressCommandError } from "./error/SetRevocationRegistryAddressCommandError";

describe("RemoveIssuerCommandHandler", () => {
  let handler: SetRevocationRegistryAddressCommandHandler;
  let command: SetRevocationRegistryAddressCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new SetRevocationRegistryAddressCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = SetRevocationRegistryAddressCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetRevocationRegistryAddressCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetRevocationRegistryAddressCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting revokation registry: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set revokation registry", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().setRevocationRegistryAddress.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetRevocationRegistryAddressCommandResponse);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, command.revocationRegistryId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._SSI_MANAGER_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().setRevocationRegistryAddress).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().setRevocationRegistryAddress).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
