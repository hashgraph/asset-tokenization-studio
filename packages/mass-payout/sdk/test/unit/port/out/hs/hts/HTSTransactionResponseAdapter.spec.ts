// SPDX-License-Identifier: Apache-2.0

import { AccountId, Client, Timestamp, TransactionReceipt, TransactionRecord, TransactionId } from "@hiero-ledger/sdk";
import TransactionResponse from "@domain/transaction/TransactionResponse";
import { TransactionResponseError } from "@port/out/error/TransactionResponseError";
import { TransactionType } from "@port/out/TransactionResponseEnums";
import { HTSTransactionResponseAdapter } from "@port/out/hs/hts/HTSTransactionResponseAdapter";
import { HederaIdPropsFixture } from "../../../../../fixture/DataFixture";

describe("HTSTransactionResponseAdapter", () => {
  let mockClient: jest.Mocked<Client>;
  let mockTransactionResponse: any;
  const accountId = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    mockClient = {} as any;
    mockTransactionResponse = {
      transactionId: new TransactionId(AccountId.fromString(accountId), new Timestamp(1695936000, 0)),
      getReceipt: jest.fn(),
      getRecord: jest.fn(),
    };
  });

  describe("manageResponse", () => {
    it("should return TransactionResponse for RECEIPT type", async () => {
      const mockReceipt = {} as TransactionReceipt;
      mockTransactionResponse.getReceipt.mockResolvedValue(mockReceipt);

      const result = await HTSTransactionResponseAdapter.manageResponse(
        "testnet",
        mockTransactionResponse,
        TransactionType.RECEIPT,
        mockClient,
      );

      expect(mockTransactionResponse.getReceipt).toHaveBeenCalledWith(mockClient);
      expect(result).toBeInstanceOf(TransactionResponse);
      expect(result.id).toContain(accountId);
    });

    it("should return TransactionResponse for RECORD type with TransactionRecord", async () => {
      const mockRecord: any = {
        transactionId: new TransactionId(AccountId.fromString(accountId), new Timestamp(1695936000, 0)),
        receipt: {} as TransactionReceipt,
        contractFunctionResult: { bytes: new Uint8Array([1, 2, 3]) },
      };
      Object.setPrototypeOf(mockRecord, (TransactionRecord as any).prototype);

      jest
        .spyOn(HTSTransactionResponseAdapter as any, "decodeFunctionResult")
        .mockReturnValue(new Uint8Array([9, 9, 9]));

      mockTransactionResponse.getRecord.mockResolvedValue(mockRecord);

      const result = await HTSTransactionResponseAdapter.manageResponse(
        "testnet",
        mockTransactionResponse,
        TransactionType.RECORD,
        mockClient,
        "someFunction",
        [],
      );

      expect(mockTransactionResponse.getRecord).toHaveBeenCalledWith(mockClient);
      expect(result).toBeInstanceOf(TransactionResponse);
      expect(result.id).toContain(accountId);
    });

    it("should return TransactionResponse for RECORD type with Uint32Array", async () => {
      const mockUint32 = new Uint32Array([100, 200, 300]);

      jest
        .spyOn(HTSTransactionResponseAdapter as any, "decodeFunctionResult")
        .mockReturnValue(new Uint8Array([7, 7, 7]));

      mockTransactionResponse.getRecord.mockResolvedValue(mockUint32);

      const result = await HTSTransactionResponseAdapter.manageResponse(
        "testnet",
        mockTransactionResponse,
        TransactionType.RECORD,
        mockClient,
        "someFunction",
        [],
      );

      expect(result).toBeInstanceOf(TransactionResponse);
      expect(result.id).toBe("");
    });

    it("should throw TransactionResponseError for RECORD type with invalid response", async () => {
      const mockRecord = {
        transactionId: new TransactionId(
          AccountId.fromString(HederaIdPropsFixture.create().value),
          new Timestamp(1695936000, 0),
        ),
        receipt: {} as TransactionReceipt,
        contractFunctionResult: {},
      } as TransactionRecord;

      mockTransactionResponse.getRecord.mockResolvedValue(mockRecord);

      await expect(
        HTSTransactionResponseAdapter.manageResponse(
          "testnet",
          mockTransactionResponse,
          TransactionType.RECORD,
          mockClient,
          "someFunction",
          [],
        ),
      ).rejects.toThrow(TransactionResponseError);
    });

    it("should throw TransactionResponseError for invalid responseType", async () => {
      await expect(
        HTSTransactionResponseAdapter.manageResponse(
          "testnet",
          mockTransactionResponse,
          "INVALID" as unknown as TransactionType,
          mockClient,
        ),
      ).rejects.toThrow("The response type is neither RECORD nor RECEIPT.");
    });
  });
});
