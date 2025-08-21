import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IClaimTopicsRegistryInterface extends utils.Interface {
    functions: {
        "addClaimTopic(uint256)": FunctionFragment;
        "getClaimTopics()": FunctionFragment;
        "removeClaimTopic(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addClaimTopic" | "getClaimTopics" | "removeClaimTopic"): FunctionFragment;
    encodeFunctionData(functionFragment: "addClaimTopic", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getClaimTopics", values?: undefined): string;
    encodeFunctionData(functionFragment: "removeClaimTopic", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "addClaimTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaimTopics", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeClaimTopic", data: BytesLike): Result;
    events: {
        "ClaimTopicAdded(uint256)": EventFragment;
        "ClaimTopicRemoved(uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ClaimTopicAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimTopicRemoved"): EventFragment;
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
export interface IClaimTopicsRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IClaimTopicsRegistryInterface;
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
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getClaimTopics(overrides?: CallOverrides): Promise<BigNumber[]>;
    removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: CallOverrides): Promise<void>;
        getClaimTopics(overrides?: CallOverrides): Promise<BigNumber[]>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ClaimTopicAdded(uint256)"(claimTopic?: BigNumberish | null): ClaimTopicAddedEventFilter;
        ClaimTopicAdded(claimTopic?: BigNumberish | null): ClaimTopicAddedEventFilter;
        "ClaimTopicRemoved(uint256)"(claimTopic?: BigNumberish | null): ClaimTopicRemovedEventFilter;
        ClaimTopicRemoved(claimTopic?: BigNumberish | null): ClaimTopicRemovedEventFilter;
    };
    estimateGas: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getClaimTopics(overrides?: CallOverrides): Promise<BigNumber>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getClaimTopics(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeClaimTopic(_claimTopic: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
