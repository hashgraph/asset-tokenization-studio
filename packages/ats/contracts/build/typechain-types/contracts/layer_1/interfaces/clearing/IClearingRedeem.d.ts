import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export declare namespace IClearing {
    type ClearingOperationStruct = {
        partition: BytesLike;
        expirationTimestamp: BigNumberish;
        data: BytesLike;
    };
    type ClearingOperationStructOutput = [string, BigNumber, string] & {
        partition: string;
        expirationTimestamp: BigNumber;
        data: string;
    };
    type ClearingOperationFromStruct = {
        clearingOperation: IClearing.ClearingOperationStruct;
        from: string;
        operatorData: BytesLike;
    };
    type ClearingOperationFromStructOutput = [
        IClearing.ClearingOperationStructOutput,
        string,
        string
    ] & {
        clearingOperation: IClearing.ClearingOperationStructOutput;
        from: string;
        operatorData: string;
    };
    type ClearingRedeemDataStruct = {
        amount: BigNumberish;
        expirationTimestamp: BigNumberish;
        data: BytesLike;
        operatorData: BytesLike;
        operatorType: BigNumberish;
    };
    type ClearingRedeemDataStructOutput = [
        BigNumber,
        BigNumber,
        string,
        string,
        number
    ] & {
        amount: BigNumber;
        expirationTimestamp: BigNumber;
        data: string;
        operatorData: string;
        operatorType: number;
    };
    type ProtectedClearingOperationStruct = {
        clearingOperation: IClearing.ClearingOperationStruct;
        from: string;
        deadline: BigNumberish;
        nonce: BigNumberish;
    };
    type ProtectedClearingOperationStructOutput = [
        IClearing.ClearingOperationStructOutput,
        string,
        BigNumber,
        BigNumber
    ] & {
        clearingOperation: IClearing.ClearingOperationStructOutput;
        from: string;
        deadline: BigNumber;
        nonce: BigNumber;
    };
}
export interface IClearingRedeemInterface extends utils.Interface {
    functions: {
        "clearingRedeemByPartition((bytes32,uint256,bytes),uint256)": FunctionFragment;
        "clearingRedeemFromByPartition(((bytes32,uint256,bytes),address,bytes),uint256)": FunctionFragment;
        "getClearingRedeemForByPartition(bytes32,address,uint256)": FunctionFragment;
        "operatorClearingRedeemByPartition(((bytes32,uint256,bytes),address,bytes),uint256)": FunctionFragment;
        "protectedClearingRedeemByPartition(((bytes32,uint256,bytes),address,uint256,uint256),uint256,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "clearingRedeemByPartition" | "clearingRedeemFromByPartition" | "getClearingRedeemForByPartition" | "operatorClearingRedeemByPartition" | "protectedClearingRedeemByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "clearingRedeemByPartition", values: [IClearing.ClearingOperationStruct, BigNumberish]): string;
    encodeFunctionData(functionFragment: "clearingRedeemFromByPartition", values: [IClearing.ClearingOperationFromStruct, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getClearingRedeemForByPartition", values: [BytesLike, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "operatorClearingRedeemByPartition", values: [IClearing.ClearingOperationFromStruct, BigNumberish]): string;
    encodeFunctionData(functionFragment: "protectedClearingRedeemByPartition", values: [
        IClearing.ProtectedClearingOperationStruct,
        BigNumberish,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "clearingRedeemByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "clearingRedeemFromByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearingRedeemForByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "operatorClearingRedeemByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "protectedClearingRedeemByPartition", data: BytesLike): Result;
    events: {};
}
export interface IClearingRedeem extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IClearingRedeemInterface;
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
        clearingRedeemByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        clearingRedeemFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getClearingRedeemForByPartition(partition: BytesLike, tokenHolder: string, clearingId: BigNumberish, overrides?: CallOverrides): Promise<[
            IClearing.ClearingRedeemDataStructOutput
        ] & {
            clearingRedeemData_: IClearing.ClearingRedeemDataStructOutput;
        }>;
        operatorClearingRedeemByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        protectedClearingRedeemByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _amount: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    clearingRedeemByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    clearingRedeemFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getClearingRedeemForByPartition(partition: BytesLike, tokenHolder: string, clearingId: BigNumberish, overrides?: CallOverrides): Promise<IClearing.ClearingRedeemDataStructOutput>;
    operatorClearingRedeemByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    protectedClearingRedeemByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _amount: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        clearingRedeemByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _amount: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        clearingRedeemFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        getClearingRedeemForByPartition(partition: BytesLike, tokenHolder: string, clearingId: BigNumberish, overrides?: CallOverrides): Promise<IClearing.ClearingRedeemDataStructOutput>;
        operatorClearingRedeemByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        protectedClearingRedeemByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _amount: BigNumberish, _signature: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
    };
    filters: {};
    estimateGas: {
        clearingRedeemByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        clearingRedeemFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getClearingRedeemForByPartition(partition: BytesLike, tokenHolder: string, clearingId: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        operatorClearingRedeemByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        protectedClearingRedeemByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _amount: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        clearingRedeemByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        clearingRedeemFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getClearingRedeemForByPartition(partition: BytesLike, tokenHolder: string, clearingId: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        operatorClearingRedeemByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        protectedClearingRedeemByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _amount: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
