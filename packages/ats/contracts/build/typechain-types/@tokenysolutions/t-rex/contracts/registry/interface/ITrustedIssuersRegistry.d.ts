import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface ITrustedIssuersRegistryInterface extends utils.Interface {
    functions: {
        "addTrustedIssuer(address,uint256[])": FunctionFragment;
        "getTrustedIssuerClaimTopics(address)": FunctionFragment;
        "getTrustedIssuers()": FunctionFragment;
        "getTrustedIssuersForClaimTopic(uint256)": FunctionFragment;
        "hasClaimTopic(address,uint256)": FunctionFragment;
        "isTrustedIssuer(address)": FunctionFragment;
        "removeTrustedIssuer(address)": FunctionFragment;
        "updateIssuerClaimTopics(address,uint256[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addTrustedIssuer" | "getTrustedIssuerClaimTopics" | "getTrustedIssuers" | "getTrustedIssuersForClaimTopic" | "hasClaimTopic" | "isTrustedIssuer" | "removeTrustedIssuer" | "updateIssuerClaimTopics"): FunctionFragment;
    encodeFunctionData(functionFragment: "addTrustedIssuer", values: [string, BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "getTrustedIssuerClaimTopics", values: [string]): string;
    encodeFunctionData(functionFragment: "getTrustedIssuers", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTrustedIssuersForClaimTopic", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "hasClaimTopic", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "isTrustedIssuer", values: [string]): string;
    encodeFunctionData(functionFragment: "removeTrustedIssuer", values: [string]): string;
    encodeFunctionData(functionFragment: "updateIssuerClaimTopics", values: [string, BigNumberish[]]): string;
    decodeFunctionResult(functionFragment: "addTrustedIssuer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTrustedIssuerClaimTopics", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTrustedIssuers", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTrustedIssuersForClaimTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "hasClaimTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isTrustedIssuer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeTrustedIssuer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateIssuerClaimTopics", data: BytesLike): Result;
    events: {
        "ClaimTopicsUpdated(address,uint256[])": EventFragment;
        "TrustedIssuerAdded(address,uint256[])": EventFragment;
        "TrustedIssuerRemoved(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ClaimTopicsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TrustedIssuerAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TrustedIssuerRemoved"): EventFragment;
}
export interface ClaimTopicsUpdatedEventObject {
    trustedIssuer: string;
    claimTopics: BigNumber[];
}
export type ClaimTopicsUpdatedEvent = TypedEvent<[
    string,
    BigNumber[]
], ClaimTopicsUpdatedEventObject>;
export type ClaimTopicsUpdatedEventFilter = TypedEventFilter<ClaimTopicsUpdatedEvent>;
export interface TrustedIssuerAddedEventObject {
    trustedIssuer: string;
    claimTopics: BigNumber[];
}
export type TrustedIssuerAddedEvent = TypedEvent<[
    string,
    BigNumber[]
], TrustedIssuerAddedEventObject>;
export type TrustedIssuerAddedEventFilter = TypedEventFilter<TrustedIssuerAddedEvent>;
export interface TrustedIssuerRemovedEventObject {
    trustedIssuer: string;
}
export type TrustedIssuerRemovedEvent = TypedEvent<[
    string
], TrustedIssuerRemovedEventObject>;
export type TrustedIssuerRemovedEventFilter = TypedEventFilter<TrustedIssuerRemovedEvent>;
export interface ITrustedIssuersRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ITrustedIssuersRegistryInterface;
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
        addTrustedIssuer(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getTrustedIssuerClaimTopics(_trustedIssuer: string, overrides?: CallOverrides): Promise<[BigNumber[]]>;
        getTrustedIssuers(overrides?: CallOverrides): Promise<[string[]]>;
        getTrustedIssuersForClaimTopic(claimTopic: BigNumberish, overrides?: CallOverrides): Promise<[string[]]>;
        hasClaimTopic(_issuer: string, _claimTopic: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        isTrustedIssuer(_issuer: string, overrides?: CallOverrides): Promise<[boolean]>;
        removeTrustedIssuer(_trustedIssuer: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        updateIssuerClaimTopics(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addTrustedIssuer(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getTrustedIssuerClaimTopics(_trustedIssuer: string, overrides?: CallOverrides): Promise<BigNumber[]>;
    getTrustedIssuers(overrides?: CallOverrides): Promise<string[]>;
    getTrustedIssuersForClaimTopic(claimTopic: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    hasClaimTopic(_issuer: string, _claimTopic: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    isTrustedIssuer(_issuer: string, overrides?: CallOverrides): Promise<boolean>;
    removeTrustedIssuer(_trustedIssuer: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    updateIssuerClaimTopics(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addTrustedIssuer(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: CallOverrides): Promise<void>;
        getTrustedIssuerClaimTopics(_trustedIssuer: string, overrides?: CallOverrides): Promise<BigNumber[]>;
        getTrustedIssuers(overrides?: CallOverrides): Promise<string[]>;
        getTrustedIssuersForClaimTopic(claimTopic: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        hasClaimTopic(_issuer: string, _claimTopic: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        isTrustedIssuer(_issuer: string, overrides?: CallOverrides): Promise<boolean>;
        removeTrustedIssuer(_trustedIssuer: string, overrides?: CallOverrides): Promise<void>;
        updateIssuerClaimTopics(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ClaimTopicsUpdated(address,uint256[])"(trustedIssuer?: string | null, claimTopics?: null): ClaimTopicsUpdatedEventFilter;
        ClaimTopicsUpdated(trustedIssuer?: string | null, claimTopics?: null): ClaimTopicsUpdatedEventFilter;
        "TrustedIssuerAdded(address,uint256[])"(trustedIssuer?: string | null, claimTopics?: null): TrustedIssuerAddedEventFilter;
        TrustedIssuerAdded(trustedIssuer?: string | null, claimTopics?: null): TrustedIssuerAddedEventFilter;
        "TrustedIssuerRemoved(address)"(trustedIssuer?: string | null): TrustedIssuerRemovedEventFilter;
        TrustedIssuerRemoved(trustedIssuer?: string | null): TrustedIssuerRemovedEventFilter;
    };
    estimateGas: {
        addTrustedIssuer(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getTrustedIssuerClaimTopics(_trustedIssuer: string, overrides?: CallOverrides): Promise<BigNumber>;
        getTrustedIssuers(overrides?: CallOverrides): Promise<BigNumber>;
        getTrustedIssuersForClaimTopic(claimTopic: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        hasClaimTopic(_issuer: string, _claimTopic: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        isTrustedIssuer(_issuer: string, overrides?: CallOverrides): Promise<BigNumber>;
        removeTrustedIssuer(_trustedIssuer: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        updateIssuerClaimTopics(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addTrustedIssuer(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getTrustedIssuerClaimTopics(_trustedIssuer: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTrustedIssuers(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTrustedIssuersForClaimTopic(claimTopic: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        hasClaimTopic(_issuer: string, _claimTopic: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isTrustedIssuer(_issuer: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeTrustedIssuer(_trustedIssuer: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        updateIssuerClaimTopics(_trustedIssuer: string, _claimTopics: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
