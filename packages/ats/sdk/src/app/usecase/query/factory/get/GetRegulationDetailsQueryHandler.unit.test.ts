// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetRegulationDetailsQuery, GetRegulationDetailsQueryResponse } from "./GetRegulationDetailsQuery";
import { GetRegulationDetailsQueryHandler } from "./GetRegulationDetailsQueryHandler";
import { GetRegulationDetailsQueryError } from "./error/GetRegulationDetailsQueryError";
import { GetRegulationDetailsQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { RegulationFixture } from "@test/fixtures/shared/RegulationFixture";

describe("GetRegulationDetailsQueryHandler", () => {
  let handler: GetRegulationDetailsQueryHandler;
  let query: GetRegulationDetailsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const regulationDetails = RegulationFixture.create();

  beforeEach(() => {
    handler = new GetRegulationDetailsQueryHandler(queryAdapterServiceMock, accountServiceMock);
    query = GetRegulationDetailsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetRegulationDetailsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetRegulationDetailsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying regulation details: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("throws InvalidRequest when factory is undefined in the query request", async () => {
      const queryWithoutFactory = new GetRegulationDetailsQuery(query.type, query.subType);
      const resultPromise = handler.execute(queryWithoutFactory);

      await expect(resultPromise).rejects.toBeInstanceOf(GetRegulationDetailsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying regulation details: Factory not found in request`,
        ),
        errorCode: ErrorCode.InvalidRequest,
      });
    });
    it("should successfully get regulation details", async () => {
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getRegulationDetails.mockResolvedValue(regulationDetails);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetRegulationDetailsQueryResponse);
      expect(result.regulation).toBe(regulationDetails);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.factory?.toString());
      expect(queryAdapterServiceMock.getRegulationDetails).toHaveBeenCalledWith(query.type, query.subType, evmAddress);
    });
  });
});
