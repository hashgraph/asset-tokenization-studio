// SPDX-License-Identifier: Apache-2.0

import { QueryBus } from "@core/query/QueryBus";
import Account from "@domain/context/account/Account";
import { HEDERA_FORMAT_ID_REGEX, HederaId } from "@domain/context/shared/HederaId";
import { GetAccountInfoQuery } from "@query/account/info/GetAccountInfoQuery";
import AccountService from "./AccountService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { EVM_ZERO_ADDRESS } from "@core/Constants";
import Injectable from "@core/injectable/Injectable";
import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import NetworkService from "@service/network/NetworkService";
import TransactionService from "@service/transaction/TransactionService";

describe("AccountService", () => {
  let service: AccountService;

  const queryBusMock = createMock<QueryBus>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const transactionServiceMock = createMock<TransactionService>();
  const networkServiceMock = createMock<NetworkService>();

  const account = new Account({
    id: new HederaId(HederaIdPropsFixture.create().value).toString(),
  });
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const accountId = account.id.toString();

  beforeEach(() => {
    service = new AccountService(networkServiceMock, transactionServiceMock, mirrorNodeAdapterMock);
    jest.spyOn(Injectable, "resolve").mockReturnValue(queryBusMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("getCurrentAccount", () => {
    it("should return the current account from TransactionService", () => {
      transactionServiceMock.getHandler().getAccount.mockReturnValue(account);

      const result = service.getCurrentAccount();

      expect(Injectable.resolve).toHaveBeenCalledWith(QueryBus);
      expect(transactionServiceMock.getHandler).toHaveBeenCalled();
      expect(transactionServiceMock.getHandler().getAccount).toHaveBeenCalled();
      expect(result).toBe(account);
    });
  });

  describe("getAccountInfo", () => {
    it("should return account info for a valid HederaId", async () => {
      queryBusMock.execute.mockResolvedValue({ account: account });

      const result = await service.getAccountInfo(HederaId.from(accountId));

      expect(Injectable.resolve).toHaveBeenCalledWith(QueryBus);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetAccountInfoQuery(HederaId.from(accountId)));
      expect(result).toBe(account);
    });

    it("should return account info for a valid string ID", async () => {
      queryBusMock.execute.mockResolvedValue({ account: account });

      const result = await service.getAccountInfo(accountId);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetAccountInfoQuery(accountId));
      expect(result).toBe(account);
    });
  });

  describe("getAccountEvmAddress", () => {
    it("should return EvmAddress for valid Hedera ID format", async () => {
      jest.spyOn(HEDERA_FORMAT_ID_REGEX, "test");
      mirrorNodeAdapterMock.accountToEvmAddress.mockResolvedValue(evmAddress);

      const result = await service.getAccountEvmAddress(accountId);

      expect(HEDERA_FORMAT_ID_REGEX.test).toHaveBeenCalledWith(accountId);
      expect(mirrorNodeAdapterMock.accountToEvmAddress).toHaveBeenCalledWith(accountId);
      expect(result).toBe(evmAddress);
    });

    it("should return EvmAddress for non-Hedera ID format", async () => {
      const accountId = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
      const mockEvmAddress = new EvmAddress(accountId);
      jest.spyOn(HEDERA_FORMAT_ID_REGEX, "test");

      const result = await service.getAccountEvmAddress(accountId);

      expect(HEDERA_FORMAT_ID_REGEX.test).toHaveBeenCalledWith(accountId);
      expect(mirrorNodeAdapterMock.accountToEvmAddress).not.toHaveBeenCalled();
      expect(result).toEqual(mockEvmAddress);
    });
  });

  describe("getAccountEvmAddressOrNull", () => {
    it("should return zero address for accountId 0.0.0", async () => {
      const accountId = "0.0.0";
      const zeroAddress = new EvmAddress(EVM_ZERO_ADDRESS);

      const result = await service.getAccountEvmAddressOrNull(accountId);

      expect(result).toEqual(zeroAddress);
      expect(mirrorNodeAdapterMock.accountToEvmAddress).not.toHaveBeenCalled();
    });

    it("should call getAccountEvmAddress for non-zero accountId", async () => {
      mirrorNodeAdapterMock.accountToEvmAddress.mockResolvedValue(evmAddress);
      jest.spyOn(HEDERA_FORMAT_ID_REGEX, "test");
      const result = await service.getAccountEvmAddressOrNull(accountId);

      expect(HEDERA_FORMAT_ID_REGEX.test).toHaveBeenCalledWith(accountId);
      expect(mirrorNodeAdapterMock.accountToEvmAddress).toHaveBeenCalledWith(accountId);
      expect(result).toBe(evmAddress);
    });
  });
});
