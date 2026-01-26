// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  CreateExternalKycListMockCommand,
  CreateExternalKycListMockCommandResponse,
} from "./CreateExternalKycMockCommand";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionService from "@service/transaction/TransactionService";
import { CreateExternalKycMockCommandError } from "./error/CreateExternalKycMockCommandError";

@CommandHandler(CreateExternalKycListMockCommand)
export class CreateExternalKycListMockCommandHandler implements ICommandHandler<CreateExternalKycListMockCommand> {
  constructor(
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
  ) {}

  async execute(): Promise<CreateExternalKycListMockCommandResponse> {
    try {
      const handler = this.transactionService.getHandler();

      const res = await handler.createExternalKycListMock();

      let contractAddress: string;

      if (typeof res === "string") {
        contractAddress = res;
      } else {
        contractAddress = await this.transactionService.getTransactionResult({
          res,
          className: CreateExternalKycListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });
      }

      const address = (await this.mirrorNodeAdapter.getAccountInfo(contractAddress)).id.toString();

      return Promise.resolve(new CreateExternalKycListMockCommandResponse(address));
    } catch (error) {
      throw new CreateExternalKycMockCommandError(error as Error);
    }
  }
}
