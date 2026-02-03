// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetKycStatusForQueryFixture } from "@test/fixtures/kyc/KycFixture";
import { GetKycStatusForQuery, GetKycStatusForQueryResponse } from "./GetKycStatusForQuery";
import { GetKycStatusForQueryHandler } from "./GetKycStatusForQueryHandler";
import { GetKycStatusForQueryError } from "./error/GetKycStatusForQueryError";

describe("GetKycStatusForQueryHandler", () => {
  let handler: GetKycStatusForQueryHandler;
  let query: GetKycStatusForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetKycStatusForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetKycStatusForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetKycStatusForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetKycStatusForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying KYC status: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get kyc status for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getKycStatusFor.mockResolvedValueOnce(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetKycStatusForQueryResponse);

      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(queryAdapterServiceMock.getKycStatusFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
