// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { CanTransferByPartitionQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { EMPTY_BYTES } from "@core/Constants";
import { CanTransferByPartitionQuery, CanTransferByPartitionQueryResponse } from "./CanTransferByPartitionQuery";
import { CanTransferByPartitionQueryHandler } from "./CanTransferByPartitionQueryHandler";
import { CanTransferByPartitionQueryError } from "./error/CanTransferByPartitionQueryError";
import Account from "@domain/context/account/Account";

describe("CanTransferByPartitionQueryHandler", () => {
  let handler: CanTransferByPartitionQueryHandler;
  let query: CanTransferByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const sourceEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CanTransferByPartitionQueryHandler(
      securityServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
    );
    query = CanTransferByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws CanTransferByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(CanTransferByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying can transfer by partition: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if can transfer by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress
        .mockResolvedValueOnce(sourceEvmAddress)
        .mockResolvedValueOnce(targetEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      queryAdapterServiceMock.canTransferByPartition.mockResolvedValueOnce([true, "test", "test"]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(CanTransferByPartitionQueryResponse);
      expect(result.payload).toStrictEqual(["test", "test"]);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, query.sourceId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, query.targetId);
      expect(queryAdapterServiceMock.canTransferByPartition).toHaveBeenCalledWith(
        evmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(query.amount, security.decimals),
        query.partitionId,
        EMPTY_BYTES,
        EMPTY_BYTES,
        account.evmAddress,
      );
    });
  });
});
