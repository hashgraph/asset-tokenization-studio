import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
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
export interface DiamondLoupeFacetInterface extends utils.Interface {
    functions: {
        "getFacet(bytes32)": FunctionFragment;
        "getFacetAddress(bytes4)": FunctionFragment;
        "getFacetAddresses()": FunctionFragment;
        "getFacetAddressesByPage(uint256,uint256)": FunctionFragment;
        "getFacetIdBySelector(bytes4)": FunctionFragment;
        "getFacetIds()": FunctionFragment;
        "getFacetIdsByPage(uint256,uint256)": FunctionFragment;
        "getFacetSelectors(bytes32)": FunctionFragment;
        "getFacetSelectorsByPage(bytes32,uint256,uint256)": FunctionFragment;
        "getFacetSelectorsLength(bytes32)": FunctionFragment;
        "getFacets()": FunctionFragment;
        "getFacetsByPage(uint256,uint256)": FunctionFragment;
        "getFacetsLength()": FunctionFragment;
        "getStaticFunctionSelectors()": FunctionFragment;
        "getStaticInterfaceIds()": FunctionFragment;
        "getStaticResolverKey()": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getFacet" | "getFacetAddress" | "getFacetAddresses" | "getFacetAddressesByPage" | "getFacetIdBySelector" | "getFacetIds" | "getFacetIdsByPage" | "getFacetSelectors" | "getFacetSelectorsByPage" | "getFacetSelectorsLength" | "getFacets" | "getFacetsByPage" | "getFacetsLength" | "getStaticFunctionSelectors" | "getStaticInterfaceIds" | "getStaticResolverKey" | "supportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "getFacet", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetAddress", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetAddresses", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFacetAddressesByPage", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetIdBySelector", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetIds", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFacetIdsByPage", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetSelectors", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacetSelectorsByPage", values: [BytesLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetSelectorsLength", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getFacets", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFacetsByPage", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFacetsLength", values?: undefined): string;
    encodeFunctionData(functionFragment: "getStaticFunctionSelectors", values?: undefined): string;
    encodeFunctionData(functionFragment: "getStaticInterfaceIds", values?: undefined): string;
    encodeFunctionData(functionFragment: "getStaticResolverKey", values?: undefined): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [BytesLike]): string;
    decodeFunctionResult(functionFragment: "getFacet", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetAddresses", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetAddressesByPage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetIdBySelector", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetIds", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetIdsByPage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetSelectors", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetSelectorsByPage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetSelectorsLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetsByPage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFacetsLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getStaticFunctionSelectors", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getStaticInterfaceIds", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getStaticResolverKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    events: {
        "PartitionsProtected(address)": EventFragment;
        "PartitionsUnProtected(address)": EventFragment;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
        "TokenPaused(address)": EventFragment;
        "TokenUnpaused(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "PartitionsProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsUnProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedRedeemFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedTransferFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenPaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnpaused"): EventFragment;
}
export interface PartitionsProtectedEventObject {
    operator: string;
}
export type PartitionsProtectedEvent = TypedEvent<[
    string
], PartitionsProtectedEventObject>;
export type PartitionsProtectedEventFilter = TypedEventFilter<PartitionsProtectedEvent>;
export interface PartitionsUnProtectedEventObject {
    operator: string;
}
export type PartitionsUnProtectedEvent = TypedEvent<[
    string
], PartitionsUnProtectedEventObject>;
export type PartitionsUnProtectedEventFilter = TypedEventFilter<PartitionsUnProtectedEvent>;
export interface ProtectedRedeemFromEventObject {
    partition: string;
    operator: string;
    from: string;
    value: BigNumber;
    deadline: BigNumber;
    nounce: BigNumber;
    signature: string;
}
export type ProtectedRedeemFromEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string
], ProtectedRedeemFromEventObject>;
export type ProtectedRedeemFromEventFilter = TypedEventFilter<ProtectedRedeemFromEvent>;
export interface ProtectedTransferFromEventObject {
    partition: string;
    operator: string;
    from: string;
    to: string;
    value: BigNumber;
    deadline: BigNumber;
    nounce: BigNumber;
    signature: string;
}
export type ProtectedTransferFromEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string
], ProtectedTransferFromEventObject>;
export type ProtectedTransferFromEventFilter = TypedEventFilter<ProtectedTransferFromEvent>;
export interface RoleAdminChangedEventObject {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
}
export type RoleAdminChangedEvent = TypedEvent<[
    string,
    string,
    string
], RoleAdminChangedEventObject>;
export type RoleAdminChangedEventFilter = TypedEventFilter<RoleAdminChangedEvent>;
export interface TokenPausedEventObject {
    operator: string;
}
export type TokenPausedEvent = TypedEvent<[string], TokenPausedEventObject>;
export type TokenPausedEventFilter = TypedEventFilter<TokenPausedEvent>;
export interface TokenUnpausedEventObject {
    operator: string;
}
export type TokenUnpausedEvent = TypedEvent<[string], TokenUnpausedEventObject>;
export type TokenUnpausedEventFilter = TypedEventFilter<TokenUnpausedEvent>;
export interface DiamondLoupeFacet extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: DiamondLoupeFacetInterface;
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
        getFacet(_facetId: BytesLike, overrides?: CallOverrides): Promise<[
            IDiamondLoupe.FacetStructOutput
        ] & {
            facet_: IDiamondLoupe.FacetStructOutput;
        }>;
        getFacetAddress(_selector: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            facetAddress_: string;
        }>;
        getFacetAddresses(overrides?: CallOverrides): Promise<[string[]] & {
            facetAddresses_: string[];
        }>;
        getFacetAddressesByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetAddresses_: string[];
        }>;
        getFacetIdBySelector(_selector: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            facetId_: string;
        }>;
        getFacetIds(overrides?: CallOverrides): Promise<[string[]] & {
            facetIds_: string[];
        }>;
        getFacetIdsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetIds_: string[];
        }>;
        getFacetSelectors(_facetId: BytesLike, overrides?: CallOverrides): Promise<[string[]] & {
            facetSelectors_: string[];
        }>;
        getFacetSelectorsByPage(_facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            facetSelectors_: string[];
        }>;
        getFacetSelectorsLength(_facetId: BytesLike, overrides?: CallOverrides): Promise<[BigNumber] & {
            facetSelectorsLength_: BigNumber;
        }>;
        getFacets(overrides?: CallOverrides): Promise<[
            IDiamondLoupe.FacetStructOutput[]
        ] & {
            facets_: IDiamondLoupe.FacetStructOutput[];
        }>;
        getFacetsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[
            IDiamondLoupe.FacetStructOutput[]
        ] & {
            facets_: IDiamondLoupe.FacetStructOutput[];
        }>;
        getFacetsLength(overrides?: CallOverrides): Promise<[BigNumber] & {
            facetsLength_: BigNumber;
        }>;
        getStaticFunctionSelectors(overrides?: CallOverrides): Promise<[string[]] & {
            staticFunctionSelectors_: string[];
        }>;
        getStaticInterfaceIds(overrides?: CallOverrides): Promise<[string[]] & {
            staticInterfaceIds_: string[];
        }>;
        getStaticResolverKey(overrides?: CallOverrides): Promise<[string] & {
            staticResolverKey_: string;
        }>;
        supportsInterface(_interfaceId: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;
    };
    getFacet(_facetId: BytesLike, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput>;
    getFacetAddress(_selector: BytesLike, overrides?: CallOverrides): Promise<string>;
    getFacetAddresses(overrides?: CallOverrides): Promise<string[]>;
    getFacetAddressesByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetIdBySelector(_selector: BytesLike, overrides?: CallOverrides): Promise<string>;
    getFacetIds(overrides?: CallOverrides): Promise<string[]>;
    getFacetIdsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetSelectors(_facetId: BytesLike, overrides?: CallOverrides): Promise<string[]>;
    getFacetSelectorsByPage(_facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getFacetSelectorsLength(_facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    getFacets(overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
    getFacetsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
    getFacetsLength(overrides?: CallOverrides): Promise<BigNumber>;
    getStaticFunctionSelectors(overrides?: CallOverrides): Promise<string[]>;
    getStaticInterfaceIds(overrides?: CallOverrides): Promise<string[]>;
    getStaticResolverKey(overrides?: CallOverrides): Promise<string>;
    supportsInterface(_interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        getFacet(_facetId: BytesLike, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput>;
        getFacetAddress(_selector: BytesLike, overrides?: CallOverrides): Promise<string>;
        getFacetAddresses(overrides?: CallOverrides): Promise<string[]>;
        getFacetAddressesByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetIdBySelector(_selector: BytesLike, overrides?: CallOverrides): Promise<string>;
        getFacetIds(overrides?: CallOverrides): Promise<string[]>;
        getFacetIdsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetSelectors(_facetId: BytesLike, overrides?: CallOverrides): Promise<string[]>;
        getFacetSelectorsByPage(_facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getFacetSelectorsLength(_facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacets(overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
        getFacetsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<IDiamondLoupe.FacetStructOutput[]>;
        getFacetsLength(overrides?: CallOverrides): Promise<BigNumber>;
        getStaticFunctionSelectors(overrides?: CallOverrides): Promise<string[]>;
        getStaticInterfaceIds(overrides?: CallOverrides): Promise<string[]>;
        getStaticResolverKey(overrides?: CallOverrides): Promise<string>;
        supportsInterface(_interfaceId: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "PartitionsProtected(address)"(operator?: string | null): PartitionsProtectedEventFilter;
        PartitionsProtected(operator?: string | null): PartitionsProtectedEventFilter;
        "PartitionsUnProtected(address)"(operator?: string | null): PartitionsUnProtectedEventFilter;
        PartitionsUnProtected(operator?: string | null): PartitionsUnProtectedEventFilter;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        ProtectedRedeemFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        ProtectedTransferFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        "RoleAdminChanged(bytes32,bytes32,bytes32)"(role?: BytesLike | null, previousAdminRole?: BytesLike | null, newAdminRole?: BytesLike | null): RoleAdminChangedEventFilter;
        RoleAdminChanged(role?: BytesLike | null, previousAdminRole?: BytesLike | null, newAdminRole?: BytesLike | null): RoleAdminChangedEventFilter;
        "TokenPaused(address)"(operator?: string | null): TokenPausedEventFilter;
        TokenPaused(operator?: string | null): TokenPausedEventFilter;
        "TokenUnpaused(address)"(operator?: string | null): TokenUnpausedEventFilter;
        TokenUnpaused(operator?: string | null): TokenUnpausedEventFilter;
    };
    estimateGas: {
        getFacet(_facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddress(_selector: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddresses(overrides?: CallOverrides): Promise<BigNumber>;
        getFacetAddressesByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetIdBySelector(_selector: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetIds(overrides?: CallOverrides): Promise<BigNumber>;
        getFacetIdsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetSelectors(_facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetSelectorsByPage(_facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetSelectorsLength(_facetId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getFacets(overrides?: CallOverrides): Promise<BigNumber>;
        getFacetsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getFacetsLength(overrides?: CallOverrides): Promise<BigNumber>;
        getStaticFunctionSelectors(overrides?: CallOverrides): Promise<BigNumber>;
        getStaticInterfaceIds(overrides?: CallOverrides): Promise<BigNumber>;
        getStaticResolverKey(overrides?: CallOverrides): Promise<BigNumber>;
        supportsInterface(_interfaceId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        getFacet(_facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetAddress(_selector: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetAddresses(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetAddressesByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetIdBySelector(_selector: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetIds(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetIdsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetSelectors(_facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetSelectorsByPage(_facetId: BytesLike, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetSelectorsLength(_facetId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacets(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetsByPage(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFacetsLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getStaticFunctionSelectors(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getStaticInterfaceIds(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getStaticResolverKey(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supportsInterface(_interfaceId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
