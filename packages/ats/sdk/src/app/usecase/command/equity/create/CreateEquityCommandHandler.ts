// SPDX-License-Identifier: Apache-2.0

import { CreateEquityCommand, CreateEquityCommandResponse } from "./CreateEquityCommand";
import { InvalidRequest } from "@command/error/InvalidRequest";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractId from "@domain/context/contract/ContractId";
import { Security } from "@domain/context/security/Security";
import TransactionService from "@service/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { Response } from "@domain/context/transaction/Response";
import { CreateEquityCommandError } from "./error/CreateEquityCommandError";
import { MissingRegulationType } from "@domain/context/factory/error/MissingRegulationType";
import { MissingRegulationSubType } from "@domain/context/factory/error/MissingRegulationSubType";
import { EVM_ZERO_ADDRESS } from "@core/Constants";

@CommandHandler(CreateEquityCommand)
export class CreateEquityCommandHandler implements ICommandHandler<CreateEquityCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: CreateEquityCommand): Promise<CreateEquityCommandResponse> {
    let res: Response;
    try {
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
        nominalValueDecimals,
        externalPausesIds,
        externalControlListsIds,
        externalKycListsIds,
        complianceId,
        identityRegistryId,
      } = command;

      if (!factory) {
        throw new InvalidRequest("Factory not found in request");
      }

      if (!resolver) {
        throw new InvalidRequest("Resolver not found in request");
      }

      if (!configId) {
        throw new InvalidRequest("Config Id not found in request");
      }

      if (configVersion === undefined) {
        throw new InvalidRequest("Config Version not found in request");
      }
      if (!security.regulationType) {
        throw new MissingRegulationType();
      }
      if (!security.regulationsubType) {
        throw new MissingRegulationSubType();
      }

      const diamondOwnerAccountEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(
        diamondOwnerAccount!,
      );

      const factoryEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(factory.toString());

      const resolverEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(resolver.toString());

      const [externalPausesEvmAddresses, externalControlListsEvmAddresses, externalKycListsEvmAddresses] =
        await Promise.all([
          this.contractService.getEvmAddressesFromHederaIds(externalPausesIds),
          this.contractService.getEvmAddressesFromHederaIds(externalControlListsIds),
          this.contractService.getEvmAddressesFromHederaIds(externalKycListsIds),
        ]);

      const complianceEvmAddress = complianceId
        ? await this.contractService.getContractEvmAddress(complianceId)
        : new EvmAddress(EVM_ZERO_ADDRESS);

      const identityRegistryEvmAddress = identityRegistryId
        ? await this.contractService.getContractEvmAddress(identityRegistryId)
        : new EvmAddress(EVM_ZERO_ADDRESS);

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
        nominalValueDecimals,
      );

      res = await handler.createEquity(
        new Security(security),
        equityInfo,
        factoryEvmAddress,
        resolverEvmAddress,
        configId,
        configVersion,
        complianceEvmAddress,
        identityRegistryEvmAddress,
        externalPausesEvmAddresses,
        externalControlListsEvmAddresses,
        externalKycListsEvmAddresses,
        diamondOwnerAccountEvmAddress,
        factory.toString(),
      );

      const contractAddress = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.equityAddress,
        className: CreateEquityCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });
      const contractId = await this.mirrorNodeAdapter.getHederaIdfromContractAddress(contractAddress);

      return Promise.resolve(new CreateEquityCommandResponse(new ContractId(contractId), res.id!));
    } catch (error) {
      if (res?.response == 1) return Promise.resolve(new CreateEquityCommandResponse(new ContractId("0.0.0"), res.id!));
      else throw new CreateEquityCommandError(error as Error);
    }
  }
}
