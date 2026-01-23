// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ErrorCode } from "@core/error/BaseError";
import { SetOnchainIDCommandHandler } from "./SetOnchainIDCommandHandler";
import { SetOnchainIDCommand, SetOnchainIDCommandResponse } from "./SetOnchainIDCommand";
import { SetOnchainIDCommandFixture } from "@test/fixtures/tokenMetadata/TokenMetadataFixture";
import { SetOnchainIDCommandError } from "./error/SetOnchainIDCommandError";

describe("SetOnchainIDCommandHandler", () => {
  let handler: SetOnchainIDCommandHandler;
  let command: SetOnchainIDCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const onchainIDEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetOnchainIDCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetOnchainIDCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws SetOnchainIDCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(SetOnchainIDCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while setting onchain id: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });
    it("should successfully set onchainID", async () => {
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(onchainIDEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkRole.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().setOnchainID.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(SetOnchainIDCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().setOnchainID).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
        SecurityRole._TREX_OWNER_ROLE,
        account.id.toString(),
        command.securityId,
      );
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, command.onchainID);

      expect(transactionServiceMock.getHandler().setOnchainID).toHaveBeenCalledWith(
        evmAddress,
        onchainIDEvmAddress,
        command.securityId,
      );
    });
  });
});
