// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CreateEquityCommandHandler } from "./CreateEquityCommandHandler";
import { CreateEquityCommand, CreateEquityCommandResponse } from "./CreateEquityCommand";
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
import { CreateEquityCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { ErrorCode } from "@core/error/BaseError";
import { CreateEquityCommandError } from "./error/CreateEquityCommandError";

describe("CreateEquityCommandHandler", () => {
  let handler: CreateEquityCommandHandler;
  let command: CreateEquityCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalPauseEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalControlEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalKycEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const hederaId = HederaIdPropsFixture.create().value;
  const hederaIdZeroAddress = HederaIdZeroAddressFixture.create().address;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateEquityCommandHandler(
      transactionServiceMock,
      mirrorNodeAdapterMock,
      contractServiceMock,
      accountServiceMock,
    );
    command = CreateEquityCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("execute", () => {
    describe("error cases", () => {
      it("should throw InvalidRequest if factory is not provided", async () => {
        const commandWithNotFactory = {
          ...command,
          factory: undefined,
        };

        const resultPromise = handler.execute(commandWithNotFactory);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating the equity: Factory not found in request`),
          errorCode: ErrorCode.InvalidRequest,
        });
      });

      it("should throw InvalidRequest if resolver is not provided", async () => {
        const commandWithNotResolver = {
          ...command,
          resolver: undefined,
        };

        const resultPromise = handler.execute(commandWithNotResolver);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while creating the equity: Resolver not found in request`,
          ),
          errorCode: ErrorCode.InvalidRequest,
        });
      });

      it("should throw InvalidRequest if configId is not provided", async () => {
        const commandWithNotConfigId = {
          ...command,
          configId: undefined,
        };

        const resultPromise = handler.execute(commandWithNotConfigId);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while creating the equity: Config Id not found in request`,
          ),
          errorCode: ErrorCode.InvalidRequest,
        });
      });

      it("should throw InvalidRequest if configVersion is not provided", async () => {
        const commandWithNotConfigVersion = {
          ...command,
          configVersion: undefined,
        };

        const resultPromise = handler.execute(commandWithNotConfigVersion);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while creating the equity: Config Version not found in request`,
          ),
          errorCode: ErrorCode.InvalidRequest,
        });
      });
      it("throws CreateEquityCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateEquityCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating the equity: ${errorMsg}`),
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

        transactionServiceMock.getHandler().createEquity.mockResolvedValue({
          id: transactionId,
          response: { equityAddress: evmAddress.value },
        });

        mirrorNodeAdapterMock.getHederaIdfromContractAddress.mockResolvedValue(hederaId);

        transactionServiceMock.getTransactionResult.mockResolvedValue(evmAddress.value);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateEquityCommandResponse);
        expect(result.securityId.value).toBe(hederaId);
        expect(result.transactionId).toBe(transactionId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(4);
        expect(contractServiceMock.getEvmAddressesFromHederaIds).toHaveBeenCalledTimes(3);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createEquity).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getHederaIdfromContractAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createEquity).toHaveBeenCalledWith(
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
          [externalPauseEvmAddress],
          [externalControlEvmAddress],
          [externalKycEvmAddress],
          evmAddress,
          command.factory?.toString(),
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: {
              id: transactionId,
              response: { equityAddress: evmAddress.value },
            },
            result: evmAddress.value,
            className: CreateEquityCommandHandler.name,
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

        transactionServiceMock.getHandler().createEquity.mockResolvedValue({
          id: transactionId,
          response: 1,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateEquityCommandResponse);
        expect(result.securityId.toString()).toBe(hederaIdZeroAddress);
        expect(result.transactionId.toString()).toBe(transactionId);
      });
    });
  });
});
