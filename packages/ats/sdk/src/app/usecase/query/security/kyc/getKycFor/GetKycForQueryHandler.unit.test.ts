// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetKycForQuery, GetKycForQueryResponse } from "./GetKycForQuery";
import { GetKycForQueryHandler } from "./GetKycForQueryHandler";
import { GetKycForQueryError } from "./error/GetKycForQueryError";
import { GetKycForQueryFixture, KycFixture } from "@test/fixtures/kyc/KycFixture";

describe("GetKycForQueryHandler", () => {
  let handler: GetKycForQueryHandler;
  let query: GetKycForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const kyc = KycFixture.create();

  beforeEach(() => {
    handler = new GetKycForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetKycForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetKycForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetKycForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying KYC data: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get kyc for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getKycFor.mockResolvedValueOnce(kyc);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetKycForQueryResponse);

      expect(result.payload).toStrictEqual(kyc);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(queryAdapterServiceMock.getKycFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
