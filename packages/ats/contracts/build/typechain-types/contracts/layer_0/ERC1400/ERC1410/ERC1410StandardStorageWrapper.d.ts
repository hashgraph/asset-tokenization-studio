import type { BaseContract, BigNumber, BigNumberish, BytesLike, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ERC1410StandardStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "AdjustmentBalanceSet(address,uint256,uint8)": EventFragment;
        "AuthorizedOperator(address,address)": EventFragment;
        "AuthorizedOperatorByPartition(bytes32,address,address)": EventFragment;
        "ComplianceAdded(address)": EventFragment;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)": EventFragment;
        "PartitionsProtected(address)": EventFragment;
        "PartitionsUnProtected(address)": EventFragment;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "RedeemedByPartition(bytes32,address,address,uint256,bytes,bytes)": EventFragment;
        "RevokedOperator(address,address)": EventFragment;
        "RevokedOperatorByPartition(bytes32,address,address)": EventFragment;
        "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
        "SnapshotTaken(address,uint256)": EventFragment;
        "SnapshotTriggered(address,uint256)": EventFragment;
        "TokenPaused(address)": EventFragment;
        "TokenUnpaused(address)": EventFragment;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AdjustmentBalanceSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ComplianceAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IssuedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsUnProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedRedeemFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedTransferFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RedeemedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTaken"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTriggered"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenPaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnpaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferByPartition"): EventFragment;
}
export interface AdjustmentBalanceSetEventObject {
    operator: string;
    factor: BigNumber;
    decimals: number;
}
export type AdjustmentBalanceSetEvent = TypedEvent<[
    string,
    BigNumber,
    number
], AdjustmentBalanceSetEventObject>;
export type AdjustmentBalanceSetEventFilter = TypedEventFilter<AdjustmentBalanceSetEvent>;
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
export interface ComplianceAddedEventObject {
    compliance: string;
}
export type ComplianceAddedEvent = TypedEvent<[
    string
], ComplianceAddedEventObject>;
export type ComplianceAddedEventFilter = TypedEventFilter<ComplianceAddedEvent>;
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
export interface PartitionsProtectedEventObject {
    operator: string;
}
export type PartitionsProtectedEvent = TypedEvent<[
    string
], PartitionsProtectedEventObject>;
export type PartitionsProtectedEventFilter = TypedEventFilter<PartitionsProtectedEvent>;
export interface PartitionsUnProtectedEventObject {
    operator: string;
}
export type PartitionsUnProtectedEvent = TypedEvent<[
    string
], PartitionsUnProtectedEventObject>;
export type PartitionsUnProtectedEventFilter = TypedEventFilter<PartitionsUnProtectedEvent>;
export interface ProtectedRedeemFromEventObject {
    partition: string;
    operator: string;
    from: string;
    value: BigNumber;
    deadline: BigNumber;
    nounce: BigNumber;
    signature: string;
}
export type ProtectedRedeemFromEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string
], ProtectedRedeemFromEventObject>;
export type ProtectedRedeemFromEventFilter = TypedEventFilter<ProtectedRedeemFromEvent>;
export interface ProtectedTransferFromEventObject {
    partition: string;
    operator: string;
    from: string;
    to: string;
    value: BigNumber;
    deadline: BigNumber;
    nounce: BigNumber;
    signature: string;
}
export type ProtectedTransferFromEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string
], ProtectedTransferFromEventObject>;
export type ProtectedTransferFromEventFilter = TypedEventFilter<ProtectedTransferFromEvent>;
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
export interface RoleAdminChangedEventObject {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
}
export type RoleAdminChangedEvent = TypedEvent<[
    string,
    string,
    string
], RoleAdminChangedEventObject>;
export type RoleAdminChangedEventFilter = TypedEventFilter<RoleAdminChangedEvent>;
export interface SnapshotTakenEventObject {
    operator: string;
    snapshotID: BigNumber;
}
export type SnapshotTakenEvent = TypedEvent<[
    string,
    BigNumber
], SnapshotTakenEventObject>;
export type SnapshotTakenEventFilter = TypedEventFilter<SnapshotTakenEvent>;
export interface SnapshotTriggeredEventObject {
    operator: string;
    snapshotId: BigNumber;
}
export type SnapshotTriggeredEvent = TypedEvent<[
    string,
    BigNumber
], SnapshotTriggeredEventObject>;
export type SnapshotTriggeredEventFilter = TypedEventFilter<SnapshotTriggeredEvent>;
export interface TokenPausedEventObject {
    operator: string;
}
export type TokenPausedEvent = TypedEvent<[string], TokenPausedEventObject>;
export type TokenPausedEventFilter = TypedEventFilter<TokenPausedEvent>;
export interface TokenUnpausedEventObject {
    operator: string;
}
export type TokenUnpausedEvent = TypedEvent<[string], TokenUnpausedEventObject>;
export type TokenUnpausedEventFilter = TypedEventFilter<TokenUnpausedEvent>;
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
export interface ERC1410StandardStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1410StandardStorageWrapperInterface;
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
        "AdjustmentBalanceSet(address,uint256,uint8)"(operator?: string | null, factor?: null, decimals?: null): AdjustmentBalanceSetEventFilter;
        AdjustmentBalanceSet(operator?: string | null, factor?: null, decimals?: null): AdjustmentBalanceSetEventFilter;
        "AuthorizedOperator(address,address)"(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        AuthorizedOperator(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        "AuthorizedOperatorByPartition(bytes32,address,address)"(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
        AuthorizedOperatorByPartition(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
        "ComplianceAdded(address)"(compliance?: string | null): ComplianceAddedEventFilter;
        ComplianceAdded(compliance?: string | null): ComplianceAddedEventFilter;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        IssuedByPartition(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        "PartitionsProtected(address)"(operator?: string | null): PartitionsProtectedEventFilter;
        PartitionsProtected(operator?: string | null): PartitionsProtectedEventFilter;
        "PartitionsUnProtected(address)"(operator?: string | null): PartitionsUnProtectedEventFilter;
        PartitionsUnProtected(operator?: string | null): PartitionsUnProtectedEventFilter;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        ProtectedRedeemFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        ProtectedTransferFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        "RedeemedByPartition(bytes32,address,address,uint256,bytes,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, data?: null, operatorData?: null): RedeemedByPartitionEventFilter;
        RedeemedByPartition(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, data?: null, operatorData?: null): RedeemedByPartitionEventFilter;
        "RevokedOperator(address,address)"(operator?: string | null, tokenHolder?: string | null): RevokedOperatorEventFilter;
        RevokedOperator(operator?: string | null, tokenHolder?: string | null): RevokedOperatorEventFilter;
        "RevokedOperatorByPartition(bytes32,address,address)"(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): RevokedOperatorByPartitionEventFilter;
        RevokedOperatorByPartition(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): RevokedOperatorByPartitionEventFilter;
        "RoleAdminChanged(bytes32,bytes32,bytes32)"(role?: BytesLike | null, previousAdminRole?: BytesLike | null, newAdminRole?: BytesLike | null): RoleAdminChangedEventFilter;
        RoleAdminChanged(role?: BytesLike | null, previousAdminRole?: BytesLike | null, newAdminRole?: BytesLike | null): RoleAdminChangedEventFilter;
        "SnapshotTaken(address,uint256)"(operator?: string | null, snapshotID?: BigNumberish | null): SnapshotTakenEventFilter;
        SnapshotTaken(operator?: string | null, snapshotID?: BigNumberish | null): SnapshotTakenEventFilter;
        "SnapshotTriggered(address,uint256)"(operator?: string | null, snapshotId?: null): SnapshotTriggeredEventFilter;
        SnapshotTriggered(operator?: string | null, snapshotId?: null): SnapshotTriggeredEventFilter;
        "TokenPaused(address)"(operator?: string | null): TokenPausedEventFilter;
        TokenPaused(operator?: string | null): TokenPausedEventFilter;
        "TokenUnpaused(address)"(operator?: string | null): TokenUnpausedEventFilter;
        TokenUnpaused(operator?: string | null): TokenUnpausedEventFilter;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)"(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
        TransferByPartition(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
