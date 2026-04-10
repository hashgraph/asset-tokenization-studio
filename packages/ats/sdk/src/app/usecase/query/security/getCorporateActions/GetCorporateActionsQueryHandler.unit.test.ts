// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import {
  GetCorporateActionsQueryFixture,
  GetCorporateActionsResponseFixture,
} from "@test/fixtures/corporateActions/CorporateActionsFixture";
import { GetCorporateActionsQuery, GetCorporateActionsQueryResponse } from "./GetCorporateActionsQuery";
import { GetCorporateActionsQueryHandler } from "./GetCorporateActionsQueryHandler";
import { GetCorporateActionsQueryError } from "./error/GetCorporateActionsQueryError";

describe("GetCorporateActionsQueryHandler", () => {
  let handler: GetCorporateActionsQueryHandler;
  let query: GetCorporateActionsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const mockResponse = GetCorporateActionsResponseFixture.create();

  beforeEach(() => {
    handler = new GetCorporateActionsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCorporateActionsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCorporateActionsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCorporateActionsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying corporate actions: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get corporate actions", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCorporateActions.mockResolvedValueOnce(mockResponse);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCorporateActionsQueryResponse);
      expect(result.payload).toEqual(mockResponse);
      expect(result.payload.actionTypes).toEqual(mockResponse.actionTypes);
      expect(result.payload.actionTypeIds).toEqual(mockResponse.actionTypeIds);
      expect(result.payload.datas).toEqual(mockResponse.datas);
      expect(result.payload.isDisabled).toEqual(mockResponse.isDisabled);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCorporateActions).toHaveBeenCalledWith(evmAddress, query.start, query.end);
    });
  });
});
