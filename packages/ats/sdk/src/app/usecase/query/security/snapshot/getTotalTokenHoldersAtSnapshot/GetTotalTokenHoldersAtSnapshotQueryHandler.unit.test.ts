// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalTokenHoldersAtSnapshotQueryFixture } from "@test/fixtures/snapshot/SnapshotFixture";
import { GetTotalTokenHoldersAtSnapshotQueryError } from "./error/GetTotalTokenHoldersAtSnapshotQueryError";
import {
  GetTotalTokenHoldersAtSnapshotQuery,
  GetTotalTokenHoldersAtSnapshotQueryResponse,
} from "./GetTotalTokenHoldersAtSnapshotQuery";
import { GetTotalTokenHoldersAtSnapshotQueryHandler } from "./GetTotalTokenHoldersAtSnapshotQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalTokenHoldersAtSnapshotQueryHandler", () => {
  let handler: GetTotalTokenHoldersAtSnapshotQueryHandler;
  let query: GetTotalTokenHoldersAtSnapshotQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalTokenHoldersAtSnapshotQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalTokenHoldersAtSnapshotQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalTokenHoldersAtSnapshotQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalTokenHoldersAtSnapshotQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying total token holders at snapshot: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total token holders at snapshot", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalTokenHoldersAtSnapshot.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalTokenHoldersAtSnapshotQueryResponse);
      expect(result.payload).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalTokenHoldersAtSnapshot).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalTokenHoldersAtSnapshot).toHaveBeenCalledWith(evmAddress, query.snapshotId);
    });
  });
});
