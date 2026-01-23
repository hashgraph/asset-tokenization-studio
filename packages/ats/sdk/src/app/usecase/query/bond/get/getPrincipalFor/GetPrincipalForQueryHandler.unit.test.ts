// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetPrincipalForQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetPrincipalForQueryError } from "./error/GetPrincipalForQueryError";
import { GetPrincipalForQueryHandler } from "./GetPrincipalForQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetPrincipalForQuery, GetPrincipalForQueryResponse } from "./GetPrincipalForQuery";

describe("GetPrincipalForQueryHandler", () => {
  let handler: GetPrincipalForQueryHandler;
  let query: GetPrincipalForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;
  const numerator = "1";
  const denominator = "2";

  beforeEach(() => {
    handler = new GetPrincipalForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetPrincipalForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetPrincipalForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetPrincipalForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's principal: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get principal for amount", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getPrincipalFor.mockResolvedValue({
        numerator,
        denominator,
      });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetPrincipalForQueryResponse);
      expect(result.numerator).toStrictEqual(numerator);
      expect(result.denominator).toStrictEqual(denominator);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getPrincipalFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
