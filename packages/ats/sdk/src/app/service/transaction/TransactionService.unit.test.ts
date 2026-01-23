// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { createMock } from "@golevelup/ts-jest";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionService from "./TransactionService";
import { SetCouponCommandHandler } from "@command/bond/coupon/set/SetCouponCommandHandler";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { EmptyResponse } from "./error/EmptyResponse";
import { TransactionResponseFixture } from "@test/fixtures/shared/DataFixture";
import { InvalidResponse } from "@core/error/InvalidResponse";
import { faker } from "@faker-js/faker/.";
import { CreateEquityCommandHandler } from "@command/equity/create/CreateEquityCommandHandler";
import { CreateBondCommandHandler } from "@command/bond/create/CreateBondCommandHandler";
import { ADDRESS_LENGTH, BYTES_32_LENGTH } from "@core/Constants";

describe("TransactioNService", () => {
  let service: TransactionService;
  const position = 1;
  const numberOfResultsItems = 2;

  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const transactionResponse = TransactionResponseFixture.create();
  const result = faker.number.int({ min: 1, max: 999 }).toString();

  beforeEach(() => {
    jest.spyOn(Injectable, "resolve").mockReturnValue(mirrorNodeAdapterMock);
    service = new TransactionService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getTransactionResult", () => {
    describe("error cases", () => {
      it("should throw an error when transaction response id is missing", async () => {
        const response: TransactionResponse = {
          id: undefined,
        };
        await expect(
          service.getTransactionResult({
            res: response,
            className: SetCouponCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).rejects.toThrow(EmptyResponse);
      });
      it("should throw an error when transaction response is empty", async () => {
        mirrorNodeAdapterMock.getContractResults.mockResolvedValue(null);
        await expect(
          service.getTransactionResult({
            res: transactionResponse,
            className: SetCouponCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).rejects.toThrow(InvalidResponse);
      });
    });

    describe("success cases", () => {
      it("should retrieve transaction result from event data", async () => {
        await expect(
          service.getTransactionResult({
            res: transactionResponse,
            result,
            className: SetCouponCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).resolves.toBe(result);
      });
      it("should retrieve transaction result from mirror node", async () => {
        const results = ["1", result];
        mirrorNodeAdapterMock.getContractResults.mockResolvedValue(results);
        await expect(
          service.getTransactionResult({
            res: transactionResponse,
            className: SetCouponCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).resolves.toBe(results[position]);
        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledWith(
          transactionResponse.id,
          numberOfResultsItems,
        );
        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledTimes(1);
      });
      it("should retrieve transaction result for CreateEquityCommandHandler with formatted address", async () => {
        const rawResult = "0".repeat(BYTES_32_LENGTH - ADDRESS_LENGTH + 2) + "1234567890abcdef";
        const expectedResult = "0x1234567890abcdef";
        const results = ["1", rawResult];
        mirrorNodeAdapterMock.getContractResults.mockResolvedValue(results);

        await expect(
          service.getTransactionResult({
            res: transactionResponse,
            className: CreateEquityCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).resolves.toBe(expectedResult);

        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledWith(
          transactionResponse.id,
          numberOfResultsItems,
        );
        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledTimes(1);
      });

      it("should retrieve transaction result for CreateBondCommandHandler with formatted address", async () => {
        const rawResult = "0".repeat(BYTES_32_LENGTH - ADDRESS_LENGTH + 2) + "abcdef1234567890";
        const expectedResult = "0xabcdef1234567890";
        const results = ["1", rawResult];
        mirrorNodeAdapterMock.getContractResults.mockResolvedValue(results);

        await expect(
          service.getTransactionResult({
            res: transactionResponse,
            className: CreateBondCommandHandler.name,
            position,
            numberOfResultsItems,
          }),
        ).resolves.toBe(expectedResult);

        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledWith(
          transactionResponse.id,
          numberOfResultsItems,
        );
        expect(mirrorNodeAdapterMock.getContractResults).toHaveBeenCalledTimes(1);
      });
    });
  });
});
