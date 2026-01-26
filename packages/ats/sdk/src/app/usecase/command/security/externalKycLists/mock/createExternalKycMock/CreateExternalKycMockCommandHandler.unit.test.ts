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
import { CreateExternalKycMockCommandError } from "./error/CreateExternalKycMockCommandError.js";
import { CreateExternalKycListMockCommandHandler } from "./CreateExternalKycMockCommandHandler.js";
import { CreateExternalKycListMockCommandResponse } from "./CreateExternalKycMockCommand.js";

describe("CreateExternalKycListMockCommandHandler", () => {
  let handler: CreateExternalKycListMockCommandHandler;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateExternalKycListMockCommandHandler(mirrorNodeAdapterMock, transactionServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateExternalKycMockCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        transactionServiceMock.getHandler().createExternalKycListMock.mockRejectedValue(fakeError);

        const resultPromise = handler.execute();

        await expect(resultPromise).rejects.toBeInstanceOf(CreateExternalKycMockCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating external KYC list: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create kyc list if return an Id", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalKycListMock.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalKycListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: CreateExternalKycListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalKycListMock).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);
        expect(transactionServiceMock.getHandler().createExternalKycListMock).toHaveBeenCalledWith();
      });

      it("should successfully create kyc list mock if return an address", async () => {
        mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

        transactionServiceMock.getHandler().createExternalKycListMock.mockResolvedValue(account.evmAddress!);

        const result = await handler.execute();

        expect(result).toBeInstanceOf(CreateExternalKycListMockCommandResponse);
        expect(result.payload).toBe(account.id.toString());

        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createExternalKycListMock).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(account.evmAddress);
        expect(transactionServiceMock.getHandler().createExternalKycListMock).toHaveBeenCalledWith();
      });
    });
  });
});
