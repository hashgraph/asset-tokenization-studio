// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Account from "@domain/context/account/Account";
import { ErrorCode } from "@core/error/BaseError";
import { CreateExternalWhiteListMockCommandHandler } from "./CreateExternalWhiteListMockCommandHandler.js";
import { CreateExternalWhiteListMockCommandError } from "./error/CreateExternalWhiteListMockCommandError.js";
import { CreateExternalWhiteListMockCommandResponse } from "./CreateExternalWhiteListMockCommand.js";

describe("CreateExternalWhiteListMockCommandHandler", () => {
  let handler: CreateExternalWhiteListMockCommandHandler;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateExternalWhiteListMockCommandHandler(mirrorNodeAdapterMock, transactionServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateExternalWhiteListMockCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        transactionServiceMock.getHandler().createExternalWhiteListMock.mockRejectedValue(fakeError);

        const resultPromise = handler.execute();

        await expect(resultPromise).rejects.toBeInstanceOf(CreateExternalWhiteListMockCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating external whitelist: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create white list mock if return an Id", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalWhiteListMock.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalWhiteListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: CreateExternalWhiteListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalWhiteListMock).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);
        expect(transactionServiceMock.getHandler().createExternalWhiteListMock).toHaveBeenCalledWith();
      });

      it("should successfully create white list mock if return an address", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalWhiteListMock.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalWhiteListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalWhiteListMock).toHaveBeenCalledTimes(1);

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);

        expect(transactionServiceMock.getHandler().createExternalWhiteListMock).toHaveBeenCalledWith();
      });
    });
  });
});
