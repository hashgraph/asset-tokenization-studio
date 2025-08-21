import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
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
export type RegulationDataStruct = {
    regulationType: BigNumberish;
    regulationSubType: BigNumberish;
    dealSize: BigNumberish;
    accreditedInvestors: BigNumberish;
    maxNonAccreditedInvestors: BigNumberish;
    manualInvestorVerification: BigNumberish;
    internationalInvestors: BigNumberish;
    resaleHoldPeriod: BigNumberish;
};
export type RegulationDataStructOutput = [
    number,
    number,
    BigNumber,
    number,
    BigNumber,
    number,
    number,
    number
] & {
    regulationType: number;
    regulationSubType: number;
    dealSize: BigNumber;
    accreditedInvestors: number;
    maxNonAccreditedInvestors: BigNumber;
    manualInvestorVerification: number;
    internationalInvestors: number;
    resaleHoldPeriod: number;
};
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
export interface IFactory_Interface extends utils.Interface {
    functions: {
        "deployBond(((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bytes3,uint256,uint256,uint256),(uint256,uint256,uint256)),(uint8,uint8,(bool,string,string)))": FunctionFragment;
        "deployEquity(((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bool,bool,bool,bool,bool,bool,bool,uint8,bytes3,uint256)),(uint8,uint8,(bool,string,string)))": FunctionFragment;
        "getAppliedRegulationData(uint8,uint8)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "deployBond" | "deployEquity" | "getAppliedRegulationData"): FunctionFragment;
    encodeFunctionData(functionFragment: "deployBond", values: [IFactory_.BondDataStruct, FactoryRegulationDataStruct]): string;
    encodeFunctionData(functionFragment: "deployEquity", values: [IFactory_.EquityDataStruct, FactoryRegulationDataStruct]): string;
    encodeFunctionData(functionFragment: "getAppliedRegulationData", values: [BigNumberish, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "deployBond", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deployEquity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAppliedRegulationData", data: BytesLike): Result;
    events: {
        "BondDeployed(address,address,((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bytes3,uint256,uint256,uint256),(uint256,uint256,uint256)),(uint8,uint8,(bool,string,string)))": EventFragment;
        "EquityDeployed(address,address,((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bool,bool,bool,bool,bool,bool,bool,uint8,bytes3,uint256)),(uint8,uint8,(bool,string,string)))": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "BondDeployed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "EquityDeployed"): EventFragment;
}
export interface BondDeployedEventObject {
    deployer: string;
    bondAddress: string;
    bondData: IFactory_.BondDataStructOutput;
    regulationData: FactoryRegulationDataStructOutput;
}
export type BondDeployedEvent = TypedEvent<[
    string,
    string,
    IFactory_.BondDataStructOutput,
    FactoryRegulationDataStructOutput
], BondDeployedEventObject>;
export type BondDeployedEventFilter = TypedEventFilter<BondDeployedEvent>;
export interface EquityDeployedEventObject {
    deployer: string;
    equityAddress: string;
    equityData: IFactory_.EquityDataStructOutput;
    regulationData: FactoryRegulationDataStructOutput;
}
export type EquityDeployedEvent = TypedEvent<[
    string,
    string,
    IFactory_.EquityDataStructOutput,
    FactoryRegulationDataStructOutput
], EquityDeployedEventObject>;
export type EquityDeployedEventFilter = TypedEventFilter<EquityDeployedEvent>;
export interface IFactory_ extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IFactory_Interface;
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
        deployBond(_bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        deployEquity(_equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getAppliedRegulationData(_regulationType: BigNumberish, _regulationSubType: BigNumberish, overrides?: CallOverrides): Promise<[
            RegulationDataStructOutput
        ] & {
            regulationData_: RegulationDataStructOutput;
        }>;
    };
    deployBond(_bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    deployEquity(_equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getAppliedRegulationData(_regulationType: BigNumberish, _regulationSubType: BigNumberish, overrides?: CallOverrides): Promise<RegulationDataStructOutput>;
    callStatic: {
        deployBond(_bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: CallOverrides): Promise<string>;
        deployEquity(_equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: CallOverrides): Promise<string>;
        getAppliedRegulationData(_regulationType: BigNumberish, _regulationSubType: BigNumberish, overrides?: CallOverrides): Promise<RegulationDataStructOutput>;
    };
    filters: {
        "BondDeployed(address,address,((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bytes3,uint256,uint256,uint256),(uint256,uint256,uint256)),(uint8,uint8,(bool,string,string)))"(deployer?: string | null, bondAddress?: null, bondData?: null, regulationData?: null): BondDeployedEventFilter;
        BondDeployed(deployer?: string | null, bondAddress?: null, bondData?: null, regulationData?: null): BondDeployedEventFilter;
        "EquityDeployed(address,address,((bool,bool,address,(bytes32,uint256),(bytes32,address[])[],bool,bool,uint256,(string,string,string,uint8),bool,bool,address[],address[],address[],address,address),(bool,bool,bool,bool,bool,bool,bool,uint8,bytes3,uint256)),(uint8,uint8,(bool,string,string)))"(deployer?: string | null, equityAddress?: null, equityData?: null, regulationData?: null): EquityDeployedEventFilter;
        EquityDeployed(deployer?: string | null, equityAddress?: null, equityData?: null, regulationData?: null): EquityDeployedEventFilter;
    };
    estimateGas: {
        deployBond(_bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        deployEquity(_equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getAppliedRegulationData(_regulationType: BigNumberish, _regulationSubType: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        deployBond(_bondData: IFactory_.BondDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        deployEquity(_equityData: IFactory_.EquityDataStruct, _factoryRegulationData: FactoryRegulationDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getAppliedRegulationData(_regulationType: BigNumberish, _regulationSubType: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
