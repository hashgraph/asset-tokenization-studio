import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface ClaimTopicsRegistryInterface extends utils.Interface {
    functions: {
        "addClaimTopic(uint256)": FunctionFragment;
        "getClaimTopics()": FunctionFragment;
        "init()": FunctionFragment;
        "owner()": FunctionFragment;
        "removeClaimTopic(uint256)": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addClaimTopic" | "getClaimTopics" | "init" | "owner" | "removeClaimTopic" | "renounceOwnership" | "transferOwnership"): FunctionFragment;
    encodeFunctionData(functionFragment: "addClaimTopic", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getClaimTopics", values?: undefined): string;
    encodeFunctionData(functionFragment: "init", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "removeClaimTopic", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;
    decodeFunctionResult(functionFragment: "addClaimTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaimTopics", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "init", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeClaimTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    events: {
        "ClaimTopicAdded(uint256)": EventFragment;
        "ClaimTopicRemoved(uint256)": EventFragment;
        "Initialized(uint8)": EventFragment;
        "OwnershipTransferred(address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ClaimTopicAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimTopicRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}
export interface ClaimTopicAddedEventObject {
    claimTopic: BigNumber;
}
export type ClaimTopicAddedEvent = TypedEvent<[
    BigNumber
], ClaimTopicAddedEventObject>;
export type ClaimTopicAddedEventFilter = TypedEventFilter<ClaimTopicAddedEvent>;
export interface ClaimTopicRemovedEventObject {
    claimTopic: BigNumber;
}
export type ClaimTopicRemovedEvent = TypedEvent<[
    BigNumber
], ClaimTopicRemovedEventObject>;
export type ClaimTopicRemovedEventFilter = TypedEventFilter<ClaimTopicRemovedEvent>;
export interface InitializedEventObject {
    version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;
export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface ClaimTopicsRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ClaimTopicsRegistryInterface;
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
        addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getClaimTopics(overrides?: CallOverrides): Promise<[BigNumber[]]>;
        init(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getClaimTopics(overrides?: CallOverrides): Promise<BigNumber[]>;
    init(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    owner(overrides?: CallOverrides): Promise<string>;
    removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    renounceOwnership(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: CallOverrides): Promise<void>;
        getClaimTopics(overrides?: CallOverrides): Promise<BigNumber[]>;
        init(overrides?: CallOverrides): Promise<void>;
        owner(overrides?: CallOverrides): Promise<string>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: CallOverrides): Promise<void>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ClaimTopicAdded(uint256)"(claimTopic?: BigNumberish | null): ClaimTopicAddedEventFilter;
        ClaimTopicAdded(claimTopic?: BigNumberish | null): ClaimTopicAddedEventFilter;
        "ClaimTopicRemoved(uint256)"(claimTopic?: BigNumberish | null): ClaimTopicRemovedEventFilter;
        ClaimTopicRemoved(claimTopic?: BigNumberish | null): ClaimTopicRemovedEventFilter;
        "Initialized(uint8)"(version?: null): InitializedEventFilter;
        Initialized(version?: null): InitializedEventFilter;
        "OwnershipTransferred(address,address)"(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
    };
    estimateGas: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getClaimTopics(overrides?: CallOverrides): Promise<BigNumber>;
        init(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getClaimTopics(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        init(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
