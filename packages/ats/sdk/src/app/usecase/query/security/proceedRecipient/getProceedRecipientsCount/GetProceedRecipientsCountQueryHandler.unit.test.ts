// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientsCountQueryHandler } from "./GetProceedRecipientsCountQueryHandler";
import {
  GetProceedRecipientsCountQuery,
  GetProceedRecipientsCountQueryResponse,
} from "./GetProceedRecipientsCountQuery";
import { GetProceedRecipientsCountQueryError } from "./error/GetProceedRecipientsCountQueryError";
import { GetProceedRecipientsCountQueryFixture } from "@test/fixtures/proceedRecipient/ProceedRecipientFixture";

describe("GetProceedRecipientsCountQueryHandler", () => {
  let handler: GetProceedRecipientsCountQueryHandler;
  let query: GetProceedRecipientsCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetProceedRecipientsCountQueryHandler(contractServiceMock, queryAdapterServiceMock);
    query = GetProceedRecipientsCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetProceedRecipientsCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);
      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetProceedRecipientsCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying GetProceedRecipientsCount: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get proceedRecipients count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);

      const responseAdapter = 45;
      queryAdapterServiceMock.getProceedRecipientsCount.mockResolvedValueOnce(responseAdapter);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetProceedRecipientsCountQueryResponse);
      expect(result.payload).toStrictEqual(responseAdapter);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);

      expect(queryAdapterServiceMock.getProceedRecipientsCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
