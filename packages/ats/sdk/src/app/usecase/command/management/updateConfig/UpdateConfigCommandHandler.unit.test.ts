// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { UpdateConfigCommandHandler } from "./updateConfigCommandHandler";
import { UpdateConfigCommand, UpdateConfigCommandResponse } from "./updateConfigCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateConfigCommandFixture } from "@test/fixtures/management/ManagementFixture";
import { UpdateConfigCommandError } from "./error/UpdateConfigCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("UpdateConfigCommandHandler", () => {
  let handler: UpdateConfigCommandHandler;
  let command: UpdateConfigCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateConfigCommandHandler(transactionServiceMock, contractServiceMock);
    command = UpdateConfigCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws UpdateConfigCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UpdateConfigCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while updating the config: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully update configuration", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().updateConfig.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UpdateConfigCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().updateConfig).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().updateConfig).toHaveBeenCalledWith(
          evmAddress,
          command.configId,
          command.configVersion,
          command.securityId,
        );
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
