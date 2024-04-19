import type {
  ApplyRolesRequest,
  BalanceViewModel,
  ControlListRequest,
  CreateEquityRequest,
  DividendsForViewModel,
  DividendsViewModel,
  ForceRedeemRequest,
  ForceTransferRequest,
  GetAccountBalanceRequest,
  GetAllDividendsRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  GetControlListTypeRequest,
  GetDividendsForRequest,
  GetDividendsRequest,
  GetSecurityDetailsRequest,
  GetRoleCountForRequest,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  GetRolesForRequest,
  InitializationData,
  IssueRequest,
  PauseRequest,
  RedeemRequest,
  RoleRequest,
  SecurityControlListType,
  SecurityViewModel,
  TransferRequest,
  WalletEvent,
  SetMaxSupplyRequest,
  GetMaxSupplyRequest,
  MaxSupplyViewModel,
  GetEquityDetailsRequest,
  GetBondDetailsRequest,
  GetCouponDetailsRequest,
  EquityDetailsViewModel,
  CreateBondRequest,
  BondDetailsViewModel,
  CouponDetailsViewModel,
  GetVotingRightsForRequest,
  GetVotingRightsRequest,
  SetVotingRightsRequest,
  GetAllVotingRightsRequest,
  VotingRightsViewModel,
  VotingRightsForViewModel,
  SetCouponRequest,
  GetCouponForRequest,
  CouponForViewModel,
  GetCouponRequest,
  CouponViewModel,
  GetAllCouponsRequest,
  LockRequest,
  ReleaseRequest,
  GetLockedBalanceRequest,
  GetRegulationDetailsRequest,
  RegulationViewModel,
} from "@iob/securitytoken-sdk";
import {
  Bond,
  ConnectRequest,
  Equity,
  Factory,
  InitializationRequest,
  Network,
  Role,
  Security,
  SetDividendsRequest,
  SupportedWallets,
} from "@iob/securitytoken-sdk";

export class SDKService {
  static initData?: InitializationData = undefined;
  static testnetNetwork = "testnet";
  static testnetMirrorNode = {
    baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
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
    baseUrl: "https://testnet.hashio.io/api",
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
  static testnetResolverAddress = "0.0.3532144";
  static testnetFactoryAddress = "0.0.3532205";
  static testnetBusinessLogicKeysCommon = [
    "0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6",
    "0xfbb1491bfcecd95f79409bd5a4b69a4ba1e5573573372f5d2d66c11e3016414c",
    "0x9429fd9ef38f89f41bd9ec33fd5c94b287ed1c27a98938da43835ac761b2f92c",
    "0xfb3f8aac36661b5540c571d821c80dc9db7ede5ca2a4204ee562b3356f0c026b",
    "0x064c883089ba1a596d9146c7aaa73c19ef8825f374c67a9538787c3d12e68dc5",
    "0xcb70773e8163595d8bd906e277adeb3935976ad802ee8c29face3dfb0263291f",
    "0x24543637956a3076689f171d3932b10f22d40f3785d53acebb340f37bed01625",
    "0x0d714ae58404788b445b639b0a0bcf37eeeb2e661bfa542569f5555a9a40b5b2",
    "0xf1da2ed271d62ba0b6597874c96fb6ed7d929e5ec679f4ad8c2c516c72f6736d",
    "0x9a3fc46d83536ef6b87eb4fec37302bfd1a7c18e81ea2da853b911b44cf5b0cf",
    "0x1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d78",
    "0x3cc74200ccfb5d585a6d170f8824979dbf1b592e0a41eef41cf6d86cf4882077",
    "0x100f681e33d02a1124c2c05a537a1229eca89767c5e6e8720066ca74bfb85793",
    "0xf1364345b3db5ebe5808f2d2d2aaecb9cdb4fddacad1534033060ebc886fc1e9",
    "0xd9b300e6bf7a143b8fd8cf1d4ab050e691c862bf0f57a7d49cc08c60efe68d08",
  ];
  static testnetBusinessLogicKeysEquity = [
    "0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810",
  ];
  static testnetBusinessLogicKeysBond = [
    "0x09c1d80a160a7250b5fabc46d06a7fa4067e6d7292047c5024584b43f17d55ef",
  ];
  static testnetConfiguration = {
    factoryAddress: this.testnetFactoryAddress,
    resolverAddress: this.testnetResolverAddress,
    businessLogicKeysCommon: this.testnetBusinessLogicKeysCommon,
    businessLogicKeysEquity: this.testnetBusinessLogicKeysEquity,
    businessLogicKeysBond: this.testnetBusinessLogicKeysBond,
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
  static businesslogicKeysCommon = {
    businesslogicKeys: [
      {
        businesslogicKeys: this.testnetBusinessLogicKeysCommon,
        environment: this.testnetNetwork,
      },
    ],
  };
  static businesslogicKeysEquity = {
    businesslogicKeys: [
      {
        businesslogicKeys: this.testnetBusinessLogicKeysEquity,
        environment: this.testnetNetwork,
      },
    ],
  };
  static businesslogicKeysBond = {
    businesslogicKeys: [
      {
        businesslogicKeys: this.testnetBusinessLogicKeysBond,
        environment: this.testnetNetwork,
      },
    ],
  };

  public static isInit() {
    return !!this.initData;
  }

  public static async connectWallet(wallet: SupportedWallets) {
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
        businessLogicKeysCommon: this.businesslogicKeysCommon,
        businessLogicKeysEquity: this.businesslogicKeysEquity,
        businessLogicKeysBond: this.businesslogicKeysBond,
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
    return await Equity.create(createRequest);
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
    return await Bond.create(createRequest);
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

  // COUPONS ////////////////////////////////////////////
  public static async setCoupon(req: SetCouponRequest): Promise<number> {
    return await Bond.setCoupon(req);
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
    return await Role.grantRole(req);
  }

  public static async revokeRole(req: RoleRequest): Promise<boolean> {
    return await Role.revokeRole(req);
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
    return await Role.applyRoles(req);
  }

  // CONTROL LIST ////////////////////////////////////////////
  public static async addToControlList(
    req: ControlListRequest,
  ): Promise<boolean> {
    return await Security.addToControlList(req);
  }

  public static async removeFromControlList(
    req: ControlListRequest,
  ): Promise<boolean> {
    return await Security.removeFromControlList(req);
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
    return await Security.issue(req);
  }

  // TRANSFER & REDEEM & BALANCES ////////////////////////////////////////////
  public static async transfer(req: TransferRequest): Promise<boolean> {
    return await Security.transfer(req);
  }

  public static async redeem(req: RedeemRequest): Promise<boolean> {
    return await Security.redeem(req);
  }

  public static async getBalanceOf(
    req: GetAccountBalanceRequest,
  ): Promise<BalanceViewModel> {
    return await Security.getBalanceOf(req);
  }

  // DIVIDENDS ////////////////////////////////////////////
  public static async setDividends(req: SetDividendsRequest): Promise<number> {
    return await Equity.setDividends(req);
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
    return await Security.controllerTransfer(req);
  }

  public static async controllerRedeem(
    req: ForceRedeemRequest,
  ): Promise<boolean> {
    return await Security.controllerRedeem(req);
  }

  // PAUSE ////////////////////////////////////////////
  public static async pause(req: PauseRequest): Promise<boolean> {
    return await Security.pause(req);
  }

  public static async unpause(req: PauseRequest): Promise<boolean> {
    return await Security.unpause(req);
  }

  public static async isPaused(req: PauseRequest): Promise<boolean> {
    return await Security.isPaused(req);
  }

  // CAP ////////////////////////////////////////////
  public static async setMaxSupply(req: SetMaxSupplyRequest): Promise<boolean> {
    return await Security.setMaxSupply(req);
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
    return await Equity.setVotingRights(req);
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
    return await Security.lock(req);
  }

  public static async release(req: ReleaseRequest): Promise<boolean> {
    return await Security.release(req);
  }

  public static async getLockedBalanceOf(
    req: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel> {
    return await Security.getLockedBalanceOf(req);
  }
}

export default SDKService;
