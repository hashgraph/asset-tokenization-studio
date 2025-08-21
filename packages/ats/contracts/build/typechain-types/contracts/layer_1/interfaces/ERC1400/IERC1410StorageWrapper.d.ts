import type { BaseContract, BigNumber, BytesLike, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IERC1410StorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "AuthorizedOperator(address,address)": EventFragment;
        "AuthorizedOperatorByPartition(bytes32,address,address)": EventFragment;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)": EventFragment;
        "RedeemedByPartition(bytes32,address,address,uint256,bytes,bytes)": EventFragment;
        "RevokedOperator(address,address)": EventFragment;
        "RevokedOperatorByPartition(bytes32,address,address)": EventFragment;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IssuedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RedeemedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferByPartition"): EventFragment;
}
export interface AuthorizedOperatorEventObject {
    operator: string;
    tokenHolder: string;
}
export type AuthorizedOperatorEvent = TypedEvent<[
    string,
    string
], AuthorizedOperatorEventObject>;
export type AuthorizedOperatorEventFilter = TypedEventFilter<AuthorizedOperatorEvent>;
export interface AuthorizedOperatorByPartitionEventObject {
    partition: string;
    operator: string;
    tokenHolder: string;
}
export type AuthorizedOperatorByPartitionEvent = TypedEvent<[
    string,
    string,
    string
], AuthorizedOperatorByPartitionEventObject>;
export type AuthorizedOperatorByPartitionEventFilter = TypedEventFilter<AuthorizedOperatorByPartitionEvent>;
export interface IssuedByPartitionEventObject {
    partition: string;
    operator: string;
    to: string;
    value: BigNumber;
    data: string;
}
export type IssuedByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    string
], IssuedByPartitionEventObject>;
export type IssuedByPartitionEventFilter = TypedEventFilter<IssuedByPartitionEvent>;
export interface RedeemedByPartitionEventObject {
    partition: string;
    operator: string;
    from: string;
    value: BigNumber;
    data: string;
    operatorData: string;
}
export type RedeemedByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    string,
    string
], RedeemedByPartitionEventObject>;
export type RedeemedByPartitionEventFilter = TypedEventFilter<RedeemedByPartitionEvent>;
export interface RevokedOperatorEventObject {
    operator: string;
    tokenHolder: string;
}
export type RevokedOperatorEvent = TypedEvent<[
    string,
    string
], RevokedOperatorEventObject>;
export type RevokedOperatorEventFilter = TypedEventFilter<RevokedOperatorEvent>;
export interface RevokedOperatorByPartitionEventObject {
    partition: string;
    operator: string;
    tokenHolder: string;
}
export type RevokedOperatorByPartitionEvent = TypedEvent<[
    string,
    string,
    string
], RevokedOperatorByPartitionEventObject>;
export type RevokedOperatorByPartitionEventFilter = TypedEventFilter<RevokedOperatorByPartitionEvent>;
export interface TransferByPartitionEventObject {
    _fromPartition: string;
    _operator: string;
    _from: string;
    _to: string;
    _value: BigNumber;
    _data: string;
    _operatorData: string;
}
export type TransferByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    string,
    string
], TransferByPartitionEventObject>;
export type TransferByPartitionEventFilter = TypedEventFilter<TransferByPartitionEvent>;
export interface IERC1410StorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IERC1410StorageWrapperInterface;
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
        "AuthorizedOperator(address,address)"(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        AuthorizedOperator(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        "AuthorizedOperatorByPartition(bytes32,address,address)"(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
        AuthorizedOperatorByPartition(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        IssuedByPartition(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        "RedeemedByPartition(bytes32,address,address,uint256,bytes,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, data?: null, operatorData?: null): RedeemedByPartitionEventFilter;
        RedeemedByPartition(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, data?: null, operatorData?: null): RedeemedByPartitionEventFilter;
        "RevokedOperator(address,address)"(operator?: string | null, tokenHolder?: string | null): RevokedOperatorEventFilter;
        RevokedOperator(operator?: string | null, tokenHolder?: string | null): RevokedOperatorEventFilter;
        "RevokedOperatorByPartition(bytes32,address,address)"(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): RevokedOperatorByPartitionEventFilter;
        RevokedOperatorByPartition(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): RevokedOperatorByPartitionEventFilter;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)"(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
        TransferByPartition(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
