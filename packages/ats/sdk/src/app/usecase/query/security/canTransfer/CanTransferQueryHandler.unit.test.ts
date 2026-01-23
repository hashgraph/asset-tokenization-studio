// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { CanTransferQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { EMPTY_BYTES } from "@core/Constants";
import { CanTransferQueryHandler } from "./CanTransferQueryHandler";
import { CanTransferQuery, CanTransferQueryResponse } from "./CanTransferQuery";
import ValidationService from "@service/validation/ValidationService";
import { CanTransferQueryError } from "./error/CanTransferQueryError";
import Account from "@domain/context/account/Account";

describe("CanTransferQueryHandler", () => {
  let handler: CanTransferQueryHandler;
  let query: CanTransferQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();
  const validationServiceMock = createMock<ValidationService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CanTransferQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    query = CanTransferQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws CanTransferQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(CanTransferQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying can transfer: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if can transfer", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress
        .mockResolvedValueOnce(targetEvmAddress)
        .mockResolvedValueOnce(targetEvmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      queryAdapterServiceMock.canTransfer.mockResolvedValueOnce([true, "test", "test"]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(CanTransferQueryResponse);
      expect(result.payload).toBe("test");
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, query.targetId);
      expect(queryAdapterServiceMock.canTransfer).toHaveBeenCalledWith(
        evmAddress,
        targetEvmAddress,
        BigDecimal.fromString(query.amount, security.decimals),
        EMPTY_BYTES,
        account.evmAddress,
      );
    });
  });
});
