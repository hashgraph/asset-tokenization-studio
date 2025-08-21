import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export type AdditionalSecurityDataStruct = {
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
};
export type AdditionalSecurityDataStructOutput = [boolean, string, string] & {
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
};
export type FactoryRegulationDataStruct = {
    regulationType: BigNumberish;
    regulationSubType: BigNumberish;
    additionalSecurityData: AdditionalSecurityDataStruct;
};
export type FactoryRegulationDataStructOutput = [
    number,
    number,
    AdditionalSecurityDataStructOutput
] & {
    regulationType: number;
    regulationSubType: number;
    additionalSecurityData: AdditionalSecurityDataStructOutput;
};
export declare namespace ITREXFactory {
    type TokenDetailsStruct = {
        owner: string;
        name: string;
        symbol: string;
        decimals: BigNumberish;
        irs: string;
        ONCHAINID: string;
        irAgents: string[];
        tokenAgents: string[];
        complianceModules: string[];
        complianceSettings: BytesLike[];
    };
    type TokenDetailsStructOutput = [
        string,
        string,
        string,
        number,
        string,
        string,
        string[],
        string[],
        string[],
        string[]
    ] & {
        owner: string;
        name: string;
        symbol: string;
        decimals: number;
        irs: string;
        ONCHAINID: string;
        irAgents: string[];
        tokenAgents: string[];
        complianceModules: string[];
        complianceSettings: string[];
    };
    type ClaimDetailsStruct = {
        claimTopics: BigNumberish[];
        issuers: string[];
        issuerClaims: BigNumberish[][];
    };
    type ClaimDetailsStructOutput = [
        BigNumber[],
        string[],
        BigNumber[][]
    ] & {
        claimTopics: BigNumber[];
        issuers: string[];
        issuerClaims: BigNumber[][];
    };
}
export declare namespace TREXFactoryAts {
    type TokenDetailsAtsStruct = {
        owner: string;
        irs: string;
        ONCHAINID: string;
        irAgents: string[];
        tokenAgents: string[];
        complianceModules: string[];
        complianceSettings: BytesLike[];
    };
    type TokenDetailsAtsStructOutput = [
        string,
        string,
        string,
        string[],
        string[],
        string[],
        string[]
    ] & {
        owner: string;
        irs: string;
        ONCHAINID: string;
        irAgents: string[];
        tokenAgents: string[];
        complianceModules: string[];
        complianceSettings: string[];
    };
}
export declare namespace IFactory_ {
    type ResolverProxyConfigurationStruct = {
        key: BytesLike;
        version: BigNumberish;
    };
    type ResolverProxyConfigurationStructOutput = [string, BigNumber] & {
        key: string;
        version: BigNumber;
    };
    type ERC20MetadataInfoStruct = {
        name: string;
        symbol: string;
        isin: string;
        decimals: BigNumberish;
    };
    type ERC20MetadataInfoStructOutput = [
        string,
        string,
        string,
        number
    ] & {
        name: string;
        symbol: string;
        isin: string;
        decimals: number;
    };
    type SecurityDataStruct = {
        arePartitionsProtected: boolean;
        isMultiPartition: boolean;
        resolver: string;
        resolverProxyConfiguration: IFactory_.ResolverProxyConfigurationStruct;
        rbacs: IResolverProxy_.RbacStruct[];
        isControllable: boolean;
        isWhiteList: boolean;
        maxSupply: BigNumberish;
        erc20MetadataInfo: IFactory_.ERC20MetadataInfoStruct;
        clearingActive: boolean;
        internalKycActivated: boolean;
        externalPauses: string[];
        externalControlLists: string[];
        externalKycLists: string[];
        compliance: string;
        identityRegistry: string;
    };
    type SecurityDataStructOutput = [
        boolean,
        boolean,
        string,
        IFactory_.ResolverProxyConfigurationStructOutput,
        IResolverProxy_.RbacStructOutput[],
        boolean,
        boolean,
        BigNumber,
        IFactory_.ERC20MetadataInfoStructOutput,
        boolean,
        boolean,
        string[],
        string[],
        string[],
        string,
        string
    ] & {
        arePartitionsProtected: boolean;
        isMultiPartition: boolean;
        resolver: string;
        resolverProxyConfiguration: IFactory_.ResolverProxyConfigurationStructOutput;
        rbacs: IResolverProxy_.RbacStructOutput[];
        isControllable: boolean;
        isWhiteList: boolean;
        maxSupply: BigNumber;
        erc20MetadataInfo: IFactory_.ERC20MetadataInfoStructOutput;
        clearingActive: boolean;
        internalKycActivated: boolean;
        externalPauses: string[];
        externalControlLists: string[];
        externalKycLists: string[];
        compliance: string;
        identityRegistry: string;
    };
    type BondDataStruct = {
        security: IFactory_.SecurityDataStruct;
        bondDetails: IBond_.BondDetailsDataStruct;
        couponDetails: IBond_.CouponDetailsDataStruct;
    };
    type BondDataStructOutput = [
        IFactory_.SecurityDataStructOutput,
        IBond_.BondDetailsDataStructOutput,
        IBond_.CouponDetailsDataStructOutput
    ] & {
        security: IFactory_.SecurityDataStructOutput;
        bondDetails: IBond_.BondDetailsDataStructOutput;
        couponDetails: IBond_.CouponDetailsDataStructOutput;
    };
    type EquityDataStruct = {
        security: IFactory_.SecurityDataStruct;
        equityDetails: IEquity_.EquityDetailsDataStruct;
    };
    type EquityDataStructOutput = [
        IFactory_.SecurityDataStructOutput,
        IEquity_.EquityDetailsDataStructOutput
    ] & {
        security: IFactory_.SecurityDataStructOutput;
        equityDetails: IEquity_.EquityDetailsDataStructOutput;
    };
}
export declare namespace IResolverProxy_ {
    type RbacStruct = {
        role: BytesLike;
        members: string[];
    };
    type RbacStructOutput = [string, string[]] & {
        role: string;
        members: string[];
    };
}
export declare namespace IBond_ {
    type BondDetailsDataStruct = {
        currency: BytesLike;
        nominalValue: BigNumberish;
        startingDate: BigNumberish;
        maturityDate: BigNumberish;
    };
    type BondDetailsDataStructOutput = [
        string,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        currency: string;
        nominalValue: BigNumber;
        startingDate: BigNumber;
        maturityDate: BigNumber;
    };
    type CouponDetailsDataStruct = {
        couponFrequency: BigNumberish;
        couponRate: BigNumberish;
        firstCouponDate: BigNumberish;
    };
    type CouponDetailsDataStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        couponFrequency: BigNumber;
        couponRate: BigNumber;
        firstCouponDate: BigNumber;
    };
}
export declare namespace IEquity_ {
    type EquityDetailsDataStruct = {
        votingRight: boolean;
        informationRight: boolean;
        liquidationRight: boolean;
        subscriptionRight: boolean;
        conversionRight: boolean;
        redemptionRight: boolean;
        putRight: boolean;
        dividendRight: BigNumberish;
        currency: BytesLike;
        nominalValue: BigNumberish;
    };
    type EquityDetailsDataStructOutput = [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        number,
        string,
        BigNumber
    ] & {
        votingRight: boolean;
        informationRight: boolean;
        liquidationRight: boolean;
        subscriptionRight: boolean;
        conversionRight: boolean;
        redemptionRight: boolean;
        putRight: boolean;
        dividendRight: number;
        currency: string;
        nominalValue: BigNumber;
    };
}
export interface TREXFactoryAtsInterface extends utils.Interface {
    functions: {
        "deployTREXSuite(string,(address,string,string,uint8,address,address,address[],address[],address[],bytes[]),(uint256[],address[],uint256[][]))": FunctionFragment;
        "deployTREXSuiteAtsBond(string,(address,address,address,address[],address[],address[],bytes[]),(uint256[],address[],uint256[][]),((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bytes3,uint256,uint256,uint256),(uint256,uint256,uint256)),(uint8,uint8,(bool,string,string)))": FunctionFragment;
        "deployTREXSuiteAtsEquity(string,(address,address,address,address[],address[],address[],bytes[]),(uint256[],address[],uint256[][]),((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bool,bool,bool,bool,bool,bool,bool,uint8,bytes3,uint256)),(uint8,uint8,(bool,string,string)))": FunctionFragment;
        "getIdFactory()": FunctionFragment;
        "getImplementationAuthority()": FunctionFragment;
        "getToken(string)": FunctionFragment;
        "owner()": FunctionFragment;
        "recoverContractOwnership(address,address)": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "setAtsFactory(address)": FunctionFragment;
        "setIdFactory(address)": FunctionFragment;
        "setImplementationAuthority(address)": FunctionFragment;
        "tokenDeployed(string)": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "deployTREXSuite" | "deployTREXSuiteAtsBond" | "deployTREXSuiteAtsEquity" | "getIdFactory" | "getImplementationAuthority" | "getToken" | "owner" | "recoverContractOwnership" | "renounceOwnership" | "setAtsFactory" | "setIdFactory" | "setImplementationAuthority" | "tokenDeployed" | "transferOwnership"): FunctionFragment;
    encodeFunctionData(functionFragment: "deployTREXSuite", values: [
        string,
        ITREXFactory.TokenDetailsStruct,
        ITREXFactory.ClaimDetailsStruct
    ]): string;
    encodeFunctionData(functionFragment: "deployTREXSuiteAtsBond", values: [
        string,
        TREXFactoryAts.TokenDetailsAtsStruct,
        ITREXFactory.ClaimDetailsStruct,
        IFactory_.BondDataStruct,
        FactoryRegulationDataStruct
    ]): string;
    encodeFunctionData(functionFragment: "deployTREXSuiteAtsEquity", values: [
        string,
        TREXFactoryAts.TokenDetailsAtsStruct,
        ITREXFactory.ClaimDetailsStruct,
        IFactory_.EquityDataStruct,
        FactoryRegulationDataStruct
    ]): string;
    encodeFunctionData(functionFragment: "getIdFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "getImplementationAuthority", values?: undefined): string;
    encodeFunctionData(functionFragment: "getToken", values: [string]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "recoverContractOwnership", values: [string, string]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "setAtsFactory", values: [string]): string;
    encodeFunctionData(functionFragment: "setIdFactory", values: [string]): string;
    encodeFunctionData(functionFragment: "setImplementationAuthority", values: [string]): string;
    encodeFunctionData(functionFragment: "tokenDeployed", values: [string]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;
    decodeFunctionResult(functionFragment: "deployTREXSuite", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deployTREXSuiteAtsBond", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deployTREXSuiteAtsEquity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getIdFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getImplementationAuthority", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "recoverContractOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAtsFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setIdFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setImplementationAuthority", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenDeployed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    events: {
        "Deployed(address)": EventFragment;
        "IdFactorySet(address)": EventFragment;
        "ImplementationAuthoritySet(address)": EventFragment;
        "OwnershipTransferred(address,address)": EventFragment;
        "TREXSuiteDeployed(address,address,address,address,address,address,string)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Deployed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IdFactorySet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ImplementationAuthoritySet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TREXSuiteDeployed"): EventFragment;
}
export interface DeployedEventObject {
    _addr: string;
}
export type DeployedEvent = TypedEvent<[string], DeployedEventObject>;
export type DeployedEventFilter = TypedEventFilter<DeployedEvent>;
export interface IdFactorySetEventObject {
    _idFactory: string;
}
export type IdFactorySetEvent = TypedEvent<[string], IdFactorySetEventObject>;
export type IdFactorySetEventFilter = TypedEventFilter<IdFactorySetEvent>;
export interface ImplementationAuthoritySetEventObject {
    _implementationAuthority: string;
}
export type ImplementationAuthoritySetEvent = TypedEvent<[
    string
], ImplementationAuthoritySetEventObject>;
export type ImplementationAuthoritySetEventFilter = TypedEventFilter<ImplementationAuthoritySetEvent>;
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface TREXSuiteDeployedEventObject {
    _token: string;
    _ir: string;
    _irs: string;
    _tir: string;
    _ctr: string;
    _mc: string;
    _salt: string;
}
export type TREXSuiteDeployedEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    string,
    string,
    string
], TREXSuiteDeployedEventObject>;
export type TREXSuiteDeployedEventFilter = TypedEventFilter<TREXSuiteDeployedEvent>;
export interface TREXFactoryAts extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: TREXFactoryAtsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        deployTREXSuite(_salt: string, _tokenDetails: ITREXFactory.TokenDetailsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        deployTREXSuiteAtsBond(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        deployTREXSuiteAtsEquity(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getIdFactory(overrides?: CallOverrides): Promise<[string]>;
        getImplementationAuthority(overrides?: CallOverrides): Promise<[string]>;
        getToken(_salt: string, overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        recoverContractOwnership(_contract: string, _newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setAtsFactory(_atsFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setIdFactory(_idFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setImplementationAuthority(_implementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        tokenDeployed(arg0: string, overrides?: CallOverrides): Promise<[string]>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    deployTREXSuite(_salt: string, _tokenDetails: ITREXFactory.TokenDetailsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    deployTREXSuiteAtsBond(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    deployTREXSuiteAtsEquity(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getIdFactory(overrides?: CallOverrides): Promise<string>;
    getImplementationAuthority(overrides?: CallOverrides): Promise<string>;
    getToken(_salt: string, overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    recoverContractOwnership(_contract: string, _newOwner: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    renounceOwnership(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setAtsFactory(_atsFactory: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setIdFactory(_idFactory: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setImplementationAuthority(_implementationAuthority: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    tokenDeployed(arg0: string, overrides?: CallOverrides): Promise<string>;
    transferOwnership(newOwner: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        deployTREXSuite(_salt: string, _tokenDetails: ITREXFactory.TokenDetailsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, overrides?: CallOverrides): Promise<void>;
        deployTREXSuiteAtsBond(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: CallOverrides): Promise<void>;
        deployTREXSuiteAtsEquity(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: CallOverrides): Promise<void>;
        getIdFactory(overrides?: CallOverrides): Promise<string>;
        getImplementationAuthority(overrides?: CallOverrides): Promise<string>;
        getToken(_salt: string, overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        recoverContractOwnership(_contract: string, _newOwner: string, overrides?: CallOverrides): Promise<void>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        setAtsFactory(_atsFactory: string, overrides?: CallOverrides): Promise<void>;
        setIdFactory(_idFactory: string, overrides?: CallOverrides): Promise<void>;
        setImplementationAuthority(_implementationAuthority: string, overrides?: CallOverrides): Promise<void>;
        tokenDeployed(arg0: string, overrides?: CallOverrides): Promise<string>;
        transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "Deployed(address)"(_addr?: string | null): DeployedEventFilter;
        Deployed(_addr?: string | null): DeployedEventFilter;
        "IdFactorySet(address)"(_idFactory?: null): IdFactorySetEventFilter;
        IdFactorySet(_idFactory?: null): IdFactorySetEventFilter;
        "ImplementationAuthoritySet(address)"(_implementationAuthority?: null): ImplementationAuthoritySetEventFilter;
        ImplementationAuthoritySet(_implementationAuthority?: null): ImplementationAuthoritySetEventFilter;
        "OwnershipTransferred(address,address)"(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        "TREXSuiteDeployed(address,address,address,address,address,address,string)"(_token?: string | null, _ir?: null, _irs?: null, _tir?: null, _ctr?: null, _mc?: null, _salt?: string | null): TREXSuiteDeployedEventFilter;
        TREXSuiteDeployed(_token?: string | null, _ir?: null, _irs?: null, _tir?: null, _ctr?: null, _mc?: null, _salt?: string | null): TREXSuiteDeployedEventFilter;
    };
    estimateGas: {
        deployTREXSuite(_salt: string, _tokenDetails: ITREXFactory.TokenDetailsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        deployTREXSuiteAtsBond(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        deployTREXSuiteAtsEquity(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getIdFactory(overrides?: CallOverrides): Promise<BigNumber>;
        getImplementationAuthority(overrides?: CallOverrides): Promise<BigNumber>;
        getToken(_salt: string, overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        recoverContractOwnership(_contract: string, _newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setAtsFactory(_atsFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setIdFactory(_idFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setImplementationAuthority(_implementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        tokenDeployed(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        deployTREXSuite(_salt: string, _tokenDetails: ITREXFactory.TokenDetailsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        deployTREXSuiteAtsBond(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        deployTREXSuiteAtsEquity(_salt: string, _tokenDetails: TREXFactoryAts.TokenDetailsAtsStruct, _claimDetails: ITREXFactory.ClaimDetailsStruct, _equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getIdFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getImplementationAuthority(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getToken(_salt: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        recoverContractOwnership(_contract: string, _newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setAtsFactory(_atsFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setIdFactory(_idFactory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setImplementationAuthority(_implementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        tokenDeployed(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
