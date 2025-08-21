import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ITimeTravelInterface extends utils.Interface {
    functions: {
        "blockTimestamp()": FunctionFragment;
        "changeSystemTimestamp(uint256)": FunctionFragment;
        "resetSystemTimestamp()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "blockTimestamp" | "changeSystemTimestamp" | "resetSystemTimestamp"): FunctionFragment;
    encodeFunctionData(functionFragment: "blockTimestamp", values?: undefined): string;
    encodeFunctionData(functionFragment: "changeSystemTimestamp", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "resetSystemTimestamp", values?: undefined): string;
    decodeFunctionResult(functionFragment: "blockTimestamp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "changeSystemTimestamp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resetSystemTimestamp", data: BytesLike): Result;
    events: {};
}
export interface ITimeTravel extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ITimeTravelInterface;
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
        blockTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;
        changeSystemTimestamp(_newSystemTime: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        resetSystemTimestamp(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    blockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
    changeSystemTimestamp(_newSystemTime: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    resetSystemTimestamp(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        blockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
        changeSystemTimestamp(_newSystemTime: BigNumberish, overrides?: CallOverrides): Promise<void>;
        resetSystemTimestamp(overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        blockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
        changeSystemTimestamp(_newSystemTime: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        resetSystemTimestamp(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        blockTimestamp(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        changeSystemTimestamp(_newSystemTime: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        resetSystemTimestamp(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
