// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetFrozenPartialTokensQuery, GetFrozenPartialTokensQueryResponse } from "./GetFrozenPartialTokensQuery";
import { GetFrozenPartialTokensQueryHandler } from "./GetFrozenPartialTokensQueryHandler";

import { GetFrozenPartialTokensQueryError } from "./error/GetFrozenPartialTokensQueryError";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetFrozenPartialTokensQueryFixture } from "@test/fixtures/freeze/FreezeFixture";

describe("GetFrozenPartialTokensQueryHandler", () => {
  let handler: GetFrozenPartialTokensQueryHandler;
  let query: GetFrozenPartialTokensQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new GetFrozenPartialTokensQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetFrozenPartialTokensQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetFrozenPartialTokensQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetFrozenPartialTokensQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying frozen partial tokens: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get hold count for by partition", async () => {
      const amount = 1;
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      securityServiceMock.get.mockResolvedValue(security);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getFrozenPartialTokens.mockResolvedValueOnce(amount);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetFrozenPartialTokensQueryResponse);
      expect(result.payload).toStrictEqual(BigDecimal.fromStringFixed(amount.toString(), security.decimals));
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getFrozenPartialTokens).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
