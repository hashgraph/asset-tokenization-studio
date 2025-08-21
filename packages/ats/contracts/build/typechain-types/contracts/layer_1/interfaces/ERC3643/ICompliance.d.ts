import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IComplianceInterface extends utils.Interface {
    functions: {
        "canTransfer(address,address,uint256)": FunctionFragment;
        "created(address,uint256)": FunctionFragment;
        "destroyed(address,uint256)": FunctionFragment;
        "transferred(address,address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "canTransfer" | "created" | "destroyed" | "transferred"): FunctionFragment;
    encodeFunctionData(functionFragment: "canTransfer", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "created", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "destroyed", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferred", values: [string, string, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "canTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "created", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "destroyed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferred", data: BytesLike): Result;
    events: {};
}
export interface ICompliance extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IComplianceInterface;
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
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        created(_to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
