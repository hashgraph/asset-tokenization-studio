// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetRoleMembersQueryFixture } from "@test/fixtures/role/RoleFixture";
import { GetRoleMembersQuery, GetRoleMembersQueryResponse } from "./GetRoleMembersQuery";
import { GetRoleMembersQueryError } from "./error/GetRoleMembersQueryError";
import { GetRoleMembersQueryHandler } from "./GetRoleMembersQueryHandler";

describe("GetRoleMembersQueryHandler", () => {
  let handler: GetRoleMembersQueryHandler;
  let query: GetRoleMembersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const member = new EvmAddress(EvmAddressPropsFixture.create().value).toString();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetRoleMembersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetRoleMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetRoleMembersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetRoleMembersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying role members: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get role members", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getRoleMembers.mockResolvedValueOnce([member]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetRoleMembersQueryResponse);
      expect(result.payload).toStrictEqual([member]);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getRoleMembers).toHaveBeenCalledWith(
        evmAddress,
        query.role,
        query.start,
        query.end,
      );
    });
  });
});
