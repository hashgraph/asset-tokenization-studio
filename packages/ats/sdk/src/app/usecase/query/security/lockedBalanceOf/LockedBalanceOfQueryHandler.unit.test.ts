// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { LockedBalanceOfQueryFixture } from "@test/fixtures/lock/LockFixture";
import { LockedBalanceOfQueryHandler } from "./LockedBalanceOfQueryHandler";
import { LockedBalanceOfQuery, LockedBalanceOfQueryResponse } from "./LockedBalanceOfQuery";
import SecurityService from "@service/security/SecurityService";
import { LockedBalanceOfQueryError } from "./error/LockedBalanceOfQueryError";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { BigNumber } from "ethers";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("LockedBalanceOfQueryHandler", () => {
  let handler: LockedBalanceOfQueryHandler;
  let query: LockedBalanceOfQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;
  const amount = BigNumber.from(1);

  beforeEach(() => {
    handler = new LockedBalanceOfQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = LockedBalanceOfQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws LockedBalanceOfQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(LockedBalanceOfQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying locked balance: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get lock count", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getLockedBalanceOf.mockResolvedValueOnce(amount);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(LockedBalanceOfQueryResponse);

      expect(result.payload).toStrictEqual(BigDecimal.fromStringFixed(amount.toString(), security.decimals));
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getLockedBalanceOf).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
