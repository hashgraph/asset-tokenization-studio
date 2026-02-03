// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ForcedTransferCommandHandler } from "./ForcedTransferCommandHandler";
import { ForcedTransferCommand, ForcedTransferCommandResponse } from "./ForcedTransferCommand";

import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";

import { EvmAddressPropsFixture, HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import Account from "@domain/context/account/Account";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { Security } from "@domain/context/security/Security";
import { FocedTransferCommandFixture } from "@test/fixtures/transfer/TransferFixture";
import { ForcedTransferCommandError } from "./error/ForcedTransferCommandError";

describe("ForcedTransferCommandHandler", () => {
  let handler: ForcedTransferCommandHandler;
  let command: ForcedTransferCommand;

  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();
  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const security = { decimals: 6 } as unknown as Security;
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const securityEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const sourceEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  beforeEach(() => {
    handler = new ForcedTransferCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = FocedTransferCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully execute forced transfer", async () => {
      const handlerMock = createMock<TransactionAdapter>();
      handlerMock.forcedTransfer.mockResolvedValue({ id: transactionId });

      transactionServiceMock.getHandler.mockReturnValue(handlerMock);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      securityServiceMock.get.mockResolvedValue(security);

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(securityEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(sourceEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(ForcedTransferCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      const amountBd = BigDecimal.fromString(command.amount, security.decimals);

      expect(securityServiceMock.get).toHaveBeenCalledWith(command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.targetId);

      expect(validationServiceMock.checkCanTransfer).toHaveBeenCalledWith(
        command.securityId,
        command.targetId,
        command.amount,
        account.id.toString(),
        command.sourceId,
      );

      expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);

      expect(handlerMock.forcedTransfer).toHaveBeenCalledWith(
        securityEvmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        amountBd,
        command.securityId,
      );
    });

    it("should throw ForcedTransferCommandError on failure", async () => {
      securityServiceMock.get.mockRejectedValue(new Error("Failed"));

      await expect(handler.execute(command)).rejects.toThrow(ForcedTransferCommandError);
    });
  });
});
