# ATS Facet Methods

> **Generated file — do not edit by hand.** Regenerate after any facet interface change with:
> 
> ```bash
> node gen_facets_methods.mjs
> ```
> 
> Maintained via the `solidity-natspec` skill.

## Contents

- [Methods](#methods)
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
  - [Business Logic Resolver](#business-logic-resolver)
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
  - [Diamond Cut](#diamond-cut)
  - [Diamond Cut Manager](#diamond-cut-manager)
  - [Diamond Facet](#diamond-facet)
  - [Diamond Loupe](#diamond-loupe)
  - [Dividend](#dividend)
  - [Dividend Security Holders](#dividend-security-holders)
  - [Documentation](#documentation)
  - [EIP712](#eip712)
  - [ERC20 Permit](#erc20-permit)
  - [ERC20 Votes](#erc20-votes)
  - [External Control List Management](#external-control-list-management)
  - [External KYC List Management](#external-kyc-list-management)
  - [External Pause Management](#external-pause-management)
  - [Factory](#factory)
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
  - [KYC](#kyc)
  - [Lock](#lock)
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
  - [Proceed Recipients](#proceed-recipients)
  - [Protected By Partition](#protected-by-partition)
  - [Protected Clearing By Partition](#protected-clearing-by-partition)
  - [Protected Clearing Hold By Partition](#protected-clearing-hold-by-partition)
  - [Protected Hold By Partition](#protected-hold-by-partition)
  - [Recovery](#recovery)
  - [Revocation List](#revocation-list)
  - [Scheduled Balance Adjustment](#scheduled-balance-adjustment)
  - [Security Holders](#security-holders)
  - [Security Holders At Snapshot](#security-holders-at-snapshot)
  - [Snapshots](#snapshots)
  - [Snapshots By Partition](#snapshots-by-partition)
  - [SSI Management](#ssi-management)
  - [Static Function Selectors](#static-function-selectors)
  - [Transfer](#transfer)
  - [Transfer And Lock](#transfer-and-lock)
  - [Transfer And Lock By Partition](#transfer-and-lock-by-partition)
  - [Transfer By Partition](#transfer-by-partition)
  - [Votes](#votes)
  - [Voting](#voting)
  - [Voting Security Holders](#voting-security-holders)
  - [Compliance](#compliance)
  - [External Control List](#external-control-list)
  - [External KYC List](#external-kyc-list)
  - [External Pause](#external-pause)
  - [Identity Registry](#identity-registry)
  - [Operator Clearing Hold By Partition](#operator-clearing-hold-by-partition)
  - [Protected Partitions](#protected-partitions)
  - [Amortization](#amortization)
  - [Bond Read](#bond-read)
  - [Equity](#equity)
  - [Fixed Rate](#fixed-rate)
  - [KPI Linked Rate](#kpi-linked-rate)
  - [KPIs](#kpis)
  - [Loan](#loan)
  - [Loans Portfolio](#loans-portfolio)
  - [Nominal Value](#nominal-value)
  - [Scheduled Cross Ordered Tasks](#scheduled-cross-ordered-tasks)
  - [Security](#security)
  - [Bond USA](#bond-usa)
  - [Equity USA](#equity-usa)
- [Events](#events)
- [Errors](#errors)
- [Roles](#roles)

## Methods

<!-- core / supporting facets -->

### Access Control

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

### Adjust Balances

- Interface: `contracts/facets/adjustBalances/IAdjustBalances.sol`
- Resolver key: `BalanceAdjustments`

```solidity
function initializeBalanceAdjustments() external;
function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;
```

### Allowance

- Interface: `contracts/facets/allowance/IAllowance.sol`
- Resolver key: `Allowance`

```solidity
function initializeAllowance() external;
function approve(address spender, uint256 value) external returns (bool);
function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);
```

### Balance Tracker

- Interface: `contracts/facets/balanceTracker/IBalanceTracker.sol`
- Resolver key: `BalanceTracker`

```solidity
function initializeBalanceTracker() external;
function balanceOf(address _tokenHolder) external view returns (uint256);
function totalSupply() external view returns (uint256);
function getTotalBalanceFor(address _account) external view returns (uint256);
```

### Balance Tracker Adjusted

- Interface: `contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol`
- Resolver key: `BalanceTrackerAdjusted`

```solidity
function initializeBalanceTrackerAdjusted() external;
function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256);
```

### Balance Tracker At Snapshot

- Interface: `contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol`
- Resolver key: `BalanceTrackerAtSnapshot`

```solidity
function initializeBalanceTrackerAtSnapshot() external;
function balanceOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (uint256 balance_);
function balancesOfAtSnapshot(
    uint256 _snapshotID,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (HolderBalance[] memory balances_);
function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_);
```

#### Types

```solidity
// declared in contracts/facets/snapshot/ISnapshots.sol
struct HolderBalance {
    address holder;
    uint256 balance;
}
```

### Balance Tracker At Snapshot By Partition

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

### Balance Tracker By Partition

- Interface: `contracts/facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol`
- Resolver key: `BalanceTrackerByPartition`

```solidity
function initializeBalanceTrackerByPartition() external;
function balanceOfByPartition(
    bytes32 _partition,
    address _tokenHolder
) external view returns (uint256);
function totalSupplyByPartition(bytes32 _partition) external view returns (uint256);
function getTotalBalanceForByPartition(
    bytes32 _partition,
    address _account
) external view returns (uint256);
```

### Batch Burn

- Interface: `contracts/facets/batchBurn/IBatchBurn.sol`
- Resolver key: `BatchBurn`

```solidity
function initializeBatchBurn() external;
function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
```

### Batch Controller

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

### Batch Freeze

- Interface: `contracts/facets/batchFreeze/IBatchFreeze.sol`
- Resolver key: `BatchFreeze`

```solidity
function initializeBatchFreeze() external;
function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external;
function batchFreezePartialTokens(
    address[] calldata _userAddresses,
    uint256[] calldata _amounts
) external;
function batchUnfreezePartialTokens(
    address[] calldata _userAddresses,
    uint256[] calldata _amounts
) external;
```

### Batch Mint

- Interface: `contracts/facets/batchMint/IBatchMint.sol`
- Resolver key: `BatchMint`

```solidity
function initializeBatchMint() external;
function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;
```

### Batch Transfer

- Interface: `contracts/facets/batchTransfer/IBatchTransfer.sol`
- Resolver key: `BatchTransfer`

```solidity
function initializeBatchTransfer() external;
function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
```

### Burn

- Interface: `contracts/facets/burn/IBurn.sol`
- Resolver key: `Burn`

```solidity
function initializeBurn() external;
function burn(address _userAddress, uint256 _amount) external;
function redeem(uint256 _value, bytes calldata _data) external;
function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
```

### Burn By Partition

- Interface: `contracts/facets/burnByPartition/IBurnByPartition.sol`
- Resolver key: `BurnByPartition`

```solidity
function initializeBurnByPartition() external;
function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;
```

### Business Logic Resolver

- Interface: `contracts/infrastructure/diamond/IBusinessLogicResolver.sol`

```solidity
function initializeBusinessLogicResolver() external returns (bool success_);
function registerBusinessLogics(BusinessLogicRegistryData[] calldata _businessLogics) external;
function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;
function removeSelectorsFromBlacklist(
    bytes32 _configurationId,
    bytes4[] calldata _selectors
) external;
function getVersionStatus(
    bytes32 _businessLogicKey,
    uint256 _version
) external view returns (VersionStatus status_);
function getLatestVersion(bytes32 _businessLogicKey) external view returns (uint256 latestVersion_);
function getLatestVersions(
    bytes32[] calldata _businessLogicKeys
) external view returns (uint256[] memory latestVersions_);
function resolveLatestBusinessLogic(
    bytes32 _businessLogicKey
) external view returns (address businessLogicAddress_);
function resolveBusinessLogicByVersion(
    bytes32 _businessLogicKey,
    uint256 _version
) external view returns (address businessLogicAddress_);
function getBusinessLogicCount() external view returns (uint256 businessLogicCount_);
function getBusinessLogicKeys(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory businessLogicKeys_);
function getSelectorsBlacklist(
    bytes32 _configurationId,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes4[] memory selectors_);
```

#### Types

```solidity
// declared in contracts/infrastructure/diamond/IBusinessLogicResolver.sol
struct BusinessLogicRegistryData {
    bytes32 businessLogicKey;
    address businessLogicAddress;
}

// declared in contracts/infrastructure/diamond/IBusinessLogicResolver.sol
enum VersionStatus {
    NONE,
    ACTIVATED,
    DEACTIVATED
}
```

### Cap

- Interface: `contracts/facets/cap/ICap.sol`
- Resolver key: `Cap`

```solidity
function initializeCap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external;
function setMaxSupply(uint256 _maxSupply) external returns (bool success_);
function getMaxSupply() external view returns (uint256 maxSupply_);
```

#### Types

```solidity
// declared in contracts/facets/cap/ICap.sol
struct PartitionCap {
    bytes32 partition;
    uint256 maxSupply;
}
```

### Cap By Partition

- Interface: `contracts/facets/capByPartition/ICapByPartition.sol`
- Resolver key: `CapByPartition`

```solidity
function initializeCapByPartition() external;
function setMaxSupplyByPartition(
    bytes32 _partition,
    uint256 _maxSupply
) external returns (bool success_);
function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_);
```

### Clearing

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

#### Types

```solidity
// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
enum ClearingOperationType {
    Transfer,
    Redeem,
    HoldCreation
}
```

### Clearing At Snapshot

- Interface: `contracts/facets/clearingAtSnapshot/IClearingAtSnapshot.sol`
- Resolver key: `ClearingAtSnapshot`

```solidity
function initializeClearingAtSnapshot() external;
function clearedBalanceOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (uint256 balance_);
```

### Clearing At Snapshot By Partition

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

### Clearing By Partition

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

#### Types

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

### Clearing Hold By Partition

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

#### Types

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

### Compliance By Partition

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

### Compliance Facet

- Interface: `contracts/facets/compliance/IComplianceFacet.sol`
- Resolver key: `Compliance`

```solidity
function initializeCompliance(address _compliance) external;
function setCompliance(address _compliance) external;
function canTransfer(
    address _to,
    uint256 _value,
    bytes calldata _data
) external view returns (bool, bytes1, bytes32);
function canTransferFrom(
    address _from,
    address _to,
    uint256 _value,
    bytes calldata _data
) external view returns (bool, bytes1, bytes32);
function compliance() external view returns (ICompliance);
```

### Control List

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

### Controller

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

### Controller By Partition

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

### Controller Hold By Partition

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

#### Types

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

### Core

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

#### Types

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
    /// @notice An equity instrument (shares).
    Equity,
    /// @notice A bond whose coupon rate floats against an external index.
    BondVariableRate,
    /// @notice A bond with a fixed coupon rate.
    BondFixedRate,
    /// @notice A bond whose coupon is tied to KPI performance metrics.
    BondKpiLinkedRate,
    /// @notice A loan instrument.
    Loan,
    DepositToken
}
```

### Core Adjusted

- Interface: `contracts/facets/coreAdjusted/ICoreAdjusted.sol`
- Resolver key: `CoreAdjusted`

```solidity
function initializeCoreAdjusted() external;
function decimalsAt(uint256 _timestamp) external view returns (uint8);
```

### Core At Snapshot

- Interface: `contracts/facets/coreAtSnapshot/ICoreAtSnapshot.sol`
- Resolver key: `CoreAtSnapshot`

```solidity
function initializeCoreAtSnapshot() external;
function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);
```

### Corporate Actions

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
) external view returns (bytes32[] memory actionTypes_, uint256[] memory actionIdByType_, bytes[] memory datas_, bool[] memory isDisabled_);
function getCorporateActionCountByType(
    bytes32 _actionType
) external view returns (uint256 corporateActionCount_);
function getCorporateActionIdsByType(
    bytes32 _actionType,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory corporateActionIds_);
function getCorporateActionsByType(
    bytes32 _actionType,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory actionTypes_, uint256[] memory actionIdByType_, bytes[] memory datas_, bool[] memory isDisabled_);
function actionContentHashExists(bytes32 _contentHash) external view returns (bool);
```

### Coupon

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
function getCouponFor(
    uint256 _couponID,
    address _account
) external view returns (CouponFor memory couponFor_);
function getCouponAmountFor(
    uint256 _couponID,
    address _account
) external view returns (CouponAmountFor memory couponAmountFor_);
function getCouponCount() external view returns (uint256 couponCount_);
```

#### Types

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

### Coupon Listing

- Interface: `contracts/facets/couponListing/ICouponListing.sol`
- Resolver key: `CouponListing`

```solidity
function initializeCouponListing() external;
function getCouponFromOrderedListAt(
    uint256 _pos,
    bool _includeDisabled
) external view returns (uint256 couponID_);
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

#### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}
```

### Coupon Security Holders

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

#### Types

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

### Custom Data

- Interface: `contracts/facets/customData/ICustomData.sol`
- Resolver key: `CustomData`

```solidity
function initializeCustomData() external;
function setCustomData(bytes32 _key, bytes[] calldata _value) external;
function getCustomData(bytes32 _key) external view returns (bytes[] memory value_);
```

### Deactivate

- Interface: `contracts/facets/deactivate/IDeactivate.sol`
- Resolver key: `Deactivate`

```solidity
function initializeDeactivate() external;
function deactivate() external;
function isDeactivated() external view returns (bool);
```

### Diamond Cut

- Interface: `contracts/infrastructure/proxy/IDiamondCut.sol`

```solidity
function updateConfigVersion(uint256 _newVersion) external;
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external;
function updateResolver(
    IBusinessLogicResolver _newResolver,
    bytes32 _newConfigurationId,
    uint256 _newVersion
) external;
function getConfigInfo(
) external view returns (address resolver_, bytes32 configurationId_, uint256 version_);
```

### Diamond Cut Manager

- Interface: `contracts/infrastructure/diamond/IDiamondCutManager.sol`

```solidity
function createConfiguration(
    bytes32 _configurationId,
    FacetConfiguration[] calldata _facetConfigurations
) external;
function createBatchConfiguration(
    bytes32 _configurationId,
    FacetConfiguration[] calldata _facetConfigurations,
    bool _isLastBatch
) external;
function cancelBatchConfiguration(bytes32 _configurationId) external;
function checkResolverProxyConfigurationRegistered(
    bytes32 _configurationId,
    uint256 _version
) external;
function resolveResolverProxyCall(
    bytes32 _configurationId,
    uint256 _version,
    bytes4 _selector
) external view returns (address facetAddress_);
function resolveSupportsInterface(
    bytes32 _configurationId,
    uint256 _version,
    bytes4 _interfaceId
) external view returns (bool exists_);
function isResolverProxyConfigurationRegistered(
    bytes32 _configurationId,
    uint256 _version
) external view returns (bool);
function getConfigurationsLength() external view returns (uint256 configurationsLength_);
function getConfigurations(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory configurationIds_);
function getLatestVersionByConfiguration(
    bytes32 _configurationId
) external view returns (uint256 latestVersion_);
function getFacetsLengthByConfigurationIdAndVersion(
    bytes32 _configurationId,
    uint256 _version
) external view returns (uint256 facetsLength_);
function getFacetsByConfigurationIdAndVersion(
    bytes32 _configurationId,
    uint256 _version,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (IDiamondLoupe.Facet[] memory facets_);
function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
    bytes32 _configurationId,
    uint256 _version,
    bytes32 _facetId
) external view returns (uint256 facetSelectorsLength_);
function getFacetSelectorsByConfigurationIdVersionAndFacetId(
    bytes32 _configurationId,
    uint256 _version,
    bytes32 _facetId,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes4[] memory facetSelectors_);
function getFacetIdsByConfigurationIdAndVersion(
    bytes32 _configurationId,
    uint256 _version,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory facetIds_);
function getFacetConfigurationsByConfigurationIdAndVersion(
    bytes32 _configurationId,
    uint256 _version,
    uint256 _start,
    uint256 _end
) external view returns (FacetConfiguration[] memory facetConfigurations_);
function getFacetAddressesByConfigurationIdAndVersion(
    bytes32 _configurationId,
    uint256 _version,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory facetAddresses_);
function getFacetIdByConfigurationIdVersionAndSelector(
    bytes32 _configurationId,
    uint256 _version,
    bytes4 _selector
) external view returns (bytes32 facetId_);
function getFacetByConfigurationIdVersionAndFacetId(
    bytes32 _configurationId,
    uint256 _version,
    bytes32 _facetId
) external view returns (IDiamondLoupe.Facet memory facet_);
function getFacetAddressByConfigurationIdVersionAndFacetId(
    bytes32 _configurationId,
    uint256 _version,
    bytes32 _facetId
) external view returns (address facetAddress_);
function getFacetVersionByConfigurationIdVersionAndFacetId(
    bytes32 _configurationId,
    uint256 _version,
    bytes32 _facetId
) external view returns (uint256 facetVersion_);
```

#### Types

```solidity
// declared in contracts/infrastructure/diamond/IDiamondCutManager.sol
struct FacetConfiguration {
    bytes32 id;
    uint256 version;
}

// declared in contracts/infrastructure/proxy/IDiamondLoupe.sol
struct Facet {
    bytes32 id;
    address addr;
    bytes4[] selectors;
    bytes4[] interfaceIds;
}
```

### Diamond Facet

- Interface: `contracts/infrastructure/diamond/IDiamondFacet.sol`

```solidity
function initializeDiamondCut() external;
```

### Diamond Loupe

- Interface: `contracts/infrastructure/proxy/IDiamondLoupe.sol`

```solidity
function getFacets() external view returns (Facet[] memory facets_);
function getFacetsLength() external view returns (uint256 facetsLength_);
function getFacetsByPage(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (Facet[] memory facets_);
function getFacetSelectors(
    bytes32 _facetId
) external view returns (bytes4[] memory facetSelectors_);
function getFacetSelectorsLength(
    bytes32 _facetId
) external view returns (uint256 facetSelectorsLength_);
function getFacetSelectorsByPage(
    bytes32 _facetId,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes4[] memory facetSelectors_);
function getFacetIds() external view returns (bytes32[] memory facetIds_);
function getFacetIdsByPage(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (bytes32[] memory facetIds_);
function getFacetAddresses() external view returns (address[] memory facetAddresses_);
function getFacetAddressesByPage(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory facetAddresses_);
function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_);
function getFacet(bytes32 _facetId) external view returns (Facet memory facet_);
function getFacetAddress(bytes4 _selector) external view returns (address facetAddress_);
```

#### Types

```solidity
// declared in contracts/infrastructure/proxy/IDiamondLoupe.sol
struct Facet {
    bytes32 id;
    address addr;
    bytes4[] selectors;
    bytes4[] interfaceIds;
}
```

### Dividend

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
function getDividendFor(
    uint256 dividendId,
    address account
) external view returns (DividendFor memory dividendFor_);
function getDividendAmountFor(
    uint256 dividendId,
    address account
) external view returns (DividendAmountFor memory dividendAmountFor_);
function getDividendsCount() external view returns (uint256 dividendCount_);
```

#### Types

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

### Dividend Security Holders

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

### Documentation

- Interface: `contracts/facets/documentation/IDocumentation.sol`
- Resolver key: `Documentation`

```solidity
function initializeDocumentation() external;
function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;
function removeDocument(bytes32 _name) external;
function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256);
function getAllDocuments() external view returns (bytes32[] memory);
```

### EIP712

- Interface: `contracts/facets/eip712/IEIP712.sol`
- Resolver key: `Eip712`

```solidity
function initializeEIP712() external;
function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_);
```

### ERC20 Permit

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

### ERC20 Votes

- Interface: `contracts/facets/erc20Votes/IERC20Votes.sol`
- Resolver key: `Erc20votes`

```solidity
function initializeERC20Votes(bool _activated) external;
function isActivated() external view returns (bool);
function checkpoints(
    address _account,
    uint256 _pos
) external view returns (Checkpoints.Checkpoint memory);
function numCheckpoints(address _account) external view returns (uint256);
```

#### Types

```solidity
// declared in contracts/infrastructure/utils/Checkpoints.sol
struct Checkpoint {
    uint256 from;
    uint256 value;
}
```

### External Control List Management

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

### External KYC List Management

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
function isExternallyGranted(
    address _account,
    IKyc.KycStatus _kycStatus
) external view returns (bool);
function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_);
function getExternalKycListsMembers(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory members_);
```

#### Types

```solidity
// declared in contracts/facets/kyc/IKyc.sol
enum KycStatus {
    NOT_GRANTED,
    GRANTED
}
```

### External Pause Management

- Interface: `contracts/facets/externalPauseManagement/IExternalPauseManagement.sol`
- Resolver key: `ExternalPause`

```solidity
function initializeExternalPauses(address[] calldata _pauses) external;
function updateExternalPauses(
    address[] calldata _pauses,
    bool[] calldata _actives
) external returns (bool success_);
function addExternalPause(address _pause) external returns (bool success_);
function removeExternalPause(address _pause) external returns (bool success_);
function isExternalPause(address _pause) external view returns (bool);
function getExternalPausesCount() external view returns (uint256 externalPausesCount_);
function getExternalPausesMembers(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory members_);
```

### Factory

- Interface: `contracts/factory/IFactory.sol`
- Resolver key: `Factory`

```solidity
function deployProxy(
    IBusinessLogicResolver _resolver,
    bytes32 _configKey,
    uint256 _version,
    IResolverProxy.Rbac[] memory _rbacs
) external returns (address proxyAddress_);
function deployEquity(
    EquityData calldata _equityData,
    FactoryRegulationData calldata _factoryRegulationData
) external returns (address equityAddress_);
function deployBond(
    BondData calldata _bondData,
    FactoryRegulationData calldata _factoryRegulationData
) external returns (address bondAddress_);
function deployDepositToken(
    DepositTokenData calldata _depositTokenData,
    FactoryRegulationData calldata _factoryRegulationData
) external returns (address depositTokenAddress_);
function getAppliedRegulationData(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) external pure returns (RegulationData memory regulationData_);
```

#### Types

```solidity
// declared in contracts/infrastructure/proxy/IResolverProxy.sol
struct Rbac {
    bytes32 role;
    address[] members;
}

// declared in contracts/factory/IFactory.sol
struct EquityData {
    SecurityData security;
    IEquity.EquityDetailsData equityDetails;
}

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
struct FactoryRegulationData {
    RegulationType regulationType;
    RegulationSubType regulationSubType;
    AdditionalSecurityData additionalSecurityData;
}

// declared in contracts/factory/IFactory.sol
struct BondData {
    SecurityData security;
    IBondRead.BondDetailsData bondDetails;
    address[] proceedRecipients;
    bytes[] proceedRecipientsData;
}

// declared in contracts/factory/IFactory.sol
struct DepositTokenData {
    SecurityData security;
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

// declared in contracts/factory/IFactory.sol
struct SecurityData {
    IBusinessLogicResolver resolver;
    uint256 maxSupply;
    ResolverProxyConfiguration resolverProxyConfiguration;
    ICore.ERC20MetadataInfo erc20MetadataInfo;
    IResolverProxy.Rbac[] rbacs;
    address[] externalPauses;
    address[] externalControlLists;
    address[] externalKycLists;
    address compliance;
    address identityRegistry;
    bool arePartitionsProtected;
    bool isMultiPartition;
    bool isControllable;
    bool isWhiteList;
    bool clearingActive;
    bool internalKycActivated;
    bool erc20VotesActivated;
}

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

// declared in contracts/factory/ERC3643/interfaces/regulation.sol
struct AdditionalSecurityData {
    bool countriesControlListType;
    string listOfCountries;
    string info;
}

// declared in contracts/factory/ERC3643/interfaces/IBondTypes.sol
struct BondDetailsData {
    bytes3 currency;
    uint256 nominalValue;
    uint8 nominalValueDecimals;
    uint256 startingDate;
    uint256 maturityDate;
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

// declared in contracts/factory/IFactory.sol
struct ResolverProxyConfiguration {
    bytes32 key;
    uint256 version;
}

// declared in contracts/factory/ERC3643/interfaces/ICore.sol
struct ERC20MetadataInfo {
    string name;
    string symbol;
    string isin;
    uint8 decimals;
}

// declared in contracts/factory/ERC3643/interfaces/IEquity.sol
enum DividendType {
    NONE,
    PREFERRED,
    COMMON
}
```

### Freeze

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

### Freeze At Snapshot

- Interface: `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`
- Resolver key: `FreezeAtSnapshot`

```solidity
function initializeFreezeAtSnapshot() external;
function frozenBalanceOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (uint256 balance_);
```

### Freeze At Snapshot By Partition

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

### Hold At Snapshot

- Interface: `contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol`
- Resolver key: `HoldAtSnapshot`

```solidity
function initializeHoldAtSnapshot() external;
function heldBalanceOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (uint256 balance_);
```

### Hold At Snapshot By Partition

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

### Hold By Partition

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
function reclaimHoldByPartition(
    IHoldTypes.HoldIdentifier calldata _holdIdentifier
) external returns (bool success_);
function getHeldAmountForByPartition(
    bytes32 _partition,
    address _tokenHolder
) external view returns (uint256 amount_);
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
) external view returns (uint256 amount_, uint256 expirationTimestamp_, address escrow_, address destination_, bytes memory data_, bytes memory operatorData_, ThirdPartyType thirdPartyType_);
```

#### Types

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

### Hold Facet

- Interface: `contracts/facets/hold/IHoldFacet.sol`
- Resolver key: `Hold`

```solidity
function initializeHold() external;
function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);
function getHoldThirdParty(
    IHoldTypes.HoldIdentifier calldata _holdIdentifier
) external view returns (address thirdParty_);
```

#### Types

```solidity
// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
struct HoldIdentifier {
    bytes32 partition;
    address tokenHolder;
    uint256 holdId;
}
```

### Identity

- Interface: `contracts/facets/identity/IIdentity.sol`
- Resolver key: `Identity`

```solidity
function initializeIdentity(address _identityRegistry) external;
function setOnchainID(address _onchainID) external;
function setIdentityRegistry(address _identityRegistry) external;
function identityRegistry() external view returns (IIdentityRegistry);
function onchainID() external view returns (address);
```

### Initializer

- Interface: `contracts/facets/initializer/IInitializer.sol`
- Resolver key: `Initializer`

```solidity
function initializeInitializer(uint256 _maxInitializerFacetIndex) external;
function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external;
function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);
function getOperationalStatus(
    bytes32 _configId,
    uint256 _versionId
) external view returns (uint256 status_);
function getFacetVersionStatus(
    bytes32 _facetId,
    uint256 _versionId
) external view returns (uint256 status_);
function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_);
```

### Interest Rate

- Interface: `contracts/facets/interestRate/IInterestRate.sol`
- Resolver key: `InterestRate`

```solidity
function initializeInterestRateType(RateType rateType) external;
function setCouponRateType(RateType rateType) external;
function getCouponRateType() external view returns (RateType);
```

#### Types

```solidity
// declared in contracts/facets/interestRate/IInterestRate.sol
enum RateType {
    NONE,
    STANDARD,
    FIXED,
    KPI_LINKED
}
```

### KYC

- Interface: `contracts/facets/kyc/IKyc.sol`
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
function getKycAccountsCount(
    KycStatus _kycStatus
) external view returns (uint256 kycAccountsCount_);
function isInternalKycActivated() external view returns (bool);
function getKycAccountsData(
    KycStatus _kycStatus,
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory accounts_, KycData[] memory kycData_);
```

#### Types

```solidity
// declared in contracts/facets/kyc/IKyc.sol
enum KycStatus {
    NOT_GRANTED,
    GRANTED
}

// declared in contracts/facets/kyc/IKyc.sol
struct KycData {
    uint256 validFrom;
    uint256 validTo;
    string vcId;
    address issuer;
    KycStatus status;
}
```

### Lock

- Interface: `contracts/facets/lock/ILock.sol`
- Resolver key: `Lock`

```solidity
function initializeLock() external;
function lock(
    uint256 _amount,
    address _tokenHolder,
    uint256 _expirationTimestamp
) external returns (uint256 lockId_);
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

### Lock At Snapshot

- Interface: `contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol`
- Resolver key: `LockAtSnapshot`

```solidity
function initializeLockAtSnapshot() external;
function lockedBalanceOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (uint256 balance_);
```

### Lock At Snapshot By Partition

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

### Lock By Partition

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
function releaseByPartition(
    bytes32 _partition,
    uint256 _lockId,
    address _tokenHolder
) external returns (bool success_);
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

### Maturity

- Interface: `contracts/facets/maturity/IMaturity.sol`
- Resolver key: `Maturity`

```solidity
function initializeMaturity() external;
function fullRedeemAtMaturity(address _tokenHolder) external;
function updateMaturityDate(uint256 _newMaturityDate) external returns (bool success_);
```

### Maturity By Partition

- Interface: `contracts/facets/maturityByPartition/IMaturityByPartition.sol`
- Resolver key: `MaturityByPartition`

```solidity
function initializeMaturityByPartition() external;
function redeemAtMaturityByPartition(
    address _tokenHolder,
    bytes32 _partition,
    uint256 _amount
) external;
```

### Mint

- Interface: `contracts/facets/mint/IMint.sol`
- Resolver key: `Mint`

```solidity
function initializeERC1594() external;
function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;
function mint(address _to, uint256 _amount) external;
function isIssuable() external view returns (bool issuable_);
```

### Mint By Partition

- Interface: `contracts/facets/mintByPartition/IMintByPartition.sol`
- Resolver key: `MintByPartition`

```solidity
function initializeMintByPartition() external;
function issueByPartition(IERC1410Types.IssueData calldata _issueData) external;
```

#### Types

```solidity
// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
struct IssueData {
    bytes32 partition;
    address tokenHolder;
    uint256 value;
    bytes data;
}
```

### Nominal Value At Snapshot

- Interface: `contracts/facets/nominalValueAtSnapshot/INominalValueAtSnapshot.sol`
- Resolver key: `NominalValueAtSnapshot`

```solidity
function initializeNominalValueAtSnapshot() external;
function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_);
function nominalValueDecimalsAtSnapshot(
    uint256 _snapshotID
) external view returns (uint8 nominalValueDecimals_);
```

### Nonces

- Interface: `contracts/facets/nonces/INonces.sol`
- Resolver key: `Nonces`

```solidity
function initializeNonces() external;
function nonces(address owner) external view returns (uint256);
```

### Operator

- Interface: `contracts/facets/operator/IOperator.sol`
- Resolver key: `Operator`

```solidity
function initializeOperator() external;
function authorizeOperator(address _operator) external;
function revokeOperator(address _operator) external;
function isOperator(address _operator, address _tokenHolder) external view returns (bool);
```

### Operator By Partition

- Interface: `contracts/facets/operatorByPartition/IOperatorByPartition.sol`
- Resolver key: `OperatorByPartition`

```solidity
function initializeOperatorByPartition() external;
function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;
function revokeOperatorByPartition(bytes32 _partition, address _operator) external;
function operatorTransferByPartition(
    OperatorTransferData calldata _operatorTransferData
) external returns (bytes32);
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

#### Types

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

### Operator Clearing By Partition

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

#### Types

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

### Operator Hold By Partition

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

#### Types

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

### Partitions

- Interface: `contracts/facets/partitions/IPartitions.sol`
- Resolver key: `Partitions`

```solidity
function initializePartitions(bool _multiPartition) external;
function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);
function isMultiPartition() external view returns (bool);
```

### Pause

- Interface: `contracts/facets/pause/IPause.sol`
- Resolver key: `Pause`

```solidity
function initializePause() external;
function pause() external returns (bool success_);
function unpause() external returns (bool success_);
function paused() external view returns (bool);
```

### Principal

- Interface: `contracts/facets/principal/IPrincipal.sol`
- Resolver key: `Principal`

```solidity
function initializePrincipal() external;
function getPrincipalFor(
    address _account
) external view returns (PrincipalFor memory principalFor_);
```

#### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IBondTypes.sol
struct PrincipalFor {
    uint256 numerator;
    uint256 denominator;
}
```

### Proceed Recipients

- Interface: `contracts/facets/proceedRecipient/IProceedRecipients.sol`
- Resolver key: `ProceedRecipients`

```solidity
function initializeProceedRecipients(
    address[] calldata _proceedRecipients,
    bytes[] calldata _data
) external;
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

### Protected By Partition

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

#### Types

```solidity
// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
struct ProtectionData {
    uint256 deadline;
    uint256 nonce;
    bytes signature;
}
```

### Protected Clearing By Partition

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

#### Types

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

### Protected Clearing Hold By Partition

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

#### Types

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

### Protected Hold By Partition

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

#### Types

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

### Recovery

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

### Revocation List

- Interface: `contracts/facets/kyc/IRevocationList.sol`

```solidity
function revoked(address, string calldata) external view returns (bool);
```

### Scheduled Balance Adjustment

- Interface: `contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol`
- Resolver key: `ScheduledBalanceAdjustment`

```solidity
function initializeScheduledBalanceAdjustment() external;
function setScheduledBalanceAdjustment(
    ScheduledBalanceAdjustment calldata _newBalanceAdjustment
) external returns (uint256 balanceAdjustmentID_);
function cancelScheduledBalanceAdjustment(
    uint256 _balanceAdjustmentID
) external returns (bool success_);
function forceCancelScheduledBalanceAdjustment(
    uint256 _balanceAdjustmentID
) external returns (bool success_);
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

#### Types

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

### Security Holders

- Interface: `contracts/facets/securityHolders/ISecurityHolders.sol`
- Resolver key: `Securityholders`

```solidity
function initializeSecurityHolders() external;
function getSecurityHolders(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory holders);
function getTotalSecurityHolders() external view returns (uint256 count);
```

### Security Holders At Snapshot

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

### Snapshots

- Interface: `contracts/facets/snapshot/ISnapshots.sol`
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

#### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}
```

### Snapshots By Partition

- Interface: `contracts/facets/snapshotsByPartition/ISnapshotsByPartition.sol`
- Resolver key: `SnapshotsByPartition`

```solidity
function initializeSnapshotsByPartition() external;
function partitionsOfAtSnapshot(
    uint256 _snapshotID,
    address _tokenHolder
) external view returns (bytes32[] memory);
```

### SSI Management

- Interface: `contracts/facets/ssiManagement/ISsiManagement.sol`
- Resolver key: `SsiManagement`

```solidity
function initializeSsiManagement() external;
function setRevocationRegistryAddress(
    address _revocationRegistryAddress
) external returns (bool success_);
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

### Static Function Selectors

- Interface: `contracts/infrastructure/proxy/IStaticFunctionSelectors.sol`

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_);
function getStaticFunctionSelectors(
) external pure returns (bytes4[] memory staticFunctionSelectors_);
function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_);
```

### Transfer

- Interface: `contracts/facets/transfer/ITransfer.sol`
- Resolver key: `Transfer`

```solidity
function initializeTransfer() external;
function transfer(address to, uint256 amount) external returns (bool);
function transferFrom(address from, address to, uint256 amount) external returns (bool);
function transferWithData(address _to, uint256 _value, bytes calldata _data) external;
function transferFromWithData(
    address _from,
    address _to,
    uint256 _value,
    bytes calldata _data
) external;
```

### Transfer And Lock

- Interface: `contracts/facets/transferAndLock/ITransferAndLock.sol`

```solidity
function initializeTransferAndLock() external;
function transferAndLock(
    address _to,
    uint256 _amount,
    bytes calldata _data,
    uint256 _expirationTimestamp
) external returns (uint256 lockId_);
```

### Transfer And Lock By Partition

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

### Transfer By Partition

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

#### Types

```solidity
// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
struct BasicTransferInfo {
    address to;
    uint256 value;
}
```

### Votes

- Interface: `contracts/facets/erc20Votes/IVotes.sol`

```solidity
function delegate(address delegatee) external;
function getVotes(address account) external view returns (uint256);
function getPastVotes(address account, uint256 timepoint) external view returns (uint256);
function getPastTotalSupply(uint256 timepoint) external view returns (uint256);
function delegates(address account) external view returns (address);
```

### Voting

- Interface: `contracts/facets/voting/IVoting.sol`
- Resolver key: `Voting`

```solidity
function initializeVoting() external;
function setVoting(Voting calldata _newVoting) external returns (uint256 voteID_);
function cancelVoting(uint256 _voteId) external returns (bool success_);
function forceCancelVoting(uint256 _voteId) external returns (bool success_);
function getVoting(
    uint256 _voteID
) external view returns (RegisteredVoting memory registeredVoting_, bool isDisabled_);
function getVotingFor(
    uint256 _voteID,
    address _account
) external view returns (VotingFor memory votingFor_);
function getVotingCount() external view returns (uint256 votingCount_);
```

#### Types

```solidity
// declared in contracts/facets/voting/IVotingTypes.sol
struct Voting {
    uint256 recordDate;
    bytes data;
}

// declared in contracts/facets/voting/IVotingTypes.sol
struct RegisteredVoting {
    Voting voting;
    uint256 snapshotId;
}

// declared in contracts/facets/voting/IVotingTypes.sol
struct VotingFor {
    uint256 tokenBalance;
    uint256 recordDate;
    bytes data;
    uint8 decimals;
    bool recordDateReached;
    bool isDisabled;
}
```

### Voting Security Holders

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

### Compliance

- Interface: `contracts/facets/layer_1/ERC3643/ICompliance.sol`

```solidity
function transferred(address _from, address _to, uint256 _amount) external;
function created(address _to, uint256 _amount) external;
function destroyed(address _from, uint256 _amount) external;
function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
```

### External Control List

- Interface: `contracts/facets/layer_1/externalControlList/IExternalControlList.sol`

```solidity
function isAuthorized(address account) external view returns (bool);
```

### External KYC List

- Interface: `contracts/facets/layer_1/externalKycList/IExternalKycList.sol`

```solidity
function getKycStatus(address account) external view returns (IKyc.KycStatus);
```

#### Types

```solidity
// declared in contracts/facets/kyc/IKyc.sol
enum KycStatus {
    NOT_GRANTED,
    GRANTED
}
```

### External Pause

- Interface: `contracts/facets/layer_1/externalPause/IExternalPause.sol`

```solidity
function isPaused() external view returns (bool);
```

### Identity Registry

- Interface: `contracts/facets/layer_1/ERC3643/IIdentityRegistry.sol`

```solidity
function isVerified(address _userAddress) external view returns (bool);
```

### Operator Clearing Hold By Partition

- Interface: `contracts/facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol`
- Resolver key: `OperatorClearingHoldbypartition`

```solidity
function initializeOperatorClearingHoldByPartition() external;
function operatorClearingCreateHoldByPartition(
    IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
    IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 clearingId_);
```

#### Types

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

### Protected Partitions

- Interface: `contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol`
- Resolver key: `ProtectedPartitions`

```solidity
function initializeProtectedPartitions(
    bool _arePartitionsProtected
) external returns (bool success_);
function protectPartitions() external returns (bool success_);
function unprotectPartitions() external returns (bool success_);
function arePartitionsProtected() external view returns (bool);
function calculateRoleForPartition(
    bytes32 _partition
) external pure returns (bytes32 roleForPartition_);
```

<!-- layer_2 -->

### Amortization

- Interface: `contracts/facets/layer_2/amortization/IAmortization.sol`
- Resolver key: `Amortization`

```solidity
function initializeAmortization() external;
function setAmortization(
    Amortization calldata _amortization
) external returns (bool success_, uint256 amortizationID_);
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

#### Types

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

### Bond Read

- Interface: `contracts/facets/layer_2/bond/IBondRead.sol`

```solidity
function initializeBondUSARead() external;
function getBondDetails(
) external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);
```

#### Types

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

### Equity

- Interface: `contracts/facets/layer_2/equity/IEquity.sol`

```solidity
function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);
```

#### Types

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

### Fixed Rate

- Interface: `contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol`
- Resolver key: `FixedRate`

```solidity
function initializeFixedRate(FixedRateData calldata _initData) external;
function setRate(uint256 _newRate, uint8 _newRateDecimals) external;
function getRate() external view returns (uint256 rate_, uint8 decimals_);
```

#### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IFixedRate.sol
struct FixedRateData {
    uint256 rate;
    uint8 rateDecimals;
}
```

### KPI Linked Rate

- Interface: `contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol`
- Resolver key: `KpiLinkedRate`

```solidity
function initializeKpiLinkedRate(
    InterestRate calldata _interestRate,
    ImpactData calldata _impactData
) external;
function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;
function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;
function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);
function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
```

#### Types

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

### KPIs

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

### Loan

- Interface: `contracts/facets/layer_2/loan/ILoan.sol`
- Resolver key: `Loan`

```solidity
function initializeLoan(LoanDetailsData calldata _loanDetailsData) external;
function setLoanDetails(LoanDetailsData calldata loanDetailsData_) external;
function getLoanDetails() external view returns (LoanDetailsData memory loanDetailsData_);
```

#### Types

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

### Loans Portfolio

- Interface: `contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol`
- Resolver key: `LoansPortfolio`

```solidity
function initializeLoansPortfolio(
    ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData
) external;
function addHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);
function removeHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);
function notifyLoanHoldingsAssetUpdate(
    address _holdingsAssetAddress
) external returns (bool success_);
function loansPortfolioWithdraw(
    address _assetAddress,
    address _to,
    uint256 _amount
) external returns (bool success_);
function getLoansPortfolioData(
) external view returns (LoansPortfolioDetailsData memory loansPortfolioData_);
function getHoldingsAssets(
    uint256 _pageIndex,
    uint256 _pageLength
) external view returns (address[] memory assets_);
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
function getNumberOfNonPerformingLoans(
) external view returns (uint256 numberOfNonPerformingLoans_);
function getNumberDefaultedLoans() external view returns (uint256 numberDefaultedLoans_);
function getSecuredLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getNonPerformingLoansRatio(
) external view returns (uint256 numerator_, uint256 denominator_);
function getDefaultedLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);
function getGeographicalExposure(
) external view returns (GeographicalExposureData[] memory geographicalExposure_);
```

#### Types

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

### Nominal Value

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

### Scheduled Cross Ordered Tasks

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

#### Types

```solidity
// declared in contracts/factory/ERC3643/interfaces/IScheduledTasksCommon.sol
struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}
```

### Security

- Interface: `contracts/facets/layer_2/security/ISecurity.sol`
- Resolver key: `Security`

```solidity
function initializeSecurity(
    RegulationData memory _regulationData,
    AdditionalSecurityData calldata _additionalSecurityData
) external;
function getSecurityRegulationData(
) external view returns (SecurityRegulationData memory securityRegulationData_);
```

#### Types

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

<!-- layer_3 -->

### Bond USA

- Interface: `contracts/facets/layer_3/bondUSA/IBondUSA.sol`
- Resolver key: `BondVariableRate`

```solidity
function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
```

#### Types

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

### Equity USA

- Interface: `contracts/facets/layer_3/equityUSA/IEquityUSA.sol`
- Resolver key: `Equity`

```solidity
function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
```

#### Types

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

## Events

```solidity
// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol
event AccessControlInitialized();

// declared in contracts/test/mocks/MockedExternalBlacklist.sol
event AddedToBlacklist(address indexed account);

// declared in contracts/facets/controlList/IControlList.sol
event AddedToControlList(address indexed operator, address indexed account);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
event AddedToExternalControlLists(address indexed operator, address controlList);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
event AddedToExternalKycLists(address indexed operator, address kycList);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
event AddedToExternalPauses(address indexed operator, address pause);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
event AddedToIssuerList(address indexed operator, address indexed issuer);

// declared in contracts/test/mocks/MockedExternalWhitelist.sol
event AddedToWhitelist(address indexed account);

// declared in contracts/facets/freeze/IFreeze.sol
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event AgentAdded(address indexed _agent);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event AgentRemoved(address indexed _agent);

// declared in contracts/facets/allowance/IAllowance.sol
event AllowanceInitialized();

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationCancelled(uint256 amortizationId, address indexed operator);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationForceCancelled(uint256 amortizationId, address indexed operator);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationHoldReleased(
    bytes32 indexed corporateActionId,
    uint256 indexed amortizationID,
    address indexed tokenHolder,
    uint256 holdId
);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationHoldSet(
    bytes32 indexed corporateActionId,
    uint256 indexed amortizationID,
    address indexed tokenHolder,
    uint256 holdId,
    uint256 tokenAmount
);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationInitialized();

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
event AmortizationSet(
    bytes32 corporateActionId,
    uint256 amortizationId,
    address indexed operator,
    uint256 recordDate,
    uint256 executionDate
);

// declared in contracts/facets/allowance/IAllowanceTypes.sol
event Approval(address indexed owner, address indexed spender, uint256 value);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event AuthorizedOperator(address indexed operator, address indexed tokenHolder);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event AuthorizedOperatorByPartition(
    bytes32 indexed partition,
    address indexed operator,
    address indexed tokenHolder
);

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
event BalanceAdjustmentsInitialized();

// declared in contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol
event BalanceTrackerAdjustedInitialized();

// declared in contracts/facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol
event BalanceTrackerAtSnapshotByPartitionInitialized();

// declared in contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol
event BalanceTrackerAtSnapshotInitialized();

// declared in contracts/facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol
event BalanceTrackerByPartitionInitialized();

// declared in contracts/facets/balanceTracker/IBalanceTracker.sol
event BalanceTrackerInitialized();

// declared in contracts/facets/batchBurn/IBatchBurn.sol
event BatchBurnInitialized();

// declared in contracts/facets/batchController/IBatchController.sol
event BatchControllerInitialized();

// declared in contracts/facets/batchFreeze/IBatchFreeze.sol
event BatchFreezeInitialized();

// declared in contracts/facets/batchMint/IBatchMint.sol
event BatchMintInitialized();

// declared in contracts/facets/batchTransfer/IBatchTransfer.sol
event BatchTransferInitialized();

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
event BondDeployed(
    address indexed deployer,
    address bondAddress,
    BondData bondData,
    FactoryRegulationData regulationData
);

// declared in contracts/test/mocks/MockFactory.sol
event BondFixedRateDeployed(
    address indexed deployer,
    address bondAddress,
    BondFixedRateData bondFixedRateData
);

// declared in contracts/test/mocks/MockFactory.sol
event BondKpiLinkedRateDeployed(
    address indexed deployer,
    address bondAddress,
    BondKpiLinkedRateData bondKpiLinkedRateData
);

// declared in contracts/facets/layer_3/bondUSA/IBondUSA.sol
event BondUSAInitialized(IBondTypes.BondDetailsData bondDetailsData);

// declared in contracts/facets/layer_2/bond/IBondRead.sol, contracts/factory/ERC3643/interfaces/IBondRead.sol
event BondUSAReadInitialized();

// declared in contracts/facets/burnByPartition/IBurnByPartition.sol
event BurnByPartitionInitialized();

// declared in contracts/facets/burn/IBurn.sol
event BurnInitialized();

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
event BusinessLogicResolverInitialized();

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
event BusinessLogicsRegistered(
    BusinessLogicRegistryData[] businessLogics,
    uint256[] newLatestVersions
);

// declared in contracts/facets/capByPartition/ICapByPartition.sol
event CapByPartitionInitialized();

// declared in contracts/facets/cap/ICap.sol
event CapInitialized(uint256 maxSupply, ICap.PartitionCap[] partitionCap);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedHoldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    IHoldTypes.Hold hold,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedHoldFromByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    IHoldTypes.Hold hold,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol
event ClearedOperatorHoldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    IHoldTypes.Hold hold,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedOperatorRedeemByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedOperatorTransferByPartition(
    address indexed operator,
    address indexed tokenHolder,
    address indexed to,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedRedeemByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedRedeemFromByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedTransferByPartition(
    address indexed operator,
    address indexed tokenHolder,
    address indexed to,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearedTransferFromByPartition(
    address indexed operator,
    address indexed tokenHolder,
    address indexed to,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearingActivated(address indexed operator);

// declared in contracts/facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol
event ClearingAtSnapshotByPartitionInitialized();

// declared in contracts/facets/clearingAtSnapshot/IClearingAtSnapshot.sol
event ClearingAtSnapshotInitialized();

// declared in contracts/facets/clearingByPartition/IClearingByPartition.sol
event ClearingByPartitionInitialized();

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearingDeactivated(address indexed operator);

// declared in contracts/facets/clearingHoldByPartition/IClearingHoldByPartition.sol
event ClearingHoldByPartitionInitialized();

// declared in contracts/facets/clearing/IClearing.sol
event ClearingInitialized(bool clearingActive);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearingOperationApproved(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 clearingId,
    ClearingOperationType clearingOperationType,
    bytes operationData
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearingOperationCanceled(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 clearingId,
    ClearingOperationType clearingOperationType
);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
event ClearingOperationReclaimed(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 clearingId,
    ClearingOperationType clearingOperationType
);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event ComplianceAdded(address indexed compliance);

// declared in contracts/test/mocks/MockComplianceModule.sol
event ComplianceBound(address indexed _compliance);

// declared in contracts/facets/complianceByPartition/IComplianceByPartition.sol
event ComplianceByPartitionInitialized();

// declared in contracts/facets/compliance/IComplianceFacet.sol
event ComplianceInitialized(address compliance);

// declared in contracts/test/mocks/MockComplianceModule.sol
event ComplianceUnbound(address indexed _compliance);

// declared in contracts/test/mocks/MockComplianceModule.sol
event ConfigSet(address indexed _compliance, uint256 value);

// declared in contracts/facets/controllerByPartition/IControllerByPartition.sol
event ControllerByPartitionInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event ControllerHeldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 holdId,
    Hold hold,
    bytes operatorData
);

// declared in contracts/facets/controllerHoldByPartition/IControllerHoldByPartition.sol
event ControllerHoldByPartitionInitialized();

// declared in contracts/facets/controller/IController.sol
event ControllerInitialized(bool controllable);

// declared in contracts/facets/controller/IController.sol
event ControllerRedemption(
    address _controller,
    address indexed _tokenHolder,
    uint256 _value,
    bytes _data,
    bytes _operatorData
);

// declared in contracts/facets/controller/IController.sol
event ControllerTransfer(
    address _controller,
    address indexed _from,
    address indexed _to,
    uint256 _value,
    bytes _data,
    bytes _operatorData
);

// declared in contracts/facets/controlList/IControlList.sol
event ControlListInitialized(bool isWhiteList);

// declared in contracts/facets/coreAdjusted/ICoreAdjusted.sol
event CoreAdjustedInitialized();

// declared in contracts/facets/coreAtSnapshot/ICoreAtSnapshot.sol
event CoreAtSnapshotInitialized();

// declared in contracts/facets/core/ICore.sol, contracts/factory/ERC3643/interfaces/ICore.sol
event CoreInitialized(ERC20Metadata metadata);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
event CorporateActionAdded(
    address indexed operator,
    bytes32 indexed actionType,
    bytes32 indexed corporateActionId,
    uint256 corporateActionIdByType,
    bytes data
);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
event CorporateActionCancelled(bytes32 indexed corporateActionId);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
event CorporateActionsInitialized();

// declared in contracts/facets/coupon/ICoupon.sol
event CouponCancelled(uint256 indexed couponId, address indexed operator);

// declared in contracts/facets/coupon/ICoupon.sol
event CouponForceCancelled(uint256 indexed couponId, address indexed operator);

// declared in contracts/facets/coupon/ICoupon.sol
event CouponInitialized();

// declared in contracts/facets/couponListing/ICouponListing.sol, contracts/factory/ERC3643/interfaces/ICouponListing.sol
event CouponListingInitialized();

// declared in contracts/facets/interestRate/IInterestRate.sol
event CouponRateTypeSet(address indexed operator, RateType rateType);

// declared in contracts/facets/couponSecurityHolders/ICouponSecurityHolders.sol
event CouponSecurityHoldersInitialized();

// declared in contracts/facets/coupon/ICoupon.sol
event CouponSet(
    bytes32 indexed corporateActionId,
    uint256 indexed couponId,
    address indexed operator,
    Coupon coupon
);

// declared in contracts/facets/customData/ICustomData.sol
event CustomDataInitialized();

// declared in contracts/facets/deactivate/IDeactivate.sol
event DeactivateInitialized();

// declared in contracts/facets/erc20Votes/IERC20Votes.sol
event DelegateChanged(
    address indexed delegator,
    address indexed fromDelegate,
    address indexed toDelegate
);

// declared in contracts/facets/erc20Votes/IERC20Votes.sol
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

// declared in contracts/factory/ERC3643/libraries/core/TREXBaseDeploymentLib.sol
event Deployed(address indexed _addr);

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
event DepositTokenDeployed(
    address indexed deployer,
    address depositTokenAddress,
    DepositTokenData depositTokenData,
    FactoryRegulationData regulationData
);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
event DiamondBatchConfigurationCanceled(bytes32 indexed configurationId, uint256 version);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
event DiamondBatchConfigurationCreated(
    bytes32 configurationId,
    FacetConfiguration[] facetConfigurations,
    bool _isLastBatch,
    uint256 version
);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
event DiamondConfigurationCreated(
    bytes32 configurationId,
    FacetConfiguration[] facetConfigurations,
    uint256 version
);

// declared in contracts/infrastructure/diamond/IDiamondFacet.sol
event DiamondCutInitialized();

// declared in contracts/facets/dividend/IDividend.sol
event DividendCancelled(uint256 dividendId, address indexed operator);

// declared in contracts/facets/dividend/IDividend.sol
event DividendForceCancelled(uint256 dividendId, address indexed operator);

// declared in contracts/facets/dividend/IDividend.sol
event DividendInitialized();

// declared in contracts/facets/dividendSecurityHolders/IDividendSecurityHolders.sol
event DividendSecurityHoldersInitialized();

// declared in contracts/facets/dividend/IDividend.sol
event DividendSet(
    bytes32 corporateActionId,
    uint256 dividendId,
    address indexed operator,
    uint256 indexed recordDate,
    uint256 indexed executionDate,
    uint256 amount,
    uint8 amountDecimals
);

// declared in contracts/facets/documentation/IDocumentation.sol
event DocumentationInitialized();

// declared in contracts/facets/documentation/IDocumentation.sol
event DocumentRemoved(bytes32 indexed name, string uri, bytes32 documentHash);

// declared in contracts/facets/documentation/IDocumentation.sol
event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash);

// declared in contracts/facets/eip712/IEIP712.sol
event EIP712Initialized();

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
event EquityDeployed(
    address indexed deployer,
    address equityAddress,
    EquityData equityData,
    FactoryRegulationData regulationData
);

// declared in contracts/facets/layer_3/equityUSA/IEquityUSA.sol
event EquityUSAInitialized(EquityDetailsData equityDetailsData);

// declared in contracts/facets/mint/IMint.sol
event ERC1594Initialized();

// declared in contracts/facets/erc20Permit/IERC20Permit.sol
event ERC20PermitInitialized();

// declared in contracts/facets/erc20Votes/IERC20Votes.sol
event ERC20VotesInitialized(bool activated);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
event ExternalControlListInitialized(address[] controlLists);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
event ExternalControlListsUpdated(address indexed operator, address[] controlLists, bool[] actives);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
event ExternalKycListInitialized(address[] kycLists);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
event ExternalPauseInitialized(address[] pauses);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
event ExternalPausesUpdated(address indexed operator, address[] pauses, bool[] actives);

// declared in contracts/facets/controller/IController.sol
event FinalizedControllerFeature(address operator);

// declared in contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol, contracts/factory/ERC3643/interfaces/IFixedRate.sol
event FixedRateInitialized(FixedRateData initData);

// declared in contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol
event FreezeAtSnapshotByPartitionInitialized();

// declared in contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol
event FreezeAtSnapshotInitialized();

// declared in contracts/facets/freeze/IFreeze.sol
event FreezeInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event HeldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 holdId,
    Hold hold,
    bytes operatorData
);

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event HeldFromByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 holdId,
    Hold hold,
    bytes operatorData
);

// declared in contracts/facets/holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol
event HoldAtSnapshotByPartitionInitialized();

// declared in contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol
event HoldAtSnapshotInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event HoldByPartitionExecuted(
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 holdId,
    uint256 amount,
    address to
);

// declared in contracts/facets/holdByPartition/IHoldByPartition.sol
event HoldByPartitionInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event HoldByPartitionReclaimed(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 holdId,
    uint256 amount
);

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event HoldByPartitionReleased(
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 holdId,
    uint256 amount
);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
event HoldingsAssetAdded(HoldingsAsset holdingsAsset);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
event HoldingsAssetRemoved(HoldingsAsset holdingsAsset);

// declared in contracts/facets/hold/IHoldFacet.sol
event HoldInitialized();

// declared in contracts/facets/identity/IIdentity.sol
event IdentityInitialized(address identityRegistry);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event IdentityRegistryAdded(address indexed identityRegistry);

// declared in contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol, contracts/factory/ERC3643/interfaces/IKpiLinkedRate.sol
event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

// declared in contracts/facets/initializer/IInitializer.sol
event InitializerInitialized(uint256 maxInitializerFacetIndex);

// declared in contracts/facets/interestRate/IInterestRate.sol
event InterestRateTypeInitialized(RateType rateType);

// declared in contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol, contracts/factory/ERC3643/interfaces/IKpiLinkedRate.sol
event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);

// declared in contracts/facets/kyc/IKyc.sol
event InternalKycStatusUpdated(address indexed operator, bool activated);

// declared in contracts/facets/mint/IMint.sol
event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event IssuedByPartition(
    bytes32 indexed partition,
    address indexed operator,
    address indexed to,
    uint256 value,
    bytes data
);

// declared in contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol
event KpiDataAdded(address indexed project, uint256 date, uint256 value);

// declared in contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol, contracts/factory/ERC3643/interfaces/IKpiLinkedRate.sol
event KpiLinkedRateInitialized(InterestRate interestRate, ImpactData impactData);

// declared in contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol
event KpisInitialized();

// declared in contracts/facets/kyc/IKyc.sol
event KycGranted(address indexed account, address indexed issuer);

// declared in contracts/test/mocks/MockedExternalKycList.sol
event KycGranted(address indexed account);

// declared in contracts/facets/kyc/IKyc.sol
event KycInitialized(bool internalKycActivated);

// declared in contracts/facets/kyc/IKyc.sol
event KycRevoked(address indexed account, address indexed issuer);

// declared in contracts/test/mocks/MockedExternalKycList.sol
event KycRevoked(address indexed account);

// declared in contracts/facets/layer_2/loan/ILoan.sol
event LoanDetailsSet(LoanDetailsData loanDetails);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
event LoanHoldingsAssetUpdated(address loanHoldingsAsset);

// declared in contracts/facets/layer_2/loan/ILoan.sol
event LoanInitialized(LoanDetailsData loanDetailsData);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
event LoansPortfolioInitialized(LoansPortfolioDetailsData loansPortfolioData);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
event LoansPortfolioWithdrawn(address assetAddress, address to, uint256 amount);

// declared in contracts/facets/lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol
event LockAtSnapshotByPartitionInitialized();

// declared in contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol
event LockAtSnapshotInitialized();

// declared in contracts/facets/lockByPartition/ILockByPartition.sol
event LockByPartitionInitialized();

// declared in contracts/facets/lock/ILockTypes.sol
event LockByPartitionReleased(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 lockId
);

// declared in contracts/facets/lock/ILockTypes.sol
event LockedByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 lockId,
    uint256 amount,
    uint256 expirationTimestamp
);

// declared in contracts/facets/lock/ILockTypes.sol
event LockExpirationUpdated(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 indexed partition,
    uint256 lockId,
    uint256 oldExpirationTimestamp,
    uint256 newExpirationTimestamp
);

// declared in contracts/facets/lock/ILock.sol
event LockInitialized();

// declared in contracts/facets/maturityByPartition/IMaturityByPartition.sol
event MaturityByPartitionInitialized();

// declared in contracts/facets/layer_2/bond/IBondTypes.sol, contracts/factory/ERC3643/interfaces/IBondTypes.sol
event MaturityDateUpdated(
    address indexed bondId,
    uint256 indexed maturityDate,
    uint256 indexed previousMaturityDate
);

// declared in contracts/facets/maturity/IMaturity.sol
event MaturityInitialized();

// declared in contracts/facets/initializer/IInitializer.sol
event MaxInitializerFacetIndexUpdated(address sender, uint256 newMaxInitializerFacetIndex);

// declared in contracts/facets/cap/ICap.sol
event MaxSupplyByPartitionSet(
    address indexed operator,
    bytes32 indexed partition,
    uint256 newMaxSupply,
    uint256 previousMaxSupply
);

// declared in contracts/facets/cap/ICap.sol
event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);

// declared in contracts/facets/mintByPartition/IMintByPartition.sol
event MintByPartitionInitialized();

// declared in contracts/facets/nominalValueAtSnapshot/INominalValueAtSnapshot.sol
event NominalValueAtSnapshotInitialized();

// declared in contracts/facets/layer_2/nominalValue/INominalValue.sol
event NominalValueCurrencySet(address indexed operator, bytes3 nominalValueCurrency);

// declared in contracts/facets/layer_2/nominalValue/INominalValue.sol
event NominalValueInitialized(
    uint256 nominalValue,
    uint8 nominalValueDecimals,
    bytes3 nominalValueCurrency
);

// declared in contracts/facets/layer_2/nominalValue/INominalValue.sol
event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals);

// declared in contracts/facets/nonces/INonces.sol
event NoncesInitialized();

// declared in contracts/facets/initializer/IInitializer.sol
event OperationalStatusPartialSet(
    address sender,
    bytes32 configurationId,
    uint256 version,
    uint256 lastIndex
);

// declared in contracts/facets/initializer/IInitializer.sol
event OperationalStatusSet(address sender, bytes32 configurationId, uint256 version);

// declared in contracts/facets/operator/IOperator.sol
event OperatorAuthorized(address indexed operator, address indexed tokenHolder);

// declared in contracts/facets/operatorByPartition/IOperatorByPartition.sol
event OperatorByPartitionInitialized();

// declared in contracts/facets/operatorClearingByPartition/IOperatorClearingByPartition.sol
event OperatorClearingByPartitionInitialized();

// declared in contracts/facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol
event OperatorClearingHoldByPartitionInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event OperatorHeldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 holdId,
    Hold hold,
    bytes operatorData
);

// declared in contracts/facets/operatorHoldByPartition/IOperatorHoldByPartition.sol
event OperatorHoldByPartitionInitialized();

// declared in contracts/facets/operator/IOperator.sol
event OperatorInitialized();

// declared in contracts/facets/operator/IOperator.sol
event OperatorRevoked(address indexed operator, address indexed tokenHolder);

// declared in contracts/facets/partitions/IPartitions.sol
event PartitionsInitialized(bool multiPartition);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
event PartitionsProtected(address indexed operator);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
event PartitionsUnProtected(address indexed operator);

// declared in contracts/facets/transferAndLock/ITransferAndLockTypes.sol
event PartitionTransferredAndLocked(
    bytes32 indexed partition,
    address indexed from,
    address to,
    uint256 value,
    bytes data,
    uint256 expirationTimestamp,
    uint256 lockId
);

// declared in contracts/facets/pause/IPause.sol
event Paused(address indexed operator);

// declared in contracts/test/mocks/MockedExternalPause.sol
event PausedStateChanged(bool isPaused);

// declared in contracts/facets/pause/IPause.sol
event PauseInitialized();

// declared in contracts/facets/principal/IPrincipal.sol
event PrincipalInitialized();

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data);

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
event ProceedRecipientDataUpdated(
    address indexed operator,
    address indexed proceedRecipient,
    bytes newData
);

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient);

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
event ProceedRecipientsInitialized(address[] proceedRecipients, bytes[] data);

// declared in contracts/facets/protectedByPartition/IProtectedByPartition.sol
event ProtectedByPartitionInitialized();

// declared in contracts/facets/protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol
event ProtectedClearedHoldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    IHoldTypes.Hold hold,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/protectedClearingByPartition/IProtectedClearingByPartition.sol
event ProtectedClearedRedeemByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/protectedClearingByPartition/IProtectedClearingByPartition.sol
event ProtectedClearedTransferByPartition(
    address indexed operator,
    address indexed tokenHolder,
    address indexed to,
    bytes32 partition,
    uint256 clearingId,
    uint256 amount,
    uint256 expirationDate,
    bytes data,
    bytes operatorData
);

// declared in contracts/facets/protectedClearingByPartition/IProtectedClearingByPartition.sol
event ProtectedClearingByPartitionInitialized();

// declared in contracts/facets/protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol
event ProtectedClearingHoldByPartitionInitialized();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
event ProtectedHeldByPartition(
    address indexed operator,
    address indexed tokenHolder,
    bytes32 partition,
    uint256 holdId,
    Hold hold,
    bytes operatorData
);

// declared in contracts/facets/protectedHoldByPartition/IProtectedHoldByPartition.sol
event ProtectedHoldByPartitionInitialized();

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
event ProtectedPartitionsInitialized(bool arePartitionsProtected);

// declared in contracts/facets/protectedByPartition/IProtectedByPartition.sol
event ProtectedRedeemedByPartition(
    address indexed operator,
    address indexed from,
    uint256 amount,
    bytes32 partition,
    IProtectedPartitions.ProtectionData protectionData
);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
event ProtectedRedeemFrom(
    bytes32 indexed partition,
    address indexed operator,
    address indexed from,
    uint256 value,
    uint256 deadline,
    uint256 nonce,
    bytes signature
);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
event ProtectedTransferFrom(
    bytes32 indexed partition,
    address indexed operator,
    address indexed from,
    address to,
    uint256 value,
    uint256 deadline,
    uint256 nonce,
    bytes signature
);

// declared in contracts/facets/protectedByPartition/IProtectedByPartition.sol
event ProtectedTransferredByPartition(
    address indexed operator,
    address indexed from,
    address indexed to,
    uint256 amount,
    bytes32 partition,
    IProtectedPartitions.ProtectionData protectionData
);

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
event ProxyDeployed(
    address indexed proxyAddress,
    IBusinessLogicResolver resolver,
    bytes32 configKey,
    uint256 version,
    IResolverProxy.Rbac[] rbac
);

// declared in contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol, contracts/factory/ERC3643/interfaces/IFixedRate.sol
event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

// declared in contracts/facets/recovery/IRecovery.sol
event RecoveryInitialized();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID);

// declared in contracts/facets/burn/IBurn.sol
event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event RedeemedByPartition(
    bytes32 indexed partition,
    address indexed operator,
    address indexed from,
    uint256 value,
    bytes data,
    bytes operatorData
);

// declared in contracts/test/mocks/MockedExternalBlacklist.sol
event RemovedFromBlacklist(address indexed account);

// declared in contracts/facets/controlList/IControlList.sol
event RemovedFromControlList(address indexed operator, address indexed account);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
event RemovedFromExternalControlLists(address indexed operator, address controlList);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
event RemovedFromExternalKycLists(address indexed operator, address kycList);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
event RemovedFromExternalPauses(address indexed operator, address pause);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
event RemovedFromIssuerList(address indexed operator, address indexed issuer);

// declared in contracts/test/mocks/MockedExternalWhitelist.sol
event RemovedFromWhitelist(address indexed account);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
event RevocationRegistryUpdated(
    address indexed oldRegistryAddress,
    address indexed newRegistryAddress
);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event RevokedOperator(address indexed operator, address indexed tokenHolder);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event RevokedOperatorByPartition(
    bytes32 indexed partition,
    address indexed operator,
    address indexed tokenHolder
);

// declared in contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
event RoleAdminChanged(
    bytes32 indexed role,
    bytes32 indexed previousAdminRole,
    bytes32 indexed newAdminRole
);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
event RoleRenounced(address indexed account, bytes32 indexed role);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol
event RolesApplied(
    bytes32[] requestedRoles,
    bool[] requestedStates,
    address account,
    bytes32[] appliedRoles,
    bool[] appliedStates
);

// declared in contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
event RolesApplied(bytes32[] roles, bool[] actives, address account);

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
event ScheduledBalanceAdjustmentForceCancelled(
    uint256 balanceAdjustmentId,
    address indexed operator
);

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
event ScheduledBalanceAdjustmentInitialized();

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
event ScheduledBalanceAdjustmentSet(
    bytes32 corporateActionId,
    uint256 balanceAdjustmentId,
    address indexed operator,
    uint256 indexed executionDate,
    uint256 factor,
    uint256 decimals
);

// declared in contracts/facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol
event ScheduledCrossOrderedTasksInitialized();

// declared in contracts/facets/securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol
event SecurityHoldersAtSnapshotInitialized();

// declared in contracts/facets/securityHolders/ISecurityHolders.sol
event SecurityHoldersInitialized();

// declared in contracts/facets/layer_2/security/ISecurity.sol
event SecurityInitialized(
    RegulationData regulationData,
    AdditionalSecurityData additionalSecurityData
);

// declared in contracts/facets/snapshotsByPartition/ISnapshotsByPartition.sol
event SnapshotsByPartitionInitialized();

// declared in contracts/facets/snapshot/ISnapshots.sol
event SnapshotsInitialized();

// declared in contracts/facets/snapshot/ISnapshots.sol
event SnapshotTaken(address indexed operator, uint256 indexed snapshotID);

// declared in contracts/facets/snapshot/ISnapshots.sol
event SnapshotTriggered(uint256 snapshotId, bytes metadata);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
event SsiManagementInitialized();

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
event SystemBlocknumberChanged(uint256 legacySystemNumber, uint256 newSystemNumber);

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
event SystemBlocknumberReset();

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
event SystemTimestampChanged(uint256 legacySystemTime, uint256 newSystemTime);

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
event SystemTimestampReset();

// declared in contracts/facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol
event TaskExecutionFailed(
    bytes32 indexed actionId,
    bytes32 indexed taskType,
    uint256 scheduledTimestamp
);

// declared in contracts/facets/freeze/IFreeze.sol
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);

// declared in contracts/facets/freeze/IFreeze.sol
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);

// declared in contracts/facets/transfer/ITransfer.sol
event Transfer(address indexed from, address indexed to, uint256 value);

// declared in contracts/facets/transferAndLockByPartition/ITransferAndLockByPartition.sol
event TransferAndLockByPartitionInitialized();

// declared in contracts/facets/transferAndLock/ITransferAndLock.sol
event TransferAndLockInitialized();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
event TransferByPartition(
    bytes32 indexed _fromPartition,
    address _operator,
    address indexed _from,
    address indexed _to,
    uint256 _value,
    bytes _data,
    bytes _operatorData
);

// declared in contracts/facets/transferByPartition/ITransferByPartition.sol
event TransferByPartitionInitialized();

// declared in contracts/facets/transfer/ITransfer.sol
event TransferFromWithData(
    address indexed sender,
    address indexed from,
    address indexed to,
    uint256 amount,
    bytes data
);

// declared in contracts/facets/transfer/ITransfer.sol
event TransferInitialized();

// declared in contracts/facets/transfer/ITransfer.sol
event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data);

// declared in contracts/factory/ERC3643/libraries/core/TREXBaseDeploymentLib.sol
event TREXSuiteDeployed(
    address indexed _token,
    address _ir,
    address _irs,
    address _tir,
    address _ctr,
    address _mc,
    string indexed _salt
);

// declared in contracts/facets/pause/IPause.sol
event Unpaused(address indexed operator);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
event UpdatedTokenInformation(
    string indexed newName,
    string indexed newSymbol,
    uint8 newDecimals,
    string newVersion,
    address indexed newOnchainID
);

// declared in contracts/facets/voting/IVoting.sol
event VotingCancelled(uint256 voteId, address indexed operator);

// declared in contracts/facets/voting/IVoting.sol
event VotingForceCancelled(uint256 voteId, address indexed operator);

// declared in contracts/facets/voting/IVoting.sol
event VotingInitialized();

// declared in contracts/facets/votingSecurityHolders/IVotingSecurityHolders.sol
event VotingSecurityHoldersInitialized();

// declared in contracts/facets/voting/IVoting.sol
event VotingSet(
    bytes32 corporateActionId,
    uint256 voteId,
    address indexed operator,
    uint256 indexed recordDate,
    bytes data
);
```

## Errors

```solidity
// declared in contracts/facets/erc20Votes/IERC20Votes.sol
error AbafChangeForBlockForbidden(uint256 blockNumber);

// declared in contracts/services/core/AccessControlModifiers.sol
error AccessControlRequired(bytes32 role, address sender);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error AccountAssignedToRole(bytes32 role, address account);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error AccountHasNoRole(address account, bytes32 role);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error AccountHasNoRoles(address account, bytes32[] roles);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error AccountIsBlocked(address account);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
error AccountIsNotIssuer(address issuer);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error AccountNotAssignedToRole(bytes32 role, address account);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error AddressNotVerified();

// declared in contracts/test/mocks/MockComplianceModule.sol
error AlreadyBound();

// declared in contracts/infrastructure/errors/ICommonErrors.sol, contracts/test/mocks/MockImplementation.sol
error AlreadyInitialized();

// declared in contracts/test/mocks/MockImplementationV2.sol
error AlreadyInitializedV2();

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationAlreadyExecuted(bytes32 corporateActionId, uint256 amortizationId);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationCreationFailed();

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationHasActiveHolds(bytes32 corporateActionId, uint256 amortizationID);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationHoldFailed(bytes32 corporateActionId, uint256 amortizationID);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationHoldNotActive(
    bytes32 corporateActionId,
    uint256 amortizationID,
    address tokenHolder
);

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error AmortizationNotActive(bytes32 corporateActionId, uint256 amortizationID);

// declared in contracts/facets/initializer/IInitializer.sol
error AssetNotOperational(bytes32 configId, uint256 versionId);

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);

// declared in contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol
error BalanceAdjustmentCreationFailed();

// declared in contracts/facets/layer_2/bond/IBondTypes.sol, contracts/factory/ERC3643/interfaces/IBondTypes.sol
error BondMaturityDateWrong();

// declared in contracts/facets/erc20Votes/IERC20Votes.sol
error BrokenClockMode();

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
error BusinessLogicKeyDuplicated(bytes32 businessLogicKey);

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
error BusinessLogicKeyMismatch(address implementation, bytes32 actualKey, bytes32 expectedKey);

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
error BusinessLogicVersionDoesNotExist(uint256 version);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error CannotRecoverWallet();

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol
error CannotRenounceSoleAdmin();

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error ClearingIsActivated();

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error ClearingIsDisabled();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error ComplianceCallFailed();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error ComplianceNotAllowed();

// declared in contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol, contracts/infrastructure/errors/ICommonErrors.sol
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
error CorporateActionAlreadyDisabled(bytes32 corporateActionId);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
error CorporateActionNotFound(bytes32 corporateActionId);

// declared in contracts/facets/coupon/ICoupon.sol
error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);

// declared in contracts/facets/coupon/ICoupon.sol
error CouponCreationFailed();

// declared in contracts/facets/coupon/ICoupon.sol
error CouponNotFound(uint256 couponID);

// declared in contracts/facets/deactivate/IDeactivate.sol
error Deactivated();

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
error DecimalsOverflow();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error DefaultValueForConfigurationIdNotPermitted();

// declared in contracts/facets/dividend/IDividend.sol
error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);

// declared in contracts/facets/dividend/IDividend.sol
error DividendCreationFailed();

// declared in contracts/facets/documentation/IDocumentation.sol
error DocumentDoesNotExist(bytes32 name);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
error DuplicatedCorporateAction(bytes32 actionType, bytes data);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error DuplicatedFacetInConfiguration(bytes32 facetId);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error EmptyFacetConfigurationNotPermitted(bytes32 configurationId);

// declared in contracts/facets/documentation/IDocumentation.sol
error EmptyHASH();

// declared in contracts/facets/documentation/IDocumentation.sol
error EmptyName();

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
error EmptyResolver(IBusinessLogicResolver resolver);

// declared in contracts/facets/documentation/IDocumentation.sol
error EmptyURI();

// declared in contracts/facets/erc20Permit/IERC20Permit.sol
error ERC2612ExpiredSignature(uint256 deadline);

// declared in contracts/facets/erc20Permit/IERC20Permit.sol
error ERC2612InvalidSigner(address signer, address owner);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error ExpirationDateNotReached();

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error ExpirationDateReached();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error ExpiredDeadline(uint256 deadline);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
error ExternalControlListsNotUpdated(address[] controlLista, bool[] actives);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
error ExternalKycListsNotUpdated(address[] kycList, bool[] actives);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
error ExternalPausesNotUpdated(address[] pauses, bool[] actives);

// declared in contracts/facets/initializer/IInitializer.sol
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId);

// declared in contracts/facets/initializer/IInitializer.sol
error FacetPreviousVersionNotAccepted(
    bytes32 facetId,
    uint256 lastVersion,
    uint256[] expectedVersions
);

// declared in contracts/facets/initializer/IInitializer.sol
error FacetReady(bytes32 facetId, uint256 versionId);

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
error FactorIsZero();

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
error FactorOverflow();

// declared in contracts/factory/ERC3643/interfaces/IResolverProxy.sol, contracts/infrastructure/proxy/IResolverProxy.sol
error FunctionNotFound(bytes4 _functionSelector);

// declared in contracts/facets/erc20Votes/IERC20Votes.sol
error FutureLookup(uint256 timepoint, uint256 currentClock);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error GreaterThanMaxUint256(uint256 amount, uint8 decimals);

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error HoldExpirationNotReached();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error HoldExpirationReached();

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
error HoldingAssetNotFound(address assetAddress);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
error HoldingsAssetAlreadyExists(address assetAddress);

// declared in contracts/facets/layer_2/loansPortfolio/ILoansPortfolio.sol
error HoldingsAssetTypeNotSupported(uint8 holdingsAssetType);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error IdentityRegistryCallFailed();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error InputAmountsArrayLengthMismatch();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error InputBoolArrayLengthMismatch();

// declared in contracts/facets/allowance/IAllowanceTypes.sol
error InsufficientAllowance(address spender, address from);

// declared in contracts/facets/transfer/ITransfer.sol
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition);

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error InsufficientFrozenBalance(
    address user,
    uint256 requestedUnfreeze,
    uint256 availableFrozen,
    bytes32 partition
);

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);

// declared in contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol, contracts/factory/ERC3643/interfaces/IFixedRate.sol
error InterestRateIsFixed();

// declared in contracts/facets/coupon/ICoupon.sol
error InterestRateIsKpiLinked();

// declared in contracts/facets/coupon/ICoupon.sol
error InterestRateIsStandard();

// declared in contracts/facets/layer_2/amortization/IAmortization.sol
error InvalidAmortizationHoldAmount(uint256 amortizationID);

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
error InvalidBlocknumber(uint256 newSystemNumber);

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error InvalidClearingAmount();

// declared in contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol
error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate);

// declared in contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol
error InvalidDateRange(uint256 fromDate, uint256 toDate);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error InvalidDates();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error InvalidDestinationAddress(address holdDestination, address to);

// declared in contracts/facets/freeze/IFreeze.sol
error InvalidFreezeAmount();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error InvalidHoldAmount();

// declared in contracts/facets/kyc/IKyc.sol
error InvalidKycStatus();

// declared in contracts/facets/lock/ILockTypes.sol
error InvalidLockAmount();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error InvalidPartition(address account, bytes32 partition);

// declared in contracts/facets/interestRate/IInterestRate.sol
error InvalidRateType(RateType rateType);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error InvalidTimestamp();

// declared in contracts/facets/kyc/IKyc.sol
error InvalidZeroAddress();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error IsNotEscrow();

// declared in contracts/facets/pause/IPause.sol
error IsPaused();

// declared in contracts/facets/pause/IPause.sol
error IsUnpaused();

// declared in contracts/facets/layer_2/kpi/kpiLatest/IKpis.sol
error KpiDataAlreadyExists(uint256 date);

// declared in contracts/facets/kyc/IKyc.sol
error KycIsNotGranted();

// declared in contracts/facets/controlList/IControlList.sol
error ListedAccount(address account);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
error ListedControlList(address controlList);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
error ListedIssuer(address issuer);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
error ListedKycList(address kycList);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
error ListedPause(address pause);

// declared in contracts/facets/lock/ILockTypes.sol
error LockExpirationNotReached();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error MaxExternalListSizeReached(uint256 max);

// declared in contracts/facets/cap/ICap.sol
error MaxSupplyReached(uint256 maxSupply);

// declared in contracts/facets/cap/ICap.sol
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);

// declared in contracts/test/mocks/ComplianceMock.sol
error MockErrorBurn(address _from, uint256 _amount);

// declared in contracts/test/mocks/ComplianceMock.sol
error MockErrorCanTransfer(address _from, address _to, uint256 _amount);

// declared in contracts/test/mocks/ComplianceMock.sol
error MockErrorMint(address _to, uint256 _amount);

// declared in contracts/test/mocks/ComplianceMock.sol
error MockErrorTransfer(address _from, address _to, uint256 _amount);

// declared in contracts/test/mocks/IdentityRegistryMock.sol
error MockErrorVerified(address _userAddress);

// declared in contracts/test/mocks/MockScheduledTasksDispatchOps.sol
error MockTaskExecutionFailed();

// declared in contracts/facets/cap/ICap.sol
error NewMaxSupplyCannotBeZero();

// declared in contracts/facets/cap/ICap.sol
error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);

// declared in contracts/facets/cap/ICap.sol
error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol
error NoInitialAdmins();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error NotAllowedInMultiPartitionMode();

// declared in contracts/test/mocks/MockComplianceModule.sol
error NotBound();

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error OngoingBatchConfigurationNotPermitted(bytes32 configurationId);

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
error PartitionsAreProtected();

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);

// declared in contracts/facets/layer_1/protectedPartition/IProtectedPartitions.sol
error PartitionsAreUnProtected();

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
error ProceedRecipientAlreadyExists(address proceedRecipient);

// declared in contracts/facets/proceedRecipient/IProceedRecipients.sol
error ProceedRecipientNotFound(address proceedRecipient);

// declared in contracts/facets/protectedByPartition/IProtectedByPartition.sol
error ProtectedPartitionRoleRequired(bytes32 partition, address sender);

// declared in contracts/constants/regulation.sol, contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/ERC3643/interfaces/regulation.sol, contracts/factory/IFactory.sol
error RegulationTypeAndSubTypeForbidden(
    RegulationType regulationType,
    RegulationSubType regulationSubType
);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version);

// declared in contracts/facets/accessControl/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IAccessControl.sol, contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength);

// declared in contracts/factory/ERC3643/interfaces/IRexIAccessControl.sol
error RolesNotApplied(bytes32[] roles, bool[] actives, address account);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error SelectorAlreadyRegistered(
    bytes32 configurationId,
    uint256 version,
    bytes32 facetId,
    bytes4 selector
);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error SelectorBlacklisted(bytes4 selector);

// declared in contracts/facets/snapshot/ISnapshotsTypes.sol
error SnapshotIdDoesNotExists(uint256 snapshotId);

// declared in contracts/facets/snapshot/ISnapshotsTypes.sol
error SnapshotIdNull();

// declared in contracts/facets/allowance/IAllowanceTypes.sol
error SpenderWithZeroAddress();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error TokenHolderNotFound(address tokenHolder);

// declared in contracts/facets/controller/IController.sol
error TokenIsNotControllable();

// declared in contracts/facets/adjustBalances/IAdjustBalances.sol
error TotalSupplyOverflow();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error Unauthorized(address operator, address tokenHolder, bytes32 partition);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error UnexpectedError(bytes4 _errorId);

// declared in contracts/infrastructure/diamond/BusinessLogicResolver.sol
error Unimplemented();

// declared in contracts/facets/controlList/IControlList.sol
error UnlistedAccount(address account);

// declared in contracts/facets/externalControlListManagement/IExternalControlListManagement.sol
error UnlistedControlList(address controlList);

// declared in contracts/facets/ssiManagement/ISsiManagement.sol
error UnlistedIssuer(address issuer);

// declared in contracts/facets/externalKycListManagement/IExternalKycListManagement.sol
error UnlistedKycList(address kycList);

// declared in contracts/facets/externalPauseManagement/IExternalPauseManagement.sol
error UnlistedPause(address pause);

// declared in contracts/factory/ERC3643/interfaces/IDiamondCutManager.sol, contracts/infrastructure/diamond/IDiamondCutManager.sol
error VersionZero(bytes32 configurationId);

// declared in contracts/facets/voting/IVoting.sol
error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId);

// declared in contracts/facets/voting/IVoting.sol
error VotingRightsCreationFailed();

// declared in contracts/facets/layer_1/ERC3643/IERC3643Types.sol
error WalletRecovered();

// declared in contracts/test/testTimeTravel/ITimeTravel.sol
error WrongChainId();

// declared in contracts/facets/layer_1/clearing/IClearingTypes.sol
error WrongClearingId();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error WrongDates(uint256 firstDate, uint256 secondDate);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error WrongExpirationTimestamp();

// declared in contracts/facets/layer_1/hold/IHoldTypes.sol
error WrongHoldId();

// declared in contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol, contracts/factory/ERC3643/interfaces/IKpiLinkedRateErrors.sol
error WrongImpactDataValues(ImpactData impactData);

// declared in contracts/facets/corporateActions/ICorporateActions.sol
error WrongIndexForAction(uint256 index, bytes32 actionType);

// declared in contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol, contracts/factory/ERC3643/interfaces/IKpiLinkedRateErrors.sol
error WrongInterestRateValues(InterestRate interestRate);

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol, contracts/factory/isinValidator.sol
error WrongISIN(string isin);

// declared in contracts/factory/ERC3643/interfaces/IFactory.sol, contracts/factory/IFactory.sol, contracts/factory/isinValidator.sol
error WrongISINChecksum(string isin);

// declared in contracts/facets/lock/ILockTypes.sol
error WrongLockId();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error WrongNonce(uint256 nonce, address account);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error WrongSignature();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error WrongSignatureLength();

// declared in contracts/domain/asset/ScheduledTasksStorageWrapper.sol
error WrongTimestamp(uint256 timeStamp);

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error ZeroAddressNotAllowed();

// declared in contracts/factory/ERC3643/interfaces/IBusinessLogicResolver.sol, contracts/infrastructure/diamond/IBusinessLogicResolver.sol
error ZeroKeyNotValidForBusinessLogic();

// declared in contracts/facets/allowance/IAllowanceTypes.sol
error ZeroOwnerAddress();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error ZeroPartition();

// declared in contracts/facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol
error ZeroValue();

// declared in contracts/infrastructure/errors/ICommonErrors.sol
error ZeroValueNotAllowed();
```

## Roles

| Role | Value |
| --- | --- |
| `DEFAULT_ADMIN_ROLE` | `0x00` |
| `ROLE_ADJUSTMENT_BALANCE` | `0xb246506a8ded65dd6360e8ce033fd9462936d1be64fb9f85c5f60d28cd3ca6da` |
| `ROLE_AGENT` | `0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b` |
| `ROLE_AMORTIZATION` | `0x0c8c9cf3db23765397bf525e10c9158fd2a7b58b280d5da82a642247779ae3c1` |
| `ROLE_BOND_MANAGER` | `0x68fe577385095e80beadf873ac12a3100f9a9d1b6d40f0d123eecf3d01bf5c49` |
| `ROLE_CAP` | `0x58d502b7184e1a264e0cacf1a19a6c268356c6d9fda5ad83ab3b599cd3b7f41c` |
| `ROLE_CLEARING` | `0xd0fe259e861ec493f60fb83851f1a173155b0f2acc3da153de2a23fb0ad26db6` |
| `ROLE_CLEARING_VALIDATOR` | `0xa24ef577c383d98a9326f932c69c76129dd89a71abcb626993d9f047f4e74abb` |
| `ROLE_CONTROL_LIST` | `0x6ed9a91e996c6475ecdc28ecbdbe9bd1122fc62b30cdbe6da8271884b51ec74d` |
| `ROLE_CONTROL_LIST_MANAGER` | `0xccf29bda8369877bcc921e38f30df86156a571ca5c5b8e777bf7ff75270313ea` |
| `ROLE_CONTROLLER` | `0xb4d2b850c3ed8a234d390d5c157bbb1824883213c335ffe2a0f0761bb168713e` |
| `ROLE_CORPORATE_ACTION` | `0xa1acfc499025c99f55059195e6276f639d34a18aad7b8121b9192b7f438c55cd` |
| `ROLE_CORPORATE_ACTION_FORCE_CANCEL` | `0x34c18461eba17dd4b2a410f90e80f2a3d6e466af7753bf1b9519c24697c199f5` |
| `ROLE_CUSTOM_DATA_MANAGER` | `0x0b348f171b6004b74a59b08b77c142a65c416e0e20c855602b8b2510951101b0` |
| `ROLE_DEACTIVATE` | `0x31e3e0f7cd6b1bdc19162dd52d4ce1ed67de0aff8f89b768dcbfad8776b2ae4d` |
| `ROLE_DOCUMENTER` | `0xb7b1452b94e2932605f7ad2a3ceba0bafd68db64704c9bd667f27163c57ca319` |
| `ROLE_FREEZE_MANAGER` | `0x71ae38482e1ab1c28e767d64766d686215b490c8c1bd7dfe6b101525187c2155` |
| `ROLE_INTEREST_RATE_MANAGER` | `0xfa80c71f8de1628faf2c0e9bd02c2f4a3da1f16823b75e61e84b90164a07b4a4` |
| `ROLE_INTERNAL_KYC_MANAGER` | `0xdd78fdcd1b38a5360405cef8d91e758ad0f42bf2ced681b803b3c2704b0a32a7` |
| `ROLE_ISSUER` | `0x5eeaf5602c75bf26e73b5206d0bd6ee82f621166255e5fd73cc06bc7bd84a95f` |
| `ROLE_KPI_MANAGER` | `0x7895574f0552ac1a42245f5d7ea23bea04d0cfbc73df53282d588fdaa00f7fb3` |
| `ROLE_KYC` | `0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc` |
| `ROLE_KYC_MANAGER` | `0xec811504e835acf29535b5b62307b08000468f0c61ca6163ed6f17a03629b91e` |
| `ROLE_LOAN_MANAGER` | `0xcfd49258c7f1641d56add8e8efadca919969eb6aab447ec47f2ed34c8492547a` |
| `ROLE_LOANS_PORTFOLIO_MANAGER` | `0x90f7adc9b7132ce9c095619ba3e77e8505f2824b906ee99892386b8349a016c6` |
| `ROLE_LOCKER` | `0xd327cd9a2be405896f3d4584b3b437d798833cc4aa0aafb34c870659c0d47184` |
| `ROLE_MATURITY_REDEEMER` | `0x433f48f8aca23480f6ab07666cbc9131d32a0b4672033453f65e18f4dd390523` |
| `ROLE_NOMINAL_VALUE` | `0xebf9ab6852aef7bc1e4068a64bd360845c54d5d95d4fed9fd47c52bbe7c15b8b` |
| `ROLE_PAUSE_MANAGER` | `0x03e7c996eea5565d823330975718325a2eccfaf55d5ec99de9a1d9d7253c318e` |
| `ROLE_PAUSER` | `0x3cb8b459fdb6e7dc3d2a2aa529e530f885d45e03584adb438423209c86a2731f` |
| `ROLE_PROCEED_RECIPIENT_MANAGER` | `0x29baa8e752c40494481d6b4caa718d054ad999653716d39b1aa896387c68ae78` |
| `ROLE_PROTECTED_PARTITIONS` | `0x2d40a5b0ae1bfaa74e8787cae4b47373670a5b71b3e6031c4d849ed22e376bfd` |
| `ROLE_PROTECTED_PARTITIONS_PARTICIPANT` | `0xda17771b6b3d06197fabbe8db1d7586004df4869992b9c7c7fccec5f36dcf604` |
| `ROLE_SNAPSHOT` | `0xf7d999723d2160432933a2aeffaae83e262a5a46fe94f34614a7676d1d1f67c6` |
| `ROLE_SSI_MANAGER` | `0x3120494a82251fe85b0403877539486dbfcf0f94c20741a3229cfad31f625ee1` |
| `ROLE_TREX_OWNER` | `0xd9e1264632ee9a37e8673a0c55a0a1d8b38c758e843084168ee08cd2d1f7e6f0` |
| `ROLE_WILD_CARD` | `0x309337df95ff8f6d0075117d46b40fd103d8ae87db1914f1c60acb63487fb157` |
