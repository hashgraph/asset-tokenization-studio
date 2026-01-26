// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import { CreateExternalBlackListMockCommandHandler } from "./CreateExternalBlackListMockCommandHandler.js";
import { CreateExternalBlackListMockCommandResponse } from "./CreateExternalBlackListMockCommand.js";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Account from "@domain/context/account/Account";
import { CreateExternalBlackListMockCommandError } from "./error/CreateExternalBlackListMockCommandError.js";
import { ErrorCode } from "@core/error/BaseError";

describe("CreateExternalBlackListMockCommandHandler", () => {
  let handler: CreateExternalBlackListMockCommandHandler;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateExternalBlackListMockCommandHandler(mirrorNodeAdapterMock, transactionServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateExternalBlackListMockCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        transactionServiceMock.getHandler().createExternalBlackListMock.mockRejectedValue(fakeError);

        const resultPromise = handler.execute();

        await expect(resultPromise).rejects.toBeInstanceOf(CreateExternalBlackListMockCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating external blacklist: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create black list mock if return an Id", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalBlackListMock.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalBlackListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: CreateExternalBlackListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalBlackListMock).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);
        expect(transactionServiceMock.getHandler().createExternalBlackListMock).toHaveBeenCalledWith();
      });

      it("should successfully create black list mock if return an address", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalBlackListMock.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalBlackListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalBlackListMock).toHaveBeenCalledTimes(1);

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);

        expect(transactionServiceMock.getHandler().createExternalBlackListMock).toHaveBeenCalledWith();
      });
    });
  });
});
