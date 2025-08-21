import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export declare namespace IDiamondCutManager {
    type FacetConfigurationStruct = {
        id: BytesLike;
        version: BigNumberish;
    };
    type FacetConfigurationStructOutput = [string, BigNumber] & {
        id: string;
        version: BigNumber;
    };
}
export declare namespace IDiamondLoupe {
    type FacetStruct = {
        id: BytesLike;
        addr: string;
        selectors: BytesLike[];
        interfaceIds: BytesLike[];
    };
    type FacetStructOutput = [string, string, string[], string[]] & {
        id: string;
        addr: string;
        selectors: string[];
        interfaceIds: string[];
    };
}
export interface IDiamondCutManagerInterface extends utils.Interface {
    functions: {
        "cancelBatchConfiguration(bytes32)": FunctionFragment;
        "checkResolverProxyConfigurationRegistered(bytes32,uint256)": FunctionFragment;
        "createBatchConfiguration(bytes32,(bytes32,uint256)[],bool)": FunctionFragment;
        "createConfiguration(bytes32,(bytes32,uint256)[])": FunctionFragment;
        "getConfigurations(uint256,uint256)": FunctionFragment;
        "getConfigurationsLength()": FunctionFragment;
        "getFacetAddressByConfigurationIdVersionAndFacetId(bytes32,uint256,bytes32)": FunctionFragment;
        "getFacetAddressesByConfigurationIdAndVersion(bytes32,uint256,uint256,uint256)": FunctionFragment;
        "getFacetByConfigurationIdVersionAndFacetId(bytes32,uint256,bytes32)": FunctionFragment;
        "getFacetIdByConfigurationIdVersionAndSelector(bytes32,uint256,bytes4)": FunctionFragment;
        "getFacetIdsByConfigurationIdAndVersion(bytes32,uint256,uint256,uint256)": FunctionFragment;
        "getFacetSelectorsByConfigurationIdVersionAndFacetId(bytes32,uint256,bytes32,uint256,uint256)": FunctionFragment;
        "getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(bytes32,uint256,bytes32)": FunctionFragment;
        "getFacetsByConfigurationIdAndVersion(bytes32,uint256,uint256,uint256)": FunctionFragment;
        "getFacetsLengthByConfigurationIdAndVersion(bytes32,uint256)": FunctionFragment;
        "getLatestVersionByConfiguration(bytes32)": FunctionFragment;
        "isResolverProxyConfigurationRegistered(bytes32,uint256)": FunctionFragment;
        "resolveResolverProxyCall(bytes32,uint256,bytes4)": FunctionFragment;
        "resolveSupportsInterface(bytes32,uint256,bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "cancelBatchConfiguration" | "checkResolverProxyConfigurationRegistered" | "createBatchConfiguration" | "createConfiguration" | "getConfigurations" | "getConfigurationsLength" | "getFacetAddressByConfigurationIdVersionAndFacetId" | "getFacetAddressesByConfigurationIdAndVersion" | "getFacetByConfigurationIdVersionAndFacetId" | "getFacetIdByConfigurationIdVersionAndSelector" | "getFacetIdsByConfigurationIdAndVersion" | "getFacetSelectorsByConfigurationIdVersionAndFacetId" | "getFacetSelectorsLengthByConfigurationIdVersionAndFacetId" | "getFacetsByConfigurationIdAndVersion" | "getFacetsLengthByConfigurationIdAndVersion" | "getLatestVersionByConfiguration" | "isResolverProxyConfigurationRegistered" | "resolveResolverProxyCall" | "resolveSupportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "cancelBatchConfiguration", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "checkResolverProxyConfigurationRegistered", values: [BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "createBatchConfiguration", values: [BytesLike, IDiamondCutManager.FacetConfigurationStruct[], boolean]): string;
    encodeFunctionData(functionFragment: "createConfiguration", values: [BytesLike, IDiamondCutManager.FacetConfigurationStruct[]]): string;
    encodeFunctionData(functionFragment: "getConfigurations", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getConfigurationsLength", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFacetAddressByConfigurationIdVersionAndFacetId", values: [BytesLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetAddressesByConfigurationIdAndVersion", values: [BytesLike, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetByConfigurationIdVersionAndFacetId", values: [BytesLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetIdByConfigurationIdVersionAndSelector", values: [BytesLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetIdsByConfigurationIdAndVersion", values: [BytesLike, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetSelectorsByConfigurationIdVersionAndFacetId", values: [BytesLike, BigNumberish, BytesLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetSelectorsLengthByConfigurationIdVersionAndFacetId", values: [BytesLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetsByConfigurationIdAndVersion", values: [BytesLike, BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetsLengthByConfigurationIdAndVersion", values: [BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getLatestVersionByConfiguration", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "isResolverProxyConfigurationRegistered", values: [BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "resolveResolverProxyCall", values: [BytesLike, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "resolveSupportsInterface", values: [BytesLike, BigNumberish, BytesLike]): string;
    decodeFunctionResult(functionFragment: "cancelBatchConfiguration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "checkResolverProxyConfigurationRegistered", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createBatchConfiguration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createConfiguration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getConfigurations", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getConfigurationsLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetAddressByConfigurationIdVersionAndFacetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetAddressesByConfigurationIdAndVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetByConfigurationIdVersionAndFacetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetIdByConfigurationIdVersionAndSelector", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetIdsByConfigurationIdAndVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetSelectorsByConfigurationIdVersionAndFacetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetSelectorsLengthByConfigurationIdVersionAndFacetId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetsByConfigurationIdAndVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetsLengthByConfigurationIdAndVersion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLatestVersionByConfiguration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isResolverProxyConfigurationRegistered", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resolveResolverProxyCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resolveSupportsInterface", data: BytesLike): Result;
    events: {
        "DiamondBatchConfigurationCanceled(bytes32)": EventFragment;
        "DiamondBatchConfigurationCreated(bytes32,(bytes32,uint256)[],bool,uint256)": EventFragment;
        "DiamondConfigurationCreated(bytes32,(bytes32,uint256)[],uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "DiamondBatchConfigurationCanceled"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DiamondBatchConfigurationCreated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DiamondConfigurationCreated"): EventFragment;
}
export interface DiamondBatchConfigurationCanceledEventObject {
    configurationId: string;
}
export type DiamondBatchConfigurationCanceledEvent = TypedEvent<[
    string
], DiamondBatchConfigurationCanceledEventObject>;
export type DiamondBatchConfigurationCanceledEventFilter = TypedEventFilter<DiamondBatchConfigurationCanceledEvent>;
export interface DiamondBatchConfigurationCreatedEventObject {
    configurationId: string;
    facetConfigurations: IDiamondCutManager.FacetConfigurationStructOutput[];
    _isLastBatch: boolean;
    version: BigNumber;
}
export type DiamondBatchConfigurationCreatedEvent = TypedEvent<[
    string,
    IDiamondCutManager.FacetConfigurationStructOutput[],
    boolean,
    BigNumber
], DiamondBatchConfigurationCreatedEventObject>;
export type DiamondBatchConfigurationCreatedEventFilter = TypedEventFilter<DiamondBatchConfigurationCreatedEvent>;
export interface DiamondConfigurationCreatedEventObject {
    configurationId: string;
    facetConfigurations: IDiamondCutManager.FacetConfigurationStructOutput[];
    version: BigNumber;
}
export type DiamondConfigurationCreatedEvent = TypedEvent<[
    string,
    IDiamondCutManager.FacetConfigurationStructOutput[],
    BigNumber
], DiamondConfigurationCreatedEventObject>;
export type DiamondConfigurationCreatedEventFilter = TypedEventFilter<DiamondConfigurationCreatedEvent>;
export interface IDiamondCutManager extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IDiamondCutManagerInterface;
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
        cancelBatchConfiguration(_configurationId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        checkResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createBatchConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], _isLastBatch: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getConfigurations(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            configurationIds_: string[];
        }>;
        getConfigurationsLength(overrides?: CallOverrides): Promise<[BigNumber] & {
            configurationsLength_: BigNumber;
        }>;
        getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            facetAddress_: string;
        }>;
        getFacetAddressesByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetAddresses_: string[];
        }>;
        getFacetByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<[
            IDiamondLoupe.FacetStructOutput
        ] & {
            facet_: IDiamondLoupe.FacetStructOutput;
        }>;
        getFacetIdByConfigurationIdVersionAndSelector(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            facetId_: string;
        }>;
        getFacetIdsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetIds_: string[];
        }>;
        getFacetSelectorsByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetSelectors_: string[];
        }>;
        getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<[BigNumber] & {
            facetSelectorsLength_: BigNumber;
        }>;
        getFacetsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[
            IDiamondLoupe.FacetStructOutput[]
        ] & {
            facets_: IDiamondLoupe.FacetStructOutput[];
        }>;
        getFacetsLengthByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            facetsLength_: BigNumber;
        }>;
        getLatestVersionByConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<[BigNumber] & {
            latestVersion_: BigNumber;
        }>;
        isResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        resolveResolverProxyCall(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            facetAddress_: string;
        }>;
        resolveSupportsInterface(_configurationId: BytesLike, _version: BigNumberish, _interfaceId: BytesLike, overrides?: CallOverrides): Promise<[boolean] & {
            exists_: boolean;
        }>;
    };
    cancelBatchConfiguration(_configurationId: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    checkResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createBatchConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], _isLastBatch: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getConfigurations(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getConfigurationsLength(overrides?: CallOverrides): Promise<BigNumber>;
    getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<string>;
    getFacetAddressesByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput>;
    getFacetIdByConfigurationIdVersionAndSelector(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<string>;
    getFacetIdsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetSelectorsByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    getFacetsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
    getFacetsLengthByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getLatestVersionByConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    isResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    resolveResolverProxyCall(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<string>;
    resolveSupportsInterface(_configurationId: BytesLike, _version: BigNumberish, _interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        cancelBatchConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<void>;
        checkResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<void>;
        createBatchConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], _isLastBatch: boolean, overrides?: CallOverrides): Promise<void>;
        createConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], overrides?: CallOverrides): Promise<void>;
        getConfigurations(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getConfigurationsLength(overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<string>;
        getFacetAddressesByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput>;
        getFacetIdByConfigurationIdVersionAndSelector(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<string>;
        getFacetIdsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetSelectorsByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
        getFacetsLengthByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getLatestVersionByConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        isResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        resolveResolverProxyCall(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<string>;
        resolveSupportsInterface(_configurationId: BytesLike, _version: BigNumberish, _interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "DiamondBatchConfigurationCanceled(bytes32)"(configurationId?: null): DiamondBatchConfigurationCanceledEventFilter;
        DiamondBatchConfigurationCanceled(configurationId?: null): DiamondBatchConfigurationCanceledEventFilter;
        "DiamondBatchConfigurationCreated(bytes32,(bytes32,uint256)[],bool,uint256)"(configurationId?: null, facetConfigurations?: null, _isLastBatch?: null, version?: null): DiamondBatchConfigurationCreatedEventFilter;
        DiamondBatchConfigurationCreated(configurationId?: null, facetConfigurations?: null, _isLastBatch?: null, version?: null): DiamondBatchConfigurationCreatedEventFilter;
        "DiamondConfigurationCreated(bytes32,(bytes32,uint256)[],uint256)"(configurationId?: null, facetConfigurations?: null, version?: null): DiamondConfigurationCreatedEventFilter;
        DiamondConfigurationCreated(configurationId?: null, facetConfigurations?: null, version?: null): DiamondConfigurationCreatedEventFilter;
    };
    estimateGas: {
        cancelBatchConfiguration(_configurationId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        checkResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createBatchConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], _isLastBatch: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getConfigurations(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getConfigurationsLength(overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddressesByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetIdByConfigurationIdVersionAndSelector(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetIdsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetSelectorsByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetsLengthByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getLatestVersionByConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        isResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        resolveResolverProxyCall(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        resolveSupportsInterface(_configurationId: BytesLike, _version: BigNumberish, _interfaceId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        cancelBatchConfiguration(_configurationId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        checkResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createBatchConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], _isLastBatch: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createConfiguration(_configurationId: BytesLike, _facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getConfigurations(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getConfigurationsLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetAddressesByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetIdByConfigurationIdVersionAndSelector(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetIdsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetSelectorsByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(_configurationId: BytesLike, _version: BigNumberish, _facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetsByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetsLengthByConfigurationIdAndVersion(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getLatestVersionByConfiguration(_configurationId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isResolverProxyConfigurationRegistered(_configurationId: BytesLike, _version: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        resolveResolverProxyCall(_configurationId: BytesLike, _version: BigNumberish, _selector: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        resolveSupportsInterface(_configurationId: BytesLike, _version: BigNumberish, _interfaceId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
