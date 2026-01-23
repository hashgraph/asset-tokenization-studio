// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import { ConnectCommandHandler } from "./ConnectCommandHandler";
import { ConnectCommand, ConnectCommandResponse } from "./ConnectCommand";
import { ConnectCommandFixture } from "@test/fixtures/network/NetworkFixture";
import TransactionAdapter from "@port/out/TransactionAdapter";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { ConnectCommandError } from "./error/ConnectCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("ConnectCommandHandler", () => {
  let handler: ConnectCommandHandler;
  let command: ConnectCommand;

  const transactionAdapterMock = createMock<TransactionAdapter>();
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ConnectCommandHandler();
    command = ConnectCommandFixture.create();

    transactionAdapterMock.register.mockResolvedValue({ account });
    jest.spyOn(TransactionService, "getHandlerClass").mockReturnValue(transactionAdapterMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ConnectCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        transactionAdapterMock.register.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ConnectCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while connecting to network: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully connect with custodial settings", async () => {
        command = ConnectCommandFixture.omit("HWCSettings").create();
        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ConnectCommandResponse);
        expect(transactionAdapterMock.register).toHaveBeenCalledTimes(1);
        expect(transactionAdapterMock.register).toHaveBeenCalledWith(command.custodialSettings, false);
        expect(result.walletType).toEqual(command.wallet);
        expect(result.payload).toEqual({ account });
      });
      it("should successfully connect with HWC settings", async () => {
        command = ConnectCommandFixture.omit("custodialSettings").create();
        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ConnectCommandResponse);
        expect(transactionAdapterMock.register).toHaveBeenCalledTimes(1);
        expect(transactionAdapterMock.register).toHaveBeenCalledWith(command.HWCSettings, false);
        expect(result.walletType).toEqual(command.wallet);
        expect(result.payload).toEqual({ account });
      });

      it("should successfully connect without custodial settings and HWC", async () => {
        command = ConnectCommandFixture.omit("HWCSettings").create();
        command = { ...command, custodialSettings: undefined };
        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ConnectCommandResponse);
        expect(transactionAdapterMock.register).toHaveBeenCalledTimes(1);
        expect(transactionAdapterMock.register).toHaveBeenCalledWith(command.account, false);
        expect(result.walletType).toEqual(command.wallet);
        expect(result.payload).toEqual({ account });
      });
    });
  });
});
