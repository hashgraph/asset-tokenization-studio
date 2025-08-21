import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
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
export type ProtectedHoldStruct = {
    hold: HoldStruct;
    deadline: BigNumberish;
    nonce: BigNumberish;
};
export type ProtectedHoldStructOutput = [
    HoldStructOutput,
    BigNumber,
    BigNumber
] & {
    hold: HoldStructOutput;
    deadline: BigNumber;
    nonce: BigNumber;
};
export interface HoldManagementInterface extends utils.Interface {
    functions: {
        "controllerCreateHoldByPartition(bytes32,address,(uint256,uint256,address,address,bytes),bytes)": FunctionFragment;
        "operatorCreateHoldByPartition(bytes32,address,(uint256,uint256,address,address,bytes),bytes)": FunctionFragment;
        "protectedCreateHoldByPartition(bytes32,address,((uint256,uint256,address,address,bytes),uint256,uint256),bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "controllerCreateHoldByPartition" | "operatorCreateHoldByPartition" | "protectedCreateHoldByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "controllerCreateHoldByPartition", values: [BytesLike, string, HoldStruct, BytesLike]): string;
    encodeFunctionData(functionFragment: "operatorCreateHoldByPartition", values: [BytesLike, string, HoldStruct, BytesLike]): string;
    encodeFunctionData(functionFragment: "protectedCreateHoldByPartition", values: [BytesLike, string, ProtectedHoldStruct, BytesLike]): string;
    decodeFunctionResult(functionFragment: "controllerCreateHoldByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "operatorCreateHoldByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "protectedCreateHoldByPartition", data: BytesLike): Result;
    events: {
        "AdjustmentBalanceSet(address,uint256,uint8)": EventFragment;
        "Approval(address,address,uint256)": EventFragment;
        "AuthorizedOperator(address,address)": EventFragment;
        "AuthorizedOperatorByPartition(bytes32,address,address)": EventFragment;
        "ClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedHoldFromByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedOperatorTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedRedeemFromByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ClearedTransferFromByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ComplianceAdded(address)": EventFragment;
        "ControllerHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)": EventFragment;
        "ControllerRedemption(address,address,uint256,bytes,bytes)": EventFragment;
        "ControllerTransfer(address,address,address,uint256,bytes,bytes)": EventFragment;
        "FinalizedControllerFeature(address)": EventFragment;
        "Issued(address,address,uint256,bytes)": EventFragment;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)": EventFragment;
        "MaxSupplyByPartitionSet(address,bytes32,uint256,uint256)": EventFragment;
        "MaxSupplySet(address,uint256,uint256)": EventFragment;
        "OperatorHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)": EventFragment;
        "PartitionsProtected(address)": EventFragment;
        "PartitionsUnProtected(address)": EventFragment;
        "ProtectedClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)": EventFragment;
        "ProtectedClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ProtectedClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)": EventFragment;
        "ProtectedHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)": EventFragment;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)": EventFragment;
        "Redeemed(address,address,uint256,bytes)": EventFragment;
        "RedeemedByPartition(bytes32,address,address,uint256,bytes,bytes)": EventFragment;
        "RevokedOperator(address,address)": EventFragment;
        "RevokedOperatorByPartition(bytes32,address,address)": EventFragment;
        "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
        "SnapshotTaken(address,uint256)": EventFragment;
        "SnapshotTriggered(address,uint256)": EventFragment;
        "TokenPaused(address)": EventFragment;
        "TokenUnpaused(address)": EventFragment;
        "Transfer(address,address,uint256)": EventFragment;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AdjustmentBalanceSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AuthorizedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedHoldFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedOperatorTransferByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedRedeemFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedTransferByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClearedTransferFromByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ComplianceAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ControllerHeldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ControllerRedemption"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ControllerTransfer"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FinalizedControllerFeature"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Issued"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IssuedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MaxSupplyByPartitionSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MaxSupplySet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OperatorHeldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PartitionsUnProtected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedHoldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedRedeemByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedClearedTransferByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedHeldByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedRedeemFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProtectedTransferFrom"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Redeemed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RedeemedByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperator"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RevokedOperatorByPartition"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTaken"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTriggered"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenPaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenUnpaused"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
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
export interface ApprovalEventObject {
    owner: string;
    spender: string;
    value: BigNumber;
}
export type ApprovalEvent = TypedEvent<[
    string,
    string,
    BigNumber
], ApprovalEventObject>;
export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;
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
export interface ComplianceAddedEventObject {
    compliance: string;
}
export type ComplianceAddedEvent = TypedEvent<[
    string
], ComplianceAddedEventObject>;
export type ComplianceAddedEventFilter = TypedEventFilter<ComplianceAddedEvent>;
export interface ControllerHeldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    holdId: BigNumber;
    hold: HoldStructOutput;
    operatorData: string;
}
export type ControllerHeldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    string
], ControllerHeldByPartitionEventObject>;
export type ControllerHeldByPartitionEventFilter = TypedEventFilter<ControllerHeldByPartitionEvent>;
export interface ControllerRedemptionEventObject {
    _controller: string;
    _tokenHolder: string;
    _value: BigNumber;
    _data: string;
    _operatorData: string;
}
export type ControllerRedemptionEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    string,
    string
], ControllerRedemptionEventObject>;
export type ControllerRedemptionEventFilter = TypedEventFilter<ControllerRedemptionEvent>;
export interface ControllerTransferEventObject {
    _controller: string;
    _from: string;
    _to: string;
    _value: BigNumber;
    _data: string;
    _operatorData: string;
}
export type ControllerTransferEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    string,
    string
], ControllerTransferEventObject>;
export type ControllerTransferEventFilter = TypedEventFilter<ControllerTransferEvent>;
export interface FinalizedControllerFeatureEventObject {
    operator: string;
}
export type FinalizedControllerFeatureEvent = TypedEvent<[
    string
], FinalizedControllerFeatureEventObject>;
export type FinalizedControllerFeatureEventFilter = TypedEventFilter<FinalizedControllerFeatureEvent>;
export interface IssuedEventObject {
    _operator: string;
    _to: string;
    _value: BigNumber;
    _data: string;
}
export type IssuedEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    string
], IssuedEventObject>;
export type IssuedEventFilter = TypedEventFilter<IssuedEvent>;
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
export interface MaxSupplyByPartitionSetEventObject {
    operator: string;
    partition: string;
    newMaxSupply: BigNumber;
    previousMaxSupply: BigNumber;
}
export type MaxSupplyByPartitionSetEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], MaxSupplyByPartitionSetEventObject>;
export type MaxSupplyByPartitionSetEventFilter = TypedEventFilter<MaxSupplyByPartitionSetEvent>;
export interface MaxSupplySetEventObject {
    operator: string;
    newMaxSupply: BigNumber;
    previousMaxSupply: BigNumber;
}
export type MaxSupplySetEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], MaxSupplySetEventObject>;
export type MaxSupplySetEventFilter = TypedEventFilter<MaxSupplySetEvent>;
export interface OperatorHeldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    holdId: BigNumber;
    hold: HoldStructOutput;
    operatorData: string;
}
export type OperatorHeldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    string
], OperatorHeldByPartitionEventObject>;
export type OperatorHeldByPartitionEventFilter = TypedEventFilter<OperatorHeldByPartitionEvent>;
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
export interface ProtectedHeldByPartitionEventObject {
    operator: string;
    tokenHolder: string;
    partition: string;
    holdId: BigNumber;
    hold: HoldStructOutput;
    operatorData: string;
}
export type ProtectedHeldByPartitionEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    HoldStructOutput,
    string
], ProtectedHeldByPartitionEventObject>;
export type ProtectedHeldByPartitionEventFilter = TypedEventFilter<ProtectedHeldByPartitionEvent>;
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
export interface RedeemedEventObject {
    _operator: string;
    _from: string;
    _value: BigNumber;
    _data: string;
}
export type RedeemedEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    string
], RedeemedEventObject>;
export type RedeemedEventFilter = TypedEventFilter<RedeemedEvent>;
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
export interface TransferEventObject {
    from: string;
    to: string;
    value: BigNumber;
}
export type TransferEvent = TypedEvent<[
    string,
    string,
    BigNumber
], TransferEventObject>;
export type TransferEventFilter = TypedEventFilter<TransferEvent>;
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
export interface HoldManagement extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: HoldManagementInterface;
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
        controllerCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        operatorCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        protectedCreateHoldByPartition(_partition: BytesLike, _from: string, _protectedHold: ProtectedHoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    controllerCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    operatorCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    protectedCreateHoldByPartition(_partition: BytesLike, _from: string, _protectedHold: ProtectedHoldStruct, _signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        controllerCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            holdId_: BigNumber;
        }>;
        operatorCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            holdId_: BigNumber;
        }>;
        protectedCreateHoldByPartition(_partition: BytesLike, _from: string, _protectedHold: ProtectedHoldStruct, _signature: BytesLike, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            holdId_: BigNumber;
        }>;
    };
    filters: {
        "AdjustmentBalanceSet(address,uint256,uint8)"(operator?: string | null, factor?: null, decimals?: null): AdjustmentBalanceSetEventFilter;
        AdjustmentBalanceSet(operator?: string | null, factor?: null, decimals?: null): AdjustmentBalanceSetEventFilter;
        "Approval(address,address,uint256)"(owner?: string | null, spender?: string | null, value?: null): ApprovalEventFilter;
        Approval(owner?: string | null, spender?: string | null, value?: null): ApprovalEventFilter;
        "AuthorizedOperator(address,address)"(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        AuthorizedOperator(operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorEventFilter;
        "AuthorizedOperatorByPartition(bytes32,address,address)"(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
        AuthorizedOperatorByPartition(partition?: BytesLike | null, operator?: string | null, tokenHolder?: string | null): AuthorizedOperatorByPartitionEventFilter;
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
        "ComplianceAdded(address)"(compliance?: string | null): ComplianceAddedEventFilter;
        ComplianceAdded(compliance?: string | null): ComplianceAddedEventFilter;
        "ControllerHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): ControllerHeldByPartitionEventFilter;
        ControllerHeldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): ControllerHeldByPartitionEventFilter;
        "ControllerRedemption(address,address,uint256,bytes,bytes)"(_controller?: null, _tokenHolder?: string | null, _value?: null, _data?: null, _operatorData?: null): ControllerRedemptionEventFilter;
        ControllerRedemption(_controller?: null, _tokenHolder?: string | null, _value?: null, _data?: null, _operatorData?: null): ControllerRedemptionEventFilter;
        "ControllerTransfer(address,address,address,uint256,bytes,bytes)"(_controller?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): ControllerTransferEventFilter;
        ControllerTransfer(_controller?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): ControllerTransferEventFilter;
        "FinalizedControllerFeature(address)"(operator?: null): FinalizedControllerFeatureEventFilter;
        FinalizedControllerFeature(operator?: null): FinalizedControllerFeatureEventFilter;
        "Issued(address,address,uint256,bytes)"(_operator?: string | null, _to?: string | null, _value?: null, _data?: null): IssuedEventFilter;
        Issued(_operator?: string | null, _to?: string | null, _value?: null, _data?: null): IssuedEventFilter;
        "IssuedByPartition(bytes32,address,address,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        IssuedByPartition(partition?: BytesLike | null, operator?: string | null, to?: string | null, value?: null, data?: null): IssuedByPartitionEventFilter;
        "MaxSupplyByPartitionSet(address,bytes32,uint256,uint256)"(operator?: string | null, partition?: BytesLike | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplyByPartitionSetEventFilter;
        MaxSupplyByPartitionSet(operator?: string | null, partition?: BytesLike | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplyByPartitionSetEventFilter;
        "MaxSupplySet(address,uint256,uint256)"(operator?: string | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplySetEventFilter;
        MaxSupplySet(operator?: string | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplySetEventFilter;
        "OperatorHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): OperatorHeldByPartitionEventFilter;
        OperatorHeldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): OperatorHeldByPartitionEventFilter;
        "PartitionsProtected(address)"(operator?: string | null): PartitionsProtectedEventFilter;
        PartitionsProtected(operator?: string | null): PartitionsProtectedEventFilter;
        "PartitionsUnProtected(address)"(operator?: string | null): PartitionsUnProtectedEventFilter;
        PartitionsUnProtected(operator?: string | null): PartitionsUnProtectedEventFilter;
        "ProtectedClearedHoldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedHoldByPartitionEventFilter;
        ProtectedClearedHoldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, hold?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedHoldByPartitionEventFilter;
        "ProtectedClearedRedeemByPartition(address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedRedeemByPartitionEventFilter;
        ProtectedClearedRedeemByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedRedeemByPartitionEventFilter;
        "ProtectedClearedTransferByPartition(address,address,address,bytes32,uint256,uint256,uint256,bytes,bytes)"(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedTransferByPartitionEventFilter;
        ProtectedClearedTransferByPartition(operator?: string | null, tokenHolder?: string | null, to?: string | null, partition?: null, clearingId?: null, amount?: null, expirationDate?: null, data?: null, operatorData?: null): ProtectedClearedTransferByPartitionEventFilter;
        "ProtectedHeldByPartition(address,address,bytes32,uint256,(uint256,uint256,address,address,bytes),bytes)"(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): ProtectedHeldByPartitionEventFilter;
        ProtectedHeldByPartition(operator?: string | null, tokenHolder?: string | null, partition?: null, holdId?: null, hold?: null, operatorData?: null): ProtectedHeldByPartitionEventFilter;
        "ProtectedRedeemFrom(bytes32,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        ProtectedRedeemFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedRedeemFromEventFilter;
        "ProtectedTransferFrom(bytes32,address,address,address,uint256,uint256,uint256,bytes)"(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        ProtectedTransferFrom(partition?: BytesLike | null, operator?: string | null, from?: string | null, to?: null, value?: null, deadline?: null, nounce?: null, signature?: null): ProtectedTransferFromEventFilter;
        "Redeemed(address,address,uint256,bytes)"(_operator?: string | null, _from?: string | null, _value?: null, _data?: null): RedeemedEventFilter;
        Redeemed(_operator?: string | null, _from?: string | null, _value?: null, _data?: null): RedeemedEventFilter;
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
        "Transfer(address,address,uint256)"(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
        Transfer(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
        "TransferByPartition(bytes32,address,address,address,uint256,bytes,bytes)"(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
        TransferByPartition(_fromPartition?: BytesLike | null, _operator?: null, _from?: string | null, _to?: string | null, _value?: null, _data?: null, _operatorData?: null): TransferByPartitionEventFilter;
    };
    estimateGas: {
        controllerCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        operatorCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        protectedCreateHoldByPartition(_partition: BytesLike, _from: string, _protectedHold: ProtectedHoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        controllerCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        operatorCreateHoldByPartition(_partition: BytesLike, _from: string, _hold: HoldStruct, _operatorData: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        protectedCreateHoldByPartition(_partition: BytesLike, _from: string, _protectedHold: ProtectedHoldStruct, _signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
