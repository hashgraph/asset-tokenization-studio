// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  ClearingRedeemFixture,
  GetClearingRedeemForByPartitionQueryFixture,
} from "@test/fixtures/clearing/ClearingFixture";
import SecurityService from "@service/security/SecurityService";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import {
  GetClearingRedeemForByPartitionQuery,
  GetClearingRedeemForByPartitionQueryResponse,
} from "./GetClearingRedeemForByPartitionQuery";
import { GetClearingRedeemForByPartitionQueryHandler } from "./GetClearingRedeemForByPartitionQueryHandler";
import { GetClearingRedeemForByPartitionQueryError } from "./error/GetClearingRedeemForByPartitionQueryError";

describe("GetClearingRedeemForByPartitionQueryHandler", () => {
  let handler: GetClearingRedeemForByPartitionQueryHandler;
  let query: GetClearingRedeemForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create({ decimals: 0 }));
  const errorMsg = ErrorMsgFixture.create().msg;
  const clearing = ClearingRedeemFixture.create();

  beforeEach(() => {
    handler = new GetClearingRedeemForByPartitionQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetClearingRedeemForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearingRedeemForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearingRedeemForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying clearing redeem: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get clearing create redeem for by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getClearingRedeemForByPartition.mockResolvedValueOnce(clearing);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearingRedeemForByPartitionQueryResponse);

      expect(result.payload).toStrictEqual(clearing);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(queryAdapterServiceMock.getClearingRedeemForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
        query.clearingId,
      );
    });
  });
});
