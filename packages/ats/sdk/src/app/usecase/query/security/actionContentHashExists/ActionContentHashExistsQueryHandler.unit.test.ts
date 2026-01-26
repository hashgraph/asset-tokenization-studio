// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ActionContentHashExistsQueryFixture } from "@test/fixtures/corporateActions/CorporateActionsFixture";
import { ActionContentHashExistsQuery, ActionContentHashExistsQueryResponse } from "./ActionContentHashExistsQuery";
import { ActionContentHashExistsQueryHandler } from "./ActionContentHashExistsQueryHandler";
import { ActionContentHashExistsQueryError } from "./error/ActionContentHashExistsQueryError";

describe("ActionContentHashExistsQueryHandler", () => {
  let handler: ActionContentHashExistsQueryHandler;
  let query: ActionContentHashExistsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ActionContentHashExistsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = ActionContentHashExistsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws ActionContentHashExistsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(ActionContentHashExistsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying action content hash exists: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check action content hash exist", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);

      queryAdapterServiceMock.actionContentHashExists.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(ActionContentHashExistsQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.actionContentHashExists).toHaveBeenCalledWith(evmAddress, query.contentHash);
    });
  });
});
