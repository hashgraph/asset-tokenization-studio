import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IModularComplianceInterface extends utils.Interface {
    functions: {
        "addModule(address)": FunctionFragment;
        "bindToken(address)": FunctionFragment;
        "callModuleFunction(bytes,address)": FunctionFragment;
        "canTransfer(address,address,uint256)": FunctionFragment;
        "created(address,uint256)": FunctionFragment;
        "destroyed(address,uint256)": FunctionFragment;
        "getModules()": FunctionFragment;
        "getTokenBound()": FunctionFragment;
        "isModuleBound(address)": FunctionFragment;
        "removeModule(address)": FunctionFragment;
        "transferred(address,address,uint256)": FunctionFragment;
        "unbindToken(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addModule" | "bindToken" | "callModuleFunction" | "canTransfer" | "created" | "destroyed" | "getModules" | "getTokenBound" | "isModuleBound" | "removeModule" | "transferred" | "unbindToken"): FunctionFragment;
    encodeFunctionData(functionFragment: "addModule", values: [string]): string;
    encodeFunctionData(functionFragment: "bindToken", values: [string]): string;
    encodeFunctionData(functionFragment: "callModuleFunction", values: [BytesLike, string]): string;
    encodeFunctionData(functionFragment: "canTransfer", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "created", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "destroyed", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getModules", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTokenBound", values?: undefined): string;
    encodeFunctionData(functionFragment: "isModuleBound", values: [string]): string;
    encodeFunctionData(functionFragment: "removeModule", values: [string]): string;
    encodeFunctionData(functionFragment: "transferred", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "unbindToken", values: [string]): string;
    decodeFunctionResult(functionFragment: "addModule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bindToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "callModuleFunction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "canTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "created", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "destroyed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getModules", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTokenBound", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isModuleBound", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeModule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferred", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unbindToken", data: BytesLike): Result;
    events: {
        "ModuleAdded(address)": EventFragment;
        "ModuleInteraction(address,bytes4)": EventFragment;
        "ModuleRemoved(address)": EventFragment;
        "TokenBound(address)": EventFragment;
        "TokenUnbound(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ModuleAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ModuleInteraction"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ModuleRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenBound"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnbound"): EventFragment;
}
export interface ModuleAddedEventObject {
    _module: string;
}
export type ModuleAddedEvent = TypedEvent<[string], ModuleAddedEventObject>;
export type ModuleAddedEventFilter = TypedEventFilter<ModuleAddedEvent>;
export interface ModuleInteractionEventObject {
    target: string;
    selector: string;
}
export type ModuleInteractionEvent = TypedEvent<[
    string,
    string
], ModuleInteractionEventObject>;
export type ModuleInteractionEventFilter = TypedEventFilter<ModuleInteractionEvent>;
export interface ModuleRemovedEventObject {
    _module: string;
}
export type ModuleRemovedEvent = TypedEvent<[string], ModuleRemovedEventObject>;
export type ModuleRemovedEventFilter = TypedEventFilter<ModuleRemovedEvent>;
export interface TokenBoundEventObject {
    _token: string;
}
export type TokenBoundEvent = TypedEvent<[string], TokenBoundEventObject>;
export type TokenBoundEventFilter = TypedEventFilter<TokenBoundEvent>;
export interface TokenUnboundEventObject {
    _token: string;
}
export type TokenUnboundEvent = TypedEvent<[string], TokenUnboundEventObject>;
export type TokenUnboundEventFilter = TypedEventFilter<TokenUnboundEvent>;
export interface IModularCompliance extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IModularComplianceInterface;
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
        addModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        bindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        callModuleFunction(callData: BytesLike, _module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getModules(overrides?: CallOverrides): Promise<[string[]]>;
        getTokenBound(overrides?: CallOverrides): Promise<[string]>;
        isModuleBound(_module: string, overrides?: CallOverrides): Promise<[boolean]>;
        removeModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        unbindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addModule(_module: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    bindToken(_token: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callModuleFunction(callData: BytesLike, _module: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getModules(overrides?: CallOverrides): Promise<string[]>;
    getTokenBound(overrides?: CallOverrides): Promise<string>;
    isModuleBound(_module: string, overrides?: CallOverrides): Promise<boolean>;
    removeModule(_module: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    unbindToken(_token: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addModule(_module: string, overrides?: CallOverrides): Promise<void>;
        bindToken(_token: string, overrides?: CallOverrides): Promise<void>;
        callModuleFunction(callData: BytesLike, _module: string, overrides?: CallOverrides): Promise<void>;
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        created(_to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        getModules(overrides?: CallOverrides): Promise<string[]>;
        getTokenBound(overrides?: CallOverrides): Promise<string>;
        isModuleBound(_module: string, overrides?: CallOverrides): Promise<boolean>;
        removeModule(_module: string, overrides?: CallOverrides): Promise<void>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        unbindToken(_token: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ModuleAdded(address)"(_module?: string | null): ModuleAddedEventFilter;
        ModuleAdded(_module?: string | null): ModuleAddedEventFilter;
        "ModuleInteraction(address,bytes4)"(target?: string | null, selector?: null): ModuleInteractionEventFilter;
        ModuleInteraction(target?: string | null, selector?: null): ModuleInteractionEventFilter;
        "ModuleRemoved(address)"(_module?: string | null): ModuleRemovedEventFilter;
        ModuleRemoved(_module?: string | null): ModuleRemovedEventFilter;
        "TokenBound(address)"(_token?: null): TokenBoundEventFilter;
        TokenBound(_token?: null): TokenBoundEventFilter;
        "TokenUnbound(address)"(_token?: null): TokenUnboundEventFilter;
        TokenUnbound(_token?: null): TokenUnboundEventFilter;
    };
    estimateGas: {
        addModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        bindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        callModuleFunction(callData: BytesLike, _module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getModules(overrides?: CallOverrides): Promise<BigNumber>;
        getTokenBound(overrides?: CallOverrides): Promise<BigNumber>;
        isModuleBound(_module: string, overrides?: CallOverrides): Promise<BigNumber>;
        removeModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        unbindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        bindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        callModuleFunction(callData: BytesLike, _module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getModules(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTokenBound(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isModuleBound(_module: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeModule(_module: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        unbindToken(_token: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
