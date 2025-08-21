import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IProtectedPartitionsInterface extends utils.Interface {
    functions: {
        "arePartitionsProtected()": FunctionFragment;
        "calculateRoleForPartition(bytes32)": FunctionFragment;
        "getNounceFor(address)": FunctionFragment;
        "initialize_ProtectedPartitions(bool)": FunctionFragment;
        "protectPartitions()": FunctionFragment;
        "unprotectPartitions()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "arePartitionsProtected" | "calculateRoleForPartition" | "getNounceFor" | "initialize_ProtectedPartitions" | "protectPartitions" | "unprotectPartitions"): FunctionFragment;
    encodeFunctionData(functionFragment: "arePartitionsProtected", values?: undefined): string;
    encodeFunctionData(functionFragment: "calculateRoleForPartition", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getNounceFor", values: [string]): string;
    encodeFunctionData(functionFragment: "initialize_ProtectedPartitions", values: [boolean]): string;
    encodeFunctionData(functionFragment: "protectPartitions", values?: undefined): string;
    encodeFunctionData(functionFragment: "unprotectPartitions", values?: undefined): string;
    decodeFunctionResult(functionFragment: "arePartitionsProtected", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calculateRoleForPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getNounceFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize_ProtectedPartitions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "protectPartitions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unprotectPartitions", data: BytesLike): Result;
    events: {};
}
export interface IProtectedPartitions extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IProtectedPartitionsInterface;
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
        arePartitionsProtected(overrides?: CallOverrides): Promise<[boolean]>;
        calculateRoleForPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            roleForPartition_: string;
        }>;
        getNounceFor(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        initialize_ProtectedPartitions(_arePartitionsProtected: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        protectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        unprotectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    arePartitionsProtected(overrides?: CallOverrides): Promise<boolean>;
    calculateRoleForPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<string>;
    getNounceFor(account: string, overrides?: CallOverrides): Promise<BigNumber>;
    initialize_ProtectedPartitions(_arePartitionsProtected: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    protectPartitions(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    unprotectPartitions(overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        arePartitionsProtected(overrides?: CallOverrides): Promise<boolean>;
        calculateRoleForPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<string>;
        getNounceFor(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        initialize_ProtectedPartitions(_arePartitionsProtected: boolean, overrides?: CallOverrides): Promise<boolean>;
        protectPartitions(overrides?: CallOverrides): Promise<boolean>;
        unprotectPartitions(overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        arePartitionsProtected(overrides?: CallOverrides): Promise<BigNumber>;
        calculateRoleForPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getNounceFor(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        initialize_ProtectedPartitions(_arePartitionsProtected: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        protectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        unprotectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        arePartitionsProtected(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        calculateRoleForPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getNounceFor(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize_ProtectedPartitions(_arePartitionsProtected: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        protectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        unprotectPartitions(overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
