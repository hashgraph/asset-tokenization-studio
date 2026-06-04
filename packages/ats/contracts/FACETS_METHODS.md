# ATS Facet Interfaces

> **Generated file — do not edit by hand.** Regenerate after any facet interface change with:
>
> ```bash
> node gen_facets_methods.mjs
> ```
>
> Maintained via the `solidity-natspec` skill.

## Contents

- [Facets](#facets)
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
  - [Ownership](#ownership)
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
- [Roles](#roles)

## Facets

<!-- core / supporting facets -->

### Access Control

- Interface: `contracts/facets/accessControl/IAccessControl.sol`
- Resolver key: `RESOLVER_KEY_ACCESS_CONTROL` = `0xccc2e755f9225e65f6c822a258c866fc0d57a124ad12c8928adf3ff875ffcd70`

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

#### Events

```solidity
event AccessControlInitialized();
event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role);
event RoleRenounced(address indexed account, bytes32 indexed role);
event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role);
event RolesApplied(
  bytes32[] requestedRoles,
  bool[] requestedStates,
  address account,
  bytes32[] appliedRoles,
  bool[] appliedStates
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountAssignedToRole(bytes32 role, address account);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AccountNotAssignedToRole(bytes32 role, address account);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CannotRenounceSoleAdmin();
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength);
```

### Adjust Balances

- Interface: `contracts/facets/adjustBalances/IAdjustBalances.sol`
- Resolver key: `RESOLVER_KEY_BALANCE_ADJUSTMENTS` = `0x0d52158578e1e30e77e2dd3caffc1aa31af5397866b92131f66858f01b2e8f01`

```solidity
function initializeBalanceAdjustments() external;
function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;
```

#### Events

```solidity
event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals);
event BalanceAdjustmentsInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error DecimalsOverflow();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error FactorIsZero();
error FactorOverflow();
error IsPaused();
error TotalSupplyOverflow();
```

### Allowance

- Interface: `contracts/facets/allowance/IAllowance.sol`
- Resolver key: `RESOLVER_KEY_ALLOWANCE` = `0x329473cfbe06c7719b3c986b04b90a16a859b86307aad33eea0c3dfe87160ab7`

```solidity
function initializeAllowance() external;
function approve(address spender, uint256 value) external returns (bool);
function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);
```

#### Events

```solidity
event AllowanceInitialized();
event Approval(address indexed owner, address indexed spender, uint256 value);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientAllowance(address spender, address from);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SpenderWithZeroAddress();
error ZeroOwnerAddress();
```

### Balance Tracker

- Interface: `contracts/facets/balanceTracker/IBalanceTracker.sol`
- Resolver key: `RESOLVER_KEY_BALANCE_TRACKER` = `0xefbff5dcb4e5bf43bf472fd0646991b8b4731876498b2a4248f9aa9aee1a127b`

```solidity
function initializeBalanceTracker() external;
function balanceOf(address _tokenHolder) external view returns (uint256);
function totalSupply() external view returns (uint256);
function getTotalBalanceFor(address _account) external view returns (uint256);
function testMethod(address _account, uint256 _value) external view returns (bool);
```

#### Events

```solidity
event BalanceTrackerInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Balance Tracker Adjusted

- Interface: `contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol`
- Resolver key: `RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED` = `0xde8fb5b2c9dd63c753422ecea8bad989281451fa65dff90dd686eff691b03805`

```solidity
function initializeBalanceTrackerAdjusted() external;
function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256);
```

#### Events

```solidity
event BalanceTrackerAdjustedInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Balance Tracker At Snapshot

- Interface: `contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT` = `0x2c9af26b5891593b8184a58e38f6c52e42af55578543d14ab176abd1213e3013`

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

#### Events

```solidity
event BalanceTrackerAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
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
- Resolver key: `RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION` = `0x58443162e33b704d1fc5afb40e87bf81357231beefee616de557cc06fef3aba8`

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

#### Events

```solidity
event BalanceTrackerAtSnapshotByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Balance Tracker By Partition

- Interface: `contracts/facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol`
- Resolver key: `RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION` = `0x05d2477d09e6a1df45e3e51bd398af7a071f6f282255486cec19b8b5a403bbaf`

```solidity
function initializeBalanceTrackerByPartition() external;
function balanceOfByPartition(bytes32 _partition, address _tokenHolder, uint256 _test) external view returns (uint256);
function totalSupplyByPartition(bytes32 _partition) external view returns (uint256);
function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256);
```

#### Events

```solidity
event BalanceTrackerByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Batch Burn

- Interface: `contracts/facets/batchBurn/IBatchBurn.sol`
- Resolver key: `RESOLVER_KEY_BATCH_BURN` = `0x60fbdebafe46599d2a6d6cbec0e554cfdf693e5eb001a783852bbbc82e5c9984`

```solidity
function initializeBatchBurn() external;
function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
```

#### Events

```solidity
event BatchBurnInitialized();
event ControllerRedemption(
  address _controller,
  address indexed _tokenHolder,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InputAmountsArrayLengthMismatch();
error IsPaused();
error NotAllowedInMultiPartitionMode();
error TokenIsNotControllable();
```

### Batch Controller

- Interface: `contracts/facets/batchController/IBatchController.sol`
- Resolver key: `RESOLVER_KEY_BATCH_CONTROLLER` = `0x535258ade68566dbac2304c09e172709e8b0ab3f78d2be54014d021ddb03ab58`

```solidity
function initializeBatchController() external;
function batchForcedTransfer(
  address[] calldata _fromList,
  address[] calldata _toList,
  uint256[] calldata _amounts
) external;
```

#### Events

```solidity
event BatchControllerInitialized();
event ControllerTransfer(
  address _controller,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InputAmountsArrayLengthMismatch();
error IsPaused();
error NotAllowedInMultiPartitionMode();
error TokenIsNotControllable();
```

### Batch Freeze

- Interface: `contracts/facets/batchFreeze/IBatchFreeze.sol`
- Resolver key: `RESOLVER_KEY_BATCH_FREEZE` = `0x6ddbb1869dce32d8e2c9bb2d23fad216723298560b6cceba67890d5a3efe0e5e`

```solidity
function initializeBatchFreeze() external;
function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external;
function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
```

#### Events

```solidity
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);
event BatchFreezeInitialized();
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber);
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InputAmountsArrayLengthMismatch();
error InputBoolArrayLengthMismatch();
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition);
error InvalidFreezeAmount();
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WalletRecovered();
error ZeroAddressNotAllowed();
```

### Batch Mint

- Interface: `contracts/facets/batchMint/IBatchMint.sol`
- Resolver key: `RESOLVER_KEY_BATCH_MINT` = `0x7575e07f738065de9a6ba5370d7d18b79f7a0b885824780bf5c75784978e9530`

```solidity
function initializeBatchMint() external;
function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;
```

#### Events

```solidity
event BatchMintInitialized();
event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InputAmountsArrayLengthMismatch();
error IsPaused();
error MaxSupplyReached(uint256 maxSupply);
error NotAllowedInMultiPartitionMode();
error WalletRecovered();
```

### Batch Transfer

- Interface: `contracts/facets/batchTransfer/IBatchTransfer.sol`
- Resolver key: `RESOLVER_KEY_BATCH_TRANSFER` = `0x01e13672eac45bef2d8d3f1c56eaca6857103f3b72ec9ded3d1f30aa15747d05`

```solidity
function initializeBatchTransfer() external;
function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
```

#### Events

```solidity
event BatchTransferInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InputAmountsArrayLengthMismatch();
error IsPaused();
error NotAllowedInMultiPartitionMode();
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
```

### Burn

- Interface: `contracts/facets/burn/IBurn.sol`
- Resolver key: `RESOLVER_KEY_BURN` = `0xa9ec330b49ea310aaeba8dae3ba4f2a0b94fd35fafb9d8d8afbb804b73d50ce2`

```solidity
function initializeBurn() external;
function burn(address _userAddress, uint256 _amount) external;
function redeem(uint256 _value, bytes calldata _data) external;
function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
```

#### Events

```solidity
event BurnInitialized();
event ControllerRedemption(
  address _controller,
  address indexed _tokenHolder,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error ProtectedPartitionRoleRequired(bytes32 partition, address sender);
error TokenIsNotControllable();
error WalletRecovered();
```

### Burn By Partition

- Interface: `contracts/facets/burnByPartition/IBurnByPartition.sol`
- Resolver key: `RESOLVER_KEY_BURN_BY_PARTITION` = `0x8d135078123ea705bd40f02ac0cd59ac08da08600b3510ba6150fe0e4a588684`

```solidity
function initializeBurnByPartition() external;
function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;
```

#### Events

```solidity
event BurnByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
```

### Business Logic Resolver

- Interface: `contracts/infrastructure/diamond/IBusinessLogicResolver.sol`

```solidity
function initializeBusinessLogicResolver() external returns (bool success_);
function registerBusinessLogics(BusinessLogicRegistryData[] calldata _businessLogics) external;
function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;
function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;
function getVersionStatus(bytes32 _businessLogicKey, uint256 _version) external view returns (VersionStatus status_);
function getLatestVersion(bytes32 _businessLogicKey) external view returns (uint256 latestVersion_);
function getLatestVersions(
  bytes32[] calldata _businessLogicKeys
) external view returns (uint256[] memory latestVersions_);
function resolveLatestBusinessLogic(bytes32 _businessLogicKey) external view returns (address businessLogicAddress_);
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
- Resolver key: `RESOLVER_KEY_CAP` = `0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5`

```solidity
function initializeCap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external;
function setMaxSupply(uint256 _maxSupply) external returns (bool success_);
function getMaxSupply() external view returns (uint256 maxSupply_);
```

#### Events

```solidity
event CapInitialized(uint256 maxSupply, ICap.PartitionCap[] partitionCap);
event MaxSupplyByPartitionSet(
  address indexed operator,
  bytes32 indexed partition,
  uint256 newMaxSupply,
  uint256 previousMaxSupply
);
event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error MaxSupplyReached(uint256 maxSupply);
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);
error NewMaxSupplyCannotBeZero();
error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);
error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);
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
- Resolver key: `RESOLVER_KEY_CAP_BY_PARTITION` = `0x0a9c473b0456240ebc327730dba40a495c5a639839b0c0b30a01db12373f7529`

```solidity
function initializeCapByPartition() external;
function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external returns (bool success_);
function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_);
```

#### Events

```solidity
event CapByPartitionInitialized();
event MaxSupplyByPartitionSet(
  address indexed operator,
  bytes32 indexed partition,
  uint256 newMaxSupply,
  uint256 previousMaxSupply
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error NewMaxSupplyCannotBeZero();
error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);
```

### Clearing

- Interface: `contracts/facets/clearing/IClearing.sol`
- Resolver key: `RESOLVER_KEY_CLEARING` = `0xb101eca2006801ca94d6bc86288da88fc7f2ddf39849d3dd96fae75967a3d344`

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

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingInitialized(bool clearingActive);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error WrongClearingId();
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
- Resolver key: `RESOLVER_KEY_CLEARING_AT_SNAPSHOT` = `0xb65566db9291ca49b508408fe1ba503b28ea434b3f9bca05c3a0c4da031f9e86`

```solidity
function initializeClearingAtSnapshot() external;
function clearedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

#### Events

```solidity
event ClearingAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Clearing At Snapshot By Partition

- Interface: `contracts/facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol`
- Resolver key: `RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION` = `0xf55083b17a9ba346028d6a5c0772a7d913e0e90b4954f7a8b8e1912dcd383cbd`

```solidity
function initializeClearingAtSnapshotByPartition() external;
function clearedBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

#### Events

```solidity
event ClearingAtSnapshotByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Clearing By Partition

- Interface: `contracts/facets/clearingByPartition/IClearingByPartition.sol`
- Resolver key: `RESOLVER_KEY_CLEARING_BY_PARTITION` = `0xb63156d6db31ae3207bca0dd4a8a45f227171367d85a3833a0d7a1622212c5ec`

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

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingByPartitionInitialized();
event ClearingDeactivated(address indexed operator);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_CLEARING_HOLDBYPARTITION` = `0x027ca02a0a3de6d790cd3b5ff9c792b4bfc1649964d7737f5c4554992ca9b111`

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

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingHoldByPartitionInitialized();
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_COMPLIANCE_BY_PARTITION` = `0xafad2096960379c99c5eae984f0f4ceddafa69c3e08352bcaf84e804ec4135b6`

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

#### Events

```solidity
event ComplianceByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Compliance Facet

- Interface: `contracts/facets/compliance/IComplianceFacet.sol`
- Resolver key: `RESOLVER_KEY_COMPLIANCE` = `0x0e30d654f46079d52767224a07d1fe1adc91d7edba6504f2f0adca0fca972180`

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

#### Events

```solidity
event ComplianceInitialized(address compliance);
```

### Control List

- Interface: `contracts/facets/controlList/IControlList.sol`
- Resolver key: `RESOLVER_KEY_CONTROL_LIST` = `0x7bbee58c68b6e19a08128d25f150956d20a69d1cc049afda563753771781ecc5`

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

#### Events

```solidity
event AddedToControlList(address indexed operator, address indexed account);
event ControlListInitialized(bool isWhiteList);
event RemovedFromControlList(address indexed operator, address indexed account);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error ListedAccount(address account);
error UnlistedAccount(address account);
```

### Controller

- Interface: `contracts/facets/controller/IController.sol`
- Resolver key: `RESOLVER_KEY_CONTROLLER` = `0xf020acbcf895b1f0961c02558f58e8e3f0a254c27f0e6287127ac2f43893df46`

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

#### Events

```solidity
event AgentAdded(address indexed _agent);
event AgentRemoved(address indexed _agent);
event ComplianceAdded(address indexed compliance);
event ControllerInitialized(bool controllable);
event ControllerRedemption(
  address _controller,
  address indexed _tokenHolder,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
event ControllerTransfer(
  address _controller,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
event FinalizedControllerFeature(address operator);
event IdentityRegistryAdded(address indexed identityRegistry);
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID);
event UpdatedTokenInformation(
  string indexed newName,
  string indexed newSymbol,
  uint8 newDecimals,
  string newVersion,
  address indexed newOnchainID
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountAssignedToRole(bytes32 role, address account);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AccountNotAssignedToRole(bytes32 role, address account);
error AddressNotVerified();
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CannotRecoverWallet();
error ComplianceCallFailed();
error ComplianceNotAllowed();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IdentityRegistryCallFailed();
error InputAmountsArrayLengthMismatch();
error InputBoolArrayLengthMismatch();
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error TokenIsNotControllable();
error WalletRecovered();
```

### Controller By Partition

- Interface: `contracts/facets/controllerByPartition/IControllerByPartition.sol`
- Resolver key: `RESOLVER_KEY_CONTROLLER_BY_PARTITION` = `0xa75865ef65a8410651c7bfebbfa9b89bd06e0bdf0dba55817ba1a6b49fdb1517`

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

#### Events

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event ControllerByPartitionInitialized();
event IssuedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed to,
  uint256 value,
  bytes data
);
event RedeemedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed from,
  uint256 value,
  bytes data,
  bytes operatorData
);
event RevokedOperator(address indexed operator, address indexed tokenHolder);
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error TokenHolderNotFound(address tokenHolder);
error TokenIsNotControllable();
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error ZeroPartition();
error ZeroValue();
```

### Controller Hold By Partition

- Interface: `contracts/facets/controllerHoldByPartition/IControllerHoldByPartition.sol`
- Resolver key: `RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION` = `0xc415f5239b26cab850bcaca08096196a95d9ea5bab0eed1a6e29ce81490efd33`

```solidity
function initializeControllerHoldByPartition() external;
function controllerCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _operatorData
) external returns (bool success_, uint256 holdId_);
```

#### Events

```solidity
event ControllerHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ControllerHoldByPartitionInitialized();
event HeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldFromByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HoldByPartitionExecuted(
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount,
  address to
);
event HoldByPartitionReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount
);
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount);
event OperatorHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ProtectedHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error HoldExpirationNotReached();
error HoldExpirationReached();
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidDestinationAddress(address holdDestination, address to);
error InvalidHoldAmount();
error IsNotEscrow();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error TokenIsNotControllable();
error WalletRecovered();
error WrongExpirationTimestamp();
error WrongHoldId();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_CORE` = `0xb54e0c9a42346a2760a44e59035a2b84a61d07bed66a2f24cffe3ca4bae1996f`

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

#### Events

```solidity
event CoreInitialized(ERC20Metadata metadata);
event UpdatedTokenInformation(
  string indexed newName,
  string indexed newSymbol,
  uint8 newDecimals,
  string newVersion,
  address indexed newOnchainID
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
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
- Resolver key: `RESOLVER_KEY_CORE_ADJUSTED` = `0xe190b52312c215f8e240bb53f0aa3e51e31b3005b7fcfb49c730ae523e675cfd`

```solidity
function initializeCoreAdjusted() external;
function decimalsAt(uint256 _timestamp) external view returns (uint8);
```

#### Events

```solidity
event CoreAdjustedInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Core At Snapshot

- Interface: `contracts/facets/coreAtSnapshot/ICoreAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_CORE_AT_SNAPSHOT` = `0x9f1ab2bcf2a5668b07a2b26155b1c04f30721db434dff2f1e69a3a9b1dc0a039`

```solidity
function initializeCoreAtSnapshot() external;
function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);
```

#### Events

```solidity
event CoreAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Corporate Actions

- Interface: `contracts/facets/corporateActions/ICorporateActions.sol`
- Resolver key: `RESOLVER_KEY_CORPORATE_ACTIONS` = `0x4f091e1f288c10131ffc090469e611b913f1f54343e59e44405312d597897db2`

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

#### Events

```solidity
event CorporateActionAdded(
  address indexed operator,
  bytes32 indexed actionType,
  bytes32 indexed corporateActionId,
  uint256 corporateActionIdByType,
  bytes data
);
event CorporateActionCancelled(bytes32 indexed corporateActionId);
event CorporateActionsInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountIsBlocked(address account);
error AlreadyInitialized();
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);
error CorporateActionAlreadyDisabled(bytes32 corporateActionId);
error CorporateActionNotFound(bytes32 corporateActionId);
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals);
error DuplicatedCorporateAction(bytes32 actionType, bytes data);
error ExpiredDeadline(uint256 deadline);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error GreaterThanMaxUint256(uint256 amount, uint8 decimals);
error InvalidDates();
error InvalidTimestamp();
error UnexpectedError(bytes4 _errorId);
error WrongDates(uint256 firstDate, uint256 secondDate);
error WrongExpirationTimestamp();
error WrongIndexForAction(uint256 index, bytes32 actionType);
error WrongNonce(uint256 nonce, address account);
error WrongSignature();
error WrongSignatureLength();
error ZeroAddressNotAllowed();
error ZeroValueNotAllowed();
```

### Coupon

- Interface: `contracts/facets/coupon/ICoupon.sol`
- Resolver key: `RESOLVER_KEY_COUPON` = `0xe292dde7a8154c59d06fe2333acc2b54d003262aadc39ee2c7b474e6e64add6b`

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

#### Events

```solidity
event CouponCancelled(uint256 indexed couponId, address indexed operator);
event CouponForceCancelled(uint256 indexed couponId, address indexed operator);
event CouponInitialized();
event CouponSet(bytes32 indexed corporateActionId, uint256 indexed couponId, address indexed operator, Coupon coupon);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);
error CouponCreationFailed();
error CouponNotFound(uint256 couponID);
error Deactivated();
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error GreaterThanMaxUint256(uint256 amount, uint8 decimals);
error InterestRateIsFixed();
error InterestRateIsKpiLinked();
error InterestRateIsStandard();
error InvalidTimestamp();
error IsPaused();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WrongDates(uint256 firstDate, uint256 secondDate);
error WrongImpactDataValues(ImpactData impactData);
error WrongIndexForAction(uint256 index, bytes32 actionType);
error WrongInterestRateValues(InterestRate interestRate);
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
- Resolver key: `RESOLVER_KEY_COUPON_LISTING` = `0x91e4a085c95cddedc7143dae7647c320f59b0f0214ed0f49ab95d7cedb4db176`

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

#### Events

```solidity
event CouponListingInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
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
- Resolver key: `RESOLVER_KEY_COUPON_SECURITY_HOLDERS` = `0x8e5fc42839ddbceddb6022f61f5907a3849178cce5cfb82850a28e80140ac9a9`

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

#### Events

```solidity
event CouponSecurityHoldersInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CouponNotFound(uint256 couponID);
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error GreaterThanMaxUint256(uint256 amount, uint8 decimals);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WrongImpactDataValues(ImpactData impactData);
error WrongIndexForAction(uint256 index, bytes32 actionType);
error WrongInterestRateValues(InterestRate interestRate);
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
- Resolver key: `RESOLVER_KEY_CUSTOM_DATA` = `0xfe752225f0f7bb1ac35587b02565558e9fbf467f7354ab27123c0afd1aca9a56`

```solidity
function initializeCustomData() external;
function setCustomData(bytes32 _key, bytes[] calldata _value) external;
function getCustomData(bytes32 _key) external view returns (bytes[] memory value_);
```

#### Events

```solidity
event CustomDataInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
```

### Deactivate

- Interface: `contracts/facets/deactivate/IDeactivate.sol`
- Resolver key: `RESOLVER_KEY_DEACTIVATE` = `0x13d8bdda80bdc4e1d1af80d2096fdf84affb60341d7b8f44392412162d3c3434`

```solidity
function initializeDeactivate() external;
function deactivate() external;
function isDeactivated() external view returns (bool);
```

#### Events

```solidity
event DeactivateInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
```

### Diamond Cut

- Interface: `contracts/infrastructure/proxy/IDiamondCut.sol`

```solidity
function updateConfigVersion(uint256 _newVersion) external;
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external;
function updateResolver(IBusinessLogicResolver _newResolver, bytes32 _newConfigurationId, uint256 _newVersion) external;
function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_);
```

### Diamond Cut Manager

- Interface: `contracts/infrastructure/diamond/IDiamondCutManager.sol`

```solidity
function createConfiguration(bytes32 _configurationId, FacetConfiguration[] calldata _facetConfigurations) external;
function createBatchConfiguration(
  bytes32 _configurationId,
  FacetConfiguration[] calldata _facetConfigurations,
  bool _isLastBatch
) external;
function cancelBatchConfiguration(bytes32 _configurationId) external;
function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external;
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
function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_);
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
function getFacetsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (Facet[] memory facets_);
function getFacetSelectors(bytes32 _facetId) external view returns (bytes4[] memory facetSelectors_);
function getFacetSelectorsLength(bytes32 _facetId) external view returns (uint256 facetSelectorsLength_);
function getFacetSelectorsByPage(
  bytes32 _facetId,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (bytes4[] memory facetSelectors_);
function getFacetIds() external view returns (bytes32[] memory facetIds_);
function getFacetIdsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] memory facetIds_);
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
- Resolver key: `RESOLVER_KEY_DIVIDEND` = `0xfcc58d1d55d14a1359461bb9cef220b267b9846b01d61bd27d97f7c10c28b445`

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

#### Events

```solidity
event DividendCancelled(uint256 dividendId, address indexed operator);
event DividendForceCancelled(uint256 dividendId, address indexed operator);
event DividendInitialized();
event DividendSet(
  bytes32 corporateActionId,
  uint256 dividendId,
  address indexed operator,
  uint256 indexed recordDate,
  uint256 indexed executionDate,
  uint256 amount,
  uint8 amountDecimals
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);
error DividendCreationFailed();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidTimestamp();
error IsPaused();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WrongDates(uint256 firstDate, uint256 secondDate);
error WrongIndexForAction(uint256 index, bytes32 actionType);
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
- Resolver key: `RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS` = `0x1478127ed7121d4c1f51d4844183242705cd85c8948b44acb7756ecf98830402`

```solidity
function initializeDividendSecurityHolders() external;
function getDividendHolders(
  uint256 dividendId,
  uint256 pageIndex,
  uint256 pageLength
) external view returns (address[] memory holders_);
function getTotalDividendHolders(uint256 dividendId) external view returns (uint256);
```

#### Events

```solidity
event DividendSecurityHoldersInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error WrongIndexForAction(uint256 index, bytes32 actionType);
```

### Documentation

- Interface: `contracts/facets/documentation/IDocumentation.sol`
- Resolver key: `RESOLVER_KEY_DOCUMENTATION` = `0x3ab155fb7c96aefcaa7d730782cb640e5acf33c329d90a706843ae88a03cf1fb`

```solidity
function initializeDocumentation() external;
function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;
function removeDocument(bytes32 _name) external;
function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256);
function getAllDocuments() external view returns (bytes32[] memory);
```

#### Events

```solidity
event DocumentationInitialized();
event DocumentRemoved(bytes32 indexed name, string uri, bytes32 documentHash);
event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error DocumentDoesNotExist(bytes32 name);
error EmptyHASH();
error EmptyName();
error EmptyURI();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
```

### EIP712

- Interface: `contracts/facets/eip712/IEIP712.sol`
- Resolver key: `RESOLVER_KEY_EIP712` = `0xaa031e71d3d43f715d16d62c62d7573406d29acdf4c080143dab629e08a8402f`

```solidity
function initializeEIP712() external;
function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_);
```

#### Events

```solidity
event EIP712Initialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### ERC20 Permit

- Interface: `contracts/facets/erc20Permit/IERC20Permit.sol`
- Resolver key: `RESOLVER_KEY_ERC20PERMIT` = `0xb9b450cd33d22a14f4cc67bea5d1afefac1f0e7c5230fce1b942f751c37a9e6d`

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

#### Events

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
event ERC20PermitInitialized();
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error ERC2612ExpiredSignature(uint256 deadline);
error ERC2612InvalidSigner(address signer, address owner);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SpenderWithZeroAddress();
error UnexpectedError(bytes4 _errorId);
error ZeroAddressNotAllowed();
```

### ERC20 Votes

- Interface: `contracts/facets/erc20Votes/IERC20Votes.sol`
- Resolver key: `RESOLVER_KEY_ERC20VOTES` = `0x9619bb38c76aac49afb1df75430aefc1314778fe926136a688bf3ae3b5f8c3b7`

```solidity
function initializeERC20Votes(bool _activated) external;
function isActivated() external view returns (bool);
function checkpoints(address _account, uint256 _pos) external view returns (Checkpoints.Checkpoint memory);
function numCheckpoints(address _account) external view returns (uint256);
```

#### Events

```solidity
event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
event ERC20VotesInitialized(bool activated);
```

#### Errors

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber);
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error BrokenClockMode();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error FutureLookup(uint256 timepoint, uint256 currentClock);
error IsPaused();
error UnexpectedError(bytes4 _errorId);
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
- Resolver key: `RESOLVER_KEY_EXTERNAL_CONTROL_LIST` = `0x1a8f526d3e49a86640ec4a268407478132e285f13c4efbe08c46324306fd6a04`

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

#### Events

```solidity
event AddedToExternalControlLists(address indexed operator, address controlList);
event ExternalControlListInitialized(address[] controlLists);
event ExternalControlListsUpdated(address indexed operator, address[] controlLists, bool[] actives);
event RemovedFromExternalControlLists(address indexed operator, address controlList);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);
error Deactivated();
error ExternalControlListsNotUpdated(address[] controlLista, bool[] actives);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error ListedControlList(address controlList);
error UnlistedControlList(address controlList);
error ZeroAddressNotAllowed();
```

### External KYC List Management

- Interface: `contracts/facets/externalKycListManagement/IExternalKycListManagement.sol`
- Resolver key: `RESOLVER_KEY_EXTERNAL_KYC_LIST` = `0x519d262ce075401982a7a64c60caea0491af317c7b69b7869f8181e8d9cda124`

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

#### Events

```solidity
event AddedToExternalKycLists(address indexed operator, address kycList);
event ExternalKycListInitialized(address[] kycLists);
event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives);
event RemovedFromExternalKycLists(address indexed operator, address kycList);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);
error Deactivated();
error ExternalKycListsNotUpdated(address[] kycList, bool[] actives);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error ListedKycList(address kycList);
error UnlistedKycList(address kycList);
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_EXTERNAL_PAUSE` = `0x7a8980089ef3860d6c0e831805ee28105e662952033ce76812e56e346d37bd7e`

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

#### Events

```solidity
event AddedToExternalPauses(address indexed operator, address pause);
event ExternalPauseInitialized(address[] pauses);
event ExternalPausesUpdated(address indexed operator, address[] pauses, bool[] actives);
event RemovedFromExternalPauses(address indexed operator, address pause);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);
error Deactivated();
error ExternalPausesNotUpdated(address[] pauses, bool[] actives);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error ListedPause(address pause);
error UnlistedPause(address pause);
error ZeroAddressNotAllowed();
```

### Factory

- Interface: `contracts/factory/IFactory.sol`
- Resolver key: `RESOLVER_KEY_FACTORY` = `0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7`

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

#### Events

```solidity
event BondDeployed(
  address indexed deployer,
  address bondAddress,
  BondData bondData,
  FactoryRegulationData regulationData
);
event BondFixedRateDeployed(address indexed deployer, address bondAddress, BondFixedRateData bondFixedRateData);
event BondKpiLinkedRateDeployed(
  address indexed deployer,
  address bondAddress,
  BondKpiLinkedRateData bondKpiLinkedRateData
);
event EquityDeployed(
  address indexed deployer,
  address equityAddress,
  EquityData equityData,
  FactoryRegulationData regulationData
);
event ProxyDeployed(
  address indexed proxyAddress,
  IBusinessLogicResolver resolver,
  bytes32 configKey,
  uint256 version,
  IResolverProxy.Rbac[] rbac
);
```

#### Errors

```solidity
error EmptyResolver(IBusinessLogicResolver resolver);
error NoInitialAdmins();
error RegulationTypeAndSubTypeForbidden(RegulationType regulationType, RegulationSubType regulationSubType);
error UnexpectedError(bytes4 _errorId);
error WrongDates(uint256 firstDate, uint256 secondDate);
error WrongImpactDataValues(ImpactData impactData);
error WrongInterestRateValues(InterestRate interestRate);
error WrongISIN(string isin);
error WrongISINChecksum(string isin);
error WrongTimestamp(uint256 timeStamp);
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
- Resolver key: `RESOLVER_KEY_FREEZE` = `0xad51c3d79dbb37543854270a7bd1c7237cfa425b16cdf4dee9015c20917ced5a`

```solidity
function initializeFreeze() external;
function freezePartialTokens(address _userAddress, uint256 _amount) external;
function unfreezePartialTokens(address _userAddress, uint256 _amount) external;
function setAddressFrozen(address _userAddress, bool _freezeStatus) external;
function getFrozenTokens(address _userAddress) external view returns (uint256);
function isFrozen(address _userAddress) external view returns (bool);
```

#### Events

```solidity
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
event FreezeInitialized();
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber);
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition);
error InvalidFreezeAmount();
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WalletRecovered();
error ZeroAddressNotAllowed();
```

### Freeze At Snapshot

- Interface: `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_FREEZE_AT_SNAPSHOT` = `0x8ca462bf28ae4e7c5b77b86245cfff3caf7f6bdb6308a608cd9315feb2c28631`

```solidity
function initializeFreezeAtSnapshot() external;
function frozenBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

#### Events

```solidity
event FreezeAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Freeze At Snapshot By Partition

- Interface: `contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol`
- Resolver key: `RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION` = `0xac8fcbc19e12e099f6c6cff54357e28a589b49673267c81a18a965da1c7f4744`

```solidity
function initializeFreezeAtSnapshotByPartition() external;
function frozenBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

#### Events

```solidity
event FreezeAtSnapshotByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Hold At Snapshot

- Interface: `contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_HOLD_AT_SNAPSHOT` = `0xe4ec7231213c656d430571c2b40cf204f87a626b5ccf0db85527f72470e54a9e`

```solidity
function initializeHoldAtSnapshot() external;
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

#### Events

```solidity
event HoldAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Hold At Snapshot By Partition

- Interface: `contracts/facets/holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol`
- Resolver key: `RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION` = `0xe6aa6abeda5257bb9fda94cbd6583ff73bfc92f42edd2ace846ee45b3cf49f0f`

```solidity
function initializeHoldAtSnapshotByPartition() external;
function heldBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

#### Events

```solidity
event HoldAtSnapshotByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Hold By Partition

- Interface: `contracts/facets/holdByPartition/IHoldByPartition.sol`
- Resolver key: `RESOLVER_KEY_HOLD_BY_PARTITION` = `0x3bd50b70b7e42003cb9761c133e88d776c27b53729b463a2d5bf6b36a2fce367`

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

#### Events

```solidity
event ControllerHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldFromByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HoldByPartitionExecuted(
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount,
  address to
);
event HoldByPartitionInitialized();
event HoldByPartitionReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount
);
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount);
event OperatorHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ProtectedHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error HoldExpirationNotReached();
error HoldExpirationReached();
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidDestinationAddress(address holdDestination, address to);
error InvalidHoldAmount();
error IsNotEscrow();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error WalletRecovered();
error WrongExpirationTimestamp();
error WrongHoldId();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_HOLD` = `0x7c2ef14067e573a8580a580634bd7547099c4b82cd9f36610da317d77eacf1f1`

```solidity
function initializeHold() external;
function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);
```

#### Events

```solidity
event ControllerHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldFromByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HoldByPartitionExecuted(
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount,
  address to
);
event HoldByPartitionReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount
);
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount);
event HoldInitialized();
event OperatorHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ProtectedHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
```

#### Errors

```solidity
error HoldExpirationNotReached();
error HoldExpirationReached();
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidDestinationAddress(address holdDestination, address to);
error InvalidHoldAmount();
error IsNotEscrow();
error WrongHoldId();
```

### Identity

- Interface: `contracts/facets/identity/IIdentity.sol`
- Resolver key: `RESOLVER_KEY_IDENTITY` = `0xbb0d93867bfe08218b429804914b1d345b2c899740c5dd110cb9c6141a01d36e`

```solidity
function initializeIdentity(address _identityRegistry) external;
function setOnchainID(address _onchainID) external;
function setIdentityRegistry(address _identityRegistry) external;
function identityRegistry() external view returns (IIdentityRegistry);
function onchainID() external view returns (address);
```

#### Events

```solidity
event IdentityInitialized(address identityRegistry);
event IdentityRegistryAdded(address indexed identityRegistry);
event UpdatedTokenInformation(
  string indexed newName,
  string indexed newSymbol,
  uint8 newDecimals,
  string newVersion,
  address indexed newOnchainID
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
```

### Initializer

- Interface: `contracts/facets/initializer/IInitializer.sol`
- Resolver key: `RESOLVER_KEY_INITIALIZER` = `0xe7caa2e00c841ed2a64c4c95e3981f3bfc29108599fad6e89b04f9483df0bf09`

```solidity
function initializeInitializer(uint256 _maxInitializerFacetIndex) external;
function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external;
function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);
function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);
function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);
function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_);
```

#### Events

```solidity
event InitializerInitialized(uint256 maxInitializerFacetIndex);
event MaxInitializerFacetIndexUpdated(address sender, uint256 newMaxInitializerFacetIndex);
event OperationalStatusPartialSet(address sender, bytes32 configurationId, uint256 version, uint256 lastIndex);
event OperationalStatusSet(address sender, bytes32 configurationId, uint256 version);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions);
error FacetReady(bytes32 facetId, uint256 versionId);
```

### Interest Rate

- Interface: `contracts/facets/interestRate/IInterestRate.sol`
- Resolver key: `RESOLVER_KEY_INTEREST_RATE` = `0xc09a5111a37fc8806e149b4a20c17a33a9487c6da8ee95f8a2b8ac31ea8dd2f3`

```solidity
function initializeInterestRateType(RateType rateType) external;
function setCouponRateType(RateType rateType) external;
function getCouponRateType() external view returns (RateType);
```

#### Events

```solidity
event CouponRateTypeSet(address indexed operator, RateType rateType);
event InterestRateTypeInitialized(RateType rateType);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidRateType(RateType rateType);
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
- Resolver key: `RESOLVER_KEY_KYC` = `0xf7fc316b28304fa0b62b8849c3c91a901e72894380ecf746c2bc13e5656549cd`

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
- Resolver key: `RESOLVER_KEY_LOCK` = `0xc2e37f639e1d61db1015540583b9d71f8a33da6410aed2826c6caef1304ebd3a`

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

### Lock At Snapshot

- Interface: `contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_LOCK_AT_SNAPSHOT` = `0x91e5d78963175418e7eb62ff74343d1349d9522d316525e922e145c770cc4d18`

```solidity
function initializeLockAtSnapshot() external;
function lockedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);
```

#### Events

```solidity
event LockAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Lock At Snapshot By Partition

- Interface: `contracts/facets/lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol`
- Resolver key: `RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION` = `0x7740456ff352a04830411a3fdc359bd086a5d78fd7119bbb62a53c62c1911691`

```solidity
function initializeLockAtSnapshotByPartition() external;
function lockedBalanceOfAtSnapshotByPartition(
  bytes32 _partition,
  uint256 _snapshotID,
  address _tokenHolder
) external view returns (uint256 balance_);
```

#### Events

```solidity
event LockAtSnapshotByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Lock By Partition

- Interface: `contracts/facets/lockByPartition/ILockByPartition.sol`
- Resolver key: `RESOLVER_KEY_LOCK_BY_PARTITION` = `0x75c5c6d6dd253e4be43d8d1c25a4252f5f54ebdba6f6c99ed34cd03c0e4d5360`

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

#### Events

```solidity
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
event LockByPartitionInitialized();
event LockByPartitionReleased(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 lockId
);
event LockedByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 lockId,
  uint256 amount,
  uint256 expirationTimestamp
);
event LockExpirationUpdated(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 lockId,
  uint256 oldExpirationTimestamp,
  uint256 newExpirationTimestamp
);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber);
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InvalidLockAmount();
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error LockExpirationNotReached();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WalletRecovered();
error WrongExpirationTimestamp();
error WrongLockId();
```

### Maturity

- Interface: `contracts/facets/maturity/IMaturity.sol`
- Resolver key: `RESOLVER_KEY_MATURITY` = `0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82`

```solidity
function initializeMaturity() external;
function fullRedeemAtMaturity(address _tokenHolder) external;
function updateMaturityDate(uint256 _newMaturityDate) external returns (bool success_);
```

#### Events

```solidity
event MaturityDateUpdated(address indexed bondId, uint256 indexed maturityDate, uint256 indexed previousMaturityDate);
event MaturityInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountIsBlocked(address account);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error BondMaturityDateWrong();
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidKycStatus();
error IsPaused();
error WalletRecovered();
error ZeroAddressNotAllowed();
```

### Maturity By Partition

- Interface: `contracts/facets/maturityByPartition/IMaturityByPartition.sol`
- Resolver key: `RESOLVER_KEY_MATURITY_BY_PARTITION` = `0x561e299af2bd67a767eee76558f27470801a9cb97627131141cc55ceb734ccbb`

```solidity
function initializeMaturityByPartition() external;
function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external;
```

#### Events

```solidity
event MaturityByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountIsBlocked(address account);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error BondMaturityDateWrong();
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidKycStatus();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error WalletRecovered();
error ZeroAddressNotAllowed();
```

### Mint

- Interface: `contracts/facets/mint/IMint.sol`
- Resolver key: `RESOLVER_KEY_MINT` = `0x394ec838636f78e91b7dbb3e4ea567e07bbb3886ab70a66652c40be856ab9b7a`

```solidity
function initializeERC1594() external;
function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;
function mint(address _to, uint256 _amount) external;
function isIssuable() external view returns (bool issuable_);
```

#### Events

```solidity
event ERC1594Initialized(bool indexed _initialized);
event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error MaxSupplyReached(uint256 maxSupply);
error NotAllowedInMultiPartitionMode();
error WalletRecovered();
```

### Mint By Partition

- Interface: `contracts/facets/mintByPartition/IMintByPartition.sol`
- Resolver key: `RESOLVER_KEY_MINT_BY_PARTITION` = `0x25ec74149ce0eadddeb82e668365e2e174db7431a04a80bada246f8f7887dadf`

```solidity
function initializeMintByPartition() external;
function issueByPartition(IERC1410Types.IssueData calldata _issueData) external;
```

#### Events

```solidity
event MintByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountHasNoRoles(address account, bytes32[] roles);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error MaxSupplyReached(uint256 maxSupply);
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error WalletRecovered();
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
- Resolver key: `RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT` = `0xca313777aee568dc14b1700e7be675b73932bbbc4e4f974a9f1321e6d653af74`

```solidity
function initializeNominalValueAtSnapshot() external;
function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_);
function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 nominalValueDecimals_);
```

#### Events

```solidity
event NominalValueAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Nonces

- Interface: `contracts/facets/nonces/INonces.sol`
- Resolver key: `RESOLVER_KEY_NONCES` = `0xd1166cb96f266d69db4d4e49d81acaf5441b16bb11681f2b1b53dcf7e1bd3bf4`

```solidity
function initializeNonces() external;
function nonces(address owner) external view returns (uint256);
```

#### Events

```solidity
event NoncesInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Operator

- Interface: `contracts/facets/operator/IOperator.sol`
- Resolver key: `RESOLVER_KEY_OPERATOR` = `0x5c2062c6ba02b76ae0c3884d5c0fdd3416b2012195a964efaa34e09b1fa31c95`

```solidity
function initializeOperator() external;
function authorizeOperator(address _operator) external;
function revokeOperator(address _operator) external;
function isOperator(address _operator, address _tokenHolder) external view returns (bool);
```

#### Events

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
event OperatorAuthorized(address indexed operator, address indexed tokenHolder);
event OperatorInitialized();
event OperatorRevoked(address indexed operator, address indexed tokenHolder);
event RevokedOperator(address indexed operator, address indexed tokenHolder);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
```

### Operator By Partition

- Interface: `contracts/facets/operatorByPartition/IOperatorByPartition.sol`
- Resolver key: `RESOLVER_KEY_OPERATOR_BY_PARTITION` = `0xfd060cda1c9927203f3914aa0d5916e4c5971977dec4026418bc4fff6d25b277`

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

#### Events

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event IssuedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed to,
  uint256 value,
  bytes data
);
event OperatorByPartitionInitialized();
event RedeemedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed from,
  uint256 value,
  bytes data,
  bytes operatorData
);
event RevokedOperator(address indexed operator, address indexed tokenHolder);
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error TokenHolderNotFound(address tokenHolder);
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error ZeroAddressNotAllowed();
error ZeroPartition();
error ZeroValue();
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
- Resolver key: `RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION` = `0xaad3c9e6cb80e4d01b9e5f316a82f495c3d11d36f8d738b0c2e4bce2d3f6c01c`

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

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event OperatorClearingByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION` = `0x2ac9004b9c057e04ee677ec0dda4bf57f4de5a2d382d97b9557aafb2600f257f`

```solidity
function initializeOperatorHoldByPartition() external;
function operatorCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _operatorData
) external returns (bool success_, uint256 holdId_);
```

#### Events

```solidity
event ControllerHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldFromByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HoldByPartitionExecuted(
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount,
  address to
);
event HoldByPartitionReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount
);
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount);
event OperatorHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event OperatorHoldByPartitionInitialized();
event ProtectedHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error HoldExpirationNotReached();
error HoldExpirationReached();
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidDestinationAddress(address holdDestination, address to);
error InvalidHoldAmount();
error IsNotEscrow();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error WalletRecovered();
error WrongExpirationTimestamp();
error WrongHoldId();
error ZeroAddressNotAllowed();
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

### Ownership

- Interface: `contracts/infrastructure/diamond/IOwnership.sol`

```solidity
function transferOwnership(bytes32 _configId, address _newOwner) external;
function acceptOwnership(bytes32 _configId) external;
function getOwner(bytes32 configId) external view returns (address owner_);
function getPendingOwner(bytes32 configId) external view returns (address pendingOwner_);
```

### Partitions

- Interface: `contracts/facets/partitions/IPartitions.sol`
- Resolver key: `RESOLVER_KEY_PARTITIONS` = `0x9caef059931effa6169ed564cfd0d8dac03be612be61f4fc934e8554cfe1c53f`

```solidity
function initializePartitions(bool _multiPartition) external;
function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);
function isMultiPartition() external view returns (bool);
```

#### Events

```solidity
event PartitionsInitialized(bool multiPartition);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Pause

- Interface: `contracts/facets/pause/IPause.sol`
- Resolver key: `RESOLVER_KEY_PAUSE` = `0x472ad8280a7d90bcd8b7876cad2cd5a4a2d31c116563ace7a685aff94eae8928`

```solidity
function initializePause() external;
function pause() external returns (bool success_);
function unpause() external returns (bool success_);
function paused() external view returns (bool);
```

#### Events

```solidity
event Paused(address indexed operator);
event PauseInitialized();
event Unpaused(address indexed operator);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error IsUnpaused();
```

### Principal

- Interface: `contracts/facets/principal/IPrincipal.sol`
- Resolver key: `RESOLVER_KEY_PRINCIPAL` = `0xa3dc20804ebd6f2a06a7e8b8de31712f3d18a73b1963acfa1d25ed86907bd0e6`

```solidity
function initializePrincipal() external;
function getPrincipalFor(address _account) external view returns (PrincipalFor memory principalFor_);
```

#### Events

```solidity
event PrincipalInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
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
- Resolver key: `RESOLVER_KEY_PROCEED_RECIPIENTS` = `0x63388aa198df5944c611b8fcbfd32945c57864f7125a5f95069040087d2b0bb7`

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

### Protected By Partition

- Interface: `contracts/facets/protectedByPartition/IProtectedByPartition.sol`
- Resolver key: `RESOLVER_KEY_PROTECTED_BY_PARTITION` = `0x2f9cd983bc92f917e9c55a3f61b8984646d96980224f4712084967ea1d24d62f`

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

#### Events

```solidity
event ProtectedByPartitionInitialized();
event ProtectedRedeemedByPartition(
  address indexed operator,
  address indexed from,
  uint256 amount,
  bytes32 partition,
  IProtectedPartitions.ProtectionData protectionData
);
event ProtectedTransferredByPartition(
  address indexed operator,
  address indexed from,
  address indexed to,
  uint256 amount,
  bytes32 partition,
  IProtectedPartitions.ProtectionData protectionData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error PartitionsAreUnProtected();
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
- Resolver key: `RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION` = `0x3cbb73b8ee5db791f9534af7a5c9fc09a4cf9adff327a05839f2673a3dc63aae`

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

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
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
event ProtectedClearingByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionsAreUnProtected();
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION` = `0xc28474cfcf6b32464e9000d064b91827c6c37fd3e06dae932c9447c204c35cc1`

```solidity
function initializeProtectedClearingHoldByPartition() external;
function protectedClearingCreateHoldByPartition(
  IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
  IHoldTypes.Hold calldata _hold,
  bytes calldata _signature
) external returns (bool success_, uint256 clearingId_);
```

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
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
event ProtectedClearingHoldByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionsAreUnProtected();
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION` = `0x5b77b995d3e53c3e46f114bbf37642ce3169369548c8135b8b11f5cebd3fb07b`

```solidity
function initializeProtectedHoldByPartition() external;
function protectedCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  IHoldTypes.ProtectedHold memory _protectedHold,
  bytes calldata _signature
) external returns (bool success_, uint256 holdId_);
```

#### Events

```solidity
event ControllerHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HeldFromByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event HoldByPartitionExecuted(
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount,
  address to
);
event HoldByPartitionReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 holdId,
  uint256 amount
);
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount);
event OperatorHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ProtectedHeldByPartition(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 partition,
  uint256 holdId,
  Hold hold,
  bytes operatorData
);
event ProtectedHoldByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error HoldExpirationNotReached();
error HoldExpirationReached();
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidDestinationAddress(address holdDestination, address to);
error InvalidHoldAmount();
error IsNotEscrow();
error IsPaused();
error PartitionsAreUnProtected();
error WalletRecovered();
error WrongExpirationTimestamp();
error WrongHoldId();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_RECOVERY` = `0x087cb866f812745e77608e4eb4b359ae96b8a0ba2ef9fe8336488e479b72d92a`

```solidity
function initializeRecovery() external;
function recoveryAddress(
  address _lostWallet,
  address _newWallet,
  address _investorOnchainID
) external returns (bool success_);
function isAddressRecovered(address _wallet) external view returns (bool);
```

#### Events

```solidity
event AgentAdded(address indexed _agent);
event AgentRemoved(address indexed _agent);
event ComplianceAdded(address indexed compliance);
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
event IdentityRegistryAdded(address indexed identityRegistry);
event RecoveryInitialized();
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
event UpdatedTokenInformation(
  string indexed newName,
  string indexed newSymbol,
  uint8 newDecimals,
  string newVersion,
  address indexed newOnchainID
);
```

#### Errors

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber);
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AddressNotVerified();
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CannotRecoverWallet();
error ComplianceCallFailed();
error ComplianceNotAllowed();
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IdentityRegistryCallFailed();
error InputAmountsArrayLengthMismatch();
error InputBoolArrayLengthMismatch();
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition);
error InvalidFreezeAmount();
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error TokenHolderNotFound(address tokenHolder);
error UnexpectedError(bytes4 _errorId);
error WalletRecovered();
```

### Revocation List

- Interface: `contracts/facets/kyc/IRevocationList.sol`

```solidity
function revoked(address, string calldata) external view returns (bool);
```

### Scheduled Balance Adjustment

- Interface: `contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol`
- Resolver key: `RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT` = `0x90c7d769d18188f75b1092289e2465103d06f9c1195bf0ee4b2cf0844a5d6c96`

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

#### Events

```solidity
event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);
event ScheduledBalanceAdjustmentForceCancelled(uint256 balanceAdjustmentId, address indexed operator);
event ScheduledBalanceAdjustmentInitialized();
event ScheduledBalanceAdjustmentSet(
  bytes32 corporateActionId,
  uint256 balanceAdjustmentId,
  address indexed operator,
  uint256 indexed executionDate,
  uint256 factor,
  uint256 decimals
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);
error BalanceAdjustmentCreationFailed();
error Deactivated();
error DecimalsOverflow();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error FactorIsZero();
error FactorOverflow();
error InvalidTimestamp();
error IsPaused();
error TotalSupplyOverflow();
error UnexpectedError(bytes4 _errorId);
error WrongIndexForAction(uint256 index, bytes32 actionType);
error ZeroValueNotAllowed();
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
- Resolver key: `RESOLVER_KEY_SECURITYHOLDERS` = `0x744edd4f33c7d5e322286e40155d549553e22329ac9503643bf36fc149504bc9`

```solidity
function initializeSecurityHolders() external;
function getSecurityHolders(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] memory holders);
function getTotalSecurityHolders() external view returns (uint256 count);
```

#### Events

```solidity
event SecurityHoldersInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Security Holders At Snapshot

- Interface: `contracts/facets/securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol`
- Resolver key: `RESOLVER_KEY_SECURITY_HOLDERS_AT_SNAPSHOT` = `0xf7707140407ccf0d6deaf72844217e3c1383270609a7a75e36def71a3c453b9e`

```solidity
function initializeSecurityHoldersAtSnapshot() external;
function getTokenHoldersAtSnapshot(
  uint256 _snapshotID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256);
```

#### Events

```solidity
event SecurityHoldersAtSnapshotInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### Snapshots

- Interface: `contracts/facets/snapshot/ISnapshots.sol`
- Resolver key: `RESOLVER_KEY_SNAPSHOTS` = `0xbc4e3ace00cf7d347ee7bf90737d3091c02f7d6607c195bf0d4b81e33644f0e1`

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
- Resolver key: `RESOLVER_KEY_SNAPSHOTS_BY_PARTITION` = `0x37c825560f21710d66419d4eefeb45ae2dadf078b1db5593749d24a7d38465ee`

```solidity
function initializeSnapshotsByPartition() external;
function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[] memory);
```

#### Events

```solidity
event SnapshotsByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
```

### SSI Management

- Interface: `contracts/facets/ssiManagement/ISsiManagement.sol`
- Resolver key: `RESOLVER_KEY_SSI_MANAGEMENT` = `0xba7dfd151d5ed77cbbf8b00c124c67331edf1e6959e7c0129dc73ee72a9c0016`

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

#### Events

```solidity
event AddedToIssuerList(address indexed operator, address indexed issuer);
event RemovedFromIssuerList(address indexed operator, address indexed issuer);
event RevocationRegistryUpdated(address indexed oldRegistryAddress, address indexed newRegistryAddress);
event SsiManagementInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AccountIsNotIssuer(address issuer);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error ListedIssuer(address issuer);
error UnlistedIssuer(address issuer);
error ZeroAddressNotAllowed();
```

### Static Function Selectors

- Interface: `contracts/infrastructure/proxy/IStaticFunctionSelectors.sol`

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_);
function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_);
function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_);
```

### Transfer

- Interface: `contracts/facets/transfer/ITransfer.sol`
- Resolver key: `RESOLVER_KEY_TRANSFER` = `0xdb0637d5ac2d3a8a460b63275e82a566d4b5ac4b9d2d2938f70c6612970a4b64`

```solidity
function initializeTransfer() external;
function transfer(address to, uint256 amount) external returns (bool);
function transferFrom(address from, address to, uint256 amount) external returns (bool);
function transferWithData(address _to, uint256 _value, bytes calldata _data) external;
function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;
```

#### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferFromWithData(
  address indexed sender,
  address indexed from,
  address indexed to,
  uint256 amount,
  bytes data
);
event TransferInitialized();
event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error IsPaused();
error NotAllowedInMultiPartitionMode();
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error WalletRecovered();
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
- Resolver key: `RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION` = `0xb5ec128e8657ab00db44aa63e5aeded6689b18978072102b9ccb7788faf87a6e`

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

#### Events

```solidity
event PartitionTransferredAndLocked(
  bytes32 indexed partition,
  address indexed from,
  address to,
  uint256 value,
  bytes data,
  uint256 expirationTimestamp,
  uint256 lockId
);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferAndLockByPartitionInitialized();
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InvalidLockAmount();
error InvalidPartition(address account, bytes32 partition);
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error WrongExpirationTimestamp();
```

### Transfer By Partition

- Interface: `contracts/facets/transferByPartition/ITransferByPartition.sol`
- Resolver key: `RESOLVER_KEY_TRANSFER_BY_PARTITION` = `0xfb16c0ead8e476dfd6f2201a386b6a761b76e01aa6e21786c2d90f10036197d9`

```solidity
function initializeTransferByPartition() external;
function transferByPartition(
  bytes32 _partition,
  BasicTransferInfo calldata _basicTransferInfo,
  bytes memory _data
) external returns (bytes32);
```

#### Events

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event IssuedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed to,
  uint256 value,
  bytes data
);
event RedeemedByPartition(
  bytes32 indexed partition,
  address indexed operator,
  address indexed from,
  uint256 value,
  bytes data,
  bytes operatorData
);
event RevokedOperator(address indexed operator, address indexed tokenHolder);
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
event TransferByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidPartition(address account, bytes32 partition);
error NotAllowedInMultiPartitionMode();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error TokenHolderNotFound(address tokenHolder);
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error ZeroPartition();
error ZeroValue();
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
- Resolver key: `RESOLVER_KEY_VOTING` = `0x88b1621426a5ad16c2399cdc8a04b7da54bf8ddf04c60aeb2fe17ad903891b58`

```solidity
function initializeVoting() external;
function setVoting(Voting calldata _newVoting) external returns (uint256 voteID_);
function cancelVoting(uint256 _voteId) external returns (bool success_);
function forceCancelVoting(uint256 _voteId) external returns (bool success_);
function getVoting(uint256 _voteID) external view returns (RegisteredVoting memory registeredVoting_, bool isDisabled_);
function getVotingFor(uint256 _voteID, address _account) external view returns (VotingFor memory votingFor_);
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
- Resolver key: `RESOLVER_KEY_VOTING_SECURITY_HOLDERS` = `0xff4e971334f234a2d839b58b2fef84241254942cef8940a4457d1eecb63882b9`

```solidity
function initializeVotingSecurityHolders() external;
function getVotingHolders(
  uint256 _voteID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_);
function getTotalVotingHolders(uint256 _voteID) external view returns (uint256 totalHolders_);
```

#### Events

```solidity
event VotingSecurityHoldersInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
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
- Resolver key: `RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION` = `0xab5e4afdccea84152256072fb9f39bf08d591a7666557783209dff003658d945`

```solidity
function initializeOperatorClearingHoldByPartition() external;
function operatorClearingCreateHoldByPartition(
  IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
  IHoldTypes.Hold calldata _hold
) external returns (bool success_, uint256 clearingId_);
```

#### Events

```solidity
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
event ClearingActivated(address indexed operator);
event ClearingDeactivated(address indexed operator);
event ClearingOperationApproved(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType,
  bytes operationData
);
event ClearingOperationCanceled(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event ClearingOperationReclaimed(
  address indexed operator,
  address indexed tokenHolder,
  bytes32 indexed partition,
  uint256 clearingId,
  ClearingOperationType clearingOperationType
);
event OperatorClearingHoldByPartitionInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error ClearingIsActivated();
error ClearingIsDisabled();
error Deactivated();
error ExpirationDateNotReached();
error ExpirationDateReached();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidClearingAmount();
error IsPaused();
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error Unauthorized(address operator, address tokenHolder, bytes32 partition);
error WalletRecovered();
error WrongClearingId();
error WrongExpirationTimestamp();
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_PROTECTED_PARTITIONS` = `0x895834530eae98f8a742fe98f3d528d3cce6c6a51af63b495414bdf391180dd7`

```solidity
function initializeProtectedPartitions(bool _arePartitionsProtected) external returns (bool success_);
function protectPartitions() external returns (bool success_);
function unprotectPartitions() external returns (bool success_);
function arePartitionsProtected() external view returns (bool);
function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_);
```

#### Events

```solidity
event PartitionsProtected(address indexed operator);
event PartitionsUnProtected(address indexed operator);
event ProtectedPartitionsInitialized(bool arePartitionsProtected);
event ProtectedRedeemFrom(
  bytes32 indexed partition,
  address indexed operator,
  address indexed from,
  uint256 value,
  uint256 deadline,
  uint256 nonce,
  bytes signature
);
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
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error PartitionsAreProtected();
error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
error PartitionsAreUnProtected();
```

<!-- layer_2 -->

### Amortization

- Interface: `contracts/facets/layer_2/amortization/IAmortization.sol`
- Resolver key: `RESOLVER_KEY_AMORTIZATION` = `0xc0d83d8b9295f78954b1c7c9648bec9775edf597a57f9f4110883e9ca2134739`

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

#### Events

```solidity
event AmortizationCancelled(uint256 amortizationId, address indexed operator);
event AmortizationForceCancelled(uint256 amortizationId, address indexed operator);
event AmortizationHoldReleased(
  bytes32 indexed corporateActionId,
  uint256 indexed amortizationID,
  address indexed tokenHolder,
  uint256 holdId
);
event AmortizationHoldSet(
  bytes32 indexed corporateActionId,
  uint256 indexed amortizationID,
  address indexed tokenHolder,
  uint256 holdId,
  uint256 tokenAmount
);
event AmortizationInitialized();
event AmortizationSet(
  bytes32 corporateActionId,
  uint256 amortizationId,
  address indexed operator,
  uint256 recordDate,
  uint256 executionDate
);
event Approval(address indexed owner, address indexed spender, uint256 value);
event Transfer(address indexed from, address indexed to, uint256 value);
event TransferByPartition(
  bytes32 indexed _fromPartition,
  address _operator,
  address indexed _from,
  address indexed _to,
  uint256 _value,
  bytes _data,
  bytes _operatorData
);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AmortizationAlreadyExecuted(bytes32 corporateActionId, uint256 amortizationId);
error AmortizationCreationFailed();
error AmortizationHasActiveHolds(bytes32 corporateActionId, uint256 amortizationID);
error AmortizationHoldFailed(bytes32 corporateActionId, uint256 amortizationID);
error AmortizationHoldNotActive(bytes32 corporateActionId, uint256 amortizationID, address tokenHolder);
error AmortizationNotActive(bytes32 corporateActionId, uint256 amortizationID);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition, bool singlePartitionMode);
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
error InvalidAmortizationHoldAmount(uint256 amortizationID);
error InvalidHoldAmount();
error InvalidPartition(address account, bytes32 partition);
error InvalidTimestamp();
error IsPaused();
error NotAllowedInMultiPartitionMode();
error SnapshotIdDoesNotExists(uint256 snapshotId);
error SnapshotIdNull();
error UnexpectedError(bytes4 _errorId);
error WrongDates(uint256 firstDate, uint256 secondDate);
error WrongIndexForAction(uint256 index, bytes32 actionType);
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
function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);
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
- Resolver key: `RESOLVER_KEY_FIXED_RATE` = `0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521`

```solidity
function initializeFixedRate(FixedRateData calldata _initData) external;
function setRate(uint256 _newRate, uint8 _newRateDecimals) external;
function getRate() external view returns (uint256 rate_, uint8 decimals_);
```

#### Events

```solidity
event FixedRateInitialized(FixedRateData initData);
event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InterestRateIsFixed();
error IsPaused();
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
- Resolver key: `RESOLVER_KEY_KPI_LINKED_RATE` = `0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593`

```solidity
function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;
function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;
function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;
function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);
function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
```

#### Events

```solidity
event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);
event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
event KpiLinkedRateInitialized(InterestRate interestRate, ImpactData impactData);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
error WrongImpactDataValues(ImpactData impactData);
error WrongInterestRateValues(InterestRate interestRate);
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
- Resolver key: `RESOLVER_KEY_KPIS` = `0xc0b75e6f4facfa630926f9653b857eeb3547c604941b210701f53f3b17521743`

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

#### Events

```solidity
event KpiDataAdded(address indexed project, uint256 date, uint256 value);
event KpisInitialized();
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error CouponNotFound(uint256 couponID);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate);
error InvalidDateRange(uint256 fromDate, uint256 toDate);
error IsPaused();
error KpiDataAlreadyExists(uint256 date);
error UnexpectedError(bytes4 _errorId);
```

### Loan

- Interface: `contracts/facets/layer_2/loan/ILoan.sol`
- Resolver key: `RESOLVER_KEY_LOAN` = `0x17c2126e932655e91a8e803b275de0a930c4b51a109b751567a95ee5d6bd6eba`

```solidity
function initializeLoan(LoanDetailsData calldata _loanDetailsData) external;
function setLoanDetails(LoanDetailsData calldata loanDetailsData_) external;
function getLoanDetails() external view returns (LoanDetailsData memory loanDetailsData_);
```

#### Events

```solidity
event LoanDetailsSet(LoanDetailsData loanDetails);
event LoanInitialized(LoanDetailsData loanDetailsData);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error InvalidTimestamp();
error IsPaused();
error WrongDates(uint256 firstDate, uint256 secondDate);
error ZeroAddressNotAllowed();
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
- Resolver key: `RESOLVER_KEY_LOANS_PORTFOLIO` = `0x3f6ea14bbeaea82befb49409b874caf151715c6619ac1d26ba858039b7ece33e`

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

#### Events

```solidity
event HoldingsAssetAdded(HoldingsAsset holdingsAsset);
event HoldingsAssetRemoved(HoldingsAsset holdingsAsset);
event LoanHoldingsAssetUpdated(address loanHoldingsAsset);
event LoansPortfolioInitialized(LoansPortfolioDetailsData loansPortfolioData);
event LoansPortfolioWithdrawn(address assetAddress, address to, uint256 amount);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error HoldingAssetNotFound(address assetAddress);
error HoldingsAssetAlreadyExists(address assetAddress);
error HoldingsAssetTypeNotSupported(uint8 holdingsAssetType);
error IsPaused();
error ZeroAddressNotAllowed();
error ZeroValue();
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
- Resolver key: `RESOLVER_KEY_NOMINAL_VALUE` = `0xfa54bc09a6a76763f17be0504e29b9c28edd15cdc3432c07f92c2b6962f2fbbe`

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

#### Events

```solidity
event NominalValueCurrencySet(address indexed operator, bytes3 nominalValueCurrency);
event NominalValueInitialized(uint256 nominalValue, uint8 nominalValueDecimals, bytes3 nominalValueCurrency);
event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
```

### Scheduled Cross Ordered Tasks

- Interface: `contracts/facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol`
- Resolver key: `RESOLVER_KEY_SCHEDULED_TASKS` = `0x53ea769a267213f8e35c975a0dba3d7d8d73163d53f804c2ac6ea37d6c47c082`

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

#### Events

```solidity
event ScheduledCrossOrderedTasksInitialized();
event TaskExecutionFailed(bytes32 indexed actionId, bytes32 indexed taskType, uint256 scheduledTimestamp);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error AssetNotOperational(bytes32 configId, uint256 versionId);
error Deactivated();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
error IsPaused();
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
- Resolver key: `RESOLVER_KEY_SECURITY` = `0x4a0ea8dcc902efa355c705fe7211cb0da08f05ad9fc8888237dd67a8c4dc6f1a`

```solidity
function initializeSecurity(
  RegulationData memory _regulationData,
  AdditionalSecurityData calldata _additionalSecurityData
) external;
function getSecurityRegulationData() external view returns (SecurityRegulationData memory securityRegulationData_);
```

#### Events

```solidity
event SecurityInitialized(RegulationData regulationData, AdditionalSecurityData additionalSecurityData);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
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
- Resolver key: `RESOLVER_KEY_BOND_VARIABLE_RATE` = `0xbc8b53a2f8803b138aac441fbeb6b767a51b66a5f4d735c3d15af67cc72b9daa`

```solidity
function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
```

#### Events

```solidity
event BondUSAInitialized(IBondTypes.BondDetailsData bondDetailsData);
event MaturityDateUpdated(address indexed bondId, uint256 indexed maturityDate, uint256 indexed previousMaturityDate);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error BondMaturityDateWrong();
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
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
- Resolver key: `RESOLVER_KEY_EQUITY` = `0x32d1b4f5d593b1e786f1c491656e2db7e35a80754244b3c5e787a03db7fcef31`

```solidity
function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
```

#### Events

```solidity
event EquityUSAInitialized(EquityDetailsData equityDetailsData);
```

#### Errors

```solidity
error AccessControlRequired(bytes32 role, address sender);
error AccountHasNoRole(address account, bytes32 role);
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
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

## Roles

| Role                                    | Value                                                                |
| --------------------------------------- | -------------------------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`                    | `0x00`                                                               |
| `ROLE_ADJUSTMENT_BALANCE`               | `0xb246506a8ded65dd6360e8ce033fd9462936d1be64fb9f85c5f60d28cd3ca6da` |
| `ROLE_AGENT`                            | `0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b` |
| `ROLE_AMORTIZATION`                     | `0x0c8c9cf3db23765397bf525e10c9158fd2a7b58b280d5da82a642247779ae3c1` |
| `ROLE_BOND_MANAGER`                     | `0x68fe577385095e80beadf873ac12a3100f9a9d1b6d40f0d123eecf3d01bf5c49` |
| `ROLE_CAP`                              | `0x58d502b7184e1a264e0cacf1a19a6c268356c6d9fda5ad83ab3b599cd3b7f41c` |
| `ROLE_CLEARING`                         | `0xd0fe259e861ec493f60fb83851f1a173155b0f2acc3da153de2a23fb0ad26db6` |
| `ROLE_CLEARING_VALIDATOR`               | `0xa24ef577c383d98a9326f932c69c76129dd89a71abcb626993d9f047f4e74abb` |
| `ROLE_CONTROL_LIST`                     | `0x6ed9a91e996c6475ecdc28ecbdbe9bd1122fc62b30cdbe6da8271884b51ec74d` |
| `ROLE_CONTROL_LIST_MANAGER`             | `0xccf29bda8369877bcc921e38f30df86156a571ca5c5b8e777bf7ff75270313ea` |
| `ROLE_CONTROLLER`                       | `0xb4d2b850c3ed8a234d390d5c157bbb1824883213c335ffe2a0f0761bb168713e` |
| `ROLE_CORPORATE_ACTION`                 | `0xa1acfc499025c99f55059195e6276f639d34a18aad7b8121b9192b7f438c55cd` |
| `ROLE_CORPORATE_ACTION_FORCE_CANCEL`    | `0x34c18461eba17dd4b2a410f90e80f2a3d6e466af7753bf1b9519c24697c199f5` |
| `ROLE_CUSTOM_DATA_MANAGER`              | `0x0b348f171b6004b74a59b08b77c142a65c416e0e20c855602b8b2510951101b0` |
| `ROLE_DOCUMENTER`                       | `0xb7b1452b94e2932605f7ad2a3ceba0bafd68db64704c9bd667f27163c57ca319` |
| `ROLE_FREEZE_MANAGER`                   | `0x71ae38482e1ab1c28e767d64766d686215b490c8c1bd7dfe6b101525187c2155` |
| `ROLE_INTEREST_RATE_MANAGER`            | `0xfa80c71f8de1628faf2c0e9bd02c2f4a3da1f16823b75e61e84b90164a07b4a4` |
| `ROLE_INTERNAL_KYC_MANAGER`             | `0xdd78fdcd1b38a5360405cef8d91e758ad0f42bf2ced681b803b3c2704b0a32a7` |
| `ROLE_ISSUER`                           | `0x5eeaf5602c75bf26e73b5206d0bd6ee82f621166255e5fd73cc06bc7bd84a95f` |
| `ROLE_KPI_MANAGER`                      | `0x7895574f0552ac1a42245f5d7ea23bea04d0cfbc73df53282d588fdaa00f7fb3` |
| `ROLE_KYC`                              | `0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc` |
| `ROLE_KYC_MANAGER`                      | `0xec811504e835acf29535b5b62307b08000468f0c61ca6163ed6f17a03629b91e` |
| `ROLE_LOAN_MANAGER`                     | `0xcfd49258c7f1641d56add8e8efadca919969eb6aab447ec47f2ed34c8492547a` |
| `ROLE_LOANS_PORTFOLIO_MANAGER`          | `0x90f7adc9b7132ce9c095619ba3e77e8505f2824b906ee99892386b8349a016c6` |
| `ROLE_LOCKER`                           | `0xd327cd9a2be405896f3d4584b3b437d798833cc4aa0aafb34c870659c0d47184` |
| `ROLE_MATURITY_REDEEMER`                | `0x433f48f8aca23480f6ab07666cbc9131d32a0b4672033453f65e18f4dd390523` |
| `ROLE_NOMINAL_VALUE`                    | `0xebf9ab6852aef7bc1e4068a64bd360845c54d5d95d4fed9fd47c52bbe7c15b8b` |
| `ROLE_PAUSE_MANAGER`                    | `0x03e7c996eea5565d823330975718325a2eccfaf55d5ec99de9a1d9d7253c318e` |
| `ROLE_PAUSER`                           | `0x3cb8b459fdb6e7dc3d2a2aa529e530f885d45e03584adb438423209c86a2731f` |
| `ROLE_PROCEED_RECIPIENT_MANAGER`        | `0x29baa8e752c40494481d6b4caa718d054ad999653716d39b1aa896387c68ae78` |
| `ROLE_PROTECTED_PARTITIONS`             | `0x2d40a5b0ae1bfaa74e8787cae4b47373670a5b71b3e6031c4d849ed22e376bfd` |
| `ROLE_PROTECTED_PARTITIONS_PARTICIPANT` | `0xda17771b6b3d06197fabbe8db1d7586004df4869992b9c7c7fccec5f36dcf604` |
| `ROLE_SNAPSHOT`                         | `0xf7d999723d2160432933a2aeffaae83e262a5a46fe94f34614a7676d1d1f67c6` |
| `ROLE_SSI_MANAGER`                      | `0x3120494a82251fe85b0403877539486dbfcf0f94c20741a3229cfad31f625ee1` |
| `ROLE_TEST`                             | `0xfeaed73e170ec58f466ed6f2a248ee2a1061283a356297049930608aa72d3e9d` |
| `ROLE_TREX_OWNER`                       | `0xd9e1264632ee9a37e8673a0c55a0a1d8b38c758e843084168ee08cd2d1f7e6f0` |
| `ROLE_WILD_CARD`                        | `0x309337df95ff8f6d0075117d46b40fd103d8ae87db1914f1c60acb63487fb157` |
