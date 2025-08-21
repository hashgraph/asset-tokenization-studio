import type { BaseContract, BigNumber, BigNumberish, BytesLike, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
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
export interface IClearingStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "ClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedHoldFromByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedRedeemFromByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedTransferFromByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ProtectedClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ProtectedClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ProtectedClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ClearedHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedHoldFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorTransferByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedRedeemFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedTransferByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedTransferFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedTransferByPartition"): EventFragment;
}
export interface ClearedHoldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    hold: HoldStructOutput;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedHoldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    BigNumber,
    string,
    string
], ClearedHoldByPartitionEventObject>;
export type ClearedHoldByPartitionEventFilter = TypedEventFilter<ClearedHoldByPartitionEvent>;
export interface ClearedHoldFromByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    hold: HoldStructOutput;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedHoldFromByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    BigNumber,
    string,
    string
], ClearedHoldFromByPartitionEventObject>;
export type ClearedHoldFromByPartitionEventFilter = TypedEventFilter<ClearedHoldFromByPartitionEvent>;
export interface ClearedOperatorHoldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    hold: HoldStructOutput;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedOperatorHoldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    BigNumber,
    string,
    string
], ClearedOperatorHoldByPartitionEventObject>;
export type ClearedOperatorHoldByPartitionEventFilter = TypedEventFilter<ClearedOperatorHoldByPartitionEvent>;
export interface ClearedOperatorRedeemByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedOperatorRedeemByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedOperatorRedeemByPartitionEventObject>;
export type ClearedOperatorRedeemByPartitionEventFilter = TypedEventFilter<ClearedOperatorRedeemByPartitionEvent>;
export interface ClearedOperatorTransferByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    to: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedOperatorTransferByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedOperatorTransferByPartitionEventObject>;
export type ClearedOperatorTransferByPartitionEventFilter = TypedEventFilter<ClearedOperatorTransferByPartitionEvent>;
export interface ClearedRedeemByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedRedeemByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedRedeemByPartitionEventObject>;
export type ClearedRedeemByPartitionEventFilter = TypedEventFilter<ClearedRedeemByPartitionEvent>;
export interface ClearedRedeemFromByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedRedeemFromByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedRedeemFromByPartitionEventObject>;
export type ClearedRedeemFromByPartitionEventFilter = TypedEventFilter<ClearedRedeemFromByPartitionEvent>;
export interface ClearedTransferByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    to: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedTransferByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedTransferByPartitionEventObject>;
export type ClearedTransferByPartitionEventFilter = TypedEventFilter<ClearedTransferByPartitionEvent>;
export interface ClearedTransferFromByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    to: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ClearedTransferFromByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ClearedTransferFromByPartitionEventObject>;
export type ClearedTransferFromByPartitionEventFilter = TypedEventFilter<ClearedTransferFromByPartitionEvent>;
export interface ProtectedClearedHoldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    hold: HoldStructOutput;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ProtectedClearedHoldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    BigNumber,
    string,
    string
], ProtectedClearedHoldByPartitionEventObject>;
export type ProtectedClearedHoldByPartitionEventFilter = TypedEventFilter<ProtectedClearedHoldByPartitionEvent>;
export interface ProtectedClearedRedeemByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ProtectedClearedRedeemByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ProtectedClearedRedeemByPartitionEventObject>;
export type ProtectedClearedRedeemByPartitionEventFilter = TypedEventFilter<ProtectedClearedRedeemByPartitionEvent>;
export interface ProtectedClearedTransferByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    to: string;
    partition: string;
    clearingId: BigNumber;
    amount: BigNumber;
    expirationDate: BigNumber;
    data: string;
    operatorData: string;
}
export type ProtectedClearedTransferByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string
], ProtectedClearedTransferByPartitionEventObject>;
export type ProtectedClearedTransferByPartitionEventFilter = TypedEventFilter<ProtectedClearedTransferByPartitionEvent>;
export interface IClearingStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IClearingStorageWrapperInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
    filters: {
        "ClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedHoldByPartitionEventFilter;
        ClearedHoldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedHoldByPartitionEventFilter;
        "ClearedHoldFromByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedHoldFromByPartitionEventFilter;
        ClearedHoldFromByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedHoldFromByPartitionEventFilter;
        "ClearedOperatorHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorHoldByPartitionEventFilter;
        ClearedOperatorHoldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorHoldByPartitionEventFilter;
        "ClearedOperatorRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorRedeemByPartitionEventFilter;
        ClearedOperatorRedeemByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorRedeemByPartitionEventFilter;
        "ClearedOperatorTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorTransferByPartitionEventFilter;
        ClearedOperatorTransferByPartition(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedOperatorTransferByPartitionEventFilter;
        "ClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedRedeemByPartitionEventFilter;
        ClearedRedeemByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedRedeemByPartitionEventFilter;
        "ClearedRedeemFromByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedRedeemFromByPartitionEventFilter;
        ClearedRedeemFromByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedRedeemFromByPartitionEventFilter;
        "ClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedTransferByPartitionEventFilter;
        ClearedTransferByPartition(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedTransferByPartitionEventFilter;
        "ClearedTransferFromByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedTransferFromByPartitionEventFilter;
        ClearedTransferFromByPartition(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ClearedTransferFromByPartitionEventFilter;
        "ProtectedClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedHoldByPartitionEventFilter;
        ProtectedClearedHoldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedHoldByPartitionEventFilter;
        "ProtectedClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedRedeemByPartitionEventFilter;
        ProtectedClearedRedeemByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedRedeemByPartitionEventFilter;
        "ProtectedClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedTransferByPartitionEventFilter;
        ProtectedClearedTransferByPartition(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedTransferByPartitionEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
