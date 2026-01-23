// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  CreateExternalBlackListMockCommand,
  CreateExternalBlackListMockCommandResponse,
} from "./CreateExternalBlackListMockCommand";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionService from "@service/transaction/TransactionService";
import { CreateExternalBlackListMockCommandError } from "./error/CreateExternalBlackListMockCommandError";

@CommandHandler(CreateExternalBlackListMockCommand)
export class CreateExternalBlackListMockCommandHandler implements ICommandHandler<CreateExternalBlackListMockCommand> {
  constructor(
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
  ) {}

  async execute(): Promise<CreateExternalBlackListMockCommandResponse> {
    try {
      const handler = this.transactionService.getHandler();

      const res = await handler.createExternalBlackListMock();

      let contractAddress: string;

      if (typeof res === "string") {
        contractAddress = res;
      } else {
        contractAddress = await this.transactionService.getTransactionResult({
          res,
          className: CreateExternalBlackListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });
      }

      const address = (await this.mirrorNodeAdapter.getAccountInfo(contractAddress)).id.toString();

      return Promise.resolve(new CreateExternalBlackListMockCommandResponse(address));
    } catch (error) {
      throw new CreateExternalBlackListMockCommandError(error as Error);
    }
  }
}
