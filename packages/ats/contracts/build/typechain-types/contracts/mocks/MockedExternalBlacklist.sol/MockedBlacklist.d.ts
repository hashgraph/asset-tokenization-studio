import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface MockedBlacklistInterface extends utils.Interface {
    functions: {
        "addToBlacklist(address)": FunctionFragment;
        "isAuthorized(address)": FunctionFragment;
        "removeFromBlacklist(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addToBlacklist" | "isAuthorized" | "removeFromBlacklist"): FunctionFragment;
    encodeFunctionData(functionFragment: "addToBlacklist", values: [string]): string;
    encodeFunctionData(functionFragment: "isAuthorized", values: [string]): string;
    encodeFunctionData(functionFragment: "removeFromBlacklist", values: [string]): string;
    decodeFunctionResult(functionFragment: "addToBlacklist", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isAuthorized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeFromBlacklist", data: BytesLike): Result;
    events: {
        "AddedToBlacklist(address)": EventFragment;
        "RemovedFromBlacklist(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddedToBlacklist"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemovedFromBlacklist"): EventFragment;
}
export interface AddedToBlacklistEventObject {
    account: string;
}
export type AddedToBlacklistEvent = TypedEvent<[
    string
], AddedToBlacklistEventObject>;
export type AddedToBlacklistEventFilter = TypedEventFilter<AddedToBlacklistEvent>;
export interface RemovedFromBlacklistEventObject {
    account: string;
}
export type RemovedFromBlacklistEvent = TypedEvent<[
    string
], RemovedFromBlacklistEventObject>;
export type RemovedFromBlacklistEventFilter = TypedEventFilter<RemovedFromBlacklistEvent>;
export interface MockedBlacklist extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MockedBlacklistInterface;
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
        addToBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        isAuthorized(account: string, overrides?: CallOverrides): Promise<[boolean]>;
        removeFromBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addToBlacklist(account: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    isAuthorized(account: string, overrides?: CallOverrides): Promise<boolean>;
    removeFromBlacklist(account: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addToBlacklist(account: string, overrides?: CallOverrides): Promise<void>;
        isAuthorized(account: string, overrides?: CallOverrides): Promise<boolean>;
        removeFromBlacklist(account: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "AddedToBlacklist(address)"(account?: string | null): AddedToBlacklistEventFilter;
        AddedToBlacklist(account?: string | null): AddedToBlacklistEventFilter;
        "RemovedFromBlacklist(address)"(account?: string | null): RemovedFromBlacklistEventFilter;
        RemovedFromBlacklist(account?: string | null): RemovedFromBlacklistEventFilter;
    };
    estimateGas: {
        addToBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        isAuthorized(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        removeFromBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addToBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        isAuthorized(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeFromBlacklist(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
