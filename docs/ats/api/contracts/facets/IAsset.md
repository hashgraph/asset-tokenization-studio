# IAsset

_Asset Tokenization Studio Team_

> IAsset

Aggregated interface exposing every facet selector of the ATS Diamond through a single typed handle.

_Intended for use in tests and external tooling to interact with all Diamond methods through a single typed object, rather than multiple per-facet instances. Note: IHold already transitively includes IAccessControl, IHoldRead, and IHoldTokenHolder. IERC3643 surfaces the shared ERC-3643 types, events and errors (IERC3643Types). IERC20Votes includes IERC5805 and IVotes. Solidity C3 linearisation handles the resulting diamond inheritance without conflicts. Note: IKpiLinkedRate is intentionally excluded due to an irreconcilable function selector conflict on getInterestRate(). Consumers that need the KPI-linked rate surface must use that typed interface directly._

## Methods

### CLOCK_MODE

```solidity
function CLOCK_MODE() external view returns (string)
```

_Description of the clock_

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_)
```

Returns the EIP-712 domain separator for this contract.

_Computed from the token name, resolver-proxy version, chain ID, and the diamond address. The value changes when any of those inputs change (e.g. after a chain fork or a proxy version upgrade)._

#### Returns

| Name              | Type    | Description                        |
| ----------------- | ------- | ---------------------------------- |
| domainSeparator\_ | bytes32 | The EIP-712 domain separator hash. |

### actionContentHashExists

```solidity
function actionContentHashExists(bytes32 _contentHash) external view returns (bool)
```

Checks whether a content hash derived from an action type and payload already exists.

_The content hash is `keccak256(abi.encode(actionType, data))`. Callers can use this to detect duplicate corporate actions before submitting a registration._

#### Parameters

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| \_contentHash | bytes32 | The pre-computed content hash to look up. |

#### Returns

| Name | Type | Description                                                                                     |
| ---- | ---- | ----------------------------------------------------------------------------------------------- |
| \_0  | bool | True if a corporate action with this content hash has already been registered, false otherwise. |

### activateClearing

```solidity
function activateClearing() external nonpayable returns (bool success_)
```

Activates the clearing functionality

#### Returns

| Name      | Type | Description                                     |
| --------- | ---- | ----------------------------------------------- |
| success\_ | bool | True when the activation completes successfully |

### activateInternalKyc

```solidity
function activateInternalKyc() external nonpayable returns (bool success_)
```

Activates internal KYC enforcement for the token.

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True when the call succeeds without reverting. |

### addAgent

```solidity
function addAgent(address _agent) external nonpayable
```

Gives an account the agent role.Granting an agent role allows the account to perform multiple ERC-1400 actions.

_Can only be called by the role admin._

#### Parameters

| Name    | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| \_agent | address | Address to be granted the agent role. |

### addExternalControlList

```solidity
function addExternalControlList(address _controlList) external nonpayable returns (bool success_)
```

Adds an external control list contract to the list.

_Requires `ROLE_CONTROL_LIST_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedControlList` if the address is already listed. Emits `AddedToExternalControlLists`._

#### Parameters

| Name          | Type    | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| \_controlList | address | Address of the external control list contract to add. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### addExternalKycList

```solidity
function addExternalKycList(address _kycList) external nonpayable returns (bool success_)
```

Adds an external KYC list contract to the list.

_Requires `ROLE_KYC_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedKycList` if the address is already listed. Emits `AddedToExternalKycLists`._

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| \_kycList | address | Address of the external KYC list contract to add. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### addExternalPause

```solidity
function addExternalPause(address _pause) external nonpayable returns (bool success_)
```

Adds an external pause contract to the list.

_Requires `ROLE_PAUSE_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedPause` if the address is already listed. Emits `AddedToExternalPauses`._

#### Parameters

| Name    | Type    | Description                                    |
| ------- | ------- | ---------------------------------------------- |
| \_pause | address | Address of the external pause contract to add. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### addHoldingsAsset

```solidity
function addHoldingsAsset(ILoansPortfolio.HoldingsAsset _holdingsAsset) external nonpayable returns (bool success_)
```

#### Parameters

| Name            | Type                          | Description |
| --------------- | ----------------------------- | ----------- |
| \_holdingsAsset | ILoansPortfolio.HoldingsAsset | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### addIssuer

```solidity
function addIssuer(address _issuer) external nonpayable returns (bool success_)
```

Adds an address to the trusted issuer list.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Reverts with `ListedIssuer` if the address is already listed, or with `ZeroAddressNotAllowed` if the address is zero. Emits `AddedToIssuerList`._

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| \_issuer | address | Address of the issuer to add. |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the issuer was added successfully. |

### addKpiData

```solidity
function addKpiData(uint256 _date, uint256 _value, address _project) external nonpayable
```

Records a KPI data point for `_project` at `_date`.

_Reverts with `InvalidDate` if `_date` is outside the allowed window, or with `KpiDataAlreadyExists` if a value has already been recorded for this (project, date) pair._

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| \_date    | uint256 | Unix timestamp for the data point.                |
| \_value   | uint256 | KPI value to record.                              |
| \_project | address | Address of the project the data point belongs to. |

### addProceedRecipient

```solidity
function addProceedRecipient(address _proceedRecipient, bytes _data) external nonpayable
```

Registers a new proceed recipient on the token.

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| \_proceedRecipient | address | Address to add as a proceed recipient.              |
| \_data             | bytes   | Arbitrary data to associate with the new recipient. |

### addToControlList

```solidity
function addToControlList(address _account) external nonpayable returns (bool success_)
```

Adds an address to the control list.

_Requires `ROLE_CONTROL_LIST` and the token to be unpaused. Reverts with `ListedAccount` if the address is already present. Emits `AddedToControlList`._

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_account | address | The address to add. |

#### Returns

| Name      | Type | Description                                 |
| --------- | ---- | ------------------------------------------- |
| success\_ | bool | True if the address was successfully added. |

### adjustBalances

```solidity
function adjustBalances(uint256 _factor, uint8 _decimals) external nonpayable returns (bool success_)
```

Applies a balance adjustment to all token holders immediately.

_Caller must hold `ROLE_ADJUSTMENT_BALANCE`. The token must not be paused and `factor` must be non-zero. Pending scheduled tasks at index 0 are triggered before the adjustment is applied, ensuring consistent ordering._

#### Parameters

| Name       | Type    | Description                                                          |
| ---------- | ------- | -------------------------------------------------------------------- |
| \_factor   | uint256 | Numerator of the multiplier; effective ratio = factor / 10^decimals. |
| \_decimals | uint8   | Denominator exponent.                                                |

#### Returns

| Name      | Type | Description                                           |
| --------- | ---- | ----------------------------------------------------- |
| success\_ | bool | True if the adjustment was applied without reverting. |

### allowance

```solidity
function allowance(address _owner, address _spender) external view returns (uint256)
```

Returns the remaining amount `spender` may spend on behalf of `owner` via a downstream `transferFrom`-style call.

_Zero by default. Updated by {approve}, {increaseAllowance}, {decreaseAllowance} and by any consuming transfer operation. The returned value is time-travel adjusted at the current block timestamp on the implementing facet._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| \_owner   | address | Address that granted the allowance.                  |
| \_spender | address | Address authorised to spend on `owner`&#39;s behalf. |

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | Remaining allowance of `spender` over `owner`&#39;s tokens. |

### applyRoles

```solidity
function applyRoles(bytes32[] _roles, bool[] _actives, address _account) external nonpayable
```

Applies multiple role grants or revocations to an account in a single transaction.

_The caller must hold the admin role for each role in `_roles` (checked per entry in the storage layer). `_roles` and `_actives` must have equal length and contain no duplicate role entries. Grant entries where the account already holds the role and revoke entries where it does not are silently skipped. Emits `RolesApplied` with the subset that effectively changed state._

#### Parameters

| Name      | Type      | Description                                                      |
| --------- | --------- | ---------------------------------------------------------------- |
| \_roles   | bytes32[] | Array of role identifiers to process.                            |
| \_actives | bool[]    | Corresponding flags; `true` grants the role, `false` revokes it. |
| \_account | address   | The account to which roles are applied.                          |

### approve

```solidity
function approve(address _spender, uint256 _value) external nonpayable returns (bool)
```

Sets `value` as the allowance of `spender` over the caller&#39;s tokens.

_Overwrites any previously-granted allowance. Known race: moving a non-zero allowance directly to another non-zero value lets `spender` spend both the old and the new amount via unfortunate transaction ordering — see EIP-20 discussion https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729. Prefer {increaseAllowance}/{decreaseAllowance}, or reset to zero before setting a new value. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name      | Type    | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| \_spender | address | Address authorised to spend on the caller&#39;s behalf. |
| \_value   | uint256 | Absolute allowance amount to grant.                     |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### approveClearingOperationByPartition

```solidity
function approveClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_, bytes32 partition_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| success\_   | bool    | undefined   |
| partition\_ | bytes32 | undefined   |

### arePartitionsProtected

```solidity
function arePartitionsProtected() external view returns (bool)
```

Returns whether the protected partitions mode is active

_If true, transfers are restricted to accounts having the required role for the partition_

#### Returns

| Name | Type | Description                                                           |
| ---- | ---- | --------------------------------------------------------------------- |
| \_0  | bool | bool true if the protected partitions mode is active, false otherwise |

### authorizeOperator

```solidity
function authorizeOperator(address _operator) external nonpayable
```

Authorises an operator for all partitions of `msg.sender`

#### Parameters

| Name       | Type    | Description                          |
| ---------- | ------- | ------------------------------------ |
| \_operator | address | An address which is being authorised |

### authorizeOperatorByPartition

```solidity
function authorizeOperatorByPartition(bytes32 _partition, address _operator) external nonpayable
```

Authorises an operator to manage a specific partition of `msg.sender`&#39;s tokens.

_The token must not be paused. Both `msg.sender` and `_operator` must pass compliance checks. Reverts when the partition is incompatible with the token&#39;s partition mode (single-partition tokens only accept the default partition). Emits {AuthorizedOperatorByPartition} via `ERC1410StorageWrapper.authorizeOperatorByPartition`._

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| \_partition | bytes32 | The partition the operator is authorised for. |
| \_operator  | address | The address being authorised as operator.     |

### balanceOf

```solidity
function balanceOf(address _tokenHolder) external view returns (uint256)
```

Returns the total token balance of a token holder across all partitions, including locked and held amounts, simulating non-triggered balance adjustments up to the current timestamp.

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| \_0  | uint256 | The adjusted total balance |

### balanceOfAt

```solidity
function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Returns the total token balance of a token holder at a given timestamp, simulating non-triggered balance adjustments up to that point in time.

#### Parameters

| Name          | Type    | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| \_tokenHolder | address | The address of the token holder.                      |
| \_timestamp   | uint256 | The Unix timestamp at which the balance is evaluated. |

#### Returns

| Name | Type    | Description                                                     |
| ---- | ------- | --------------------------------------------------------------- |
| \_0  | uint256 | The adjusted total balance of the token holder at `_timestamp`. |

### balanceOfAtSnapshot

```solidity
function balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the balance of a token holder at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                              |
| --------- | ------- | -------------------------------------------------------- |
| balance\_ | uint256 | The balance of `_tokenHolder` recorded at `_snapshotID`. |

### balanceOfAtSnapshotByPartition

```solidity
function balanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the balance of an account for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                              |
| --------- | ------- | ------------------------------------------------------------------------ |
| balance\_ | uint256 | The balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### balanceOfByPartition

```solidity
function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256)
```

Returns the token balance of a holder within a specific partition, simulating non-triggered balance adjustments up to the current timestamp.

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_partition   | bytes32 | The partition identifier        |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| \_0  | uint256 | The adjusted balance of the token holder in the partition |

### balancesOfAtSnapshot

```solidity
function balancesOfAtSnapshot(uint256 _snapshotID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct HolderBalance[] balances_)
```

Returns a paginated `HolderBalance` array with account and balance at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_pageIndex  | uint256 | Zero-based page index used to slice the holder set.              |
| \_pageLength | uint256 | Maximum number of entries returned in the page.                  |

#### Returns

| Name       | Type            | Description                                                      |
| ---------- | --------------- | ---------------------------------------------------------------- |
| balances\_ | HolderBalance[] | The page of `(holder, balance)` pairs recorded at `_snapshotID`. |

### batchBurn

```solidity
function batchBurn(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Burns tokens from multiple addresses in a single transaction.

_Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. The token must not be paused and must not be configured for multi-partition. Emits `IController.ControllerRedemption` for each address processed._

#### Parameters

| Name            | Type      | Description                                                                       |
| --------------- | --------- | --------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Addresses from which tokens will be burnt.                                        |
| \_amounts       | uint256[] | Corresponding token amounts to burn. Must be the same length as `_userAddresses`. |

### batchForcedTransfer

```solidity
function batchForcedTransfer(address[] _fromList, address[] _toList, uint256[] _amounts) external nonpayable
```

Batch forced transfer of tokens from multiple source addresses to multiple destinations.

_Restricted to accounts holding the controller or agent role. Requires the token to be controllable and operating in single-partition mode. Emits one `IController.ControllerTransfer` event per element._

#### Parameters

| Name       | Type      | Description                                                               |
| ---------- | --------- | ------------------------------------------------------------------------- |
| \_fromList | address[] | Source addresses to debit.                                                |
| \_toList   | address[] | Destination addresses to credit.                                          |
| \_amounts  | uint256[] | Amounts to transfer, positionally aligned with `_fromList` and `_toList`. |

### batchFreezePartialTokens

```solidity
function batchFreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch freezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensFrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                              |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| \_userAddresses | address[] | Array of addresses to freeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to freeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

### batchMint

```solidity
function batchMint(address[] _toList, uint256[] _amounts) external nonpayable
```

Batch mint tokens to multiple addresses.

_Iterates over `_toList` and `_amounts` in two passes: first validates identity, compliance, and cap constraints for every recipient, then issues tokens to each address via `ERC1594StorageWrapper.issue`. Reverts if the token is paused, if the arrays differ in length, if the caller lacks the issuer or agent role, if a recipient fails identity or compliance checks, or if any single mint would exceed the maximum supply. Restricted to non-multi-partition tokens._

#### Parameters

| Name      | Type      | Description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| \_toList  | address[] | Ordered list of recipient addresses.                           |
| \_amounts | uint256[] | Ordered list of token amounts corresponding to each recipient. |

### batchSetAddressFrozen

```solidity
function batchSetAddressFrozen(address[] _userAddresses, bool[] _freeze) external nonpayable
```

Batch freezes or unfreezes multiple addresses.

_Emits `IFreeze.AddressFrozen` for each address. Only callable by `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                              |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to freeze/unfreeze.                                                                   |
| \_freeze        | bool[]    | Array of freeze statuses (true = freeze, false = unfreeze). Must be the same length as `_userAddresses`. |

### batchTransfer

```solidity
function batchTransfer(address[] _toList, uint256[] _amounts) external nonpayable
```

Transfers tokens from the caller to multiple addresses in a single transaction.

_Token must be unpaused, not in multi-partition mode, clearing disabled, and the caller plus every recipient must satisfy identity and compliance checks. Delegates each transfer to `TokenCoreOps.transfer`._

#### Parameters

| Name      | Type      | Description                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------ |
| \_toList  | address[] | Recipient addresses.                                                           |
| \_amounts | uint256[] | Corresponding token amounts to transfer. Must be the same length as `_toList`. |

### batchUnfreezePartialTokens

```solidity
function batchUnfreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch unfreezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensUnfrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                                |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to unfreeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to unfreeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

### blockTimestamp

```solidity
function blockTimestamp() external view returns (uint256)
```

Returns the currently resolved system timestamp (override or native).

#### Returns

| Name | Type    | Description                                                                |
| ---- | ------- | -------------------------------------------------------------------------- |
| \_0  | uint256 | The active timestamp — the override when set, otherwise `block.timestamp`. |

### burn

```solidity
function burn(address _userAddress, uint256 _amount) external nonpayable
```

Burns `_amount` tokens from `_userAddress` on behalf of a controller or agent.

_Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. Emits `IController.ControllerRedemption` rather than `Redeemed`._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_userAddress | address | Address whose token balance is reduced.              |
| \_amount      | uint256 | Amount of tokens to burn, denominated in base units. |

### calculateRoleForPartition

```solidity
function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_)
```

Calculates the role required to transfer tokens from a given partition

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| \_partition | bytes32 | The partition to calculate the role for |

#### Returns

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| roleForPartition\_ | bytes32 | The role required to transfer tokens from the given partition |

### canRedeemByPartition

```solidity
function canRedeemByPartition(address _from, bytes32 _partition, uint256 _value, bytes _data, bytes _operatorData) external view returns (bool status_, bytes1 code_, bytes32 reason_)
```

Checks whether a redemption can be executed on a specific partition.

_Assumes that if the caller has an admin role the redemption will be performed using the associated method._

#### Parameters

| Name           | Type    | Description                                       |
| -------------- | ------- | ------------------------------------------------- |
| \_from         | address | The address whose tokens would be redeemed.       |
| \_partition    | bytes32 | The partition the redemption would happen in.     |
| \_value        | uint256 | The amount of tokens to redeem.                   |
| \_data         | bytes   | Additional data attached to the redemption check. |
| \_operatorData | bytes   | Additional data attached by the operator.         |

#### Returns

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| status\_ | bool    | True when the redemption is allowed.            |
| code\_   | bytes1  | EIP-1066 status code describing the result.     |
| reason\_ | bytes32 | Additional reason data tied to the status code. |

### canTransfer

```solidity
function canTransfer(address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32)
```

Checks if a transfer can be executed

#### Parameters

| Name    | Type    | Description                            |
| ------- | ------- | -------------------------------------- |
| \_to    | address | The recipient address                  |
| \_value | uint256 | The amount of tokens to transfer       |
| \_data  | bytes   | Additional data for the transfer check |

#### Returns

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| \_0  | bool    | bool True if the transfer can be executed        |
| \_1  | bytes1  | bytes1 EIP1066 status code indicating the result |
| \_2  | bytes32 | bytes32 Additional reason data for the result    |

### canTransferByPartition

```solidity
function canTransferByPartition(address _from, address _to, bytes32 _partition, uint256 _value, bytes _data, bytes _operatorData) external view returns (bool status_, bytes1 code_, bytes32 reason_)
```

Checks whether a transfer can be executed on a specific partition.

_Assumes that if the caller has an admin role the transfer will be performed using the associated method. For example, if msg.sender is an operator of `_to`, the transfer will be performed using `operatorTransferByPartition`. Using other methods can lead to inconsistent results._

#### Parameters

| Name           | Type    | Description                                     |
| -------------- | ------- | ----------------------------------------------- |
| \_from         | address | The sender address.                             |
| \_to           | address | The recipient address.                          |
| \_partition    | bytes32 | The partition the transfer would happen in.     |
| \_value        | uint256 | The amount of tokens to transfer.               |
| \_data         | bytes   | Additional data attached to the transfer check. |
| \_operatorData | bytes   | Additional data attached by the operator.       |

#### Returns

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| status\_ | bool    | True when the transfer is allowed.              |
| code\_   | bytes1  | EIP-1066 status code describing the result.     |
| reason\_ | bytes32 | Additional reason data tied to the status code. |

### canTransferFrom

```solidity
function canTransferFrom(address _from, address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32)
```

Checks if a transferFrom can be executed

#### Parameters

| Name    | Type    | Description                            |
| ------- | ------- | -------------------------------------- |
| \_from  | address | The sender address                     |
| \_to    | address | The recipient address                  |
| \_value | uint256 | The amount of tokens to transfer       |
| \_data  | bytes   | Additional data for the transfer check |

#### Returns

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| \_0  | bool    | bool True if the transfer can be executed        |
| \_1  | bytes1  | bytes1 EIP1066 status code indicating the result |
| \_2  | bytes32 | bytes32 Additional reason data for the result    |

### cancelAmortization

```solidity
function cancelAmortization(uint256 _amortizationID) external nonpayable
```

Cancels an existing amortization.

_Reverts if any token holder still has an active hold for this amortization. All holds must be released via `releaseAmortizationHold` before cancellation is allowed._

#### Parameters

| Name             | Type    | Description                           |
| ---------------- | ------- | ------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to cancel. |

### cancelClearingOperationByPartition

```solidity
function cancelClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### cancelCoupon

```solidity
function cancelCoupon(uint256 _couponID) external nonpayable returns (bool success_)
```

Cancels a previously scheduled coupon before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Reverts with `CouponAlreadyExecuted` if the execution date has passed; otherwise marks the corporate action disabled and emits `CouponCancelled`._

#### Parameters

| Name       | Type    | Description                                     |
| ---------- | ------- | ----------------------------------------------- |
| \_couponID | uint256 | One-indexed identifier of the coupon to cancel. |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | True if the cancellation was recorded. |

### cancelDividend

```solidity
function cancelDividend(uint256 _dividendId) external nonpayable returns (bool success_)
```

Cancels a previously scheduled dividend before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Reverts with `DividendAlreadyExecuted` if the execution date has passed; otherwise marks the corporate action disabled and emits `DividendCancelled`._

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_dividendId | uint256 | One-indexed identifier of the dividend to cancel. |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | True if the cancellation was recorded. |

### cancelScheduledBalanceAdjustment

```solidity
function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external nonpayable returns (bool success_)
```

Cancels a previously scheduled balance adjustment.

_Caller must hold `ROLE_CORPORATE_ACTION`. The token must not be paused. Emits `ScheduledBalanceAdjustmentCancelled` on success._

#### Parameters

| Name                  | Type    | Description                                       |
| --------------------- | ------- | ------------------------------------------------- |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to cancel. |

#### Returns

| Name      | Type | Description                         |
| --------- | ---- | ----------------------------------- |
| success\_ | bool | True if the cancellation succeeded. |

### cancelVoting

```solidity
function cancelVoting(uint256 _voteId) external nonpayable returns (bool success_)
```

Cancels an existing voting

#### Parameters

| Name     | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| \_voteId | uint256 | The ID of the voting to be cancelled |

#### Returns

| Name      | Type | Description                             |
| --------- | ---- | --------------------------------------- |
| success\_ | bool | Whether the cancellation was successful |

### changeSystemBlockNumber

```solidity
function changeSystemBlockNumber(uint256 _newSystemBlockNumber) external nonpayable
```

Overrides the block number returned by `EvmAccessors.getBlockNumber`.

#### Parameters

| Name                   | Type    | Description                    |
| ---------------------- | ------- | ------------------------------ |
| \_newSystemBlockNumber | uint256 | The new override block number. |

### changeSystemChainId

```solidity
function changeSystemChainId(uint256 _newChainId) external nonpayable
```

Overrides the chain id returned by `EvmAccessors.getChainId`.

#### Parameters

| Name         | Type    | Description                |
| ------------ | ------- | -------------------------- |
| \_newChainId | uint256 | The new override chain id. |

### changeSystemSender

```solidity
function changeSystemSender(address _newSender) external nonpayable
```

Overrides the sender returned by `EvmAccessors.getMsgSender`.

_The override is global storage applied to every read on the diamond; prefer Hardhat impersonation for ordinary per-call sender control. Reverts on the zero address (the override sentinel) — use `resetSystemSender` to clear._

#### Parameters

| Name        | Type    | Description              |
| ----------- | ------- | ------------------------ |
| \_newSender | address | The new override sender. |

### changeSystemTimestamp

```solidity
function changeSystemTimestamp(uint256 _newSystemTime) external nonpayable
```

Overrides the timestamp returned by `EvmAccessors.getBlockTimestamp`.

#### Parameters

| Name            | Type    | Description                 |
| --------------- | ------- | --------------------------- |
| \_newSystemTime | uint256 | The new override timestamp. |

### checkpoints

```solidity
function checkpoints(address _account, uint256 _pos) external view returns (struct Checkpoints.Checkpoint)
```

Returns the checkpoint at a given position for an account&#39;s vote history.

#### Parameters

| Name      | Type    | Description                                               |
| --------- | ------- | --------------------------------------------------------- |
| \_account | address | Address whose checkpoint history is queried.              |
| \_pos     | uint256 | Zero-based index into the account&#39;s checkpoint array. |

#### Returns

| Name | Type                   | Description                                  |
| ---- | ---------------------- | -------------------------------------------- |
| \_0  | Checkpoints.Checkpoint | The checkpoint struct at the given position. |

### clearedBalanceOfAtSnapshot

```solidity
function clearedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the aggregate cleared balance of a token holder at the time of a given snapshot, summed across every partition.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                            |
| --------- | ------- | ---------------------------------------------------------------------- |
| balance\_ | uint256 | The total cleared balance of `_tokenHolder` recorded at `_snapshotID`. |

### clearedBalanceOfAtSnapshotByPartition

```solidity
function clearedBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the cleared balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                      |
| --------- | ------- | -------------------------------------------------------------------------------- |
| balance\_ | uint256 | The cleared balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### clearingCreateHoldByPartition

```solidity
function clearingCreateHoldByPartition(IClearingTypes.ClearingOperation _clearingOperation, IHoldTypes.Hold _hold) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                | Type                             | Description |
| ------------------- | -------------------------------- | ----------- |
| \_clearingOperation | IClearingTypes.ClearingOperation | undefined   |
| \_hold              | IHoldTypes.Hold                  | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingCreateHoldFromByPartition

```solidity
function clearingCreateHoldFromByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, IHoldTypes.Hold _hold) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_hold                  | IHoldTypes.Hold                      | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingRedeemByPartition

```solidity
function clearingRedeemByPartition(IClearingTypes.ClearingOperation _clearingOperation, uint256 _amount) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                | Type                             | Description |
| ------------------- | -------------------------------- | ----------- |
| \_clearingOperation | IClearingTypes.ClearingOperation | undefined   |
| \_amount            | uint256                          | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingRedeemFromByPartition

```solidity
function clearingRedeemFromByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingTransferByPartition

```solidity
function clearingTransferByPartition(IClearingTypes.ClearingOperation _clearingOperation, uint256 _amount, address _to) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                | Type                             | Description |
| ------------------- | -------------------------------- | ----------- |
| \_clearingOperation | IClearingTypes.ClearingOperation | undefined   |
| \_amount            | uint256                          | undefined   |
| \_to                | address                          | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingTransferFromByPartition

```solidity
function clearingTransferFromByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount, address _to) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |
| \_to                    | address                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clock

```solidity
function clock() external view returns (uint48)
```

_Clock used for flagging checkpoints. Can be overridden to implement timestamp based checkpoints (and voting)._

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | uint48 | undefined   |

### compliance

```solidity
function compliance() external view returns (contract ICompliance)
```

Returns the address of the compliance contract

#### Returns

| Name | Type                 | Description                         |
| ---- | -------------------- | ----------------------------------- |
| \_0  | contract ICompliance | ICompliance The compliance contract |

### controllerCreateHoldByPartition

```solidity
function controllerCreateHoldByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name           | Type            | Description |
| -------------- | --------------- | ----------- |
| \_partition    | bytes32         | undefined   |
| \_from         | address         | undefined   |
| \_hold         | IHoldTypes.Hold | undefined   |
| \_operatorData | bytes           | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### controllerRedeem

```solidity
function controllerRedeem(address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

This function allows an authorised address to redeem tokens for any token holder.

_This function can only be executed by the `controller` or `agent` address._

#### Parameters

| Name           | Type    | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| \_tokenHolder  | address | The account whose tokens will be redeemed.                   |
| \_value        | uint256 | uint256 the amount of tokens need to be redeemed.            |
| \_data         | bytes   | data to validate the transfer                                |
| \_operatorData | bytes   | data attached to the transfer by controller to emit in event |

### controllerRedeemByPartition

```solidity
function controllerRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

Forces a redemption in a partition from a token holder.

_Can only be called by a user with the controller or agent role. The contract must be controllable and not paused. Only valid in single-partition mode with the default partition._

#### Parameters

| Name           | Type    | Description                                                 |
| -------------- | ------- | ----------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are redeemed.               |
| \_tokenHolder  | address | The address whose tokens are redeemed.                      |
| \_value        | uint256 | The amount of tokens to redeem.                             |
| \_data         | bytes   | Additional data attached to the redemption.                 |
| \_operatorData | bytes   | Additional data attached to the redemption by the operator. |

### controllerTransfer

```solidity
function controllerTransfer(address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

This function allows an authorised address to transfer tokens between any two token holders.

_This function can only be executed by the `controller` or `agent` address._

#### Parameters

| Name           | Type    | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| \_from         | address | Address The address which you want to send tokens from       |
| \_to           | address | Address The address which you want to transfer to            |
| \_value        | uint256 | uint256 the amount of tokens to be transferred               |
| \_data         | bytes   | data to validate the transfer                                |
| \_operatorData | bytes   | data attached to the transfer by controller to emit in event |

### controllerTransferByPartition

```solidity
function controllerTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external nonpayable returns (bytes32)
```

Forces a transfer in a partition from a token holder to a destination address.

_Can only be called by a user with the controller or agent role. The contract must be controllable and not paused. Only valid in single-partition mode with the default partition._

#### Parameters

| Name           | Type    | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are transferred.          |
| \_from         | address | The address from which tokens are transferred.            |
| \_to           | address | The address to which tokens are transferred.              |
| \_value        | uint256 | The amount of tokens to transfer.                         |
| \_data         | bytes   | Additional data attached to the transfer.                 |
| \_operatorData | bytes   | Additional data attached to the transfer by the operator. |

#### Returns

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| \_0  | bytes32 | The partition from which the tokens were transferred. |

### createHoldByPartition

```solidity
function createHoldByPartition(bytes32 _partition, IHoldTypes.Hold _hold) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name        | Type            | Description |
| ----------- | --------------- | ----------- |
| \_partition | bytes32         | undefined   |
| \_hold      | IHoldTypes.Hold | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### createHoldFromByPartition

```solidity
function createHoldFromByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name           | Type            | Description |
| -------------- | --------------- | ----------- |
| \_partition    | bytes32         | undefined   |
| \_from         | address         | undefined   |
| \_hold         | IHoldTypes.Hold | undefined   |
| \_operatorData | bytes           | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### deactivate

```solidity
function deactivate() external nonpayable
```

Sets the token&#39;s deactivation flag, retiring the token irreversibly.

_Requires `ROLE_DEACTIVATE`, the token to be currently unpaused, and the token to be currently activated. Reverts with `AccountHasNoRole`, `IsPaused`, or `Deactivated` respectively when those preconditions fail. The state change is one-way and cannot be undone._

### deactivateClearing

```solidity
function deactivateClearing() external nonpayable returns (bool success_)
```

Deactivates the clearing functionality

#### Returns

| Name      | Type | Description                                       |
| --------- | ---- | ------------------------------------------------- |
| success\_ | bool | True when the deactivation completes successfully |

### deactivateInternalKyc

```solidity
function deactivateInternalKyc() external nonpayable returns (bool success_)
```

Deactivates internal KYC enforcement for the token.

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True when the call succeeds without reverting. |

### decimals

```solidity
function decimals() external view returns (uint8)
```

Returns the decimals simulating non-triggered decimal adjustments up until current timestamp.

#### Returns

| Name | Type  | Description                                    |
| ---- | ----- | ---------------------------------------------- |
| \_0  | uint8 | The number of decimals used for token amounts. |

### decimalsAt

```solidity
function decimalsAt(uint256 _timestamp) external view returns (uint8)
```

Returns the effective token decimals at a given timestamp, simulating all pending scheduled balance adjustments (ABAFs) up to and including that timestamp.

_Delegates to `ERC20StorageWrapper.decimalsAdjustedAt`. Adjustments with an `executionDate` strictly greater than `_timestamp` are excluded. No state mutation occurs; this is a pure simulation._

#### Parameters

| Name        | Type    | Description                                                 |
| ----------- | ------- | ----------------------------------------------------------- |
| \_timestamp | uint256 | The Unix timestamp up to which pending ABAFs are simulated. |

#### Returns

| Name | Type  | Description                                                              |
| ---- | ----- | ------------------------------------------------------------------------ |
| \_0  | uint8 | The effective decimal precision of the token at the specified timestamp. |

### decimalsAtSnapshot

```solidity
function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_)
```

Returns the token decimals at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name       | Type  | Description                                   |
| ---------- | ----- | --------------------------------------------- |
| decimals\_ | uint8 | The decimals value recorded at `_snapshotID`. |

### decreaseAllowance

```solidity
function decreaseAllowance(address _spender, uint256 _subtractedValue) external nonpayable returns (bool)
```

Atomically decreases the allowance granted to `spender` by the caller.

_Preferred alternative to {approve} as it avoids the read-modify-write allowance race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the zero address, or with {IAllowanceTypes.InsufficientAllowance} when the current allowance is below `subtractedValue`. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name              | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| \_spender         | address | Address whose allowance is being decreased.    |
| \_subtractedValue | uint256 | Amount subtracted from the existing allowance. |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### delegate

```solidity
function delegate(address _delegatee) external nonpayable
```

Delegates the caller&#39;s voting power to `delegatee`.

_Delegates votes from the sender to `delegatee`._

#### Parameters

| Name        | Type    | Description                                              |
| ----------- | ------- | -------------------------------------------------------- |
| \_delegatee | address | Address that will receive the caller&#39;s voting power. |

### delegates

```solidity
function delegates(address _account) external view returns (address)
```

Returns the delegate address that `account` has chosen.

_Returns the delegate that `account` has chosen._

#### Parameters

| Name      | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| \_account | address | Address whose chosen delegate is queried. |

#### Returns

| Name | Type    | Description                                  |
| ---- | ------- | -------------------------------------------- |
| \_0  | address | Address of the delegate chosen by `account`. |

### executeHoldByPartition

```solidity
function executeHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier, address _to, uint256 _amount) external nonpayable returns (bool success_, bytes32 partition_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |
| \_to             | address                   | undefined   |
| \_amount         | uint256                   | undefined   |

#### Returns

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| success\_   | bool    | undefined   |
| partition\_ | bytes32 | undefined   |

### finalizeControllable

```solidity
function finalizeControllable() external nonpayable
```

It is used to end the controller feature from the token

_It only be called by the `owner/issuer` of the token_

### forceCancelAmortization

```solidity
function forceCancelAmortization(uint256 _amortizationID) external nonpayable
```

Force-cancels an amortization regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state, `onlyWithoutMultiPartition`, and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `AmortizationAlreadyExecuted` and `AmortizationNotActive` — and emits `AmortizationForceCancelled`._

#### Parameters

| Name             | Type    | Description                                 |
| ---------------- | ------- | ------------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to force-cancel. |

### forceCancelCoupon

```solidity
function forceCancelCoupon(uint256 _couponID) external nonpayable returns (bool success_)
```

Force-cancels a coupon regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `CouponAlreadyExecuted` — and emits `CouponForceCancelled`._

#### Parameters

| Name       | Type    | Description                                           |
| ---------- | ------- | ----------------------------------------------------- |
| \_couponID | uint256 | One-indexed identifier of the coupon to force-cancel. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the force-cancellation was recorded. |

### forceCancelDividend

```solidity
function forceCancelDividend(uint256 _dividendId) external nonpayable returns (bool success_)
```

Force-cancels a dividend regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `DividendAlreadyExecuted` — and emits `DividendForceCancelled`._

#### Parameters

| Name         | Type    | Description                                             |
| ------------ | ------- | ------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed identifier of the dividend to force-cancel. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the force-cancellation was recorded. |

### forceCancelScheduledBalanceAdjustment

```solidity
function forceCancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external nonpayable returns (bool success_)
```

Force-cancels a balance adjustment regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `notZeroValue`. Marks the corporate action disabled unconditionally — bypasses `BalanceAdjustmentAlreadyExecuted` — and emits `ScheduledBalanceAdjustmentForceCancelled`._

#### Parameters

| Name                  | Type    | Description                                             |
| --------------------- | ------- | ------------------------------------------------------- |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to force-cancel. |

#### Returns

| Name      | Type | Description                               |
| --------- | ---- | ----------------------------------------- |
| success\_ | bool | True if the force-cancellation succeeded. |

### forceCancelVoting

```solidity
function forceCancelVoting(uint256 _voteId) external nonpayable returns (bool success_)
```

Force-cancels a voting regardless of its record date

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the operational, unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `VotingAlreadyRecorded` — and emits `VotingForceCancelled`._

#### Parameters

| Name     | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| \_voteId | uint256 | The ID of the voting to force-cancel |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | Whether the force-cancellation was successful |

### forceReleaseByPartition

```solidity
function forceReleaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock unconditionally, before its expiration timestamp.

_Authorised path used to recover locked balances when the holder is unable to do so. Pause-gated, partition validated against single-partition mode and restricted to callers holding `LOCKER_ROLE` or `CONTROLLER_ROLE` (checked explicitly via `AccessControlStorageWrapper.checkAnyRole`). Skips the `LockExpirationNotReached` guard that `releaseByPartition` enforces. Emits `LockByPartitionReleased`._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_partition   | bytes32 | The partition the lock lives on.       |
| \_lockId      | uint256 | Identifier of the lock to release.     |
| \_tokenHolder | address | The address whose tokens are returned. |

#### Returns

| Name      | Type | Description                                                   |
| --------- | ---- | ------------------------------------------------------------- |
| success\_ | bool | True when the lock has been removed and the balance returned. |

### forcedTransfer

```solidity
function forcedTransfer(address _from, address _to, uint256 _amount) external nonpayable returns (bool)
```

Performs a forced transfer of `_amount` tokens from `_from` to `_to`.

_This function should only be callable by an authorized entity. Returns `true` if the transfer was successful. Emits a ControllerTransfer event._

#### Parameters

| Name     | Type    | Description                              |
| -------- | ------- | ---------------------------------------- |
| \_from   | address | Address the tokens are transferred from. |
| \_to     | address | Address the tokens are transferred to.   |
| \_amount | uint256 | Amount of tokens to transfer.            |

#### Returns

| Name | Type | Description                          |
| ---- | ---- | ------------------------------------ |
| \_0  | bool | True if the transfer was successful. |

### freezePartialTokens

```solidity
function freezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Freezes a specific amount of tokens for a wallet, reducing its liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Updates balance snapshots before mutating frozen state. Emits `TokensFrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| \_userAddress | address | The address whose tokens are to be frozen. |
| \_amount      | uint256 | The amount of tokens to freeze.            |

### frozenBalanceOfAtSnapshot

```solidity
function frozenBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the frozen balance of an account at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_snapshotID  | uint256 | The identifier of the snapshot to query.           |
| \_tokenHolder | address | The address whose frozen balance is being queried. |

#### Returns

| Name      | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| balance\_ | uint256 | The frozen balance of `_tokenHolder` at snapshot `_snapshotID`. |

### frozenBalanceOfAtSnapshotByPartition

```solidity
function frozenBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the frozen balance of an account for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_partition   | bytes32 | The partition the frozen balance is queried in.    |
| \_snapshotID  | uint256 | The identifier of the snapshot to query.           |
| \_tokenHolder | address | The address whose frozen balance is being queried. |

#### Returns

| Name      | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| balance\_ | uint256 | The frozen balance of `_tokenHolder` on `_partition` at snapshot `_snapshotID`. |

### fullRedeemAtMaturity

```solidity
function fullRedeemAtMaturity(address _tokenHolder) external nonpayable
```

Redeems all token partitions held by a token holder at maturity.

_Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC status, must not be recovered, and the current timestamp must be at or past the maturity date. Iterates every partition owned by `_tokenHolder` and redeems each balance in full. Reverts with an unexpected error if any partition balance is zero.Emits {RedeemedByPartition} for each redeemed partition via `ERC1410StorageWrapper.redeemByPartition`._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_tokenHolder | address | Address of the token holder whose partitions are to be redeemed. |

### getActiveAmortizationIds

```solidity
function getActiveAmortizationIds(uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] activeIds_)
```

Retrieves a paginated list of non-cancelled amortization IDs.

_Cancelled amortizations (isDisabled=true) are excluded from the result._

#### Parameters

| Name         | Type    | Description                     |
| ------------ | ------- | ------------------------------- |
| \_pageIndex  | uint256 | The page index for pagination.  |
| \_pageLength | uint256 | The number of records per page. |

#### Returns

| Name        | Type      | Description                                             |
| ----------- | --------- | ------------------------------------------------------- |
| activeIds\_ | uint256[] | Array of amortization IDs that have not been cancelled. |

### getAllDocuments

```solidity
function getAllDocuments() external view returns (bytes32[])
```

Returns the names of all documents currently attached to the contract.

_The returned array reflects the current contents of the `docNames` storage array; ordering may change when documents are removed via swap-and-pop._

#### Returns

| Name | Type      | Description                        |
| ---- | --------- | ---------------------------------- |
| \_0  | bytes32[] | Array of `bytes32` document names. |

### getAmortization

```solidity
function getAmortization(uint256 _amortizationID) external view returns (struct IAmortization.RegisteredAmortization registeredAmortization_, bool isDisabled_)
```

Retrieves a registered amortization by its ID.

#### Parameters

| Name             | Type    | Description                             |
| ---------------- | ------- | --------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to retrieve. |

#### Returns

| Name                     | Type                                 | Description                           |
| ------------------------ | ------------------------------------ | ------------------------------------- |
| registeredAmortization\_ | IAmortization.RegisteredAmortization | The registered amortization data.     |
| isDisabled\_             | bool                                 | Whether the amortization is disabled. |

### getAmortizationActiveHolders

```solidity
function getAmortizationActiveHolders(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Retrieves a paginated list of token holders that still have an active hold for a given amortization.

_Use this to identify which holders must have their hold released before `cancelAmortization` can succeed._

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of holders per page. |

#### Returns

| Name      | Type      | Description                                                   |
| --------- | --------- | ------------------------------------------------------------- |
| holders\_ | address[] | Array of addresses with an active hold for this amortization. |

### getAmortizationFor

```solidity
function getAmortizationFor(uint256 _amortizationID, address _account) external view returns (struct IAmortization.AmortizationFor amortizationFor_)
```

Retrieves amortization payment information for a specific account.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |
| \_account        | address | The account address.        |

#### Returns

| Name              | Type                          | Description                                                 |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| amortizationFor\_ | IAmortization.AmortizationFor | Amortization payment information for the specified account. |

### getAmortizationHolders

```solidity
function getAmortizationHolders(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Retrieves a paginated list of amortization holders for a specific amortization ID.

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of holders per page. |

#### Returns

| Name      | Type      | Description                |
| --------- | --------- | -------------------------- |
| holders\_ | address[] | Array of holder addresses. |

### getAmortizationsCount

```solidity
function getAmortizationsCount() external view returns (uint256 amortizationCount_)
```

Retrieves the total number of amortizations set for the security.

_Cancelled amortizations are included in the count._

#### Returns

| Name                | Type    | Description                                  |
| ------------------- | ------- | -------------------------------------------- |
| amortizationCount\_ | uint256 | The total count of registered amortizations. |

### getAmortizationsFor

```solidity
function getAmortizationsFor(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct IAmortization.AmortizationFor[] amortizationsFor_, address[] holders_)
```

Retrieves amortization payment information for multiple holders (paginated).

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of records per page. |

#### Returns

| Name               | Type                            | Description                                                     |
| ------------------ | ------------------------------- | --------------------------------------------------------------- |
| amortizationsFor\_ | IAmortization.AmortizationFor[] | List of amortization payment information per holder.            |
| holders\_          | address[]                       | The holder addresses aligned by index with `amortizationsFor_`. |

### getBalanceAdjustmentCount

```solidity
function getBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_)
```

Returns the total number of balance adjustments ever scheduled, including cancelled ones.

#### Returns

| Name                     | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| balanceAdjustmentCount\_ | uint256 | Total count of corporate-action balance adjustment records. |

### getClearedAmountFor

```solidity
function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_)
```

Gets the total cleared amount for a token holder across all partitions

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| amount\_ | uint256 | Total cleared amount currently locked for the holder |

### getClearedAmountForByPartition

```solidity
function getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Gets the total cleared amount for a token holder by partition

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_partition   | bytes32 | The partition of the token      |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name     | Type    | Description                                                        |
| -------- | ------- | ------------------------------------------------------------------ |
| amount\_ | uint256 | Total amount of tokens currently locked in clearing for the holder |

### getClearingCountForByPartition

```solidity
function getClearingCountForByPartition(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType) external view returns (uint256 clearingCount_)
```

Gets the total clearing count for a token holder by partition and clearing operation type

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |

#### Returns

| Name            | Type    | Description                                            |
| --------------- | ------- | ------------------------------------------------------ |
| clearingCount\_ | uint256 | Number of active clearing operations of the given type |

### getClearingCreateHoldForByPartition

```solidity
function getClearingCreateHoldForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) external view returns (struct IClearingTypes.ClearingHoldCreationData clearingHoldCreationData_)
```

Gets the clearing hold creation data for a given partition, token holder and clearing ID

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition of the token       |
| \_tokenHolder | address | The address of the token holder  |
| \_clearingId  | uint256 | The ID of the clearing operation |

#### Returns

| Name                       | Type                                    | Description                     |
| -------------------------- | --------------------------------------- | ------------------------------- |
| clearingHoldCreationData\_ | IClearingTypes.ClearingHoldCreationData | The clearing hold creation data |

### getClearingRedeemForByPartition

```solidity
function getClearingRedeemForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) external view returns (struct IClearingTypes.ClearingRedeemData clearingRedeemData_)
```

Gets the clearing redeem data for a given partition, token holder and clearing ID

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition of the token       |
| \_tokenHolder | address | The address of the token holder  |
| \_clearingId  | uint256 | The ID of the clearing operation |

#### Returns

| Name                 | Type                              | Description              |
| -------------------- | --------------------------------- | ------------------------ |
| clearingRedeemData\_ | IClearingTypes.ClearingRedeemData | The clearing redeem data |

### getClearingThirdParty

```solidity
function getClearingThirdParty(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType, uint256 _clearingId) external view returns (address thirdParty_)
```

Gets the address of the party that initiated the clearing operation

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |
| \_clearingId            | uint256                                   | Identifier of the clearing operation                           |

#### Returns

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| thirdParty\_ | address | Address that initiated the clearing operation |

### getClearingTransferForByPartition

```solidity
function getClearingTransferForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) external view returns (struct IClearingTypes.ClearingTransferData clearingTransferData_)
```

Gets the clearing transfer data for a given partition, token holder and clearing ID

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition of the token       |
| \_tokenHolder | address | The address of the token holder  |
| \_clearingId  | uint256 | The ID of the clearing operation |

#### Returns

| Name                   | Type                                | Description                |
| ---------------------- | ----------------------------------- | -------------------------- |
| clearingTransferData\_ | IClearingTypes.ClearingTransferData | The clearing transfer data |

### getClearingsIdForByPartition

```solidity
function getClearingsIdForByPartition(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] clearingsId_)
```

Gets the ids of the clearings for a token holder by partition and clearing operation type

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |
| \_pageIndex             | uint256                                   | Zero-based page index for pagination                           |
| \_pageLength            | uint256                                   | Maximum number of IDs to return per page                       |

#### Returns

| Name          | Type      | Description                                        |
| ------------- | --------- | -------------------------------------------------- |
| clearingsId\_ | uint256[] | Array of clearing operation IDs for the given page |

### getConfigInfo

```solidity
function getConfigInfo() external view returns (address resolver_, bytes8 proxyVersion_, bytes32 configurationId_, uint256 configurationVersion_, bool replacementEnabled_)
```

Returns the active resolver address, configuration identifier, and version.

#### Returns

| Name                   | Type    | Description                                     |
| ---------------------- | ------- | ----------------------------------------------- |
| resolver\_             | address | Address of the current Business Logic Resolver. |
| proxyVersion\_         | bytes8  | proxy version.                                  |
| configurationId\_      | bytes32 | Identifier of the active configuration.         |
| configurationVersion\_ | uint256 | Version number of the active configuration.     |
| replacementEnabled\_   | bool    | Whether replacement is enabled.                 |

### getControlListCount

```solidity
function getControlListCount() external view returns (uint256 controlListCount_)
```

Returns the total number of addresses currently in the control list.

#### Returns

| Name               | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| controlListCount\_ | uint256 | The number of entries in the control list. |

### getControlListMembers

```solidity
function getControlListMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the addresses in the control list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| members\_ | address[] | Array of control list member addresses for the requested page. |

### getControlListType

```solidity
function getControlListType() external view returns (bool)
```

Returns the operating mode of the control list.

#### Returns

| Name | Type | Description                                                          |
| ---- | ---- | -------------------------------------------------------------------- |
| \_0  | bool | True if the control list is a whitelist, false if it is a blacklist. |

### getCorporateAction

```solidity
function getCorporateAction(bytes32 _corporateActionId) external view returns (bytes32 actionType_, uint256 actionIdByType_, bytes data_, bool isDisabled_)
```

Returns the stored details for a single corporate action.

#### Parameters

| Name                | Type    | Description                                                      |
| ------------------- | ------- | ---------------------------------------------------------------- |
| \_corporateActionId | bytes32 | Unique `bytes32` identifier of the corporate action to retrieve. |

#### Returns

| Name             | Type    | Description                                             |
| ---------------- | ------- | ------------------------------------------------------- |
| actionType\_     | bytes32 | Classification key for the action.                      |
| actionIdByType\_ | uint256 | Sequential index of this action within its action type. |
| data\_           | bytes   | ABI-encoded payload containing the action details.      |
| isDisabled\_     | bool    | True if the action has been cancelled, false otherwise. |

### getCorporateActionCount

```solidity
function getCorporateActionCount() external view returns (uint256 corporateActionCount_)
```

Returns the total number of corporate actions registered on the token.

#### Returns

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| corporateActionCount\_ | uint256 | The total count of registered corporate actions. |

### getCorporateActionCountByType

```solidity
function getCorporateActionCountByType(bytes32 _actionType) external view returns (uint256 corporateActionCount_)
```

Returns the number of corporate actions registered under a specific action type.

#### Parameters

| Name         | Type    | Description               |
| ------------ | ------- | ------------------------- |
| \_actionType | bytes32 | The action type to count. |

#### Returns

| Name                   | Type    | Description                                         |
| ---------------------- | ------- | --------------------------------------------------- |
| corporateActionCount\_ | uint256 | The number of actions registered for `_actionType`. |

### getCorporateActionIds

```solidity
function getCorporateActionIds(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] corporateActionIds_)
```

Returns a paginated slice of corporate action identifiers.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the total action count.\*

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                            |
| \_pageLength | uint256 | Maximum number of identifiers to return per page. |

#### Returns

| Name                 | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| corporateActionIds\_ | bytes32[] | Array of corporate action identifiers for the requested page. |

### getCorporateActionIdsByType

```solidity
function getCorporateActionIdsByType(bytes32 _actionType, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] corporateActionIds_)
```

Returns a paginated slice of corporate action identifiers for a specific action type.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the count for that type.\*

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_actionType | bytes32 | The action type to filter by.                     |
| \_pageIndex  | uint256 | Zero-based page index.                            |
| \_pageLength | uint256 | Maximum number of identifiers to return per page. |

#### Returns

| Name                 | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| corporateActionIds\_ | bytes32[] | Array of corporate action identifiers for the requested page. |

### getCorporateActions

```solidity
function getCorporateActions(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] actionTypes_, uint256[] actionIdByType_, bytes[] datas_, bool[] isDisabled_)
```

Returns a paginated slice of full corporate action records.

_Internally resolves each paginated ID to its full `ActionData`. The list offset is computed as `\_pageIndex _ \_pageLength`.\*

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                        |
| \_pageLength | uint256 | Maximum number of records to return per page. |

#### Returns

| Name             | Type      | Description                                                          |
| ---------------- | --------- | -------------------------------------------------------------------- |
| actionTypes\_    | bytes32[] | Array of action classification keys.                                 |
| actionIdByType\_ | uint256[] | Array of per-type sequential indices.                                |
| datas\_          | bytes[]   | Array of ABI-encoded action payloads.                                |
| isDisabled\_     | bool[]    | Array of disabled flags; `true` means the action has been cancelled. |

### getCorporateActionsByType

```solidity
function getCorporateActionsByType(bytes32 _actionType, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] actionTypes_, uint256[] actionIdByType_, bytes[] datas_, bool[] isDisabled_)
```

Returns a paginated slice of full corporate action records for a specific action type.

_Internally resolves each paginated type-scoped ID to its full `ActionData`. The list offset is computed as `\_pageIndex _ \_pageLength`.\*

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_actionType | bytes32 | The action type to filter by.                 |
| \_pageIndex  | uint256 | Zero-based page index.                        |
| \_pageLength | uint256 | Maximum number of records to return per page. |

#### Returns

| Name             | Type      | Description                                                          |
| ---------------- | --------- | -------------------------------------------------------------------- |
| actionTypes\_    | bytes32[] | Array of action classification keys.                                 |
| actionIdByType\_ | uint256[] | Array of per-type sequential indices.                                |
| datas\_          | bytes[]   | Array of ABI-encoded action payloads.                                |
| isDisabled\_     | bool[]    | Array of disabled flags; `true` means the action has been cancelled. |

### getCoupon

```solidity
function getCoupon(uint256 _couponID) external view returns (struct ICouponTypes.RegisteredCoupon registeredCoupon_, bool isDisabled_)
```

Returns the persisted coupon record together with its cancelled flag.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |

#### Returns

| Name               | Type                          | Description                                          |
| ------------------ | ----------------------------- | ---------------------------------------------------- |
| registeredCoupon\_ | ICouponTypes.RegisteredCoupon | Stored coupon parameters bound to their snapshot id. |
| isDisabled\_       | bool                          | True if the coupon has been cancelled.               |

### getCouponAmountFor

```solidity
function getCouponAmountFor(uint256 _couponID, address _account) external view returns (struct ICouponTypes.CouponAmountFor couponAmountFor_)
```

Returns the fractional coupon amount payable to a specific holder.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action. Numerator and denominator are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |
| \_account  | address | Holder address to query.       |

#### Returns

| Name              | Type                         | Description                               |
| ----------------- | ---------------------------- | ----------------------------------------- |
| couponAmountFor\_ | ICouponTypes.CouponAmountFor | Fractional payable amount for the holder. |

### getCouponCount

```solidity
function getCouponCount() external view returns (uint256 couponCount_)
```

Returns the total number of coupons scheduled under the coupon corporate-action type — cancelled coupons remain in the count.

#### Returns

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| couponCount\_ | uint256 | Current coupon count. |

### getCouponFor

```solidity
function getCouponFor(uint256 _couponID, address _account) external view returns (struct ICouponTypes.CouponFor couponFor_)
```

Returns the per-account view of a coupon, including the holder balance at the record date and the metadata required to compute the payable amount.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action. Balance and `couponAmount` fields are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |
| \_account  | address | Holder address to query.       |

#### Returns

| Name        | Type                   | Description                |
| ----------- | ---------------------- | -------------------------- |
| couponFor\_ | ICouponTypes.CouponFor | Holder-scoped coupon view. |

### getCouponFromOrderedListAt

```solidity
function getCouponFromOrderedListAt(uint256 _pos, bool _includeDisabled) external view returns (uint256 couponID_)
```

Retrieves a coupon ID from the ordered list at a specific position.

#### Parameters

| Name              | Type    | Description                                                                                        |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------- |
| \_pos             | uint256 | The position in the ordered coupon list.                                                           |
| \_includeDisabled | bool    | When true, cancelled coupons are counted in the list; when false, only active coupons are visible. |

#### Returns

| Name       | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| couponID\_ | uint256 | The coupon ID at the specified position. |

### getCouponHolders

```solidity
function getCouponHolders(uint256 _couponID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders eligible for a coupon.

_Holders are resolved from the snapshot at the coupon record date when one exists; falls back to the live holder list if no snapshot has been taken. Returns an empty array if the record date has not yet been reached._

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_couponID   | uint256 | Identifier of the target coupon (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of addresses to return per page.  |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Ordered array of holder addresses for the requested page. |

### getCouponRateType

```solidity
function getCouponRateType() external view returns (enum IInterestRate.RateType)
```

Returns the stored coupon rate type.

#### Returns

| Name | Type                        | Description           |
| ---- | --------------------------- | --------------------- |
| \_0  | enum IInterestRate.RateType | The `RateType` value. |

### getCouponsFor

```solidity
function getCouponsFor(uint256 _couponID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct ICouponTypes.CouponFor[] couponFor_, address[] holders_)
```

Returns coupon information for every holder of a given coupon, paginated.

_Internally resolves the holder page then retrieves per-holder coupon details. The two returned arrays share the same index: `couponFor_[i]` corresponds to `holders_[i]`._

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_couponID   | uint256 | Identifier of the target coupon (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of records to return per page.    |

#### Returns

| Name        | Type                     | Description                                                   |
| ----------- | ------------------------ | ------------------------------------------------------------- |
| couponFor\_ | ICouponTypes.CouponFor[] | Per-holder coupon details for the requested page.             |
| holders\_   | address[]                | Holder addresses corresponding to each entry in `couponFor_`. |

### getCouponsOrderedList

```solidity
function getCouponsOrderedList(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (uint256[] couponIDs_)
```

Retrieves a paginated list of coupon IDs in order.

#### Parameters

| Name              | Type    | Description                                                                                          |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | The page index for pagination.                                                                       |
| \_pageLength      | uint256 | The number of coupons per page.                                                                      |
| \_includeDisabled | bool    | When true, cancelled coupons are included in the page; when false, only active coupons are returned. |

#### Returns

| Name        | Type      | Description                                 |
| ----------- | --------- | ------------------------------------------- |
| couponIDs\_ | uint256[] | Array of coupon IDs for the specified page. |

### getCouponsOrderedListTotal

```solidity
function getCouponsOrderedListTotal(bool _includeDisabled) external view returns (uint256 total_)
```

Retrieves the total number of coupons in the ordered list adjusted to the current timestamp.

#### Parameters

| Name              | Type | Description                                                                            |
| ----------------- | ---- | -------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, cancelled coupons are counted; when false, only active coupons are counted. |

#### Returns

| Name    | Type    | Description                 |
| ------- | ------- | --------------------------- |
| total\_ | uint256 | The total count of coupons. |

### getCustomData

```solidity
function getCustomData(bytes32 _key) external view returns (bytes[] value_)
```

Returns the ordered list of byte payloads associated with `_key`.

_Returns an empty array if the key has never been set or has been cleared. Read-only; no access control._

#### Parameters

| Name  | Type    | Description                   |
| ----- | ------- | ----------------------------- |
| \_key | bytes32 | The custom data key to query. |

#### Returns

| Name    | Type    | Description                                                                        |
| ------- | ------- | ---------------------------------------------------------------------------------- |
| value\_ | bytes[] | The ordered list of byte payloads stored under `_key`, or an empty array if unset. |

### getDefaultedLoansRatio

```solidity
function getDefaultedLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the defaulted-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| numerator\_   | uint256 | Numerator of the defaulted-loans ratio.   |
| denominator\_ | uint256 | Denominator of the defaulted-loans ratio. |

### getDividend

```solidity
function getDividend(uint256 _dividendId) external view returns (struct IDividendTypes.RegisteredDividend registeredDividend_, bool isDisabled_)
```

Returns the persisted dividend record together with its cancelled flag.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |

#### Returns

| Name                 | Type                              | Description                                            |
| -------------------- | --------------------------------- | ------------------------------------------------------ |
| registeredDividend\_ | IDividendTypes.RegisteredDividend | Stored dividend parameters bound to their snapshot id. |
| isDisabled\_         | bool                              | True if the dividend has been cancelled.               |

### getDividendAmountFor

```solidity
function getDividendAmountFor(uint256 _dividendId, address _account) external view returns (struct IDividendTypes.DividendAmountFor dividendAmountFor_)
```

Returns the fractional dividend amount payable to a specific holder.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action. Numerator and denominator are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |
| \_account    | address | Holder address to query.         |

#### Returns

| Name                | Type                             | Description                               |
| ------------------- | -------------------------------- | ----------------------------------------- |
| dividendAmountFor\_ | IDividendTypes.DividendAmountFor | Fractional payable amount for the holder. |

### getDividendFor

```solidity
function getDividendFor(uint256 _dividendId, address _account) external view returns (struct IDividendTypes.DividendFor dividendFor_)
```

Returns the per-account view of a dividend, including the holder&#39;s balance at the record date and the metadata required to compute the payable amount.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action. Balance and decimals fields are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |
| \_account    | address | Holder address to query.         |

#### Returns

| Name          | Type                       | Description                  |
| ------------- | -------------------------- | ---------------------------- |
| dividendFor\_ | IDividendTypes.DividendFor | Holder-scoped dividend view. |

### getDividendHolders

```solidity
function getDividendHolders(uint256 _dividendId, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns the page of holder addresses eligible for a given dividend.

_Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve to a dividend corporate action. Pages past the holder count return an empty array. Before the record date is reached, the underlying storage layer returns an empty page._

#### Parameters

| Name         | Type    | Description                                                                |
| ------------ | ------- | -------------------------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |
| \_pageIndex  | uint256 | Zero-based index of the page to retrieve.                                  |
| \_pageLength | uint256 | Maximum number of holders returned in the page.                            |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Holder addresses on the requested page, in storage order. |

### getDividendsCount

```solidity
function getDividendsCount() external view returns (uint256 dividendCount_)
```

Returns the total number of dividends scheduled under the dividend corporate-action type — cancelled dividends remain in the count.

#### Returns

| Name            | Type    | Description             |
| --------------- | ------- | ----------------------- |
| dividendCount\_ | uint256 | Current dividend count. |

### getDocument

```solidity
function getDocument(bytes32 _name) external view returns (string, bytes32, uint256)
```

Returns the URI, content hash, and last-modified timestamp of a document.

#### Parameters

| Name   | Type    | Description                                           |
| ------ | ------- | ----------------------------------------------------- |
| \_name | bytes32 | Unique `bytes32` identifier of the document to query. |

#### Returns

| Name | Type    | Description                                                  |
| ---- | ------- | ------------------------------------------------------------ |
| \_0  | string  | Off-chain URI of the document.                               |
| \_1  | bytes32 | Keccak-256 content hash of the document.                     |
| \_2  | uint256 | Unix timestamp of the last write operation on this document. |

### getERC20Metadata

```solidity
function getERC20Metadata() external view returns (struct ICore.ERC20Metadata)
```

Returns the full metadata struct of the security token.

#### Returns

| Name | Type                | Description                           |
| ---- | ------------------- | ------------------------------------- |
| \_0  | ICore.ERC20Metadata | The persisted `ERC20Metadata` bundle. |

### getExternalControlListsCount

```solidity
function getExternalControlListsCount() external view returns (uint256 externalControlListsCount_)
```

Returns the total number of external control list contracts in the list.

#### Returns

| Name                        | Type    | Description                                                   |
| --------------------------- | ------- | ------------------------------------------------------------- |
| externalControlListsCount\_ | uint256 | The current number of listed external control list contracts. |

### getExternalControlListsMembers

```solidity
function getExternalControlListsMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external control list contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                               |
| --------- | --------- | ------------------------------------------------------------------------- |
| members\_ | address[] | Array of external control list contract addresses for the requested page. |

### getExternalKycListsCount

```solidity
function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_)
```

Returns the total number of external KYC list contracts in the list.

#### Returns

| Name                    | Type    | Description                                               |
| ----------------------- | ------- | --------------------------------------------------------- |
| externalKycListsCount\_ | uint256 | The current number of listed external KYC list contracts. |

### getExternalKycListsMembers

```solidity
function getExternalKycListsMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external KYC list contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                           |
| --------- | --------- | --------------------------------------------------------------------- |
| members\_ | address[] | Array of external KYC list contract addresses for the requested page. |

### getExternalPausesCount

```solidity
function getExternalPausesCount() external view returns (uint256 externalPausesCount_)
```

Returns the total number of external pause contracts in the list.

#### Returns

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| externalPausesCount\_ | uint256 | The current number of listed external pause contracts. |

### getExternalPausesMembers

```solidity
function getExternalPausesMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external pause contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                        |
| --------- | --------- | ------------------------------------------------------------------ |
| members\_ | address[] | Array of external pause contract addresses for the requested page. |

### getFacet

```solidity
function getFacet(bytes32 _facetId) external view returns (struct IDiamondLoupe.Facet facet_)
```

Get the information associated with an specific facet

_If facet is not found return empty Facet struct_

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_facetId | bytes32 | The facet key for the resolver |

#### Returns

| Name    | Type                | Description |
| ------- | ------------------- | ----------- |
| facet\_ | IDiamondLoupe.Facet | Facet data  |

### getFacetAddress

```solidity
function getFacetAddress(bytes4 _selector) external view returns (address facetAddress_)
```

Gets the facet that supports the given selector

_If facet is not found return address(0)_

#### Parameters

| Name       | Type   | Description           |
| ---------- | ------ | --------------------- |
| \_selector | bytes4 | The function selector |

#### Returns

| Name           | Type    | Description       |
| -------------- | ------- | ----------------- |
| facetAddress\_ | address | The facet address |

### getFacetAddresses

```solidity
function getFacetAddresses() external view returns (address[] facetAddresses_)
```

Get all the facet addresses used by a resolverProxy

#### Returns

| Name             | Type      | Description      |
| ---------------- | --------- | ---------------- |
| facetAddresses\_ | address[] | facetAddresses\_ |

### getFacetAddressesByPage

```solidity
function getFacetAddressesByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] facetAddresses_)
```

Get all the facet addresses used by a resolverProxy

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name             | Type      | Description      |
| ---------------- | --------- | ---------------- |
| facetAddresses\_ | address[] | facetAddresses\_ |

### getFacetIdBySelector

```solidity
function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_)
```

Gets the facet key that supports the given selector

_If facet is not found return address(0)_

#### Parameters

| Name       | Type   | Description           |
| ---------- | ------ | --------------------- |
| \_selector | bytes4 | The function selector |

#### Returns

| Name      | Type    | Description   |
| --------- | ------- | ------------- |
| facetId\_ | bytes32 | The facet key |

### getFacetIds

```solidity
function getFacetIds() external view returns (bytes32[] facetIds_)
```

Get all the facet addresses used by a resolverProxy

#### Returns

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| facetIds\_ | bytes32[] | facetIds\_  |

### getFacetIdsByPage

```solidity
function getFacetIdsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] facetIds_)
```

Get all the facet addresses used by a resolverProxy

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| facetIds\_ | bytes32[] | facetIds\_  |

### getFacetLastVersion

```solidity
function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_)
```

Returns the latest version recorded for a facet. Zero means never registered.

#### Parameters

| Name      | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| \_facetId | bytes32 | Identifier of the facet to query. |

#### Returns

| Name          | Type    | Description                                                  |
| ------------- | ------- | ------------------------------------------------------------ |
| lastVersion\_ | uint256 | Most recent version stored for the facet, or zero if absent. |

### getFacetSelectors

```solidity
function getFacetSelectors(bytes32 _facetId) external view returns (bytes4[] facetSelectors_)
```

Gets all the function selectors supported by a specific facet.

#### Parameters

| Name      | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| \_facetId | bytes32 | The facet key for the resolver. |

#### Returns

| Name             | Type     | Description      |
| ---------------- | -------- | ---------------- |
| facetSelectors\_ | bytes4[] | facetSelectors\_ |

### getFacetSelectorsByPage

```solidity
function getFacetSelectorsByPage(bytes32 _facetId, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes4[] facetSelectors_)
```

Gets all the function selectors supported by a specific facet.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_facetId    | bytes32 | The facet key for the resolver.               |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name             | Type     | Description      |
| ---------------- | -------- | ---------------- |
| facetSelectors\_ | bytes4[] | facetSelectors\_ |

### getFacetSelectorsLength

```solidity
function getFacetSelectorsLength(bytes32 _facetId) external view returns (uint256 facetSelectorsLength_)
```

Gets the function selectors length.

#### Parameters

| Name      | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| \_facetId | bytes32 | The facet key for the resolver. |

#### Returns

| Name                   | Type    | Description            |
| ---------------------- | ------- | ---------------------- |
| facetSelectorsLength\_ | uint256 | facetSelectorsLength\_ |

### getFacetVersionStatus

```solidity
function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_)
```

Returns the initialisation status of a specific facet version.

_Encoding: `0` = initialisation not started, `1` = ready, `&gt;1` = initialisation in progress (intermediate value defined by the facet implementation)._

#### Parameters

| Name        | Type    | Description                       |
| ----------- | ------- | --------------------------------- |
| \_facetId   | bytes32 | Identifier of the facet to query. |
| \_versionId | uint256 | Version of the facet to query.    |

#### Returns

| Name     | Type    | Description                                           |
| -------- | ------- | ----------------------------------------------------- |
| status\_ | uint256 | Initialisation status of the requested facet version. |

### getFacets

```solidity
function getFacets() external view returns (struct IDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Returns

| Name     | Type                  | Description |
| -------- | --------------------- | ----------- |
| facets\_ | IDiamondLoupe.Facet[] | Facet       |

### getFacetsByPage

```solidity
function getFacetsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (struct IDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name     | Type                  | Description |
| -------- | --------------------- | ----------- |
| facets\_ | IDiamondLoupe.Facet[] | Facet       |

### getFacetsLength

```solidity
function getFacetsLength() external view returns (uint256 facetsLength_)
```

Gets facet length.

#### Returns

| Name           | Type    | Description   |
| -------------- | ------- | ------------- |
| facetsLength\_ | uint256 | Facets length |

### getFrozenTokens

```solidity
function getFrozenTokens(address _userAddress) external view returns (uint256)
```

Returns the total amount of tokens currently frozen for a wallet.

#### Parameters

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| \_userAddress | address | The address to query. |

#### Returns

| Name | Type    | Description                                                             |
| ---- | ------- | ----------------------------------------------------------------------- |
| \_0  | uint256 | The total frozen token amount for `_userAddress` across all partitions. |

### getHeldAmountFor

```solidity
function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_)
```

Returns the adjusted held amount for an account across every partition.

_The returned value reflects any balance adjustments applicable at the current timestamp._

#### Parameters

| Name          | Type    | Description                                      |
| ------------- | ------- | ------------------------------------------------ |
| \_tokenHolder | address | Address whose aggregate held balance is queried. |

#### Returns

| Name     | Type    | Description                                                                    |
| -------- | ------- | ------------------------------------------------------------------------------ |
| amount\_ | uint256 | Sum of held balances across all partitions, adjusted to the current timestamp. |

### getHeldAmountForByPartition

```solidity
function getHeldAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total amount of tokens held for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition to query.          |
| \_tokenHolder | address | The address of the token holder. |

#### Returns

| Name     | Type    | Description                                   |
| -------- | ------- | --------------------------------------------- |
| amount\_ | uint256 | The total held amount on the given partition. |

### getHoldCountForByPartition

```solidity
function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 holdCount_)
```

Returns the number of active holds for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition to query.          |
| \_tokenHolder | address | The address of the token holder. |

#### Returns

| Name        | Type    | Description                                 |
| ----------- | ------- | ------------------------------------------- |
| holdCount\_ | uint256 | The number of holds on the given partition. |

### getHoldForByPartition

```solidity
function getHoldForByPartition(IHoldTypes.HoldIdentifier _holdIdentifier) external view returns (uint256 amount_, uint256 expirationTimestamp_, address escrow_, address destination_, bytes data_, bytes operatorData_, enum ThirdPartyType thirdPartyType_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |

#### Returns

| Name                  | Type                | Description |
| --------------------- | ------------------- | ----------- |
| amount\_              | uint256             | undefined   |
| expirationTimestamp\_ | uint256             | undefined   |
| escrow\_              | address             | undefined   |
| destination\_         | address             | undefined   |
| data\_                | bytes               | undefined   |
| operatorData\_        | bytes               | undefined   |
| thirdPartyType\_      | enum ThirdPartyType | undefined   |

### getHoldThirdParty

```solidity
function getHoldThirdParty(IHoldTypes.HoldIdentifier _holdIdentifier) external view returns (address thirdParty_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| thirdParty\_ | address | undefined   |

### getHoldingsAssetOwnership

```solidity
function getHoldingsAssetOwnership(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_, uint256[] balances_)
```

Returns a paginated slice of holdings assets paired with the portfolio&#39;s current balance in each.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name       | Type      | Description                                                 |
| ---------- | --------- | ----------------------------------------------------------- |
| assets\_   | address[] | Slice of asset addresses for the requested page.            |
| balances\_ | uint256[] | Balances held by the portfolio for each entry in `assets_`. |

### getHoldingsAssets

```solidity
function getHoldingsAssets(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_)
```

Returns a paginated slice of every registered holdings asset address.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name     | Type      | Description                                      |
| -------- | --------- | ------------------------------------------------ |
| assets\_ | address[] | Slice of asset addresses for the requested page. |

### getHoldsIdForByPartition

```solidity
function getHoldsIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] holdsId_)
```

Returns a paginated list of hold IDs for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                                   |
| ------------- | ------- | --------------------------------------------- |
| \_partition   | bytes32 | The partition to query.                       |
| \_tokenHolder | address | The address of the token holder.              |
| \_pageIndex   | uint256 | The zero-based index of the page to retrieve. |
| \_pageLength  | uint256 | The maximum number of hold IDs to return.     |

#### Returns

| Name      | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| holdsId\_ | uint256[] | The array of hold IDs for the given page. |

### getIssuerListCount

```solidity
function getIssuerListCount() external view returns (uint256 issuerListCount_)
```

Returns the total number of addresses in the trusted issuer list.

#### Returns

| Name              | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| issuerListCount\_ | uint256 | The current number of listed issuers. |

### getIssuerListMembers

```solidity
function getIssuerListMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the trusted issuer list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| members\_ | address[] | Array of issuer addresses for the requested page. |

### getKpiLinkedRateImpactData

```solidity
function getKpiLinkedRateImpactData() external view returns (struct IKpiLinkedRate.ImpactData impactData_)
```

Returns the current KPI-linked impact data configuration.

#### Returns

| Name         | Type                      | Description                     |
| ------------ | ------------------------- | ------------------------------- |
| impactData\_ | IKpiLinkedRate.ImpactData | The stored `ImpactData` struct. |

### getKpiLinkedRateInterestRate

```solidity
function getKpiLinkedRateInterestRate() external view returns (struct IKpiLinkedRate.InterestRate interestRate_)
```

Returns the current KPI-linked interest rate configuration.

#### Returns

| Name           | Type                        | Description                       |
| -------------- | --------------------------- | --------------------------------- |
| interestRate\_ | IKpiLinkedRate.InterestRate | The stored `InterestRate` struct. |

### getKycAccountsCount

```solidity
function getKycAccountsCount(enum IKyc.KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_)
```

Returns the number of accounts with a given KYC status.

#### Parameters

| Name        | Type                | Description                                      |
| ----------- | ------------------- | ------------------------------------------------ |
| \_kycStatus | enum IKyc.KycStatus | The status to filter by: GRANTED or NOT_GRANTED. |

#### Returns

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| kycAccountsCount\_ | uint256 | The count of accounts matching the given status. |

### getKycAccountsData

```solidity
function getKycAccountsData(enum IKyc.KycStatus _kycStatus, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] accounts_, struct IKyc.KycData[] kycData_)
```

Returns a paginated list of accounts and their KYC data for a given KYC status.

#### Parameters

| Name         | Type                | Description                                                      |
| ------------ | ------------------- | ---------------------------------------------------------------- |
| \_kycStatus  | enum IKyc.KycStatus | The status to filter by: GRANTED or NOT_GRANTED.                 |
| \_pageIndex  | uint256             | Zero-based page index; skips `_pageIndex * _pageLength` entries. |
| \_pageLength | uint256             | Maximum number of entries to return per page.                    |

#### Returns

| Name       | Type           | Description                                                        |
| ---------- | -------------- | ------------------------------------------------------------------ |
| accounts\_ | address[]      | The accounts matching the given KYC status in the requested page.  |
| kycData\_  | IKyc.KycData[] | The KYC data records corresponding to each account in `accounts_`. |

### getKycFor

```solidity
function getKycFor(address _account) external view returns (struct IKyc.KycData kyc_)
```

Returns all KYC metadata recorded for an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to query. |

#### Returns

| Name  | Type         | Description                                 |
| ----- | ------------ | ------------------------------------------- |
| kyc\_ | IKyc.KycData | The full `KycData` struct for that account. |

### getKycStatus

```solidity
function getKycStatus(address _account) external view returns (enum IKyc.KycStatus)
```

Returns the KYC status of `account` as recorded in the external KYC list.

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_account | address | Address to check. |

#### Returns

| Name | Type                | Description                                       |
| ---- | ------------------- | ------------------------------------------------- |
| \_0  | enum IKyc.KycStatus | The `IKyc.KycStatus` value for the given account. |

### getKycStatusFor

```solidity
function getKycStatusFor(address _account) external view returns (enum IKyc.KycStatus kycStatus_)
```

Returns the current KYC status for an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to check. |

#### Returns

| Name        | Type                | Description             |
| ----------- | ------------------- | ----------------------- |
| kycStatus\_ | enum IKyc.KycStatus | GRANTED or NOT_GRANTED. |

### getLatestKpiData

```solidity
function getLatestKpiData(uint256 _from, uint256 _to, address _project) external view returns (uint256 value_, bool exists_)
```

Returns the most recent KPI value for `_project` within [`_from`, `_to`].

_Reverts with `InvalidDateRange` if `_from &gt; _to`._

#### Parameters

| Name      | Type    | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| \_from    | uint256 | Start of the search window (Unix timestamp, inclusive). |
| \_to      | uint256 | End of the search window (Unix timestamp, inclusive).   |
| \_project | address | Address of the project to query.                        |

#### Returns

| Name     | Type    | Description                                                |
| -------- | ------- | ---------------------------------------------------------- |
| value\_  | uint256 | The latest KPI value found in the range, or `0` if none.   |
| exists\_ | bool    | `true` if at least one data point exists within the range. |

### getLoanDetails

```solidity
function getLoanDetails() external view returns (struct ILoan.LoanDetailsData loanDetailsData_)
```

Returns the current loan details.

#### Returns

| Name              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| loanDetailsData\_ | ILoan.LoanDetailsData | The full loan descriptor currently stored on the token. |

### getLoanHoldingsAssets

```solidity
function getLoanHoldingsAssets(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_)
```

Returns a paginated slice of holdings assets whose type is `LOAN`.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name     | Type      | Description                                              |
| -------- | --------- | -------------------------------------------------------- |
| assets\_ | address[] | Slice of loan-holdings addresses for the requested page. |

### getLoansPortfolioData

```solidity
function getLoansPortfolioData() external view returns (struct ILoansPortfolio.LoansPortfolioDetailsData loansPortfolioData_)
```

Returns the portfolio-level configuration captured at initialisation.

#### Returns

| Name                 | Type                                      | Description                            |
| -------------------- | ----------------------------------------- | -------------------------------------- |
| loansPortfolioData\_ | ILoansPortfolio.LoansPortfolioDetailsData | The persisted portfolio configuration. |

### getLockCountFor

```solidity
function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_)
```

Returns the number of active locks held by `_tokenHolder` across every partition.

#### Parameters

| Name          | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| \_tokenHolder | address | The address whose lock count is queried. |

#### Returns

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| lockCount\_ | uint256 | The number of active locks across all partitions. |

### getLockCountForByPartition

```solidity
function getLockCountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 lockCount_)
```

Returns the number of active locks held by `_tokenHolder` on `_partition`.

#### Parameters

| Name          | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.    |
| \_tokenHolder | address | The address whose lock count is queried. |

#### Returns

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| lockCount\_ | uint256 | The number of active locks on the given partition. |

### getLockFor

```solidity
function getLockFor(address _tokenHolder, uint256 _lockId) external view returns (uint256 amount_, uint256 expirationTimestamp_)
```

Returns the amount and expiration of a lock created on the default partition.

_Convenience wrapper that delegates to the partition-aware lookup using the default partition; both fields are zero when the identifier does not exist. The returned amount is adjusted by any pending balance-adjustment factors._

#### Parameters

| Name          | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| \_tokenHolder | address | The address whose lock is queried. |
| \_lockId      | uint256 | Identifier of the lock to read.    |

#### Returns

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| amount\_              | uint256 | The locked amount, in token base units.              |
| expirationTimestamp\_ | uint256 | Unix timestamp at which the lock becomes releasable. |

### getLockForByPartition

```solidity
function getLockForByPartition(bytes32 _partition, address _tokenHolder, uint256 _lockId) external view returns (uint256 amount_, uint256 expirationTimestamp_)
```

Returns the amount and expiration of a lock on `_partition`.

_Both fields are zero when the identifier does not exist for the given `(_partition, _tokenHolder)` pair. The amount is adjusted by any pending balance-adjustment factors._

#### Parameters

| Name          | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| \_partition   | bytes32 | The partition the lock lives on.   |
| \_tokenHolder | address | The address whose lock is queried. |
| \_lockId      | uint256 | Identifier of the lock to read.    |

#### Returns

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| amount\_              | uint256 | The locked amount, in token base units.              |
| expirationTimestamp\_ | uint256 | Unix timestamp at which the lock becomes releasable. |

### getLockedAmountFor

```solidity
function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total amount currently locked for `_tokenHolder` across every partition, adjusted by any pending balance-adjustment factors.

#### Parameters

| Name          | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| \_tokenHolder | address | The address whose total locked amount is queried. |

#### Returns

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| amount\_ | uint256 | The aggregate locked amount across all partitions. |

### getLockedAmountForByPartition

```solidity
function getLockedAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total locked amount of `_tokenHolder` on `_partition`, adjusted by any pending balance-adjustment factors.

#### Parameters

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.       |
| \_tokenHolder | address | The address whose locked amount is queried. |

#### Returns

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| amount\_ | uint256 | The locked amount on the given partition. |

### getLocksIdFor

```solidity
function getLocksIdFor(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] locksId_)
```

Returns a paginated list of lock identifiers held by `_tokenHolder` across every partition.

_Pagination is bounded by the caller through `_pageLength`; the returned array length is at most `_pageLength`. A query past the available range returns an empty array._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_tokenHolder | address | The address whose locks are listed.                  |
| \_pageIndex   | uint256 | Zero-based index of the page to retrieve.            |
| \_pageLength  | uint256 | Maximum number of identifiers to return on the page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| locksId\_ | uint256[] | Array of lock identifiers for the requested page. |

### getLocksIdForByPartition

```solidity
function getLocksIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] locksId_)
```

Returns a paginated list of lock identifiers for `_tokenHolder` on `_partition`.

_Pagination is bounded by the caller through `_pageLength`; the returned array length is at most `_pageLength`. A query past the available range returns an empty array._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.                |
| \_tokenHolder | address | The address whose locks are listed.                  |
| \_pageIndex   | uint256 | Zero-based index of the page to retrieve.            |
| \_pageLength  | uint256 | Maximum number of identifiers to return on the page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| locksId\_ | uint256[] | Array of lock identifiers for the requested page. |

### getMaturityDate

```solidity
function getMaturityDate() external view returns (uint256 maturityDate_)
```

Returns the current token maturity date.

_Reads directly from `MaturityDateStorageWrapper` storage slot. No access-control gate — maturity date is public information._

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| maturityDate\_ | uint256 | Current maturity timestamp (Unix epoch, in seconds). Returns zero if the date has not been set yet. |

### getMaxInitializerFacetIndex

```solidity
function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_)
```

Returns the configured batch size for `setOperationalStatus`.

#### Returns

| Name                       | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| maxInitializerFacetIndex\_ | uint256 | Maximum number of facets validated per call. |

### getMaxSupply

```solidity
function getMaxSupply() external view returns (uint256 maxSupply_)
```

Returns the current effective maximum supply.

_The raw stored cap is multiplied by any pending scheduled balance-adjustment factor (ABAF) at the current block timestamp. If the product would overflow `uint256`, the value saturates to `MAX_UINT256`._

#### Returns

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| maxSupply\_ | uint256 | The effective maximum supply at the current timestamp. |

### getMaxSupplyByPartition

```solidity
function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_)
```

Returns the maximum supply cap currently in effect for a partition.

_The returned value is adjusted for pending balance adjustments effective at the current block timestamp._

#### Parameters

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| \_partition | bytes32 | The partition identifier to query. |

#### Returns

| Name        | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| maxSupply\_ | uint256 | The balance-adjusted maximum supply for `_partition`. |

### getMinDate

```solidity
function getMinDate() external view returns (uint256 minDate_)
```

Returns the earliest valid date for KPI data points on this token.

#### Returns

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| minDate\_ | uint256 | The configured minimum date (Unix timestamp). |

### getNominalValue

```solidity
function getNominalValue() external view returns (uint256)
```

Returns the nominal value amount.

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | The current nominal value amount. |

### getNominalValueCurrency

```solidity
function getNominalValueCurrency() external view returns (bytes3)
```

Returns the ISO 4217 currency code attached to the nominal value.

#### Returns

| Name | Type   | Description                                                                         |
| ---- | ------ | ----------------------------------------------------------------------------------- |
| \_0  | bytes3 | The current ISO 4217 currency code as `bytes3`; `0x000000` means &quot;unset&quot;. |

### getNominalValueDecimals

```solidity
function getNominalValueDecimals() external view returns (uint8)
```

Returns the decimals applied to the nominal value.

#### Returns

| Name | Type  | Description                                        |
| ---- | ----- | -------------------------------------------------- |
| \_0  | uint8 | The current decimals applied to `getNominalValue`. |

### getNonPerformingLoansRatio

```solidity
function getNonPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the non-performing-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                                    |
| ------------- | ------- | ---------------------------------------------- |
| numerator\_   | uint256 | Numerator of the non-performing-loans ratio.   |
| denominator\_ | uint256 | Denominator of the non-performing-loans ratio. |

### getNumberDefaultedLoans

```solidity
function getNumberDefaultedLoans() external view returns (uint256 numberDefaultedLoans_)
```

Returns the count of loan holdings currently in default.

#### Returns

| Name                   | Type    | Description               |
| ---------------------- | ------- | ------------------------- |
| numberDefaultedLoans\_ | uint256 | Count of defaulted loans. |

### getNumberOfAssets

```solidity
function getNumberOfAssets() external view returns (uint256 numberOfAssets_)
```

Returns the total number of registered holdings assets.

#### Returns

| Name             | Type    | Description               |
| ---------------- | ------- | ------------------------- |
| numberOfAssets\_ | uint256 | Count of holdings assets. |

### getNumberOfCash

```solidity
function getNumberOfCash() external view returns (uint256 numberOfCash_)
```

Returns the count of holdings assets with type `CASH`.

#### Returns

| Name           | Type    | Description             |
| -------------- | ------- | ----------------------- |
| numberOfCash\_ | uint256 | Count of cash holdings. |

### getNumberOfLoans

```solidity
function getNumberOfLoans() external view returns (uint256 numberOfLoans_)
```

Returns the count of holdings assets with type `LOAN`.

#### Returns

| Name            | Type    | Description             |
| --------------- | ------- | ----------------------- |
| numberOfLoans\_ | uint256 | Count of loan holdings. |

### getNumberOfNonPerformingLoans

```solidity
function getNumberOfNonPerformingLoans() external view returns (uint256 numberOfNonPerformingLoans_)
```

Returns the count of loan holdings currently classified as non-performing.

#### Returns

| Name                         | Type    | Description                    |
| ---------------------------- | ------- | ------------------------------ |
| numberOfNonPerformingLoans\_ | uint256 | Count of non-performing loans. |

### getNumberOfPerformingLoans

```solidity
function getNumberOfPerformingLoans() external view returns (uint256 numberOfPerformingLoans_)
```

Returns the count of loan holdings currently classified as performing.

#### Returns

| Name                      | Type    | Description                |
| ------------------------- | ------- | -------------------------- |
| numberOfPerformingLoans\_ | uint256 | Count of performing loans. |

### getOperationalStatus

```solidity
function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_)
```

Returns the raw operational status for a resolver-proxy configuration version.

_Encoding: `0` = not started, `1` = fully operational, `&gt;1` = resume facet index + 1._

#### Parameters

| Name        | Type    | Description                            |
| ----------- | ------- | -------------------------------------- |
| \_configId  | bytes32 | Resolver-proxy configuration to query. |
| \_versionId | uint256 | Configuration version to query.        |

#### Returns

| Name     | Type    | Description                                    |
| -------- | ------- | ---------------------------------------------- |
| status\_ | uint256 | Encoded operational status as described above. |

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 _timepoint) external view returns (uint256)
```

Returns the total vote supply available at a past `timepoint`.

_Returns the total supply of votes available at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block. NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes. Votes that have not been delegated are still part of total supply, even though they would not participate in a vote._

#### Parameters

| Name        | Type    | Description                                                      |
| ----------- | ------- | ---------------------------------------------------------------- |
| \_timepoint | uint256 | Block number or timestamp at which the total supply is resolved. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total vote supply at `timepoint`. |

### getPastVotes

```solidity
function getPastVotes(address _account, uint256 _timepoint) external view returns (uint256)
```

Returns the vote weight of `account` at a past `timepoint`.

_Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block._

#### Parameters

| Name        | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| \_account   | address | Address whose historical vote weight is queried.           |
| \_timepoint | uint256 | Block number or timestamp at which the weight is resolved. |

#### Returns

| Name | Type    | Description                              |
| ---- | ------- | ---------------------------------------- |
| \_0  | uint256 | Vote weight of `account` at `timepoint`. |

### getPendingBalanceAdjustmentCount

```solidity
function getPendingBalanceAdjustmentCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of pending scheduled balance adjustments in the task queue.

_Reads directly from `ScheduledTasksStorageWrapper`; excludes already-executed tasks._

#### Parameters

| Name              | Type | Description                                                                                                       |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, tasks belonging to cancelled corporate actions are counted; when false, only active tasks are counted. |

#### Returns

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| \_0  | uint256 | Count of pending balance adjustment tasks. |

### getPerformingLoansRatio

```solidity
function getPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the performing-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| numerator\_   | uint256 | Numerator of the performing-loans ratio.   |
| denominator\_ | uint256 | Denominator of the performing-loans ratio. |

### getPrincipalFor

```solidity
function getPrincipalFor(address _account) external view returns (struct IPrincipal.PrincipalFor principalFor_)
```

Returns the principal numerator and denominator for a given account.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_account | address | The address of the token holder. |

#### Returns

| Name           | Type                    | Description                                                       |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| principalFor\_ | IPrincipal.PrincipalFor | Struct containing the numerator and denominator of the principal. |

### getProceedRecipientData

```solidity
function getProceedRecipientData(address _proceedRecipient) external view returns (bytes)
```

Returns the arbitrary data stored for a registered proceed recipient.

#### Parameters

| Name               | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| \_proceedRecipient | address | Address of the proceed recipient to query. |

#### Returns

| Name | Type  | Description                                   |
| ---- | ----- | --------------------------------------------- |
| \_0  | bytes | Arbitrary data associated with the recipient. |

### getProceedRecipients

```solidity
function getProceedRecipients(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] proceedRecipients_)
```

Returns a paginated slice of the registered proceed-recipient addresses.

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based index of the page to retrieve.       |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name                | Type      | Description                                                  |
| ------------------- | --------- | ------------------------------------------------------------ |
| proceedRecipients\_ | address[] | Array of proceed-recipient addresses for the requested page. |

### getProceedRecipientsCount

```solidity
function getProceedRecipientsCount() external view returns (uint256)
```

Returns the total number of registered proceed recipients.

#### Returns

| Name | Type    | Description                                                          |
| ---- | ------- | -------------------------------------------------------------------- |
| \_0  | uint256 | Total count of proceed recipients currently registered on the token. |

### getRate

```solidity
function getRate() external view returns (uint256 rate_, uint8 decimals_)
```

Returns the current fixed interest rate and its decimal precision.

#### Returns

| Name       | Type    | Description                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------ |
| rate\_     | uint256 | Scaled rate value.                                                             |
| decimals\_ | uint8   | Decimal precision; divide `rate_` by `10 ** decimals_` for the effective rate. |

### getRevocationRegistryAddress

```solidity
function getRevocationRegistryAddress() external view returns (address revocationRegistryAddress_)
```

Returns the address of the current revocation registry contract.

#### Returns

| Name                        | Type    | Description                               |
| --------------------------- | ------- | ----------------------------------------- |
| revocationRegistryAddress\_ | address | The revocation registry contract address. |

### getRoleCountFor

```solidity
function getRoleCountFor(address _account) external view returns (uint256 roleCount_)
```

Returns the number of roles currently assigned to an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to query. |

#### Returns

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| roleCount\_ | uint256 | The number of roles held by `_account`. |

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_)
```

Returns the number of accounts currently holding a role.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| \_role | bytes32 | The role identifier to query. |

#### Returns

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| memberCount\_ | uint256 | The number of accounts assigned to `_role`. |

### getRoleMembers

```solidity
function getRoleMembers(bytes32 _role, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of accounts holding a role.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the member count for the role.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_role       | bytes32 | The role identifier to query.                   |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                        |
| --------- | --------- | ------------------------------------------------------------------ |
| members\_ | address[] | Array of account addresses holding `_role` for the requested page. |

### getRolesFor

```solidity
function getRolesFor(address _account, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] roles_)
```

Returns a paginated slice of roles assigned to an account.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the role count for the account.\*

#### Parameters

| Name         | Type    | Description                                 |
| ------------ | ------- | ------------------------------------------- |
| \_account    | address | The account to query.                       |
| \_pageIndex  | uint256 | Zero-based page index.                      |
| \_pageLength | uint256 | Maximum number of roles to return per page. |

#### Returns

| Name    | Type      | Description                                                          |
| ------- | --------- | -------------------------------------------------------------------- |
| roles\_ | bytes32[] | Array of role identifiers held by `_account` for the requested page. |

### getScheduledBalanceAdjustment

```solidity
function getScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external view returns (struct IScheduledBalanceAdjustment.ScheduledBalanceAdjustment balanceAdjustment_, bool isDisabled_)
```

Returns the parameters and disabled state of a previously scheduled balance adjustment.

_Reverts if the corporate action type stored at index `_balanceAdjustmentID - 1` does not match `CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT`._

#### Parameters

| Name                  | Type    | Description                                      |
| --------------------- | ------- | ------------------------------------------------ |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to query. |

#### Returns

| Name                | Type                                                   | Description                                                    |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| balanceAdjustment\_ | IScheduledBalanceAdjustment.ScheduledBalanceAdjustment | Struct containing executionDate, factor, and decimals.         |
| isDisabled\_        | bool                                                   | True if the adjustment has been cancelled or already executed. |

### getScheduledBalanceAdjustments

```solidity
function getScheduledBalanceAdjustments(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledBalanceAdjustment_)
```

Returns a paginated slice of pending scheduled balance adjustment tasks.

_Reads from `ScheduledTasksStorageWrapper`. Tasks are ordered by insertion index._

#### Parameters

| Name              | Type    | Description                                                                                                         |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | Zero-based page number.                                                                                             |
| \_pageLength      | uint256 | Maximum number of tasks to return per page.                                                                         |
| \_includeDisabled | bool    | When true, tasks belonging to cancelled corporate actions are included; when false, only active tasks are returned. |

#### Returns

| Name                         | Type            | Description                                              |
| ---------------------------- | --------------- | -------------------------------------------------------- |
| scheduledBalanceAdjustment\_ | ScheduledTask[] | Array of `ScheduledTask` structs for the requested page. |

### getScheduledCouponListing

```solidity
function getScheduledCouponListing(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledCouponListing_)
```

Retrieves a paginated list of scheduled coupon listing tasks.

#### Parameters

| Name              | Type    | Description                                                                                                         |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | The page index for pagination.                                                                                      |
| \_pageLength      | uint256 | The number of tasks per page.                                                                                       |
| \_includeDisabled | bool    | When true, tasks belonging to cancelled corporate actions are included; when false, only active tasks are returned. |

#### Returns

| Name                     | Type            | Description                              |
| ------------------------ | --------------- | ---------------------------------------- |
| scheduledCouponListing\_ | ScheduledTask[] | Array of scheduled coupon listing tasks. |

### getScheduledCrossOrderedTasks

```solidity
function getScheduledCrossOrderedTasks(uint256 _pageIndex, uint256 _pageLength) external view returns (struct ScheduledTask[] scheduledTask_)
```

Returns a paginated list of queued cross-ordered scheduled tasks.

_Pagination bounds and ordering are defined by the implementation&#39;s scheduled task store._

#### Parameters

| Name         | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index to query.              |
| \_pageLength | uint256 | Maximum number of scheduled tasks to return. |

#### Returns

| Name            | Type            | Description                                                    |
| --------------- | --------------- | -------------------------------------------------------------- |
| scheduledTask\_ | ScheduledTask[] | Cross-ordered scheduled tasks contained in the requested page. |

### getScheduledSnapshots

```solidity
function getScheduledSnapshots(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledSnapshot_)
```

Returns a paginated list of scheduled snapshots.

_Does not mutate state. Pagination bounds are interpreted by the implementation and should be selected to avoid excessive gas in on-chain callers._

#### Parameters

| Name              | Type    | Description                                                                                                                           |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | Zero-based page number.                                                                                                               |
| \_pageLength      | uint256 | Maximum number of tasks to return per page.                                                                                           |
| \_includeDisabled | bool    | When true, snapshots belonging to cancelled corporate actions are included; when false, only active scheduled snapshots are returned. |

#### Returns

| Name                | Type            | Description                                              |
| ------------------- | --------------- | -------------------------------------------------------- |
| scheduledSnapshot\_ | ScheduledTask[] | Array of `ScheduledTask` structs for the requested page. |

### getSecuredLoansRatio

```solidity
function getSecuredLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the secured-loans ratio as a numerator/denominator pair.

_Pair semantics avoid loss-of-precision compared to a single fixed-point value._

#### Returns

| Name          | Type    | Description                             |
| ------------- | ------- | --------------------------------------- |
| numerator\_   | uint256 | Numerator of the secured-loans ratio.   |
| denominator\_ | uint256 | Denominator of the secured-loans ratio. |

### getSecurityHolders

```solidity
function getSecurityHolders(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Gets the security holders (paginated)

#### Parameters

| Name         | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| \_pageIndex  | uint256 | The page index for pagination |
| \_pageLength | uint256 | The number of items per page  |

#### Returns

| Name      | Type      | Description                        |
| --------- | --------- | ---------------------------------- |
| holders\_ | address[] | Array of security holder addresses |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[] staticFunctionSelectors_)
```

Gets all function selectors of a facet

#### Returns

| Name                      | Type     | Description              |
| ------------------------- | -------- | ------------------------ |
| staticFunctionSelectors\_ | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[] staticInterfaceIds_)
```

Gets all interfaces ids of a facet.

#### Returns

| Name                 | Type     | Description        |
| -------------------- | -------- | ------------------ |
| staticInterfaceIds\_ | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### getTokenHoldersAtSnapshot

```solidity
function getTokenHoldersAtSnapshot(uint256 _snapshotID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders recorded at the time of a given snapshot.

_Pagination is zero-indexed. An empty page (when `_pageIndex` is beyond the total holder count) returns an empty array without reverting. Reverts with `SnapshotIdNull` when `_snapshotID == 0`. Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_pageIndex  | uint256 | Zero-based page number.                                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page.                  |

#### Returns

| Name      | Type      | Description                                                                  |
| --------- | --------- | ---------------------------------------------------------------------------- |
| holders\_ | address[] | Addresses of token holders recorded at `_snapshotID` for the requested page. |

### getTotalActiveAmortizationIds

```solidity
function getTotalActiveAmortizationIds() external view returns (uint256)
```

Retrieves the total number of non-cancelled amortizations.

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | The total count of active (non-cancelled) amortization IDs. |

### getTotalAmortizationActiveHolders

```solidity
function getTotalAmortizationActiveHolders(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total number of token holders that still have an active hold for a given amortization.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                                     |
| ---- | ------- | ----------------------------------------------- |
| \_0  | uint256 | The total count of holders with an active hold. |

### getTotalAmortizationHolders

```solidity
function getTotalAmortizationHolders(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total number of amortization holders for a specific amortization ID.

_It is the list of token holders at the snapshot taken at the record date._

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                               |
| ---- | ------- | ----------------------------------------- |
| \_0  | uint256 | The total number of amortization holders. |

### getTotalBalanceFor

```solidity
function getTotalBalanceFor(address _account) external view returns (uint256)
```

Returns the total balance held by an account across all partitions, including locked tokens, held tokens and clearing amounts, simulating non-triggered adjustments up to the current timestamp.

#### Parameters

| Name      | Type    | Description                |
| --------- | ------- | -------------------------- |
| \_account | address | The address of the account |

#### Returns

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| \_0  | uint256 | The adjusted total balance for the account |

### getTotalBalanceForByPartition

```solidity
function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256)
```

Returns the total balance held by an account within a specific partition, including locked tokens, held tokens, and clearing amounts, simulating non-triggered adjustments up to the current timestamp.

#### Parameters

| Name        | Type    | Description                |
| ----------- | ------- | -------------------------- |
| \_partition | bytes32 | The partition identifier   |
| \_account   | address | The address of the account |

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | The adjusted total balance for the account in the partition |

### getTotalCouponHolders

```solidity
function getTotalCouponHolders(uint256 _couponID) external view returns (uint256)
```

Returns the total number of security holders eligible for a coupon.

_Count is taken from the snapshot at the coupon record date when one exists; falls back to the live total if no snapshot has been taken. Returns zero if the record date has not yet been reached._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| \_couponID | uint256 | Identifier of the target coupon (1-based index). |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total number of eligible holders. |

### getTotalDividendHolders

```solidity
function getTotalDividendHolders(uint256 _dividendId) external view returns (uint256)
```

Returns the total number of holders eligible for a given dividend.

_Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve to a dividend corporate action. Returns zero before the record date is reached._

#### Parameters

| Name         | Type    | Description                                                                |
| ------------ | ------- | -------------------------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total number of eligible holders. |

### getTotalHoldByAmortizationId

```solidity
function getTotalHoldByAmortizationId(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total amount of tokens locked in holds for a given amortization.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                                                                |
| ---- | ------- | -------------------------------------------------------------------------- |
| \_0  | uint256 | The total token amount held across all active holds for this amortization. |

### getTotalSecurityHolders

```solidity
function getTotalSecurityHolders() external view returns (uint256 count_)
```

Gets the total number of security holders

#### Returns

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| count\_ | uint256 | Total number of security holders |

### getTotalTokenHoldersAtSnapshot

```solidity
function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256)
```

Returns the total number of token holders recorded at the time of a given snapshot.

_Reverts with `SnapshotIdNull` when `_snapshotID == 0`. Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name | Type    | Description                                              |
| ---- | ------- | -------------------------------------------------------- |
| \_0  | uint256 | Total number of distinct token holders at `_snapshotID`. |

### getTotalVotingHolders

```solidity
function getTotalVotingHolders(uint256 _voteID) external view returns (uint256 totalHolders_)
```

Returns the total number of token holders eligible for a voting.

_Count is taken from the snapshot at the voting record date when one exists; falls back to the live total if no snapshot has been taken. Returns zero if the record date has not yet been reached._

#### Parameters

| Name     | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| \_voteID | uint256 | Identifier of the target voting (1-based index). |

#### Returns

| Name           | Type    | Description                       |
| -------------- | ------- | --------------------------------- |
| totalHolders\_ | uint256 | Total number of eligible holders. |

### getVotes

```solidity
function getVotes(address _account) external view returns (uint256)
```

Returns the current vote weight of `account`.

_Returns the current amount of votes that `account` has._

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| \_account | address | Address whose current vote weight is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current vote weight of `account`. |

### getVoting

```solidity
function getVoting(uint256 _voteID) external view returns (struct IVotingTypes.RegisteredVoting registeredVoting_, bool isDisabled_)
```

Retrieves a registered voting by its ID

#### Parameters

| Name     | Type    | Description                      |
| -------- | ------- | -------------------------------- |
| \_voteID | uint256 | The ID of the voting to retrieve |

#### Returns

| Name               | Type                          | Description                    |
| ------------------ | ----------------------------- | ------------------------------ |
| registeredVoting\_ | IVotingTypes.RegisteredVoting | The registered voting data     |
| isDisabled\_       | bool                          | Whether the voting is disabled |

### getVotingCount

```solidity
function getVotingCount() external view returns (uint256 votingCount_)
```

Retrieves the total number of votings

#### Returns

| Name          | Type    | Description                |
| ------------- | ------- | -------------------------- |
| votingCount\_ | uint256 | The total count of votings |

### getVotingFor

```solidity
function getVotingFor(uint256 _voteID, address _account) external view returns (struct IVotingTypes.VotingFor votingFor_)
```

Retrieves voting information for a specific account and voting ID

_Return value includes user balance at voting record date_

#### Parameters

| Name      | Type    | Description          |
| --------- | ------- | -------------------- |
| \_voteID  | uint256 | The ID of the voting |
| \_account | address | The account address  |

#### Returns

| Name        | Type                   | Description                                  |
| ----------- | ---------------------- | -------------------------------------------- |
| votingFor\_ | IVotingTypes.VotingFor | Voting information for the specified account |

### getVotingHolders

```solidity
function getVotingHolders(uint256 _voteID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders eligible for a voting.

_Resolved from the snapshot at the voting record date when one exists; falls back to the live holder list if no snapshot has been taken. Returns an empty array if the record date has not yet been reached._

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_voteID     | uint256 | Identifier of the target voting (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of addresses to return per page.  |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Ordered array of holder addresses for the requested page. |

### grantKyc

```solidity
function grantKyc(address _account, string _vcId, uint256 _validFrom, uint256 _validTo, address _issuer) external nonpayable returns (bool success_)
```

Grants KYC to an account with the supplied verifiable-credential metadata.

#### Parameters

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| \_account   | address | User whose KYC is being granted.                       |
| \_vcId      | string  | Verifiable-credential identifier issued by the issuer. |
| \_validFrom | uint256 | Start timestamp of the KYC validity period.            |
| \_validTo   | uint256 | End timestamp of the KYC validity period.              |
| \_issuer    | address | Address of the entity issuing the KYC.                 |

#### Returns

| Name      | Type | Description                                     |
| --------- | ---- | ----------------------------------------------- |
| success\_ | bool | True when the grant succeeds without reverting. |

### grantRole

```solidity
function grantRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Grants a role to an account.

_The caller must hold the admin role of `_role` (resolved dynamically via `getRoleAdmin`). Reverts with `AccountAssignedToRole` if the account already holds the role. Emits `RoleGranted`._

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_role    | bytes32 | The role identifier to grant.    |
| \_account | address | The account to receive the role. |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the role was successfully granted. |

### hasRole

```solidity
function hasRole(bytes32 _role, address _account) external view returns (bool)
```

Checks whether an account holds a specific role.

#### Parameters

| Name      | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| \_role    | bytes32 | The role identifier to check. |
| \_account | address | The account to check.         |

#### Returns

| Name | Type | Description                                        |
| ---- | ---- | -------------------------------------------------- |
| \_0  | bool | True if `_account` holds `_role`, false otherwise. |

### heldBalanceOfAtSnapshot

```solidity
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder at the time of a given snapshot.

_Sums all hold escrow amounts active at `_snapshotID`, adjusted for any balance-adjustment factor recorded at that snapshot timestamp._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                   |
| --------- | ------- | ------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` recorded at `_snapshotID`. |

### heldBalanceOfAtSnapshotByPartition

```solidity
function heldBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                   |
| --------- | ------- | ----------------------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### identityRegistry

```solidity
function identityRegistry() external view returns (contract IIdentityRegistry)
```

Returns the address of the identity registry contract.

#### Returns

| Name | Type                       | Description                                           |
| ---- | -------------------------- | ----------------------------------------------------- |
| \_0  | contract IIdentityRegistry | The current identity registry as `IIdentityRegistry`. |

### increaseAllowance

```solidity
function increaseAllowance(address _spender, uint256 _addedValue) external nonpayable returns (bool)
```

Atomically increases the allowance granted to `spender` by the caller.

_Preferred alternative to {approve} as it avoids the read-modify-write allowance race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the zero address. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name         | Type    | Description                                 |
| ------------ | ------- | ------------------------------------------- |
| \_spender    | address | Address whose allowance is being increased. |
| \_addedValue | uint256 | Amount added to the existing allowance.     |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### initializeAccessControl

```solidity
function initializeAccessControl() external nonpayable
```

Initialises the AccessControl capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeAllowance

```solidity
function initializeAllowance() external nonpayable
```

Initialises the allowance capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeAmortization

```solidity
function initializeAmortization() external nonpayable
```

Initialises the amortization capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceAdjustments

```solidity
function initializeBalanceAdjustments() external nonpayable
```

Initialises the balance adjustment capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceTracker

```solidity
function initializeBalanceTracker() external nonpayable
```

Initialises the balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceTrackerAdjusted

```solidity
function initializeBalanceTrackerAdjusted() external nonpayable
```

Initialises the adjusted balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceTrackerAtSnapshot

```solidity
function initializeBalanceTrackerAtSnapshot() external nonpayable
```

Initialises the snapshot balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceTrackerAtSnapshotByPartition

```solidity
function initializeBalanceTrackerAtSnapshotByPartition() external nonpayable
```

Initialises the partition snapshot balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBalanceTrackerByPartition

```solidity
function initializeBalanceTrackerByPartition() external nonpayable
```

Initialises the partition balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBatchBurn

```solidity
function initializeBatchBurn() external nonpayable
```

Initialises the batch burn capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBatchController

```solidity
function initializeBatchController() external nonpayable
```

Initialises the batch controller capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBatchFreeze

```solidity
function initializeBatchFreeze() external nonpayable
```

Initialises the batch freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBatchMint

```solidity
function initializeBatchMint() external nonpayable
```

Initialises the batch mint capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBatchTransfer

```solidity
function initializeBatchTransfer() external nonpayable
```

Initialises the batch transfer capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBurn

```solidity
function initializeBurn() external nonpayable
```

Initialises the burn capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeBurnByPartition

```solidity
function initializeBurnByPartition() external nonpayable
```

Initialises the burn by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCap

```solidity
function initializeCap(uint256 _maxSupply, ICap.PartitionCap[] _partitionCap) external nonpayable
```

#### Parameters

| Name           | Type                | Description |
| -------------- | ------------------- | ----------- |
| \_maxSupply    | uint256             | undefined   |
| \_partitionCap | ICap.PartitionCap[] | undefined   |

### initializeCapByPartition

```solidity
function initializeCapByPartition() external nonpayable
```

Initialises the CapByPartition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeClearing

```solidity
function initializeClearing(bool _activateClearing) external nonpayable
```

Initializes the clearing module with the given activation state

_Can only be called once per token; subsequent calls revert with `FacetAlreadyRegistered`_

#### Parameters

| Name               | Type | Description                                            |
| ------------------ | ---- | ------------------------------------------------------ |
| \_activateClearing | bool | Whether clearing should be activated on initialization |

### initializeClearingAtSnapshot

```solidity
function initializeClearingAtSnapshot() external nonpayable
```

Initialises the clearing-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeClearingAtSnapshotByPartition

```solidity
function initializeClearingAtSnapshotByPartition() external nonpayable
```

Initialises the clearing-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeClearingByPartition

```solidity
function initializeClearingByPartition() external nonpayable
```

Initialises the clearing-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeClearingHoldByPartition

```solidity
function initializeClearingHoldByPartition() external nonpayable
```

Initialises the clearing-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCompliance

```solidity
function initializeCompliance(address _compliance) external nonpayable
```

Initialises the compliance capability on the token and wires the compliance contract.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

#### Parameters

| Name         | Type    | Description                                                   |
| ------------ | ------- | ------------------------------------------------------------- |
| \_compliance | address | Address of the compliance contract that authorises transfers. |

### initializeComplianceByPartition

```solidity
function initializeComplianceByPartition() external nonpayable
```

Initialises the compliance by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeControlList

```solidity
function initializeControlList(bool _isWhiteList) external nonpayable
```

One-time initialiser that sets the control list operating mode.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name          | Type | Description                                                                                                                     |
| ------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| \_isWhiteList | bool | `true` to operate as a whitelist (only listed addresses allowed), `false` to operate as a blacklist (listed addresses blocked). |

### initializeController

```solidity
function initializeController(bool _isControllable) external nonpayable
```

One-time initialiser that sets whether the token is controllable.

_Initial configuration. Can only be called once._

#### Parameters

| Name             | Type | Description                                     |
| ---------------- | ---- | ----------------------------------------------- |
| \_isControllable | bool | true is controllable, false is not controllable |

### initializeControllerByPartition

```solidity
function initializeControllerByPartition() external nonpayable
```

Initialises the controller by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeControllerHoldByPartition

```solidity
function initializeControllerHoldByPartition() external nonpayable
```

Initialises the controller hold by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCore

```solidity
function initializeCore(ICore.ERC20Metadata _metadata) external nonpayable
```

#### Parameters

| Name       | Type                | Description |
| ---------- | ------------------- | ----------- |
| \_metadata | ICore.ERC20Metadata | undefined   |

### initializeCoreAdjusted

```solidity
function initializeCoreAdjusted() external nonpayable
```

Initialises the core adjusted capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCoreAtSnapshot

```solidity
function initializeCoreAtSnapshot() external nonpayable
```

Initialises the core at snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCorporateActions

```solidity
function initializeCorporateActions() external nonpayable
```

Initialises the corporate actions capability on the token.

_Callable once; subsequent calls revert with FacetAlreadyRegistered. Requires DEFAULT_ADMIN_ROLE. Called by the factory during deployment._

### initializeCoupon

```solidity
function initializeCoupon() external nonpayable
```

Initialises the coupon capability on the token.

_Callable once; subsequent calls revert with FacetAlreadyRegistered. Requires DEFAULT_ADMIN_ROLE. Called by the factory during deployment._

### initializeCouponListing

```solidity
function initializeCouponListing() external nonpayable
```

Initialises the coupon listing capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCouponSecurityHolders

```solidity
function initializeCouponSecurityHolders() external nonpayable
```

Initialises the coupon security holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeCustomData

```solidity
function initializeCustomData() external nonpayable
```

Initialises the custom data capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeDeactivate

```solidity
function initializeDeactivate() external nonpayable
```

Initialises the deactivate capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeDividend

```solidity
function initializeDividend() external nonpayable
```

Initialises the dividend capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeDividendSecurityHolders

```solidity
function initializeDividendSecurityHolders() external nonpayable
```

Initialises the dividend security holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeDocumentation

```solidity
function initializeDocumentation() external nonpayable
```

Initialises the documentation capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeEIP712

```solidity
function initializeEIP712() external nonpayable
```

Initialises the EIP-712 capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeERC1594

```solidity
function initializeERC1594() external nonpayable
```

Initialises the ERC-1594 StorageWrapper on the calling contract.

_Can only be invoked once per contract; subsequent calls revert via `onlyFacetNotRegistered`._

### initializeERC20Permit

```solidity
function initializeERC20Permit() external nonpayable
```

Initialises the ERC20 permit capability on the token.

_Restricted to `DEFAULT_ADMIN_ROLE` by the implementation. Callable once and expected to revert with `FacetAlreadyRegistered` on subsequent calls. Emits `ERC20PermitInitialized` on success._

### initializeERC20Votes

```solidity
function initializeERC20Votes(bool _activated) external nonpayable
```

Initialises the ERC-20Votes capability on the token.

#### Parameters

| Name        | Type | Description                                                       |
| ----------- | ---- | ----------------------------------------------------------------- |
| \_activated | bool | Whether the voting feature should be active after initialisation. |

### initializeEvmAccessors

```solidity
function initializeEvmAccessors() external nonpayable
```

Marks the facet ready in the centralised initializer so a token that registers it reaches operational status. Reverts if already registered.

_Called once per deployed security — by the test factory immediately after deployment, or directly by the deployer in direct-deploy fixtures._

### initializeExternalControlLists

```solidity
function initializeExternalControlLists(address[] _controlLists) external nonpayable
```

One-time initialiser that populates the external control list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name           | Type      | Description                                                            |
| -------------- | --------- | ---------------------------------------------------------------------- |
| \_controlLists | address[] | Initial array of external control list contract addresses to register. |

### initializeExternalKycLists

```solidity
function initializeExternalKycLists(address[] _kycLists) external nonpayable
```

One-time initialiser that populates the external KYC list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name       | Type      | Description                                                        |
| ---------- | --------- | ------------------------------------------------------------------ |
| \_kycLists | address[] | Initial array of external KYC list contract addresses to register. |

### initializeExternalPauses

```solidity
function initializeExternalPauses(address[] _pauses) external nonpayable
```

One-time initialiser that populates the external pause list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name     | Type      | Description                                                     |
| -------- | --------- | --------------------------------------------------------------- |
| \_pauses | address[] | Initial array of external pause contract addresses to register. |

### initializeFixedRate

```solidity
function initializeFixedRate(IFixedRate.FixedRateData _initData) external nonpayable
```

#### Parameters

| Name       | Type                     | Description |
| ---------- | ------------------------ | ----------- |
| \_initData | IFixedRate.FixedRateData | undefined   |

### initializeFreeze

```solidity
function initializeFreeze() external nonpayable
```

Initialises the freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeFreezeAtSnapshot

```solidity
function initializeFreezeAtSnapshot() external nonpayable
```

Initialises the freeze-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeFreezeAtSnapshotByPartition

```solidity
function initializeFreezeAtSnapshotByPartition() external nonpayable
```

Initialises the freeze-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeHold

```solidity
function initializeHold() external nonpayable
```

Initialises the hold capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeHoldAtSnapshot

```solidity
function initializeHoldAtSnapshot() external nonpayable
```

Initialises the hold-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeHoldAtSnapshotByPartition

```solidity
function initializeHoldAtSnapshotByPartition() external nonpayable
```

Initialises the hold-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeHoldByPartition

```solidity
function initializeHoldByPartition() external nonpayable
```

Initialises the hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeIdentity

```solidity
function initializeIdentity(address _identityRegistry) external nonpayable
```

Initialises the identity capability on the token and wires the identity registry.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_identityRegistry | address | Address of the identity registry that vets token holders. |

### initializeInitializer

```solidity
function initializeInitializer(uint256 _maxInitializerFacetIndex) external nonpayable
```

Seeds the initializer storage with the batch size used by `setOperationalStatus` and marks the initializer facet itself as ready for its current version.

_Restricted to `DEFAULT_ADMIN_ROLE` and guarded against re-registration via `onlyFacetNotRegistered(RESOLVER_KEY_INITIALIZER)`. Emits `InitializerInitialized`._

#### Parameters

| Name                       | Type    | Description                                                         |
| -------------------------- | ------- | ------------------------------------------------------------------- |
| \_maxInitializerFacetIndex | uint256 | Maximum number of facets validated per `setOperationalStatus` call. |

### initializeInterestRateType

```solidity
function initializeInterestRateType(enum IInterestRate.RateType _rateType) external nonpayable
```

Initializes the coupon rate type during asset deployment.

_Intended to be called by the factory immediately after proxy creation. No role required — the factory is trusted at deploy time._

#### Parameters

| Name       | Type                        | Description                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------- |
| \_rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

### initializeInternalKyc

```solidity
function initializeInternalKyc(bool _activateInternalKyc) external nonpayable
```

Initialises the internal KYC capability on the token.

#### Parameters

| Name                  | Type | Description                                             |
| --------------------- | ---- | ------------------------------------------------------- |
| \_activateInternalKyc | bool | Whether to enable internal KYC enforcement immediately. |

### initializeKpiLinkedRate

```solidity
function initializeKpiLinkedRate(IKpiLinkedRate.InterestRate _interestRate, IKpiLinkedRate.ImpactData _impactData) external nonpayable
```

#### Parameters

| Name           | Type                        | Description |
| -------------- | --------------------------- | ----------- |
| \_interestRate | IKpiLinkedRate.InterestRate | undefined   |
| \_impactData   | IKpiLinkedRate.ImpactData   | undefined   |

### initializeKpis

```solidity
function initializeKpis() external nonpayable
```

Initialises the KPI capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeLoan

```solidity
function initializeLoan(ILoan.LoanDetailsData _loanDetailsData) external nonpayable
```

#### Parameters

| Name              | Type                  | Description |
| ----------------- | --------------------- | ----------- |
| \_loanDetailsData | ILoan.LoanDetailsData | undefined   |

### initializeLoansPortfolio

```solidity
function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData _loansPortfolioData) external nonpayable
```

#### Parameters

| Name                 | Type                                      | Description |
| -------------------- | ----------------------------------------- | ----------- |
| \_loansPortfolioData | ILoansPortfolio.LoansPortfolioDetailsData | undefined   |

### initializeLock

```solidity
function initializeLock() external nonpayable
```

Initialises the lock capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeLockAtSnapshot

```solidity
function initializeLockAtSnapshot() external nonpayable
```

Initialises the lock-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeLockAtSnapshotByPartition

```solidity
function initializeLockAtSnapshotByPartition() external nonpayable
```

Initialises the lock-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeLockByPartition

```solidity
function initializeLockByPartition() external nonpayable
```

Initialises the lock-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeMaturity

```solidity
function initializeMaturity(uint256 _maturityDate) external nonpayable
```

Sets the token maturity date exactly once during deployment.

_Called by the Factory immediately after the proxy is deployed. No role gate — the one-time guard is enforced by `onlyNotMaturityInitialized`, which reverts with `AlreadyInitialized` on any subsequent call. Persists the date via `MaturityDateStorageWrapper.initializeMaturity`.Emits {MaturityInitialized} with the contract address and the maturity date._

#### Parameters

| Name           | Type    | Description                                                                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| \_maturityDate | uint256 | Maturity timestamp to set (Unix epoch, in seconds). Must be strictly greater than zero and in the future at deployment time. |

### initializeMaturityByPartition

```solidity
function initializeMaturityByPartition() external nonpayable
```

Initialises the maturity-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeMintByPartition

```solidity
function initializeMintByPartition() external nonpayable
```

Initialises the mint-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeNominalValue

```solidity
function initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals, bytes3 _nominalValueCurrency) external nonpayable
```

Initialises the nominal value capability with amount, decimals, and currency.

_Callable once per token; subsequent calls revert with `AlreadyInitialized` via the `onlyNotNominalValueInitialized` modifier on the implementation. The factory calls this automatically when deploying security tokens, forwarding the currency from the security details so newly-deployed tokens land with the field populated._

#### Parameters

| Name                   | Type    | Description                                                         |
| ---------------------- | ------- | ------------------------------------------------------------------- |
| \_nominalValue         | uint256 | Initial nominal value amount.                                       |
| \_nominalValueDecimals | uint8   | Number of decimals applied to `_nominalValue`.                      |
| \_nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; pass `0x000000` to leave unset. |

### initializeNominalValueAtSnapshot

```solidity
function initializeNominalValueAtSnapshot() external nonpayable
```

Initialises the nominal-value-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeNonces

```solidity
function initializeNonces() external nonpayable
```

Initialises the nonces capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeOperator

```solidity
function initializeOperator() external nonpayable
```

Initialises the operator capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeOperatorByPartition

```solidity
function initializeOperatorByPartition() external nonpayable
```

Initialises the operator-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeOperatorClearingByPartition

```solidity
function initializeOperatorClearingByPartition() external nonpayable
```

Initialises the operator-clearing-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeOperatorClearingHoldByPartition

```solidity
function initializeOperatorClearingHoldByPartition() external nonpayable
```

Initialises the operator-clearing-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeOperatorHoldByPartition

```solidity
function initializeOperatorHoldByPartition() external nonpayable
```

Initialises the operator-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializePartitions

```solidity
function initializePartitions(bool _multiPartition) external nonpayable
```

Initialises the partitions capability on the token and sets multi-partition mode.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

#### Parameters

| Name             | Type | Description                                                       |
| ---------------- | ---- | ----------------------------------------------------------------- |
| \_multiPartition | bool | When `true`, the token accepts partitions other than the default. |

### initializePause

```solidity
function initializePause() external nonpayable
```

Initialises the pause capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializePrincipal

```solidity
function initializePrincipal() external nonpayable
```

Initialises the principal capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeProceedRecipients

```solidity
function initializeProceedRecipients(address[] _proceedRecipients, bytes[] _data) external nonpayable
```

Initialises the proceed-recipients capability with a seed list of recipients.

#### Parameters

| Name                | Type      | Description                                                                  |
| ------------------- | --------- | ---------------------------------------------------------------------------- |
| \_proceedRecipients | address[] | Initial array of proceed-recipient addresses to register.                    |
| \_data              | bytes[]   | Per-recipient arbitrary data, one entry per address in `_proceedRecipients`. |

### initializeProtectedByPartition

```solidity
function initializeProtectedByPartition() external nonpayable
```

Initialises the protected-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeProtectedClearingByPartition

```solidity
function initializeProtectedClearingByPartition() external nonpayable
```

Initialises the protected-clearing-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeProtectedClearingHoldByPartition

```solidity
function initializeProtectedClearingHoldByPartition() external nonpayable
```

Initialises the protected-clearing-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeProtectedHoldByPartition

```solidity
function initializeProtectedHoldByPartition() external nonpayable
```

Initialises the protected-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeProtectedPartitions

```solidity
function initializeProtectedPartitions(bool _arePartitionsProtected) external nonpayable returns (bool success_)
```

Initialises the protected-partitions capability with the given starting state.

_Called once during token deployment; reverts if the facet has already been registered._

#### Parameters

| Name                     | Type | Description                                                      |
| ------------------------ | ---- | ---------------------------------------------------------------- |
| \_arePartitionsProtected | bool | Initial protection state; `true` enables protection immediately. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | Always `true` when the call does not revert. |

### initializeRecovery

```solidity
function initializeRecovery() external nonpayable
```

Initialises the recovery capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeScheduledBalanceAdjustment

```solidity
function initializeScheduledBalanceAdjustment() external nonpayable
```

Initialises the scheduled balance adjustment capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeScheduledCrossOrderedTasks

```solidity
function initializeScheduledCrossOrderedTasks() external nonpayable
```

Initialises the scheduled-cross-ordered-tasks capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeSecurityHolders

```solidity
function initializeSecurityHolders() external nonpayable
```

Initialises the security-holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeSecurityHoldersAtSnapshot

```solidity
function initializeSecurityHoldersAtSnapshot() external nonpayable
```

Initialises the security-holders-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeSnapshots

```solidity
function initializeSnapshots() external nonpayable
```

Initialises the snapshots capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment. Emits `SnapshotsInitialized` after successful registration._

### initializeSnapshotsByPartition

```solidity
function initializeSnapshotsByPartition() external nonpayable
```

Initialises the snapshots-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeSsiManagement

```solidity
function initializeSsiManagement() external nonpayable
```

Initialises the SSI management capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeTransfer

```solidity
function initializeTransfer() external nonpayable
```

Initialises the transfer capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeTransferAndLock

```solidity
function initializeTransferAndLock() external nonpayable
```

Initialises the transfer-and-lock capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeTransferAndLockByPartition

```solidity
function initializeTransferAndLockByPartition() external nonpayable
```

Initialises the transfer-and-lock-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeTransferByPartition

```solidity
function initializeTransferByPartition() external nonpayable
```

Initialises the transfer-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeVoting

```solidity
function initializeVoting() external nonpayable
```

Initialises the voting capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### initializeVotingSecurityHolders

```solidity
function initializeVotingSecurityHolders() external nonpayable
```

Initialises the voting-security-holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isActivated

```solidity
function isActivated() external view returns (bool)
```

Returns whether the ERC-20Votes voting feature is currently active.

#### Returns

| Name | Type | Description                                            |
| ---- | ---- | ------------------------------------------------------ |
| \_0  | bool | True if the voting feature is active, false otherwise. |

### isAddressRecovered

```solidity
function isAddressRecovered(address _wallet) external view returns (bool)
```

Returns whether a wallet address has been marked as recovered.

#### Parameters

| Name     | Type    | Description       |
| -------- | ------- | ----------------- |
| \_wallet | address | Address to query. |

#### Returns

| Name | Type | Description                                                              |
| ---- | ---- | ------------------------------------------------------------------------ |
| \_0  | bool | True if the address has previously been recovered via {recoveryAddress}. |

### isAgent

```solidity
function isAgent(address _agent) external view returns (bool)
```

Checks whether an account holds the agent role.

_Checks if an account has the agent role._

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| \_agent | address | Address to query. |

#### Returns

| Name | Type | Description                                             |
| ---- | ---- | ------------------------------------------------------- |
| \_0  | bool | True if `_agent` holds the agent role, false otherwise. |

### isAuthorized

```solidity
function isAuthorized(address _account) external view returns (bool)
```

Returns whether `account` is authorised according to the external control list.

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_account | address | Address to check. |

#### Returns

| Name | Type | Description                                                |
| ---- | ---- | ---------------------------------------------------------- |
| \_0  | bool | True if the account is on the allow-list; false otherwise. |

### isCheckPointDate

```solidity
function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_)
```

Checks whether a KPI data point exists for `_project` at exactly `_date`.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_date    | uint256 | Unix timestamp to look up.       |
| \_project | address | Address of the project to query. |

#### Returns

| Name     | Type | Description                                               |
| -------- | ---- | --------------------------------------------------------- |
| exists\_ | bool | `true` if a data point is registered for (project, date). |

### isClearingActivated

```solidity
function isClearingActivated() external view returns (bool)
```

Returns whether the clearing functionality is activated or not

#### Returns

| Name | Type | Description                        |
| ---- | ---- | ---------------------------------- |
| \_0  | bool | True if activated, false otherwise |

### isControllable

```solidity
function isControllable() external view returns (bool)
```

In order to provide transparency over whether `controllerTransfer` / `controllerRedeem` are useable or not `isControllable` function will be used.

#### Returns

| Name | Type | Description                                                               |
| ---- | ---- | ------------------------------------------------------------------------- |
| \_0  | bool | bool `true` when controller address is non-zero otherwise return `false`. |

### isDeactivated

```solidity
function isDeactivated() external view returns (bool)
```

Reports whether the token has been deactivated.

#### Returns

| Name | Type | Description                                                        |
| ---- | ---- | ------------------------------------------------------------------ |
| \_0  | bool | True if `deactivate` has previously been invoked, false otherwise. |

### isExternalControlList

```solidity
function isExternalControlList(address _controlList) external view returns (bool)
```

Checks whether an address is present in the external control list.

#### Parameters

| Name          | Type    | Description       |
| ------------- | ------- | ----------------- |
| \_controlList | address | Address to check. |

#### Returns

| Name | Type | Description                                                                      |
| ---- | ---- | -------------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external control list contract, false otherwise. |

### isExternalKycList

```solidity
function isExternalKycList(address _kycList) external view returns (bool)
```

Checks whether an address is present in the external KYC list.

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_kycList | address | Address to check. |

#### Returns

| Name | Type | Description                                                                  |
| ---- | ---- | ---------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external KYC list contract, false otherwise. |

### isExternalPause

```solidity
function isExternalPause(address _pause) external view returns (bool)
```

Checks whether an address is present in the external pause list.

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| \_pause | address | Address to check. |

#### Returns

| Name | Type | Description                                                               |
| ---- | ---- | ------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external pause contract, false otherwise. |

### isExternallyGranted

```solidity
function isExternallyGranted(address _account, enum IKyc.KycStatus _kycStatus) external view returns (bool)
```

Checks whether an account holds the requested KYC status across all listed external KYC list contracts.

_Iterates every listed external KYC provider and calls `getKycStatus`. Returns `true` only when all providers confirm the exact `_kycStatus` for `_account` (AND semantics across providers). Returns `true` when no providers are listed._

#### Parameters

| Name        | Type                | Description                                                  |
| ----------- | ------------------- | ------------------------------------------------------------ |
| \_account   | address             | Address of the account whose KYC status is being evaluated.  |
| \_kycStatus | enum IKyc.KycStatus | The `IKyc.KycStatus` value that every provider must confirm. |

#### Returns

| Name | Type | Description                                                                        |
| ---- | ---- | ---------------------------------------------------------------------------------- |
| \_0  | bool | True if all listed providers confirm `_kycStatus` for `_account`, false otherwise. |

### isFrozen

```solidity
function isFrozen(address _userAddress) external view returns (bool)
```

Returns the freezing status of a wallet.

_returning true mean that some token or all of them are frozen_

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| \_userAddress | address | The address of the wallet on which isFrozen is called. |

#### Returns

| Name | Type | Description                      |
| ---- | ---- | -------------------------------- |
| \_0  | bool | The freezing status of a wallet. |

### isInControlList

```solidity
function isInControlList(address _account) external view returns (bool)
```

Checks whether an address is present in the control list set.

_Returns raw set membership regardless of the whitelist/blacklist mode. An address in the set is allowed in whitelist mode and blocked in blacklist mode._

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The address to query. |

#### Returns

| Name | Type | Description                                                     |
| ---- | ---- | --------------------------------------------------------------- |
| \_0  | bool | True if `_account` is in the control list set, false otherwise. |

### isInternalKycActivated

```solidity
function isInternalKycActivated() external view returns (bool)
```

Returns whether internal KYC enforcement is currently active.

#### Returns

| Name | Type | Description                                         |
| ---- | ---- | --------------------------------------------------- |
| \_0  | bool | True if internal KYC is activated, false otherwise. |

### isIssuable

```solidity
function isIssuable() external view returns (bool issuable_)
```

Returns whether further issuance is permitted for this security.

_Once a token returns `false` it must never return `true` again. Implementations read the issuance flag maintained by `ERC1594StorageWrapper`._

#### Returns

| Name       | Type | Description                                          |
| ---------- | ---- | ---------------------------------------------------- |
| issuable\_ | bool | True while new tokens may still be issued or minted. |

### isIssuer

```solidity
function isIssuer(address _issuer) external view returns (bool)
```

Checks whether an address is present in the trusted issuer list.

#### Parameters

| Name     | Type    | Description       |
| -------- | ------- | ----------------- |
| \_issuer | address | Address to check. |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | True if the address is a listed issuer, false otherwise. |

### isMultiPartition

```solidity
function isMultiPartition() external view returns (bool)
```

Indicates whether the token operates in multi-partition mode.

#### Returns

| Name | Type | Description                                                                         |
| ---- | ---- | ----------------------------------------------------------------------------------- |
| \_0  | bool | True if the token allows multiple partitions to be set and managed; false otherwise |

### isOperator

```solidity
function isOperator(address _operator, address _tokenHolder) external view returns (bool)
```

Determines whether `_operator` is an operator for all partitions of `_tokenHolder`

#### Parameters

| Name          | Type    | Description               |
| ------------- | ------- | ------------------------- |
| \_operator    | address | The operator to check     |
| \_tokenHolder | address | The token holder to check |

#### Returns

| Name | Type | Description                                                                 |
| ---- | ---- | --------------------------------------------------------------------------- |
| \_0  | bool | Whether the `_operator` is an operator for all partitions of `_tokenHolder` |

### isOperatorForPartition

```solidity
function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) external view returns (bool)
```

Returns whether `_operator` is an authorised operator for a specific partition of `_tokenHolder`.

_Returns `true` if `_operator` has been authorised for all partitions of `_tokenHolder` (via `authorizeOperator`) OR has explicit per-partition approval (via `authorizeOperatorByPartition`). Read-only; no access control applied._

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_partition   | bytes32 | The partition to query.                            |
| \_operator    | address | The operator address to check.                     |
| \_tokenHolder | address | The token holder whose partition is being queried. |

#### Returns

| Name | Type | Description                                                                  |
| ---- | ---- | ---------------------------------------------------------------------------- |
| \_0  | bool | bool `true` if `_operator` is authorised for `_partition` of `_tokenHolder`. |

### isProceedRecipient

```solidity
function isProceedRecipient(address _proceedRecipient) external view returns (bool)
```

Returns whether the given address is a registered proceed recipient.

#### Parameters

| Name               | Type    | Description       |
| ------------------ | ------- | ----------------- |
| \_proceedRecipient | address | Address to check. |

#### Returns

| Name | Type | Description                                                             |
| ---- | ---- | ----------------------------------------------------------------------- |
| \_0  | bool | True if the address is a registered proceed recipient; false otherwise. |

### issue

```solidity
function issue(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Issues new tokens to a token holder under the ERC-1594 semantics.

_Restricted to issuer or agent roles. Increases the total supply and emits `IERC1594.Issued`. Only callable in single-partition mode and when the token is unpaused; the destination must pass identity and compliance checks._

#### Parameters

| Name          | Type    | Description                                                              |
| ------------- | ------- | ------------------------------------------------------------------------ |
| \_tokenHolder | address | Recipient of the newly issued tokens.                                    |
| \_value       | uint256 | Amount of tokens to issue, denominated in base units.                    |
| \_data        | bytes   | Arbitrary data forwarded alongside the issuance for off-chain consumers. |

### issueByPartition

```solidity
function issueByPartition(IERC1410Types.IssueData _issueData) external nonpayable
```

#### Parameters

| Name        | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| \_issueData | IERC1410Types.IssueData | undefined   |

### loansPortfolioWithdraw

```solidity
function loansPortfolioWithdraw(address _assetAddress, address _to, uint256 _amount) external nonpayable returns (bool success_)
```

Withdraws an amount from a holdings asset to an external recipient.

#### Parameters

| Name           | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| \_assetAddress | address | Holdings asset funds are drawn from. |
| \_to           | address | Recipient of the withdrawn amount.   |
| \_amount       | uint256 | Amount to withdraw.                  |

#### Returns

| Name      | Type | Description                         |
| --------- | ---- | ----------------------------------- |
| success\_ | bool | True when the withdrawal completed. |

### lock

```solidity
function lock(uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Locks `_amount` tokens of `_tokenHolder` on the default partition until `_expirationTimestamp`.

_Single-partition convenience for `lockByPartition` against the default partition. The implementation enforces the unpaused state, the `ROLE_LOCKER`, single-partition mode, an unrecovered token holder and a future expiration timestamp; it emits `LockedByPartition`._

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| \_amount              | uint256 | The amount of tokens to lock.                        |
| \_tokenHolder         | address | The address whose tokens are locked.                 |
| \_expirationTimestamp | uint256 | Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name     | Type    | Description                                               |
| -------- | ------- | --------------------------------------------------------- |
| lockId\_ | uint256 | Identifier assigned to the new lock for the token holder. |

### lockByPartition

```solidity
function lockByPartition(bytes32 _partition, uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Locks `_amount` tokens of `_tokenHolder` on `_partition` until `_expirationTimestamp`.

_Callers must hold `ROLE_LOCKER`. The implementation enforces the unpaused state, a future expiration timestamp, an unrecovered token holder and the single-partition / default-partition rule. Emits `LockedByPartition`._

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| \_partition           | bytes32 | The partition the tokens are locked on.              |
| \_amount              | uint256 | The amount of tokens to lock.                        |
| \_tokenHolder         | address | The address whose tokens are locked.                 |
| \_expirationTimestamp | uint256 | Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name     | Type    | Description                                                         |
| -------- | ------- | ------------------------------------------------------------------- |
| lockId\_ | uint256 | Identifier assigned to the new lock for `(partition, tokenHolder)`. |

### lockedBalanceOfAtSnapshot

```solidity
function lockedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the locked balance of a token holder at the time of a given snapshot.

_Queries the adjusted locked-balance snapshot recorded by `LockStorageWrapper` at `_snapshotID`. The value reflects the lock escrow amount as it stood at the snapshot block, adjusted for any scheduled balance-adjustment factor._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| balance\_ | uint256 | The locked balance of `_tokenHolder` recorded at `_snapshotID`. |

### lockedBalanceOfAtSnapshotByPartition

```solidity
function lockedBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the locked balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| balance\_ | uint256 | The locked balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### mint

```solidity
function mint(address _to, uint256 _amount) external nonpayable
```

Mints new tokens to a recipient under the ERC-3643 semantics.

_Behaves as a thin alias over `issue` with an empty `data` payload. Restricted to issuer or agent roles and subject to the same pause, supply, identity and compliance constraints. Emits `IERC1594.Issued`._

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| \_to     | address | Recipient of the newly minted tokens.                |
| \_amount | uint256 | Amount of tokens to mint, denominated in base units. |

### name

```solidity
function name() external view returns (string)
```

Returns the name of the security token.

#### Returns

| Name | Type   | Description            |
| ---- | ------ | ---------------------- |
| \_0  | string | The token name string. |

### nominalValueAtSnapshot

```solidity
function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_)
```

Returns the nominal value of the token at the time of a given snapshot.

_Resolved against the `nominalValueSnapshots` series; falls back to the live nominal value when the snapshot id predates any recorded change._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name           | Type    | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| nominalValue\_ | uint256 | The nominal value recorded at `_snapshotID`. |

### nominalValueDecimalsAtSnapshot

```solidity
function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 nominalValueDecimals_)
```

Returns the decimals applied to the nominal value at the time of a given snapshot.

_Resolved against the `nominalValueDecimalsSnapshots` series; falls back to the live decimals value when the snapshot id predates any recorded change._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name                   | Type  | Description                                           |
| ---------------------- | ----- | ----------------------------------------------------- |
| nominalValueDecimals\_ | uint8 | The nominal value decimals recorded at `_snapshotID`. |

### nonces

```solidity
function nonces(address _owner) external view returns (uint256)
```

Returns the current nonce for `owner`.

#### Parameters

| Name    | Type    | Description                     |
| ------- | ------- | ------------------------------- |
| \_owner | address | Address whose nonce is queried. |

#### Returns

| Name | Type    | Description                      |
| ---- | ------- | -------------------------------- |
| \_0  | uint256 | Current nonce value for `owner`. |

### notifyLoanHoldingsAssetUpdate

```solidity
function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) external nonpayable returns (bool success_)
```

Broadcasts that the loan holdings asset&#39;s state has changed off-portfolio.

_Pure notification path — does not mutate the underlying loan; merely emits `LoanHoldingsAssetUpdated` so indexers refresh their view._

#### Parameters

| Name                   | Type    | Description                                          |
| ---------------------- | ------- | ---------------------------------------------------- |
| \_holdingsAssetAddress | address | Address of the loan holdings asset that was updated. |

#### Returns

| Name      | Type | Description                              |
| --------- | ---- | ---------------------------------------- |
| success\_ | bool | True when the notification was accepted. |

### numCheckpoints

```solidity
function numCheckpoints(address _account) external view returns (uint256)
```

Returns the total number of vote checkpoints recorded for an account.

#### Parameters

| Name      | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| \_account | address | Address whose checkpoint count is queried. |

#### Returns

| Name | Type    | Description                                       |
| ---- | ------- | ------------------------------------------------- |
| \_0  | uint256 | The number of checkpoints stored for the account. |

### onchainID

```solidity
function onchainID() external view returns (address)
```

Returns the onchainID address associated with the token.

#### Returns

| Name | Type    | Description                    |
| ---- | ------- | ------------------------------ |
| \_0  | address | The current onchainID address. |

### operatorClearingCreateHoldByPartition

```solidity
function operatorClearingCreateHoldByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, IHoldTypes.Hold _hold) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_hold                  | IHoldTypes.Hold                      | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### operatorClearingRedeemByPartition

```solidity
function operatorClearingRedeemByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### operatorClearingTransferByPartition

```solidity
function operatorClearingTransferByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount, address _to) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |
| \_to                    | address                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### operatorCreateHoldByPartition

```solidity
function operatorCreateHoldByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name           | Type            | Description |
| -------------- | --------------- | ----------- |
| \_partition    | bytes32         | undefined   |
| \_from         | address         | undefined   |
| \_hold         | IHoldTypes.Hold | undefined   |
| \_operatorData | bytes           | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### operatorRedeemByPartition

```solidity
function operatorRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

Decreases the total supply and the partition balance of a token holder on behalf of an authorised operator.

_The caller must be an authorised operator for `_partition` of `_tokenHolder`. Enforces partition-mode rules, unprotected-partition restrictions, and redemption-eligibility checks. Emits {RedeemedByPartition} via `TokenCoreOps.redeemByPartition`._

#### Parameters

| Name           | Type    | Description                                                   |
| -------------- | ------- | ------------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are redeemed.                 |
| \_tokenHolder  | address | The address whose tokens are redeemed.                        |
| \_value        | uint256 | The number of tokens to redeem.                               |
| \_data         | bytes   | Additional data attached to the redemption (passed to hooks). |
| \_operatorData | bytes   | Additional data attached by the operator.                     |

### operatorTransferByPartition

```solidity
function operatorTransferByPartition(IERC1410Types.OperatorTransferData _operatorTransferData) external nonpayable returns (bytes32)
```

#### Parameters

| Name                   | Type                               | Description |
| ---------------------- | ---------------------------------- | ----------- |
| \_operatorTransferData | IERC1410Types.OperatorTransferData | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### partitionsOf

```solidity
function partitionsOf(address _tokenHolder) external view returns (bytes32[])
```

Use to get the list of partitions `_tokenHolder` is associated with.

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| \_tokenHolder | address | An address corresponds whom partition list is queried. |

#### Returns

| Name | Type      | Description         |
| ---- | --------- | ------------------- |
| \_0  | bytes32[] | List of partitions. |

### partitionsOfAtSnapshot

```solidity
function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[])
```

Returns the list of partitions held by an account at the time of a given snapshot.

_Reverts with {SnapshotIdNull} when `_snapshotID` is zero, and with {SnapshotIdDoesNotExists} when the snapshot identifier does not correspond to a previously taken snapshot._

#### Parameters

| Name          | Type    | Description                                                   |
| ------------- | ------- | ------------------------------------------------------------- |
| \_snapshotID  | uint256 | Identifier of the snapshot to query.                          |
| \_tokenHolder | address | Address of the account whose partition list is being queried. |

#### Returns

| Name | Type      | Description                                                                    |
| ---- | --------- | ------------------------------------------------------------------------------ |
| \_0  | bytes32[] | Ordered list of partition identifiers held by `_tokenHolder` at snapshot time. |

### pause

```solidity
function pause() external nonpayable returns (bool success_)
```

Sets the token&#39;s internal pause flag, blocking all guarded operations.

_Requires `ROLE_PAUSER` and the token to be currently unpaused. Reverts with `IsPaused` if the token is already paused. Emits `Paused`._

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the token was successfully paused. |

### paused

```solidity
function paused() external view returns (bool)
```

Checks whether the token is currently paused.

_Returns `true` if the token&#39;s own pause flag is set, or if any registered external pause contract returns `true` from its `isPaused()` call (OR semantics). created to be compatible with ERC3643_

#### Returns

| Name | Type | Description                                                 |
| ---- | ---- | ----------------------------------------------------------- |
| \_0  | bool | True if the token is paused by any source, false otherwise. |

### permit

```solidity
function permit(address _owner, address _spender, uint256 _value, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external nonpayable
```

Approves a spender using an owner&#39;s off-chain ERC-2612 signature.

_Validates the deadline, owner nonce, EIP-712 digest, and recovered signer before updating allowance. Reverts with `ERC2612ExpiredSignature` or `ERC2612InvalidSigner` when validation fails._

#### Parameters

| Name       | Type    | Description                                     |
| ---------- | ------- | ----------------------------------------------- |
| \_owner    | address | Token holder granting the allowance.            |
| \_spender  | address | Address authorised to spend `owner` tokens.     |
| \_value    | uint256 | Allowance amount approved for `spender`.        |
| \_deadline | uint256 | Last timestamp at which the signature is valid. |
| \_v        | uint8   | Recovery identifier of the ECDSA signature.     |
| \_r        | bytes32 | First 32-byte word of the ECDSA signature.      |
| \_s        | bytes32 | Second 32-byte word of the ECDSA signature.     |

### protectPartitions

```solidity
function protectPartitions() external nonpayable returns (bool success_)
```

Activates the protected partitions mode.

_Disables free token transfers; callers must hold the required role for the partition._

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True when activation succeeds without reverting. |

### protectedClearingCreateHoldByPartition

```solidity
function protectedClearingCreateHoldByPartition(IClearingTypes.ProtectedClearingOperation _protectedClearingOperation, IHoldTypes.Hold _hold, bytes _signature) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                         | Type                                      | Description |
| ---------------------------- | ----------------------------------------- | ----------- |
| \_protectedClearingOperation | IClearingTypes.ProtectedClearingOperation | undefined   |
| \_hold                       | IHoldTypes.Hold                           | undefined   |
| \_signature                  | bytes                                     | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### protectedClearingRedeemByPartition

```solidity
function protectedClearingRedeemByPartition(IClearingTypes.ProtectedClearingOperation _protectedClearingOperation, uint256 _amount, bytes _signature) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                         | Type                                      | Description |
| ---------------------------- | ----------------------------------------- | ----------- |
| \_protectedClearingOperation | IClearingTypes.ProtectedClearingOperation | undefined   |
| \_amount                     | uint256                                   | undefined   |
| \_signature                  | bytes                                     | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### protectedClearingTransferByPartition

```solidity
function protectedClearingTransferByPartition(IClearingTypes.ProtectedClearingOperation _protectedClearingOperation, uint256 _amount, address _to, bytes _signature) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                         | Type                                      | Description |
| ---------------------------- | ----------------------------------------- | ----------- |
| \_protectedClearingOperation | IClearingTypes.ProtectedClearingOperation | undefined   |
| \_amount                     | uint256                                   | undefined   |
| \_to                         | address                                   | undefined   |
| \_signature                  | bytes                                     | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### protectedCreateHoldByPartition

```solidity
function protectedCreateHoldByPartition(bytes32 _partition, address _from, IHoldTypes.ProtectedHold _protectedHold, bytes _signature) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name            | Type                     | Description |
| --------------- | ------------------------ | ----------- |
| \_partition     | bytes32                  | undefined   |
| \_from          | address                  | undefined   |
| \_protectedHold | IHoldTypes.ProtectedHold | undefined   |
| \_signature     | bytes                    | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### protectedRedeemFromByPartition

```solidity
function protectedRedeemFromByPartition(bytes32 _partition, address _from, uint256 _amount, IProtectedPartitions.ProtectionData _protectionData) external nonpayable
```

#### Parameters

| Name             | Type                                | Description |
| ---------------- | ----------------------------------- | ----------- |
| \_partition      | bytes32                             | undefined   |
| \_from           | address                             | undefined   |
| \_amount         | uint256                             | undefined   |
| \_protectionData | IProtectedPartitions.ProtectionData | undefined   |

### protectedTransferFromByPartition

```solidity
function protectedTransferFromByPartition(bytes32 _partition, address _from, address _to, uint256 _amount, IProtectedPartitions.ProtectionData _protectionData) external nonpayable returns (bytes32)
```

#### Parameters

| Name             | Type                                | Description |
| ---------------- | ----------------------------------- | ----------- |
| \_partition      | bytes32                             | undefined   |
| \_from           | address                             | undefined   |
| \_to             | address                             | undefined   |
| \_amount         | uint256                             | undefined   |
| \_protectionData | IProtectedPartitions.ProtectionData | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### reclaimClearingOperationByPartition

```solidity
function reclaimClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### reclaimHoldByPartition

```solidity
function reclaimHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### recoveryAddress

```solidity
function recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) external nonpayable returns (bool success_)
```

Transfers the token balance and frozen amounts of a lost wallet to a new wallet, marking the lost wallet as recovered.

_Caller must hold `ROLE_AGENT`. The lost wallet must not have already been recovered, must carry no pending locks, holds, or clearings, and the token must be single-partition. Emits {RecoverySuccess} on success._

#### Parameters

| Name                | Type    | Description                                                       |
| ------------------- | ------- | ----------------------------------------------------------------- |
| \_lostWallet        | address | Address of the wallet that was lost.                              |
| \_newWallet         | address | Address of the replacement wallet that will receive the balances. |
| \_investorOnchainID | address | On-chain identity address of the investor (may be zero address).  |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | `true` when the recovery completes successfully. |

### redeem

```solidity
function redeem(uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from the caller&#39;s own balance under ERC-1594 semantics.

#### Parameters

| Name    | Type    | Description                                                                    |
| ------- | ------- | ------------------------------------------------------------------------------ |
| \_value | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data  | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

### redeemAtMaturityByPartition

```solidity
function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external nonpayable
```

Redeems a specified amount of tokens from a single partition at maturity.

_Emits a Transfer event on successful redemption via ERC1410StorageWrapper.redeemByPartition._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_tokenHolder | address | Address of the token holder to redeem. |
| \_partition   | bytes32 | Partition identifier to redeem from.   |
| \_amount      | uint256 | Amount of tokens to redeem.            |

### redeemByPartition

```solidity
function redeemByPartition(bytes32 _partition, uint256 _value, bytes _data) external nonpayable
```

Decreases totalSupply and the corresponding amount of the specified partition of msg.sender

_Only callable when not paused. In single-partition mode only the default partition is accepted. The caller must pass redemption authorization checks for the given partition and amount._

#### Parameters

| Name        | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| \_partition | bytes32 | The partition from which to redeem tokens  |
| \_value     | uint256 | The amount of tokens to redeem             |
| \_data      | bytes   | Additional data attached to the redemption |

### redeemFrom

```solidity
function redeemFrom(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from `_tokenHolder`&#39;s balance, analogous to `transferFrom`.

_Both `msg.sender` and `_tokenHolder` must not be recovered addresses._

#### Parameters

| Name          | Type    | Description                                                                    |
| ------------- | ------- | ------------------------------------------------------------------------------ |
| \_tokenHolder | address | Account whose tokens are redeemed.                                             |
| \_value       | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data        | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

### release

```solidity
function release(uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock on the default partition previously created with `lock`.

_Reverts with `WrongLockId` when `_lockId` is unknown for `_tokenHolder` and with `LockExpirationNotReached` before the lock&#39;s expiration. Emits `LockByPartitionReleased`._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_lockId      | uint256 | Identifier of the lock to release.     |
| \_tokenHolder | address | The address whose tokens are unlocked. |

#### Returns

| Name      | Type | Description                                                   |
| --------- | ---- | ------------------------------------------------------------- |
| success\_ | bool | True when the lock has been removed and the balance returned. |

### releaseAmortizationHold

```solidity
function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) external nonpayable
```

Releases the active hold for a specific token holder in an amortization.

_Must be called for every holder with an active hold before `cancelAmortization` can succeed. Reverts if the holder has no active hold for this amortization._

#### Parameters

| Name             | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| \_amortizationID | uint256 | The ID of the amortization.                                  |
| \_tokenHolder    | address | The address of the token holder whose hold will be released. |

### releaseByPartition

```solidity
function releaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock on `_partition` previously created with `lockByPartition`.

_Pause-gated and validated against single-partition mode. Reverts with `WrongLockId` when `_lockId` is unknown for `(_partition, _tokenHolder)` and with `LockExpirationNotReached` before the lock expires. Emits `LockByPartitionReleased`._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_partition   | bytes32 | The partition the lock lives on.       |
| \_lockId      | uint256 | Identifier of the lock to release.     |
| \_tokenHolder | address | The address whose tokens are returned. |

#### Returns

| Name      | Type | Description                                                   |
| --------- | ---- | ------------------------------------------------------------- |
| success\_ | bool | True when the lock has been removed and the balance returned. |

### releaseHoldByPartition

```solidity
function releaseHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier, uint256 _amount) external nonpayable returns (bool success_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |
| \_amount         | uint256                   | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### removeAgent

```solidity
function removeAgent(address _agent) external nonpayable
```

Revokes the agent role from an account.

_Can only be called by the role admin._

#### Parameters

| Name    | Type    | Description                          |
| ------- | ------- | ------------------------------------ |
| \_agent | address | Address whose agent role is revoked. |

### removeDocument

```solidity
function removeDocument(bytes32 _name) external nonpayable
```

Removes an existing document from the contract.

_Requires the caller to hold `ROLE_DOCUMENTER` and the token to be unpaused. Uses a swap-and-pop strategy to remove the entry from `docNames` in O(1), updating `docIndexes` accordingly. Emits {DocumentRemoved}. Reverts with {DocumentDoesNotExist} if `_name` is not registered._

#### Parameters

| Name   | Type    | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| \_name | bytes32 | Unique `bytes32` identifier of the document to remove. |

### removeExternalControlList

```solidity
function removeExternalControlList(address _controlList) external nonpayable returns (bool success_)
```

Removes an external control list contract from the list.

_Requires `ROLE_CONTROL_LIST_MANAGER` and the token to be unpaused. Reverts with `UnlistedControlList` if the address is not listed. Emits `RemovedFromExternalControlLists`._

#### Parameters

| Name          | Type    | Description                                              |
| ------------- | ------- | -------------------------------------------------------- |
| \_controlList | address | Address of the external control list contract to remove. |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### removeExternalKycList

```solidity
function removeExternalKycList(address _kycList) external nonpayable returns (bool success_)
```

Removes an external KYC list contract from the list.

_Requires `ROLE_KYC_MANAGER` and the token to be unpaused. Reverts with `UnlistedKycList` if the address is not listed. Emits `RemovedFromExternalKycLists`._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| \_kycList | address | Address of the external KYC list contract to remove. |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### removeExternalPause

```solidity
function removeExternalPause(address _pause) external nonpayable returns (bool success_)
```

Removes an external pause contract from the list.

_Requires `ROLE_PAUSE_MANAGER` and the token to be unpaused. Reverts with `UnlistedPause` if the address is not listed. Emits `RemovedFromExternalPauses`._

#### Parameters

| Name    | Type    | Description                                       |
| ------- | ------- | ------------------------------------------------- |
| \_pause | address | Address of the external pause contract to remove. |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### removeFromControlList

```solidity
function removeFromControlList(address _account) external nonpayable returns (bool success_)
```

Removes an address from the control list.

_Requires `ROLE_CONTROL_LIST` and the token to be unpaused. Reverts with `UnlistedAccount` if the address is not present. Emits `RemovedFromControlList`._

#### Parameters

| Name      | Type    | Description            |
| --------- | ------- | ---------------------- |
| \_account | address | The address to remove. |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | True if the address was successfully removed. |

### removeHoldingsAsset

```solidity
function removeHoldingsAsset(ILoansPortfolio.HoldingsAsset _holdingsAsset) external nonpayable returns (bool success_)
```

#### Parameters

| Name            | Type                          | Description |
| --------------- | ----------------------------- | ----------- |
| \_holdingsAsset | ILoansPortfolio.HoldingsAsset | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### removeIssuer

```solidity
function removeIssuer(address _issuer) external nonpayable returns (bool success_)
```

Removes an address from the trusted issuer list.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Reverts with `UnlistedIssuer` if the address is not listed. Emits `RemovedFromIssuerList`._

#### Parameters

| Name     | Type    | Description                      |
| -------- | ------- | -------------------------------- |
| \_issuer | address | Address of the issuer to remove. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the issuer was removed successfully. |

### removeProceedRecipient

```solidity
function removeProceedRecipient(address _proceedRecipient) external nonpayable
```

Removes an existing proceed recipient from the token.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| \_proceedRecipient | address | Address to remove from the proceed-recipient set. |

### renounceRole

```solidity
function renounceRole(bytes32 _role) external nonpayable returns (bool success_)
```

Allows the caller to renounce a role held by their own account.

_Operates on `msg.sender` only; no admin role is required. Reverts with `AccountNotAssignedToRole` if the caller does not hold the role. Emits `RoleRenounced`._

#### Parameters

| Name   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| \_role | bytes32 | The role identifier to renounce. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the role was successfully renounced. |

### resetSystemBlockNumber

```solidity
function resetSystemBlockNumber() external nonpayable
```

Clears the block number override, restoring `block.number`.

### resetSystemChainId

```solidity
function resetSystemChainId() external nonpayable
```

Clears the chain id override, restoring `block.chainid`.

### resetSystemSender

```solidity
function resetSystemSender() external nonpayable
```

Clears the sender override, restoring `msg.sender`.

### resetSystemTimestamp

```solidity
function resetSystemTimestamp() external nonpayable
```

Clears the timestamp override, restoring `block.timestamp`.

### revokeKyc

```solidity
function revokeKyc(address _account) external nonpayable returns (bool success_)
```

Revokes the KYC previously granted to an account.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_account | address | User whose KYC is being revoked. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the revocation succeeds without reverting. |

### revokeOperator

```solidity
function revokeOperator(address _operator) external nonpayable
```

Revokes authorisation of an operator previously given for all partitions of `msg.sender`

#### Parameters

| Name       | Type    | Description                             |
| ---------- | ------- | --------------------------------------- |
| \_operator | address | An address which is being de-authorised |

### revokeOperatorByPartition

```solidity
function revokeOperatorByPartition(bytes32 _partition, address _operator) external nonpayable
```

Revokes a previously authorised operator from a specific partition of `msg.sender`&#39;s tokens.

_The token must not be paused. `msg.sender` and `_operator` must be identified addresses and both must pass compliance checks. Reverts when the partition is incompatible with the token&#39;s partition mode. Emits {RevokedOperatorByPartition} via `ERC1410StorageWrapper.revokeOperatorByPartition`._

#### Parameters

| Name        | Type    | Description                                             |
| ----------- | ------- | ------------------------------------------------------- |
| \_partition | bytes32 | The partition from which the operator is de-authorised. |
| \_operator  | address | The address being de-authorised.                        |

### revokeRole

```solidity
function revokeRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Revokes a role from an account.

_The caller must hold the admin role of `_role` (resolved dynamically via `getRoleAdmin`). Reverts with `AccountNotAssignedToRole` if the account does not hold the role. Emits `RoleRevoked`._

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_role    | bytes32 | The role identifier to revoke. |
| \_account | address | The account to lose the role.  |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the role was successfully revoked. |

### scheduledCouponListingCount

```solidity
function scheduledCouponListingCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of scheduled coupon listing tasks.

#### Parameters

| Name              | Type | Description                                                                                                       |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, tasks belonging to cancelled corporate actions are counted; when false, only active tasks are counted. |

#### Returns

| Name | Type    | Description                                  |
| ---- | ------- | -------------------------------------------- |
| \_0  | uint256 | The count of scheduled coupon listing tasks. |

### scheduledCrossOrderedTaskCount

```solidity
function scheduledCrossOrderedTaskCount() external view returns (uint256)
```

Returns the number of queued cross-ordered scheduled tasks.

_Reads only the cross-ordered task queue and does not filter by due timestamp._

#### Returns

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| \_0  | uint256 | Number of scheduled cross-ordered tasks currently queued. |

### scheduledSnapshotCount

```solidity
function scheduledSnapshotCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of snapshots scheduled to run on this asset.

_Does not mutate state and reflects the current scheduled-task registry state._

#### Parameters

| Name              | Type | Description                                                                                                                         |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, snapshots belonging to cancelled corporate actions are counted; when false, only active scheduled snapshots are counted. |

#### Returns

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| \_0  | uint256 | Count of scheduled snapshot tasks. |

### setAddressFrozen

```solidity
function setAddressFrozen(address _userAddress, bool _freezeStatus) external nonpayable
```

Sets the address-level frozen status for a wallet, blocking or restoring all token operations for that address.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, and a non-zero non-recovered address. Not restricted to single-partition tokens. Emits `AddressFrozen`._

#### Parameters

| Name           | Type    | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| \_userAddress  | address | The address whose frozen status is to be updated.     |
| \_freezeStatus | bool    | `true` to freeze the address, `false` to unfreeze it. |

### setAmortization

```solidity
function setAmortization(IAmortization.Amortization _amortization) external nonpayable returns (bool success_, uint256 amortizationID_)
```

#### Parameters

| Name           | Type                       | Description |
| -------------- | -------------------------- | ----------- |
| \_amortization | IAmortization.Amortization | undefined   |

#### Returns

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| success\_        | bool    | undefined   |
| amortizationID\_ | uint256 | undefined   |

### setAmortizationHold

```solidity
function setAmortizationHold(uint256 _amortizationID, address _tokenHolder, uint256 _tokenAmount) external nonpayable returns (uint256 holdId_)
```

Creates or replaces the hold for a specific token holder in an amortization.

_If the holder already has a pending hold, it is released first._

#### Parameters

| Name             | Type    | Description                               |
| ---------------- | ------- | ----------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.               |
| \_tokenHolder    | address | The address of the token holder.          |
| \_tokenAmount    | uint256 | The number of tokens to lock in the hold. |

#### Returns

| Name     | Type    | Description                       |
| -------- | ------- | --------------------------------- |
| holdId\_ | uint256 | The ID of the newly created hold. |

### setCompliance

```solidity
function setCompliance(address _compliance) external nonpayable
```

Sets the compliance contract address

#### Parameters

| Name         | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| \_compliance | address | The address of the new compliance contract |

### setCoupon

```solidity
function setCoupon(ICouponTypes.Coupon _newCoupon) external nonpayable returns (uint256 couponID_)
```

#### Parameters

| Name        | Type                | Description |
| ----------- | ------------------- | ----------- |
| \_newCoupon | ICouponTypes.Coupon | undefined   |

#### Returns

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| couponID\_ | uint256 | undefined   |

### setCouponRateType

```solidity
function setCouponRateType(enum IInterestRate.RateType _rateType) external nonpayable
```

Sets the coupon rate type discriminator for this asset.

_Requires `ROLE_INTEREST_RATE_MANAGER`._

#### Parameters

| Name       | Type                        | Description                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------- |
| \_rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

### setCustomData

```solidity
function setCustomData(bytes32 _key, bytes[] _value) external nonpayable
```

Sets the ordered list of byte payloads associated with `_key`, replacing any previously stored value.

_Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused. Overwrites the entire array — there is no append semantics. Empty arrays are permitted and effectively clear the entry. Callers should be aware of gas costs proportional to the total payload size._

#### Parameters

| Name    | Type    | Description                                                  |
| ------- | ------- | ------------------------------------------------------------ |
| \_key   | bytes32 | The custom data key under which to store the value.          |
| \_value | bytes[] | The ordered list of byte payloads to associate with the key. |

### setDividend

```solidity
function setDividend(IDividendTypes.Dividend _newDividend) external nonpayable returns (uint256 dividendId_)
```

#### Parameters

| Name          | Type                    | Description |
| ------------- | ----------------------- | ----------- |
| \_newDividend | IDividendTypes.Dividend | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| dividendId\_ | uint256 | undefined   |

### setDocument

```solidity
function setDocument(bytes32 _name, string _uri, bytes32 _documentHash) external nonpayable
```

Attaches a new document to the contract or updates the URI and hash of an existing one.

_Requires the caller to hold `ROLE_DOCUMENTER` and the token to be unpaused. If `_name` is not yet registered, it is appended to the `docNames` array and its index is recorded in `docIndexes`. Emits {DocumentUpdated}._

#### Parameters

| Name           | Type    | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| \_name         | bytes32 | Unique `bytes32` identifier for the document. Must not be zero. |
| \_uri          | string  | Off-chain URI of the document. Must not be empty.               |
| \_documentHash | bytes32 | Keccak-256 content hash of the document. Must not be zero.      |

### setIdentityRegistry

```solidity
function setIdentityRegistry(address _identityRegistry) external nonpayable
```

Sets the identity registry contract address.

_Restricted to `ROLE_TREX_OWNER` and only callable when the token is not paused. Emits an `IdentityRegistryAdded` event from the underlying storage wrapper._

#### Parameters

| Name               | Type    | Description                                 |
| ------------------ | ------- | ------------------------------------------- |
| \_identityRegistry | address | The new identity registry contract address. |

### setKpiLinkedRateImpactData

```solidity
function setKpiLinkedRateImpactData(IKpiLinkedRate.ImpactData _newImpactData) external nonpayable
```

#### Parameters

| Name            | Type                      | Description |
| --------------- | ------------------------- | ----------- |
| \_newImpactData | IKpiLinkedRate.ImpactData | undefined   |

### setKpiLinkedRateInterestRate

```solidity
function setKpiLinkedRateInterestRate(IKpiLinkedRate.InterestRate _newInterestRate) external nonpayable
```

#### Parameters

| Name              | Type                        | Description |
| ----------------- | --------------------------- | ----------- |
| \_newInterestRate | IKpiLinkedRate.InterestRate | undefined   |

### setLoanDetails

```solidity
function setLoanDetails(ILoan.LoanDetailsData _loanDetailsData) external nonpayable
```

#### Parameters

| Name              | Type                  | Description |
| ----------------- | --------------------- | ----------- |
| \_loanDetailsData | ILoan.LoanDetailsData | undefined   |

### setMaxSupply

```solidity
function setMaxSupply(uint256 _maxSupply) external nonpayable returns (bool success_)
```

Updates the global maximum supply of the token.

_Requires `ROLE_CAP` and the token to be unpaused. The new cap must be non-zero and at least equal to the current adjusted total supply. Emits `MaxSupplySet`._

#### Parameters

| Name        | Type    | Description                    |
| ----------- | ------- | ------------------------------ |
| \_maxSupply | uint256 | The new global maximum supply. |

#### Returns

| Name      | Type | Description                               |
| --------- | ---- | ----------------------------------------- |
| success\_ | bool | True if the cap was successfully updated. |

### setMaxSupplyByPartition

```solidity
function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external nonpayable returns (bool success_)
```

Sets the maximum supply cap for a specific partition of the token.

_Reverts with `NewMaxSupplyCannotBeZero` when `_maxSupply` is zero, and with `NewMaxSupplyForPartitionTooLow` when it is below the partition&#39;s adjusted total supply. Emits {MaxSupplyByPartitionSet}._

#### Parameters

| Name        | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| \_partition | bytes32 | The partition identifier whose cap is being updated. |
| \_maxSupply | uint256 | The new maximum supply value for the partition.      |

#### Returns

| Name      | Type | Description                   |
| --------- | ---- | ----------------------------- |
| success\_ | bool | True when the cap is updated. |

### setName

```solidity
function setName(string _name) external nonpayable
```

Updates the token name. Restricted to the TREX owner role.

#### Parameters

| Name   | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| \_name | string | New name to assign to the token. |

### setNominalValue

```solidity
function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external nonpayable
```

Updates the nominal value amount and its decimals.

_Restricted to holders of `ROLE_NOMINAL_VALUE`._

#### Parameters

| Name                   | Type    | Description                              |
| ---------------------- | ------- | ---------------------------------------- |
| \_nominalValue         | uint256 | New nominal value amount.                |
| \_nominalValueDecimals | uint8   | New decimals applied to `_nominalValue`. |

### setNominalValueCurrency

```solidity
function setNominalValueCurrency(bytes3 _nominalValueCurrency) external nonpayable
```

Updates the ISO 4217 currency code attached to the nominal value.

_Restricted to holders of `ROLE_NOMINAL_VALUE`. Does not touch the value/decimals; callers must update those separately via `setNominalValue` if both change._

#### Parameters

| Name                   | Type   | Description                             |
| ---------------------- | ------ | --------------------------------------- |
| \_nominalValueCurrency | bytes3 | New ISO 4217 currency code as `bytes3`. |

### setOnchainID

```solidity
function setOnchainID(address _onchainID) external nonpayable
```

Sets the onchainID of the token to `_onchainID`.

_Restricted to `ROLE_TREX_OWNER` and only callable when the token is not paused. Emits an `UpdatedTokenInformation` event from the underlying storage wrapper._

#### Parameters

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| \_onchainID | address | The new onchainID address to associate with the token. |

### setOperationalStatus

```solidity
function setOperationalStatus() external nonpayable returns (bool isOperational_, uint256 lastFacetIndex_)
```

Walks the facet list of the active resolver-proxy `(configurationId, version)`, in batches of `maxInitializerFacetIndex`, and marks the configuration operational once every facet is ready.

_Idempotent and resumable: if already operational, returns immediately; if partial progress is stored, resumes from the recorded index; otherwise starts from index 0. Emits `OperationalStatusSet` on completion or `OperationalStatusPartialSet` otherwise._

#### Returns

| Name             | Type    | Description                                                                                                                       |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| isOperational\_  | bool    | True when every facet of the configuration version is ready.                                                                      |
| lastFacetIndex\_ | uint256 | Index reached in this call; on partial progress, the next call resumes here. Zero when the configuration was already operational. |

### setRate

```solidity
function setRate(uint256 _newRate, uint8 _newRateDecimals) external nonpayable
```

Updates the fixed interest rate.

_Reverts with `InterestRateIsFixed` if the rate has been locked. Requires an authorised operator role._

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| \_newRate         | uint256 | New scaled rate value.            |
| \_newRateDecimals | uint8   | Decimal precision for `_newRate`. |

### setRevocationRegistryAddress

```solidity
function setRevocationRegistryAddress(address _revocationRegistryAddress) external nonpayable returns (bool success_)
```

Sets the address of the revocation registry contract used for SSI credential validation.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Emits `RevocationRegistryUpdated`._

#### Parameters

| Name                        | Type    | Description                               |
| --------------------------- | ------- | ----------------------------------------- |
| \_revocationRegistryAddress | address | New revocation registry contract address. |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | True if the address was updated successfully. |

### setScheduledBalanceAdjustment

```solidity
function setScheduledBalanceAdjustment(IScheduledBalanceAdjustment.ScheduledBalanceAdjustment _newBalanceAdjustment) external nonpayable returns (uint256 balanceAdjustmentID_)
```

#### Parameters

| Name                   | Type                                                   | Description |
| ---------------------- | ------------------------------------------------------ | ----------- |
| \_newBalanceAdjustment | IScheduledBalanceAdjustment.ScheduledBalanceAdjustment | undefined   |

#### Returns

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| balanceAdjustmentID\_ | uint256 | undefined   |

### setSymbol

```solidity
function setSymbol(string _symbol) external nonpayable
```

Updates the token symbol. Restricted to the TREX owner role.

#### Parameters

| Name     | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| \_symbol | string | New symbol to assign to the token. |

### setVoting

```solidity
function setVoting(IVotingTypes.Voting _newVoting) external nonpayable returns (uint256 voteID_)
```

#### Parameters

| Name        | Type                | Description |
| ----------- | ------------------- | ----------- |
| \_newVoting | IVotingTypes.Voting | undefined   |

#### Returns

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| voteID\_ | uint256 | undefined   |

### symbol

```solidity
function symbol() external view returns (string)
```

Returns the symbol of the security token.

#### Returns

| Name | Type   | Description              |
| ---- | ------ | ------------------------ |
| \_0  | string | The token symbol string. |

### takeSnapshot

```solidity
function takeSnapshot() external nonpayable returns (uint256 snapshotID_)
```

Creates a snapshot of current balances and total supplies.

_Records a new snapshot identifier and defers per-account and supply writes until the next relevant balance mutation. Implementations may revert if the caller is not authorised. Emits `SnapshotTaken` on success._

#### Returns

| Name         | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| snapshotID\_ | uint256 | Identifier assigned to the created snapshot. |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Returns the total token supply across all partitions, simulating non-triggered supply adjustments up to the current timestamp.

#### Returns

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| \_0  | uint256 | The adjusted total supply |

### totalSupplyAtSnapshot

```solidity
function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_)
```

Returns the total supply at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| totalSupply\_ | uint256 | The total supply recorded at `_snapshotID`. |

### totalSupplyAtSnapshotByPartition

```solidity
function totalSupplyAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID) external view returns (uint256 totalSupply_)
```

Returns the total supply for a given partition at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_partition  | bytes32 | The partition identifier.                                        |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name          | Type    | Description                                                  |
| ------------- | ------- | ------------------------------------------------------------ |
| totalSupply\_ | uint256 | The total supply for `_partition` recorded at `_snapshotID`. |

### totalSupplyByPartition

```solidity
function totalSupplyByPartition(bytes32 _partition) external view returns (uint256)
```

Returns the total token supply within a specific partition, simulating non-triggered supply adjustments up to the current timestamp.

#### Parameters

| Name        | Type    | Description              |
| ----------- | ------- | ------------------------ |
| \_partition | bytes32 | The partition identifier |

#### Returns

| Name | Type    | Description                                 |
| ---- | ------- | ------------------------------------------- |
| \_0  | uint256 | The adjusted total supply for the partition |

### transfer

```solidity
function transfer(address _to, uint256 _amount) external nonpayable returns (bool)
```

Moves `amount` tokens from the caller to `to`.

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| \_to     | address | Recipient address.            |
| \_amount | uint256 | Number of tokens to transfer. |

#### Returns

| Name | Type | Description                     |
| ---- | ---- | ------------------------------- |
| \_0  | bool | True if the transfer succeeded. |

### transferAndLock

```solidity
function transferAndLock(address _to, uint256 _amount, bytes _data, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Transfers tokens to a specified address and locks them until the expiration timestamp using the default partition.

#### Parameters

| Name                  | Type    | Description                                                          |
| --------------------- | ------- | -------------------------------------------------------------------- |
| \_to                  | address | The address to which tokens will be transferred and locked.          |
| \_amount              | uint256 | The amount of tokens to be transferred and locked.                   |
| \_data                | bytes   | Additional data with no specified format, sent in the call to `_to`. |
| \_expirationTimestamp | uint256 | The timestamp until which the tokens will be locked.                 |

#### Returns

| Name     | Type    | Description                                                            |
| -------- | ------- | ---------------------------------------------------------------------- |
| lockId\_ | uint256 | The identifier assigned to the new hold created for the locked tokens. |

### transferAndLockByPartition

```solidity
function transferAndLockByPartition(bytes32 _partition, address _to, uint256 _amount, bytes _data, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Transfers `_amount` tokens from the caller&#39;s `_partition` balance to `_to` and locks them until `_expirationTimestamp`.

_Callers must hold `ROLE_LOCKER`. The token must be unpaused and `_expirationTimestamp` must be in the future. In single-partition mode only the default partition is permitted; protected partitions require the wildcard role. Emits `PartitionTransferredAndLocked`, `TransferByPartition` (via `ERC1410StorageWrapper`), and `Transfer` (via `ERC1410StorageWrapper`)._

#### Parameters

| Name                  | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| \_partition           | bytes32 | The partition from which tokens are transferred and locked.   |
| \_to                  | address | The recipient of the transferred and locked tokens.           |
| \_amount              | uint256 | The amount of tokens to transfer and lock.                    |
| \_data                | bytes   | Additional data forwarded to the recipient.                   |
| \_expirationTimestamp | uint256 | Unix timestamp until which the transferred tokens are locked. |

#### Returns

| Name     | Type    | Description                                                        |
| -------- | ------- | ------------------------------------------------------------------ |
| lockId\_ | uint256 | Identifier assigned to the resulting lock for `(_partition, _to)`. |

### transferByPartition

```solidity
function transferByPartition(bytes32 _partition, IERC1410Types.BasicTransferInfo _basicTransferInfo, bytes _data) external nonpayable returns (bytes32)
```

#### Parameters

| Name                | Type                            | Description |
| ------------------- | ------------------------------- | ----------- |
| \_partition         | bytes32                         | undefined   |
| \_basicTransferInfo | IERC1410Types.BasicTransferInfo | undefined   |
| \_data              | bytes                           | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _amount) external nonpayable returns (bool)
```

Moves `amount` tokens from `from` to `to` using the caller&#39;s allowance.

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| \_from   | address | Source address.               |
| \_to     | address | Destination address.          |
| \_amount | uint256 | Number of tokens to transfer. |

#### Returns

| Name | Type | Description                     |
| ---- | ---- | ------------------------------- |
| \_0  | bool | True if the transfer succeeded. |

### transferFromWithData

```solidity
function transferFromWithData(address _from, address _to, uint256 _value, bytes _data) external nonpayable
```

Transfers tokens from `_from` to `_to` with additional `_data` attached.

_Caller must have a sufficient allowance set by `_from`. Only available in single-partition mode._

#### Parameters

| Name    | Type    | Description                              |
| ------- | ------- | ---------------------------------------- |
| \_from  | address | Source address.                          |
| \_to    | address | Destination address.                     |
| \_value | uint256 | Amount of tokens to transfer.            |
| \_data  | bytes   | Arbitrary data attached to the transfer. |

### transferWithData

```solidity
function transferWithData(address _to, uint256 _value, bytes _data) external nonpayable
```

Transfers tokens to `_to` with additional `_data` attached.

_Only available in single-partition mode._

#### Parameters

| Name    | Type    | Description                              |
| ------- | ------- | ---------------------------------------- |
| \_to    | address | Recipient address.                       |
| \_value | uint256 | Amount of tokens to transfer.            |
| \_data  | bytes   | Arbitrary data attached to the transfer. |

### triggerAndSyncAll

```solidity
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external nonpayable
```

Triggers pending scheduled tasks and synchronises the balance snapshot for a transfer pair.

_Delegates to `TokenCoreOps.triggerAndSyncAll`. Must be called before any token transfer that should reflect the latest adjustment state. The token must not be paused._

#### Parameters

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| \_partition | bytes32 | Partition identifier of the transfer.             |
| \_from      | address | Sender address whose snapshot is synchronised.    |
| \_to        | address | Recipient address whose snapshot is synchronised. |

### triggerPendingScheduledCrossOrderedTasks

```solidity
function triggerPendingScheduledCrossOrderedTasks() external nonpayable returns (uint256)
```

Triggers all currently due cross-ordered scheduled tasks.

_Mutates scheduled task queues and may trigger one due downstream task per cross-ordered task. A failing task reverts the entire call._

#### Returns

| Name | Type    | Description                                             |
| ---- | ------- | ------------------------------------------------------- |
| \_0  | uint256 | Number of cross-ordered tasks processed from the queue. |

### triggerScheduledCrossOrderedTasks

```solidity
function triggerScheduledCrossOrderedTasks(uint256 _max) external nonpayable returns (uint256)
```

Triggers due cross-ordered scheduled tasks up to a requested maximum.

_Mutates scheduled task queues and may trigger one due downstream task per cross-ordered task. Passing zero may be treated by implementations as no explicit limit._

#### Parameters

| Name  | Type    | Description                                           |
| ----- | ------- | ----------------------------------------------------- |
| \_max | uint256 | Maximum number of due cross-ordered tasks to process. |

#### Returns

| Name | Type    | Description                                             |
| ---- | ------- | ------------------------------------------------------- |
| \_0  | uint256 | Number of cross-ordered tasks processed from the queue. |

### unfreezePartialTokens

```solidity
function unfreezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Unfreezes a specific amount of previously frozen tokens for a wallet, restoring them to the liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Validates that `_amount` does not exceed the currently frozen balance. Updates balance snapshots before mutating frozen state. Emits `TokensUnfrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| \_userAddress | address | The address whose tokens are to be unfrozen. |
| \_amount      | uint256 | The amount of tokens to unfreeze.            |

### unpause

```solidity
function unpause() external nonpayable returns (bool success_)
```

Clears the token&#39;s internal pause flag, restoring guarded operations.

_Requires `ROLE_PAUSER` and the token&#39;s internal flag to be set. Reverts with `IsUnpaused` if the internal flag is already cleared. Emits `Unpaused`. Note: if any external pause contract remains paused, `isPaused` will still return `true` after this call._

#### Returns

| Name      | Type | Description                                               |
| --------- | ---- | --------------------------------------------------------- |
| success\_ | bool | True if the internal pause flag was successfully cleared. |

### unprotectPartitions

```solidity
function unprotectPartitions() external nonpayable returns (bool success_)
```

Deactivates the protected partitions mode.

_Re-enables free token transfers regardless of partition role._

#### Returns

| Name      | Type | Description                                        |
| --------- | ---- | -------------------------------------------------- |
| success\_ | bool | True when deactivation succeeds without reverting. |

### updateConfig

```solidity
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external nonpayable
```

For the current BLR, update its configuration identifier and version.

#### Parameters

| Name                 | Type    | Description                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| \_newConfigurationId | bytes32 | The new configuration identifier to apply.                |
| \_newVersion         | uint256 | The version number associated with the new configuration. |

### updateConfigVersion

```solidity
function updateConfigVersion(uint256 _newVersion) external nonpayable
```

For the current BLR and configuration, update the used version.

#### Parameters

| Name         | Type    | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| \_newVersion | uint256 | The new version number to set for the current configuration. |

### updateExternalControlLists

```solidity
function updateExternalControlLists(address[] _controlLists, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external control list contracts in a single transaction.

_Requires `ROLE_CONTROL_LIST_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Reverts with `ExternalControlListsNotUpdated` on failure. Emits `ExternalControlListsUpdated`._

#### Parameters

| Name           | Type      | Description                                                                   |
| -------------- | --------- | ----------------------------------------------------------------------------- |
| \_controlLists | address[] | Array of external control list contract addresses to process.                 |
| \_actives      | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

### updateExternalKycLists

```solidity
function updateExternalKycLists(address[] _kycLists, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external KYC list contracts in a single transaction.

_Requires `ROLE_KYC_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Reverts with `ExternalKycListsNotUpdated` on failure. Emits `ExternalKycListsUpdated`._

#### Parameters

| Name       | Type      | Description                                                                   |
| ---------- | --------- | ----------------------------------------------------------------------------- |
| \_kycLists | address[] | Array of external KYC list contract addresses to process.                     |
| \_actives  | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

### updateExternalPauses

```solidity
function updateExternalPauses(address[] _pauses, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external pause contracts in a single transaction.

_Requires `ROLE_PAUSE_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Emits `ExternalPausesUpdated`._

#### Parameters

| Name      | Type      | Description                                                                   |
| --------- | --------- | ----------------------------------------------------------------------------- |
| \_pauses  | address[] | Array of external pause contract addresses to process.                        |
| \_actives | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

### updateLockExpiration

```solidity
function updateLockExpiration(address _tokenHolder, uint256 _lockId, uint256 _newExpirationTimestamp) external nonpayable returns (bool success_)
```

Updates the expiration timestamp of an existing lock on the default partition.

_Callers must hold `ROLE_LOCKER`. The new timestamp must be in the future. Both shortening and extending are allowed — this is an intentional trusted-role design: a second locker can correct an excessively far expiration set by a compromised account, while an admin can revoke the malicious locker&#39;s role if needed. Emits `LockExpirationUpdated`._

#### Parameters

| Name                     | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| \_tokenHolder            | address | The address whose lock expiration is being updated.      |
| \_lockId                 | uint256 | Identifier of the lock to update.                        |
| \_newExpirationTimestamp | uint256 | New Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the expiration timestamp has been updated. |

### updateLockExpirationByPartition

```solidity
function updateLockExpirationByPartition(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _newExpirationTimestamp) external nonpayable returns (bool success_)
```

Updates the expiration timestamp of an existing lock on `_partition`.

_Callers must hold `ROLE_LOCKER`. The new timestamp must be in the future. Both shortening and extending are allowed — this is an intentional trusted-role design: a second locker can correct an excessively far expiration set by a compromised account, while an admin can revoke the malicious locker&#39;s role if needed. Emits `LockExpirationUpdated`._

#### Parameters

| Name                     | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| \_partition              | bytes32 | The partition the lock lives on.                         |
| \_tokenHolder            | address | The address whose lock expiration is being updated.      |
| \_lockId                 | uint256 | Identifier of the lock to update.                        |
| \_newExpirationTimestamp | uint256 | New Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the expiration timestamp has been updated. |

### updateMaturityDate

```solidity
function updateMaturityDate(uint256 _newMaturityDate) external nonpayable returns (bool success_)
```

Updates the token maturity date to a new timestamp.

_Caller must hold `ROLE_MATURITY_MANAGER`. Contract must be unpaused. `_newMaturityDate` must satisfy the validity constraint enforced by `onlyValidMaturityDate` — the new date must be strictly greater than the current maturity date. Persists the new date via `MaturityDateStorageWrapper.setMaturityDate`.Emits {MaturityDateUpdated} with the contract address, the new maturity date, and the previous maturity date._

#### Parameters

| Name              | Type    | Description                                             |
| ----------------- | ------- | ------------------------------------------------------- |
| \_newMaturityDate | uint256 | New maturity timestamp to set (Unix epoch, in seconds). |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | Always `true` on successful execution. |

### updateMaxInitializerFacetIndex

```solidity
function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external nonpayable
```

Updates the batch size used by `setOperationalStatus` to bound per-call gas usage.

_Restricted to `DEFAULT_ADMIN_ROLE`. Emits `MaxInitializerFacetIndexUpdated`._

#### Parameters

| Name                          | Type    | Description                                   |
| ----------------------------- | ------- | --------------------------------------------- |
| \_newMaxInitializerFacetIndex | uint256 | New batch size, in number of facets per call. |

### updateProceedRecipientData

```solidity
function updateProceedRecipientData(address _proceedRecipient, bytes _data) external nonpayable
```

Updates the arbitrary data stored for an existing proceed recipient.

#### Parameters

| Name               | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| \_proceedRecipient | address | Address of the recipient whose data should be updated. |
| \_data             | bytes   | New arbitrary data to store for the recipient.         |

### updateReplacementEnabled

```solidity
function updateReplacementEnabled(bool _newReplacementEnabled) external nonpayable
```

For the current BLR update its configuration

#### Parameters

| Name                    | Type | Description                           |
| ----------------------- | ---- | ------------------------------------- |
| \_newReplacementEnabled | bool | The replacement enabled flag to set\* |

### updateResolver

```solidity
function updateResolver(contract IBusinessLogicResolver _newResolver, bytes32 _newConfigurationId, uint256 _newVersion, bool _newReplacementEnabled) external nonpayable
```

Replaces the Business Logic Resolver with a new one, setting configuration and version.

#### Parameters

| Name                    | Type                            | Description                                                   |
| ----------------------- | ------------------------------- | ------------------------------------------------------------- |
| \_newResolver           | contract IBusinessLogicResolver | The new BLR contract address to wire into the proxy.          |
| \_newConfigurationId    | bytes32                         | The configuration identifier to activate on the new resolver. |
| \_newVersion            | uint256                         | The version number associated with the new configuration.     |
| \_newReplacementEnabled | bool                            | The replacement enabled flag to set.                          |

### version

```solidity
function version() external view returns (string)
```

Returns the ERC3643 version string of the token.

#### Returns

| Name | Type   | Description                                    |
| ---- | ------ | ---------------------------------------------- |
| \_0  | string | The version string (e.g. `&quot;4.0.0&quot;`). |

## Events

### AccessControlInitialized

```solidity
event AccessControlInitialized()
```

Emitted once when the AccessControl capability is initialised on a token.

_Fires exclusively from `initializeAccessControl` after the registration succeeds._

### AddedToControlList

```solidity
event AddedToControlList(address indexed operator, address indexed account)
```

Emitted when an account is added to the control list.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition. |
| account `indexed`  | address | Address of the account that was added.            |

### AddedToExternalControlLists

```solidity
event AddedToExternalControlLists(address indexed operator, address controlList)
```

Emitted when an external control list contract is added to the list.

#### Parameters

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition.             |
| controlList        | address | Address of the external control list contract that was added. |

### AddedToExternalKycLists

```solidity
event AddedToExternalKycLists(address indexed operator, address kycList)
```

Emitted when an external KYC list contract is added to the list.

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition.         |
| kycList            | address | Address of the external KYC list contract that was added. |

### AddedToExternalPauses

```solidity
event AddedToExternalPauses(address indexed operator, address pause)
```

Emitted when an external pause contract is added to the list.

#### Parameters

| Name               | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the addition.      |
| pause              | address | Address of the external pause contract that was added. |

### AddedToIssuerList

```solidity
event AddedToIssuerList(address indexed operator, address indexed issuer)
```

Emitted when an issuer is added to the trusted issuer list.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition. |
| issuer `indexed`   | address | Address of the issuer that was added.             |

### AddressFrozen

```solidity
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner)
```

Emitted when a wallet&#39;s address-level frozen status changes.

#### Parameters

| Name                  | Type    | Description                                                         |
| --------------------- | ------- | ------------------------------------------------------------------- |
| userAddress `indexed` | address | The wallet address whose freeze status was updated.                 |
| isFrozen `indexed`    | bool    | The new freeze status; `true` means frozen, `false` means unfrozen. |
| owner `indexed`       | address | Address of the agent who triggered the status change.               |

### AdjustmentBalanceSet

```solidity
event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals)
```

Emitted when an immediate balance adjustment is applied.

#### Parameters

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| operator `indexed` | address | Address that triggered the adjustment.                        |
| factor             | uint256 | Numerator of the adjustment ratio.                            |
| decimals           | uint8   | Denominator exponent; effective ratio = factor / 10^decimals. |

### AgentAdded

```solidity
event AgentAdded(address indexed agent)
```

Emitted when an agent is granted transfer-management permissions.

#### Parameters

| Name            | Type    | Description                       |
| --------------- | ------- | --------------------------------- |
| agent `indexed` | address | Address of the newly added agent. |

### AgentRemoved

```solidity
event AgentRemoved(address indexed agent)
```

Emitted when an agent&#39;s transfer-management permissions are revoked.

#### Parameters

| Name            | Type    | Description                   |
| --------------- | ------- | ----------------------------- |
| agent `indexed` | address | Address of the removed agent. |

### AllowanceInitialized

```solidity
event AllowanceInitialized()
```

Emitted once when the allowance capability is initialised on a token.

_Fires exclusively from `initializeAllowance` after the storage write succeeds._

### AmortizationCancelled

```solidity
event AmortizationCancelled(uint256 amortizationId, address indexed operator)
```

Emitted when an amortization is cancelled.

#### Parameters

| Name               | Type    | Description                               |
| ------------------ | ------- | ----------------------------------------- |
| amortizationId     | uint256 | Identifier of the cancelled amortization. |
| operator `indexed` | address | Address that performed the cancellation.  |

### AmortizationForceCancelled

```solidity
event AmortizationForceCancelled(uint256 amortizationId, address indexed operator)
```

Emitted when an admin force-cancels an amortization, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| amortizationId     | uint256 | Identifier of the force-cancelled amortization. |
| operator `indexed` | address | Address that performed the force-cancellation.  |

### AmortizationHoldReleased

```solidity
event AmortizationHoldReleased(bytes32 indexed corporateActionId, uint256 indexed amortizationID, address indexed tokenHolder, uint256 holdId)
```

Emitted when a hold is released for a token holder in an amortization.

#### Parameters

| Name                        | Type    | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationID `indexed`    | uint256 | Identifier of the amortization.                       |
| tokenHolder `indexed`       | address | Address of the token holder whose hold was released.  |
| holdId                      | uint256 | ID of the released hold.                              |

### AmortizationHoldSet

```solidity
event AmortizationHoldSet(bytes32 indexed corporateActionId, uint256 indexed amortizationID, address indexed tokenHolder, uint256 holdId, uint256 tokenAmount)
```

Emitted when a hold is created or replaced for a token holder in an amortization.

#### Parameters

| Name                        | Type    | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationID `indexed`    | uint256 | Identifier of the amortization.                       |
| tokenHolder `indexed`       | address | Address of the token holder.                          |
| holdId                      | uint256 | ID of the newly created hold.                         |
| tokenAmount                 | uint256 | Amount of tokens locked in the hold.                  |

### AmortizationInitialized

```solidity
event AmortizationInitialized()
```

Emitted once when the amortization capability is initialised on a token.

_Fires exclusively from `initializeAmortization`._

### AmortizationSet

```solidity
event AmortizationSet(bytes32 corporateActionId, uint256 amortizationId, address indexed operator, uint256 recordDate, uint256 executionDate)
```

Emitted when an amortization is created or updated for a security.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| corporateActionId  | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationId     | uint256 | Identifier of the created or updated amortization.    |
| operator `indexed` | address | Address that performed the operation.                 |
| recordDate         | uint256 | Date at which token holder balances are snapshotted.  |
| executionDate      | uint256 | Date at which the amortization payment is executed.   |

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted when `owner` authorises `spender` to spend up to `value` tokens on their behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or {IAllowance.decreaseAllowance}.

_Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance after the update — not the delta applied._

#### Parameters

| Name              | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| owner `indexed`   | address | Address whose tokens may be spent.                                 |
| spender `indexed` | address | Address authorised to spend on `owner`&#39;s behalf.               |
| value             | uint256 | Allowance of `spender` over `owner`&#39;s tokens after the update. |

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorised to manage all partitions of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### AuthorizedOperatorByPartition

```solidity
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorised for a specific partition of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the authorisation applies to.     |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### BalanceAdjustmentsInitialized

```solidity
event BalanceAdjustmentsInitialized()
```

Emitted once when the balance adjustment capability is initialised on a token.

_Fires exclusively from `initializeBalanceAdjustments` after the storage write succeeds._

### BalanceTrackerAdjustedInitialized

```solidity
event BalanceTrackerAdjustedInitialized()
```

Emitted once when the adjusted balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAdjusted` after the storage write succeeds._

### BalanceTrackerAtSnapshotByPartitionInitialized

```solidity
event BalanceTrackerAtSnapshotByPartitionInitialized()
```

Emitted once when the partition snapshot balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAtSnapshotByPartition` after the storage write succeeds._

### BalanceTrackerAtSnapshotInitialized

```solidity
event BalanceTrackerAtSnapshotInitialized()
```

Emitted once when the snapshot balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAtSnapshot` after the storage write succeeds._

### BalanceTrackerByPartitionInitialized

```solidity
event BalanceTrackerByPartitionInitialized()
```

Emitted once when the partition balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerByPartition` after the storage write succeeds._

### BalanceTrackerInitialized

```solidity
event BalanceTrackerInitialized()
```

Emitted once when the balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTracker` after the storage write succeeds._

### BatchBurnInitialized

```solidity
event BatchBurnInitialized()
```

Emitted once when the batch burn capability is initialised on a token.

_Fires exclusively from `initializeBatchBurn` after the storage write succeeds._

### BatchControllerInitialized

```solidity
event BatchControllerInitialized()
```

Emitted once when the batch controller capability is initialised on a token.

_Fires exclusively from `initializeBatchController` after the storage write succeeds._

### BatchFreezeInitialized

```solidity
event BatchFreezeInitialized()
```

Emitted once when the batch freeze capability is initialised on a token.

_Fires exclusively from `initializeBatchFreeze` after the storage write succeeds._

### BatchMintInitialized

```solidity
event BatchMintInitialized()
```

Emitted once when the batch mint capability is initialised on a token.

_Fires exclusively from `initializeBatchMint` after the storage write succeeds._

### BatchTransferInitialized

```solidity
event BatchTransferInitialized()
```

Emitted once when the batch transfer capability is initialised on a token.

_Fires exclusively from `initializeBatchTransfer`._

### BurnByPartitionInitialized

```solidity
event BurnByPartitionInitialized()
```

Emitted once when the burn by partition capability is initialised on a token.

_Fires exclusively from `initializeBurnByPartition`._

### BurnInitialized

```solidity
event BurnInitialized()
```

Emitted once when the burn capability is initialised on a token.

_Fires exclusively from `initializeBurn`._

### CapByPartitionInitialized

```solidity
event CapByPartitionInitialized()
```

Emitted once when the CapByPartition capability is initialised on a token.

_Fires exclusively from `initializeCapByPartition` after the storage write succeeds._

### CapInitialized

```solidity
event CapInitialized(uint256 maxSupply, ICap.PartitionCap[] partitionCap)
```

Emitted once when the Cap capability is initialised on a token.

_Fires exclusively from `initializeCap` after the storage write succeeds._

#### Parameters

| Name         | Type                | Description                                                |
| ------------ | ------------------- | ---------------------------------------------------------- |
| maxSupply    | uint256             | The global maximum token supply set during initialisation. |
| partitionCap | ICap.PartitionCap[] | Array of per-partition cap configurations.                 |

### ClearedHoldByPartition

```solidity
event ClearedHoldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded hold creation on a partition.

#### Parameters

| Name                  | Type            | Description                                                         |
| --------------------- | --------------- | ------------------------------------------------------------------- |
| operator `indexed`    | address         | Address that submitted the clearing operation.                      |
| tokenHolder `indexed` | address         | Address of the holder whose tokens are to be placed under hold.     |
| partition             | bytes32         | ERC-1400 partition the tokens belong to.                            |
| clearingId            | uint256         | Sequential identifier for the registered operation.                 |
| hold                  | IHoldTypes.Hold | Hold parameters that will be used on approval.                      |
| expirationDate        | uint256         | Unix timestamp after which the clearing operation may be reclaimed. |
| data                  | bytes           | Caller-supplied data attached to the operation.                     |
| operatorData          | bytes           | Data provided by the operator.                                      |

### ClearedHoldFromByPartition

```solidity
event ClearedHoldFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded hold creation is registered on behalf of a token holder via `holdFromByPartition`.

#### Parameters

| Name                  | Type            | Description                                                            |
| --------------------- | --------------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address         | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address         | Address of the holder whose tokens are to be placed under hold.        |
| partition             | bytes32         | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256         | Sequential identifier for the registered operation.                    |
| hold                  | IHoldTypes.Hold | Hold parameters that will be used on approval.                         |
| expirationDate        | uint256         | Unix timestamp after which the clearing operation may be reclaimed.    |
| data                  | bytes           | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes           | Data provided by the operator.                                         |

### ClearedOperatorHoldByPartition

```solidity
event ClearedOperatorHoldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when an authorised operator schedules a hold creation through the clearing flow.

#### Parameters

| Name                  | Type            | Description                                                     |
| --------------------- | --------------- | --------------------------------------------------------------- |
| operator `indexed`    | address         | Account that invoked the clearing hold creation (the operator). |
| tokenHolder `indexed` | address         | Address whose balance is being committed to the hold.           |
| partition             | bytes32         | Partition under which the hold is scheduled.                    |
| clearingId            | uint256         | Identifier assigned to the queued clearing operation.           |
| hold                  | IHoldTypes.Hold | Hold parameters that will be created on approval.               |
| expirationDate        | uint256         | Expiration of the clearing operation itself.                    |
| data                  | bytes           | Arbitrary payload attached to the clearing operation.           |
| operatorData          | bytes           | Operator-supplied payload accompanying the request.             |

### ClearedOperatorRedeemByPartition

```solidity
event ClearedOperatorRedeemByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when an operator registers a clearing-guarded redemption using operator-level permissions.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Authorised operator that submitted the clearing operation. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption. |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending redemption.                         |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedOperatorTransferByPartition

```solidity
event ClearedOperatorTransferByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when an operator registers a clearing-guarded transfer using operator-level permissions.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Authorised operator that submitted the clearing operation. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.   |
| to `indexed`          | address | Intended recipient of the tokens upon approval.            |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending transfer.                           |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedRedeemByPartition

```solidity
event ClearedRedeemByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded redemption on a partition.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation.             |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption. |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending redemption.                         |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedRedeemFromByPartition

```solidity
event ClearedRedeemFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded redemption is registered on behalf of a token holder via `redeemFromByPartition`.

#### Parameters

| Name                  | Type    | Description                                                            |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption.             |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256 | Sequential identifier for the registered operation.                    |
| amount                | uint256 | Token quantity pending redemption.                                     |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed.             |
| data                  | bytes   | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes   | Data provided by the operator.                                         |

### ClearedTransferByPartition

```solidity
event ClearedTransferByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded transfer on a partition.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation.             |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.   |
| to `indexed`          | address | Intended recipient of the tokens upon approval.            |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending transfer.                           |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedTransferFromByPartition

```solidity
event ClearedTransferFromByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded transfer is registered on behalf of a token holder via `transferFromByPartition`.

#### Parameters

| Name                  | Type    | Description                                                            |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.               |
| to `indexed`          | address | Intended recipient of the tokens upon approval.                        |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256 | Sequential identifier for the registered operation.                    |
| amount                | uint256 | Token quantity pending transfer.                                       |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed.             |
| data                  | bytes   | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes   | Data provided by the operator.                                         |

### ClearingActivated

```solidity
event ClearingActivated(address indexed operator)
```

Emitted when the clearing feature is enabled for the token.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| operator `indexed` | address | Address of the administrator that activated clearing. |

### ClearingAtSnapshotByPartitionInitialized

```solidity
event ClearingAtSnapshotByPartitionInitialized()
```

Emitted once when the clearing-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeClearingAtSnapshotByPartition`._

### ClearingAtSnapshotInitialized

```solidity
event ClearingAtSnapshotInitialized()
```

Emitted once when the clearing-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeClearingAtSnapshot`._

### ClearingByPartitionInitialized

```solidity
event ClearingByPartitionInitialized()
```

Emitted once when the clearing-by-partition capability is initialised on a token.

_Fires exclusively from `initializeClearingByPartition`._

### ClearingDeactivated

```solidity
event ClearingDeactivated(address indexed operator)
```

Emitted when the clearing feature is disabled for the token.

#### Parameters

| Name               | Type    | Description                                             |
| ------------------ | ------- | ------------------------------------------------------- |
| operator `indexed` | address | Address of the administrator that deactivated clearing. |

### ClearingHoldByPartitionInitialized

```solidity
event ClearingHoldByPartitionInitialized()
```

Emitted once when the clearing-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeClearingHoldByPartition`._

### ClearingInitialized

```solidity
event ClearingInitialized(bool clearingActive)
```

Emitted once when the clearing module is initialised on a token.

_Fires exclusively from `initializeClearing` after the storage write succeeds._

#### Parameters

| Name           | Type | Description                                            |
| -------------- | ---- | ------------------------------------------------------ |
| clearingActive | bool | Whether clearing was activated at initialisation time. |

### ClearingOperationApproved

```solidity
event ClearingOperationApproved(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType, bytes operationData)
```

Emitted when a pending clearing operation is approved and the underlying token operation is executed.

#### Parameters

| Name                  | Type                                      | Description                                             |
| --------------------- | ----------------------------------------- | ------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that approved the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.        |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                |
| clearingId            | uint256                                   | Sequential identifier of the approved operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation approved. |
| operationData         | bytes                                     | Encoded data forwarded to the underlying token call.    |

### ClearingOperationCanceled

```solidity
event ClearingOperationCanceled(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType)
```

Emitted when a pending clearing operation is cancelled before it expires.

#### Parameters

| Name                  | Type                                      | Description                                              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that cancelled the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.         |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                 |
| clearingId            | uint256                                   | Sequential identifier of the cancelled operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation cancelled. |

### ClearingOperationReclaimed

```solidity
event ClearingOperationReclaimed(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType)
```

Emitted when an expired clearing operation is reclaimed, releasing the locked tokens back to the holder.

#### Parameters

| Name                  | Type                                      | Description                                              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that reclaimed the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.         |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                 |
| clearingId            | uint256                                   | Sequential identifier of the reclaimed operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation reclaimed. |

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

Emitted when the compliance contract address is updated.

#### Parameters

| Name                 | Type    | Description                                     |
| -------------------- | ------- | ----------------------------------------------- |
| compliance `indexed` | address | Address of the newly wired compliance contract. |

### ComplianceByPartitionInitialized

```solidity
event ComplianceByPartitionInitialized()
```

Emitted once when the compliance by partition capability is initialised on a token.

_Fires exclusively from `initializeComplianceByPartition`._

### ComplianceInitialized

```solidity
event ComplianceInitialized(address compliance)
```

Emitted once when the compliance capability is initialised on a token.

_Fires exclusively from `initializeCompliance`._

#### Parameters

| Name       | Type    | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| compliance | address | The compliance contract address wired at initialisation. |

### ControlListInitialized

```solidity
event ControlListInitialized(bool isWhiteList)
```

Emitted once when the control list capability is initialised on a token.

_Fires exclusively from `initializeControlList` after the storage write succeeds._

#### Parameters

| Name        | Type | Description                                          |
| ----------- | ---- | ---------------------------------------------------- |
| isWhiteList | bool | Whether the control list operates in whitelist mode. |

### ControllerByPartitionInitialized

```solidity
event ControllerByPartitionInitialized()
```

Emitted once when the controller by partition capability is initialised on a token.

_Fires exclusively from `initializeControllerByPartition`._

### ControllerHeldByPartition

```solidity
event ControllerHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a controller creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                              |
| --------------------- | --------------- | ---------------------------------------- |
| operator `indexed`    | address         | The controller initiating the hold.      |
| tokenHolder `indexed` | address         | The holder whose balance is being held.  |
| partition             | bytes32         | Partition over which the hold is placed. |
| holdId                | uint256         | Sequence id assigned to the hold.        |
| hold                  | IHoldTypes.Hold | The hold definition.                     |
| operatorData          | bytes           | Operator-supplied metadata.              |

### ControllerHoldByPartitionInitialized

```solidity
event ControllerHoldByPartitionInitialized()
```

Emitted once when the controller hold by partition capability is initialised on a token.

_Fires exclusively from `initializeControllerHoldByPartition`._

### ControllerInitialized

```solidity
event ControllerInitialized(bool controllable)
```

Emitted when the controller feature is initialised for a token.

_Fired inside `initializeController` once the facet is marked ready._

#### Parameters

| Name         | Type | Description                                       |
| ------------ | ---- | ------------------------------------------------- |
| controllable | bool | Whether the token was configured as controllable. |

### ControllerRedemption

```solidity
event ControllerRedemption(address controller, address indexed tokenHolder, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.

#### Parameters

| Name                  | Type    | Description                                                     |
| --------------------- | ------- | --------------------------------------------------------------- |
| controller            | address | The address of the controller that initiated the redemption.    |
| tokenHolder `indexed` | address | The account whose tokens are redeemed.                          |
| value                 | uint256 | The amount of tokens redeemed.                                  |
| data                  | bytes   | Optional data attached to the redemption for validation.        |
| operatorData          | bytes   | Optional data attached by the controller for event attribution. |

### ControllerTransfer

```solidity
event ControllerTransfer(address controller, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller transfers tokens between two holders.

#### Parameters

| Name           | Type    | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| controller     | address | The address of the controller that initiated the transfer.      |
| from `indexed` | address | The address tokens are transferred from.                        |
| to `indexed`   | address | The address tokens are transferred to.                          |
| value          | uint256 | The amount of tokens transferred.                               |
| data           | bytes   | Optional data attached to the transfer for validation.          |
| operatorData   | bytes   | Optional data attached by the controller for event attribution. |

### CoreAdjustedInitialized

```solidity
event CoreAdjustedInitialized()
```

Emitted once when the core adjusted capability is initialised on a token.

_Fires exclusively from `initializeCoreAdjusted`._

### CoreAtSnapshotInitialized

```solidity
event CoreAtSnapshotInitialized()
```

Emitted once when the core at snapshot capability is initialised on a token.

_Fires exclusively from `initializeCoreAtSnapshot`._

### CoreInitialized

```solidity
event CoreInitialized(ICore.ERC20Metadata metadata)
```

Emitted once when the core ERC-20 metadata is initialised on a token.

_Fires exclusively from `initializeCore` after the storage write succeeds._

#### Parameters

| Name     | Type                | Description                                                  |
| -------- | ------------------- | ------------------------------------------------------------ |
| metadata | ICore.ERC20Metadata | The full ERC-20 metadata bundle persisted at initialisation. |

### CorporateActionAdded

```solidity
event CorporateActionAdded(address indexed operator, bytes32 indexed actionType, bytes32 indexed corporateActionId, uint256 corporateActionIdByType, bytes data)
```

Emitted when a new corporate action is registered on the token.

#### Parameters

| Name                        | Type    | Description                                                                         |
| --------------------------- | ------- | ----------------------------------------------------------------------------------- |
| operator `indexed`          | address | Address of the caller who added the corporate action.                               |
| actionType `indexed`        | bytes32 | Classification key for the corporate action (e.g. dividend, vote).                  |
| corporateActionId `indexed` | bytes32 | Unique sequential identifier for the corporate action (1-based, cast to `bytes32`). |
| corporateActionIdByType     | uint256 | Sequential index of this action within its action type.                             |
| data                        | bytes   | ABI-encoded payload defining the corporate action details.                          |

### CorporateActionCancelled

```solidity
event CorporateActionCancelled(bytes32 indexed corporateActionId)
```

Emitted when a corporate action is cancelled (disabled).

#### Parameters

| Name                        | Type    | Description                                                   |
| --------------------------- | ------- | ------------------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier of the corporate action that was cancelled. |

### CorporateActionsInitialized

```solidity
event CorporateActionsInitialized()
```

Emitted once when the corporate actions capability is initialised on a token.

_Fires exclusively from `initializeCorporateActions`._

### CouponCancelled

```solidity
event CouponCancelled(uint256 indexed couponId, address indexed operator)
```

Emitted when an operator cancels a previously scheduled coupon.

_Cancellation is rejected once the execution date has passed; see `CouponAlreadyExecuted`._

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| couponId `indexed` | uint256 | One-indexed identifier of the cancelled coupon. |
| operator `indexed` | address | Address that performed the cancellation.        |

### CouponForceCancelled

```solidity
event CouponForceCancelled(uint256 indexed couponId, address indexed operator)
```

Emitted when an admin force-cancels a coupon, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| couponId `indexed` | uint256 | One-indexed identifier of the force-cancelled coupon. |
| operator `indexed` | address | Address that performed the force-cancellation.        |

### CouponInitialized

```solidity
event CouponInitialized()
```

Emitted once when the coupon capability is initialised on a token.

_Fires exclusively from `initializeCoupon`._

### CouponListingInitialized

```solidity
event CouponListingInitialized()
```

Emitted once when the coupon listing capability is initialised on a token.

_Fires exclusively from `initializeCouponListing`._

### CouponRateTypeSet

```solidity
event CouponRateTypeSet(address indexed operator, enum IInterestRate.RateType rateType)
```

Emitted when the coupon rate type is set (by factory initializer or admin).

#### Parameters

| Name               | Type                        | Description                             |
| ------------------ | --------------------------- | --------------------------------------- |
| operator `indexed` | address                     | The caller who invoked the setter.      |
| rateType           | enum IInterestRate.RateType | The `RateType` value that was selected. |

### CouponSecurityHoldersInitialized

```solidity
event CouponSecurityHoldersInitialized()
```

Emitted once when the coupon security holders capability is initialised on a token.

_Fires exclusively from `initializeCouponSecurityHolders`._

### CouponSet

```solidity
event CouponSet(bytes32 indexed corporateActionId, uint256 indexed couponId, address indexed operator, ICouponTypes.Coupon coupon)
```

Emitted when an operator schedules a new coupon corporate action.

#### Parameters

| Name                        | Type                | Description                                                            |
| --------------------------- | ------------------- | ---------------------------------------------------------------------- |
| corporateActionId `indexed` | bytes32             | Identifier of the underlying corporate action.                         |
| couponId `indexed`          | uint256             | One-indexed coupon identifier within the coupon corporate action type. |
| operator `indexed`          | address             | Address that scheduled the coupon.                                     |
| coupon                      | ICouponTypes.Coupon | The coupon parameters captured at scheduling time.                     |

### CustomDataInitialized

```solidity
event CustomDataInitialized()
```

Emitted once when the metadata capability is initialised on a token.

_Fires exclusively from `initializeCustomData`._

### DeactivateInitialized

```solidity
event DeactivateInitialized()
```

Emitted once when the deactivate capability is initialised on a token.

_Fires exclusively from `initializeDeactivate`._

### DelegateChanged

```solidity
event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)
```

Emitted when an account changes their delegate

#### Parameters

| Name                   | Type    | Description                               |
| ---------------------- | ------- | ----------------------------------------- |
| delegator `indexed`    | address | The account that changed their delegation |
| fromDelegate `indexed` | address | The previous delegate address             |
| toDelegate `indexed`   | address | The new delegate address                  |

### DelegateVotesChanged

```solidity
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)
```

Emitted when delegate votes change due to balance changes

#### Parameters

| Name               | Type    | Description                      |
| ------------------ | ------- | -------------------------------- |
| delegate `indexed` | address | The delegate whose votes changed |
| previousBalance    | uint256 | The previous vote balance        |
| newBalance         | uint256 | The new vote balance             |

### DividendCancelled

```solidity
event DividendCancelled(uint256 dividendId, address indexed operator)
```

Emitted when an operator cancels a previously scheduled dividend.

_Cancellation is rejected once the execution date has passed; see `DividendAlreadyExecuted`._

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| dividendId         | uint256 | One-indexed identifier of the cancelled dividend. |
| operator `indexed` | address | Address that performed the cancellation.          |

### DividendForceCancelled

```solidity
event DividendForceCancelled(uint256 dividendId, address indexed operator)
```

Emitted when an admin force-cancels a dividend, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                             |
| ------------------ | ------- | ------------------------------------------------------- |
| dividendId         | uint256 | One-indexed identifier of the force-cancelled dividend. |
| operator `indexed` | address | Address that performed the force-cancellation.          |

### DividendInitialized

```solidity
event DividendInitialized()
```

Emitted once when the dividend capability is initialised on a token.

_Fires exclusively from `initializeDividend`._

### DividendSecurityHoldersInitialized

```solidity
event DividendSecurityHoldersInitialized()
```

Emitted once when the dividend security holders capability is initialised on a token.

_Fires exclusively from `initializeDividendSecurityHolders`._

### DividendSet

```solidity
event DividendSet(bytes32 corporateActionId, uint256 dividendId, address indexed operator, uint256 indexed recordDate, uint256 indexed executionDate, uint256 amount, uint8 amountDecimals)
```

Emitted when an operator schedules a new dividend corporate action.

#### Parameters

| Name                    | Type    | Description                                                                   |
| ----------------------- | ------- | ----------------------------------------------------------------------------- |
| corporateActionId       | bytes32 | Identifier of the underlying corporate action.                                |
| dividendId              | uint256 | One-indexed dividend identifier within the dividend corporate action type.    |
| operator `indexed`      | address | Address that scheduled the dividend.                                          |
| recordDate `indexed`    | uint256 | Unix timestamp of the snapshot taken to determine eligible holders.           |
| executionDate `indexed` | uint256 | Unix timestamp on which the dividend becomes payable.                         |
| amount                  | uint256 | Total amount distributed across eligible holders, scaled by `amountDecimals`. |
| amountDecimals          | uint8   | Decimal precision applied to `amount`.                                        |

### DocumentRemoved

```solidity
event DocumentRemoved(bytes32 indexed name, string uri, bytes32 documentHash)
```

Emitted when a document is permanently removed from the contract.

#### Parameters

| Name           | Type    | Description                                          |
| -------------- | ------- | ---------------------------------------------------- |
| name `indexed` | bytes32 | Unique identifier of the document that was removed.  |
| uri            | string  | Off-chain URI that was associated with the document. |
| documentHash   | bytes32 | Content hash that was associated with the document.  |

### DocumentUpdated

```solidity
event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash)
```

Emitted when a document is created or its URI or hash is updated.

#### Parameters

| Name           | Type    | Description                                                |
| -------------- | ------- | ---------------------------------------------------------- |
| name `indexed` | bytes32 | Unique identifier of the document that was set or updated. |
| uri            | string  | Off-chain URI now associated with the document.            |
| documentHash   | bytes32 | Content hash now associated with the document.             |

### DocumentationInitialized

```solidity
event DocumentationInitialized()
```

Emitted once when the documentation capability is initialised on a token.

_Fires exclusively from `initializeDocumentation`._

### EIP712Initialized

```solidity
event EIP712Initialized()
```

Emitted once when the EIP-712 capability is initialised on a token.

_Fires exclusively from `initializeEIP712`._

### ERC1594Initialized

```solidity
event ERC1594Initialized()
```

/\*\*Emitted once when the ERC-1594 capability is initialised on a token.

_Fires exclusively from `initializeERC1594` after the storage write succeeds._

### ERC20PermitInitialized

```solidity
event ERC20PermitInitialized()
```

Emitted once when the ERC20 permit capability is initialised on a token.

_Fires exclusively from `initializeERC20Permit` after successful facet registration._

### ERC20VotesInitialized

```solidity
event ERC20VotesInitialized(bool activated)
```

Emitted once when the ERC-20Votes capability is initialised on a token.

_Fires exclusively from `initializeERC20Votes` after the storage write succeeds._

#### Parameters

| Name      | Type | Description                                                     |
| --------- | ---- | --------------------------------------------------------------- |
| activated | bool | Whether the ERC-20Votes feature is active after initialisation. |

### EvmAccessorsInitialized

```solidity
event EvmAccessorsInitialized()
```

Emitted when the facet is marked ready in the centralised initializer.

### ExternalControlListInitialized

```solidity
event ExternalControlListInitialized(address[] controlLists)
```

Emitted once when the external control list capability is initialised on a token.

_Fires exclusively from `initializeExternalControlLists` after the storage write succeeds._

#### Parameters

| Name         | Type      | Description                                                               |
| ------------ | --------- | ------------------------------------------------------------------------- |
| controlLists | address[] | The initial array of external control list contract addresses registered. |

### ExternalControlListsUpdated

```solidity
event ExternalControlListsUpdated(address indexed operator, address[] controlLists, bool[] actives)
```

Emitted when multiple external control list addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| controlLists       | address[] | Array of external control list contract addresses that were processed.     |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### ExternalKycListInitialized

```solidity
event ExternalKycListInitialized(address[] kycLists)
```

Emitted once when the external KYC list capability is initialised on a token.

_Fires exclusively from `initializeExternalKycLists` after the storage write succeeds._

#### Parameters

| Name     | Type      | Description                                                       |
| -------- | --------- | ----------------------------------------------------------------- |
| kycLists | address[] | Initial array of external KYC list contract addresses registered. |

### ExternalKycListsUpdated

```solidity
event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives)
```

Emitted when multiple external KYC list addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| kycLists           | address[] | Array of external KYC list contract addresses that were processed.         |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### ExternalPauseInitialized

```solidity
event ExternalPauseInitialized(address[] pauses)
```

Emitted once when the external pause capability is initialised on a token.

_Fires exclusively from `initializeExternalPauses` after the storage write succeeds._

#### Parameters

| Name   | Type      | Description                                                                      |
| ------ | --------- | -------------------------------------------------------------------------------- |
| pauses | address[] | The initial array of external pause contract addresses registered at deployment. |

### ExternalPausesUpdated

```solidity
event ExternalPausesUpdated(address indexed operator, address[] pauses, bool[] actives)
```

Emitted when multiple external pause addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| pauses             | address[] | Array of external pause contract addresses that were processed.            |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### FinalizedControllerFeature

```solidity
event FinalizedControllerFeature(address operator)
```

Emitted when the controller feature is permanently disabled for a token.

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| operator | address | Address of the caller who finalised controllability. |

### FixedRateInitialized

```solidity
event FixedRateInitialized(IFixedRate.FixedRateData initData)
```

Emitted once when the FixedRate capability is initialised on a token.

_Fires exclusively from `initializeFixedRate` after the storage write succeeds._

#### Parameters

| Name     | Type                     | Description                                                   |
| -------- | ------------------------ | ------------------------------------------------------------- |
| initData | IFixedRate.FixedRateData | The rate and decimal precision written during initialisation. |

### FreezeAtSnapshotByPartitionInitialized

```solidity
event FreezeAtSnapshotByPartitionInitialized()
```

Emitted once when the freeze-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeFreezeAtSnapshotByPartition`._

### FreezeAtSnapshotInitialized

```solidity
event FreezeAtSnapshotInitialized()
```

Emitted once when the freeze-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeFreezeAtSnapshot`._

### FreezeInitialized

```solidity
event FreezeInitialized()
```

Emitted once when the freeze capability is initialised on a token.

_Fires exclusively from `initializeFreeze`._

### HeldByPartition

```solidity
event HeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a holder creates a hold over its own partitioned balance.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The address that initiated the hold (the holder itself).           |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HeldFromByPartition

```solidity
event HeldFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an authorised third party creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The third-party caller initiating the hold.                        |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HoldAtSnapshotByPartitionInitialized

```solidity
event HoldAtSnapshotByPartitionInitialized()
```

Emitted once when the hold-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshotByPartition`._

### HoldAtSnapshotInitialized

```solidity
event HoldAtSnapshotInitialized()
```

Emitted once when the hold-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshot`._

### HoldByPartitionExecuted

```solidity
event HoldByPartitionExecuted(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount, address to)
```

Emitted when an existing hold is executed and balance transferred to a recipient.

#### Parameters

| Name                  | Type    | Description                          |
| --------------------- | ------- | ------------------------------------ |
| tokenHolder `indexed` | address | The holder whose hold was executed.  |
| partition `indexed`   | bytes32 | Partition over which the hold lived. |
| holdId                | uint256 | Sequence id of the executed hold.    |
| amount                | uint256 | Amount released to the recipient.    |
| to                    | address | Recipient of the executed balance.   |

### HoldByPartitionInitialized

```solidity
event HoldByPartitionInitialized()
```

Emitted once when the hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeHoldByPartition`._

### HoldByPartitionReclaimed

```solidity
event HoldByPartitionReclaimed(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when an expired hold is reclaimed by the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| operator `indexed`    | address | The address that triggered the reclaim.                |
| tokenHolder `indexed` | address | The holder receiving the reclaimed balance.            |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the reclaimed hold.                     |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### HoldByPartitionReleased

```solidity
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when a hold is partially or fully released back to the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| tokenHolder `indexed` | address | The holder receiving the released balance.             |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the released hold.                      |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### HoldInitialized

```solidity
event HoldInitialized()
```

Emitted once when the hold capability is initialised on a token.

_Fires exclusively from `initializeHold`._

### HoldingsAssetAdded

```solidity
event HoldingsAssetAdded(ILoansPortfolio.HoldingsAsset holdingsAsset)
```

Emitted when a new holdings asset is added to the portfolio.

#### Parameters

| Name          | Type                          | Description                               |
| ------------- | ----------------------------- | ----------------------------------------- |
| holdingsAsset | ILoansPortfolio.HoldingsAsset | The asset descriptor that was registered. |

### HoldingsAssetRemoved

```solidity
event HoldingsAssetRemoved(ILoansPortfolio.HoldingsAsset holdingsAsset)
```

Emitted when an existing holdings asset is removed from the portfolio.

#### Parameters

| Name          | Type                          | Description                            |
| ------------- | ----------------------------- | -------------------------------------- |
| holdingsAsset | ILoansPortfolio.HoldingsAsset | The asset descriptor that was removed. |

### IdentityInitialized

```solidity
event IdentityInitialized(address identityRegistry)
```

Emitted once when the identity capability is initialised on a token.

_Fires exclusively from `initializeIdentity`._

#### Parameters

| Name             | Type    | Description                                            |
| ---------------- | ------- | ------------------------------------------------------ |
| identityRegistry | address | The identity-registry address wired at initialisation. |

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

Emitted when the identity registry contract address is updated.

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| identityRegistry `indexed` | address | Address of the newly wired identity registry. |

### ImpactDataUpdated

```solidity
event ImpactDataUpdated(address indexed operator, IKpiLinkedRate.ImpactData newImpactData)
```

Emitted when the KPI-linked impact data configuration is updated.

#### Parameters

| Name               | Type                      | Description                                            |
| ------------------ | ------------------------- | ------------------------------------------------------ |
| operator `indexed` | address                   | Address that performed the update.                     |
| newImpactData      | IKpiLinkedRate.ImpactData | The new impact data parameters that have been applied. |

### InitializerInitialized

```solidity
event InitializerInitialized(uint256 maxInitializerFacetIndex)
```

Emitted on the first successful call to `initializeInitializer`, which seeds the initializer storage with its batch size.

#### Parameters

| Name                     | Type    | Description                                                                               |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| maxInitializerFacetIndex | uint256 | Batch size used by `setOperationalStatus` to bound the number of facets checked per call. |

### InterestRateTypeInitialized

```solidity
event InterestRateTypeInitialized(enum IInterestRate.RateType rateType)
```

Emitted once when the interest rate type is initialised on a token.

_Fires exclusively from `initializeInterestRateType` after the storage write succeeds._

#### Parameters

| Name     | Type                        | Description                 |
| -------- | --------------------------- | --------------------------- |
| rateType | enum IInterestRate.RateType | The rate type that was set. |

### InterestRateUpdated

```solidity
event InterestRateUpdated(address indexed operator, IKpiLinkedRate.InterestRate newInterestRate)
```

Emitted when the KPI-linked interest rate configuration is updated.

#### Parameters

| Name               | Type                        | Description                                              |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                     | Address that performed the update.                       |
| newInterestRate    | IKpiLinkedRate.InterestRate | The new interest rate parameters that have been applied. |

### InternalKycStatusUpdated

```solidity
event InternalKycStatusUpdated(address indexed operator, bool activated)
```

Emitted when the internal KYC enforcement status is toggled.

#### Parameters

| Name               | Type    | Description                                   |
| ------------------ | ------- | --------------------------------------------- |
| operator `indexed` | address | The address that triggered the status update. |
| activated          | bool    | The new activation state of the internal KYC. |

### Issued

```solidity
event Issued(address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued to a holder.

#### Parameters

| Name               | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| operator `indexed` | address | Account that invoked the issuance (issuer or agent). |
| to `indexed`       | address | Recipient of the newly issued tokens.                |
| value              | uint256 | Amount of tokens issued, denominated in base units.  |
| data               | bytes   | Arbitrary payload forwarded alongside the issuance.  |

### IssuedByPartition

```solidity
event IssuedByPartition(bytes32 indexed partition, address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued into a partition.

#### Parameters

| Name                | Type    | Description                                    |
| ------------------- | ------- | ---------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were issued into.         |
| operator `indexed`  | address | Address that performed the issuance.           |
| to `indexed`        | address | Recipient of the issued tokens.                |
| value               | uint256 | Token quantity issued.                         |
| data                | bytes   | Caller-supplied data attached to the issuance. |

### KpiDataAdded

```solidity
event KpiDataAdded(address indexed project, uint256 date, uint256 value)
```

Emitted when a new KPI data point is recorded.

#### Parameters

| Name              | Type    | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| project `indexed` | address | Address of the project the data point belongs to. |
| date              | uint256 | Unix timestamp identifying the data point.        |
| value             | uint256 | KPI value recorded at `date`.                     |

### KpiLinkedRateInitialized

```solidity
event KpiLinkedRateInitialized(IKpiLinkedRate.InterestRate interestRate, IKpiLinkedRate.ImpactData impactData)
```

Emitted once when the KpiLinkedRate capability is initialised on a token.

_Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds._

#### Parameters

| Name         | Type                        | Description                                                 |
| ------------ | --------------------------- | ----------------------------------------------------------- |
| interestRate | IKpiLinkedRate.InterestRate | The initial interest rate configuration written to storage. |
| impactData   | IKpiLinkedRate.ImpactData   | The initial impact data configuration written to storage.   |

### KpisInitialized

```solidity
event KpisInitialized()
```

Emitted once when the KPI capability is initialised on a token.

_Fires exclusively from `initializeKpis`._

### KycGranted

```solidity
event KycGranted(address indexed account, address indexed issuer)
```

Emitted when KYC is granted to an account.

#### Parameters

| Name              | Type    | Description                               |
| ----------------- | ------- | ----------------------------------------- |
| account `indexed` | address | The address for which the KYC is granted. |
| issuer `indexed`  | address | The address of the issuer of the KYC.     |

### KycInitialized

```solidity
event KycInitialized(bool internalKycActivated)
```

Emitted once when the KYC capability is initialised on a token.

_Fires exclusively from `initializeInternalKyc` after the storage write succeeds._

#### Parameters

| Name                 | Type | Description                                                     |
| -------------------- | ---- | --------------------------------------------------------------- |
| internalKycActivated | bool | Whether internal KYC enforcement was enabled at initialisation. |

### KycRevoked

```solidity
event KycRevoked(address indexed account, address indexed issuer)
```

Emitted when KYC is revoked from an account.

#### Parameters

| Name              | Type    | Description                                 |
| ----------------- | ------- | ------------------------------------------- |
| account `indexed` | address | The address for which the KYC is revoked.   |
| issuer `indexed`  | address | The address of the issuer revoking the KYC. |

### LoanDetailsSet

```solidity
event LoanDetailsSet(ILoan.LoanDetailsData loanDetails)
```

Emitted when the loan details are updated by an authorised manager.

#### Parameters

| Name        | Type                  | Description                  |
| ----------- | --------------------- | ---------------------------- |
| loanDetails | ILoan.LoanDetailsData | The updated loan descriptor. |

### LoanHoldingsAssetUpdated

```solidity
event LoanHoldingsAssetUpdated(address loanHoldingsAsset)
```

Emitted when a registered loan holdings asset notifies a state update.

#### Parameters

| Name              | Type    | Description                                     |
| ----------------- | ------- | ----------------------------------------------- |
| loanHoldingsAsset | address | Address of the loan whose state was advertised. |

### LoanInitialized

```solidity
event LoanInitialized(ILoan.LoanDetailsData loanDetailsData)
```

Emitted once when the Loan capability is initialised on a token.

_Fires exclusively from `initializeLoan` after the storage write succeeds._

#### Parameters

| Name            | Type                  | Description                                         |
| --------------- | --------------------- | --------------------------------------------------- |
| loanDetailsData | ILoan.LoanDetailsData | The full loan descriptor written at initialisation. |

### LoansPortfolioInitialized

```solidity
event LoansPortfolioInitialized(ILoansPortfolio.LoansPortfolioDetailsData loansPortfolioData)
```

Emitted once when the LoansPortfolio capability is initialised on a token.

_Fires exclusively from `initializeLoansPortfolio` after the storage write succeeds._

#### Parameters

| Name               | Type                                      | Description                                              |
| ------------------ | ----------------------------------------- | -------------------------------------------------------- |
| loansPortfolioData | ILoansPortfolio.LoansPortfolioDetailsData | The portfolio configuration persisted at initialisation. |

### LoansPortfolioWithdrawn

```solidity
event LoansPortfolioWithdrawn(address assetAddress, address to, uint256 amount)
```

Emitted when funds are withdrawn from a holdings asset to an external account.

#### Parameters

| Name         | Type    | Description                                          |
| ------------ | ------- | ---------------------------------------------------- |
| assetAddress | address | Address of the holdings asset funds were drawn from. |
| to           | address | Recipient of the withdrawn amount.                   |
| amount       | uint256 | Amount transferred to the recipient.                 |

### LockAtSnapshotByPartitionInitialized

```solidity
event LockAtSnapshotByPartitionInitialized()
```

Emitted once when the lock-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeLockAtSnapshotByPartition`._

### LockAtSnapshotInitialized

```solidity
event LockAtSnapshotInitialized()
```

Emitted once when the lock-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeLockAtSnapshot`._

### LockByPartitionInitialized

```solidity
event LockByPartitionInitialized()
```

Emitted once when the lock-by-partition capability is initialised on a token.

_Fires exclusively from `initializeLockByPartition`._

### LockByPartitionReleased

```solidity
event LockByPartitionReleased(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId)
```

Emitted when a previously created lock is released back to its token holder.

_Emitted by `release`, `releaseByPartition` and `forceReleaseByPartition`. The released amount is not part of the event because the underlying lock entry is removed atomically; consumers can correlate with the prior `LockedByPartition` via `(partition, tokenHolder, lockId)`._

#### Parameters

| Name                  | Type    | Description                                        |
| --------------------- | ------- | -------------------------------------------------- |
| operator `indexed`    | address | The caller that requested the release.             |
| tokenHolder `indexed` | address | The address the tokens are returned to.            |
| partition `indexed`   | bytes32 | The partition the lock was held on.                |
| lockId                | uint256 | The identifier of the lock that has been released. |

### LockExpirationUpdated

```solidity
event LockExpirationUpdated(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId, uint256 oldExpirationTimestamp, uint256 newExpirationTimestamp)
```

Emitted when a lock&#39;s expiration timestamp is updated by a locker.

_Emitted by both `updateLockExpiration` (default partition) and `updateLockExpirationByPartition` (any partition)._

#### Parameters

| Name                   | Type    | Description                                                     |
| ---------------------- | ------- | --------------------------------------------------------------- |
| operator `indexed`     | address | The caller that requested the update (must hold `ROLE_LOCKER`). |
| tokenHolder `indexed`  | address | The address whose lock expiration is being updated.             |
| partition `indexed`    | bytes32 | The partition the lock lives on.                                |
| lockId                 | uint256 | The identifier of the lock being updated.                       |
| oldExpirationTimestamp | uint256 | The expiration timestamp before the update.                     |
| newExpirationTimestamp | uint256 | The new expiration timestamp after the update.                  |

### LockInitialized

```solidity
event LockInitialized()
```

Emitted once when the lock capability is initialised on a token.

_Fires exclusively from `initializeLock`._

### LockedByPartition

```solidity
event LockedByPartition(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId, uint256 amount, uint256 expirationTimestamp)
```

Emitted when an amount of tokens is locked on a specific partition until an expiration timestamp.

_Emitted by both `lock` (default partition) and `lockByPartition` (any partition) so consumers can monitor every lock creation through a single topic._

#### Parameters

| Name                  | Type    | Description                                                             |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| operator `indexed`    | address | The caller that requested the lock (typically holds `ROLE_LOCKER`).     |
| tokenHolder `indexed` | address | The address whose tokens are locked.                                    |
| partition `indexed`   | bytes32 | The partition the tokens are locked on.                                 |
| lockId                | uint256 | The identifier assigned to the new lock for `(partition, tokenHolder)`. |
| amount                | uint256 | The amount of tokens locked.                                            |
| expirationTimestamp   | uint256 | The Unix timestamp at which the lock becomes releasable.                |

### MaturityByPartitionInitialized

```solidity
event MaturityByPartitionInitialized()
```

Emitted once when the maturity-by-partition capability is initialised on a token.

_Fires exclusively from `initializeMaturityByPartition`._

### MaturityDateUpdated

```solidity
event MaturityDateUpdated(address indexed tokenId, uint256 indexed maturityDate, uint256 indexed previousMaturityDate)
```

Emitted whenever the maturity date is updated via `updateMaturityDate`.

#### Parameters

| Name                           | Type    | Description                                        |
| ------------------------------ | ------- | -------------------------------------------------- |
| tokenId `indexed`              | address | Address of the token proxy whose date was updated. |
| maturityDate `indexed`         | uint256 | New maturity timestamp (Unix epoch, seconds).      |
| previousMaturityDate `indexed` | uint256 | Previous maturity timestamp that was replaced.     |

### MaturityInitialized

```solidity
event MaturityInitialized(uint256 indexed maturityDate)
```

Emitted once when the maturity date is set for the first time via `initializeMaturity`.

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| maturityDate `indexed` | uint256 | Initial maturity timestamp (Unix epoch, seconds). |

### MaxInitializerFacetIndexUpdated

```solidity
event MaxInitializerFacetIndexUpdated(address sender, uint256 newMaxInitializerFacetIndex)
```

Emitted when `updateMaxInitializerFacetIndex` changes the batch size used by `setOperationalStatus`.

#### Parameters

| Name                        | Type    | Description                                   |
| --------------------------- | ------- | --------------------------------------------- |
| sender                      | address | Address that triggered the update.            |
| newMaxInitializerFacetIndex | uint256 | New batch size, in number of facets per call. |

### MaxSupplyByPartitionSet

```solidity
event MaxSupplyByPartitionSet(address indexed operator, bytes32 indexed partition, uint256 newMaxSupply, uint256 previousMaxSupply)
```

Emitted when the maximum supply for a specific partition is updated.

#### Parameters

| Name                | Type    | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| operator `indexed`  | address | Address of the caller who performed the update.      |
| partition `indexed` | bytes32 | The partition whose cap was changed.                 |
| newMaxSupply        | uint256 | The new maximum supply value for the partition.      |
| previousMaxSupply   | uint256 | The previous maximum supply value for the partition. |

### MaxSupplySet

```solidity
event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply)
```

Emitted when the global maximum supply is updated.

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the update. |
| newMaxSupply       | uint256 | The new maximum supply value.                   |
| previousMaxSupply  | uint256 | The previous maximum supply value.              |

### MintByPartitionInitialized

```solidity
event MintByPartitionInitialized()
```

Emitted once when the mint-by-partition capability is initialised on a token.

_Fires exclusively from `initializeMintByPartition`._

### NominalValueAtSnapshotInitialized

```solidity
event NominalValueAtSnapshotInitialized()
```

Emitted once when the nominal-value-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeNominalValueAtSnapshot`._

### NominalValueCurrencySet

```solidity
event NominalValueCurrencySet(address indexed operator, bytes3 nominalValueCurrency)
```

Emitted when the ISO 4217 currency code of the nominal value is updated.

_Fires exclusively from `setNominalValueCurrency`; initialisation goes through `NominalValueInitialized` instead._

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| operator `indexed`   | address | The caller authorised by `ROLE_NOMINAL_VALUE`. |
| nominalValueCurrency | bytes3  | The new ISO 4217 currency code as `bytes3`.    |

### NominalValueInitialized

```solidity
event NominalValueInitialized(uint256 nominalValue, uint8 nominalValueDecimals, bytes3 nominalValueCurrency)
```

Emitted once when the nominal value capability is initialised on a token.

_Fires exclusively from `initializeNominalValue` after the storage write succeeds. Subsequent value or currency updates emit `NominalValueSet` / `NominalValueCurrencySet` instead, never this event._

#### Parameters

| Name                 | Type    | Description                                                             |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| nominalValue         | uint256 | The initial nominal value amount.                                       |
| nominalValueDecimals | uint8   | The number of decimals applied to `nominalValue`.                       |
| nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; `0x000000` means &quot;unset&quot;. |

### NominalValueSet

```solidity
event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals)
```

Emitted when the nominal value amount or its decimals are updated post-initialisation.

_Fires exclusively from `setNominalValue`._

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| operator `indexed`   | address | The caller authorised by `ROLE_NOMINAL_VALUE`. |
| nominalValue         | uint256 | The new nominal value amount.                  |
| nominalValueDecimals | uint8   | The new decimals applied to `nominalValue`.    |

### NoncesInitialized

```solidity
event NoncesInitialized()
```

Emitted once when the nonces capability is initialised on a token.

_Fires exclusively from `initializeNonces`._

### OperationalStatusPartialSet

```solidity
event OperationalStatusPartialSet(address sender, bytes32 configurationId, uint256 version, uint256 lastIndex)
```

Emitted by `setOperationalStatus` when only part of the facet list could be validated in the current call. Subsequent calls resume from `lastIndex`.

#### Parameters

| Name            | Type    | Description                                                             |
| --------------- | ------- | ----------------------------------------------------------------------- |
| sender          | address | Address that triggered the partial set.                                 |
| configurationId | bytes32 | Resolver-proxy configuration being validated.                           |
| version         | uint256 | Configuration version being validated.                                  |
| lastIndex       | uint256 | Index of the first facet not yet validated; the next call resumes here. |

### OperationalStatusSet

```solidity
event OperationalStatusSet(address sender, bytes32 configurationId, uint256 version)
```

Emitted by `setOperationalStatus` when every facet of the configuration version has been validated and the configuration becomes fully operational.

#### Parameters

| Name            | Type    | Description                                           |
| --------------- | ------- | ----------------------------------------------------- |
| sender          | address | Address that triggered the final set.                 |
| configurationId | bytes32 | Resolver-proxy configuration that became operational. |
| version         | uint256 | Configuration version that became operational.        |

### OperatorByPartitionInitialized

```solidity
event OperatorByPartitionInitialized()
```

Emitted once when the operator-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorByPartition`._

### OperatorClearingByPartitionInitialized

```solidity
event OperatorClearingByPartitionInitialized()
```

Emitted once when the operator-clearing-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorClearingByPartition`._

### OperatorClearingHoldByPartitionInitialized

```solidity
event OperatorClearingHoldByPartitionInitialized()
```

Emitted once when the operator-clearing-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorClearingHoldByPartition`._

### OperatorHeldByPartition

```solidity
event OperatorHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an ERC-1410 operator creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                  |
| --------------------- | --------------- | -------------------------------------------- |
| operator `indexed`    | address         | The authorised operator initiating the hold. |
| tokenHolder `indexed` | address         | The holder whose balance is being held.      |
| partition             | bytes32         | Partition over which the hold is placed.     |
| holdId                | uint256         | Sequence id assigned to the hold.            |
| hold                  | IHoldTypes.Hold | The hold definition.                         |
| operatorData          | bytes           | Operator-supplied metadata.                  |

### OperatorHoldByPartitionInitialized

```solidity
event OperatorHoldByPartitionInitialized()
```

Emitted once when the operator-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorHoldByPartition`._

### OperatorInitialized

```solidity
event OperatorInitialized()
```

Emitted once when the operator capability is initialised on a token.

_Fires exclusively from `initializeOperator`._

### PartitionTransferredAndLocked

```solidity
event PartitionTransferredAndLocked(bytes32 indexed partition, address indexed from, address to, uint256 value, bytes data, uint256 expirationTimestamp, uint256 lockId)
```

Emitted when tokens are transferred to a recipient on a partition and locked until a future timestamp.

#### Parameters

| Name                | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| partition `indexed` | bytes32 | The partition on which the transfer and lock occurred.   |
| from `indexed`      | address | The address from which tokens were transferred.          |
| to                  | address | The address to which tokens were transferred and locked. |
| value               | uint256 | The amount of tokens transferred and locked.             |
| data                | bytes   | Additional data provided by the caller.                  |
| expirationTimestamp | uint256 | Unix timestamp at which the lock expires.                |
| lockId              | uint256 | Identifier assigned to the resulting lock.               |

### PartitionsInitialized

```solidity
event PartitionsInitialized(bool multiPartition)
```

Emitted once when the partitions capability is initialised on a token.

_Fires exclusively from `initializePartitions`._

#### Parameters

| Name           | Type | Description                                         |
| -------------- | ---- | --------------------------------------------------- |
| multiPartition | bool | Whether the token operates in multi-partition mode. |

### PartitionsProtected

```solidity
event PartitionsProtected(address indexed operator)
```

Emitted when the protected-partition mode is activated.

#### Parameters

| Name               | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| operator `indexed` | address | The address that called `protectPartitions`. |

### PartitionsUnProtected

```solidity
event PartitionsUnProtected(address indexed operator)
```

Emitted when the protected-partition mode is deactivated.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | The address that called `unprotectPartitions`. |

### PauseInitialized

```solidity
event PauseInitialized()
```

Emitted once when the pause capability is initialised on a token.

_Fires exclusively from `initializePause`._

### Paused

```solidity
event Paused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is set to `true`.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | Address of the caller who triggered the pause. |

### PrincipalInitialized

```solidity
event PrincipalInitialized()
```

Emitted once when the principal capability is initialised on a token.

_Fires exclusively from `initializePrincipal`._

### ProceedRecipientAdded

```solidity
event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data)
```

Emitted when a new proceed recipient is added to the token.

#### Parameters

| Name                       | Type    | Description                                       |
| -------------------------- | ------- | ------------------------------------------------- |
| operator `indexed`         | address | Address that executed the add operation.          |
| proceedRecipient `indexed` | address | Address added as a proceed recipient.             |
| data                       | bytes   | Arbitrary data associated with the new recipient. |

### ProceedRecipientDataUpdated

```solidity
event ProceedRecipientDataUpdated(address indexed operator, address indexed proceedRecipient, bytes newData)
```

Emitted when the data associated with a proceed recipient is updated.

#### Parameters

| Name                       | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| operator `indexed`         | address | Address that executed the update.            |
| proceedRecipient `indexed` | address | Address whose data was updated.              |
| newData                    | bytes   | New arbitrary data stored for the recipient. |

### ProceedRecipientRemoved

```solidity
event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient)
```

Emitted when an existing proceed recipient is removed from the token.

#### Parameters

| Name                       | Type    | Description                                     |
| -------------------------- | ------- | ----------------------------------------------- |
| operator `indexed`         | address | Address that executed the remove operation.     |
| proceedRecipient `indexed` | address | Address removed from the proceed-recipient set. |

### ProceedRecipientsInitialized

```solidity
event ProceedRecipientsInitialized(address[] proceedRecipients, bytes[] data)
```

Emitted once when the ProceedRecipients capability is initialised on a token.

_Fires exclusively from `initializeProceedRecipients` after the storage write succeeds._

#### Parameters

| Name              | Type      | Description                                                   |
| ----------------- | --------- | ------------------------------------------------------------- |
| proceedRecipients | address[] | Initial array of registered proceed-recipient addresses.      |
| data              | bytes[]   | Arbitrary per-recipient data supplied at initialisation time. |

### ProtectedByPartitionInitialized

```solidity
event ProtectedByPartitionInitialized()
```

Emitted once when the protected-by-partition capability is initialised on a token.

_Fires exclusively from `initializeProtectedByPartition`._

### ProtectedClearedHoldByPartition

```solidity
event ProtectedClearedHoldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a protected clearing hold is created successfully.

#### Parameters

| Name                  | Type            | Description                                                      |
| --------------------- | --------------- | ---------------------------------------------------------------- |
| operator `indexed`    | address         | The address that initiated the clearing hold creation.           |
| tokenHolder `indexed` | address         | The token holder whose tokens are placed on hold.                |
| partition             | bytes32         | The partition identifier.                                        |
| clearingId            | uint256         | The identifier assigned to the newly created clearing operation. |
| hold                  | IHoldTypes.Hold | The hold details.                                                |
| expirationDate        | uint256         | The expiration timestamp of the clearing operation.              |
| data                  | bytes           | Additional data passed with the clearing hold creation.          |
| operatorData          | bytes           | Operator-specific data associated with the operation.            |

### ProtectedClearedRedeemByPartition

```solidity
event ProtectedClearedRedeemByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a protected clearing redeem operation is successfully created for a partition.

#### Parameters

| Name                  | Type    | Description                                                  |
| --------------------- | ------- | ------------------------------------------------------------ |
| operator `indexed`    | address | The address that initiated the protected clearing operation. |
| tokenHolder `indexed` | address | The address of the token holder executing the clearing.      |
| partition             | bytes32 | The partition identifier for this clearing operation.        |
| clearingId            | uint256 | The unique identifier assigned to this clearing operation.   |
| amount                | uint256 | The amount cleared.                                          |
| expirationDate        | uint256 | The expiration timestamp for the clearing operation.         |
| data                  | bytes   | The operation data associated with the clearing.             |
| operatorData          | bytes   | Additional operator-specific data.                           |

### ProtectedClearedTransferByPartition

```solidity
event ProtectedClearedTransferByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a protected clearing transfer operation is successfully created for a partition.

#### Parameters

| Name                  | Type    | Description                                                  |
| --------------------- | ------- | ------------------------------------------------------------ |
| operator `indexed`    | address | The address that initiated the protected clearing operation. |
| tokenHolder `indexed` | address | The address of the token holder executing the clearing.      |
| to `indexed`          | address | The address to transfer tokens to.                           |
| partition             | bytes32 | The partition identifier for this clearing operation.        |
| clearingId            | uint256 | The unique identifier assigned to this clearing operation.   |
| amount                | uint256 | The amount cleared.                                          |
| expirationDate        | uint256 | The expiration timestamp for the clearing operation.         |
| data                  | bytes   | The operation data associated with the clearing.             |
| operatorData          | bytes   | Additional operator-specific data.                           |

### ProtectedClearingByPartitionInitialized

```solidity
event ProtectedClearingByPartitionInitialized()
```

Emitted once when the protected-clearing-by-partition capability is initialised on a token.

_Fires exclusively from `initializeProtectedClearingByPartition`._

### ProtectedClearingHoldByPartitionInitialized

```solidity
event ProtectedClearingHoldByPartitionInitialized()
```

Emitted once when the protected-clearing-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeProtectedClearingHoldByPartition`._

### ProtectedHeldByPartition

```solidity
event ProtectedHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a protected hold authorised by an EIP-712 signature is created.

#### Parameters

| Name                  | Type            | Description                                                    |
| --------------------- | --------------- | -------------------------------------------------------------- |
| operator `indexed`    | address         | The address submitting the protected hold (signature relayer). |
| tokenHolder `indexed` | address         | The holder whose balance is being held; must match the signer. |
| partition             | bytes32         | Partition over which the hold is placed.                       |
| holdId                | uint256         | Sequence id assigned to the hold.                              |
| hold                  | IHoldTypes.Hold | The hold definition.                                           |
| operatorData          | bytes           | Operator-supplied metadata.                                    |

### ProtectedHoldByPartitionInitialized

```solidity
event ProtectedHoldByPartitionInitialized()
```

Emitted once when the protected-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeProtectedHoldByPartition`._

### ProtectedPartitionsInitialized

```solidity
event ProtectedPartitionsInitialized(bool arePartitionsProtected)
```

Emitted once when the protected partitions capability is initialised on a token.

_Fires exclusively from `initializeProtectedPartitions` after the storage write succeeds._

#### Parameters

| Name                   | Type | Description                                      |
| ---------------------- | ---- | ------------------------------------------------ |
| arePartitionsProtected | bool | Initial protection state set at deployment time. |

### ProtectedRedeemFrom

```solidity
event ProtectedRedeemFrom(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised redemption executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| partition `indexed` | bytes32 | Partition from which the tokens are redeemed.                   |
| operator `indexed`  | address | The address that submitted the protected redemption.            |
| from `indexed`      | address | The holder whose tokens are being redeemed; must be the signer. |
| value               | uint256 | Number of tokens redeemed.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.        |
| nonce               | uint256 | Holder nonce consumed by this operation.                        |
| signature           | bytes   | EIP-712 signature provided by the holder.                       |

### ProtectedRedeemedByPartition

```solidity
event ProtectedRedeemedByPartition(address indexed operator, address indexed from, uint256 amount, bytes32 partition, IProtectedPartitions.ProtectionData protectionData)
```

Emitted when a protected redemption completes successfully.

#### Parameters

| Name               | Type                                | Description                                              |
| ------------------ | ----------------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                             | The address that initiated the redemption (msg.sender).  |
| from `indexed`     | address                             | The token holder whose tokens are redeemed.              |
| amount             | uint256                             | The quantity of tokens redeemed.                         |
| partition          | bytes32                             | The partition from which tokens are redeemed.            |
| protectionData     | IProtectedPartitions.ProtectionData | The protection metadata used for signature verification. |

### ProtectedTransferFrom

```solidity
event ProtectedTransferFrom(bytes32 indexed partition, address indexed operator, address indexed from, address to, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised transfer executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                        |
| ------------------- | ------- | ------------------------------------------------------------------ |
| partition `indexed` | bytes32 | Partition from which the tokens are transferred.                   |
| operator `indexed`  | address | The address that submitted the protected transfer.                 |
| from `indexed`      | address | The holder whose tokens are being transferred; must be the signer. |
| to                  | address | Recipient of the transferred tokens.                               |
| value               | uint256 | Number of tokens transferred.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.           |
| nonce               | uint256 | Holder nonce consumed by this operation.                           |
| signature           | bytes   | EIP-712 signature provided by the holder.                          |

### ProtectedTransferredByPartition

```solidity
event ProtectedTransferredByPartition(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes32 partition, IProtectedPartitions.ProtectionData protectionData)
```

Emitted when a protected transfer completes successfully.

#### Parameters

| Name               | Type                                | Description                                              |
| ------------------ | ----------------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                             | The address that initiated the transfer (msg.sender).    |
| from `indexed`     | address                             | The token holder whose tokens are transferred.           |
| to `indexed`       | address                             | The recipient of the transferred tokens.                 |
| amount             | uint256                             | The quantity of tokens transferred.                      |
| partition          | bytes32                             | The partition from which tokens are transferred.         |
| protectionData     | IProtectedPartitions.ProtectionData | The protection metadata used for signature verification. |

### RateUpdated

```solidity
event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals)
```

Emitted when the fixed rate is updated by an authorised operator.

#### Parameters

| Name               | Type    | Description                         |
| ------------------ | ------- | ----------------------------------- |
| operator `indexed` | address | Address that performed the update.  |
| newRate            | uint256 | New scaled rate value.              |
| newRateDecimals    | uint8   | New decimal precision for the rate. |

### RecoveryInitialized

```solidity
event RecoveryInitialized()
```

Emitted once when the recovery capability is initialised on a token.

_Fires exclusively from `initializeRecovery`._

### RecoverySuccess

```solidity
event RecoverySuccess(address lostWallet, address newWallet, address investorOnchainID)
```

Emitted when a lost wallet is successfully recovered to a new address.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| lostWallet        | address | Address of the wallet that was lost.               |
| newWallet         | address | Address of the replacement wallet.                 |
| investorOnchainID | address | OnchainID of the investor performing the recovery. |

### Redeemed

```solidity
event Redeemed(address indexed operator, address indexed from, uint256 value, bytes data)
```

Emitted when tokens are redeemed from a holder&#39;s balance.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| operator `indexed` | address | Account that executed the redemption.                 |
| from `indexed`     | address | Address from which tokens were burnt.                 |
| value              | uint256 | Amount of tokens redeemed, denominated in base units. |
| data               | bytes   | Arbitrary payload forwarded alongside the redemption. |

### RedeemedByPartition

```solidity
event RedeemedByPartition(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, bytes data, bytes operatorData)
```

Emitted when tokens are redeemed from a partition.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were redeemed from.           |
| operator `indexed`  | address | Address that performed the redemption.             |
| from `indexed`      | address | Token holder whose tokens were redeemed.           |
| value               | uint256 | Token quantity redeemed.                           |
| data                | bytes   | Caller-supplied data attached to the redemption.   |
| operatorData        | bytes   | Operator-supplied data attached to the redemption. |

### RemovedFromControlList

```solidity
event RemovedFromControlList(address indexed operator, address indexed account)
```

Emitted when an account is removed from the control list.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the removal. |
| account `indexed`  | address | Address of the account that was removed.         |

### RemovedFromExternalControlLists

```solidity
event RemovedFromExternalControlLists(address indexed operator, address controlList)
```

Emitted when an external control list contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.                |
| controlList        | address | Address of the external control list contract that was removed. |

### RemovedFromExternalKycLists

```solidity
event RemovedFromExternalKycLists(address indexed operator, address kycList)
```

Emitted when an external KYC list contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                                 |
| ------------------ | ------- | ----------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.            |
| kycList            | address | Address of the external KYC list contract that was removed. |

### RemovedFromExternalPauses

```solidity
event RemovedFromExternalPauses(address indexed operator, address pause)
```

Emitted when an external pause contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.         |
| pause              | address | Address of the external pause contract that was removed. |

### RemovedFromIssuerList

```solidity
event RemovedFromIssuerList(address indexed operator, address indexed issuer)
```

Emitted when an issuer is removed from the trusted issuer list.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the removal. |
| issuer `indexed`   | address | Address of the issuer that was removed.          |

### RevocationRegistryUpdated

```solidity
event RevocationRegistryUpdated(address indexed oldRegistryAddress, address indexed newRegistryAddress)
```

Emitted when the revocation registry address is updated.

#### Parameters

| Name                         | Type    | Description                                    |
| ---------------------------- | ------- | ---------------------------------------------- |
| oldRegistryAddress `indexed` | address | Previous revocation registry contract address. |
| newRegistryAddress `indexed` | address | New revocation registry contract address.      |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation over all partitions of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### RevokedOperatorByPartition

```solidity
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation for a specific partition of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the revocation applies to.        |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### RoleGranted

```solidity
event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)
```

Emitted when a role is granted to an account.

#### Parameters

| Name               | Type    | Description                           |
| ------------------ | ------- | ------------------------------------- |
| operator `indexed` | address | The address that performed the grant. |
| account `indexed`  | address | The account that received the role.   |
| role `indexed`     | bytes32 | The role that was granted.            |

### RoleRenounced

```solidity
event RoleRenounced(address indexed account, bytes32 indexed role)
```

Emitted when an account voluntarily renounces a role it holds.

#### Parameters

| Name              | Type    | Description                          |
| ----------------- | ------- | ------------------------------------ |
| account `indexed` | address | The account that renounced the role. |
| role `indexed`    | bytes32 | The role that was renounced.         |

### RoleRevoked

```solidity
event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)
```

Emitted when a role is revoked from an account.

#### Parameters

| Name               | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| operator `indexed` | address | The address that performed the revocation.   |
| account `indexed`  | address | The account from which the role was revoked. |
| role `indexed`     | bytes32 | The role that was revoked.                   |

### RolesApplied

```solidity
event RolesApplied(bytes32[] requestedRoles, bool[] requestedStates, address account, bytes32[] appliedRoles, bool[] appliedStates)
```

Emitted when multiple roles are applied to an account in a single operation.

#### Parameters

| Name            | Type      | Description                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| requestedRoles  | bytes32[] | The roles that were submitted by the caller.                             |
| requestedStates | bool[]    | Corresponding grant/revoke flags; `true` means granted, `false` revoked. |
| account         | address   | The account to which the roles were applied.                             |
| appliedRoles    | bytes32[] | The subset of `requestedRoles` whose state effectively changed.          |
| appliedStates   | bool[]    | The corresponding final state for each effectively applied role.         |

### ScheduledBalanceAdjustmentCancelled

```solidity
event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator)
```

Emitted when a previously scheduled balance adjustment is cancelled.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| balanceAdjustmentId | uint256 | Sequential identifier of the cancelled adjustment. |
| operator `indexed`  | address | Address that performed the cancellation.           |

### ScheduledBalanceAdjustmentForceCancelled

```solidity
event ScheduledBalanceAdjustmentForceCancelled(uint256 balanceAdjustmentId, address indexed operator)
```

Emitted when an admin force-cancels a balance adjustment, bypassing date guards.

#### Parameters

| Name                | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| balanceAdjustmentId | uint256 | Sequential identifier of the force-cancelled adjustment. |
| operator `indexed`  | address | Address that performed the force-cancellation.           |

### ScheduledBalanceAdjustmentInitialized

```solidity
event ScheduledBalanceAdjustmentInitialized()
```

Emitted once when the scheduled balance adjustment capability is initialised on a token.

_Fires exclusively from `initializeScheduledBalanceAdjustment`._

### ScheduledBalanceAdjustmentSet

```solidity
event ScheduledBalanceAdjustmentSet(bytes32 corporateActionId, uint256 balanceAdjustmentId, address indexed operator, uint256 indexed executionDate, uint256 factor, uint256 decimals)
```

Emitted when a balance adjustment is successfully scheduled.

#### Parameters

| Name                    | Type    | Description                                                    |
| ----------------------- | ------- | -------------------------------------------------------------- |
| corporateActionId       | bytes32 | On-chain identifier of the associated corporate action record. |
| balanceAdjustmentId     | uint256 | Sequential identifier of the scheduled adjustment.             |
| operator `indexed`      | address | Address that scheduled the adjustment.                         |
| executionDate `indexed` | uint256 | Unix timestamp at which the adjustment will be executed.       |
| factor                  | uint256 | Numerator of the adjustment ratio.                             |
| decimals                | uint256 | Denominator exponent; effective ratio = factor / 10^decimals.  |

### ScheduledCrossOrderedTasksInitialized

```solidity
event ScheduledCrossOrderedTasksInitialized()
```

Emitted once when the scheduled-cross-ordered-tasks capability is initialised on a token.

_Fires exclusively from `initializeScheduledCrossOrderedTasks`._

### SecurityHoldersAtSnapshotInitialized

```solidity
event SecurityHoldersAtSnapshotInitialized()
```

Emitted once when the security-holders-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeSecurityHoldersAtSnapshot`._

### SecurityHoldersInitialized

```solidity
event SecurityHoldersInitialized()
```

Emitted once when the security-holders capability is initialised on a token.

_Fires exclusively from `initializeSecurityHolders`._

### SnapshotTaken

```solidity
event SnapshotTaken(address indexed operator, uint256 indexed snapshotID)
```

Emitted when an operator creates a new snapshot.

#### Parameters

| Name                 | Type    | Description                                   |
| -------------------- | ------- | --------------------------------------------- |
| operator `indexed`   | address | Account that initiated the snapshot creation. |
| snapshotID `indexed` | uint256 | Identifier assigned to the created snapshot.  |

### SnapshotTriggered

```solidity
event SnapshotTriggered(uint256 snapshotId, bytes metadata)
```

Emitted when a scheduled snapshot is executed.

#### Parameters

| Name       | Type    | Description                                                 |
| ---------- | ------- | ----------------------------------------------------------- |
| snapshotId | uint256 | Identifier assigned to the triggered snapshot.              |
| metadata   | bytes   | Arbitrary metadata associated with the scheduled execution. |

### SnapshotsByPartitionInitialized

```solidity
event SnapshotsByPartitionInitialized()
```

Emitted once when the snapshots-by-partition capability is initialised on a token.

_Fires exclusively from `initializeSnapshotsByPartition`._

### SnapshotsInitialized

```solidity
event SnapshotsInitialized()
```

Emitted once when the snapshots capability is initialised on a token.

_Fires exclusively from `initializeSnapshots`._

### SsiManagementInitialized

```solidity
event SsiManagementInitialized()
```

Emitted once when the SSI management capability is initialised on a token.

_Fires exclusively from `initializeSsiManagement`._

### SystemBlockNumberChanged

```solidity
event SystemBlockNumberChanged(uint256 legacySystemNumber, uint256 newSystemNumber)
```

Emitted when the overridden system block number is changed.

#### Parameters

| Name               | Type    | Description                                        |
| ------------------ | ------- | -------------------------------------------------- |
| legacySystemNumber | uint256 | The previous override value (0 when none was set). |
| newSystemNumber    | uint256 | The new override value.                            |

### SystemBlockNumberReset

```solidity
event SystemBlockNumberReset()
```

Emitted when the system block number override is cleared.

### SystemChainIdChanged

```solidity
event SystemChainIdChanged(uint256 oldChainId, uint256 newChainId)
```

Emitted when the overridden chain id is changed.

#### Parameters

| Name       | Type    | Description                                        |
| ---------- | ------- | -------------------------------------------------- |
| oldChainId | uint256 | The previous override value (0 when none was set). |
| newChainId | uint256 | The new override value.                            |

### SystemChainIdReset

```solidity
event SystemChainIdReset()
```

Emitted when the chain id override is cleared.

### SystemSenderChanged

```solidity
event SystemSenderChanged(address oldSender, address newSender)
```

Emitted when the overridden message sender is changed.

#### Parameters

| Name      | Type    | Description                                                       |
| --------- | ------- | ----------------------------------------------------------------- |
| oldSender | address | The previous override value (the zero address when none was set). |
| newSender | address | The new override value.                                           |

### SystemSenderReset

```solidity
event SystemSenderReset()
```

Emitted when the message sender override is cleared.

### SystemTimestampChanged

```solidity
event SystemTimestampChanged(uint256 legacySystemTime, uint256 newSystemTime)
```

Emitted when the overridden system timestamp is changed.

#### Parameters

| Name             | Type    | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| legacySystemTime | uint256 | The previous override value (0 when none was set). |
| newSystemTime    | uint256 | The new override value.                            |

### SystemTimestampReset

```solidity
event SystemTimestampReset()
```

Emitted when the system timestamp override is cleared.

### TaskExecutionFailed

```solidity
event TaskExecutionFailed(bytes32 indexed actionId, bytes32 indexed taskType, uint256 scheduledTimestamp)
```

Emitted when execution of a scheduled task fails.

#### Parameters

| Name               | Type    | Description                                                               |
| ------------------ | ------- | ------------------------------------------------------------------------- |
| actionId `indexed` | bytes32 | Corporate action identifier or task type associated with the failed task. |
| taskType `indexed` | bytes32 | Scheduled task category or dispatch type that failed.                     |
| scheduledTimestamp | uint256 | Timestamp at which the failed task was scheduled to become due.           |

### TokensFrozen

```solidity
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of tokens is frozen for a wallet.

#### Parameters

| Name              | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were frozen. |
| amount            | uint256 | The amount of tokens frozen.                 |
| partition         | bytes32 | The partition from which tokens were frozen. |

### TokensUnfrozen

```solidity
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of previously frozen tokens is unfrozen for a wallet.

#### Parameters

| Name              | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were unfrozen. |
| amount            | uint256 | The amount of tokens unfrozen.                 |
| partition         | bytes32 | The partition to which tokens were restored.   |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferAndLockByPartitionInitialized

```solidity
event TransferAndLockByPartitionInitialized()
```

Emitted once when the transfer-and-lock-by-partition capability is initialised on a token.

_Fires exclusively from `initializeTransferAndLockByPartition`._

### TransferAndLockInitialized

```solidity
event TransferAndLockInitialized()
```

Emitted once when the transfer-and-lock capability is initialised on a token.

_Fires exclusively from `initializeTransferAndLock`._

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed fromPartition, address operator, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                    | Type    | Description                           |
| ----------------------- | ------- | ------------------------------------- |
| fromPartition `indexed` | bytes32 | Source partition.                     |
| operator                | address | Address that initiated the transfer.  |
| from `indexed`          | address | Token holder whose balance decreased. |
| to `indexed`            | address | Recipient whose balance increased.    |
| value                   | uint256 | Token quantity transferred.           |
| data                    | bytes   | Caller-supplied data.                 |
| operatorData            | bytes   | Operator-supplied data.               |

### TransferByPartitionInitialized

```solidity
event TransferByPartitionInitialized()
```

Emitted once when the transfer-by-partition capability is initialised on a token.

_Fires exclusively from `initializeTransferByPartition`._

### TransferFromWithData

```solidity
event TransferFromWithData(address indexed sender, address indexed from, address indexed to, uint256 amount, bytes data)
```

Emitted when tokens are transferred via an allowance with an attached data payload.

#### Parameters

| Name             | Type    | Description                                                            |
| ---------------- | ------- | ---------------------------------------------------------------------- |
| sender `indexed` | address | Account that executed the transfer (typically `msg.sender`).           |
| from `indexed`   | address | Address from which tokens were debited.                                |
| to `indexed`     | address | Recipient of the transferred tokens.                                   |
| amount           | uint256 | Amount of tokens transferred, denominated in base units.               |
| data             | bytes   | Arbitrary payload supplied by the caller for off-chain interpretation. |

### TransferInitialized

```solidity
event TransferInitialized()
```

Emitted once when the transfer capability is initialised on a token.

_Fires exclusively from `initializeTransfer`._

### TransferWithData

```solidity
event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data)
```

Emitted when tokens are transferred with an attached data payload.

#### Parameters

| Name             | Type    | Description                                                            |
| ---------------- | ------- | ---------------------------------------------------------------------- |
| sender `indexed` | address | Account that executed the transfer (typically `msg.sender`).           |
| to `indexed`     | address | Recipient of the transferred tokens.                                   |
| amount           | uint256 | Amount of tokens transferred, denominated in base units.               |
| data             | bytes   | Arbitrary payload supplied by the caller for off-chain interpretation. |

### Unpaused

```solidity
event Unpaused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is cleared to `false`.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who triggered the unpause. |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

Emitted when core token metadata is updated.

#### Parameters

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| newName `indexed`      | string  | New token name.                                  |
| newSymbol `indexed`    | string  | New token symbol.                                |
| newDecimals            | uint8   | New decimal precision.                           |
| newVersion             | string  | New token version string.                        |
| newOnchainID `indexed` | address | New onchainID address associated with the token. |

### VotingCancelled

```solidity
event VotingCancelled(uint256 voteId, address indexed operator)
```

Emitted when a voting is cancelled

#### Parameters

| Name               | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| voteId             | uint256 | The ID of the cancelled voting                       |
| operator `indexed` | address | The address of the operator who cancelled the voting |

### VotingForceCancelled

```solidity
event VotingForceCancelled(uint256 voteId, address indexed operator)
```

Emitted when an admin force-cancels a voting, bypassing date guards

#### Parameters

| Name               | Type    | Description                                                |
| ------------------ | ------- | ---------------------------------------------------------- |
| voteId             | uint256 | The ID of the force-cancelled voting                       |
| operator `indexed` | address | The address of the operator who force-cancelled the voting |

### VotingInitialized

```solidity
event VotingInitialized()
```

Emitted once when the voting capability is initialised on a token.

_Fires exclusively from `initializeVoting`._

### VotingSecurityHoldersInitialized

```solidity
event VotingSecurityHoldersInitialized()
```

Emitted once when the voting-security-holders capability is initialised on a token.

_Fires exclusively from `initializeVotingSecurityHolders`._

### VotingSet

```solidity
event VotingSet(bytes32 corporateActionId, uint256 voteId, address indexed operator, uint256 indexed recordDate, bytes data)
```

Emitted when a voting is set

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| corporateActionId    | bytes32 | The ID of the corporate action                 |
| voteId               | uint256 | The ID of the voting                           |
| operator `indexed`   | address | The address of the operator who set the voting |
| recordDate `indexed` | uint256 | The voting record date                         |
| data                 | bytes   | The voting payload                             |

## Errors

### AbafChangeForBlockForbidden

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber)
```

Raised when attempting to change ABAF for a block that is forbidden

#### Parameters

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| blockNumber | uint256 | The block number that is forbidden |

### AccountAssignedToRole

```solidity
error AccountAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to grant a role to an account that already holds it.

#### Parameters

| Name    | Type    | Description                               |
| ------- | ------- | ----------------------------------------- |
| role    | bytes32 | The role the account already holds.       |
| account | address | The account already assigned to the role. |

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

### AccountIsBlocked

```solidity
error AccountIsBlocked(address account)
```

Reverts when an operation targets or is requested by a blocked account.

_The blocking policy is enforced by the domain that performs the check._

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | Account rejected by the blocking validation. |

### AccountIsNotIssuer

```solidity
error AccountIsNotIssuer(address issuer)
```

Thrown when an address is required to be a listed issuer but is not.

#### Parameters

| Name   | Type    | Description                                          |
| ------ | ------- | ---------------------------------------------------- |
| issuer | address | The address that failed the issuer membership check. |

### AccountNotAssignedToRole

```solidity
error AccountNotAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to revoke or renounce a role from an account that does not hold it.

#### Parameters

| Name    | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| role    | bytes32 | The role the account does not hold.   |
| account | address | The account not assigned to the role. |

### AddressNotVerified

```solidity
error AddressNotVerified()
```

Thrown when a transfer target address has not passed identity verification.

### AlreadyInitialized

```solidity
error AlreadyInitialized()
```

Reverts when an initialisation routine is invoked more than once.

_Used by contracts or facets that must be initialised exactly once._

### AmortizationAlreadyExecuted

```solidity
error AmortizationAlreadyExecuted(bytes32 corporateActionId, uint256 amortizationId)
```

Amortization execution failed because the amortization has already been executed.

#### Parameters

| Name              | Type    | Description                                                   |
| ----------------- | ------- | ------------------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the already-executed amortization. |
| amortizationId    | uint256 | The amortization ID that was already executed.                |

### AmortizationCreationFailed

```solidity
error AmortizationCreationFailed()
```

Amortization creation failed due to an internal failure.

### AmortizationHasActiveHolds

```solidity
error AmortizationHasActiveHolds(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when attempting to cancel an amortization that still has active holds.

#### Parameters

| Name              | Type    | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.      |
| amortizationID    | uint256 | The amortization ID that still has pending holds. |

### AmortizationHoldFailed

```solidity
error AmortizationHoldFailed(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when creating a hold for an amortization fails.

#### Parameters

| Name              | Type    | Description                                         |
| ----------------- | ------- | --------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.        |
| amortizationID    | uint256 | The amortization ID for which hold creation failed. |

### AmortizationHoldNotActive

```solidity
error AmortizationHoldNotActive(bytes32 corporateActionId, uint256 amortizationID, address tokenHolder)
```

Thrown when attempting to release a hold that is not active for the given holder.

#### Parameters

| Name              | Type    | Description                                          |
| ----------------- | ------- | ---------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.         |
| amortizationID    | uint256 | The amortization ID.                                 |
| tokenHolder       | address | The address of the token holder with no active hold. |

### AmortizationNotActive

```solidity
error AmortizationNotActive(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when attempting to operate on a cancelled amortization.

#### Parameters

| Name              | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization. |
| amortizationID    | uint256 | The amortization ID.                         |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### BalanceAdjustmentAlreadyExecuted

```solidity
error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId)
```

Reverts when attempting to cancel or re-execute an adjustment that has already run.

#### Parameters

| Name                | Type    | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| corporateActionId   | bytes32 | Identifier of the corporate action that was already executed.   |
| balanceAdjustmentId | uint256 | Identifier of the balance adjustment that was already executed. |

### BalanceAdjustmentCreationFailed

```solidity
error BalanceAdjustmentCreationFailed()
```

Reverts when the underlying storage layer fails to create a corporate action record.

### BrokenClockMode

```solidity
error BrokenClockMode()
```

Raised when the clock mode is broken

### CannotRecoverWallet

```solidity
error CannotRecoverWallet()
```

Thrown when wallet recovery preconditions are not met (e.g. identity mismatch).

### CannotRenounceSoleAdmin

```solidity
error CannotRenounceSoleAdmin()
```

Thrown when the sole holder of `DEFAULT_ADMIN_ROLE` attempts to renounce it, which would permanently lock all admin-gated functions.

### ClearingIsActivated

```solidity
error ClearingIsActivated()
```

Thrown when an administration action requires clearing to be inactive but it is currently enabled.

### ClearingIsDisabled

```solidity
error ClearingIsDisabled()
```

Thrown when a clearing-dependent operation is attempted while the clearing feature is disabled on the token.

### ComplianceCallFailed

```solidity
error ComplianceCallFailed()
```

Thrown when an external call to the compliance contract reverts or returns false.

### ComplianceNotAllowed

```solidity
error ComplianceNotAllowed()
```

Thrown when a transfer is blocked by the compliance module.

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

Reverts when ordered array values contradict expected ordering.

_Indicates that two indexed values cannot both satisfy the required monotonic or range invariant._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| lowerIndex | uint256 | Lower array index involved in the contradiction. |
| upperIndex | uint256 | Upper array index involved in the contradiction. |

### CorporateActionAlreadyDisabled

```solidity
error CorporateActionAlreadyDisabled(bytes32 corporateActionId)
```

Thrown when attempting to cancel a corporate action that is already disabled.

#### Parameters

| Name              | Type    | Description                                              |
| ----------------- | ------- | -------------------------------------------------------- |
| corporateActionId | bytes32 | The identifier of the already-disabled corporate action. |

### CorporateActionNotFound

```solidity
error CorporateActionNotFound(bytes32 corporateActionId)
```

Thrown when a lookup by `corporateActionId` returns no matching record.

#### Parameters

| Name              | Type    | Description                        |
| ----------------- | ------- | ---------------------------------- |
| corporateActionId | bytes32 | The identifier that was not found. |

### CouponAlreadyExecuted

```solidity
error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId)
```

Reverts when an operator attempts to cancel a coupon whose execution date has already passed.

#### Parameters

| Name              | Type    | Description                                                    |
| ----------------- | ------- | -------------------------------------------------------------- |
| corporateActionId | bytes32 | Identifier of the underlying corporate action.                 |
| couponId          | uint256 | One-indexed identifier of the coupon that cannot be cancelled. |

### CouponCreationFailed

```solidity
error CouponCreationFailed()
```

Reverts when the underlying corporate-action creation step returns the zero id, indicating the coupon could not be persisted.

### CouponNotFound

```solidity
error CouponNotFound(uint256 couponID)
```

Reverts when a coupon identifier does not resolve to an existing corporate action.

#### Parameters

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| couponID | uint256 | The coupon identifier that was not found. |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### DecimalsOverflow

```solidity
error DecimalsOverflow()
```

Reverts when the cumulative decimals shift would overflow `uint8`.

### DecimalsTooLarge

```solidity
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals)
```

Reverts when the difference between current decimals and new decimals exceeds the maximum value.

_Protects decimals amount difference between current and new not te be greater than maximum._

#### Parameters

| Name            | Type  | Description                  |
| --------------- | ----- | ---------------------------- |
| currentDecimals | uint8 | the current decimals amount. |
| newDecimals     | uint8 | the new decimals amount.     |

### DividendAlreadyExecuted

```solidity
error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId)
```

Reverts when an operator attempts to cancel a dividend whose execution date has already passed.

#### Parameters

| Name              | Type    | Description                                                      |
| ----------------- | ------- | ---------------------------------------------------------------- |
| corporateActionId | bytes32 | Identifier of the underlying corporate action.                   |
| dividendId        | uint256 | One-indexed identifier of the dividend that cannot be cancelled. |

### DividendCreationFailed

```solidity
error DividendCreationFailed()
```

Reverts when the underlying corporate-action creation step returns the zero id, indicating the dividend could not be persisted.

### DocumentDoesNotExist

```solidity
error DocumentDoesNotExist(bytes32 name)
```

Raised when an operation targets a document name that has not been registered.

#### Parameters

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| name | bytes32 | The document name that could not be found in storage. |

### DuplicatedCorporateAction

```solidity
error DuplicatedCorporateAction(bytes32 actionType, bytes data)
```

Thrown when attempting to add a corporate action whose content hash already exists.

_De-duplication is enforced via `keccak256(abi.encode(actionType, data))`._

#### Parameters

| Name       | Type    | Description                                                |
| ---------- | ------- | ---------------------------------------------------------- |
| actionType | bytes32 | The action type of the duplicate corporate action.         |
| data       | bytes   | The ABI-encoded payload of the duplicate corporate action. |

### ERC2612ExpiredSignature

```solidity
error ERC2612ExpiredSignature(uint256 deadline)
```

Raised when a permit signature is submitted after its expiry deadline.

_The permit must not mutate allowance state when the deadline has passed._

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| deadline | uint256 | Timestamp after which the permit is no longer valid. |

### ERC2612InvalidSigner

```solidity
error ERC2612InvalidSigner(address signer, address owner)
```

Raised when the recovered permit signer does not match the token owner.

_Protects approvals from invalid, malformed, or unauthorised signatures._

#### Parameters

| Name   | Type    | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| signer | address | Address recovered from the submitted permit signature. |
| owner  | address | Address expected to have authorised the permit.        |

### EmptyHASH

```solidity
error EmptyHASH()
```

Raised when `setDocument` is called with a zero-value document hash.

_A zero hash provides no integrity guarantee and is therefore disallowed._

### EmptyName

```solidity
error EmptyName()
```

Raised when `setDocument` is called with a zero-value document name.

_A `bytes32(0)` name is rejected to prevent silent collisions in storage._

### EmptyURI

```solidity
error EmptyURI()
```

Raised when `setDocument` is called with an empty URI string.

_An empty URI would produce an unresolvable document reference._

### ExpirationDateNotReached

```solidity
error ExpirationDateNotReached()
```

Thrown when an action requires the clearing operation to have expired (e.g., a reclaim attempt) but the expiration timestamp has not yet passed.

### ExpirationDateReached

```solidity
error ExpirationDateReached()
```

Thrown when an action requires the clearing operation to still be within its validity window but its expiration timestamp has already passed.

### ExpiredDeadline

```solidity
error ExpiredDeadline(uint256 deadline)
```

Reverts when a signed payload is submitted after its deadline.

_The caller must provide and validate deadlines before accepting the signed operation._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| deadline | uint256 | Expired deadline carried by the signed payload. |

### ExponentOverflow

```solidity
error ExponentOverflow(uint256 exponent)
```

Reverts when an exponent would cause `10 ** exponent` to overflow `uint256`.

_Thrown by `DecimalsLib.checkExponentOverflow` when `exponent &gt;= 78`._

#### Parameters

| Name     | Type    | Description                                  |
| -------- | ------- | -------------------------------------------- |
| exponent | uint256 | The exponent that would produce an overflow. |

### ExternalControlListsNotUpdated

```solidity
error ExternalControlListsNotUpdated(address[] controlLista, bool[] actives)
```

Thrown when a batch update of external control lists fails to complete.

#### Parameters

| Name         | Type      | Description                                                            |
| ------------ | --------- | ---------------------------------------------------------------------- |
| controlLista | address[] | Array of external control list contract addresses that were submitted. |
| actives      | bool[]    | Corresponding activation flags that were submitted.                    |

### ExternalKycListsNotUpdated

```solidity
error ExternalKycListsNotUpdated(address[] kycList, bool[] actives)
```

Thrown when a batch update of external KYC lists fails to complete.

#### Parameters

| Name    | Type      | Description                                                        |
| ------- | --------- | ------------------------------------------------------------------ |
| kycList | address[] | Array of external KYC list contract addresses that were submitted. |
| actives | bool[]    | Corresponding activation flags that were submitted.                |

### ExternalPausesNotUpdated

```solidity
error ExternalPausesNotUpdated(address[] pauses, bool[] actives)
```

Thrown when a batch update of external pauses fails to complete.

#### Parameters

| Name    | Type      | Description                                                     |
| ------- | --------- | --------------------------------------------------------------- |
| pauses  | address[] | Array of external pause contract addresses that were submitted. |
| actives | bool[]    | Corresponding activation flags that were submitted.             |

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### FacetPreviousVersionNotAccepted

```solidity
error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions)
```

Raised when an initialiser requires the facet&#39;s previously registered version to match one of an expected set and the current `lastVersion` falls outside that set.

#### Parameters

| Name             | Type      | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| facetId          | bytes32   | Identifier of the facet being upgraded.      |
| lastVersion      | uint256   | Last version currently stored for the facet. |
| expectedVersions | uint256[] | List of acceptable predecessor versions.     |

### FacetReady

```solidity
error FacetReady(bytes32 facetId, uint256 versionId)
```

Raised by `checkFacetNotReady` when a facet is already marked ready for the resolver&#39;s current version and a subsequent ready-marking attempt would be a double initialisation.

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| facetId   | bytes32 | Identifier of the facet already flagged as ready. |
| versionId | uint256 | Version for which the facet is already ready.     |

### FactorIsZero

```solidity
error FactorIsZero()
```

Reverts when `factor` is zero, which would zero-out all holder balances.

### FactorOverflow

```solidity
error FactorOverflow()
```

Reverts when the proposed factor would overflow the cumulative ABAF.

### FutureLookup

```solidity
error FutureLookup(uint256 timepoint, uint256 currentClock)
```

Raised when querying past votes or supply with a future timepoint

#### Parameters

| Name         | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| timepoint    | uint256 | The requested future timepoint |
| currentClock | uint256 | The current clock value        |

### GreaterThanMaxUint256

```solidity
error GreaterThanMaxUint256(uint256 amount, uint8 decimals)
```

Reverts when multiplying `amount` by `10 ** decimals` would exceed `uint256` max.

_Thrown by `DecimalsLib.calculateDecimalsAdjustment` when `amount &gt; MAX_UINT256 / 10 ** decimals`._

#### Parameters

| Name     | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| amount   | uint256 | The token amount that cannot be scaled up. |
| decimals | uint8   | The exponent that causes the overflow.     |

### HoldExpirationNotReached

```solidity
error HoldExpirationNotReached()
```

Reverts when a reclaim is attempted before the hold&#39;s expiration timestamp.

### HoldExpirationReached

```solidity
error HoldExpirationReached()
```

Reverts when an operation requires an unexpired hold but the hold has expired.

### HoldingAssetNotFound

```solidity
error HoldingAssetNotFound(address assetAddress)
```

Thrown when looking up a holdings asset that has not been registered.

#### Parameters

| Name         | Type    | Description                              |
| ------------ | ------- | ---------------------------------------- |
| assetAddress | address | Address of the asset that was not found. |

### HoldingsAssetAlreadyExists

```solidity
error HoldingsAssetAlreadyExists(address assetAddress)
```

Thrown when adding a holdings asset that is already registered.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| assetAddress | address | Address of the asset that is already present. |

### HoldingsAssetTypeNotSupported

```solidity
error HoldingsAssetTypeNotSupported(uint8 holdingsAssetType)
```

Thrown when a holdings asset declares a type outside the supported set.

#### Parameters

| Name              | Type  | Description                                             |
| ----------------- | ----- | ------------------------------------------------------- |
| holdingsAssetType | uint8 | The unsupported `HoldingsAssetType` value (as `uint8`). |

### IdentityRegistryCallFailed

```solidity
error IdentityRegistryCallFailed()
```

Thrown when an external call to the identity registry reverts or returns false.

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

Thrown when the lengths of two input boolean arrays do not match.

### InsufficientAllowance

```solidity
error InsufficientAllowance(address spender, address from)
```

Reverts when `spender` attempts to consume more allowance than `from` has granted.

_Raised by `transferFrom`-style flows and by {IAllowance.decreaseAllowance} when the subtracted amount exceeds the current allowance._

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| spender | address | Address attempting to spend on behalf of `from`. |
| from    | address | Address whose allowance is being consumed.       |

### InsufficientBalance

```solidity
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition)
```

Thrown when a transfer or redemption is attempted with insufficient partition balance.

#### Parameters

| Name      | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| account   | address | The account whose balance was checked. |
| balance   | uint256 | The actual balance available.          |
| value     | uint256 | The amount that was requested.         |
| partition | bytes32 | The partition that was checked.        |

### InsufficientFrozenBalance

```solidity
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition)
```

Thrown when an unfreeze request exceeds the address&#39;s available frozen balance.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| user              | address | Address whose frozen balance was checked.          |
| requestedUnfreeze | uint256 | Amount the caller attempted to unfreeze.           |
| availableFrozen   | uint256 | Actual frozen balance available for unfreezing.    |
| partition         | bytes32 | Partition on which the frozen balance was checked. |

### InsufficientHoldBalance

```solidity
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount)
```

Reverts when the requested release amount exceeds the hold&#39;s remaining balance.

#### Parameters

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| holdAmount | uint256 | The amount still held. |
| amount     | uint256 | The amount requested.  |

### InterestRateIsFixed

```solidity
error InterestRateIsFixed()
```

Thrown when `setRate` is called on a token whose rate has been locked.

### InterestRateIsKpiLinked

```solidity
error InterestRateIsKpiLinked()
```

Reverts when a KPI-linked rate variant is supplied with non-pending or non-zero rate parameters, which the variant requires for dynamic computation.

### InterestRateIsStandard

```solidity
error InterestRateIsStandard()
```

Reverts when a standard rate variant is supplied with pending rate parameters.

### InvalidAmortizationHoldAmount

```solidity
error InvalidAmortizationHoldAmount(uint256 amortizationID)
```

Thrown when attempting to set a hold with a zero token amount.

#### Parameters

| Name           | Type    | Description          |
| -------------- | ------- | -------------------- |
| amortizationID | uint256 | The amortization ID. |

### InvalidBlockNumber

```solidity
error InvalidBlockNumber(uint256 newSystemNumber)
```

Thrown when setting a zero system block number.

#### Parameters

| Name            | Type    | Description                |
| --------------- | ------- | -------------------------- |
| newSystemNumber | uint256 | The rejected block number. |

### InvalidChainId

```solidity
error InvalidChainId(uint256 chainId)
```

Thrown when setting a zero chain id.

#### Parameters

| Name    | Type    | Description            |
| ------- | ------- | ---------------------- |
| chainId | uint256 | The rejected chain id. |

### InvalidClearingAmount

```solidity
error InvalidClearingAmount()
```

Thrown when the token amount supplied for a clearing operation is invalid (e.g., zero or exceeding the holder&#39;s available balance).

### InvalidDate

```solidity
error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate)
```

Thrown when `_date` falls outside the token&#39;s allowed [minDate, maxDate] window.

#### Parameters

| Name         | Type    | Description                          |
| ------------ | ------- | ------------------------------------ |
| providedDate | uint256 | The date supplied by the caller.     |
| minDate      | uint256 | Lower bound of the valid date range. |
| maxDate      | uint256 | Upper bound of the valid date range. |

### InvalidDateRange

```solidity
error InvalidDateRange(uint256 fromDate, uint256 toDate)
```

Thrown when the supplied date range is invalid (e.g. `fromDate &gt; toDate`).

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| fromDate | uint256 | Start of the requested range. |
| toDate   | uint256 | End of the requested range.   |

### InvalidDates

```solidity
error InvalidDates()
```

Reverts when a date set is invalid.

_Used when the failing date constraint does not require exposing values._

### InvalidDestinationAddress

```solidity
error InvalidDestinationAddress(address holdDestination, address to)
```

Reverts when the recipient supplied to {executeHoldByPartition} mismatches the hold.

#### Parameters

| Name            | Type    | Description                                 |
| --------------- | ------- | ------------------------------------------- |
| holdDestination | address | The recipient stored on the hold.           |
| to              | address | The recipient supplied to the execute call. |

### InvalidFreezeAmount

```solidity
error InvalidFreezeAmount()
```

Reverts when a partial token freeze is attempted with a zero amount.

_Checked at the start of `ERC3643StorageWrapper.freezeTokens`, the entry point for partial token freezes. Freezing zero tokens is semantically invalid and rejected early._

### InvalidHoldAmount

```solidity
error InvalidHoldAmount()
```

Reverts when a hold is created with a zero or otherwise invalid amount.

### InvalidKycStatus

```solidity
error InvalidKycStatus()
```

### InvalidLockAmount

```solidity
error InvalidLockAmount()
```

Reverts when a lock creation is attempted with a zero amount.

_Checked at the start of `LockStorageWrapper.lockByPartition`, which is the single entry point shared by both `Lock.lock` and `LockByPartition.lockByPartition`._

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

Thrown when an account does not hold or is not associated with the specified partition.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| account   | address | Address that was checked.                     |
| partition | bytes32 | Partition that was not found for the account. |

### InvalidSender

```solidity
error InvalidSender(address sender)
```

Thrown when setting the zero address as the sender override (it is the sentinel).

#### Parameters

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| sender | address | The rejected sender address. |

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### InvalidZeroAddress

```solidity
error InvalidZeroAddress()
```

### IsNotEscrow

```solidity
error IsNotEscrow()
```

Reverts when a caller that is not the recorded escrow attempts to execute the hold.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### IsUnpaused

```solidity
error IsUnpaused()
```

Thrown when `unpause` is called while the token&#39;s internal pause flag is already cleared.

### KpiDataAlreadyExists

```solidity
error KpiDataAlreadyExists(uint256 date)
```

Thrown when a KPI data point already exists for the given date and project.

#### Parameters

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| date | uint256 | The duplicate date supplied by the caller. |

### KycIsNotGranted

```solidity
error KycIsNotGranted()
```

### ListedAccount

```solidity
error ListedAccount(address account)
```

Thrown when attempting to add an address that is already present in the control list.

#### Parameters

| Name    | Type    | Description            |
| ------- | ------- | ---------------------- |
| account | address | The duplicate address. |

### ListedControlList

```solidity
error ListedControlList(address controlList)
```

Thrown when attempting to add an address already present in the external control list.

#### Parameters

| Name        | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| controlList | address | The duplicate external control list contract address. |

### ListedIssuer

```solidity
error ListedIssuer(address issuer)
```

Thrown when attempting to add an address already present in the issuer list.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| issuer | address | The duplicate issuer address. |

### ListedKycList

```solidity
error ListedKycList(address kycList)
```

Thrown when attempting to add an address already present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                       |
| ------- | ------- | ------------------------------------------------- |
| kycList | address | The duplicate external KYC list contract address. |

### ListedPause

```solidity
error ListedPause(address pause)
```

Thrown when attempting to add an address already present in the external pause list.

#### Parameters

| Name  | Type    | Description                                    |
| ----- | ------- | ---------------------------------------------- |
| pause | address | The duplicate external pause contract address. |

### LockExpirationNotReached

```solidity
error LockExpirationNotReached()
```

Reverts when a release is attempted before the lock&#39;s expiration timestamp.

_Used by the `onlyWithLockedExpirationTimestamp` modifier and by `LockStorageWrapper.checkLockedExpirationTimestamp`._

### MaturityDateInvalid

```solidity
error MaturityDateInvalid()
```

### MaxExternalListSizeReached

```solidity
error MaxExternalListSizeReached(uint256 max)
```

Reverts when adding an entry would grow an external list beyond its maximum size.

_Enforced by `ExternalListManagementStorageWrapper.addExternalList` for the external pause, control and KYC lists. The bound exists because each list is iterated in full on the hot path of token operations, so an unbounded list could exceed the gas limit and brick the token._

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| max  | uint256 | Maximum number of entries permitted in the external list. |

### MaxSupplyReached

```solidity
error MaxSupplyReached(uint256 maxSupply)
```

Thrown when a mint would cause the total supply to exceed the global maximum.

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| maxSupply | uint256 | The current global maximum supply. |

### MaxSupplyReachedForPartition

```solidity
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply)
```

Thrown when a mint would cause a partition&#39;s total supply to exceed its cap.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| partition | bytes32 | The partition whose cap would be exceeded.    |
| maxSupply | uint256 | The current maximum supply for the partition. |

### NewMaxSupplyCannotBeZero

```solidity
error NewMaxSupplyCannotBeZero()
```

Thrown when a proposed new global cap is zero.

### NewMaxSupplyForPartitionTooLow

```solidity
error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply)
```

Thrown when a proposed new partition cap is below the partition&#39;s current adjusted total supply.

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| partition   | bytes32 | The partition whose cap would be set below its current supply. |
| maxSupply   | uint256 | The proposed new maximum supply for the partition.             |
| totalSupply | uint256 | The current adjusted total supply for the partition.           |

### NewMaxSupplyTooLow

```solidity
error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply)
```

Thrown when a proposed new global cap is below the current adjusted total supply.

#### Parameters

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| maxSupply   | uint256 | The proposed new maximum supply.                   |
| totalSupply | uint256 | The current adjusted total supply that exceeds it. |

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### NotAnExternalKycList

```solidity
error NotAnExternalKycList(address kycList)
```

Thrown when a candidate address does not answer `IExternalKycList.getKycStatus`.

_Raised at registration time so that a non-conforming list is rejected before it can make every subsequent transfer revert inside `isExternallyGranted`._

#### Parameters

| Name    | Type    | Description                                    |
| ------- | ------- | ---------------------------------------------- |
| kycList | address | The address that was offered for registration. |

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

Thrown when a multi-partition operation specifies a partition not permitted in single-partition mode.

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| partition | bytes32 | The disallowed partition supplied by the caller. |

### PartitionsAreProtected

```solidity
error PartitionsAreProtected()
```

Reverts when an operation that requires unprotected mode is attempted while partitions are protected.

### PartitionsAreProtectedAndNoRole

```solidity
error PartitionsAreProtectedAndNoRole(address account, bytes32 role)
```

Reverts when a transfer is attempted while partitions are protected and the caller does not hold the required partition role.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| account | address | The caller lacking the required role.            |
| role    | bytes32 | The role that would have been needed to proceed. |

### PartitionsAreUnProtected

```solidity
error PartitionsAreUnProtected()
```

Reverts when a protected-mode operation is attempted but partitions are not currently protected.

### ProceedRecipientAlreadyExists

```solidity
error ProceedRecipientAlreadyExists(address proceedRecipient)
```

Thrown when attempting to add an address that is already registered as a proceed recipient.

#### Parameters

| Name             | Type    | Description                                                   |
| ---------------- | ------- | ------------------------------------------------------------- |
| proceedRecipient | address | The address that already exists in the proceed-recipient set. |

### ProceedRecipientNotFound

```solidity
error ProceedRecipientNotFound(address proceedRecipient)
```

Thrown when an operation targets an address that is not a registered proceed recipient.

#### Parameters

| Name             | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| proceedRecipient | address | The address that was not found in the proceed-recipient set. |

### ProtectedPartitionRoleRequired

```solidity
error ProtectedPartitionRoleRequired(bytes32 partition, address sender)
```

Raised when an account is not authorised for a protected partition.

_The reported sender is resolved through `EvmAccessors` for forwarding support._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| partition | bytes32 | Partition whose access requirement is not satisfied. |
| sender    | address | Effective caller that lacks the required role.       |

### RolesAndActivesLengthMismatch

```solidity
error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength)
```

Thrown when the `roles` and `actives` arrays passed to `applyRoles` differ in length.

#### Parameters

| Name          | Type    | Description                  |
| ------------- | ------- | ---------------------------- |
| rolesLength   | uint256 | Length of the roles array.   |
| activesLength | uint256 | Length of the actives array. |

### SnapshotIdDoesNotExists

```solidity
error SnapshotIdDoesNotExists(uint256 snapshotId)
```

Thrown when the requested snapshot identifier has never been taken on this token.

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| snapshotId | uint256 | The unrecognised snapshot identifier that was supplied. |

### SnapshotIdNull

```solidity
error SnapshotIdNull()
```

Thrown when a snapshot identifier of zero is supplied; zero is reserved and never assigned to a valid snapshot.

### SpenderWithZeroAddress

```solidity
error SpenderWithZeroAddress()
```

Reverts when the zero address is supplied as `spender` in an allowance update.

### TokenHolderNotFound

```solidity
error TokenHolderNotFound(address tokenHolder)
```

Thrown when an operation targets a token holder address that has no registered balance.

#### Parameters

| Name        | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| tokenHolder | address | The address that was not found. |

### TokenIsNotControllable

```solidity
error TokenIsNotControllable()
```

Thrown when an operation requires the token to be controllable but it is not.

### TotalSupplyOverflow

```solidity
error TotalSupplyOverflow()
```

Reverts when the proposed factor would overflow the projected total supply.

### Unauthorized

```solidity
error Unauthorized(address operator, address tokenHolder, bytes32 partition)
```

Thrown when the caller is not an authorised operator for the token holder on the given partition.

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| operator    | address | Address that attempted the operation.         |
| tokenHolder | address | Token holder whose tokens were targeted.      |
| partition   | bytes32 | Partition on which authorisation was checked. |

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### UnlistedAccount

```solidity
error UnlistedAccount(address account)
```

Thrown when attempting to remove an address that is not present in the control list.

#### Parameters

| Name    | Type    | Description                     |
| ------- | ------- | ------------------------------- |
| account | address | The address that was not found. |

### UnlistedControlList

```solidity
error UnlistedControlList(address controlList)
```

Thrown when attempting to remove an address not present in the external control list.

#### Parameters

| Name        | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| controlList | address | The unlisted external control list contract address. |

### UnlistedIssuer

```solidity
error UnlistedIssuer(address issuer)
```

Thrown when attempting to remove an address not present in the issuer list.

#### Parameters

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| issuer | address | The unlisted issuer address. |

### UnlistedKycList

```solidity
error UnlistedKycList(address kycList)
```

Thrown when attempting to remove an address not present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| kycList | address | The unlisted external KYC list contract address. |

### UnlistedPause

```solidity
error UnlistedPause(address pause)
```

Thrown when attempting to remove an address not present in the external pause list.

#### Parameters

| Name  | Type    | Description                                   |
| ----- | ------- | --------------------------------------------- |
| pause | address | The unlisted external pause contract address. |

### VotingAlreadyRecorded

```solidity
error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId)
```

Raised when attempting to cancel a voting that has already been recorded

#### Parameters

| Name              | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| corporateActionId | bytes32 | The ID of the corporate action |
| voteId            | uint256 | The ID of the voting           |

### VotingRightsCreationFailed

```solidity
error VotingRightsCreationFailed()
```

Raised when voting rights creation fails

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### WrongChainId

```solidity
error WrongChainId()
```

Thrown when the resolved chain id does not match the expected value.

### WrongClearingId

```solidity
error WrongClearingId()
```

Thrown when the supplied `clearingId` does not correspond to an existing or active clearing operation for the given holder and partition.

### WrongDates

```solidity
error WrongDates(uint256 firstDate, uint256 secondDate)
```

Reverts when two date values fail their required ordering constraint.

_The expected relationship between both dates is defined by the caller&#39;s validation context._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| firstDate  | uint256 | First date participating in the failed comparison.  |
| secondDate | uint256 | Second date participating in the failed comparison. |

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

### WrongHoldId

```solidity
error WrongHoldId()
```

Reverts when the supplied hold id does not exist for the (partition, holder) pair.

### WrongImpactDataValues

```solidity
error WrongImpactDataValues(IKpiLinkedRate.ImpactData impactData)
```

Raised when KPI-linked rate impact data values are invalid

#### Parameters

| Name       | Type                      | Description                    |
| ---------- | ------------------------- | ------------------------------ |
| impactData | IKpiLinkedRate.ImpactData | The invalid impact data values |

### WrongIndexForAction

```solidity
error WrongIndexForAction(uint256 index, bytes32 actionType)
```

Thrown when a type-scoped index does not correspond to an existing action.

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| index      | uint256 | The out-of-range index that was provided.              |
| actionType | bytes32 | The action type against which the index was validated. |

### WrongInterestRateValues

```solidity
error WrongInterestRateValues(IKpiLinkedRate.InterestRate interestRate)
```

Raised when KPI-linked rate interest rate values are invalid

#### Parameters

| Name         | Type                        | Description                      |
| ------------ | --------------------------- | -------------------------------- |
| interestRate | IKpiLinkedRate.InterestRate | The invalid interest rate values |

### WrongLockId

```solidity
error WrongLockId()
```

Reverts when a lock identifier does not exist for the given `(partition, tokenHolder)` pair.

_Used by the `onlyWithValidLockId` modifier and by `LockStorageWrapper.checkValidLockId`._

### WrongNonce

```solidity
error WrongNonce(uint256 nonce, address account)
```

Reverts when a nonce does not match the expected value for an account.

_Protects signed operations against replay and out-of-order execution._

#### Parameters

| Name    | Type    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| nonce   | uint256 | Nonce supplied by the caller or signed payload. |
| account | address | Account for which the nonce validation failed.  |

### WrongSignature

```solidity
error WrongSignature()
```

Reverts when a signature fails verification.

_Applies to shared signature validation flows, including EIP-712 payloads and partition-based signatures._

### WrongSignatureLength

```solidity
error WrongSignatureLength()
```

Reverts when a signature payload has an invalid byte length.

_Used before signature recovery or verification to reject malformed input._

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroOwnerAddress

```solidity
error ZeroOwnerAddress()
```

Reverts when an allowance operation references the zero address as the owner.

_Defensive guard against mis-wired flows or malformed calldata reaching the underlying storage wrappers._

### ZeroPartition

```solidity
error ZeroPartition()
```

Thrown when the zero bytes32 value is supplied as a partition identifier.

### ZeroValue

```solidity
error ZeroValue()
```

Thrown when a zero token amount is supplied to an operation that requires a positive value.

### ZeroValueNotAllowed

```solidity
error ZeroValueNotAllowed()
```

Reverts when zero is supplied where a positive value is required.

_Used for shared validation of amounts, limits, factors, or identifiers._
