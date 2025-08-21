import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IFreezeInterface extends utils.Interface {
    functions: {
        "freezePartialTokens(address,uint256)": FunctionFragment;
        "getFrozenTokens(address)": FunctionFragment;
        "setAddressFrozen(address,bool)": FunctionFragment;
        "unfreezePartialTokens(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "freezePartialTokens" | "getFrozenTokens" | "setAddressFrozen" | "unfreezePartialTokens"): FunctionFragment;
    encodeFunctionData(functionFragment: "freezePartialTokens", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getFrozenTokens", values: [string]): string;
    encodeFunctionData(functionFragment: "setAddressFrozen", values: [string, boolean]): string;
    encodeFunctionData(functionFragment: "unfreezePartialTokens", values: [string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "freezePartialTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFrozenTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAddressFrozen", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unfreezePartialTokens", data: BytesLike): Result;
    events: {
        "AddressFrozen(address,bool,address)": EventFragment;
        "TokensFrozen(address,uint256,bytes32)": EventFragment;
        "TokensUnfrozen(address,uint256,bytes32)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddressFrozen"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokensFrozen"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokensUnfrozen"): EventFragment;
}
export interface AddressFrozenEventObject {
    userAddress: string;
    isFrozen: boolean;
    owner: string;
}
export type AddressFrozenEvent = TypedEvent<[
    string,
    boolean,
    string
], AddressFrozenEventObject>;
export type AddressFrozenEventFilter = TypedEventFilter<AddressFrozenEvent>;
export interface TokensFrozenEventObject {
    account: string;
    amount: BigNumber;
    partition: string;
}
export type TokensFrozenEvent = TypedEvent<[
    string,
    BigNumber,
    string
], TokensFrozenEventObject>;
export type TokensFrozenEventFilter = TypedEventFilter<TokensFrozenEvent>;
export interface TokensUnfrozenEventObject {
    account: string;
    amount: BigNumber;
    partition: string;
}
export type TokensUnfrozenEvent = TypedEvent<[
    string,
    BigNumber,
    string
], TokensUnfrozenEventObject>;
export type TokensUnfrozenEventFilter = TypedEventFilter<TokensUnfrozenEvent>;
export interface IFreeze extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IFreezeInterface;
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
        freezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getFrozenTokens(_userAddress: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        setAddressFrozen(_userAddress: string, _freezeStatus: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        unfreezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    freezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getFrozenTokens(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
    setAddressFrozen(_userAddress: string, _freezeStatus: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    unfreezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        freezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        getFrozenTokens(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        setAddressFrozen(_userAddress: string, _freezeStatus: boolean, overrides?: CallOverrides): Promise<void>;
        unfreezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "AddressFrozen(address,bool,address)"(userAddress?: string | null, isFrozen?: boolean | null, owner?: string | null): AddressFrozenEventFilter;
        AddressFrozen(userAddress?: string | null, isFrozen?: boolean | null, owner?: string | null): AddressFrozenEventFilter;
        "TokensFrozen(address,uint256,bytes32)"(account?: string | null, amount?: null, partition?: null): TokensFrozenEventFilter;
        TokensFrozen(account?: string | null, amount?: null, partition?: null): TokensFrozenEventFilter;
        "TokensUnfrozen(address,uint256,bytes32)"(account?: string | null, amount?: null, partition?: null): TokensUnfrozenEventFilter;
        TokensUnfrozen(account?: string | null, amount?: null, partition?: null): TokensUnfrozenEventFilter;
    };
    estimateGas: {
        freezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getFrozenTokens(_userAddress: string, overrides?: CallOverrides): Promise<BigNumber>;
        setAddressFrozen(_userAddress: string, _freezeStatus: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        unfreezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        freezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getFrozenTokens(_userAddress: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setAddressFrozen(_userAddress: string, _freezeStatus: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        unfreezePartialTokens(_userAddress: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
