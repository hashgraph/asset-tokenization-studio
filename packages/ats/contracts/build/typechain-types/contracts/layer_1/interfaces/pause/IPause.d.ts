import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IPauseInterface extends utils.Interface {
    functions: {
        "isPaused()": FunctionFragment;
        "pause()": FunctionFragment;
        "unpause()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "isPaused" | "pause" | "unpause"): FunctionFragment;
    encodeFunctionData(functionFragment: "isPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values?: undefined): string;
    encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
    decodeFunctionResult(functionFragment: "isPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
    events: {
        "TokenPaused(address)": EventFragment;
        "TokenUnpaused(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "TokenPaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnpaused"): EventFragment;
}
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
export interface IPause extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPauseInterface;
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
        isPaused(overrides?: CallOverrides): Promise<[boolean]>;
        pause(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        unpause(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    isPaused(overrides?: CallOverrides): Promise<boolean>;
    pause(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    unpause(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        isPaused(overrides?: CallOverrides): Promise<boolean>;
        pause(overrides?: CallOverrides): Promise<boolean>;
        unpause(overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "TokenPaused(address)"(operator?: string | null): TokenPausedEventFilter;
        TokenPaused(operator?: string | null): TokenPausedEventFilter;
        "TokenUnpaused(address)"(operator?: string | null): TokenUnpausedEventFilter;
        TokenUnpaused(operator?: string | null): TokenUnpausedEventFilter;
    };
    estimateGas: {
        isPaused(overrides?: CallOverrides): Promise<BigNumber>;
        pause(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        unpause(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        isPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pause(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        unpause(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
