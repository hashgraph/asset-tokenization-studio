/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Signer,
  Transaction,
  Long,
} from '@hashgraph/sdk';
import { Factory__factory } from '@hashgraph/asset-tokenization-contracts';
import {
  TRANSFER_GAS,
  PAUSE_GAS,
  UNPAUSE_GAS,
  REDEEM_GAS,
  CREATE_EQUITY_ST_GAS,
  CREATE_BOND_ST_GAS,
  GRANT_ROLES_GAS,
  MAX_ROLES_GAS,
  ISSUE_GAS,
  ADD_TO_CONTROL_LIST_GAS,
  REMOVE_FROM_CONTROL_LIST_GAS,
  CONTROLLER_TRANSFER_GAS,
  CONTROLLER_REDEEM_GAS,
  SET_DIVIDENDS_GAS,
  SET_VOTING_RIGHTS_GAS,
  RENOUNCE_ROLES_GAS,
  TAKE_SNAPSHOT_GAS,
  _PARTITION_ID_1,
  SET_DOCUMENT_GAS,
  REMOVE_DOCUMENT_GAS,
  AUTHORIZE_OPERATOR_GAS,
  REVOKE_OPERATOR_GAS,
  TRANSFER_OPERATOR_GAS,
  TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS,
  SET_MAX_SUPPLY_GAS,
  SET_COUPON_GAS,
  LOCK_GAS,
  RELEASE_GAS,
  TRANSFER_AND_LOCK_GAS,
} from '../../../core/Constants.js';
import TransactionAdapter from '../TransactionAdapter';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import { SigningError } from '../error/SigningError.js';
import NetworkService from '../../../app/service/NetworkService.js';
import LogService from '../../../app/service/LogService.js';
import {
  FactoryEquityToken,
  FactoryBondToken,
  FactoryRegulationData,
} from '../../../domain/context/factory/FactorySecurityToken.js';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '../../../domain/context/factory/RegulationType.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { MirrorNodes } from '../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelays } from '../../../domain/context/network/JsonRpcRelay.js';
import { Factories } from '../../../domain/context/factory/Factories.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { Security } from '../../../domain/context/security/Security.js';
import { Rbac } from '../../../domain/context/factory/Rbac.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import { ERC20MetadataInfo } from '../../../domain/context/factory/ERC20Metadata.js';
import { Resolvers } from '../../../domain/context/factory/Resolvers.js';
import { BusinessLogicKeys } from '../../../domain/context/factory/BusinessLogicKeys.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { BondDetails } from '../../../domain/context/bond/BondDetails.js';
import { CouponDetails } from '../../../domain/context/bond/CouponDetails.js';
import { BondDetailsData } from '../../../domain/context/factory/BondDetailsData.js';
import { CouponDetailsData } from '../../../domain/context/factory/CouponDetailsData.js';
import { EquityDetails } from '../../../domain/context/equity/EquityDetails.js';
import { EquityDetailsData } from '../../../domain/context/factory/EquityDetailsData.js';
import { SecurityData } from '../../../domain/context/factory/SecurityData.js';
import { CastDividendType } from '../../../domain/context/equity/DividendType.js';
import { AdditionalSecurityData } from '../../../domain/context/factory/AdditionalSecurityData.js';

export abstract class HederaTransactionAdapter extends TransactionAdapter {
  mirrorNodes: MirrorNodes;
  jsonRpcRelays: JsonRpcRelays;
  factories: Factories;
  resolvers: Resolvers;
  businessLogicKeysCommon: BusinessLogicKeys;
  businessLogicKeysEquity: BusinessLogicKeys;
  businessLogicKeysBond: BusinessLogicKeys;
  // common
  protected signer: Signer;

  constructor(
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    public readonly networkService: NetworkService,
  ) {
    super();
  }

  // * Operations NOT Smart Contract related
  public setMirrorNodes(mirrorNodes?: MirrorNodes): void {
    if (mirrorNodes) this.mirrorNodes = mirrorNodes;
  }

  public setJsonRpcRelays(jsonRpcRelays?: JsonRpcRelays): void {
    if (jsonRpcRelays) this.jsonRpcRelays = jsonRpcRelays;
  }

  public setFactories(factories?: Factories): void {
    if (factories) this.factories = factories;
  }

  public setResolvers(resolvers?: Resolvers): void {
    if (resolvers) this.resolvers = resolvers;
  }

  public setBusinessLogicKeysCommon(
    businessLogicKeys?: BusinessLogicKeys,
  ): void {
    if (businessLogicKeys) this.businessLogicKeysCommon = businessLogicKeys;
  }

  public setBusinessLogicKeysEquity(
    businessLogicKeys?: BusinessLogicKeys,
  ): void {
    if (businessLogicKeys) this.businessLogicKeysEquity = businessLogicKeys;
  }

  public setBusinessLogicKeysBond(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysBond = businessLogicKeys;
  }

  // ! Not used for now...
  // private async performSmartContractOperation(
  //   contractAddress: string,
  //   operationName: string,
  //   gas: number,
  //   params?: Params,
  //   transactionType: TransactionType = TransactionType.RECEIPT,
  //   contractAbi?: any,
  //   startDate?: string,
  // ): Promise<TransactionResponse> {
  //   const filteredContractParams =
  //     params === undefined || params === null
  //       ? []
  //       : Object.values(params).filter((element) => {
  //           return element !== undefined;
  //         });
  //   if (filteredContractParams.length < 1) {
  //     throw new Error('No parameters provided for the contract call');
  //   }
  //   for (let i = 0; i < filteredContractParams.length; i++) {
  //     if (Array.isArray(filteredContractParams[i])) {
  //       for (let j = 0; j < filteredContractParams[i].length; j++) {
  //         filteredContractParams[i][j] = await this.getEVMAddress(
  //           filteredContractParams[i][j],
  //         );
  //       }
  //     }
  //     filteredContractParams[i] = await this.getEVMAddress(
  //       filteredContractParams[i],
  //     );
  //   }

  //   return await this.contractCall(
  //     contractAddress,
  //     operationName,
  //     filteredContractParams,
  //     gas,
  //     transactionType,
  //     contractAbi,
  //     undefined,
  //     startDate,
  //   );
  // }

  // public async contractCall(
  //   contractAddress: string,
  //   functionName: string,
  //   parameters: any[],
  //   gas: number,
  //   trxType: TransactionType,
  //   abi: any,
  //   value?: number,
  //   startDate?: string,
  // ): Promise<TransactionResponse> {
  //   const functionCallParameters = this.encodeFunctionCall(
  //     functionName,
  //     parameters,
  //     abi,
  //   );
  //   const transaction: Transaction =
  //     HTSTransactionBuilder.buildContractExecuteTransaction(
  //       contractAddress,
  //       functionCallParameters,
  //       gas,
  //       value,
  //     );
  //   return await this.signAndSendTransaction(
  //     transaction,
  //     trxType,
  //     functionName,
  //     abi,
  //     startDate ?? undefined,
  //   );
  // }
  // * Smart Contract related operations
  async createEquity(
    securityInfo: Security,
    equityInfo: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'deployEquity';
    try {
      if (!securityInfo.regulationType) {
        throw new Error(
          'regulation Type cannot be empty when creating a security',
        );
      }
      if (!securityInfo.regulationsubType) {
        throw new Error(
          'regulation subType cannot be empty when creating a security',
        );
      }

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
      const rbacs: Rbac[] = [rbacAdmin];

      const erc20MetadataInfo: ERC20MetadataInfo = {
        name: securityInfo.name,
        symbol: securityInfo.symbol,
        isin: securityInfo.isin,
        decimals: securityInfo.decimals,
      };

      const security: SecurityData = {
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        businessLogicKeys: businessLogicKeys,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply
          ? securityInfo.maxSupply.toString()
          : '0',
        erc20MetadataInfo: erc20MetadataInfo,
      };

      const equityDetails: EquityDetailsData = {
        votingRight: equityInfo.votingRight,
        informationRight: equityInfo.informationRight,
        liquidationRight: equityInfo.liquidationRight,
        subscriptionRight: equityInfo.subscriptionRight,
        convertionRight: equityInfo.convertionRight,
        redemptionRight: equityInfo.redemptionRight,
        putRight: equityInfo.putRight,
        dividendRight: CastDividendType.toNumber(equityInfo.dividendRight),
        currency: equityInfo.currency,
        nominalValue: equityInfo.nominalValue.toString(),
      };

      const securityTokenToCreate = new FactoryEquityToken(
        security,
        equityDetails,
      );

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? '',
        info: securityInfo.info ?? '',
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(securityInfo.regulationType),
        CastRegulationSubType.toNumber(securityInfo.regulationsubType),
        additionalSecurityData,
      );

      // Create and encode the function data
      const factoryInstance = new Factory__factory().attach(factory.toString());
      const functionDataEncodedHex =
        factoryInstance.interface.encodeFunctionData(FUNCTION_NAME, [
          securityTokenToCreate,
          factoryRegulationData,
        ]);
      const functionDataEncoded = new Uint8Array(
        Buffer.from(functionDataEncodedHex.slice(2), 'hex'),
      );

      LogService.logTrace(
        `Deploying equity: ${{
          security: securityTokenToCreate,
        }}`,
      );
      const transaction = new ContractExecuteTransaction()
        .setContractId(factory.toString())
        .setGas(CREATE_EQUITY_ST_GAS)
        .setFunctionParameters(functionDataEncoded);

      return this.signAndSendTransaction(transaction);
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in RPCTransactionAdapter create operation : ${error}`,
      );
    }
  }

  async createBond(
    securityInfo: Security,
    bondInfo: BondDetails,
    couponInfo: CouponDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'deployBond';
    try {
      if (!securityInfo.regulationType) {
        throw new Error(
          'regulation Type cannot be empty when creating a security',
        );
      }
      if (!securityInfo.regulationsubType) {
        throw new Error(
          'regulation subType cannot be empty when creating a security',
        );
      }

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
      const rbacs: Rbac[] = [rbacAdmin];

      const erc20MetadataInfo: ERC20MetadataInfo = {
        name: securityInfo.name,
        symbol: securityInfo.symbol,
        isin: securityInfo.isin,
        decimals: securityInfo.decimals,
      };

      const security: SecurityData = {
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        businessLogicKeys: businessLogicKeys,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply
          ? securityInfo.maxSupply.toString()
          : '0',
        erc20MetadataInfo: erc20MetadataInfo,
      };

      const bondDetails: BondDetailsData = {
        currency: bondInfo.currency,
        nominalValue: bondInfo.nominalValue.toString(),
        startingDate: bondInfo.startingDate.toString(),
        maturityDate: bondInfo.maturityDate.toString(),
      };

      const couponDetails: CouponDetailsData = {
        couponFrequency: couponInfo.couponFrequency.toString(),
        couponRate: couponInfo.couponRate.toString(),
        firstCouponDate: couponInfo.firstCouponDate.toString(),
      };

      const securityTokenToCreate = new FactoryBondToken(
        security,
        bondDetails,
        couponDetails,
      );

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? '',
        info: securityInfo.info ?? '',
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(securityInfo.regulationType),
        CastRegulationSubType.toNumber(securityInfo.regulationsubType),
        additionalSecurityData,
      );

      const factoryInstance = new Factory__factory().attach(factory.toString());
      const functionDataEncodedHex =
        factoryInstance.interface.encodeFunctionData(FUNCTION_NAME, [
          securityTokenToCreate,
          factoryRegulationData,
        ]);
      const functionDataEncoded = new Uint8Array(
        Buffer.from(functionDataEncodedHex.slice(2), 'hex'),
      );
      LogService.logTrace(
        `Deploying bond: ${{
          security: securityTokenToCreate,
        }}`,
      );
      const transaction = new ContractExecuteTransaction()
        .setContractId(factory.toString())
        .setGas(CREATE_BOND_ST_GAS)
        .setFunctionParameters(functionDataEncoded);

      return this.signAndSendTransaction(transaction);
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in RPCTransactionAdapter create operation : ${error}`,
      );
    }
  }

  async transfer(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'transferByPartition';
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'));
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRANSFER_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async transferAndLock(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'transferAndLockByPartition';
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} and locking them until ${expirationDate.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'))
      .addUint256(Long.fromString(expirationDate.toHexString()));
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRANSFER_AND_LOCK_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async redeem(
    address: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'redeemByPartition';
    LogService.logTrace(`Redeeming ${amount} securities`);

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'));
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(REDEEM_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async pause(address: EvmAddress): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'pause';
    LogService.logTrace(`Pausing security: ${address.toString()}`);

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters();
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(PAUSE_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async unpause(address: EvmAddress): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'unpause';
    LogService.logTrace(`Unpausing security: ${address.toString()}`);

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters();
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(UNPAUSE_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async grantRole(
    address: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'grantRole';
    LogService.logTrace(
      `Granting role ${role.toString()} to account: ${targetId.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(role, 'hex')))
      .addAddress(targetId.toString());
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(GRANT_ROLES_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async applyRoles(
    address: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'applyRoles';
    let gas = roles.length * GRANT_ROLES_GAS;
    gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

    // Create ContractFunctionParameters and add the parameters
    // Convert boolean array to byte array
    const byteArray = actives.map((val) => (val ? 0x01 : 0x00));
    const functionParameters = new ContractFunctionParameters()
      .addBytes32Array(
        roles.map((role) => new Uint8Array(Buffer.from(role, 'hex'))),
      )
      .addBytes(Buffer.from(byteArray))
      .addAddress(targetId.toString());
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(gas)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async revokeRole(
    address: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'revokeRole';
    LogService.logTrace(
      `Revoking role ${role.toString()} to account: ${targetId.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(role, 'hex')))
      .addAddress(targetId.toString());
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(GRANT_ROLES_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async renounceRole(
    address: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'renounceRole';
    LogService.logTrace(`Renounce role ${role.toString()}`);

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters().addBytes32(
      new Uint8Array(Buffer.from(role, 'hex')),
    );
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(RENOUNCE_ROLES_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'issueByPartition';
    LogService.logTrace(
      `Issue ${amount} ${security} to account: ${targetId.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'));
    const transaction = new ContractExecuteTransaction()
      .setContractId(security.toContractId().toString())
      .setGas(ISSUE_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async addToControlList(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'addToControlList';
    LogService.logTrace(
      `Adding account ${targetId.toString()} to a control list`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters().addAddress(
      targetId.toString(),
    );
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(ADD_TO_CONTROL_LIST_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async removeFromControlList(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'removeFromControlList';
    LogService.logTrace(
      `Removing account ${targetId.toString()} from a control list`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters().addAddress(
      targetId.toString(),
    );
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(REMOVE_FROM_CONTROL_LIST_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async controllerTransfer(
    address: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'controllerTransferByPartition';
    LogService.logTrace(
      `Force transfer ${amount} tokens from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(sourceId.toString())
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'))
      .addBytes(Buffer.from('0x', 'hex'));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(CONTROLLER_TRANSFER_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async controllerRedeem(
    address: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'controllerRedeemByPartition';
    LogService.logTrace(
      `Force redeem ${amount} tokens from account ${sourceId.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(sourceId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'))
      .addBytes(Buffer.from('0x', 'hex'));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(CONTROLLER_REDEEM_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async setDividends(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'setDividends';
    LogService.logTrace(
      `equity: ${address} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      amount : ${amount}  `,
    );

    const functionParameters = new ContractFunctionParameters()
      .addUint256(Long.fromString(recordDate.toHexString()))
      .addUint256(Long.fromString(executionDate.toHexString()))
      .addUint256(Long.fromString(amount.toHexString()));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(SET_DIVIDENDS_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async setVotingRights(
    address: EvmAddress,
    recordDate: BigDecimal,
    data: string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'setVoting';
    LogService.logTrace(
      `equity: ${address} ,
      recordDate :${recordDate} , `,
    );

    const functionParameters = new ContractFunctionParameters()
      .addUint256(Long.fromString(recordDate.toHexString()))
      .addString(data);

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(SET_VOTING_RIGHTS_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async setCoupon(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'setCoupon';
    LogService.logTrace(
      `bond: ${address} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      rate : ${rate}  `,
    );

    const functionParameters = new ContractFunctionParameters()
      .addUint256(Long.fromString(recordDate.toHexString()))
      .addUint256(Long.fromString(executionDate.toHexString()))
      .addUint256(Long.fromString(rate.toHexString()));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(SET_COUPON_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async takeSnapshot(
    address: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'takeSnapshot';
    LogService.logTrace(`Take snapshot of: ${address.toString()}`);

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TAKE_SNAPSHOT_GAS)
      .setFunction(FUNCTION_NAME, new ContractFunctionParameters());

    return this.signAndSendTransaction(transaction);
  }

  async setDocument(
    address: EvmAddress,
    name: string,
    uri: string,
    hash: string,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'setDocument';
    LogService.logTrace(
      `Setting document: ${name}, with ${uri}, and hash ${hash} for security ${address.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addString(name)
      .addString(uri)
      .addString(hash);

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(SET_DOCUMENT_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async removeDocument(
    address: EvmAddress,
    name: string,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'removeDocument';
    LogService.logTrace(
      `Removing document: ${name} for security ${address.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters().addString(name);

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(REMOVE_DOCUMENT_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async authorizeOperator(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'authorizeOperator';
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${address.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters().addAddress(
      targetId.toString(),
    );

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(AUTHORIZE_OPERATOR_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async revokeOperator(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'revokeOperator';
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${address.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters().addAddress(
      targetId.toString(),
    );

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(REVOKE_OPERATOR_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async authorizeOperatorByPartition(
    address: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'authorizeOperatorByPartition';
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${address.toString()} and partition ${partitionId}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(partitionId)))
      .addAddress(targetId.toString());

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(AUTHORIZE_OPERATOR_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async revokeOperatorByPartition(
    address: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'revokeOperatorByPartition';
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${address.toString()} and partition ${partitionId}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(partitionId)))
      .addAddress(targetId.toString());

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(REVOKE_OPERATOR_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async operatorTransferByPartition(
    address: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'operatorTransferByPartition';
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} from account ${sourceId.toString()} on partition ${partitionId}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(partitionId)))
      .addAddress(sourceId.toString())
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRANSFER_OPERATOR_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'setMaxSupply';
    LogService.logTrace(
      `Setting max supply ${maxSupply} for security ${security.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters().addUint256(
      Long.fromString(maxSupply.toHexString()),
    );

    const transaction = new ContractExecuteTransaction()
      .setContractId(security.toContractId().toString())
      .setGas(SET_MAX_SUPPLY_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async triggerPendingScheduledSnapshots(
    address: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'triggerPendingScheduledSnapshots';
    LogService.logTrace(
      `Triggering pending scheduled snapshots for ${address.toString()}`,
    );

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS)
      .setFunction(FUNCTION_NAME, new ContractFunctionParameters());

    return this.signAndSendTransaction(transaction);
  }

  async triggerScheduledSnapshots(
    address: EvmAddress,
    max: number,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'triggerScheduledSnapshots';
    LogService.logTrace(
      `Triggering up to ${max.toString()} pending scheduled snapshots for ${address.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters().addUint256(max);

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async lock(
    address: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'lockByPartition';
    LogService.logTrace(
      `Locking ${amount} tokens from account ${sourceId.toString()} until ${expirationDate}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addUint256(Long.fromString(amount.toHexString()))
      .addAddress(sourceId.toString())
      .addUint256(Long.fromString(expirationDate.toHexString()));

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(LOCK_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  async release(
    address: EvmAddress,
    sourceId: EvmAddress,
    lockId: number,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'releaseByPartition';
    LogService.logTrace(
      `Releasing lock ${lockId} from account ${sourceId.toString()}`,
    );

    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addUint256(lockId)
      .addAddress(sourceId.toString());

    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(RELEASE_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  // * Definition of the abstract methods
  abstract signAndSendTransaction(
    transaction: Transaction,
  ): Promise<TransactionResponse>;
}
