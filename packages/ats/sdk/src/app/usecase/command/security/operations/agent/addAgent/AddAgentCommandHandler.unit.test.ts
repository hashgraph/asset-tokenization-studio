// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AddAgentCommand, AddAgentCommandResponse } from "./AddAgentCommand";
import { AddAgentCommandHandler } from "./AddAgentCommandHandler";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import Account from "@domain/context/account/Account";
import ContractService from "@service/contract/ContractService";
import { AddAgentCommandFixture } from "@test/fixtures/agent/AgentFixture";
import { AddAgentCommandError } from "./error/AddAgentCommandError";

describe("AddAgentCommandHandler", () => {
  let handler: AddAgentCommandHandler;
  let command: AddAgentCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new AddAgentCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = AddAgentCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws AddAgentCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(AddAgentCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while adding agent: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully add agent", async () => {
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().addAgent.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(AddAgentCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.agentId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._DEFAULT_ADMIN_ROLE,
          account.id.toString(),
          command.securityId,
        );

        expect(transactionServiceMock.getHandler().addAgent).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().addAgent).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
