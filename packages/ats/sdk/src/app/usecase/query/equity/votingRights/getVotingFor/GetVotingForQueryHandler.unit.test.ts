// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetVotingForQueryFixture, VotingForFixture } from "@test/fixtures/equity/EquityFixture";
import AccountService from "@service/account/AccountService";
import { GetVotingForQueryHandler } from "./GetVotingForQueryHandler";
import { GetVotingForQuery, GetVotingForQueryResponse } from "./GetVotingForQuery";
import { GetVotingForQueryError } from "./error/GetVotingForQueryError";

describe("GetVotingForQueryHandler", () => {
  let handler: GetVotingForQueryHandler;
  let query: GetVotingForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const votingFor = VotingForFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetVotingForQueryHandler(contractServiceMock, queryAdapterServiceMock, accountServiceMock);
    query = GetVotingForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetVotingForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetVotingForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's voting: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get voting for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getVotingFor.mockResolvedValue(votingFor);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetVotingForQueryResponse);
      expect(result.tokenBalance).toBe(votingFor.tokenBalance);
      expect(result.decimals).toBe(votingFor.decimals);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getVotingFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress, query.votingId);
    });
  });
});
