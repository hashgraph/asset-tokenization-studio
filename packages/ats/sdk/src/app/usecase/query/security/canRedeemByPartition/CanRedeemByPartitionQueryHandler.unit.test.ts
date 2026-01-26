// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { CanRedeemByPartitionQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { CanRedeemByPartitionQueryHandler } from "./CanRedeemByPartitionQueryHandler";
import { CanRedeemByPartitionQuery, CanRedeemByPartitionQueryResponse } from "./CanRedeemByPartitionQuery";
import { CanRedeemByPartitionQueryError } from "./error/CanRedeemByPartitionQueryError";
import { EMPTY_BYTES } from "@core/Constants";
import Account from "@domain/context/account/Account";

describe("CanRedeemByPartitionQueryHandler", () => {
  let handler: CanRedeemByPartitionQueryHandler;
  let query: CanRedeemByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const sourceEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CanRedeemByPartitionQueryHandler(
      securityServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
    );
    query = CanRedeemByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws CanRedeemByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(CanRedeemByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying can redeem: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if can redeem by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValue(sourceEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      queryAdapterServiceMock.canRedeemByPartition.mockResolvedValueOnce([true, "test", "test"]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(CanRedeemByPartitionQueryResponse);
      expect(result.payload).toStrictEqual(["test", "test"]);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, query.sourceId);
      expect(queryAdapterServiceMock.canRedeemByPartition).toHaveBeenCalledWith(
        evmAddress,
        sourceEvmAddress,
        BigDecimal.fromString(query.amount, security.decimals),
        query.partitionId,
        EMPTY_BYTES,
        EMPTY_BYTES,
        account.evmAddress,
      );
    });
  });
});
