// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import {
  GetCorporateActionQueryFixture,
  GetCorporateActionResponseFixture,
} from "@test/fixtures/corporateActions/CorporateActionsFixture";
import { GetCorporateActionQuery, GetCorporateActionQueryResponse } from "./GetCorporateActionQuery";
import { GetCorporateActionQueryHandler } from "./GetCorporateActionQueryHandler";
import { GetCorporateActionQueryError } from "./error/GetCorporateActionQueryError";

describe("GetCorporateActionQueryHandler", () => {
  let handler: GetCorporateActionQueryHandler;
  let query: GetCorporateActionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const mockResponse = GetCorporateActionResponseFixture.create();

  beforeEach(() => {
    handler = new GetCorporateActionQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCorporateActionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCorporateActionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCorporateActionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying corporate action: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get corporate action", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCorporateAction.mockResolvedValueOnce(mockResponse);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCorporateActionQueryResponse);
      expect(result.payload).toEqual(mockResponse);
      expect(result.payload.actionType).toBe(mockResponse.actionType);
      expect(result.payload.actionTypeId).toBe(mockResponse.actionTypeId);
      expect(result.payload.data).toBe(mockResponse.data);
      expect(result.payload.isDisabled).toBe(mockResponse.isDisabled);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCorporateAction).toHaveBeenCalledWith(evmAddress, query.corporateActionId);
    });
  });
});
