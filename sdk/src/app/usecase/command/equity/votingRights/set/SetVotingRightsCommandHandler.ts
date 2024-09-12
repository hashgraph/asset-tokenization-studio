import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import {
  SetVotingRightsCommand,
  SetVotingRightsCommandResponse,
} from './SetVotingRightsCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

@CommandHandler(SetVotingRightsCommand)
export class SetVotingRightsCommandHandler
  implements ICommandHandler<SetVotingRightsCommand>
{
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetVotingRightsCommand,
  ): Promise<SetVotingRightsCommandResponse> {
    const { address, recordDate, data } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(address)
        ? (await this.mirrorNodeAdapter.getContractInfo(address)).evmAddress
        : address,
    );

    const res = await handler.setVotingRights(
      securityEvmAddress,
      BigDecimal.fromString(recordDate),
      data,
      address,
    );

    return Promise.resolve(
      new SetVotingRightsCommandResponse(res.response, res.id!),
    );
  }
}
