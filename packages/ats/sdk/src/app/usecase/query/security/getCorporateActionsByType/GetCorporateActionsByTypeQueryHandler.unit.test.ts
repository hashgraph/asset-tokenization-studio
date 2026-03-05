// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import {
  GetCorporateActionsByTypeQueryFixture,
  GetCorporateActionsResponseFixture,
} from "@test/fixtures/corporateActions/CorporateActionsFixture";
import {
  GetCorporateActionsByTypeQuery,
  GetCorporateActionsByTypeQueryResponse,
} from "./GetCorporateActionsByTypeQuery";
import { GetCorporateActionsByTypeQueryHandler } from "./GetCorporateActionsByTypeQueryHandler";
import { GetCorporateActionsByTypeQueryError } from "./error/GetCorporateActionsByTypeQueryError";

describe("GetCorporateActionsByTypeQueryHandler", () => {
  let handler: GetCorporateActionsByTypeQueryHandler;
  let query: GetCorporateActionsByTypeQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const mockResponse = GetCorporateActionsResponseFixture.create();

  beforeEach(() => {
    handler = new GetCorporateActionsByTypeQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCorporateActionsByTypeQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCorporateActionsByTypeQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCorporateActionsByTypeQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying corporate actions by type: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get corporate actions by type", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCorporateActionsByType.mockResolvedValueOnce(mockResponse);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCorporateActionsByTypeQueryResponse);
      expect(result.payload).toEqual(mockResponse);
      expect(result.payload.actionTypes).toEqual(mockResponse.actionTypes);
      expect(result.payload.actionTypeIds).toEqual(mockResponse.actionTypeIds);
      expect(result.payload.datas).toEqual(mockResponse.datas);
      expect(result.payload.isDisabled).toEqual(mockResponse.isDisabled);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCorporateActionsByType).toHaveBeenCalledWith(
        evmAddress,
        query.actionType,
        query.start,
        query.end,
      );
    });
  });
});
