// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  CreateExternalWhiteListMockCommand,
  CreateExternalWhiteListMockCommandResponse,
} from "./CreateExternalWhiteListMockCommand";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionService from "@service/transaction/TransactionService";
import { CreateExternalWhiteListMockCommandError } from "./error/CreateExternalWhiteListMockCommandError";

@CommandHandler(CreateExternalWhiteListMockCommand)
export class CreateExternalWhiteListMockCommandHandler implements ICommandHandler<CreateExternalWhiteListMockCommand> {
  constructor(
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
  ) {}

  async execute(): Promise<CreateExternalWhiteListMockCommandResponse> {
    try {
      const handler = this.transactionService.getHandler();

      const res = await handler.createExternalWhiteListMock();

      let contractAddress: string;

      if (typeof res === "string") {
        contractAddress = res;
      } else {
        contractAddress = await this.transactionService.getTransactionResult({
          res,
          className: CreateExternalWhiteListMockCommandHandler.name,
          position: 0,
          numberOfResultsItems: 1,
          isContractCreation: true,
        });
      }

      const address = (await this.mirrorNodeAdapter.getAccountInfo(contractAddress)).id.toString();

      return Promise.resolve(new CreateExternalWhiteListMockCommandResponse(address));
    } catch (error) {
      throw new CreateExternalWhiteListMockCommandError(error as Error);
    }
  }
}
