// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetCouponHoldersQueryFixture } from "@test/fixtures/bond/BondFixture";
import { EvmAddressPropsFixture, AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetCouponHoldersQueryError } from "./error/GetCouponHoldersQueryError";
import { GetCouponHoldersQuery, GetCouponHoldersQueryResponse } from "./GetCouponHoldersQuery";
import { GetCouponHoldersQueryHandler } from "./GetCouponHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";

describe("GetCouponHoldersQueryHandler", () => {
  let handler: GetCouponHoldersQueryHandler;
  let query: GetCouponHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetCouponHoldersQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetCouponHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying coupon holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get coupon holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCouponHolders.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponHoldersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getCouponHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCouponHolders).toHaveBeenCalledWith(
        evmAddress,
        query.couponId,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
