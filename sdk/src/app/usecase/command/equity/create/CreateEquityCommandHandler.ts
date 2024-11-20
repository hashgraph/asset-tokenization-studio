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
import {
  ADDRESS_LENGTH,
  BYTES_32_LENGTH,
} from '../../../../../core/Constants.js';
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
      configId,
      configVersion,
      diamondOwnerAccount,
      votingRight,
      informationRight,
      liquidationRight,
      subscriptionRight,
      conversionRight,
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

    if (!configId) {
      throw new InvalidRequest('Config Id not found in request');
    }

    if (configVersion === undefined) {
      throw new InvalidRequest('Config Version not found in request');
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
      conversionRight,
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
      configId,
      configVersion,
      diamondOwnerAccountEvmAddress,
    );

    if (!res.id) throw new Error('Create Command Handler response id empty');

    let contractAddress: string;
    try {
      if (res.response && res.response.equityAddress) {
        contractAddress = res.response.equityAddress;
      } else {
        // * Recover the new contract ID from Event data from the Mirror Node
        const results = await this.mirrorNodeAdapter.getContractResults(
          res.id.toString(),
          1,
        );

        console.log(`Creation event data:${results}`); //! Remove this line

        if (!results || results.length !== 1) {
          throw new Error('Invalid data structure');
        }

        const data = results.map((result) =>
          result.substring(BYTES_32_LENGTH - ADDRESS_LENGTH + 2),
        );

        contractAddress = '0x' + data[0];
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
