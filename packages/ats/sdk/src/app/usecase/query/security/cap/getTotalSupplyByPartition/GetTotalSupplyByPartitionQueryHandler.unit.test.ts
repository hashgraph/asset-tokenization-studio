// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import SecurityService from "@service/security/SecurityService";
import { GetTotalSupplyByPartitionQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";

import { GetTotalSupplyByPartitionQueryHandler } from "./GetTotalSupplyByPartitionQueryHandler";
import {
  GetTotalSupplyByPartitionQuery,
  GetTotalSupplyByPartitionQueryResponse,
} from "./GetTotalSupplyByPartitionQuery";
import { GetTotalSupplyByPartitionQueryError } from "./error/GetTotalSupplyByPartitionQueryError";

describe("GetTotalSupplyByPartitionQueryHandler", () => {
  let handler: GetTotalSupplyByPartitionQueryHandler;
  let query: GetTotalSupplyByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const amount = BigInt(1);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalSupplyByPartitionQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      contractServiceMock,
    );
    query = GetTotalSupplyByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetMaxSupplyQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalSupplyByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying total supply by partition: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total supply by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalSupplyByPartition.mockResolvedValueOnce(amount);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalSupplyByPartitionQueryResponse);
      expect(result.payload).toStrictEqual(BigDecimal.fromStringFixed(amount.toString(), security.decimals));
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalSupplyByPartition).toHaveBeenCalledWith(evmAddress, query.partitionId);
    });
  });
});
