// SPDX-License-Identifier: Apache-2.0

import { CreateLoanCommand, CreateLoanCommandResponse } from "./CreateLoanCommand";
import { InvalidRequest } from "@command/error/InvalidRequest";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractId from "@domain/context/contract/ContractId";
import { Security } from "@domain/context/security/Security";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { toLoanDetails } from "@domain/context/loan/LoanDetailsMapper";
import ContractService from "@service/contract/ContractService";
import { CreateLoanCommandError } from "./error/CreateLoanCommandError";
import { Response } from "@domain/context/transaction/Response";
import { MissingRegulationType } from "@domain/context/factory/error/MissingRegulationType";
import { MissingRegulationSubType } from "@domain/context/factory/error/MissingRegulationSubType";
import { EVM_ZERO_ADDRESS } from "@core/Constants";

@CommandHandler(CreateLoanCommand)
export class CreateLoanCommandHandler implements ICommandHandler<CreateLoanCommand> {
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

  async execute(command: CreateLoanCommand): Promise<CreateLoanCommandResponse> {
    let res: Response;
    try {
      const {
        security,
        nominalValue,
        nominalValueDecimals,
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

      const identityRegistryAddress = identityRegistryId
        ? await this.contractService.getContractEvmAddress(identityRegistryId)
        : new EvmAddress(EVM_ZERO_ADDRESS);

      const handler = this.transactionService.getHandler();

      const loanDetails = toLoanDetails(command);

      res = await handler.createLoan(
        new Security(security),
        loanDetails,
        nominalValue,
        nominalValueDecimals,
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
      );

      const contractAddress = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.loanAddress,
        className: CreateLoanCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      const contractId = await this.mirrorNodeAdapter.getHederaIdfromContractAddress(contractAddress);

      return Promise.resolve(new CreateLoanCommandResponse(new ContractId(contractId), res.id!));
    } catch (error) {
      if (res?.response == 1) {
        return Promise.resolve(new CreateLoanCommandResponse(new ContractId("0.0.0"), res.id!));
      }
      throw new CreateLoanCommandError(error as Error);
    }
  }
}
