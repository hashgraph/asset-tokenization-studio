import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export type HoldStruct = {
    amount: BigNumberish;
    expirationTimestamp: BigNumberish;
    escrow: string;
    to: string;
    data: BytesLike;
};
export type HoldStructOutput = [
    BigNumber,
    BigNumber,
    string,
    string,
    string
] & {
    amount: BigNumber;
    expirationTimestamp: BigNumber;
    escrow: string;
    to: string;
    data: string;
};
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
    type ClearingHoldCreationDataStruct = {
        amount: BigNumberish;
        expirationTimestamp: BigNumberish;
        data: BytesLike;
        holdEscrow: string;
        holdExpirationTimestamp: BigNumberish;
        holdTo: string;
        holdData: BytesLike;
        operatorData: BytesLike;
        operatorType: BigNumberish;
    };
    type ClearingHoldCreationDataStructOutput = [
        BigNumber,
        BigNumber,
        string,
        string,
        BigNumber,
        string,
        string,
        string,
        number
    ] & {
        amount: BigNumber;
        expirationTimestamp: BigNumber;
        data: string;
        holdEscrow: string;
        holdExpirationTimestamp: BigNumber;
        holdTo: string;
        holdData: string;
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
export interface IClearingHoldCreationInterface extends utils.Interface {
    functions: {
        "clearingCreateHoldByPartition((bytes32,uint256,bytes),(uint256,uint256,address,address,bytes))": FunctionFragment;
        "clearingCreateHoldFromByPartition(((bytes32,uint256,bytes),address,bytes),(uint256,uint256,address,address,bytes))": FunctionFragment;
        "getClearingCreateHoldForByPartition(bytes32,address,uint256)": FunctionFragment;
        "operatorClearingCreateHoldByPartition(((bytes32,uint256,bytes),address,bytes),(uint256,uint256,address,address,bytes))": FunctionFragment;
        "protectedClearingCreateHoldByPartition(((bytes32,uint256,bytes),address,uint256,uint256),(uint256,uint256,address,address,bytes),bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "clearingCreateHoldByPartition" | "clearingCreateHoldFromByPartition" | "getClearingCreateHoldForByPartition" | "operatorClearingCreateHoldByPartition" | "protectedClearingCreateHoldByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "clearingCreateHoldByPartition", values: [IClearing.ClearingOperationStruct, HoldStruct]): string;
    encodeFunctionData(functionFragment: "clearingCreateHoldFromByPartition", values: [IClearing.ClearingOperationFromStruct, HoldStruct]): string;
    encodeFunctionData(functionFragment: "getClearingCreateHoldForByPartition", values: [BytesLike, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "operatorClearingCreateHoldByPartition", values: [IClearing.ClearingOperationFromStruct, HoldStruct]): string;
    encodeFunctionData(functionFragment: "protectedClearingCreateHoldByPartition", values: [IClearing.ProtectedClearingOperationStruct, HoldStruct, BytesLike]): string;
    decodeFunctionResult(functionFragment: "clearingCreateHoldByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "clearingCreateHoldFromByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearingCreateHoldForByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "operatorClearingCreateHoldByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "protectedClearingCreateHoldByPartition", data: BytesLike): Result;
    events: {};
}
export interface IClearingHoldCreation extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IClearingHoldCreationInterface;
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
        clearingCreateHoldByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        clearingCreateHoldFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getClearingCreateHoldForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingId: BigNumberish, overrides?: CallOverrides): Promise<[
            IClearing.ClearingHoldCreationDataStructOutput
        ] & {
            clearingHoldCreationData_: IClearing.ClearingHoldCreationDataStructOutput;
        }>;
        operatorClearingCreateHoldByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        protectedClearingCreateHoldByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _hold: HoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    clearingCreateHoldByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _hold: HoldStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    clearingCreateHoldFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getClearingCreateHoldForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingId: BigNumberish, overrides?: CallOverrides): Promise<IClearing.ClearingHoldCreationDataStructOutput>;
    operatorClearingCreateHoldByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    protectedClearingCreateHoldByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _hold: HoldStruct, _signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        clearingCreateHoldByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _hold: HoldStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        clearingCreateHoldFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        getClearingCreateHoldForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingId: BigNumberish, overrides?: CallOverrides): Promise<IClearing.ClearingHoldCreationDataStructOutput>;
        operatorClearingCreateHoldByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
        protectedClearingCreateHoldByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _hold: HoldStruct, _signature: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            clearingId_: BigNumber;
        }>;
    };
    filters: {};
    estimateGas: {
        clearingCreateHoldByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        clearingCreateHoldFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getClearingCreateHoldForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingId: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        operatorClearingCreateHoldByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        protectedClearingCreateHoldByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _hold: HoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        clearingCreateHoldByPartition(_clearingOperation: IClearing.ClearingOperationStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        clearingCreateHoldFromByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getClearingCreateHoldForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingId: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        operatorClearingCreateHoldByPartition(_clearingOperationFrom: IClearing.ClearingOperationFromStruct, _hold: HoldStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        protectedClearingCreateHoldByPartition(_protectedClearingOperation: IClearing.ProtectedClearingOperationStruct, _hold: HoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
