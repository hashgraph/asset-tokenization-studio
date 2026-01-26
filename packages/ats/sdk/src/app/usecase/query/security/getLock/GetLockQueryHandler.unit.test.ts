// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { GetLockQueryHandler } from "./GetLockQueryHandler";
import { GetLockQuery, GetLockQueryResponse } from "./GetLockQuery";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { GetLockQueryFixture } from "@test/fixtures/lock/LockFixture";
import { GetLockQueryError } from "./error/GetLockQueryError";
import { BigNumber } from "ethers";
import { Lock } from "@domain/context/security/Lock";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("GetLockQueryHandler", () => {
  let handler: GetLockQueryHandler;
  let query: GetLockQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;
  const lock: [BigNumber, BigNumber] = [BigNumber.from(1), BigNumber.from(1)];

  beforeEach(() => {
    handler = new GetLockQueryHandler(
      securityServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
    );
    query = GetLockQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetLockQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetLockQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying lock: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get lock info", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getLock.mockResolvedValueOnce(lock);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetLockQueryResponse);

      const expectedResult = new Lock(
        query.id,
        BigDecimal.fromStringFixed(lock[0].toString(), security.decimals),
        lock[1],
      );

      expect(result.payload).toStrictEqual(expectedResult);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getLock).toHaveBeenCalledWith(evmAddress, targetEvmAddress, query.id);
    });
  });
});
