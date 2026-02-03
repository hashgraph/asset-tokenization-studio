// SPDX-License-Identifier: Apache-2.0
import { createMock } from "@golevelup/ts-jest";
import { faker } from "@faker-js/faker/.";
import { TakeSnapshotCommand, TakeSnapshotCommandResponse } from "./TakeSnapshotCommand";
import { TakeSnapshotCommandHandler } from "./TakeSnapshotCommandHandler";
import TransactionService from "@service/transaction/TransactionService";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import Account from "@domain/context/account/Account";
import { TakeSnapshotCommandFixture } from "@test/fixtures/snapshot/SnapshotFixture";
import { TakeSnapshotCommandError } from "./error/TakeSnapshotCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { SecurityRole } from "@domain/context/security/SecurityRole";

describe("TakeSnapshotCommandHandler", () => {
  let handler: TakeSnapshotCommandHandler;
  let command: TakeSnapshotCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  const snapshotId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new TakeSnapshotCommandHandler(
      accountServiceMock,
      contractServiceMock,
      transactionServiceMock,
      validationServiceMock,
    );
    command = TakeSnapshotCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws TakeSnapshotCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(TakeSnapshotCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while taking snapshot: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully take snapshot", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        validationServiceMock.checkPause.mockResolvedValue(undefined);
        validationServiceMock.checkRole.mockResolvedValue(undefined);

        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().takeSnapshot.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(snapshotId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(TakeSnapshotCommandResponse);
        expect(result.payload).toBe(parseInt(snapshotId, 16));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._SNAPSHOT_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().takeSnapshot).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().takeSnapshot).toHaveBeenCalledWith(evmAddress, command.securityId);

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: TakeSnapshotCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
        });
      });
    });
  });
});
