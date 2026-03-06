// SPDX-License-Identifier: Apache-2.0

import { InvalidRequest } from "@command/error/InvalidRequest";
import { ICommandHandler } from "@core/command/CommandHandler";
import { EVM_ZERO_ADDRESS } from "@core/Constants";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { BondKpiLinkedRateDetails } from "@domain/context/bond/BondKpiLinkedRateDetails";
import { ImpactData } from "@domain/context/bond/ImpactData";
import { InterestRate } from "@domain/context/bond/InterestRate";
import ContractId from "@domain/context/contract/ContractId";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { MissingRegulationSubType } from "@domain/context/factory/error/MissingRegulationSubType";
import { MissingRegulationType } from "@domain/context/factory/error/MissingRegulationType";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { Response } from "@domain/context/transaction/Response";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import TransactionService from "@service/transaction/TransactionService";
import {
  CreateBondKpiLinkedRateCommand,
  CreateBondKpiLinkedRateCommandResponse,
} from "./CreateBondKpiLinkedRateCommand";
import { CreateBondKpiLinkedRateCommandError } from "./error/CreateBondKpiLinkedRateCommandError";

@CommandHandler(CreateBondKpiLinkedRateCommand)
export class CreateBondKpiLinkedRateCommandHandler implements ICommandHandler<CreateBondKpiLinkedRateCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: CreateBondKpiLinkedRateCommand): Promise<CreateBondKpiLinkedRateCommandResponse> {
    let res: Response;
    try {
      const {
        security,
        currency,
        nominalValue,
        nominalValueDecimals,
        startingDate,
        maturityDate,
        factory,
        resolver,
        configId,
        configVersion,
        diamondOwnerAccount,
        externalPausesIds,
        externalControlListsIds,
        externalKycListsIds,
        complianceId,
        identityRegistryId,
        proceedRecipientsIds,
        proceedRecipientsData,
      } = command;

      //TODO: Boy scout: remove request validations and adjust test
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

      let proceedRecipientsEvmAddresses: EvmAddress[] = [];
      if (proceedRecipientsIds)
        proceedRecipientsEvmAddresses = await Promise.all(
          proceedRecipientsIds.map(async (id: string) => await this.accountService.getAccountEvmAddress(id)),
        );

      const complianceEvmAddress = complianceId
        ? await this.contractService.getContractEvmAddress(complianceId)
        : new EvmAddress(EVM_ZERO_ADDRESS);

      const identityRegistryAddress = identityRegistryId
        ? await this.contractService.getContractEvmAddress(identityRegistryId)
        : new EvmAddress(EVM_ZERO_ADDRESS);

      const handler = this.transactionService.getHandler();

      const interestRate = new InterestRate(
        command.maxRate,
        command.baseRate,
        command.minRate,
        command.startPeriod,
        command.startRate,
        command.missedPenalty,
        command.reportPeriod,
        command.rateDecimals,
      );

      const impactData = new ImpactData(
        command.maxDeviationCap,
        command.baseLine,
        command.maxDeviationFloor,
        command.impactDataDecimals,
        command.adjustmentPrecision,
      );

      const bondKpiLinkedRateInfo = new BondKpiLinkedRateDetails(
        currency,
        BigDecimal.fromString(nominalValue),
        nominalValueDecimals,
        parseInt(startingDate),
        parseInt(maturityDate),
        interestRate,
        impactData,
      );

      res = await handler.createBondKpiLinkedRate(
        new Security(security),
        bondKpiLinkedRateInfo,
        factoryEvmAddress,
        resolverEvmAddress,
        configId,
        configVersion,
        complianceEvmAddress,
        identityRegistryAddress,
        externalPausesEvmAddresses,
        externalControlListsEvmAddresses,
        externalKycListsEvmAddresses,
        diamondOwnerAccountEvmAddress,
        proceedRecipientsEvmAddresses,
        proceedRecipientsData,
        factory.toString(),
      );

      const contractAddress = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.bondAddress,
        className: CreateBondKpiLinkedRateCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      const contractId = await this.mirrorNodeAdapter.getHederaIdfromContractAddress(contractAddress);

      return Promise.resolve(new CreateBondKpiLinkedRateCommandResponse(new ContractId(contractId), res.id!));
    } catch (error) {
      if (res?.response == 1) {
        return Promise.resolve(new CreateBondKpiLinkedRateCommandResponse(new ContractId("0.0.0"), res.id!));
      }
      throw new CreateBondKpiLinkedRateCommandError(error as Error);
    }
  }
}
