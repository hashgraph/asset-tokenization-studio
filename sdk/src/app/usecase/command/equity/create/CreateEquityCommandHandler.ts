import {
  CreateEquityCommand,
  CreateEquityCommandResponse,
} from './CreateEquityCommand.js';
import { InvalidRequest } from '../../error/InvalidRequest.js';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { Security } from '../../../../../domain/context/security/Security.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import NetworkService from '../../../../service/NetworkService.js';
import { TOPICS_IN_FACTORY_RESULT } from '../../../../../core/Constants.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import { EquityDetails } from '../../../../../domain/context/equity/EquityDetails.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

@CommandHandler(CreateEquityCommand)
export class CreateEquityCommandHandler
  implements ICommandHandler<CreateEquityCommand>
{
  constructor(
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    command: CreateEquityCommand,
  ): Promise<CreateEquityCommandResponse> {
    const {
      security,
      factory,
      resolver,
      businessLogicKeys,
      diamondOwnerAccount,
      votingRight,
      informationRight,
      liquidationRight,
      subscriptionRight,
      convertionRight,
      redemptionRight,
      putRight,
      dividendRight,
      currency,
      nominalValue,
    } = command;

    if (!factory) {
      throw new InvalidRequest('Factory not found in request');
    }

    if (!resolver) {
      throw new InvalidRequest('Resolver not found in request');
    }

    if (!businessLogicKeys) {
      throw new InvalidRequest('Business Logic Keys not found in request');
    }

    const diamondOwnerAccountEvmAddress: EvmAddress =
      HEDERA_FORMAT_ID_REGEX.test(diamondOwnerAccount!)
        ? await this.mirrorNodeAdapter.accountToEvmAddress(diamondOwnerAccount!)
        : new EvmAddress(diamondOwnerAccount!);

    const factoryEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(factory.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(factory.toString()))
            .evmAddress
        : factory.toString(),
    );

    const resolverEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(resolver.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(resolver.toString()))
            .evmAddress
        : resolver.toString(),
    );
    const handler = this.transactionService.getHandler();

    const equityInfo = new EquityDetails(
      votingRight,
      informationRight,
      liquidationRight,
      subscriptionRight,
      convertionRight,
      redemptionRight,
      putRight,
      dividendRight,
      currency,
      BigDecimal.fromString(nominalValue),
    );

    const res = await handler.createEquity(
      new Security(security),
      equityInfo,
      factoryEvmAddress,
      resolverEvmAddress,
      businessLogicKeys,
      diamondOwnerAccountEvmAddress,
    );

    if (!res.id) throw new Error('Create Command Handler response id empty');

    let contractAddress: string;
    try {
      if (res.response && res.response.equityAddress) {
        contractAddress = res.response.equityAddress;
      } else {
        // * Recover the new contract ID from Event data from the Mirror Node

        const consensusTimestamp =
          await this.mirrorNodeAdapter.getConsensusTimestamp({
            transactionId: res.id.toString(),
            timeout: 15,
          });
        if (!consensusTimestamp) {
          throw new Error('Consensus timestamp not found before timeout');
        }

        const data = await this.mirrorNodeAdapter.getContractLogData(
          factory.toString(),
          consensusTimestamp,
        );
        console.log(`Creation event data:${data}`); //! Remove this line

        if (!data || data.length !== TOPICS_IN_FACTORY_RESULT) {
          throw new Error('Invalid data structure');
        }
        contractAddress = data[0];
      }
      const contractId =
        await this.mirrorNodeAdapter.getHederaIdfromContractAddress(
          contractAddress,
        );

      return Promise.resolve(
        new CreateEquityCommandResponse(new ContractId(contractId), res.id!),
      );
    } catch (e) {
      if (res.response == 1)
        return Promise.resolve(
          new CreateEquityCommandResponse(new ContractId('0.0.0'), res.id!),
        );
      else throw e;
    }
  }
}
