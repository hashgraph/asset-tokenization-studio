// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  AmortizationPaymentAmountFixture,
  GetAmortizationPaymentAmountQueryFixture,
} from "@test/fixtures/amortization/AmortizationFixture";
import { GetAmortizationPaymentAmountQueryHandler } from "./GetAmortizationPaymentAmountQueryHandler";
import {
  GetAmortizationPaymentAmountQuery,
  GetAmortizationPaymentAmountQueryResponse,
} from "./GetAmortizationPaymentAmountQuery";
import { GetAmortizationPaymentAmountQueryError } from "./error/GetAmortizationPaymentAmountQueryError";

describe("GetAmortizationPaymentAmountQueryHandler", () => {
  let handler: GetAmortizationPaymentAmountQueryHandler;
  let query: GetAmortizationPaymentAmountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const tokenHolderEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const paymentAmount = AmortizationPaymentAmountFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationPaymentAmountQueryHandler(
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetAmortizationPaymentAmountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationPaymentAmountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationPaymentAmountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying amortization payment amount: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortization payment amount", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(tokenHolderEvmAddress);
      queryAdapterServiceMock.getAmortizationPaymentAmount.mockResolvedValue(paymentAmount);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationPaymentAmountQueryResponse);
      expect(result.amortizationPaymentAmount).toBe(paymentAmount);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.tokenHolder);
      expect(queryAdapterServiceMock.getAmortizationPaymentAmount).toHaveBeenCalledWith(
        evmAddress,
        query.amortizationId,
        tokenHolderEvmAddress,
      );
    });
  });
});
