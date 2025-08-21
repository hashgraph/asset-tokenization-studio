import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IIdentityRegistryInterface extends utils.Interface {
    functions: {
        "batchRegisterIdentity(address[],address[],uint16[])": FunctionFragment;
        "contains(address)": FunctionFragment;
        "deleteIdentity(address)": FunctionFragment;
        "identity(address)": FunctionFragment;
        "identityStorage()": FunctionFragment;
        "investorCountry(address)": FunctionFragment;
        "isVerified(address)": FunctionFragment;
        "issuersRegistry()": FunctionFragment;
        "registerIdentity(address,address,uint16)": FunctionFragment;
        "setClaimTopicsRegistry(address)": FunctionFragment;
        "setIdentityRegistryStorage(address)": FunctionFragment;
        "setTrustedIssuersRegistry(address)": FunctionFragment;
        "topicsRegistry()": FunctionFragment;
        "updateCountry(address,uint16)": FunctionFragment;
        "updateIdentity(address,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "batchRegisterIdentity" | "contains" | "deleteIdentity" | "identity" | "identityStorage" | "investorCountry" | "isVerified" | "issuersRegistry" | "registerIdentity" | "setClaimTopicsRegistry" | "setIdentityRegistryStorage" | "setTrustedIssuersRegistry" | "topicsRegistry" | "updateCountry" | "updateIdentity"): FunctionFragment;
    encodeFunctionData(functionFragment: "batchRegisterIdentity", values: [string[], string[], BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "contains", values: [string]): string;
    encodeFunctionData(functionFragment: "deleteIdentity", values: [string]): string;
    encodeFunctionData(functionFragment: "identity", values: [string]): string;
    encodeFunctionData(functionFragment: "identityStorage", values?: undefined): string;
    encodeFunctionData(functionFragment: "investorCountry", values: [string]): string;
    encodeFunctionData(functionFragment: "isVerified", values: [string]): string;
    encodeFunctionData(functionFragment: "issuersRegistry", values?: undefined): string;
    encodeFunctionData(functionFragment: "registerIdentity", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setClaimTopicsRegistry", values: [string]): string;
    encodeFunctionData(functionFragment: "setIdentityRegistryStorage", values: [string]): string;
    encodeFunctionData(functionFragment: "setTrustedIssuersRegistry", values: [string]): string;
    encodeFunctionData(functionFragment: "topicsRegistry", values?: undefined): string;
    encodeFunctionData(functionFragment: "updateCountry", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "updateIdentity", values: [string, string]): string;
    decodeFunctionResult(functionFragment: "batchRegisterIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "contains", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "identity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "identityStorage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "investorCountry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isVerified", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "issuersRegistry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registerIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setClaimTopicsRegistry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setIdentityRegistryStorage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTrustedIssuersRegistry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "topicsRegistry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateCountry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateIdentity", data: BytesLike): Result;
    events: {
        "ClaimTopicsRegistrySet(address)": EventFragment;
        "CountryUpdated(address,uint16)": EventFragment;
        "IdentityRegistered(address,address)": EventFragment;
        "IdentityRemoved(address,address)": EventFragment;
        "IdentityStorageSet(address)": EventFragment;
        "IdentityUpdated(address,address)": EventFragment;
        "TrustedIssuersRegistrySet(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ClaimTopicsRegistrySet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "CountryUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IdentityRegistered"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IdentityRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IdentityStorageSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IdentityUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TrustedIssuersRegistrySet"): EventFragment;
}
export interface ClaimTopicsRegistrySetEventObject {
    claimTopicsRegistry: string;
}
export type ClaimTopicsRegistrySetEvent = TypedEvent<[
    string
], ClaimTopicsRegistrySetEventObject>;
export type ClaimTopicsRegistrySetEventFilter = TypedEventFilter<ClaimTopicsRegistrySetEvent>;
export interface CountryUpdatedEventObject {
    investorAddress: string;
    country: number;
}
export type CountryUpdatedEvent = TypedEvent<[
    string,
    number
], CountryUpdatedEventObject>;
export type CountryUpdatedEventFilter = TypedEventFilter<CountryUpdatedEvent>;
export interface IdentityRegisteredEventObject {
    investorAddress: string;
    identity: string;
}
export type IdentityRegisteredEvent = TypedEvent<[
    string,
    string
], IdentityRegisteredEventObject>;
export type IdentityRegisteredEventFilter = TypedEventFilter<IdentityRegisteredEvent>;
export interface IdentityRemovedEventObject {
    investorAddress: string;
    identity: string;
}
export type IdentityRemovedEvent = TypedEvent<[
    string,
    string
], IdentityRemovedEventObject>;
export type IdentityRemovedEventFilter = TypedEventFilter<IdentityRemovedEvent>;
export interface IdentityStorageSetEventObject {
    identityStorage: string;
}
export type IdentityStorageSetEvent = TypedEvent<[
    string
], IdentityStorageSetEventObject>;
export type IdentityStorageSetEventFilter = TypedEventFilter<IdentityStorageSetEvent>;
export interface IdentityUpdatedEventObject {
    oldIdentity: string;
    newIdentity: string;
}
export type IdentityUpdatedEvent = TypedEvent<[
    string,
    string
], IdentityUpdatedEventObject>;
export type IdentityUpdatedEventFilter = TypedEventFilter<IdentityUpdatedEvent>;
export interface TrustedIssuersRegistrySetEventObject {
    trustedIssuersRegistry: string;
}
export type TrustedIssuersRegistrySetEvent = TypedEvent<[
    string
], TrustedIssuersRegistrySetEventObject>;
export type TrustedIssuersRegistrySetEventFilter = TypedEventFilter<TrustedIssuersRegistrySetEvent>;
export interface IIdentityRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IIdentityRegistryInterface;
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
        batchRegisterIdentity(_userAddresses: string[], _identities: string[], _countries: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        contains(_userAddress: string, overrides?: CallOverrides): Promise<[boolean]>;
        deleteIdentity(_userAddress: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        identity(_userAddress: string, overrides?: CallOverrides): Promise<[string]>;
        identityStorage(overrides?: CallOverrides): Promise<[string]>;
        investorCountry(_userAddress: string, overrides?: CallOverrides): Promise<[number]>;
        isVerified(_userAddress: string, overrides?: CallOverrides): Promise<[boolean]>;
        issuersRegistry(overrides?: CallOverrides): Promise<[string]>;
        registerIdentity(_userAddress: string, _identity: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setClaimTopicsRegistry(_claimTopicsRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setIdentityRegistryStorage(_identityRegistryStorage: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setTrustedIssuersRegistry(_trustedIssuersRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        topicsRegistry(overrides?: CallOverrides): Promise<[string]>;
        updateCountry(_userAddress: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        updateIdentity(_userAddress: string, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    batchRegisterIdentity(_userAddresses: string[], _identities: string[], _countries: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    contains(_userAddress: string, overrides?: CallOverrides): Promise<boolean>;
    deleteIdentity(_userAddress: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    identity(_userAddress: string, overrides?: CallOverrides): Promise<string>;
    identityStorage(overrides?: CallOverrides): Promise<string>;
    investorCountry(_userAddress: string, overrides?: CallOverrides): Promise<number>;
    isVerified(_userAddress: string, overrides?: CallOverrides): Promise<boolean>;
    issuersRegistry(overrides?: CallOverrides): Promise<string>;
    registerIdentity(_userAddress: string, _identity: string, _country: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setClaimTopicsRegistry(_claimTopicsRegistry: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setIdentityRegistryStorage(_identityRegistryStorage: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setTrustedIssuersRegistry(_trustedIssuersRegistry: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    topicsRegistry(overrides?: CallOverrides): Promise<string>;
    updateCountry(_userAddress: string, _country: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    updateIdentity(_userAddress: string, _identity: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        batchRegisterIdentity(_userAddresses: string[], _identities: string[], _countries: BigNumberish[], overrides?: CallOverrides): Promise<void>;
        contains(_userAddress: string, overrides?: CallOverrides): Promise<boolean>;
        deleteIdentity(_userAddress: string, overrides?: CallOverrides): Promise<void>;
        identity(_userAddress: string, overrides?: CallOverrides): Promise<string>;
        identityStorage(overrides?: CallOverrides): Promise<string>;
        investorCountry(_userAddress: string, overrides?: CallOverrides): Promise<number>;
        isVerified(_userAddress: string, overrides?: CallOverrides): Promise<boolean>;
        issuersRegistry(overrides?: CallOverrides): Promise<string>;
        registerIdentity(_userAddress: string, _identity: string, _country: BigNumberish, overrides?: CallOverrides): Promise<void>;
        setClaimTopicsRegistry(_claimTopicsRegistry: string, overrides?: CallOverrides): Promise<void>;
        setIdentityRegistryStorage(_identityRegistryStorage: string, overrides?: CallOverrides): Promise<void>;
        setTrustedIssuersRegistry(_trustedIssuersRegistry: string, overrides?: CallOverrides): Promise<void>;
        topicsRegistry(overrides?: CallOverrides): Promise<string>;
        updateCountry(_userAddress: string, _country: BigNumberish, overrides?: CallOverrides): Promise<void>;
        updateIdentity(_userAddress: string, _identity: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ClaimTopicsRegistrySet(address)"(claimTopicsRegistry?: string | null): ClaimTopicsRegistrySetEventFilter;
        ClaimTopicsRegistrySet(claimTopicsRegistry?: string | null): ClaimTopicsRegistrySetEventFilter;
        "CountryUpdated(address,uint16)"(investorAddress?: string | null, country?: BigNumberish | null): CountryUpdatedEventFilter;
        CountryUpdated(investorAddress?: string | null, country?: BigNumberish | null): CountryUpdatedEventFilter;
        "IdentityRegistered(address,address)"(investorAddress?: string | null, identity?: string | null): IdentityRegisteredEventFilter;
        IdentityRegistered(investorAddress?: string | null, identity?: string | null): IdentityRegisteredEventFilter;
        "IdentityRemoved(address,address)"(investorAddress?: string | null, identity?: string | null): IdentityRemovedEventFilter;
        IdentityRemoved(investorAddress?: string | null, identity?: string | null): IdentityRemovedEventFilter;
        "IdentityStorageSet(address)"(identityStorage?: string | null): IdentityStorageSetEventFilter;
        IdentityStorageSet(identityStorage?: string | null): IdentityStorageSetEventFilter;
        "IdentityUpdated(address,address)"(oldIdentity?: string | null, newIdentity?: string | null): IdentityUpdatedEventFilter;
        IdentityUpdated(oldIdentity?: string | null, newIdentity?: string | null): IdentityUpdatedEventFilter;
        "TrustedIssuersRegistrySet(address)"(trustedIssuersRegistry?: string | null): TrustedIssuersRegistrySetEventFilter;
        TrustedIssuersRegistrySet(trustedIssuersRegistry?: string | null): TrustedIssuersRegistrySetEventFilter;
    };
    estimateGas: {
        batchRegisterIdentity(_userAddresses: string[], _identities: string[], _countries: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        contains(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        deleteIdentity(_userAddress: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        identity(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        identityStorage(overrides?: CallOverrides): Promise<BigNumber>;
        investorCountry(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        isVerified(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        issuersRegistry(overrides?: CallOverrides): Promise<BigNumber>;
        registerIdentity(_userAddress: string, _identity: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setClaimTopicsRegistry(_claimTopicsRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setIdentityRegistryStorage(_identityRegistryStorage: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setTrustedIssuersRegistry(_trustedIssuersRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        topicsRegistry(overrides?: CallOverrides): Promise<BigNumber>;
        updateCountry(_userAddress: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        updateIdentity(_userAddress: string, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        batchRegisterIdentity(_userAddresses: string[], _identities: string[], _countries: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        contains(_userAddress: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deleteIdentity(_userAddress: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        identity(_userAddress: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        identityStorage(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        investorCountry(_userAddress: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isVerified(_userAddress: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        issuersRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        registerIdentity(_userAddress: string, _identity: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setClaimTopicsRegistry(_claimTopicsRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setIdentityRegistryStorage(_identityRegistryStorage: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setTrustedIssuersRegistry(_trustedIssuersRegistry: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        topicsRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateCountry(_userAddress: string, _country: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        updateIdentity(_userAddress: string, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
