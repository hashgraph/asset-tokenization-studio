import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IERC3643BatchInterface extends utils.Interface {
    functions: {
        "batchBurn(address[],uint256[])": FunctionFragment;
        "batchForcedTransfer(address[],address[],uint256[])": FunctionFragment;
        "batchMint(address[],uint256[])": FunctionFragment;
        "batchTransfer(address[],uint256[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "batchBurn" | "batchForcedTransfer" | "batchMint" | "batchTransfer"): FunctionFragment;
    encodeFunctionData(functionFragment: "batchBurn", values: [string[], BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "batchForcedTransfer", values: [string[], string[], BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "batchMint", values: [string[], BigNumberish[]]): string;
    encodeFunctionData(functionFragment: "batchTransfer", values: [string[], BigNumberish[]]): string;
    decodeFunctionResult(functionFragment: "batchBurn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchForcedTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchMint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchTransfer", data: BytesLike): Result;
    events: {};
}
export interface IERC3643Batch extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IERC3643BatchInterface;
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
        batchBurn(_userAddresses: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        batchForcedTransfer(_fromList: string[], _toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        batchMint(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        batchTransfer(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    batchBurn(_userAddresses: string[], _amounts: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    batchForcedTransfer(_fromList: string[], _toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    batchMint(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    batchTransfer(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        batchBurn(_userAddresses: string[], _amounts: BigNumberish[], overrides?: CallOverrides): Promise<void>;
        batchForcedTransfer(_fromList: string[], _toList: string[], _amounts: BigNumberish[], overrides?: CallOverrides): Promise<void>;
        batchMint(_toList: string[], _amounts: BigNumberish[], overrides?: CallOverrides): Promise<void>;
        batchTransfer(_toList: string[], _amounts: BigNumberish[], overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        batchBurn(_userAddresses: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        batchForcedTransfer(_fromList: string[], _toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        batchMint(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        batchTransfer(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        batchBurn(_userAddresses: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        batchForcedTransfer(_fromList: string[], _toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        batchMint(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        batchTransfer(_toList: string[], _amounts: BigNumberish[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
