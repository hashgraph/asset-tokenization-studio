import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IdentityRegistryStorageProxyInterface extends utils.Interface {
    functions: {
        "getImplementationAuthority()": FunctionFragment;
        "setImplementationAuthority(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getImplementationAuthority" | "setImplementationAuthority"): FunctionFragment;
    encodeFunctionData(functionFragment: "getImplementationAuthority", values?: undefined): string;
    encodeFunctionData(functionFragment: "setImplementationAuthority", values: [string]): string;
    decodeFunctionResult(functionFragment: "getImplementationAuthority", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setImplementationAuthority", data: BytesLike): Result;
    events: {
        "ImplementationAuthoritySet(address)": EventFragment;
        "Initialized(uint8)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ImplementationAuthoritySet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
}
export interface ImplementationAuthoritySetEventObject {
    _implementationAuthority: string;
}
export type ImplementationAuthoritySetEvent = TypedEvent<[
    string
], ImplementationAuthoritySetEventObject>;
export type ImplementationAuthoritySetEventFilter = TypedEventFilter<ImplementationAuthoritySetEvent>;
export interface InitializedEventObject {
    version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;
export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;
export interface IdentityRegistryStorageProxy extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IdentityRegistryStorageProxyInterface;
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
        getImplementationAuthority(overrides?: CallOverrides): Promise<[string]>;
        setImplementationAuthority(_newImplementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    getImplementationAuthority(overrides?: CallOverrides): Promise<string>;
    setImplementationAuthority(_newImplementationAuthority: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        getImplementationAuthority(overrides?: CallOverrides): Promise<string>;
        setImplementationAuthority(_newImplementationAuthority: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ImplementationAuthoritySet(address)"(_implementationAuthority?: string | null): ImplementationAuthoritySetEventFilter;
        ImplementationAuthoritySet(_implementationAuthority?: string | null): ImplementationAuthoritySetEventFilter;
        "Initialized(uint8)"(version?: null): InitializedEventFilter;
        Initialized(version?: null): InitializedEventFilter;
    };
    estimateGas: {
        getImplementationAuthority(overrides?: CallOverrides): Promise<BigNumber>;
        setImplementationAuthority(_newImplementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getImplementationAuthority(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setImplementationAuthority(_newImplementationAuthority: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
