# ATS Facet Methods

> **Generated file — do not edit by hand.** Regenerate after any facet interface change with:
>
> ```bash
> node .claude/skills/solidity-natspec/scripts/gen_facets_methods.mjs
> ```
>
> Maintained via the `solidity-natspec` skill.

## Contents

- [Access Control](#access-control)
- [Adjust Balances](#adjust-balances)
- [Allowance](#allowance)
- [Balance Tracker](#balance-tracker)
- [Balance Tracker Adjusted](#balance-tracker-adjusted)
- [Balance Tracker At Snapshot](#balance-tracker-at-snapshot)
- [Balance Tracker At Snapshot By Partition](#balance-tracker-at-snapshot-by-partition)
- [Balance Tracker By Partition](#balance-tracker-by-partition)
- [Batch Burn](#batch-burn)
- [Batch Controller](#batch-controller)
- [Batch Freeze](#batch-freeze)
- [Batch Mint](#batch-mint)
- [Batch Transfer](#batch-transfer)
- [Burn](#burn)
- [Burn By Partition](#burn-by-partition)
- [Cap](#cap)
- [Cap By Partition](#cap-by-partition)
- [Clearing](#clearing)
- [Clearing At Snapshot](#clearing-at-snapshot)
- [Clearing At Snapshot By Partition](#clearing-at-snapshot-by-partition)
- [Clearing By Partition](#clearing-by-partition)
- [Clearing Hold By Partition](#clearing-hold-by-partition)
- [Compliance By Partition](#compliance-by-partition)
- [Compliance Facet](#compliance-facet)
- [Control List](#control-list)
- [Controller](#controller)
- [Controller By Partition](#controller-by-partition)
- [Controller Hold By Partition](#controller-hold-by-partition)
- [Core](#core)
- [Core Adjusted](#core-adjusted)
- [Core At Snapshot](#core-at-snapshot)
- [Corporate Actions](#corporate-actions)
- [Coupon](#coupon)
- [Coupon Listing](#coupon-listing)
- [Coupon Security Holders](#coupon-security-holders)
- [Custom Data](#custom-data)
- [Deactivate](#deactivate)
- [Dividend](#dividend)
- [Dividend Security Holders](#dividend-security-holders)
- [Documentation](#documentation)
- [EIP712](#eip712)
- [ERC20 Permit](#erc20-permit)
- [External Control List Management](#external-control-list-management)
- [External KYC List Management](#external-kyc-list-management)
- [External Pause Management](#external-pause-management)
- [Freeze](#freeze)
- [Freeze At Snapshot](#freeze-at-snapshot)
- [Freeze At Snapshot By Partition](#freeze-at-snapshot-by-partition)
- [Hold At Snapshot](#hold-at-snapshot)
- [Hold At Snapshot By Partition](#hold-at-snapshot-by-partition)
- [Hold By Partition](#hold-by-partition)
- [Hold Facet](#hold-facet)
- [Identity](#identity)
- [Initializer](#initializer)
- [Interest Rate](#interest-rate)
- [Lock At Snapshot](#lock-at-snapshot)
- [Lock At Snapshot By Partition](#lock-at-snapshot-by-partition)
- [Lock By Partition](#lock-by-partition)
- [Maturity](#maturity)
- [Maturity By Partition](#maturity-by-partition)
- [Mint](#mint)
- [Mint By Partition](#mint-by-partition)
- [Nominal Value At Snapshot](#nominal-value-at-snapshot)
- [Nonces](#nonces)
- [Operator](#operator)
- [Operator By Partition](#operator-by-partition)
- [Operator Clearing By Partition](#operator-clearing-by-partition)
- [Operator Hold By Partition](#operator-hold-by-partition)
- [Partitions](#partitions)
- [Pause](#pause)
- [Principal](#principal)
- [Protected By Partition](#protected-by-partition)
- [Protected Clearing By Partition](#protected-clearing-by-partition)
- [Protected Clearing Hold By Partition](#protected-clearing-hold-by-partition)
- [Protected Hold By Partition](#protected-hold-by-partition)
- [Recovery](#recovery)
- [Scheduled Balance Adjustment](#scheduled-balance-adjustment)
- [Security Holders](#security-holders)
- [Security Holders At Snapshot](#security-holders-at-snapshot)
- [Snapshots By Partition](#snapshots-by-partition)
- [SSI Management](#ssi-management)
- [Transfer](#transfer)
- [Transfer And Lock By Partition](#transfer-and-lock-by-partition)
- [Transfer By Partition](#transfer-by-partition)
- [Voting Security Holders](#voting-security-holders)
- [Compliance](#compliance)
- [ERC20 Votes](#erc20-votes)
- [External Control List](#external-control-list)
- [External KYC List](#external-kyc-list)
- [External Pause](#external-pause)
- [Identity Registry](#identity-registry)
- [KYC](#kyc)
- [Lock](#lock)
- [Operator Clearing Hold By Partition](#operator-clearing-hold-by-partition)
- [Protected Partitions](#protected-partitions)
- [Revocation List](#revocation-list)
- [Snapshots](#snapshots)
- [Votes](#votes)
- [Amortization](#amortization)
- [Bond Read](#bond-read)
- [Equity](#equity)
- [Fixed Rate](#fixed-rate)
- [KPI Linked Rate](#kpi-linked-rate)
- [KPIs](#kpis)
- [Loan](#loan)
- [Loans Portfolio](#loans-portfolio)
- [Nominal Value](#nominal-value)
- [Proceed Recipients](#proceed-recipients)
- [Scheduled Cross Ordered Tasks](#scheduled-cross-ordered-tasks)
- [Security](#security)
- [Voting](#voting)
- [Bond USA](#bond-usa)
- [Equity USA](#equity-usa)
- [Transfer And Lock](#transfer-and-lock)

<!-- core / supporting facets -->

## Access Control

- Interface: `contracts/facets/accessControl/IAccessControl.sol`
- Resolver key: `AccessControl`

```solidity
function initializeAccessControl() external;
function grantRole(bytes32 _role, address _account) external returns (bool success_);
function revokeRole(bytes32 _role, address _account) external returns (bool success_);
function renounceRole(bytes32 _role) external returns (bool success_);
function applyRoles(bytes32[] calldata _roles, bool[] calldata _actives, address _account) external;
function getRoleCountFor(address _account) external view returns (uint256 roleCount_);
function getRolesFor(
  address _account,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (bytes32[] memory roles_);
function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_);
function getRoleMembers(
  bytes32 _role,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
function hasRole(bytes32 _role, address _account) external view returns (bool);
```

## Adjust Balances

- Interface: `contracts/facets/adjustBalances/IAdjustBalances.sol`
- Resolver key: `BalanceAdjustments`

```solidity
function initializeBalanceAdjustments() external;
function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;
```

## Allowance

- Interface: `contracts/facets/allowance/IAllowance.sol`
- Resolver key: `Allowance`

```solidity
function initializeAllowance() external;
function approve(address spender, uint256 value) external returns (bool);
function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);
```

## Balance Tracker

- Interface: `contracts/facets/balanceTracker/IBalanceTracker.sol`
- Resolver key: `BalanceTracker`

```solidity
function initializeBalanceTracker() external;
function balanceOf(address _tokenHolder) external view returns (uint256);
function totalSupply() external view returns (uint256);
function getTotalBalanceFor(address _account) external view returns (uint256);
```

## Balance Tracker Adjusted

- Interface: `contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol`
- Resolver key: `BalanceTrackerAdjusted`

```solidity
function initializeBalanceTrackerAdjusted() external;
function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256);
```

## Balance Tracker At Snapshot

- Interface: `contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol`
- Resolver key: `BalanceTrackerAtSnapshot`

```solidity
function initializeBalanceTrackerAtSnapshot() external;
function balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
function balancesOfAtSnapshot(
  uint256 _snapshotID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (HolderBalance[] memory balances_);
function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/snapshot/ISnapshots.sol
struct HolderBalance {
  address holder;
  uint256 balance;
}
```

## Balance Tracker At Snapshot By Partition

- Interface: `contracts/facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol`
- Resolver key: `BalanceTrackerAtSnapshotByPartition`

```solidity
function initializeBalanceTrackerAtSnapshotByPartition() external;
function balanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
function totalSupplyAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID
) external view returns (uint256 totalSupply_);
```

## Balance Tracker By Partition

- Interface: `contracts/facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol`
- Resolver key: `BalanceTrackerByPartition`

```solidity
function initializeBalanceTrackerByPartition() external;
function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256);
function totalSupplyByPartition(bytes32 _partition) external view returns (uint256);
function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256);
```

## Batch Burn

- Interface: `contracts/facets/batchBurn/IBatchBurn.sol`
- Resolver key: `BatchBurn`

```solidity
function initializeBatchBurn() external;
function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
```

## Batch Controller

- Interface: `contracts/facets/batchController/IBatchController.sol`
- Resolver key: `BatchController`

```solidity
function initializeBatchController() external;
function batchForcedTransfer(
  address[] calldata _fromList,
  address[] calldata _toList,
  uint256[] calldata _amounts
) external;
```

## Batch Freeze

- Interface: `contracts/facets/batchFreeze/IBatchFreeze.sol`
- Resolver key: `BatchFreeze`

```solidity
function initializeBatchFreeze() external;
function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external;
function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
```

## Batch Mint

- Interface: `contracts/facets/batchMint/IBatchMint.sol`
- Resolver key: `BatchMint`

```solidity
function initializeBatchMint() external;
function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;
```

## Batch Transfer

- Interface: `contracts/facets/batchTransfer/IBatchTransfer.sol`
- Resolver key: `BatchTransfer`

```solidity
function initializeBatchTransfer() external;
function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
```

## Burn

- Interface: `contracts/facets/burn/IBurn.sol`
- Resolver key: `Burn`

```solidity
function initializeBurn() external;
function burn(address _userAddress, uint256 _amount) external;
function redeem(uint256 _value, bytes calldata _data) external;
function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
```

## Burn By Partition

- Interface: `contracts/facets/burnByPartition/IBurnByPartition.sol`
- Resolver key: `BurnByPartition`

```solidity
function initializeBurnByPartition() external;
function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;
```

## Cap

- Interface: `contracts/facets/cap/ICap.sol`
- Resolver key: `Cap`

```solidity
function initializeCap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external;
function setMaxSupply(uint256 _maxSupply) external returns (bool success_);
function getMaxSupply() external view returns (uint256 maxSupply_);
```

### Types

```solidity
// declared in contracts/facets/cap/ICap.sol
struct PartitionCap {
  bytes32 partition;
  uint256 maxSupply;
}
```

## Cap By Partition

- Interface: `contracts/facets/capByPartition/ICapByPartition.sol`
- Resolver key: `CapByPartition`

```solidity
function initializeCapByPartition() external;
function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external returns (bool success_);
function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_);
```

## Clearing

- Interface: `contracts/facets/clearing/IClearing.sol`
- Resolver key: `Clearing`

```solidity
function initializeClearing(bool _activateClearing) external;
function activateClearing() external returns (bool success_);
function deactivateClearing() external returns (bool success_);
function isClearingActivated() external view returns (bool);
function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_);
function getClearingThirdParty(
  bytes32 _partition,
  address _tokenHolder,
  IClearingTypes.ClearingOperationType _clearingOperationType,
  uint256 _clearingId
) external view returns (address thirdParty_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation
}
```

## Clearing At Snapshot

- Interface: `contracts/facets/clearingAtSnapshot/IClearingAtSnapshot.sol`
- Resolver key: `ClearingAtSnapshot`

```solidity
function initializeClearingAtSnapshot() external;
function clearedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

## Clearing At Snapshot By Partition

- Interface: `contracts/facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol`
- Resolver key: `ClearingAtSnapshotByPartition`

```solidity
function initializeClearingAtSnapshotByPartition() external;
function clearedBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

## Clearing By Partition

- Interface: `contracts/facets/clearingByPartition/IClearingByPartition.sol`
- Resolver key: `ClearingByPartition`

```solidity
function initializeClearingByPartition() external;
function approveClearingOperationByPartition(
  IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
) external returns (bool success_, bytes32 partition_);
function cancelClearingOperationByPartition(
  IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
) external returns (bool success_);
function reclaimClearingOperationByPartition(
  IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
) external returns (bool success_);
function clearingRedeemByPartition(
  IClearingTypes.ClearingOperation calldata _clearingOperation,
  uint256 _amount
) external returns (bool success_, uint256 clearingId_);
function clearingRedeemFromByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  uint256 _amount
) external returns (bool success_, uint256 clearingId_);
function clearingTransferByPartition(
  IClearingTypes.ClearingOperation calldata _clearingOperation,
  uint256 _amount,
  address _to
) external returns (bool success_, uint256 clearingId_);
function clearingTransferFromByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  uint256 _amount,
  address _to
) external returns (bool success_, uint256 clearingId_);
function getClearingRedeemForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _clearingId
) external view returns (IClearingTypes.ClearingRedeemData memory clearingRedeemData_);
function getClearingTransferForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _clearingId
) external view returns (IClearingTypes.ClearingTransferData memory clearingTransferData_);
function getClearedAmountForByPartition(
  bytes32 _partition,
  address _tokenHolder
) external view returns (uint256 amount_);
function getClearingCountForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  IClearingTypes.ClearingOperationType _clearingOperationType
) external view returns (uint256 clearingCount_);
function getClearingsIdForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  IClearingTypes.ClearingOperationType _clearingOperationType,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (uint256[] memory clearingsId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperationIdentifier {
  ClearingOperationType clearingOperationType;
  bytes32 partition;
  address tokenHolder;
  uint256 clearingId;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperationFrom {
  ClearingOperation clearingOperation;
  address from;
  bytes operatorData;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingRedeemData {
  uint256 amount;
  uint256 expirationTimestamp;
  bytes data;
  bytes operatorData;
  ThirdPartyType operatorType;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingTransferData {
  uint256 amount;
  uint256 expirationTimestamp;
  address destination;
  bytes data;
  bytes operatorData;
  ThirdPartyType operatorType;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation
}

// declared in contracts/domain/asset/types/ThirdPartyType.sol
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER
}
```

## Clearing Hold By Partition

- Interface: `contracts/facets/clearingHoldByPartition/IClearingHoldByPartition.sol`
- Resolver key: `ClearingHoldbypartition`

```solidity
function initializeClearingHoldByPartition() external;
function clearingCreateHoldByPartition(
  IClearingTypes.ClearingOperation calldata _clearingOperation,
  IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 clearingId_);
function clearingCreateHoldFromByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 clearingId_);
function getClearingCreateHoldForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _clearingId
) external view returns (IClearingTypes.ClearingHoldCreationData memory clearingHoldCreationData_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperationFrom {
  ClearingOperation clearingOperation;
  address from;
  bytes operatorData;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingHoldCreationData {
  uint256 amount;
  uint256 expirationTimestamp;
  bytes data;
  address holdEscrow;
  uint256 holdExpirationTimestamp;
  address holdTo;
  bytes holdData;
  bytes operatorData;
  ThirdPartyType operatorType;
}

// declared in contracts/domain/asset/types/ThirdPartyType.sol
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER
}
```

## Compliance By Partition

- Interface: `contracts/facets/complianceByPartition/IComplianceByPartition.sol`
- Resolver key: `ComplianceByPartition`

```solidity
function initializeComplianceByPartition() external;
function canTransferByPartition(
  address _from,
  address _to,
  bytes32 _partition,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external view returns (bool status, bytes1 code, bytes32 reason);
function canRedeemByPartition(
  address _from,
  bytes32 _partition,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external view returns (bool status, bytes1 code, bytes32 reason);
```

## Compliance Facet

- Interface: `contracts/facets/compliance/IComplianceFacet.sol`
- Resolver key: `Compliance`

```solidity
function initializeCompliance(address _compliance) external;
function setCompliance(address _compliance) external;
function canTransfer(address _to, uint256 _value, bytes calldata _data) external view returns (bool, bytes1, bytes32);
function canTransferFrom(
  address _from,
  address _to,
  uint256 _value,
  bytes calldata _data
) external view returns (bool, bytes1, bytes32);
function compliance() external view returns (ICompliance);
```

## Control List

- Interface: `contracts/facets/controlList/IControlList.sol`
- Resolver key: `ControlList`

```solidity
function initializeControlList(bool _isWhiteList) external;
function addToControlList(address _account) external returns (bool success_);
function removeFromControlList(address _account) external returns (bool success_);
function isInControlList(address _account) external view returns (bool);
function getControlListType() external view returns (bool);
function getControlListCount() external view returns (uint256 controlListCount_);
function getControlListMembers(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
```

## Controller

- Interface: `contracts/facets/controller/IController.sol`
- Resolver key: `Controller`

```solidity
function initializeController(bool _isControllable) external;
function controllerTransfer(
  address _from,
  address _to,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external;
function controllerRedeem(
  address _tokenHolder,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external;
function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);
function addAgent(address _agent) external;
function removeAgent(address _agent) external;
function finalizeControllable() external;
function isControllable() external view returns (bool);
function isAgent(address _agent) external view returns (bool);
```

## Controller By Partition

- Interface: `contracts/facets/controllerByPartition/IControllerByPartition.sol`
- Resolver key: `ControllerByPartition`

```solidity
function initializeControllerByPartition() external;
function controllerTransferByPartition(
  bytes32 _partition,
  address _from,
  address _to,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external returns (bytes32);
function controllerRedeemByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external;
```

## Controller Hold By Partition

- Interface: `contracts/facets/controllerHoldByPartition/IControllerHoldByPartition.sol`
- Resolver key: `ControllerHoldByPartition`

```solidity
function initializeControllerHoldByPartition() external;
function controllerCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _operatorData
) external returns (bool success_, uint256 holdId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}
```

## Core

- Interface: `contracts/facets/core/ICore.sol`
- Resolver key: `Core`

```solidity
function initializeCore(ERC20Metadata calldata metadata) external;
function setName(string calldata _name) external;
function setSymbol(string calldata _symbol) external;
function decimals() external view returns (uint8);
function name() external view returns (string memory);
function symbol() external view returns (string memory);
function getERC20Metadata() external view returns (ERC20Metadata memory);
function version() external view returns (string memory);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/ICore.sol
struct ERC20Metadata {
  ERC20MetadataInfo info;
  IFactory.SecurityType securityType;
}

// declared in contracts/factory/ERC3643/interfaces/ICore.sol
struct ERC20MetadataInfo {
  string name;
  string symbol;
  string isin;
  uint8 decimals;
}

// declared in contracts/factory/IFactory.sol
enum SecurityType {
  /// @notice A bond whose coupon rate floats against an external index.
  BondVariableRate,
  /// @notice An equity instrument (shares).
  Equity,
  /// @notice A bond with a fixed coupon rate.
  BondFixedRate,
  /// @notice A bond whose coupon is tied to KPI performance metrics.
  BondKpiLinkedRate,
  /// @notice A loan instrument.
  Loan
}
```

## Core Adjusted

- Interface: `contracts/facets/coreAdjusted/ICoreAdjusted.sol`
- Resolver key: `CoreAdjusted`

```solidity
function initializeCoreAdjusted() external;
function decimalsAt(uint256 _timestamp) external view returns (uint8);
```

## Core At Snapshot

- Interface: `contracts/facets/coreAtSnapshot/ICoreAtSnapshot.sol`
- Resolver key: `CoreAtSnapshot`

```solidity
function initializeCoreAtSnapshot() external;
function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);
```

## Corporate Actions

- Interface: `contracts/facets/corporateActions/ICorporateActions.sol`
- Resolver key: `CorporateActions`

```solidity
function initializeCorporateActions() external;
function getCorporateAction(
  bytes32 _corporateActionId
) external view returns (bytes32 actionType_, uint256 actionIdByType_, bytes memory data_, bool isDisabled_);
function getCorporateActionCount() external view returns (uint256 corporateActionCount_);
function getCorporateActionIds(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (bytes32[] memory corporateActionIds_);
function getCorporateActions(
  uint256 _pageIndex,
  uint256 _pageLength
)
  external
  view
  returns (
    bytes32[] memory actionTypes_,
    uint256[] memory actionIdByType_,
    bytes[] memory datas_,
    bool[] memory isDisabled_
  );
function getCorporateActionCountByType(bytes32 _actionType) external view returns (uint256 corporateActionCount_);
function getCorporateActionIdsByType(
  bytes32 _actionType,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (bytes32[] memory corporateActionIds_);
function getCorporateActionsByType(
  bytes32 _actionType,
  uint256 _pageIndex,
  uint256 _pageLength
)
  external
  view
  returns (
    bytes32[] memory actionTypes_,
    uint256[] memory actionIdByType_,
    bytes[] memory datas_,
    bool[] memory isDisabled_
  );
function actionContentHashExists(bytes32 _contentHash) external view returns (bool);
```

## Coupon

- Interface: `contracts/facets/coupon/ICoupon.sol`
- Resolver key: `Coupon`

```solidity
function initializeCoupon() external;
function setCoupon(Coupon calldata _newCoupon) external returns (uint256 couponID_);
function cancelCoupon(uint256 _couponID) external returns (bool success_);
function forceCancelCoupon(uint256 _couponID) external returns (bool success_);
function getCoupon(
  uint256 _couponID
) external view returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_);
function getCouponFor(uint256 _couponID, address _account) external view returns (CouponFor memory couponFor_);
function getCouponAmountFor(
  uint256 _couponID,
  address _account
) external view returns (CouponAmountFor memory couponAmountFor_);
function getCouponCount() external view returns (uint256 couponCount_);
```

### Types

```solidity
// declared in contracts/facets/coupon/ICouponTypes.sol
struct Coupon {
  uint256 recordDate;
  uint256 executionDate;
  uint256 startDate;
  uint256 endDate;
  uint256 fixingDate;
  uint256 rate;
  uint8 rateDecimals;
  RateCalculationStatus rateStatus;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
struct RegisteredCoupon {
  Coupon coupon;
  uint256 snapshotId;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
struct CouponFor {
  uint256 tokenBalance;
  uint8 decimals;
  uint256 nominalValue;
  uint256 nominalValueDecimals;
  bool recordDateReached;
  Coupon coupon;
  CouponAmountFor couponAmount;
  bool isDisabled;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
struct CouponAmountFor {
  uint256 numerator;
  uint256 denominator;
  bool recordDateReached;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
enum RateCalculationStatus {
  PENDING,
  SET
}
```

## Coupon Listing

- Interface: `contracts/facets/couponListing/ICouponListing.sol`
- Resolver key: `CouponListing`

```solidity
function initializeCouponListing() external;
function getCouponFromOrderedListAt(uint256 _pos, bool _includeDisabled) external view returns (uint256 couponID_);
function getCouponsOrderedList(
  uint256 _pageIndex,
  uint256 _pageLength,
  bool _includeDisabled
) external view returns (uint256[] memory couponIDs_);
function getCouponsOrderedListTotal(bool _includeDisabled) external view returns (uint256 total_);
function scheduledCouponListingCount(bool _includeDisabled) external view returns (uint256);
function getScheduledCouponListing(
  uint256 _pageIndex,
  uint256 _pageLength,
  bool _includeDisabled
) external view returns (ScheduledTask[] memory scheduledCouponListing_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
  uint256 scheduledTimestamp;
  bytes data;
}
```

## Coupon Security Holders

- Interface: `contracts/facets/couponSecurityHolders/ICouponSecurityHolders.sol`
- Resolver key: `CouponSecurityHolders`

```solidity
function initializeCouponSecurityHolders() external;
function getCouponHolders(
  uint256 _couponID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getCouponsFor(
  uint256 _couponID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (CouponFor[] memory couponFor_, address[] memory holders_);
function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);
```

### Types

```solidity
// declared in contracts/facets/coupon/ICouponTypes.sol
struct CouponFor {
  uint256 tokenBalance;
  uint8 decimals;
  uint256 nominalValue;
  uint256 nominalValueDecimals;
  bool recordDateReached;
  Coupon coupon;
  CouponAmountFor couponAmount;
  bool isDisabled;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
struct Coupon {
  uint256 recordDate;
  uint256 executionDate;
  uint256 startDate;
  uint256 endDate;
  uint256 fixingDate;
  uint256 rate;
  uint8 rateDecimals;
  RateCalculationStatus rateStatus;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
struct CouponAmountFor {
  uint256 numerator;
  uint256 denominator;
  bool recordDateReached;
}

// declared in contracts/facets/coupon/ICouponTypes.sol
enum RateCalculationStatus {
  PENDING,
  SET
}
```

## Custom Data

- Interface: `contracts/facets/customData/ICustomData.sol`
- Resolver key: `CustomData`

```solidity
function initializeCustomData() external;
function setCustomData(bytes32 _key, bytes[] calldata _value) external;
function getCustomData(bytes32 _key) external view returns (bytes[] memory value_);
```

## Deactivate

- Interface: `contracts/facets/deactivate/IDeactivate.sol`
- Resolver key: `Deactivate`

```solidity
function initializeDeactivate() external;
function deactivate() external;
function isDeactivated() external view returns (bool);
```

## Dividend

- Interface: `contracts/facets/dividend/IDividend.sol`
- Resolver key: `Dividend`

```solidity
function initializeDividend() external;
function setDividend(Dividend calldata newDividend) external returns (uint256 dividendId_);
function cancelDividend(uint256 dividendId) external returns (bool success_);
function forceCancelDividend(uint256 dividendId) external returns (bool success_);
function getDividend(
  uint256 dividendId
) external view returns (RegisteredDividend memory registeredDividend_, bool isDisabled_);
function getDividendFor(uint256 dividendId, address account) external view returns (DividendFor memory dividendFor_);
function getDividendAmountFor(
  uint256 dividendId,
  address account
) external view returns (DividendAmountFor memory dividendAmountFor_);
function getDividendsCount() external view returns (uint256 dividendCount_);
```

### Types

```solidity
// declared in contracts/facets/dividend/IDividendTypes.sol
struct Dividend {
  uint256 recordDate;
  uint256 executionDate;
  uint256 amount;
  uint8 amountDecimals;
}

// declared in contracts/facets/dividend/IDividendTypes.sol
struct RegisteredDividend {
  Dividend dividend;
  uint256 snapshotId;
}

// declared in contracts/facets/dividend/IDividendTypes.sol
struct DividendFor {
  uint256 tokenBalance;
  uint256 amount;
  uint8 amountDecimals;
  uint256 recordDate;
  uint256 executionDate;
  uint8 decimals;
  bool recordDateReached;
  bool isDisabled;
}

// declared in contracts/facets/dividend/IDividendTypes.sol
struct DividendAmountFor {
  uint256 numerator;
  uint256 denominator;
  bool recordDateReached;
}
```

## Dividend Security Holders

- Interface: `contracts/facets/dividendSecurityHolders/IDividendSecurityHolders.sol`
- Resolver key: `DividendSecurityHolders`

```solidity
function initializeDividendSecurityHolders() external;
function getDividendHolders(
  uint256 dividendId,
  uint256 pageIndex,
  uint256 pageLength
) external view returns (address[] memory holders_);
function getTotalDividendHolders(uint256 dividendId) external view returns (uint256);
```

## Documentation

- Interface: `contracts/facets/documentation/IDocumentation.sol`
- Resolver key: `Documentation`

```solidity
function initializeDocumentation() external;
function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;
function removeDocument(bytes32 _name) external;
function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256);
function getAllDocuments() external view returns (bytes32[] memory);
```

## EIP712

- Interface: `contracts/facets/eip712/IEIP712.sol`
- Resolver key: `Eip712`

```solidity
function initializeEIP712() external;
function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_);
```

## ERC20 Permit

- Interface: `contracts/facets/erc20Permit/IERC20Permit.sol`
- Resolver key: `Erc20permit`

```solidity
function initializeERC20Permit() external;
function permit(
  address owner,
  address spender,
  uint256 value,
  uint256 deadline,
  uint8 v,
  bytes32 r,
  bytes32 s
) external;
```

## External Control List Management

- Interface: `contracts/facets/externalControlListManagement/IExternalControlListManagement.sol`
- Resolver key: `ExternalControlList`

```solidity
function initializeExternalControlLists(address[] calldata _controlLists) external;
function updateExternalControlLists(
  address[] calldata _controlLists,
  bool[] calldata _actives
) external returns (bool success_);
function addExternalControlList(address _controlList) external returns (bool success_);
function removeExternalControlList(address _controlList) external returns (bool success_);
function isExternalControlList(address _controlList) external view returns (bool);
function getExternalControlListsCount() external view returns (uint256 externalControlListsCount_);
function getExternalControlListsMembers(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
```

## External KYC List Management

- Interface: `contracts/facets/externalKycListManagement/IExternalKycListManagement.sol`
- Resolver key: `ExternalKycList`

```solidity
function initializeExternalKycLists(address[] calldata _kycLists) external;
function updateExternalKycLists(
  address[] calldata _kycLists,
  bool[] calldata _actives
) external returns (bool success_);
function addExternalKycList(address _kycList) external returns (bool success_);
function removeExternalKycList(address _kycList) external returns (bool success_);
function isExternalKycList(address _kycList) external view returns (bool);
function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view returns (bool);
function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_);
function getExternalKycListsMembers(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/kyc/IKyc.sol
enum KycStatus {
  NOT_GRANTED,
  GRANTED
}
```

## External Pause Management

- Interface: `contracts/facets/externalPauseManagement/IExternalPauseManagement.sol`
- Resolver key: `ExternalPause`

```solidity
function initializeExternalPauses(address[] calldata _pauses) external;
function updateExternalPauses(address[] calldata _pauses, bool[] calldata _actives) external returns (bool success_);
function addExternalPause(address _pause) external returns (bool success_);
function removeExternalPause(address _pause) external returns (bool success_);
function isExternalPause(address _pause) external view returns (bool);
function getExternalPausesCount() external view returns (uint256 externalPausesCount_);
function getExternalPausesMembers(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
```

## Freeze

- Interface: `contracts/facets/freeze/IFreeze.sol`
- Resolver key: `Freeze`

```solidity
function initializeFreeze() external;
function freezePartialTokens(address _userAddress, uint256 _amount) external;
function unfreezePartialTokens(address _userAddress, uint256 _amount) external;
function setAddressFrozen(address _userAddress, bool _freezeStatus) external;
function getFrozenTokens(address _userAddress) external view returns (uint256);
function isFrozen(address _userAddress) external view returns (bool);
```

## Freeze At Snapshot

- Interface: `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`
- Resolver key: `FreezeAtSnapshot`

```solidity
function initializeFreezeAtSnapshot() external;
function frozenBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

## Freeze At Snapshot By Partition

- Interface: `contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol`
- Resolver key: `FreezeAtSnapshotByPartition`

```solidity
function initializeFreezeAtSnapshotByPartition() external;
function frozenBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

## Hold At Snapshot

- Interface: `contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol`
- Resolver key: `HoldAtSnapshot`

```solidity
function initializeHoldAtSnapshot() external;
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

## Hold At Snapshot By Partition

- Interface: `contracts/facets/holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol`
- Resolver key: `HoldAtSnapshotByPartition`

```solidity
function initializeHoldAtSnapshotByPartition() external;
function heldBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

## Hold By Partition

- Interface: `contracts/facets/holdByPartition/IHoldByPartition.sol`
- Resolver key: `HoldByPartition`

```solidity
function initializeHoldByPartition() external;
function createHoldByPartition(
  bytes32 _partition,
  IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 holdId_);
function createHoldFromByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _operatorData
) external returns (bool success_, uint256 holdId_);
function executeHoldByPartition(
  IHoldTypes.HoldIdentifier calldata _holdIdentifier,
  address _to,
  uint256 _amount
) external returns (bool success_, bytes32 partition_);
function releaseHoldByPartition(
  IHoldTypes.HoldIdentifier calldata _holdIdentifier,
  uint256 _amount
) external returns (bool success_);
function reclaimHoldByPartition(IHoldTypes.HoldIdentifier calldata _holdIdentifier) external returns (bool success_);
function getHeldAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_);
function getHoldCountForByPartition(
  bytes32 _partition,
  address _tokenHolder
) external view returns (uint256 holdCount_);
function getHoldsIdForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (uint256[] memory holdsId_);
function getHoldForByPartition(
  IHoldTypes.HoldIdentifier calldata _holdIdentifier
)
  external
  view
  returns (
    uint256 amount_,
    uint256 expirationTimestamp_,
    address escrow_,
    address destination_,
    bytes memory data_,
    bytes memory operatorData_,
    ThirdPartyType thirdPartyType_
  );
```

### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct HoldIdentifier {
  bytes32 partition;
  address tokenHolder;
  uint256 holdId;
}

// declared in contracts/domain/asset/types/ThirdPartyType.sol
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER
}
```

## Hold Facet

- Interface: `contracts/facets/hold/IHoldFacet.sol`
- Resolver key: `Hold`

```solidity
function initializeHold() external;
function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);
function getHoldThirdParty(
  IHoldTypes.HoldIdentifier calldata _holdIdentifier
) external view returns (address thirdParty_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct HoldIdentifier {
  bytes32 partition;
  address tokenHolder;
  uint256 holdId;
}
```

## Identity

- Interface: `contracts/facets/identity/IIdentity.sol`
- Resolver key: `Identity`

```solidity
function initializeIdentity(address _identityRegistry) external;
function setOnchainID(address _onchainID) external;
function setIdentityRegistry(address _identityRegistry) external;
function identityRegistry() external view returns (IIdentityRegistry);
function onchainID() external view returns (address);
```

## Initializer

- Interface: `contracts/facets/initializer/IInitializer.sol`
- Resolver key: `Initializer`

```solidity
function initializeInitializer(uint256 _maxInitializerFacetIndex) external;
function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external;
function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);
function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);
function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);
function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_);
```

## Interest Rate

- Interface: `contracts/facets/interestRate/IInterestRate.sol`
- Resolver key: `InterestRate`

```solidity
function initializeInterestRateType(RateType rateType) external;
function setCouponRateType(RateType rateType) external;
function getCouponRateType() external view returns (RateType);
```

### Types

```solidity
// declared in contracts/facets/interestRate/IInterestRate.sol
enum RateType {
  NONE,
  STANDARD,
  FIXED,
  KPI_LINKED
}
```

## Lock At Snapshot

- Interface: `contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol`
- Resolver key: `LockAtSnapshot`

```solidity
function initializeLockAtSnapshot() external;
function lockedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

## Lock At Snapshot By Partition

- Interface: `contracts/facets/lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol`
- Resolver key: `LockAtSnapshotByPartition`

```solidity
function initializeLockAtSnapshotByPartition() external;
function lockedBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

## Lock By Partition

- Interface: `contracts/facets/lockByPartition/ILockByPartition.sol`
- Resolver key: `LockByPartition`

```solidity
function initializeLockByPartition() external;
function lockByPartition(
  bytes32 _partition,
  uint256 _amount,
  address _tokenHolder,
  uint256 _expirationTimestamp
) external returns (uint256 lockId_);
function releaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) external returns (bool success_);
function updateLockExpirationByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _lockId,
  uint256 _newExpirationTimestamp
) external returns (bool success_);
function getLockedAmountForByPartition(
  bytes32 _partition,
  address _tokenHolder
) external view returns (uint256 amount_);
function getLockCountForByPartition(
  bytes32 _partition,
  address _tokenHolder
) external view returns (uint256 lockCount_);
function getLocksIdForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (uint256[] memory locksId_);
function getLockForByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _lockId
) external view returns (uint256 amount_, uint256 expirationTimestamp_);
```

## Maturity

- Interface: `contracts/facets/maturity/IMaturity.sol`
- Resolver key: `Maturity`

```solidity
function initializeMaturity() external;
function fullRedeemAtMaturity(address _tokenHolder) external;
function updateMaturityDate(uint256 _newMaturityDate) external returns (bool success_);
```

## Maturity By Partition

- Interface: `contracts/facets/maturityByPartition/IMaturityByPartition.sol`
- Resolver key: `MaturityByPartition`

```solidity
function initializeMaturityByPartition() external;
function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external;
```

## Mint

- Interface: `contracts/facets/mint/IMint.sol`
- Resolver key: `Mint`

```solidity
function initializeERC1594() external;
function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;
function mint(address _to, uint256 _amount) external;
function isIssuable() external view returns (bool issuable_);
```

## Mint By Partition

- Interface: `contracts/facets/mintByPartition/IMintByPartition.sol`
- Resolver key: `MintByPartition`

```solidity
function initializeMintByPartition() external;
function issueByPartition(IERC1410Types.IssueData calldata _issueData) external;
```

### Types

```solidity
// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
struct IssueData {
  bytes32 partition;
  address tokenHolder;
  uint256 value;
  bytes data;
}
```

## Nominal Value At Snapshot

- Interface: `contracts/facets/nominalValueAtSnapshot/INominalValueAtSnapshot.sol`
- Resolver key: `NominalValueAtSnapshot`

```solidity
function initializeNominalValueAtSnapshot() external;
function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_);
function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 nominalValueDecimals_);
```

## Nonces

- Interface: `contracts/facets/nonces/INonces.sol`
- Resolver key: `Nonces`

```solidity
function initializeNonces() external;
function nonces(address owner) external view returns (uint256);
```

## Operator

- Interface: `contracts/facets/operator/IOperator.sol`
- Resolver key: `Operator`

```solidity
function initializeOperator() external;
function authorizeOperator(address _operator) external;
function revokeOperator(address _operator) external;
function isOperator(address _operator, address _tokenHolder) external view returns (bool);
```

## Operator By Partition

- Interface: `contracts/facets/operatorByPartition/IOperatorByPartition.sol`
- Resolver key: `OperatorByPartition`

```solidity
function initializeOperatorByPartition() external;
function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;
function revokeOperatorByPartition(bytes32 _partition, address _operator) external;
function operatorTransferByPartition(OperatorTransferData calldata _operatorTransferData) external returns (bytes32);
function operatorRedeemByPartition(
  bytes32 _partition,
  address _tokenHolder,
  uint256 _value,
  bytes calldata _data,
  bytes calldata _operatorData
) external;
function isOperatorForPartition(
  bytes32 _partition,
  address _operator,
  address _tokenHolder
) external view returns (bool);
```

### Types

```solidity
// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
struct OperatorTransferData {
  bytes32 partition;
  address from;
  address to;
  uint256 value;
  bytes data;
  bytes operatorData;
}
```

## Operator Clearing By Partition

- Interface: `contracts/facets/operatorClearingByPartition/IOperatorClearingByPartition.sol`
- Resolver key: `OperatorClearingByPartition`

```solidity
function initializeOperatorClearingByPartition() external;
function operatorClearingRedeemByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  uint256 _amount
) external returns (bool success_, uint256 clearingId_);
function operatorClearingTransferByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  uint256 _amount,
  address _to
) external returns (bool success_, uint256 clearingId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperationFrom {
  ClearingOperation clearingOperation;
  address from;
  bytes operatorData;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}
```

## Operator Hold By Partition

- Interface: `contracts/facets/operatorHoldByPartition/IOperatorHoldByPartition.sol`
- Resolver key: `OperatorHoldByPartition`

```solidity
function initializeOperatorHoldByPartition() external;
function operatorCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _operatorData
) external returns (bool success_, uint256 holdId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}
```

## Partitions

- Interface: `contracts/facets/partitions/IPartitions.sol`
- Resolver key: `Partitions`

```solidity
function initializePartitions(bool _multiPartition) external;
function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);
function isMultiPartition() external view returns (bool);
```

## Pause

- Interface: `contracts/facets/pause/IPause.sol`
- Resolver key: `Pause`

```solidity
function initializePause() external;
function pause() external returns (bool success_);
function unpause() external returns (bool success_);
function paused() external view returns (bool);
```

## Principal

- Interface: `contracts/facets/principal/IPrincipal.sol`
- Resolver key: `Principal`

```solidity
function initializePrincipal() external;
function getPrincipalFor(address _account) external view returns (PrincipalFor memory principalFor_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IBondTypes.sol
struct PrincipalFor {
  uint256 numerator;
  uint256 denominator;
}
```

## Protected By Partition

- Interface: `contracts/facets/protectedByPartition/IProtectedByPartition.sol`
- Resolver key: `ProtectedByPartition`

```solidity
function initializeProtectedByPartition() external;
function protectedTransferFromByPartition(
  bytes32 _partition,
  address _from,
  address _to,
  uint256 _amount,
  IProtectedPartitions.ProtectionData calldata _protectionData
) external returns (bytes32);
function protectedRedeemFromByPartition(
  bytes32 _partition,
  address _from,
  uint256 _amount,
  IProtectedPartitions.ProtectionData calldata _protectionData
) external;
```

### Types

```solidity
// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
struct ProtectionData {
  uint256 deadline;
  uint256 nonce;
  bytes signature;
}
```

## Protected Clearing By Partition

- Interface: `contracts/facets/protectedClearingByPartition/IProtectedClearingByPartition.sol`
- Resolver key: `ProtectedClearingByPartition`

```solidity
function initializeProtectedClearingByPartition() external;
function protectedClearingRedeemByPartition(
  IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
  uint256 _amount,
  bytes calldata _signature
) external returns (bool success_, uint256 clearingId_);
function protectedClearingTransferByPartition(
  IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
  uint256 _amount,
  address _to,
  bytes calldata _signature
) external returns (bool success_, uint256 clearingId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ProtectedClearingOperation {
  ClearingOperation clearingOperation;
  address from;
  uint256 deadline;
  uint256 nonce;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}
```

## Protected Clearing Hold By Partition

- Interface: `contracts/facets/protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol`
- Resolver key: `ProtectedClearingHoldByPartition`

```solidity
function initializeProtectedClearingHoldByPartition() external;
function protectedClearingCreateHoldByPartition(
  IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _signature
) external returns (bool success_, uint256 clearingId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ProtectedClearingOperation {
  ClearingOperation clearingOperation;
  address from;
  uint256 deadline;
  uint256 nonce;
}

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}
```

## Protected Hold By Partition

- Interface: `contracts/facets/protectedHoldByPartition/IProtectedHoldByPartition.sol`
- Resolver key: `ProtectedHoldByPartition`

```solidity
function initializeProtectedHoldByPartition() external;
function protectedCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.ProtectedHold memory _protectedHold,
  bytes calldata _signature
) external returns (bool success_, uint256 holdId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct ProtectedHold {
  Hold hold;
  uint256 deadline;
  uint256 nonce;
}

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}
```

## Recovery

- Interface: `contracts/facets/recovery/IRecovery.sol`
- Resolver key: `Recovery`

```solidity
function initializeRecovery() external;
function recoveryAddress(
  address _lostWallet,
  address _newWallet,
  address _investorOnchainID
) external returns (bool success_);
function isAddressRecovered(address _wallet) external view returns (bool);
```

## Scheduled Balance Adjustment

- Interface: `contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol`
- Resolver key: `ScheduledBalanceAdjustment`

```solidity
function initializeScheduledBalanceAdjustment() external;
function setScheduledBalanceAdjustment(
  ScheduledBalanceAdjustment calldata _newBalanceAdjustment
) external returns (uint256 balanceAdjustmentID_);
function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external returns (bool success_);
function forceCancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external returns (bool success_);
function getScheduledBalanceAdjustment(
  uint256 _balanceAdjustmentID
) external view returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_);
function getBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_);
function getPendingBalanceAdjustmentCount(bool _includeDisabled) external view returns (uint256);
function getScheduledBalanceAdjustments(
  uint256 _pageIndex,
  uint256 _pageLength,
  bool _includeDisabled
) external view returns (ScheduledTask[] memory scheduledBalanceAdjustment_);
```

### Types

```solidity
// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
struct ScheduledBalanceAdjustment {
  uint256 executionDate;
  uint256 factor;
  uint8 decimals;
}

// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
  uint256 scheduledTimestamp;
  bytes data;
}
```

## Security Holders

- Interface: `contracts/facets/securityHolders/ISecurityHolders.sol`
- Resolver key: `Securityholders`

```solidity
function initializeSecurityHolders() external;
function getSecurityHolders(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] memory holders);
function getTotalSecurityHolders() external view returns (uint256 count);
```

## Security Holders At Snapshot

- Interface: `contracts/facets/securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol`
- Resolver key: `SecurityHoldersAtSnapshot`

```solidity
function initializeSecurityHoldersAtSnapshot() external;
function getTokenHoldersAtSnapshot(
  uint256 _snapshotID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256);
```

## Snapshots By Partition

- Interface: `contracts/facets/snapshotsByPartition/ISnapshotsByPartition.sol`
- Resolver key: `SnapshotsByPartition`

```solidity
function initializeSnapshotsByPartition() external;
function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[] memory);
```

## SSI Management

- Interface: `contracts/facets/ssiManagement/ISsiManagement.sol`
- Resolver key: `SsiManagement`

```solidity
function initializeSsiManagement() external;
function setRevocationRegistryAddress(address _revocationRegistryAddress) external returns (bool success_);
function addIssuer(address _issuer) external returns (bool success_);
function removeIssuer(address _issuer) external returns (bool success_);
function getRevocationRegistryAddress() external view returns (address revocationRegistryAddress_);
function isIssuer(address _issuer) external view returns (bool);
function getIssuerListCount() external view returns (uint256 issuerListCount_);
function getIssuerListMembers(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory members_);
```

## Transfer

- Interface: `contracts/facets/transfer/ITransfer.sol`
- Resolver key: `Transfer`

```solidity
function initializeTransfer() external;
function transfer(address to, uint256 amount) external returns (bool);
function transferFrom(address from, address to, uint256 amount) external returns (bool);
function transferWithData(address _to, uint256 _value, bytes calldata _data) external;
function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;
```

## Transfer And Lock By Partition

- Interface: `contracts/facets/transferAndLockByPartition/ITransferAndLockByPartition.sol`
- Resolver key: `TransferAndLockByPartition`

```solidity
function initializeTransferAndLockByPartition() external;
function transferAndLockByPartition(
  bytes32 _partition,
  address _to,
  uint256 _amount,
  bytes calldata _data,
  uint256 _expirationTimestamp
) external returns (uint256 lockId_);
```

## Transfer By Partition

- Interface: `contracts/facets/transferByPartition/ITransferByPartition.sol`
- Resolver key: `TransferByPartition`

```solidity
function initializeTransferByPartition() external;
function transferByPartition(
  bytes32 _partition,
  BasicTransferInfo calldata _basicTransferInfo,
  bytes memory _data
) external returns (bytes32);
```

### Types

```solidity
// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
struct BasicTransferInfo {
  address to;
  uint256 value;
}
```

## Voting Security Holders

- Interface: `contracts/facets/votingSecurityHolders/IVotingSecurityHolders.sol`
- Resolver key: `VotingSecurityHolders`

```solidity
function initializeVotingSecurityHolders() external;
function getVotingHolders(
  uint256 _voteID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalVotingHolders(uint256 _voteID) external view returns (uint256 totalHolders_);
```

<!-- layer_1 -->

## Compliance

- Interface: `contracts/facets/layer_1/ERC3643/ICompliance.sol`

```solidity
function transferred(address _from, address _to, uint256 _amount) external;
function created(address _to, uint256 _amount) external;
function destroyed(address _from, uint256 _amount) external;
function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
```

## ERC20 Votes

- Interface: `contracts/facets/erc20Votes/IERC20Votes.sol`
- Resolver key: `Erc20votes`

```solidity
function initializeERC20Votes(bool _activated) external;
function isActivated() external view returns (bool);
function checkpoints(address _account, uint256 _pos) external view returns (Checkpoints.Checkpoint memory);
function numCheckpoints(address _account) external view returns (uint256);
```

### Types

```solidity
// declared in contracts/infrastructure/utils/Checkpoints.sol
struct Checkpoint {
  uint256 from;
  uint256 value;
}
```

## External Control List

- Interface: `contracts/facets/layer_1/externalControlList/IExternalControlList.sol`

```solidity
function isAuthorized(address account) external view returns (bool);
```

## External KYC List

- Interface: `contracts/facets/layer_1/externalKycList/IExternalKycList.sol`

```solidity
function getKycStatus(address account) external view returns (IKyc.KycStatus);
```

### Types

```solidity
// declared in contracts/facets/layer_1/kyc/IKyc.sol
enum KycStatus {
  NOT_GRANTED,
  GRANTED
}
```

## External Pause

- Interface: `contracts/facets/layer_1/externalPause/IExternalPause.sol`

```solidity
function isPaused() external view returns (bool);
```

## Identity Registry

- Interface: `contracts/facets/layer_1/ERC3643/IIdentityRegistry.sol`

```solidity
function isVerified(address _userAddress) external view returns (bool);
```

## KYC

- Interface: `contracts/facets/layer_1/kyc/IKyc.sol`
- Resolver key: `Kyc`

```solidity
function initializeInternalKyc(bool _activateInternalKyc) external;
function activateInternalKyc() external returns (bool success_);
function deactivateInternalKyc() external returns (bool success_);
function grantKyc(
  address _account,
  string memory _vcId,
  uint256 _validFrom,
  uint256 _validTo,
  address _issuer
) external returns (bool success_);
function revokeKyc(address _account) external returns (bool success_);
function getKycStatusFor(address _account) external view returns (KycStatus kycStatus_);
function getKycFor(address _account) external view returns (KycData memory kyc_);
function getKycAccountsCount(KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_);
function isInternalKycActivated() external view returns (bool);
function getKycAccountsData(
  KycStatus _kycStatus,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory accounts_, KycData[] memory kycData_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/kyc/IKyc.sol
enum KycStatus {
  NOT_GRANTED,
  GRANTED
}

// declared in contracts/facets/layer_1/kyc/IKyc.sol
struct KycData {
  uint256 validFrom;
  uint256 validTo;
  string vcId;
  address issuer;
  KycStatus status;
}
```

## Lock

- Interface: `contracts/facets/lock/ILock.sol`
- Resolver key: `Lock`

```solidity
function initializeLock() external;
function lock(uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) external returns (uint256 lockId_);
function release(uint256 _lockId, address _tokenHolder) external returns (bool success_);
function updateLockExpiration(
  address _tokenHolder,
  uint256 _lockId,
  uint256 _newExpirationTimestamp
) external returns (bool success_);
function forceReleaseByPartition(
  bytes32 _partition,
  uint256 _lockId,
  address _tokenHolder
) external returns (bool success_);
function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_);
function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_);
function getLocksIdFor(
  address _tokenHolder,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (uint256[] memory locksId_);
function getLockFor(
  address _tokenHolder,
  uint256 _lockId
) external view returns (uint256 amount_, uint256 expirationTimestamp_);
```

## Operator Clearing Hold By Partition

- Interface: `contracts/facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol`
- Resolver key: `OperatorClearingHoldbypartition`

```solidity
function initializeOperatorClearingHoldByPartition() external;
function operatorClearingCreateHoldByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 clearingId_);
```

### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperationFrom {
  ClearingOperation clearingOperation;
  address from;
  bytes operatorData;
}

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct Hold {
  uint256 amount;
  uint256 expirationTimestamp;
  address escrow;
  address to;
  bytes data;
}

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
struct ClearingOperation {
  bytes32 partition;
  uint256 expirationTimestamp;
  bytes data;
}
```

## Protected Partitions

- Interface: `contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol`
- Resolver key: `ProtectedPartitions`

```solidity
function initializeProtectedPartitions(bool _arePartitionsProtected) external returns (bool success_);
function protectPartitions() external returns (bool success_);
function unprotectPartitions() external returns (bool success_);
function arePartitionsProtected() external view returns (bool);
function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_);
```

## Revocation List

- Interface: `contracts/facets/layer_1/kyc/IRevocationList.sol`

```solidity
function revoked(address, string calldata) external view returns (bool);
```

## Snapshots

- Interface: `contracts/facets/layer_1/snapshot/ISnapshots.sol`
- Resolver key: `Snapshots`

```solidity
function initializeSnapshots() external;
function takeSnapshot() external returns (uint256 snapshotID_);
function scheduledSnapshotCount(bool _includeDisabled) external view returns (uint256);
function getScheduledSnapshots(
  uint256 _pageIndex,
  uint256 _pageLength,
  bool _includeDisabled
) external view returns (ScheduledTask[] memory scheduledSnapshot_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
  uint256 scheduledTimestamp;
  bytes data;
}
```

## Votes

- Interface: `contracts/facets/erc20Votes/IVotes.sol`

```solidity
function delegate(address delegatee) external;
function getVotes(address account) external view returns (uint256);
function getPastVotes(address account, uint256 timepoint) external view returns (uint256);
function getPastTotalSupply(uint256 timepoint) external view returns (uint256);
function delegates(address account) external view returns (address);
```

<!-- layer_2 -->

## Amortization

- Interface: `contracts/facets/layer_2/amortization/IAmortization.sol`
- Resolver key: `Amortization`

```solidity
function initializeAmortization() external;
function setAmortization(Amortization calldata _amortization) external returns (bool success_, uint256 amortizationID_);
function cancelAmortization(uint256 _amortizationID) external;
function forceCancelAmortization(uint256 _amortizationID) external;
function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) external;
function setAmortizationHold(
  uint256 _amortizationID,
  address _tokenHolder,
  uint256 _tokenAmount
) external returns (uint256 holdId_);
function getAmortization(
  uint256 _amortizationID
) external view returns (RegisteredAmortization memory registeredAmortization_, bool isDisabled_);
function getAmortizationFor(
  uint256 _amortizationID,
  address _account
) external view returns (AmortizationFor memory amortizationFor_);
function getAmortizationsFor(
  uint256 _amortizationID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (AmortizationFor[] memory amortizationsFor_, address[] memory holders_);
function getAmortizationsCount() external view returns (uint256 amortizationCount_);
function getAmortizationHolders(
  uint256 _amortizationID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalAmortizationHolders(uint256 _amortizationID) external view returns (uint256);
function getAmortizationActiveHolders(
  uint256 _amortizationID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalAmortizationActiveHolders(uint256 _amortizationID) external view returns (uint256);
function getTotalHoldByAmortizationId(uint256 _amortizationID) external view returns (uint256);
function getActiveAmortizationIds(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (uint256[] memory activeIds_);
function getTotalActiveAmortizationIds() external view returns (uint256);
```

### Types

```solidity
// declared in contracts/facets/layer_2/amortization/IAmortization.sol
struct Amortization {
  uint256 recordDate;
  uint256 executionDate;
  uint256 tokensToRedeem;
}

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
struct RegisteredAmortization {
  Amortization amortization;
  uint256 snapshotId;
}

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
struct AmortizationFor {
  uint256 recordDate;
  uint256 executionDate;
  // Hold info (current values, adjusted as of now)
  uint256 holdId; // 0 = no hold created yet
  bool holdActive; // true = hold is active and awaiting DVP execution
  uint256 tokenHeldAmount; // hold amount adjusted at current block time (0 if no hold)
  uint8 decimalsHeld; // token decimals at current block time (0 if no hold)
  uint256 abafAtHold; // ABAF at current block time (0 if no hold)
  // Snapshot (historical values at record date)
  uint256 tokenBalance; // balance at snapshot (or adjusted at recordDate if no snapshot yet)
  uint8 decimalsBalance; // decimals at snapshot
  bool recordDateReached; // whether record date has been reached
  uint256 abafAtSnapshot; // ABAF at snapshot (0 if record date not reached yet)
  // Nominal value
  uint256 nominalValue; // face value of the token
  uint8 nominalValueDecimals; // decimals of the nominal value
}
```

## Bond Read

- Interface: `contracts/facets/layer_2/bond/IBondRead.sol`

```solidity
function initializeBondUSARead() external;
function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IBondTypes.sol
struct BondDetailsData {
  bytes3 currency;
  uint256 nominalValue;
  uint8 nominalValueDecimals;
  uint256 startingDate;
  uint256 maturityDate;
}
```

## Equity

- Interface: `contracts/facets/layer_2/equity/IEquity.sol`

```solidity
function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IEquity.sol
struct EquityDetailsData {
  bool votingRight;
  bool informationRight;
  bool liquidationRight;
  bool subscriptionRight;
  bool conversionRight;
  bool redemptionRight;
  bool putRight;
  DividendType dividendRight;
  bytes3 currency;
  uint256 nominalValue;
  uint8 nominalValueDecimals;
}

// declared in contracts/factory/ERC3643/interfaces/IEquity.sol
enum DividendType {
  NONE,
  PREFERRED,
  COMMON
}
```

## Fixed Rate

- Interface: `contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol`
- Resolver key: `FixedRate`

```solidity
function initializeFixedRate(FixedRateData calldata _initData) external;
function setRate(uint256 _newRate, uint8 _newRateDecimals) external;
function getRate() external view returns (uint256 rate_, uint8 decimals_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IFixedRate.sol
struct FixedRateData {
  uint256 rate;
  uint8 rateDecimals;
}
```

## KPI Linked Rate

- Interface: `contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol`
- Resolver key: `KpiLinkedRate`

```solidity
function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;
function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;
function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;
function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);
function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IKpiLinkedRateErrors.sol
struct InterestRate {
  uint256 maxRate;
  uint256 baseRate;
  uint256 minRate;
  uint256 startPeriod;
  uint256 startRate;
  uint256 missedPenalty;
  uint256 reportPeriod;
  uint8 rateDecimals;
}

// declared in contracts/factory/ERC3643/interfaces/IKpiLinkedRateErrors.sol
struct ImpactData {
  uint256 maxDeviationCap;
  uint256 baseLine;
  uint256 maxDeviationFloor;
  uint8 impactDataDecimals;
  uint256 adjustmentPrecision;
}
```

## KPIs

- Interface: `contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol`
- Resolver key: `Kpis`

```solidity
function initializeKpis() external;
function addKpiData(uint256 _date, uint256 _value, address _project) external;
function getLatestKpiData(
  uint256 _from,
  uint256 _to,
  address _project
) external view returns (uint256 value_, bool exists_);
function getMinDate() external view returns (uint256 minDate_);
function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_);
```

## Loan

- Interface: `contracts/facets/layer_2/loan/ILoan.sol`
- Resolver key: `Loan`

```solidity
function initializeLoan(LoanDetailsData calldata _loanDetailsData) external;
function setLoanDetails(LoanDetailsData calldata loanDetailsData_) external;
function getLoanDetails() external view returns (LoanDetailsData memory loanDetailsData_);
```

### Types

```solidity
// declared in contracts/facets/layer_2/loan/ILoan.sol
struct LoanDetailsData {
  LoanBasicData loanBasicData;
  LoanInterestData loanInterestData;
  RiskData riskData;
  Collateral collateral;
  LoanPerformanceStatus loanPerformanceStatus;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
struct LoanBasicData {
  bytes3 currency;
  uint256 startingDate;
  uint256 maturityDate;
  LoanStructureType loanStructureType;
  RepaymentType repaymentType;
  InterestType interestType;
  uint256 signingDate;
  address originatorAccount;
  address servicerAccount;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
struct LoanInterestData {
  BaseReferenceRate baseReferenceRate;
  uint256 floorRate;
  uint256 capRate;
  uint256 rateMargin;
  DayCount dayCount;
  PaymentFrequency paymentFrequency;
  uint256 firstAccrualDate;
  uint256 prepaymentPenalty;
  uint256 commitmentFee;
  uint256 utilizationFee;
  UtilizationFeeType utilizationFeeType;
  uint256 servicingFee;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
struct RiskData {
  string internalRiskGrade;
  uint256 defaultProbability;
  uint256 lossGivenDefault;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
struct Collateral {
  uint256 totalCollateralValue;
  uint256 loanToValue;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
struct LoanPerformanceStatus {
  PerformanceStatus performanceStatus;
  uint256 daysPastDue;
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum LoanStructureType {
  RCF,
  TERM_LOAN
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum RepaymentType {
  BULLET,
  AMORTIZING
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum InterestType {
  FIXED
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum BaseReferenceRate {
  NONE,
  EURIBOR,
  _3M
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum DayCount {
  ACTUAL360
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum PaymentFrequency {
  MONTHLY,
  QUARTERLY,
  YEARLY
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum UtilizationFeeType {
  EMBEDDED,
  SEPARATE
}

// declared in contracts/facets/layer_2/loan/ILoan.sol
enum PerformanceStatus {
  PERFORMING,
  NON_PERFORMING,
  DEFAULT
}
```

## Loans Portfolio

- Interface: `contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol`
- Resolver key: `LoansPortfolio`

```solidity
function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData) external;
function addHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);
function removeHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);
function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) external returns (bool success_);
function loansPortfolioWithdraw(address _assetAddress, address _to, uint256 _amount) external returns (bool success_);
function getLoansPortfolioData() external view returns (LoansPortfolioDetailsData memory loansPortfolioData_);
function getHoldingsAssets(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] memory assets_);
function getLoanHoldingsAssets(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory assets_);
function getHoldingsAssetOwnership(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory assets_, uint256[] memory balances_);
function getNumberOfAssets() external view returns (uint256 numberOfAssets_);
function getNumberOfLoans() external view returns (uint256 numberOfLoans_);
function getNumberOfCash() external view returns (uint256 numberOfCash_);
function getNumberOfPerformingLoans() external view returns (uint256 numberOfPerformingLoans_);
function getNumberOfNonPerformingLoans() external view returns (uint256 numberOfNonPerformingLoans_);
function getNumberDefaultedLoans() external view returns (uint256 numberDefaultedLoans_);
function getSecuredLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getNonPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getDefaultedLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getGeographicalExposure() external view returns (GeographicalExposureData[] memory geographicalExposure_);
```

### Types

```solidity
// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
struct LoansPortfolioDetailsData {
  PortfolioType portfolioType;
  DistributionPolicy distributionPolicy;
}

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
struct HoldingsAsset {
  address assetAddress;
  HoldingsAssetType holdingsAssetType;
  string country;
}

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
struct GeographicalExposureData {
  string country;
  uint256 count;
}

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
enum PortfolioType {
  NONE,
  STATIC,
  REVOLVING,
  MANAGED,
  OPEN,
  CLOSED
}

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
enum DistributionPolicy {
  NONE,
  DIRECT_PASSTHROUGH,
  ACCRUED
}

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
enum HoldingsAssetType {
  NONE,
  LOAN,
  CASH
}
```

## Nominal Value

- Interface: `contracts/facets/layer_2/nominalValue/INominalValue.sol`
- Resolver key: `NominalValue`

```solidity
function initializeNominalValue(
  uint256 _nominalValue,
  uint8 _nominalValueDecimals,
  bytes3 _nominalValueCurrency
) external;
function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;
function setNominalValueCurrency(bytes3 _nominalValueCurrency) external;
function getNominalValue() external view returns (uint256);
function getNominalValueDecimals() external view returns (uint8);
function getNominalValueCurrency() external view returns (bytes3);
```

## Proceed Recipients

- Interface: `contracts/facets/layer_2/proceedRecipient/IProceedRecipients.sol`
- Resolver key: `ProceedRecipients`

```solidity
function initializeProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) external;
function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external;
function removeProceedRecipient(address _proceedRecipient) external;
function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external;
function isProceedRecipient(address _proceedRecipient) external view returns (bool);
function getProceedRecipientData(address _proceedRecipient) external view returns (bytes memory);
function getProceedRecipientsCount() external view returns (uint256);
function getProceedRecipients(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory proceedRecipients_);
```

## Scheduled Cross Ordered Tasks

- Interface: `contracts/facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol`
- Resolver key: `ScheduledTasks`

```solidity
function initializeScheduledCrossOrderedTasks() external;
function triggerPendingScheduledCrossOrderedTasks() external returns (uint256);
function triggerScheduledCrossOrderedTasks(uint256 _max) external returns (uint256);
function scheduledCrossOrderedTaskCount() external view returns (uint256);
function getScheduledCrossOrderedTasks(
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (ScheduledTask[] memory scheduledTask_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
  uint256 scheduledTimestamp;
  bytes data;
}
```

## Security

- Interface: `contracts/facets/layer_2/security/ISecurity.sol`
- Resolver key: `Security`

```solidity
function initializeSecurity(
  RegulationData memory _regulationData,
  AdditionalSecurityData calldata _additionalSecurityData
) external;
function getSecurityRegulationData() external view returns (SecurityRegulationData memory securityRegulationData_);
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/regulation.sol
struct RegulationData {
  RegulationType regulationType;
  RegulationSubType regulationSubType;
  uint256 dealSize;
  AccreditedInvestors accreditedInvestors;
  uint256 maxNonAccreditedInvestors;
  ManualInvestorVerification manualInvestorVerification;
  InternationalInvestors internationalInvestors;
  ResaleHoldPeriod resaleHoldPeriod;
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
struct AdditionalSecurityData {
  bool countriesControlListType;
  string listOfCountries;
  string info;
}

// declared in contracts/facets/layer_2/security/ISecurity.sol
struct SecurityRegulationData {
  RegulationData regulationData;
  AdditionalSecurityData additionalSecurityData;
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum RegulationType {
  NONE,
  REG_S,
  REG_D
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum RegulationSubType {
  NONE,
  REG_D_506_B,
  REG_D_506_C
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum AccreditedInvestors {
  NONE,
  ACCREDITATION_REQUIRED
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum ManualInvestorVerification {
  NOTHING_TO_VERIFY,
  VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum InternationalInvestors {
  NOT_ALLOWED,
  ALLOWED
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
enum ResaleHoldPeriod {
  NOT_APPLICABLE,
  APPLICABLE_FROM_6_MOTHS_TO_1_YEAR
}
```

## Voting

- Interface: `contracts/facets/layer_2/voting/IVoting.sol`
- Resolver key: `Voting`

```solidity
function initializeVoting() external;
function setVoting(Voting calldata _newVoting) external returns (uint256 voteID_);
function cancelVoting(uint256 _voteId) external returns (bool success_);
function forceCancelVoting(uint256 _voteId) external returns (bool success_);
function getVoting(uint256 _voteID) external view returns (RegisteredVoting memory registeredVoting_, bool isDisabled_);
function getVotingFor(uint256 _voteID, address _account) external view returns (VotingFor memory votingFor_);
function getVotingCount() external view returns (uint256 votingCount_);
```

### Types

```solidity
// declared in contracts/facets/layer_2/voting/IVotingTypes.sol
struct Voting {
  uint256 recordDate;
  bytes data;
}

// declared in contracts/facets/layer_2/voting/IVotingTypes.sol
struct RegisteredVoting {
  Voting voting;
  uint256 snapshotId;
}

// declared in contracts/facets/layer_2/voting/IVotingTypes.sol
struct VotingFor {
  uint256 tokenBalance;
  uint256 recordDate;
  bytes data;
  uint8 decimals;
  bool recordDateReached;
  bool isDisabled;
}
```

<!-- layer_3 -->

## Bond USA

- Interface: `contracts/facets/layer_3/bondUSA/IBondUSA.sol`
- Resolver key: `BondVariableRate`

```solidity
function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IBondTypes.sol
struct BondDetailsData {
  bytes3 currency;
  uint256 nominalValue;
  uint8 nominalValueDecimals;
  uint256 startingDate;
  uint256 maturityDate;
}
```

## Equity USA

- Interface: `contracts/facets/layer_3/equityUSA/IEquityUSA.sol`
- Resolver key: `Equity`

```solidity
function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
```

### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IEquity.sol
struct EquityDetailsData {
  bool votingRight;
  bool informationRight;
  bool liquidationRight;
  bool subscriptionRight;
  bool conversionRight;
  bool redemptionRight;
  bool putRight;
  DividendType dividendRight;
  bytes3 currency;
  uint256 nominalValue;
  uint8 nominalValueDecimals;
}

// declared in contracts/factory/ERC3643/interfaces/IEquity.sol
enum DividendType {
  NONE,
  PREFERRED,
  COMMON
}
```

## Transfer And Lock

- Interface: `contracts/facets/layer_3/transferAndLock/ITransferAndLock.sol`

```solidity
function initializeTransferAndLock() external;
function transferAndLock(
  address _to,
  uint256 _amount,
  bytes calldata _data,
  uint256 _expirationTimestamp
) external returns (uint256 lockId_);
```
