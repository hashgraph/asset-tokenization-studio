// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { GetAccountBalanceQueryHandler } from "./GetAccountBalanceQueryHandler";
import { GetAccountBalanceQuery, GetAccountBalanceQueryResponse } from "./GetAccountBalanceQuery";
import AccountService from "@service/account/AccountService";
import { GetAccountBalanceQueryFixture } from "@test/fixtures/account/AccountFixture";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { GetAccountBalanceQueryError } from "./error/GetAccountBalanceQueryError";
import { ErrorCode } from "@core/error/BaseError";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { Security } from "@domain/context/security/Security";

import BigDecimal from "@domain/context/shared/BigDecimal";

describe("GetAccountBalanceQueryHandler", () => {
  let handler: GetAccountBalanceQueryHandler;
  let query: GetAccountBalanceQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;
  const balanceOf = BigInt(1);

  beforeEach(() => {
    handler = new GetAccountBalanceQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetAccountBalanceQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAccountBalanceQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAccountBalanceQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying user balance: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get account balance", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      queryAdapterServiceMock.balanceOf.mockResolvedValue(balanceOf);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAccountBalanceQueryResponse);
      expect(result.payload).toStrictEqual(BigDecimal.fromStringFixed(balanceOf.toString(), security.decimals));
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.balanceOf).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.balanceOf).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
