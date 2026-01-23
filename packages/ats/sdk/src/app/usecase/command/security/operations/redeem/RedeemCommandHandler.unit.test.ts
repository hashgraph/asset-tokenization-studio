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
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { RedeemCommandFixture } from "@test/fixtures/redeem/RedeemFixture";
import { _PARTITION_ID_1 } from "@core/Constants";
import { RedeemCommandHandler } from "./RedeemCommandHandler";
import { RedeemCommand, RedeemCommandResponse } from "./RedeemCommand";
import { RedeemCommandError } from "./error/RedeemCommandError";

/* eslint-disable @typescript-eslint/no-unused-vars */
describe("RedeemCommandHandler", () => {
  let handler: RedeemCommandHandler;
  let command: RedeemCommand;

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
    handler = new RedeemCommandHandler(
      securityServiceMock,
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    const commandRaw = RedeemCommandFixture.create();
    const { deadline, nounce, signature, partitionId, sourceId, ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws RedeemCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(RedeemCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while redeeming tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully redeem tokens", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().redeem.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(RedeemCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

        expect(transactionServiceMock.getHandler().redeem).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledWith(
          command.securityId,
          account.id.toString(),
          command.amount,
          _PARTITION_ID_1,
        );

        expect(transactionServiceMock.getHandler().redeem).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.securityId,
        );
      });
    });
  });
});
