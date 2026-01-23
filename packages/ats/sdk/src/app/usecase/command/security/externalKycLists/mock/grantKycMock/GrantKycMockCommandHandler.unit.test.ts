// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GrantKycMockCommand, GrantKycMockCommandResponse } from "./GrantKycMockCommand.js";
import { GrantKycMockCommandHandler } from "./GrantKycMockCommandHandler.js";
import AccountService from "@service/account/AccountService";
import { GrantKycMockCommandFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";
import { ErrorCode } from "@core/error/BaseError";
import { GrantKycMockCommandError } from "./error/GrantKycMockCommandError.js";

describe("GrantKycMockCommandHandler", () => {
  let handler: GrantKycMockCommandHandler;
  let command: GrantKycMockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new GrantKycMockCommandHandler(transactionServiceMock, contractServiceMock, accountServiceMock);
    command = GrantKycMockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GrantKycMockCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(GrantKycMockCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while granting external KYC: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully grant kyc mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);

      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      transactionServiceMock.getHandler().grantKycMock.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(GrantKycMockCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().grantKycMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);

      expect(transactionServiceMock.getHandler().grantKycMock).toHaveBeenCalledWith(
        contractEvmAddress,
        targetEvmAddress,
        command.contractId,
      );
    });
  });
});
