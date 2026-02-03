// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { CreateTrexSuiteBondCommandHandler } from "./CreateTrexSuiteBondCommandHandler";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { CreateTrexSuiteBondCommandFixture } from "@test/fixtures/bond/BondFixture";
import { CreateTrexSuiteBondCommand, CreateTrexSuiteBondCommandResponse } from "./CreateTrexSuiteBondCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  HederaIdZeroAddressFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorCode } from "@core/error/BaseError";
import { CreateTrexSuiteBondCommandError } from "./error/CreateTrexSuiteBondError";
import ValidationService from "@service/validation/ValidationService";

describe("CreateTrexSuiteBondCommandHandler", () => {
  let handler: CreateTrexSuiteBondCommandHandler;
  let command: CreateTrexSuiteBondCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const validationServiceMock = createMock<ValidationService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalPauseEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalControlEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalKycEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const hederaId = HederaIdPropsFixture.create();
  const hederaIdZeroAddress = HederaIdZeroAddressFixture.create().address;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateTrexSuiteBondCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      mirrorNodeAdapterMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = CreateTrexSuiteBondCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateTrexSuiteBondCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateTrexSuiteBondCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating the trex suite bond: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully create a bond with bondAddress in response", async () => {
        contractServiceMock.getContractEvmAddress
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress);
        contractServiceMock.getEvmAddressesFromHederaIds
          .mockResolvedValueOnce([externalPauseEvmAddress])
          .mockResolvedValueOnce([externalControlEvmAddress])
          .mockResolvedValueOnce([externalKycEvmAddress])
          .mockResolvedValueOnce([evmAddress]); // proceedRecipients
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().createTrexSuiteBond.mockResolvedValue({
          id: transactionId,
          response: { _token: evmAddress.value },
        });

        validationServiceMock.checkTrexTokenSaltExists.mockResolvedValue();
        mirrorNodeAdapterMock.getHederaIdfromContractAddress.mockResolvedValue(transactionId);

        transactionServiceMock.getTransactionResult.mockResolvedValue(evmAddress.value);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateTrexSuiteBondCommandResponse);
        expect(result.securityId.value).toBe(transactionId);
        expect(result.transactionId).toBe(transactionId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(4);
        expect(contractServiceMock.getEvmAddressesFromHederaIds).toHaveBeenCalledTimes(3);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(transactionServiceMock.getHandler().createTrexSuiteBond).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getHederaIdfromContractAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createTrexSuiteBond).toHaveBeenCalledWith(
          command.salt,
          command.owner,
          command.irs,
          command.onchainId,
          command.irAgents,
          command.tokenAgents,
          command.compliancesModules,
          command.complianceSettings,
          command.claimTopics,
          command.issuers,
          command.issuerClaims,
          expect.objectContaining(command.security),
          expect.objectContaining({
            currency: command.currency,
            nominalValue: BigDecimal.fromString(command.nominalValue),
            startingDate: parseInt(command.startingDate),
            maturityDate: parseInt(command.maturityDate),
          }),
          evmAddress,
          evmAddress,
          command.configId,
          command.configVersion,
          evmAddress,
          evmAddress,
          evmAddress,
          [evmAddress],
          command.proceedRecipientsData,
          [externalPauseEvmAddress],
          [externalControlEvmAddress],
          [externalKycEvmAddress],
          command.factory?.toString(),
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: {
              id: transactionId,
              response: { _token: evmAddress.value },
            },
            result: evmAddress.value,
            className: CreateTrexSuiteBondCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
      });

      it("should handle error and return fallback response if response code is 1", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        mirrorNodeAdapterMock.getContractInfo.mockResolvedValue({
          id: hederaId.value,
          evmAddress: evmAddress.value,
        });

        transactionServiceMock.getHandler().createTrexSuiteBond.mockResolvedValue({
          id: transactionId,
          response: 1,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateTrexSuiteBondCommandResponse);
        expect(result.securityId.toString()).toBe(hederaIdZeroAddress);
        expect(result.transactionId.toString()).toBe(transactionId);
      });
    });
  });
});
