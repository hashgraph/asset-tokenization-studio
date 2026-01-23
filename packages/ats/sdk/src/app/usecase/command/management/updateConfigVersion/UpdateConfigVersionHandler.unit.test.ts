// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateConfigCommandFixture } from "@test/fixtures/management/ManagementFixture";
import { UpdateConfigVersionCommand, UpdateConfigVersionCommandResponse } from "./updateConfigVersionCommand";
import { UpdateConfigVersionCommandHandler } from "./updateConfigVersionCommandHandler";
import { UpdateConfigVersionCommandError } from "./error/UpdateConfigVersionCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("UpdateConfigVersionCommandHandler", () => {
  let handler: UpdateConfigVersionCommandHandler;
  let command: UpdateConfigVersionCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateConfigVersionCommandHandler(transactionServiceMock, contractServiceMock);
    command = UpdateConfigCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws UpdateConfigVersionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UpdateConfigVersionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while updating the config version: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully update configuration version", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().updateConfigVersion.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UpdateConfigVersionCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().updateConfigVersion).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().updateConfigVersion).toHaveBeenCalledWith(
          evmAddress,
          command.configVersion,
          command.securityId,
        );
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
