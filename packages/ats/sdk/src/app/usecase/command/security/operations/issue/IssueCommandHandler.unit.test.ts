// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { IssueCommandHandler } from "./IssueCommandHandler";
import { IssueCommand, IssueCommandResponse } from "./IssueCommand";
import { IssueCommandError } from "./error/IssueCommandError";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/shared/DataFixture";
import { KycStatus } from "@domain/context/kyc/Kyc";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { IssueCommandFixture } from "@test/fixtures/issue/IssueFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("IssueCommandHandler", () => {
  let handler: IssueCommandHandler;
  let command: IssueCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new IssueCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = IssueCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws IssueCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(IssueCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while issuing tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully issue tokens", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().issue.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(IssueCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.targetId);
        expect(transactionServiceMock.getHandler().issue).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkMaxSupply).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkMaxSupply).toHaveBeenCalledWith(
          command.securityId,
          BigDecimal.fromString(command.amount, security.decimals),
          security,
        );
        expect(validationServiceMock.checkControlList).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkControlList).toHaveBeenCalledWith(command.securityId, evmAddress.toString());
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledWith(
          command.securityId,
          [command.targetId],
          KycStatus.GRANTED,
        );
        expect(validationServiceMock.checkAnyRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkAnyRole).toHaveBeenCalledWith(
          [SecurityRole._ISSUER_ROLE, SecurityRole._AGENT_ROLE],
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkMultiPartition).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkMultiPartition).toHaveBeenCalledWith(security);
        expect(validationServiceMock.checkIssuable).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkIssuable).toHaveBeenCalledWith(security);
        expect(transactionServiceMock.getHandler().issue).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.securityId,
        );
      });
    });
  });
});
