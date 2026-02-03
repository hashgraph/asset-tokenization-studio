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
import { AddIssuerCommandFixture } from "@test/fixtures/ssi/SsiFixture";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { RemoveIssuerCommandHandler } from "./RemoveIssuerCommandHandler";
import { RemoveIssuerCommand, RemoveIssuerCommandResponse } from "./RemoveIssuerCommand";
import { RemoveIssuerCommandError } from "./error/RemoveIssuerCommandError";

describe("RemoveIssuerCommandHandler", () => {
  let handler: RemoveIssuerCommandHandler;
  let command: RemoveIssuerCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new RemoveIssuerCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = AddIssuerCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws RemoveIssuerCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(RemoveIssuerCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while removing issuer: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully remove issuer", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().removeIssuer.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(RemoveIssuerCommandResponse);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.issuerId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._SSI_MANAGER_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkAccountInIssuersList).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkAccountInIssuersList).toHaveBeenCalledWith(
          command.securityId,
          command.issuerId,
          false,
        );

        expect(transactionServiceMock.getHandler().removeIssuer).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().removeIssuer).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
