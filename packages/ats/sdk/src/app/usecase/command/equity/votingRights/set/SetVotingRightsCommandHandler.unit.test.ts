// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { SetVotingRightsCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { SetVotingRightsCommandHandler } from "./SetVotingRightsCommandHandler";
import { SetVotingRightsCommand, SetVotingRightsCommandResponse } from "./SetVotingRightsCommand";
import { SetVotingRightsCommandError } from "./error/SetVotingRightsCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetVotingRightsCommandHandler", () => {
  let handler: SetVotingRightsCommandHandler;
  let command: SetVotingRightsCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const voteId = faker.string.hexadecimal({ length: 64, prefix: "0x" });

  beforeEach(() => {
    handler = new SetVotingRightsCommandHandler(transactionServiceMock, contractServiceMock);
    command = SetVotingRightsCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetVotingRightsCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetVotingRightsCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the voting rights: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set voting rights", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().setVotingRights.mockResolvedValue({
          id: transactionId,
          response: voteId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(voteId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetVotingRightsCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.address);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId, response: voteId },
            className: SetVotingRightsCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setVotingRights).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setVotingRights).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.recordDate.substring(0, 10)),
          command.data,
          command.address,
        );
        expect(result.payload).toBe(parseInt(voteId, 16));
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
