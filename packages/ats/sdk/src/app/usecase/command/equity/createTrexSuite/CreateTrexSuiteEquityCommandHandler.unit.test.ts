// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CreateTrexSuiteEquityCommandHandler } from "./CreateTrexSuiteEquityCommandHandler";
import { CreateTrexSuiteEquityCommand, CreateTrexSuiteEquityCommandResponse } from "./CreateTrexSuiteEquityCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  HederaIdZeroAddressFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { CreateTrexSuiteEquityCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { ErrorCode } from "@core/error/BaseError";
import { CreateTrexSuiteEquityCommandError } from "./error/CreateTrexSuiteEquityError";
import ValidationService from "@service/validation/ValidationService";

describe("CreateTrexSuiteEquityCommandHandler", () => {
  let handler: CreateTrexSuiteEquityCommandHandler;
  let command: CreateTrexSuiteEquityCommand;

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
  const hederaId = HederaIdPropsFixture.create().value;
  const hederaIdZeroAddress = HederaIdZeroAddressFixture.create().address;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateTrexSuiteEquityCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      mirrorNodeAdapterMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = CreateTrexSuiteEquityCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateTrexSuiteEquityCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateTrexSuiteEquityCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating the trex suite equity: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully create an equity with equityAddress in response", async () => {
        contractServiceMock.getContractEvmAddress
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress)
          .mockResolvedValueOnce(evmAddress);
        contractServiceMock.getEvmAddressesFromHederaIds
          .mockResolvedValueOnce([externalPauseEvmAddress])
          .mockResolvedValueOnce([externalControlEvmAddress])
          .mockResolvedValueOnce([externalKycEvmAddress]);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().createTrexSuiteEquity.mockResolvedValue({
          id: transactionId,
          response: { _token: evmAddress.value },
        });

        validationServiceMock.checkTrexTokenSaltExists.mockResolvedValue();

        mirrorNodeAdapterMock.getHederaIdfromContractAddress.mockResolvedValue(hederaId);

        transactionServiceMock.getTransactionResult.mockResolvedValue(evmAddress.value);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateTrexSuiteEquityCommandResponse);
        expect(result.securityId.value).toBe(hederaId);
        expect(result.transactionId).toBe(transactionId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(4);
        expect(contractServiceMock.getEvmAddressesFromHederaIds).toHaveBeenCalledTimes(3);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createTrexSuiteEquity).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getHederaIdfromContractAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createTrexSuiteEquity).toHaveBeenCalledWith(
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
            votingRight: command.votingRight,
            informationRight: command.informationRight,
            liquidationRight: command.liquidationRight,
            subscriptionRight: command.subscriptionRight,
            conversionRight: command.conversionRight,
            redemptionRight: command.redemptionRight,
            putRight: command.putRight,
            dividendRight: command.dividendRight,
            currency: command.currency,
            nominalValue: BigDecimal.fromString(command.nominalValue),
          }),
          evmAddress,
          evmAddress,
          command.configId,
          command.configVersion,
          evmAddress,
          evmAddress,
          evmAddress,
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
            className: CreateTrexSuiteEquityCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
      });

      it("should handle error and return fallback response if response code is 1", async () => {
        mirrorNodeAdapterMock.getContractInfo.mockResolvedValue({
          id: hederaId,
          evmAddress: evmAddress.value,
        });

        transactionServiceMock.getHandler().createTrexSuiteEquity.mockResolvedValue({
          id: transactionId,
          response: 1,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateTrexSuiteEquityCommandResponse);
        expect(result.securityId.toString()).toBe(hederaIdZeroAddress);
        expect(result.transactionId.toString()).toBe(transactionId);
      });
    });
  });
});
