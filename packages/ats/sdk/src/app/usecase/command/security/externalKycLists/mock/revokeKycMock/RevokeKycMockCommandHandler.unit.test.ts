// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RevokeKycMockCommand, RevokeKycMockCommandResponse } from "./RevokeKycMockCommand.js";
import { RevokeKycMockCommandHandler } from "./RevokeKycMockCommandHandler.js";
import AccountService from "@service/account/AccountService";
import { RevokeKycMockCommandFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RevokeKycMockCommandError } from "./error/RevokeKycMockCommandError.js";

describe("RevokeKycMockCommandHandler", () => {
  let handler: RevokeKycMockCommandHandler;
  let command: RevokeKycMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new RevokeKycMockCommandHandler(transactionServiceMock, contractServiceMock, accountServiceMock);
    command = RevokeKycMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws RevokeKycMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(RevokeKycMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while revoking external KYC: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully revoke kyc mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().revokeKycMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(RevokeKycMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().revokeKycMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().revokeKycMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
