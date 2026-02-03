// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import SecurityService from "@service/security/SecurityService";
import ValidationService from "@service/validation/ValidationService";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";

import { EvmAddressPropsFixture, HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import Account from "@domain/context/account/Account";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { MintCommandHandler } from "./MintCommandHandler";
import { MintCommand, MintCommandResponse } from "./MintCommand";
import { MintCommandError } from "./error/MintCommandError";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { MintCommandFixture } from "@test/fixtures/mint/MintFixture";
import { KycStatus } from "@domain/context/kyc/Kyc";

describe("MintCommandHandler", () => {
  let handler: MintCommandHandler;
  let command: MintCommand;

  const securityServiceMock = createMock<SecurityService>();
  const accountServiceMock = createMock<AccountService>();
  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });

  const security: Security = {
    decimals: 6,
  } as unknown as Security;

  const securityEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    handler = new MintCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = MintCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully mint tokens", async () => {
      const handlerMock = createMock<TransactionAdapter>();
      handlerMock.mint.mockResolvedValue({ id: transactionId });
      transactionServiceMock.getHandler.mockReturnValue(handlerMock);

      securityServiceMock.get.mockResolvedValue(security);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(securityEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(MintCommandResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      const amountBd = BigDecimal.fromString(command.amount, security.decimals);

      expect(securityServiceMock.get).toHaveBeenCalledWith(command.securityId);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalled();
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);
      expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
      expect(validationServiceMock.checkMaxSupply).toHaveBeenCalledWith(command.securityId, amountBd, security);
      expect(validationServiceMock.checkControlList).toHaveBeenCalledWith(command.securityId, command.targetId);
      expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledWith(
        command.securityId,
        [command.targetId],
        KycStatus.GRANTED,
      );
      expect(validationServiceMock.checkAnyRole).toHaveBeenCalledWith(
        [SecurityRole._ISSUER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        command.securityId,
      );
      expect(validationServiceMock.checkMultiPartition).toHaveBeenCalledWith(security);
      expect(validationServiceMock.checkIssuable).toHaveBeenCalledWith(security);
      expect(handlerMock.mint).toHaveBeenCalledWith(securityEvmAddress, targetEvmAddress, amountBd, command.securityId);
    });

    it("should throw MintCommandError on failure", async () => {
      securityServiceMock.get.mockRejectedValue(new Error("fail"));

      await expect(handler.execute(command)).rejects.toThrow(MintCommandError);
    });
  });
});
