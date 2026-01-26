// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";

import TransactionService from "@service/transaction/TransactionService.js";
import { FullRedeemAtMaturityCommandHandler } from "./FullRedeemAtMaturityCommandHandler";
import { FullRedeemAtMaturityCommand, FullRedeemAtMaturityCommandResponse } from "./FullRedeemAtMaturityCommand";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { FullRedeemAtMaturityCommandFixture } from "@test/fixtures/bond/BondFixture";
import { FullRedeemAtMaturityCommandError } from "./error/FullRedeemAtMaturityCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("FullRedeemAtMaturityCommandHandler", () => {
  let handler: FullRedeemAtMaturityCommandHandler;
  let command: FullRedeemAtMaturityCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new FullRedeemAtMaturityCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = FullRedeemAtMaturityCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws FullRedeemAtMaturityCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(FullRedeemAtMaturityCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while full redeeming at maturity: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully full redeem at maturity by partition", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().fullRedeemAtMaturity.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(FullRedeemAtMaturityCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);

        expect(transactionServiceMock.getHandler().fullRedeemAtMaturity).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().fullRedeemAtMaturity).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
