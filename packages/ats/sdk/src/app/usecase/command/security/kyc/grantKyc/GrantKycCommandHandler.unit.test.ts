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
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { GrantKycCommandHandler } from "./GrantKycCommandHandler";
import { GrantKycCommand, GrantKycCommandResponse } from "./GrantKycCommand";
import { GrantKycCommandFixture, SignedCredentialFixture } from "@test/fixtures/kyc/KycFixture";
import { Terminal3Vc } from "@domain/context/kyc/Terminal3";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ErrorCode } from "@core/error/BaseError";
import { GrantKycCommandError } from "./error/GrantKycCommandError";
const { setVerificationValid } = require("@terminal3/verify_vc");

describe("GrantKycCommandHandler", () => {
  let handler: GrantKycCommandHandler;
  let command: GrantKycCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const transactionId = TransactionIdFixture.create().id;
  const signedCredential = SignedCredentialFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GrantKycCommandHandler(
      accountServiceMock,
      contractServiceMock,
      transactionServiceMock,
      validationServiceMock,
    );
    command = GrantKycCommandFixture.create();
    jest.spyOn(Terminal3Vc, "vcFromBase64").mockReturnValue(signedCredential);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("should fail with InvalidVc", async () => {
        setVerificationValid(false);
        await expect(handler.execute(command)).rejects.toThrow("The provided VC is not valid");
      });
      it("throws GrantKycCommandError when command fails with uncaught error", async () => {
        setVerificationValid(true);
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(GrantKycCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while granting KYC: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully grant kyc", async () => {
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        validationServiceMock.checkValidVc.mockResolvedValue([evmAddress.toString(), signedCredential]);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        transactionServiceMock.getHandler().grantKyc.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(GrantKycCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2); // mocks are not restored until the end due to the mcoked dependency
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(transactionServiceMock.getHandler().grantKyc).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._KYC_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, command.securityId);

        expect(transactionServiceMock.getHandler().grantKyc).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          signedCredential.id,
          BigDecimal.fromString((signedCredential.validFrom as string).substring(0, 10)),
          BigDecimal.fromString((signedCredential.validUntil as string).substring(0, 10)),
          evmAddress,
        );
      });
    });
  });
});
