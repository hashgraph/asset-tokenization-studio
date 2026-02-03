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
import { SetMaxSupplyCommandFixture } from "@test/fixtures/cap/CapFixture";
import { SetMaxSupplyCommandHandler } from "./SetMaxSupplyCommandHandler";
import { SetMaxSupplyCommand, SetMaxSupplyCommandResponse } from "./SetMaxSupplyCommand";
import SecurityService from "@service/security/SecurityService";
import Account from "@domain/context/account/Account";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SetMaxSupplyCommandError } from "./error/SetMaxSupplyCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetMaxSupplyCommandHandler", () => {
  let handler: SetMaxSupplyCommandHandler;
  let command: SetMaxSupplyCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetMaxSupplyCommandHandler(
      securityServiceMock,
      transactionServiceMock,
      accountServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = SetMaxSupplyCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetMaxSupplyCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetMaxSupplyCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting max supply: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set max supply", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().setMaxSupply.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetMaxSupplyCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
        expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setMaxSupply).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CAP_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(securityServiceMock.get).toHaveBeenCalledWith(command.securityId);

        expect(transactionServiceMock.getHandler().setMaxSupply).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxSupply, security.decimals),
        );
      });
    });
  });
});
