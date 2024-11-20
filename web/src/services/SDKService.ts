import {
  ApplyRolesRequest,
  BalanceViewModel,
  Bond,
  BondDetailsViewModel,
  ConnectRequest,
  ControlListRequest,
  CouponDetailsViewModel,
  CouponForViewModel,
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
  GetCouponDetailsRequest,
  GetCouponForRequest,
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
    this.initData = await Network.connect(
      new ConnectRequest({
        network: this.testnetNetwork,
        mirrorNode: this.testnetMirrorNode,
        rpcNode: this.testnetRPCNode,
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
  public static async getRegulationDetails(
    req: GetRegulationDetailsRequest,
  ): Promise<RegulationViewModel> {
    return await Factory.getRegulationDetails(req);
  }

  // SECURITY ////////////////////////////////////////////
  public static async getSecurityDetails(
    req: GetSecurityDetailsRequest,
  ): Promise<SecurityViewModel> {
    return await Security.getInfo(req);
  }

  // EQUITY ////////////////////////////////////////////
  public static async createEquity(
    createRequest: CreateEquityRequest,
  ): Promise<{ security: SecurityViewModel } | null> {
    const response = await Equity.create(createRequest);
    return response;
  }

  public static async getEquityDetails(
    req: GetEquityDetailsRequest,
  ): Promise<EquityDetailsViewModel> {
    return await Equity.getEquityDetails(req);
  }

  // BOND ////////////////////////////////////////////
  public static async createBond(
    createRequest: CreateBondRequest,
  ): Promise<{ security: SecurityViewModel } | null> {
    const response = await Bond.create(createRequest);
    return response;
  }

  public static async getBondDetails(
    req: GetBondDetailsRequest,
  ): Promise<BondDetailsViewModel> {
    return await Bond.getBondDetails(req);
  }

  public static async getCouponDetails(
    req: GetCouponDetailsRequest,
  ): Promise<CouponDetailsViewModel> {
    return await Bond.getCouponDetails(req);
  }

  public static async updateBondMaturityDate(
    req: UpdateMaturityDateRequest,
  ): Promise<boolean> {
    const response = await Bond.updateMaturityDate(req);
    return response.payload;
  }

  // COUPONS ////////////////////////////////////////////
  public static async setCoupon(req: SetCouponRequest): Promise<number> {
    const response = await Bond.setCoupon(req);
    return response.payload;
  }

  public static async getCouponFor(
    req: GetCouponForRequest,
  ): Promise<CouponForViewModel> {
    return await Bond.getCouponFor(req);
  }

  public static async getCoupon(
    req: GetCouponRequest,
  ): Promise<CouponViewModel> {
    return await Bond.getCoupon(req);
  }

  public static async getAllCoupons(
    req: GetAllCouponsRequest,
  ): Promise<CouponViewModel[]> {
    return await Bond.getAllCoupons(req);
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

  public static async getRoleMemberCount(
    req: GetRoleMemberCountRequest,
  ): Promise<number> {
    return await Role.getRoleMemberCount(req);
  }

  public static async getRoleMembers(
    req: GetRoleMembersRequest,
  ): Promise<string[]> {
    return await Role.getRoleMembers(req);
  }

  public static async getRoleCountFor(
    req: GetRoleCountForRequest,
  ): Promise<number> {
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
  public static async addToControlList(
    req: ControlListRequest,
  ): Promise<boolean> {
    const response = await Security.addToControlList(req);
    return response.payload;
  }

  public static async removeFromControlList(
    req: ControlListRequest,
  ): Promise<boolean> {
    const response = await Security.removeFromControlList(req);
    return response.payload;
  }

  public static async isAccountInControlList(
    req: ControlListRequest,
  ): Promise<boolean> {
    return await Security.isAccountInControlList(req);
  }

  public static async getControlListCount(
    req: GetControlListCountRequest,
  ): Promise<number> {
    return await Security.getControlListCount(req);
  }

  public static async getControlListMembers(
    req: GetControlListMembersRequest,
  ): Promise<string[]> {
    return await Security.getControlListMembers(req);
  }

  public static async getControlListType(
    req: GetControlListTypeRequest,
  ): Promise<SecurityControlListType> {
    return await Security.getControlListType(req);
  }

  // MINT ////////////////////////////////////////////
  public static async mint(req: IssueRequest): Promise<boolean> {
    const response = await Security.issue(req);
    return response.payload;
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

  public static async getBalanceOf(
    req: GetAccountBalanceRequest,
  ): Promise<BalanceViewModel> {
    return await Security.getBalanceOf(req);
  }

  // DIVIDENDS ////////////////////////////////////////////
  public static async setDividends(req: SetDividendsRequest): Promise<number> {
    const response = await Equity.setDividends(req);
    return response.payload;
  }

  public static async getDividendsFor(
    req: GetDividendsForRequest,
  ): Promise<DividendsForViewModel> {
    return await Equity.getDividendsFor(req);
  }

  public static async getDividends(
    req: GetDividendsRequest,
  ): Promise<DividendsViewModel> {
    return await Equity.getDividends(req);
  }

  public static async getAllDividends(
    req: GetAllDividendsRequest,
  ): Promise<DividendsViewModel[]> {
    return await Equity.getAllDividends(req);
  }

  // CONTROLLER ////////////////////////////////////////////
  public static async controllerTransfer(
    req: ForceTransferRequest,
  ): Promise<boolean> {
    const response = await Security.controllerTransfer(req);
    return response.payload;
  }

  public static async controllerRedeem(
    req: ForceRedeemRequest,
  ): Promise<boolean> {
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

  public static async getMaxSupply(
    req: GetMaxSupplyRequest,
  ): Promise<MaxSupplyViewModel> {
    return await Security.getMaxSupply(req);
  }

  // VOTING RIGHTS ////////////////////////////////////////////
  public static async setVotingRights(
    req: SetVotingRightsRequest,
  ): Promise<number> {
    const response = await Equity.setVotingRights(req);
    return response.payload;
  }

  public static async getAllVotingRights(
    req: GetAllVotingRightsRequest,
  ): Promise<VotingRightsViewModel[]> {
    return await Equity.getAllVotingRights(req);
  }

  public static async getVotingRightsFor(
    req: GetVotingRightsForRequest,
  ): Promise<VotingRightsForViewModel> {
    return await Equity.getVotingRightsFor(req);
  }

  public static async getVotingRights(
    req: GetVotingRightsRequest,
  ): Promise<VotingRightsViewModel> {
    return await Equity.getVotingRights(req);
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

  public static async getLockedBalanceOf(
    req: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel> {
    return await Security.getLockedBalanceOf(req);
  }

  // MANAGEMENT ////////////////////////////////////////////
  public static async getConfigInfo(
    req: GetConfigInfoRequest,
  ): Promise<ConfigInfoViewModel> {
    return await Management.getConfigInfo(req);
  }

  public static async updateSecurityConfigVersion(
    req: UpdateConfigVersionRequest,
  ): Promise<boolean> {
    const response = await Management.updateConfigVersion(req);
    return response.payload;
  }

  public static async updateSecurityConfig(
    req: UpdateConfigRequest,
  ): Promise<boolean> {
    const response = await Management.updateConfig(req);
    return response.payload;
  }

  public static async updateSecurityResolver(
    req: UpdateResolverRequest,
  ): Promise<boolean> {
    const response = await Management.updateResolver(req);
    return response.payload;
  }
}

export default SDKService;
