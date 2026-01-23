// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetVotingQueryFixture, VotingRightsFixture } from "@test/fixtures/equity/EquityFixture";
import { GetVotingQuery, GetVotingQueryResponse } from "./GetVotingQuery";
import { GetVotingQueryHandler } from "./GetVotingQueryHandler";
import { GetVotingQueryError } from "./error/GetVotingQueryError";

describe("GetVotingQueryHandler", () => {
  let handler: GetVotingQueryHandler;
  let query: GetVotingQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const votingRights = VotingRightsFixture.create();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetVotingQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetVotingQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetVotingQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetVotingQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying voting: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get voting", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getVoting.mockResolvedValue(votingRights);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetVotingQueryResponse);
      expect(result.voting).toBe(votingRights);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getVoting).toHaveBeenCalledWith(evmAddress, query.votingId);
    });
  });
});
