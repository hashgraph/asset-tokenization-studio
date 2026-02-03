// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { DisconnectCommandHandler } from "./DisconnectCommandHandler";
import { DisconnectCommandResponse } from "./DisconnectCommand";
import Injectable from "@core/injectable/Injectable";
import { ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { DisconnectCommandError } from "./error/DisconnectCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("DisconnectCommandHandler", () => {
  let handler: DisconnectCommandHandler;

  const transactionAdapterMock = createMock<TransactionAdapter>();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new DisconnectCommandHandler();

    transactionAdapterMock.stop.mockResolvedValue(true);
    jest.spyOn(Injectable, "resolveTransactionHandler").mockReturnValue(transactionAdapterMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws DisconnectCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        transactionAdapterMock.stop.mockRejectedValue(fakeError);

        const resultPromise = handler.execute();

        await expect(resultPromise).rejects.toBeInstanceOf(DisconnectCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while disconnecting from network: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully disconnect", async () => {
        const result = await handler.execute();

        expect(result).toBeInstanceOf(DisconnectCommandResponse);
        expect(transactionAdapterMock.stop).toHaveBeenCalledTimes(1);
        expect(result.payload).toEqual(true);
      });
    });
  });
});
