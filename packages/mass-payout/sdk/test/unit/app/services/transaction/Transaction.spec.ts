// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@app/services/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import TransactionAdapter from "@port/out/TransactionAdapter";
import TransactionHandlerRegistration from "@core/TransactionHandlerRegistration";
import { SupportedWallets } from "@domain/network/Wallet";
import { EmptyResponse } from "@app/services/transaction/error/EmptyResponse";
import { WalletNotSupported } from "@app/services/transaction/error/WalletNotSupported";
import { InvalidResponse } from "@core/error/InvalidResponse";
import { HederaIdPropsFixture } from "../../../../fixture/DataFixture";

jest.mock("@core/TransactionHandlerRegistration");

describe("TransactionService", () => {
  let service: TransactionService;
  let mirrorNodeAdapter: jest.Mocked<MirrorNodeAdapter>;
  let dfnsAdapter: jest.Mocked<DFNSTransactionAdapter>;

  beforeEach(() => {
    mirrorNodeAdapter = {
      getContractResults: jest.fn(),
    } as any;

    dfnsAdapter = {} as any;

    service = new TransactionService(mirrorNodeAdapter, dfnsAdapter);
  });

  describe("getHandler / setHandler", () => {
    it("should return handler from TransactionHandlerRegistration", () => {
      const mockHandler = {} as TransactionAdapter;
      (TransactionHandlerRegistration.resolveTransactionHandler as jest.Mock).mockReturnValue(mockHandler);

      const result = service.getHandler();
      expect(result).toBe(mockHandler);
    });

    it("should register handler and return it", () => {
      const mockHandler = {} as TransactionAdapter;
      const registerSpy = TransactionHandlerRegistration.registerTransactionHandler as jest.Mock;

      const result = service.setHandler(mockHandler);

      expect(registerSpy).toHaveBeenCalledWith(mockHandler);
      expect(result).toBe(mockHandler);
    });
  });

  describe("getHandlerClass", () => {
    it("should return dfnsAdapter when SupportedWallets.DFNS", () => {
      expect(service.getHandlerClass(SupportedWallets.DFNS)).toBe(dfnsAdapter);
    });

    it("should throw WalletNotSupported when unknown wallet type", () => {
      expect(() => service.getHandlerClass("Unknown" as any)).toThrow(WalletNotSupported);
    });
  });

  describe("getTransactionResult", () => {
    const hederaId = HederaIdPropsFixture.create().value;
    const baseResponse = { id: hederaId };

    it("should throw EmptyResponse when id is missing", async () => {
      await expect(
        service.getTransactionResult({
          res: {} as any,
          className: "TestClass",
          position: 0,
          numberOfResultsItems: 1,
        }),
      ).rejects.toThrow(EmptyResponse);
    });

    it("should return result immediately if provided", async () => {
      const mockResult = { some: "value" };
      const result = await service.getTransactionResult({
        res: baseResponse as any,
        result: mockResult as any,
        className: "TestClass",
        position: 0,
        numberOfResultsItems: 1,
      });

      expect(result).toBe(mockResult);
    });

    it("should call mirrorNodeAdapter.getContractResults without contractCreation", async () => {
      mirrorNodeAdapter.getContractResults.mockResolvedValue(["1", "2", "3"]);

      const result = await service.getTransactionResult({
        res: baseResponse as any,
        className: "TestClass",
        position: 1,
        numberOfResultsItems: 3,
      });

      expect(mirrorNodeAdapter.getContractResults).toHaveBeenCalledWith(hederaId, 3);
      expect(result).toBe("2");
    });

    it("should call mirrorNodeAdapter.getContractResults with contractCreation flag", async () => {
      mirrorNodeAdapter.getContractResults.mockResolvedValue(["10"]);

      await service.getTransactionResult({
        res: baseResponse as any,
        className: "TestClass",
        position: 0,
        numberOfResultsItems: 1,
        isContractCreation: true,
      });

      expect(mirrorNodeAdapter.getContractResults).toHaveBeenCalledWith(hederaId, 1, true);
    });

    it("should throw InvalidResponse if results missing or wrong length", async () => {
      mirrorNodeAdapter.getContractResults.mockResolvedValue(["1", "2"]); // wrong length

      await expect(
        service.getTransactionResult({
          res: baseResponse as any,
          className: "TestClass",
          position: 0,
          numberOfResultsItems: 3,
        }),
      ).rejects.toThrow(InvalidResponse);
    });
  });
});
