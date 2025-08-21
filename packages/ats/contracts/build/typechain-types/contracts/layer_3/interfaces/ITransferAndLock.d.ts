import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export declare namespace ITransferAndLock {
    type TransferAndLockStructStruct = {
        from: string;
        to: string;
        amount: BigNumberish;
        data: BytesLike;
        expirationTimestamp: BigNumberish;
    };
    type TransferAndLockStructStructOutput = [
        string,
        string,
        BigNumber,
        string,
        BigNumber
    ] & {
        from: string;
        to: string;
        amount: BigNumber;
        data: string;
        expirationTimestamp: BigNumber;
    };
}
export interface ITransferAndLockInterface extends utils.Interface {
    functions: {
        "protectedTransferAndLock((address,address,uint256,bytes,uint256),uint256,uint256,bytes)": FunctionFragment;
        "protectedTransferAndLockByPartition(bytes32,(address,address,uint256,bytes,uint256),uint256,uint256,bytes)": FunctionFragment;
        "transferAndLock(address,uint256,bytes,uint256)": FunctionFragment;
        "transferAndLockByPartition(bytes32,address,uint256,bytes,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "protectedTransferAndLock" | "protectedTransferAndLockByPartition" | "transferAndLock" | "transferAndLockByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "protectedTransferAndLock", values: [
        ITransferAndLock.TransferAndLockStructStruct,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "protectedTransferAndLockByPartition", values: [
        BytesLike,
        ITransferAndLock.TransferAndLockStructStruct,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "transferAndLock", values: [string, BigNumberish, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferAndLockByPartition", values: [BytesLike, string, BigNumberish, BytesLike, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "protectedTransferAndLock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "protectedTransferAndLockByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferAndLock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferAndLockByPartition", data: BytesLike): Result;
    events: {
        "PartitionTransferredAndLocked(bytes32,address,address,uint256,bytes,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "PartitionTransferredAndLocked"): EventFragment;
}
export interface PartitionTransferredAndLockedEventObject {
    partition: string;
    from: string;
    to: string;
    value: BigNumber;
    data: string;
    expirationTimestamp: BigNumber;
    lockId: BigNumber;
}
export type PartitionTransferredAndLockedEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    string,
    BigNumber,
    BigNumber
], PartitionTransferredAndLockedEventObject>;
export type PartitionTransferredAndLockedEventFilter = TypedEventFilter<PartitionTransferredAndLockedEvent>;
export interface ITransferAndLock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ITransferAndLockInterface;
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
        protectedTransferAndLock(_transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        protectedTransferAndLockByPartition(_partition: BytesLike, _transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferAndLock(_to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferAndLockByPartition(_partition: BytesLike, _to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    protectedTransferAndLock(_transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    protectedTransferAndLockByPartition(_partition: BytesLike, _transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferAndLock(_to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferAndLockByPartition(_partition: BytesLike, _to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        protectedTransferAndLock(_transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            lockId_: BigNumber;
        }>;
        protectedTransferAndLockByPartition(_partition: BytesLike, _transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            lockId_: BigNumber;
        }>;
        transferAndLock(_to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            lockId_: BigNumber;
        }>;
        transferAndLockByPartition(_partition: BytesLike, _to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            lockId_: BigNumber;
        }>;
    };
    filters: {
        "PartitionTransferredAndLocked(bytes32,address,address,uint256,bytes,uint256,uint256)"(partition?: BytesLike | null, from?: string | null, to?: null, value?: null, data?: null, expirationTimestamp?: null, lockId?: null): PartitionTransferredAndLockedEventFilter;
        PartitionTransferredAndLocked(partition?: BytesLike | null, from?: string | null, to?: null, value?: null, data?: null, expirationTimestamp?: null, lockId?: null): PartitionTransferredAndLockedEventFilter;
    };
    estimateGas: {
        protectedTransferAndLock(_transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        protectedTransferAndLockByPartition(_partition: BytesLike, _transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferAndLock(_to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferAndLockByPartition(_partition: BytesLike, _to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        protectedTransferAndLock(_transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        protectedTransferAndLockByPartition(_partition: BytesLike, _transferAndLockData: ITransferAndLock.TransferAndLockStructStruct, _deadline: BigNumberish, _nounce: BigNumberish, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferAndLock(_to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferAndLockByPartition(_partition: BytesLike, _to: string, _amount: BigNumberish, _data: BytesLike, _expirationTimestamp: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
