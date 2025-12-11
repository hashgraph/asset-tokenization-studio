//SPDX-License-Identifier: Apache-2.0

import {
  ApplyRolesRequest,
  BalanceViewModel,
  Bond,
  BondDetailsViewModel,
  ConnectRequest,
  ControlListRequest,
  CouponForViewModel,
  CouponAmountForViewModel,
  PrincipalForViewModel,
  CouponViewModel,
  CreateBondRequest,
  CreateEquityRequest,
  DividendsForViewModel,
  DividendsViewModel,
  Equity,
  EquityDetailsViewModel,
  Factory,
  ForceRedeemRequest,
  ForceTransferRequest,
  GetAccountBalanceRequest,
  GetAllCouponsRequest,
  GetAllDividendsRequest,
  GetAllVotingRightsRequest,
  GetBondDetailsRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  GetControlListTypeRequest,
  GetCouponForRequest,
  GetPrincipalForRequest,
  GetCouponRequest,
  GetDividendsForRequest,
  GetDividendsRequest,
  GetEquityDetailsRequest,
  GetLockedBalanceRequest,
  GetMaxSupplyRequest,
  GetRegulationDetailsRequest,
  GetRoleCountForRequest,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  GetRolesForRequest,
  GetSecurityDetailsRequest,
  GetVotingRightsForRequest,
  GetVotingRightsRequest,
  InitializationData,
  InitializationRequest,
  IssueRequest,
  LockRequest,
  MaxSupplyViewModel,
  Network,
  PauseRequest,
  RedeemRequest,
  RegulationViewModel,
  ReleaseRequest,
  Role,
  RoleRequest,
  Security,
  SecurityControlListType,
  SecurityViewModel,
  SetCouponRequest,
  SetDividendsRequest,
  SetMaxSupplyRequest,
  SetVotingRightsRequest,
  SupportedWallets,
  TransferRequest,
  VotingRightsForViewModel,
  VotingRightsViewModel,
  WalletEvent,
  Management,
  UpdateConfigVersionRequest,
  UpdateResolverRequest,
  UpdateConfigRequest,
  GetConfigInfoRequest,
  ConfigInfoViewModel,
  UpdateMaturityDateRequest,
  SetScheduledBalanceAdjustmentRequest,
  GetScheduledBalanceAdjustmentRequest,
  ScheduledBalanceAdjustmentViewModel,
  GetAllScheduledBalanceAdjustmentsRequest,
  GetLocksIdRequest,
  GetLockRequest,
  LockViewModel,
  HoldViewModel,
  CreateHoldFromByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  GetHoldForByPartitionRequest,
  CreateHoldByPartitionRequest,
  ReclaimHoldByPartitionRequest,
  ReleaseHoldByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  GetHeldAmountForRequest,
  SsiManagement,
  GetRevocationRegistryAddressRequest,
  SetRevocationRegistryAddressRequest,
  GetIssuerListCountRequest,
  GetIssuerListMembersRequest,
  AddIssuerRequest,
  RemoveIssuerRequest,
  IsIssuerRequest,
  GetKycForRequest,
  GrantKycRequest,
  RevokeKycRequest,
  Kyc,
  KycViewModel,
  KycAccountDataViewModel,
  GetKycAccountsDataRequest,
  ActivateClearingRequest,
  DeactivateClearingRequest,
  ReclaimClearingOperationByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
  ApproveClearingOperationByPartitionRequest,
  ClearingCreateHoldByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  ClearingTransferByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  IsClearingActivatedRequest,
  ClearingTransferViewModel,
  GetClearingTransferForByPartitionRequest,
  ClearingRedeemViewModel,
  GetClearingRedeemForByPartitionRequest,
  GetClearingCreateHoldForByPartitionRequest,
  ClearingCreateHoldViewModel,
  GetClearedAmountForRequest,
  ExternalPausesManagement,
  AddExternalPauseRequest,
  UpdateExternalPausesRequest,
  IsExternalPauseRequest,
  GetExternalPausesCountRequest,
  GetExternalPausesMembersRequest,
  IsPausedMockRequest,
  SetPausedMockRequest,
  RemoveExternalPauseRequest,
  ExternalControlListsManagement,
  AddExternalControlListRequest,
  GetExternalControlListsCountRequest,
  GetExternalControlListsMembersRequest,
  IsExternalControlListRequest,
  RemoveExternalControlListRequest,
  UpdateExternalControlListsRequest,
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
  IsAuthorizedBlackListMockRequest,
  IsAuthorizedWhiteListMockRequest,
  RemoveFromBlackListMockRequest,
  RemoveFromWhiteListMockRequest,
  ExternalKycListsManagement,
  GetExternalKycListsCountRequest,
  GetExternalKycListsMembersRequest,
  IsExternalKycListRequest,
  IsExternallyGrantedRequest,
  UpdateExternalKycListsRequest,
  RemoveExternalKycListRequest,
  AddExternalKycListRequest,
  RevokeKycMockRequest,
  GrantKycMockRequest,
  GetKycStatusMockRequest,
  IsInternalKycActivatedRequest,
  ActivateInternalKycRequest,
  DeactivateInternalKycRequest,
  FreezePartialTokensRequest,
  UnfreezePartialTokensRequest,
  GetFrozenPartialTokensRequest,
  ComplianceRequest,
  IdentityRegistryRequest,
  GetCouponHoldersRequest,
  GetTotalCouponHoldersRequest,
  GetTotalDividendHoldersRequest,
  GetDividendHoldersRequest,
  GetTotalVotingHoldersRequest,
  GetVotingHoldersRequest,
  SetComplianceRequest,
  SetIdentityRegistryRequest,
  AddProceedRecipientRequest,
  RemoveProceedRecipientRequest,
  UpdateProceedRecipientDataRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
  IsProceedRecipientRequest,
  GetProceedRecipientDataRequest,
  DividendAmountForViewModel,
  FullRedeemAtMaturityRequest,
} from "@hashgraph/asset-tokenization-sdk";

export class SDKService {
  static initData?: InitializationData = undefined;
  static testnetNetwork = "testnet";
  static testnetMirrorNode = {
    baseUrl: process.env.REACT_APP_MIRROR_NODE ?? "",
    apiKey: "",
    headerName: "",
  };
  static testnetMirrorNodes = {
    nodes: [
      {
        mirrorNode: this.testnetMirrorNode,
        environment: this.testnetNetwork,
      },
    ],
  };
  static testnetRPCNode = {
    baseUrl: process.env.REACT_APP_RPC_NODE ?? "",
    //baseUrl: "http://127.0.0.1:7546",
    apiKey: "",
    headerName: "",
  };
  static testnetRPCNodes = {
    nodes: [
      {
        jsonRpcRelay: this.testnetRPCNode,
        environment: this.testnetNetwork,
      },
    ],
  };
  static testnetResolverAddress = process.env.REACT_APP_RPC_RESOLVER ?? "0.0.0";
  static testnetFactoryAddress = process.env.REACT_APP_RPC_FACTORY ?? "0.0.0";

  static testnetConfiguration = {
    factoryAddress: this.testnetFactoryAddress,
    resolverAddress: this.testnetResolverAddress,
  };
  static factories = {
    factories: [
      {
        factory: this.testnetFactoryAddress,
        environment: this.testnetNetwork,
      },
    ],
  };
  static resolvers = {
    resolvers: [
      {
        resolver: this.testnetResolverAddress,
        environment: this.testnetNetwork,
      },
    ],
  };

  public static isInit() {
    return !!this.initData;
  }

  public static async connectWallet(wallet: SupportedWallets) {
    let hwcSettings;
    if (wallet === SupportedWallets.HWALLETCONNECT) {
      const projectId = process.env.REACT_APP_PROJECT_ID ?? "";
      const dappName = process.env.REACT_APP_DAPP_NAME ?? "";
      const dappDescription = process.env.REACT_APP_DAPP_DESCRIPTION ?? "";
      const dappURL = process.env.REACT_APP_DAPP_URL ?? "";
      const dappIcons = process.env.REACT_APP_DAPP_ICONS?.split(",") ?? [];

      if (projectId) {
        hwcSettings = {
          projectId,
          dappName,
          dappDescription,
          dappURL,
          dappIcons,
        };
      }
    }
    console.log(hwcSettings); // Placeholder usage to avoid TS6133
    this.initData = await Network.connect(
      new ConnectRequest({
        network: this.testnetNetwork,
        mirrorNode: this.testnetMirrorNode,
        rpcNode: this.testnetRPCNode,
        hwcSettings,
        wallet,
      }),
    );

    return this.initData;
  }

  public static async init(events: Partial<WalletEvent>) {
    try {
      const initReq: InitializationRequest = new InitializationRequest({
        network: this.testnetNetwork,
        mirrorNode: this.testnetMirrorNode,
        rpcNode: this.testnetRPCNode,
        events,
        configuration: this.testnetConfiguration,
        mirrorNodes: this.testnetMirrorNodes,
        jsonRpcRelays: this.testnetRPCNodes,
        factories: this.factories,
        resolvers: this.resolvers,
      });
      const init = await Network.init(initReq);

      return init;
    } catch (e) {
      console.error("Error initializing the Network : " + e);
      console.error(
        "There was an error initializing the network, please check your .env file and make sure the configuration is correct",
      );
    }
  }

  public static async disconnectWallet(): Promise<boolean> {
    return await Network.disconnect();
  }
  // FACTORY ////////////////////////////////////////////
  public static async getRegulationDetails(req: GetRegulationDetailsRequest): Promise<RegulationViewModel> {
    return await Factory.getRegulationDetails(req);
  }

  // SECURITY ////////////////////////////////////////////
  public static async getSecurityDetails(req: GetSecurityDetailsRequest): Promise<SecurityViewModel> {
    return await Security.getInfo(req);
  }

  // EQUITY ////////////////////////////////////////////
  public static async createEquity(
    createRequest: CreateEquityRequest,
  ): Promise<{ security: SecurityViewModel } | null> {
    const response = await Equity.create(createRequest);
    return response;
  }

  public static async getEquityDetails(req: GetEquityDetailsRequest): Promise<EquityDetailsViewModel> {
    return await Equity.getEquityDetails(req);
  }

  // BOND ////////////////////////////////////////////
  public static async createBond(createRequest: CreateBondRequest): Promise<{ security: SecurityViewModel } | null> {
    const response = await Bond.create(createRequest);
    return response;
  }

  public static async getBondDetails(req: GetBondDetailsRequest): Promise<BondDetailsViewModel> {
    return await Bond.getBondDetails(req);
  }

  public static async updateBondMaturityDate(req: UpdateMaturityDateRequest): Promise<boolean> {
    const response = await Bond.updateMaturityDate(req);
    return response.payload;
  }

  public static async getCompliance(req: ComplianceRequest): Promise<string> {
    return await Security.compliance(req);
  }

  public static async updateCompliance(req: SetComplianceRequest): Promise<{
    payload: boolean;
  }> {
    return await Security.setCompliance(req);
  }

  public static async getIdentityRegistry(req: IdentityRegistryRequest): Promise<string> {
    return await Security.identityRegistry(req);
  }

  public static async updateIdentityRegistry(req: SetIdentityRegistryRequest): Promise<{
    payload: boolean;
  }> {
    return await Security.setIdentityRegistry(req);
  }

  // Proceed Recipients
  public static async getProceedRecipientsCount(req: GetProceedRecipientsCountRequest): Promise<number> {
    const request = await Bond.getProceedRecipientsCount(req);
    return request.payload;
  }

  public static async getProceedRecipients(req: GetProceedRecipientsRequest): Promise<string[]> {
    const request = await Bond.getProceedRecipients(req);
    return request.payload;
  }

  public static async getProceedRecipientData(req: GetProceedRecipientDataRequest): Promise<string> {
    const request = await Bond.getProceedRecipientData(req);
    return request.payload;
  }

  public static async isProceedRecipient(req: IsProceedRecipientRequest): Promise<boolean> {
    const request = await Bond.isProceedRecipient(req);
    return request.payload;
  }

  public static async addProceedRecipient(req: AddProceedRecipientRequest): Promise<boolean> {
    const response = await Bond.addProceedRecipient(req);
    return response.payload;
  }

  public static async removeProceedRecipient(req: RemoveProceedRecipientRequest): Promise<boolean> {
    const response = await Bond.removeProceedRecipient(req);
    return response.payload;
  }

  public static async updateProceedRecipientData(req: UpdateProceedRecipientDataRequest): Promise<boolean> {
    const response = await Bond.updateProceedRecipientData(req);
    return response.payload;
  }

  // COUPONS ////////////////////////////////////////////
  public static async setCoupon(req: SetCouponRequest): Promise<number> {
    const response = await Bond.setCoupon(req);
    return response.payload;
  }

  public static async getCouponFor(req: GetCouponForRequest): Promise<CouponForViewModel> {
    return await Bond.getCouponFor(req);
  }

  public static async getCouponAmountFor(req: GetCouponForRequest): Promise<CouponAmountForViewModel> {
    return await Bond.getCouponAmountFor(req);
  }

  public static async getPrincipalFor(req: GetPrincipalForRequest): Promise<PrincipalForViewModel> {
    return await Bond.getPrincipalFor(req);
  }

  public static async getCoupon(req: GetCouponRequest): Promise<CouponViewModel> {
    return await Bond.getCoupon(req);
  }

  public static async getAllCoupons(req: GetAllCouponsRequest): Promise<CouponViewModel[]> {
    return await Bond.getAllCoupons(req);
  }

  public static async getCouponHolders(req: GetCouponHoldersRequest): Promise<string[]> {
    return await Bond.getCouponHolders(req);
  }

  public static async getTotalCouponHolders(req: GetTotalCouponHoldersRequest): Promise<number> {
    return await Bond.getTotalCouponHolders(req);
  }

  // ROLES ////////////////////////////////////////////
  public static async grantRole(req: RoleRequest): Promise<boolean> {
    const response = await Role.grantRole(req);
    return response.payload;
  }

  public static async revokeRole(req: RoleRequest): Promise<boolean> {
    const response = await Role.revokeRole(req);
    return response.payload;
  }

  public static async getRoleMemberCount(req: GetRoleMemberCountRequest): Promise<number> {
    return await Role.getRoleMemberCount(req);
  }

  public static async getRoleMembers(req: GetRoleMembersRequest): Promise<string[]> {
    return await Role.getRoleMembers(req);
  }

  public static async getRoleCountFor(req: GetRoleCountForRequest): Promise<number> {
    return await Role.getRoleCountFor(req);
  }

  public static async getRolesFor(req: GetRolesForRequest): Promise<string[]> {
    return await Role.getRolesFor(req);
  }

  public static async applyRoles(req: ApplyRolesRequest): Promise<boolean> {
    const response = await Role.applyRoles(req);
    return response.payload;
  }

  // CONTROL LIST ////////////////////////////////////////////
  public static async addToControlList(req: ControlListRequest): Promise<boolean> {
    const response = await Security.addToControlList(req);
    return response.payload;
  }

  public static async removeFromControlList(req: ControlListRequest): Promise<boolean> {
    const response = await Security.removeFromControlList(req);
    return response.payload;
  }

  public static async isAccountInControlList(req: ControlListRequest): Promise<boolean> {
    return await Security.isAccountInControlList(req);
  }

  public static async getControlListCount(req: GetControlListCountRequest): Promise<number> {
    return await Security.getControlListCount(req);
  }

  public static async getControlListMembers(req: GetControlListMembersRequest): Promise<string[]> {
    return await Security.getControlListMembers(req);
  }

  public static async getControlListType(req: GetControlListTypeRequest): Promise<SecurityControlListType> {
    return await Security.getControlListType(req);
  }

  // MINT ////////////////////////////////////////////
  public static async mint(req: IssueRequest): Promise<boolean> {
    const response = await Security.issue(req);
    return response.payload;
  }

  // FREEZE & UNFREEZE ////////////////////////////////////////////
  public static async freezePartialTokens(req: FreezePartialTokensRequest): Promise<boolean> {
    const response = await Security.freezePartialTokens(req);
    return response.payload;
  }

  public static async unfreezePartialTokens(req: UnfreezePartialTokensRequest): Promise<boolean> {
    const response = await Security.unfreezePartialTokens(req);
    return response.payload;
  }

  public static async getFrozenTokens(req: GetFrozenPartialTokensRequest): Promise<BalanceViewModel> {
    const response = await Security.getFrozenPartialTokens(req);
    return response;
  }

  // TRANSFER & REDEEM & BALANCES ////////////////////////////////////////////
  public static async transfer(req: TransferRequest): Promise<boolean> {
    const response = await Security.transfer(req);
    return response.payload;
  }

  public static async redeem(req: RedeemRequest): Promise<boolean> {
    const response = await Security.redeem(req);
    return response.payload;
  }

  public static async getBalanceOf(req: GetAccountBalanceRequest): Promise<BalanceViewModel> {
    return await Security.getBalanceOf(req);
  }

  // DIVIDENDS ////////////////////////////////////////////
  public static async setDividends(req: SetDividendsRequest): Promise<number> {
    const response = await Equity.setDividends(req);
    return response.payload;
  }

  public static async getDividendsFor(req: GetDividendsForRequest): Promise<DividendsForViewModel> {
    return await Equity.getDividendsFor(req);
  }

  public static async getDividendAmountFor(req: GetDividendsForRequest): Promise<DividendAmountForViewModel> {
    return await Equity.getDividendAmountFor(req);
  }

  public static async getDividends(req: GetDividendsRequest): Promise<DividendsViewModel> {
    return await Equity.getDividends(req);
  }

  public static async getAllDividends(req: GetAllDividendsRequest): Promise<DividendsViewModel[]> {
    return await Equity.getAllDividends(req);
  }

  public static async getDividendHolders(req: GetDividendHoldersRequest): Promise<string[]> {
    return await Equity.getDividendHolders(req);
  }

  public static async getTotalDividendHolders(req: GetTotalDividendHoldersRequest): Promise<number> {
    return await Equity.getTotalDividendHolders(req);
  }

  // SPLIT & REVERSE SPLIT ////////////////////////////////////////////
  public static async setScheduledBalanceAdjustmentRequest(req: SetScheduledBalanceAdjustmentRequest): Promise<number> {
    const response = await Equity.setScheduledBalanceAdjustment(req);
    return response.payload;
  }

  public static async getScheduledBalanceAdjustmentRequest(
    req: GetScheduledBalanceAdjustmentRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel> {
    return await Equity.getScheduledBalanceAdjustment(req);
  }

  public static async getAllScheduledBalanceAdjustmentRequest(
    req: GetAllScheduledBalanceAdjustmentsRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel[]> {
    return await Equity.getAllScheduledBalanceAdjustments(req);
  }

  // CONTROLLER ////////////////////////////////////////////
  public static async controllerTransfer(req: ForceTransferRequest): Promise<boolean> {
    const response = await Security.controllerTransfer(req);
    return response.payload;
  }

  public static async controllerRedeem(req: ForceRedeemRequest): Promise<boolean> {
    const response = await Security.controllerRedeem(req);
    return response.payload;
  }

  // PAUSE ////////////////////////////////////////////
  public static async pause(req: PauseRequest): Promise<boolean> {
    const response = await Security.pause(req);
    return response.payload;
  }

  public static async unpause(req: PauseRequest): Promise<boolean> {
    const response = await Security.unpause(req);
    return response.payload;
  }

  public static async isPaused(req: PauseRequest): Promise<boolean> {
    return await Security.isPaused(req);
  }

  // CAP ////////////////////////////////////////////
  public static async setMaxSupply(req: SetMaxSupplyRequest): Promise<boolean> {
    const response = await Security.setMaxSupply(req);
    return response.payload;
  }

  public static async getMaxSupply(req: GetMaxSupplyRequest): Promise<MaxSupplyViewModel> {
    return await Security.getMaxSupply(req);
  }

  // VOTING RIGHTS ////////////////////////////////////////////
  public static async setVotingRights(req: SetVotingRightsRequest): Promise<number> {
    const response = await Equity.setVotingRights(req);
    return response.payload;
  }

  public static async getAllVotingRights(req: GetAllVotingRightsRequest): Promise<VotingRightsViewModel[]> {
    return await Equity.getAllVotingRights(req);
  }

  public static async getVotingRightsFor(req: GetVotingRightsForRequest): Promise<VotingRightsForViewModel> {
    return await Equity.getVotingRightsFor(req);
  }

  public static async getVotingRights(req: GetVotingRightsRequest): Promise<VotingRightsViewModel> {
    return await Equity.getVotingRights(req);
  }

  public static async getVotingHolders(req: GetVotingHoldersRequest): Promise<string[]> {
    return await Equity.getVotingHolders(req);
  }

  public static async getTotalVotingHolders(req: GetTotalVotingHoldersRequest): Promise<number> {
    return await Equity.getTotalVotingHolders(req);
  }

  // HOLD ////////////////////////////////////////////
  public static async lock(req: LockRequest): Promise<boolean> {
    const response = await Security.lock(req);
    return response.payload;
  }

  public static async release(req: ReleaseRequest): Promise<boolean> {
    const response = await Security.release(req);
    return response.payload;
  }

  public static async getLockedBalanceOf(req: GetLockedBalanceRequest): Promise<BalanceViewModel> {
    return await Security.getLockedBalanceOf(req);
  }

  public static async getLocksId(req: GetLocksIdRequest): Promise<string[]> {
    return await Security.getLocksId(req);
  }

  public static async getLock(req: GetLockRequest): Promise<LockViewModel> {
    return await Security.getLock(req);
  }

  public static async getHoldsId(req: GetHoldsIdForByPartitionRequest): Promise<number[]> {
    return await Security.getHoldsIdForByPartition(req);
  }

  public static async getHoldDetails(req: GetHoldForByPartitionRequest): Promise<HoldViewModel> {
    return await Security.getHoldForByPartition(req);
  }

  public static async createHoldFromByPartition(req: CreateHoldFromByPartitionRequest): Promise<number> {
    const response = await Security.createHoldFromByPartition(req);
    return response.payload;
  }

  public static async controllerCreateHoldByPartition(req: CreateHoldFromByPartitionRequest): Promise<number> {
    const response = await Security.controllerCreateHoldByPartition(req);
    return response.payload;
  }

  public static async createHoldByPartition(req: CreateHoldByPartitionRequest): Promise<number> {
    const response = await Security.createHoldByPartition(req);
    return response.payload;
  }

  public static async reclaimHoldByPartition(req: ReclaimHoldByPartitionRequest): Promise<boolean> {
    const response = await Security.reclaimHoldByPartition(req);
    return response.payload;
  }

  public static async releaseHoldByPartition(req: ReleaseHoldByPartitionRequest): Promise<boolean> {
    const response = await Security.releaseHoldByPartition(req);
    return response.payload;
  }

  public static async executeHoldByPartition(req: ExecuteHoldByPartitionRequest): Promise<boolean> {
    const response = await Security.executeHoldByPartition(req);
    return response.payload;
  }

  public static async getHeldAmountFor(req: GetHeldAmountForRequest): Promise<number> {
    const response = await Security.getHeldAmountFor(req);
    return response;
  }

  // MANAGEMENT ////////////////////////////////////////////
  public static async getConfigInfo(req: GetConfigInfoRequest): Promise<ConfigInfoViewModel> {
    return await Management.getConfigInfo(req);
  }

  public static async updateSecurityConfigVersion(req: UpdateConfigVersionRequest): Promise<boolean> {
    const response = await Management.updateConfigVersion(req);
    return response.payload;
  }

  public static async updateSecurityConfig(req: UpdateConfigRequest): Promise<boolean> {
    const response = await Management.updateConfig(req);
    return response.payload;
  }

  public static async updateSecurityResolver(req: UpdateResolverRequest): Promise<boolean> {
    const response = await Management.updateResolver(req);
    return response.payload;
  }

  // DID MANAGEMENT ////////////////////////////////////////////
  public static async getRevocationRegistryAddress(req: GetRevocationRegistryAddressRequest): Promise<string> {
    return await SsiManagement.getRevocationRegistryAddress(req);
  }

  public static async setRevocationRegistryAddress(req: SetRevocationRegistryAddressRequest): Promise<boolean> {
    const response = await SsiManagement.setRevocationRegistryAddress(req);
    return response.payload;
  }

  public static async getIssuerListCount(req: GetIssuerListCountRequest): Promise<number> {
    return await SsiManagement.getIssuerListCount(req);
  }

  public static async getIssuerListMembers(req: GetIssuerListMembersRequest): Promise<string[]> {
    return await SsiManagement.getIssuerListMembers(req);
  }

  public static async addIssuer(req: AddIssuerRequest): Promise<boolean> {
    const response = await SsiManagement.addIssuer(req);
    return response.payload;
  }

  public static async removeIssuer(req: RemoveIssuerRequest): Promise<boolean> {
    const response = await SsiManagement.removeIssuer(req);
    return response.payload;
  }

  public static async isIssuer(req: IsIssuerRequest): Promise<boolean> {
    return await SsiManagement.isIssuer(req);
  }

  // KYC ////////////////////////////////////////////
  public static async getKYCFor(req: GetKycForRequest): Promise<KycViewModel> {
    return await Kyc.getKycFor(req);
  }

  public static async getKYCAccountsData(req: GetKycAccountsDataRequest): Promise<KycAccountDataViewModel[]> {
    return await Kyc.getKycAccountsData(req);
  }

  public static async grantKYC(req: GrantKycRequest): Promise<boolean> {
    const response = await Kyc.grantKyc(req);
    return response.payload;
  }

  public static async revokeKYC(req: RevokeKycRequest): Promise<boolean> {
    const response = await Kyc.revokeKyc(req);
    return response.payload;
  }

  public static async isInternalKycActivated(req: IsInternalKycActivatedRequest): Promise<boolean> {
    const response = await Kyc.isInternalKycActivated(req);
    return response;
  }

  public static async activateInternalKyc(req: ActivateInternalKycRequest): Promise<boolean> {
    const response = await Kyc.activateInternalKyc(req);
    return response.payload;
  }

  public static async deactivateInternalKyc(req: DeactivateInternalKycRequest): Promise<boolean> {
    const response = await Kyc.deactivateInternalKyc(req);
    return response.payload;
  }

  // CLEARING OPERATIONS ////////////////////////////////////////////
  public static async getClearingsIdForByPartition(request: GetClearingsIdForByPartitionRequest): Promise<number[]> {
    const response = await Security.getClearingsIdForByPartition(request);
    return response;
  }

  public static async getClearingTransferForByPartition(
    request: GetClearingTransferForByPartitionRequest,
  ): Promise<ClearingTransferViewModel> {
    const response = await Security.getClearingTransferForByPartition(request);
    return response;
  }

  public static async getClearingRedeemForByPartition(
    request: GetClearingRedeemForByPartitionRequest,
  ): Promise<ClearingRedeemViewModel> {
    const response = await Security.getClearingRedeemForByPartition(request);
    return response;
  }
  public static async getClearingCreateHoldForByPartition(
    request: GetClearingCreateHoldForByPartitionRequest,
  ): Promise<ClearingCreateHoldViewModel> {
    const response = await Security.getClearingCreateHoldForByPartition(request);
    return response;
  }

  public static async clearingTransferByPartition(request: ClearingTransferByPartitionRequest): Promise<number> {
    const response = await Security.clearingTransferByPartition(request);
    return response.payload;
  }

  public static async clearingRedeemByPartition(request: ClearingRedeemByPartitionRequest): Promise<number> {
    const response = await Security.clearingRedeemByPartition(request);
    return response.payload;
  }

  public static async clearingCreateHoldByPartition(request: ClearingCreateHoldByPartitionRequest): Promise<number> {
    const response = await Security.clearingCreateHoldByPartition(request);
    return response.payload;
  }

  public static async approveClearingOperationByPartition(
    request: ApproveClearingOperationByPartitionRequest,
  ): Promise<boolean> {
    const response = await Security.approveClearingOperationByPartition(request);
    return response.payload;
  }

  public static async cancelClearingOperationByPartition(
    request: CancelClearingOperationByPartitionRequest,
  ): Promise<boolean> {
    const response = await Security.cancelClearingOperationByPartition(request);
    return response.payload;
  }

  public static async reclaimClearingOperationByPartition(
    request: ReclaimClearingOperationByPartitionRequest,
  ): Promise<boolean> {
    const response = await Security.reclaimClearingOperationByPartition(request);
    return response.payload;
  }

  public static async activateClearing(request: ActivateClearingRequest): Promise<boolean> {
    const response = await Security.activateClearing(request);
    return response.payload;
  }

  public static async deactivateClearing(request: DeactivateClearingRequest): Promise<boolean> {
    const response = await Security.deactivateClearing(request);
    return response.payload;
  }

  public static async isClearingActivated(request: IsClearingActivatedRequest): Promise<boolean> {
    const response = await Security.isClearingActivated(request);
    return response;
  }

  public static async getClearedAmountFor(req: GetClearedAmountForRequest): Promise<number> {
    const response = await Security.getClearedAmountFor(req);
    return response;
  }

  // EXTERNAL PAUSES //////////////////////////////////////
  public static async addExternalPause(req: AddExternalPauseRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.addExternalPause(req);
    return response.payload;
  }

  public static async removeExternalPause(req: RemoveExternalPauseRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.removeExternalPause(req);
    return response.payload;
  }

  public static async updateExternalPauses(req: UpdateExternalPausesRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.updateExternalPauses(req);
    return response.payload;
  }

  public static async isExternalPause(req: IsExternalPauseRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.isExternalPause(req);
    return response;
  }

  public static async getExternalPausesCount(req: GetExternalPausesCountRequest): Promise<number> {
    const response = await ExternalPausesManagement.getExternalPausesCount(req);
    return response;
  }

  public static async getExternalPausesMembers(req: GetExternalPausesMembersRequest): Promise<string[]> {
    const response = await ExternalPausesManagement.getExternalPausesMembers(req);
    return response;
  }

  public static async isPauseMock(req: IsPausedMockRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.isPausedMock(req);
    return response;
  }

  public static async setPausedMock(req: SetPausedMockRequest): Promise<boolean> {
    const response = await ExternalPausesManagement.setPausedMock(req);
    return response.payload;
  }

  public static async createMock(): Promise<string> {
    const response = await ExternalPausesManagement.createMock();
    return response;
  }

  // External Control
  public static async createExternalBlackListMock(): Promise<string> {
    const response = await ExternalControlListsManagement.createExternalBlackListMock();
    return response;
  }

  public static async createExternalWhiteListMock(): Promise<string> {
    const response = await ExternalControlListsManagement.createExternalWhiteListMock();
    return response;
  }

  public static async addExternalControlList(req: AddExternalControlListRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.addExternalControlList(req);
    return response.payload;
  }

  public static async addToBlackListMock(req: AddToBlackListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.addToBlackListMock(req);
    return response.payload;
  }

  public static async addToWhiteListMock(req: AddToWhiteListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.addToWhiteListMock(req);
    return response.payload;
  }

  public static async removeExternalControlList(req: RemoveExternalControlListRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.removeExternalControlList(req);
    return response.payload;
  }

  public static async removeFromBlackListMock(req: RemoveFromBlackListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.removeFromBlackListMock(req);
    return response.payload;
  }

  public static async removeFromWhiteListMock(req: RemoveFromWhiteListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.removeFromWhiteListMock(req);
    return response.payload;
  }

  public static async updateExternalControlLists(req: UpdateExternalControlListsRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.updateExternalControlLists(req);
    return response.payload;
  }

  public static async getExternalControlListsCount(req: GetExternalControlListsCountRequest): Promise<number> {
    const response = await ExternalControlListsManagement.getExternalControlListsCount(req);
    return response;
  }

  public static async getExternalControlListsMembers(req: GetExternalControlListsMembersRequest): Promise<string[]> {
    const response = await ExternalControlListsManagement.getExternalControlListsMembers(req);
    return response;
  }

  public static async isExternalControlList(req: IsExternalControlListRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.isExternalControlList(req);
    return response;
  }

  public static async isAuthorizedBlackListMock(req: IsAuthorizedBlackListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.isAuthorizedBlackListMock(req);
    return response;
  }

  public static async isAuthorizedWhiteListMock(req: IsAuthorizedWhiteListMockRequest): Promise<boolean> {
    const response = await ExternalControlListsManagement.isAuthorizedWhiteListMock(req);
    return response;
  }

  // External KYC
  public static async createExternalKycMock(): Promise<string> {
    const response = await ExternalKycListsManagement.createExternalKycMock();
    return response;
  }

  public static async addExternalKycList(req: AddExternalKycListRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.addExternalKycList(req);
    return response.payload;
  }

  public static async grantKycMock(req: GrantKycMockRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.grantKycMock(req);
    return response.payload;
  }

  public static async revokeKycMock(req: RevokeKycMockRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.revokeKycMock(req);
    return response.payload;
  }

  public static async removeExternalKycList(req: RemoveExternalKycListRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.removeExternalKycList(req);
    return response.payload;
  }

  public static async updateExternalKycLists(req: UpdateExternalKycListsRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.updateExternalKycLists(req);
    return response.payload;
  }

  public static async getExternalKycListsCount(req: GetExternalKycListsCountRequest): Promise<number> {
    const response = await ExternalKycListsManagement.getExternalKycListsCount(req);
    return response;
  }

  public static async getExternalKycListsMembers(req: GetExternalKycListsMembersRequest): Promise<string[]> {
    const response = await ExternalKycListsManagement.getExternalKycListsMembers(req);
    return response;
  }

  public static async getKycStatusMock(req: GetKycStatusMockRequest): Promise<number> {
    const response = await ExternalKycListsManagement.getKycStatusMock(req);
    return response;
  }

  public static async isExternalKycList(req: IsExternalKycListRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.isExternalKycList(req);
    return response;
  }

  public static async isExternallyKycGranted(req: IsExternallyGrantedRequest): Promise<boolean> {
    const response = await ExternalKycListsManagement.isExternallyGranted(req);
    return response;
  }

  public static async fullRedeemAtMaturity(req: FullRedeemAtMaturityRequest): Promise<boolean> {
    const response = await Bond.fullRedeemAtMaturity(req);
    return response.payload;
  }
}

export default SDKService;
