import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export declare namespace ICap {
    type PartitionCapStruct = {
        partition: BytesLike;
        maxSupply: BigNumberish;
    };
    type PartitionCapStructOutput = [string, BigNumber] & {
        partition: string;
        maxSupply: BigNumber;
    };
}
export interface ICapInterface extends utils.Interface {
    functions: {
        "getMaxSupply()": FunctionFragment;
        "getMaxSupplyByPartition(bytes32)": FunctionFragment;
        "initialize_Cap(uint256,(bytes32,uint256)[])": FunctionFragment;
        "setMaxSupply(uint256)": FunctionFragment;
        "setMaxSupplyByPartition(bytes32,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getMaxSupply" | "getMaxSupplyByPartition" | "initialize_Cap" | "setMaxSupply" | "setMaxSupplyByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "getMaxSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "getMaxSupplyByPartition", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "initialize_Cap", values: [BigNumberish, ICap.PartitionCapStruct[]]): string;
    encodeFunctionData(functionFragment: "setMaxSupply", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "setMaxSupplyByPartition", values: [BytesLike, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "getMaxSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMaxSupplyByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize_Cap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setMaxSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setMaxSupplyByPartition", data: BytesLike): Result;
    events: {};
}
export interface ICap extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICapInterface;
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
        getMaxSupply(overrides?: CallOverrides): Promise<[BigNumber] & {
            maxSupply_: BigNumber;
        }>;
        getMaxSupplyByPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<[BigNumber] & {
            maxSupply_: BigNumber;
        }>;
        initialize_Cap(maxSupply: BigNumberish, partitionCap: ICap.PartitionCapStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setMaxSupply(_maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setMaxSupplyByPartition(_partition: BytesLike, _maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    getMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;
    getMaxSupplyByPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
    initialize_Cap(maxSupply: BigNumberish, partitionCap: ICap.PartitionCapStruct[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setMaxSupply(_maxSupply: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setMaxSupplyByPartition(_partition: BytesLike, _maxSupply: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        getMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;
        getMaxSupplyByPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        initialize_Cap(maxSupply: BigNumberish, partitionCap: ICap.PartitionCapStruct[], overrides?: CallOverrides): Promise<void>;
        setMaxSupply(_maxSupply: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        setMaxSupplyByPartition(_partition: BytesLike, _maxSupply: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        getMaxSupply(overrides?: CallOverrides): Promise<BigNumber>;
        getMaxSupplyByPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        initialize_Cap(maxSupply: BigNumberish, partitionCap: ICap.PartitionCapStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setMaxSupply(_maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setMaxSupplyByPartition(_partition: BytesLike, _maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getMaxSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getMaxSupplyByPartition(_partition: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize_Cap(maxSupply: BigNumberish, partitionCap: ICap.PartitionCapStruct[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setMaxSupply(_maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setMaxSupplyByPartition(_partition: BytesLike, _maxSupply: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
