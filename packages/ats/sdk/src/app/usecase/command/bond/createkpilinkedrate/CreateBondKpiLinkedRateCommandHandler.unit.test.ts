// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { CreateBondKpiLinkedRateCommandHandler } from "./CreateBondKpiLinkedRateCommandHandler";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { CreateBondKpiLinkedRateCommandFixture } from "@test/fixtures/bond/BondKpiLinkedRateFixture";
import {
  CreateBondKpiLinkedRateCommand,
  CreateBondKpiLinkedRateCommandResponse,
} from "./CreateBondKpiLinkedRateCommand";
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
import { CreateBondKpiLinkedRateCommandError } from "./error/CreateBondKpiLinkedRateCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("CreateBondKpiLinkedRateCommandHandler", () => {
  let handler: CreateBondKpiLinkedRateCommandHandler;
  let command: CreateBondKpiLinkedRateCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalPauseEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalControlEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalKycEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const hederaId = HederaIdPropsFixture.create();
  const hederaIdZeroAddress = HederaIdZeroAddressFixture.create().address;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CreateBondKpiLinkedRateCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      mirrorNodeAdapterMock,
      contractServiceMock,
    );
    command = CreateBondKpiLinkedRateCommandFixture.create();
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
          message: expect.stringContaining(
            `An error occurred while creating the bond kpi linked rate: Factory not found in request`,
          ),
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
            `An error occurred while creating the bond kpi linked rate: Resolver not found in request`,
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
            `An error occurred while creating the bond kpi linked rate: Config Id not found in request`,
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
            `An error occurred while creating the bond kpi linked rate: Config Version not found in request`,
          ),
          errorCode: ErrorCode.InvalidRequest,
        });
      });

      it("throws CreateBondKpiLinkedRateCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateBondKpiLinkedRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating the bond kpi linked rate: ${errorMsg}`),
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
          .mockResolvedValueOnce([externalKycEvmAddress]);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress).mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().createBondKpiLinkedRate.mockResolvedValue({
          id: transactionId,
          response: { bondAddress: evmAddress.value },
        });

        mirrorNodeAdapterMock.getHederaIdfromContractAddress.mockResolvedValue(transactionId);

        transactionServiceMock.getTransactionResult.mockResolvedValue(evmAddress.value);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateBondKpiLinkedRateCommandResponse);
        expect(result.securityId.value).toBe(transactionId);
        expect(result.transactionId).toBe(transactionId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(4);
        expect(contractServiceMock.getEvmAddressesFromHederaIds).toHaveBeenCalledTimes(3);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(transactionServiceMock.getHandler().createBondKpiLinkedRate).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(mirrorNodeAdapterMock.getHederaIdfromContractAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().createBondKpiLinkedRate).toHaveBeenCalledWith(
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
          [externalPauseEvmAddress],
          [externalControlEvmAddress],
          [externalKycEvmAddress],
          evmAddress,
          [evmAddress],
          command.proceedRecipientsData,
          command.factory?.toString(),
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: {
              id: transactionId,
              response: { bondAddress: evmAddress.value },
            },
            result: evmAddress.value,
            className: CreateBondKpiLinkedRateCommandHandler.name,
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

        transactionServiceMock.getHandler().createBondKpiLinkedRate.mockResolvedValue({
          id: transactionId,
          response: 1,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateBondKpiLinkedRateCommandResponse);
        expect(result.securityId.toString()).toBe(hederaIdZeroAddress);
        expect(result.transactionId.toString()).toBe(transactionId);
      });
    });
  });
});
