// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  CreateExternalPauseMockCommand,
  CreateExternalPauseMockCommandResponse,
} from "./CreateExternalPauseMockCommand";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionService from "@service/transaction/TransactionService";
import { CreateExternalPauseMockCommandError } from "./error/CreateExternalPauseMockCommandError";

@CommandHandler(CreateExternalPauseMockCommand)
export class CreateExternalPauseMockCommandHandler implements ICommandHandler<CreateExternalPauseMockCommand> {
  constructor(
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
  ) {}

  async execute(): Promise<CreateExternalPauseMockCommandResponse> {
    try {
      const handler = this.transactionService.getHandler();

      const res = await handler.createExternalPauseMock();

      let contractAddress: string;

      if (typeof res === "string") {
        contractAddress = res;
      } else {
        contractAddress = await this.transactionService.getTransactionResult({
          res,
          className: CreateExternalPauseMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });
      }

      const address = (await this.mirrorNodeAdapter.getAccountInfo(contractAddress)).id.toString();

      return Promise.resolve(new CreateExternalPauseMockCommandResponse(address));
    } catch (error) {
      throw new CreateExternalPauseMockCommandError(error as Error);
    }
  }
}
