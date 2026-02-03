// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { BurnCommandHandler } from "./BurnCommandHandler";
import { BurnCommand, BurnCommandResponse } from "./BurnCommand";
import SecurityService from "@service/security/SecurityService";
import ValidationService from "@service/validation/ValidationService";
import { BurnCommandFixture } from "@test/fixtures/burn/BurnFixture";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";

import { EvmAddressPropsFixture, HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import Account from "@domain/context/account/Account";
import { Security } from "@domain/context/security/Security";
import { _PARTITION_ID_1 } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { BurnCommandError } from "./error/BurnCommandError";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { SecurityRole } from "@domain/context/security/SecurityRole";

describe("BurnCommandHandler", () => {
  let handler: BurnCommandHandler;
  let command: BurnCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const securityEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const sourceEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const security: Security = {
    decimals: 6,
  } as unknown as Security;

  beforeEach(() => {
    handler = new BurnCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = BurnCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully burn tokens", async () => {
      const handlerMock = createMock<TransactionAdapter>();
      handlerMock.burn.mockResolvedValue({ id: transactionId });
      transactionServiceMock.getHandler.mockReturnValue(handlerMock);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(securityEvmAddress);
      validationServiceMock.checkClearingDeactivated.mockResolvedValue(undefined);
      validationServiceMock.checkCanRedeem.mockResolvedValue(undefined);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(sourceEvmAddress);
      securityServiceMock.get.mockResolvedValueOnce(security);
      validationServiceMock.checkDecimals.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(BurnCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(transactionServiceMock.getHandler).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledWith(
        command.securityId,
        command.sourceId,
        command.amount,
        _PARTITION_ID_1,
      );
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.sourceId);
      expect(securityServiceMock.get).toHaveBeenCalledWith(command.securityId);
      expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
      expect(validationServiceMock.checkAnyRole).toHaveBeenCalledWith(
        [SecurityRole._CONTROLLER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        command.securityId,
      );

      const expectedAmountBd = BigDecimal.fromString(command.amount, security.decimals);
      expect(handlerMock.burn).toHaveBeenCalledWith(
        sourceEvmAddress,
        securityEvmAddress,
        expectedAmountBd,
        command.securityId,
      );
    });

    it("should throw BurnCommandError if any error occurs", async () => {
      const error = new Error("Something went wrong");
      validationServiceMock.checkClearingDeactivated.mockRejectedValueOnce(error);

      await expect(handler.execute(command)).rejects.toThrow(BurnCommandError);
    });
  });
});
