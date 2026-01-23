// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ReleaseCommandHandler } from "./ReleaseCommandHandler";
import { ReleaseCommand, ReleaseCommandResponse } from "./ReleaseCommand";
import { ReleaseCommandFixture } from "@test/fixtures/lock/LockFixture";
import { ReleaseCommandError } from "./error/ReleaseCommandError";

describe("ReleaseCommandHandler", () => {
  let handler: ReleaseCommandHandler;
  let command: ReleaseCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ReleaseCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = ReleaseCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ReleaseCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ReleaseCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while releasing lock: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully release lock", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().release.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ReleaseCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.sourceId);

        expect(transactionServiceMock.getHandler().release).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);

        expect(transactionServiceMock.getHandler().release).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.lockId.toString()),
          command.securityId,
        );
      });
    });
  });
});
