import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import {
  SetDividendsCommand,
  SetDividendsCommandResponse,
} from './SetDividendsCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

@CommandHandler(SetDividendsCommand)
export class SetDividendsCommandHandler
  implements ICommandHandler<SetDividendsCommand>
{
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetDividendsCommand,
  ): Promise<SetDividendsCommandResponse> {
    const { address, recordDate, executionDate, amount } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(address)
        ? (await this.mirrorNodeAdapter.getContractInfo(address)).evmAddress
        : address,
    );

    const res = await handler.setDividends(
      securityEvmAddress,
      BigDecimal.fromString(recordDate),
      BigDecimal.fromString(executionDate),
      BigDecimal.fromString(amount),
      address,
    );

    return Promise.resolve(
      new SetDividendsCommandResponse(res.response, res.id!),
    );
  }
}
