import type { BaseContract, BigNumber, BigNumberish, BytesLike, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface AdjustBalancesStorageWrapper1Interface extends utils.Interface {
    functions: {};
    events: {
        "AdjustmentBalanceSet(address,uint256,uint8)": EventFragment;
        "ComplianceAdded(address)": EventFragment;
        "PartitionsProtected(address)": EventFragment;
        "PartitionsUnProtected(address)": EventFragment;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
        "SnapshotTaken(address,uint256)": EventFragment;
        "SnapshotTriggered(address,uint256)": EventFragment;
        "TokenPaused(address)": EventFragment;
        "TokenUnpaused(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AdjustmentBalanceSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ComplianceAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsUnProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedRedeemFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedTransferFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTaken"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTriggered"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenPaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnpaused"): EventFragment;
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
export interface ComplianceAddedEventObject {
    compliance: string;
}
export type ComplianceAddedEvent = TypedEvent<[
    string
], ComplianceAddedEventObject>;
export type ComplianceAddedEventFilter = TypedEventFilter<ComplianceAddedEvent>;
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
export interface AdjustBalancesStorageWrapper1 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AdjustBalancesStorageWrapper1Interface;
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
        "ComplianceAdded(address)"(compliance?: string | null): ComplianceAddedEventFilter;
        ComplianceAdded(compliance?: string | null): ComplianceAddedEventFilter;
        "PartitionsProtected(address)"(operator?: string | null): PartitionsProtectedEventFilter;
        PartitionsProtected(operator?: string | null): PartitionsProtectedEventFilter;
        "PartitionsUnProtected(address)"(operator?: string | null): PartitionsUnProtectedEventFilter;
        PartitionsUnProtected(operator?: string | null): PartitionsUnProtectedEventFilter;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        ProtectedRedeemFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        ProtectedTransferFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
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
    };
    estimateGas: {};
    populateTransaction: {};
}
