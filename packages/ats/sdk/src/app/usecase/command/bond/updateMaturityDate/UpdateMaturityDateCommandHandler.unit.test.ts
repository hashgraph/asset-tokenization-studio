// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { UpdateMaturityDateCommandFixture } from "@test/fixtures/bond/BondFixture";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import { UpdateMaturityDateCommandHandler } from "./UpdateMaturityDateCommandHandler";
import { UpdateMaturityDateCommand, UpdateMaturityDateCommandResponse } from "./UpdateMaturityDateCommand";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateMaturityDateCommandError } from "./error/UpdateMaturityDateCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("UpdateMaturityDateCommandHandler", () => {
  let handler: UpdateMaturityDateCommandHandler;
  let command: UpdateMaturityDateCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();
  const validationServiceMock = createMock<ValidationService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new UpdateMaturityDateCommandHandler(transactionServiceMock, contractServiceMock, validationServiceMock);
    command = UpdateMaturityDateCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetCouponCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UpdateMaturityDateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while updating the bond maturity date: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully update maturity date in response", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        validationServiceMock.checkMaturityDate.mockResolvedValue(undefined);

        transactionServiceMock.getHandler().updateMaturityDate.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UpdateMaturityDateCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkMaturityDate).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().updateMaturityDate).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().updateMaturityDate).toHaveBeenCalledWith(
          evmAddress,
          parseInt(command.maturityDate),
          command.securityId,
        );
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
