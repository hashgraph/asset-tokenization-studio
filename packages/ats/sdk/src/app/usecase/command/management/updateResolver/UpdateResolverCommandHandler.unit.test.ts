// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateResolverCommandFixture } from "@test/fixtures/management/ManagementFixture";
import { UpdateResolverCommand, UpdateResolverCommandResponse } from "./updateResolverCommand";
import { UpdateResolverCommandHandler } from "./updateResolverCommandHandler";
import { UpdateResolverCommandError } from "./error/UpdateResolverCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("UpdateResolverCommandHandler", () => {
  let handler: UpdateResolverCommandHandler;
  let command: UpdateResolverCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateResolverCommandHandler(transactionServiceMock, contractServiceMock);
    command = UpdateResolverCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws UpdateResolverCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UpdateResolverCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while updating the resolver: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully update resolver", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().updateResolver.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UpdateResolverCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().updateResolver).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().updateResolver).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          command.configVersion,
          command.configId,
          command.securityId,
        );
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
