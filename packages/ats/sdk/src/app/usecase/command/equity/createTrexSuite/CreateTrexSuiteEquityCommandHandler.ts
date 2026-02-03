// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractId from "@domain/context/contract/ContractId";
import { Security } from "@domain/context/security/Security";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";

import { Response } from "@domain/context/transaction/Response";
import { MissingRegulationType } from "@domain/context/factory/error/MissingRegulationType";
import { MissingRegulationSubType } from "@domain/context/factory/error/MissingRegulationSubType";
import { EVM_ZERO_ADDRESS } from "@core/Constants";
import { CreateTrexSuiteEquityCommand, CreateTrexSuiteEquityCommandResponse } from "./CreateTrexSuiteEquityCommand";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { CreateTrexSuiteEquityCommandError } from "./error/CreateTrexSuiteEquityError";
import { InvalidRequest } from "@command/error/InvalidRequest";
import { TrexTokenDetailsAts, TrexClaimDetails } from "@domain/context/factory/TRexFactory";
import ValidationService from "@service/validation/ValidationService";

@CommandHandler(CreateTrexSuiteEquityCommand)
export class CreateTrexSuiteEquityCommandHandler implements ICommandHandler<CreateTrexSuiteEquityCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: CreateTrexSuiteEquityCommand): Promise<CreateTrexSuiteEquityCommandResponse> {
    let res: Response;
    try {
      const {
        salt,
        owner,
        irs,
        onchainId,
        irAgents,
        tokenAgents,
        compliancesModules,
        complianceSettings,
        claimTopics,
        issuers,
        issuerClaims,

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
        externalPauses,
        externalControlLists,
        externalKycLists,
        compliance,
        identityRegistry,
      } = command;

      if (!security.regulationType) {
        throw new MissingRegulationType();
      }
      if (!security.regulationsubType) {
        throw new MissingRegulationSubType();
      }

      if (!salt || salt.length === 0) {
        throw new InvalidRequest("Salt not found in request");
      }
      this.validationService.checkTrexTokenSaltExists(factory.toString(), salt);

      const trexTokenDetails = new TrexTokenDetailsAts({
        owner,
        irs,
        onchainId,
        irAgents,
        tokenAgents,
        compliancesModules,
        complianceSettings,
      });
      const claimDetails = new TrexClaimDetails({
        claimTopics,
        issuers,
        issuerClaims,
      });
      const diamondOwnerAccountEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(
        diamondOwnerAccount!,
      );

      const factoryEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(factory.toString());

      const resolverEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(resolver.toString());

      const [externalPausesEvmAddresses, externalControlListsEvmAddresses, externalKycListsEvmAddresses] =
        await Promise.all([
          this.contractService.getEvmAddressesFromHederaIds(externalPauses),
          this.contractService.getEvmAddressesFromHederaIds(externalControlLists),
          this.contractService.getEvmAddressesFromHederaIds(externalKycLists),
        ]);

      const complianceEvmAddress = compliance
        ? await this.contractService.getContractEvmAddress(compliance)
        : new EvmAddress(EVM_ZERO_ADDRESS);

      const identityRegistryEvmAddress = identityRegistry
        ? await this.contractService.getContractEvmAddress(identityRegistry)
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

      res = await handler.createTrexSuiteEquity(
        salt,
        trexTokenDetails.owner,
        trexTokenDetails.irs,
        trexTokenDetails.onchainId,
        trexTokenDetails.irAgents,
        trexTokenDetails.tokenAgents,
        trexTokenDetails.compliancesModules,
        trexTokenDetails.complianceSettings,
        claimDetails.claimTopics,
        claimDetails.issuers,
        claimDetails.issuerClaims,

        new Security(security),
        equityInfo,
        factoryEvmAddress,
        resolverEvmAddress,
        configId,
        configVersion,
        complianceEvmAddress,
        identityRegistryEvmAddress,
        diamondOwnerAccountEvmAddress,
        externalPausesEvmAddresses,
        externalControlListsEvmAddresses,
        externalKycListsEvmAddresses,
        factory.toString(),
      );

      const contractAddress = await this.transactionService.getTransactionResult({
        res,
        result: res.response?._token,
        className: CreateTrexSuiteEquityCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });
      const contractId = await this.mirrorNodeAdapter.getHederaIdfromContractAddress(contractAddress);

      return Promise.resolve(new CreateTrexSuiteEquityCommandResponse(new ContractId(contractId), res.id!));
    } catch (error) {
      if (res?.response == 1)
        return Promise.resolve(new CreateTrexSuiteEquityCommandResponse(new ContractId("0.0.0"), res.id!));
      else throw new CreateTrexSuiteEquityCommandError(error as Error);
    }
  }
}
