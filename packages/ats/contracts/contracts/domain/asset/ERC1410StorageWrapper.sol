// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import {
    _ERC1410_BASIC_STORAGE_POSITION,
    _ERC1410_OPERATOR_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "./ERC20VotesStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IProtectedPartitions } from "../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/ERC712.sol";

/**
 * @notice Represents a single fungible token partition held by an account.
 * @dev    Used as the element type of `ERC1410BasicStorage.partitions`. The
 *         `partitionToIndex` mapping stores a one-based index into this array, so
 *         `partitionToIndex[holder][partition] - 1` yields the correct array offset.
 * @param amount     Token quantity held in this partition.
 * @param partition  Identifier of the partition.
 */
struct Partition {
    uint256 amount;
    bytes32 partition;
}

/**
 * @notice Diamond Storage struct for ERC1410 partition-based token state.
 * @dev    Stored at `_ERC1410_BASIC_STORAGE_POSITION`. `DEPRECATED_totalSupply` and
 *         `DEPRECATED_balances` are legacy fields retained for backwards compatibility;
 *         once `migrateAll` has been executed they will be zero and the canonical values
 *         are held in `ERC20StorageWrapper`. `partitionToIndex` stores one-based indices
 *         to distinguish an uninitialised entry (0) from the first array position.
 *         `tokenHolders` uses a one-based index (index `0` is never assigned) to allow
 *         `tokenHolderIndex` to use `0` as a sentinel for "not a holder".
 * @param DEPRECATED_totalSupply   Legacy aggregate total supply; zero once migrated.
 * @param totalSupplyByPartition   Per-partition total supply tracking.
 * @param DEPRECATED_balances      Legacy per-account aggregate balances; zero once
 *                                 migrated.
 * @param partitions               Per-account ordered array of partition holdings.
 * @param partitionToIndex         Maps (account, partition) to a one-based index in
 *                                 `partitions[account]`; zero indicates no holding.
 * @param multiPartition           True if the token operates in multi-partition mode.
 * @param initialized              True once `initialize_ERC1410` has been called.
 * @param tokenHolderIndex         Maps a token holder address to its one-based position
 *                                 in `tokenHolders`; zero indicates not a current holder.
 * @param tokenHolders             Maps a one-based index to a token holder address.
 * @param totalTokenHolders        Current count of registered token holders.
 */
struct ERC1410BasicStorage {
    // solhint-disable-next-line var-name-mixedcase
    uint256 DEPRECATED_totalSupply;
    mapping(bytes32 => uint256) totalSupplyByPartition;
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_balances;
    mapping(address => Partition[]) partitions;
    /// @dev Stored value is always greater by 1 to avoid the 0 value of every index
    mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
    bool multiPartition;
    bool initialized;
    mapping(address => uint256) tokenHolderIndex;
    mapping(uint256 => address) tokenHolders;
    uint256 totalTokenHolders;
}

/**
 * @notice Diamond Storage struct for ERC1410 operator approval state.
 * @dev    Stored at `_ERC1410_OPERATOR_STORAGE_POSITION`. `approvals` grants an operator
 *         authority over all partitions for a given token holder. `partitionApprovals`
 *         scopes authority to a single partition.
 * @param partitionApprovals  Maps (tokenHolder, partition, operator) to approval status.
 * @param approvals           Maps (tokenHolder, operator) to cross-partition approval
 *                            status.
 */
struct ERC1410OperatorStorage {
    mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
    mapping(address => mapping(address => bool)) approvals;
}

/**
 * @title  ERC1410StorageWrapper
 * @notice Internal library providing storage operations for ERC1410 partition-based token
 *         management, including issuance, redemption, transfer, operator authorisation,
 *         and token holder registry maintenance.
 * @dev    Anchors `ERC1410BasicStorage` at `_ERC1410_BASIC_STORAGE_POSITION` and
 *         `ERC1410OperatorStorage` at `_ERC1410_OPERATOR_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern. All functions are `internal`; orchestration
 *         is delegated to higher-level facets.
 *
 *         The library maintains a dual-storage model for balances and total supply: legacy
 *         values in `DEPRECATED_totalSupply` and `DEPRECATED_balances` are migrated
 *         lazily into `ERC20StorageWrapper` on first write, ensuring no historical data
 *         is lost across upgrades.
 *
 *         All token lifecycle operations (`transferByPartition`, `issueByPartition`,
 *         `redeemByPartition`) follow a strict hook ordering:
 *           1. `beforeTokenTransfer` — triggers pending scheduled tasks, syncs balance
 *              adjustments, updates snapshots, and maintains the token holder registry.
 *           2. Core balance mutations.
 *           3. Compliance callbacks to the ERC3643 `ICompliance` contract (for the
 *              default partition only).
 *           4. `afterTokenTransfer` — delegates voting power updates to
 *              `ERC20VotesStorageWrapper`.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library ERC1410StorageWrapper {
    using LowLevelCall for address;

    /**
     * @notice Initialises the ERC1410 subsystem with the specified partition mode.
     * @dev    Sets `multiPartition` and marks the storage as initialised. Calling this
     *         more than once overwrites the `multiPartition` flag; callers must enforce
     *         single-initialisation at the facet level.
     * @param multiPartition  True to operate in multi-partition mode; false for single
     *                        partition mode where only `_DEFAULT_PARTITION` is permitted.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool multiPartition) internal {
        erc1410BasicStorage().multiPartition = multiPartition;
        erc1410BasicStorage().initialized = true;
    }

    /**
     * @notice Decreases the balance of a specific partition for an account and decrements
     *         the aggregate ERC20 balance accordingly.
     * @dev    Reverts with `IERC1410Types.InvalidPartition` if the account holds no
     *         position in `partition`. Reverts with `IERC20.InsufficientBalance` if the
     *         partition balance is less than `value`. If the entire partition balance is
     *         consumed, the partition entry is removed via `deletePartitionForHolder`.
     *         Delegates the aggregate balance decrement to `ERC20StorageWrapper`.
     * @param from       Account from which the partition balance is reduced.
     * @param value      Token quantity to deduct.
     * @param partition  Partition identifier to deduct from.
     */
    function reduceBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }
        uint256 fromBalance = balanceOfByPartition(partition, from);
        if (fromBalance < value) {
            revert IERC20.InsufficientBalance(from, fromBalance, value, partition);
        }
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 index = erc1410Storage.partitionToIndex[from][partition] - 1;
        if (erc1410Storage.partitions[from][index].amount == value) {
            deletePartitionForHolder(from, partition, index);
        } else {
            erc1410Storage.partitions[from][index].amount -= value;
        }
        ERC20StorageWrapper.reduceBalance(from, value);
    }

    /**
     * @notice Removes a partition entry from an account's partition array using a
     *         swap-and-pop strategy to preserve array compactness.
     * @dev    If `index` is not the last element, the last partition is moved into
     *         `index` and its `partitionToIndex` entry is updated accordingly. The
     *         `partitionToIndex` mapping for the removed partition is deleted and the
     *         array is popped. Callers must ensure `index` is a valid zero-based position
     *         within `partitions[holder]`.
     * @param holder     Account from which the partition entry is removed.
     * @param partition  Partition identifier being removed.
     * @param index      Zero-based index of the partition entry within
     *                   `partitions[holder]`.
     */
    function deletePartitionForHolder(address holder, bytes32 partition, uint256 index) internal {
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 lastIndex = erc1410Storage.partitions[holder].length - 1;
        if (index != lastIndex) {
            erc1410Storage.partitions[holder][index] = erc1410Storage.partitions[holder][lastIndex];
            erc1410Storage.partitionToIndex[holder][erc1410Storage.partitions[holder][index].partition] = index + 1;
        }
        delete erc1410Storage.partitionToIndex[holder][partition];
        erc1410Storage.partitions[holder].pop();
    }

    /**
     * @notice Increases the balance of an existing partition entry for an account and
     *         increments the aggregate ERC20 balance accordingly.
     * @dev    Reverts with `IERC1410Types.InvalidPartition` if the account holds no
     *         existing position in `partition`; use `addPartitionTo` for first-time
     *         partition assignments. Delegates the aggregate balance increment to
     *         `ERC20StorageWrapper`.
     * @param from       Account whose partition balance is increased.
     * @param value      Token quantity to add.
     * @param partition  Partition identifier to credit.
     */
    function increaseBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        erc1410Storage.partitions[from][erc1410Storage.partitionToIndex[from][partition] - 1].amount += value;
        ERC20StorageWrapper.increaseBalance(from, value);
    }

    /**
     * @notice Creates a new partition entry for an account with an initial balance and
     *         records the current ABAF as the partition's LABAF baseline.
     * @dev    Pushes a new `Partition` struct onto `partitions[account]` and sets the
     *         one-based `partitionToIndex` entry. If `value` is non-zero, increments
     *         the aggregate ERC20 balance via `ERC20StorageWrapper`. Callers must verify
     *         that no existing partition entry exists for this (account, partition) pair
     *         before calling; creating a duplicate entry corrupts the index mapping.
     * @param value      Initial token quantity for the new partition; may be zero.
     * @param account    Account for which the partition is being created.
     * @param partition  Partition identifier to register.
     */
    function addPartitionTo(uint256 value, address account, bytes32 partition) internal {
        AdjustBalancesStorageWrapper.pushLabafUserPartition(account, AdjustBalancesStorageWrapper.getAbaf());
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        erc1410Storage.partitions[account].push(Partition(value, partition));
        erc1410Storage.partitionToIndex[account][partition] = erc1410BasicStorage().partitions[account].length;
        if (value != 0) ERC20StorageWrapper.increaseBalance(account, value);
    }

    /**
     * @notice Replaces an existing token holder registration with a new address,
     *         preserving the holder's position index in the registry.
     * @dev    Transfers the `tokenHolderIndex` and `tokenHolders` entries from
     *         `oldTokenHolder` to `newTokenHolder` and zeroes the old holder's index.
     *         Used during address recovery operations. Does not update `totalTokenHolders`.
     *         Callers must ensure `oldTokenHolder` is currently registered.
     * @param newTokenHolder  Address to register at the existing holder's position.
     * @param oldTokenHolder  Address to deregister from the holder registry.
     */
    function replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        uint256 index = basicStorage.tokenHolderIndex[oldTokenHolder];
        basicStorage.tokenHolderIndex[newTokenHolder] = index;
        basicStorage.tokenHolders[index] = newTokenHolder;
        basicStorage.tokenHolderIndex[oldTokenHolder] = 0;
    }

    /**
     * @notice Appends a new token holder to the registry and increments the holder count.
     * @dev    Uses a pre-increment within an `unchecked` block to assign a one-based
     *         index. Overflow of `totalTokenHolders` is not guarded; practical holder
     *         counts make this a non-issue. Callers must verify the address is not already
     *         registered to avoid duplicate entries and index corruption.
     * @param tokenHolder  Address to register as a new token holder.
     */
    function addNewTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        unchecked {
            uint256 nextIndex = ++basicStorage.totalTokenHolders;
            basicStorage.tokenHolders[nextIndex] = tokenHolder;
            basicStorage.tokenHolderIndex[tokenHolder] = nextIndex;
        }
    }

    /**
     * @notice Removes a token holder from the registry using a swap-and-pop strategy
     *         and decrements the holder count.
     * @dev    If the removed holder is not the last entry, the last holder is swapped
     *         into the vacated position to preserve registry compactness. The removed
     *         holder's index is zeroed. Uses `unchecked` for the counter decrement.
     *         Callers must ensure the address is currently a registered holder.
     * @param tokenHolder  Address to deregister from the token holder registry.
     */
    function removeTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        uint256 lastIndex = basicStorage.totalTokenHolders;
        if (lastIndex > 1) {
            uint256 tokenHolderIndex = basicStorage.tokenHolderIndex[tokenHolder];
            if (tokenHolderIndex < lastIndex) {
                address lastTokenHolder = basicStorage.tokenHolders[lastIndex];
                basicStorage.tokenHolderIndex[lastTokenHolder] = tokenHolderIndex;
                basicStorage.tokenHolders[tokenHolderIndex] = lastTokenHolder;
            }
        }
        basicStorage.tokenHolderIndex[tokenHolder] = 0;
        unchecked {
            --basicStorage.totalTokenHolders;
        }
    }

    /**
     * @notice Grants cross-partition operator authority to `operator` on behalf of
     *         `msg.sender` and emits `IERC1410Types.AuthorizedOperator`.
     * @dev    Writes `true` to `approvals[msg.sender][operator]`. Authorisation takes
     *         effect immediately for all subsequent `isAuthorized` checks.
     *         Emits: `IERC1410Types.AuthorizedOperator`.
     * @param operator  Address to be granted operator status over all partitions.
     */
    function authorizeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = true;
        emit IERC1410Types.AuthorizedOperator(operator, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Revokes cross-partition operator authority from `operator` on behalf of
     *         `msg.sender` and emits `IERC1410Types.RevokedOperator`.
     * @dev    Writes `false` to `approvals[msg.sender][operator]`. Revocation takes
     *         effect immediately for all subsequent `isAuthorized` checks.
     *         Emits: `IERC1410Types.RevokedOperator`.
     * @param operator  Address whose operator status is revoked across all partitions.
     */
    function revokeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = false;
        emit IERC1410Types.RevokedOperator(operator, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Grants partition-scoped operator authority to `operator` on behalf of
     *         `msg.sender` and emits `IERC1410Types.AuthorizedOperatorByPartition`.
     * @dev    Writes `true` to `partitionApprovals[msg.sender][partition][operator]`.
     *         Emits: `IERC1410Types.AuthorizedOperatorByPartition`.
     * @param partition  Partition for which operator authority is granted.
     * @param operator   Address to be granted operator status for `partition`.
     */
    function authorizeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = true;
        emit IERC1410Types.AuthorizedOperatorByPartition(partition, operator, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Revokes partition-scoped operator authority from `operator` on behalf of
     *         `msg.sender` and emits `IERC1410Types.RevokedOperatorByPartition`.
     * @dev    Writes `false` to `partitionApprovals[msg.sender][partition][operator]`.
     *         Emits: `IERC1410Types.RevokedOperatorByPartition`.
     * @param partition  Partition for which operator authority is revoked.
     * @param operator   Address whose operator status for `partition` is revoked.
     */
    function revokeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = false;
        emit IERC1410Types.RevokedOperatorByPartition(partition, operator, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Executes a partition-scoped token transfer, applying pre- and post-transfer
     *         hooks and notifying the ERC3643 compliance contract for default-partition
     *         transfers.
     * @dev    Execution order:
     *           1. `beforeTokenTransfer` — scheduled task execution, balance adjustment
     *              sync, snapshot updates, and holder registry maintenance.
     *           2. `reduceBalanceByPartition` on `from`.
     *           3. `increaseBalanceByPartition` or `addPartitionTo` on `to`.
     *           4. Emit `IERC1410Types.TransferByPartition`.
     *           5. `ICompliance.transferred` call (default partition only, excluding
     *              self-transfers).
     *           6. `afterTokenTransfer` — voting power updates.
     *         Reverts with `IERC3643Types.ComplianceCallFailed` if the compliance
     *         callback fails on the default partition.
     *         Emits: `IERC1410Types.TransferByPartition`.
     * @param from               Source address.
     * @param basicTransferInfo  Struct containing the destination address and amount.
     * @param partition          Partition under which the transfer is executed.
     * @param data               Arbitrary data passed to the transfer.
     * @param operator           Address initiating the transfer on behalf of `from`.
     * @param operatorData       Arbitrary operator data.
     * @return The partition identifier under which the transfer was executed.
     */
    function transferByPartition(
        address from,
        IERC1410Types.BasicTransferInfo memory basicTransferInfo,
        bytes32 partition,
        bytes memory data,
        address operator,
        bytes memory operatorData
    ) internal returns (bytes32) {
        beforeTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);
        reduceBalanceByPartition(from, basicTransferInfo.value, partition);
        if (!validPartitionForReceiver(partition, basicTransferInfo.to)) {
            addPartitionTo(basicTransferInfo.value, basicTransferInfo.to, partition);
        } else {
            increaseBalanceByPartition(basicTransferInfo.to, basicTransferInfo.value, partition);
        }
        emit IERC1410Types.TransferByPartition(
            partition,
            operator,
            from,
            basicTransferInfo.to,
            basicTransferInfo.value,
            data,
            operatorData
        );
        if (from != basicTransferInfo.to && partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper.getCompliance().functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    from,
                    basicTransferInfo.to,
                    basicTransferInfo.value
                ),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }
        afterTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);
        return partition;
    }

    /**
     * @notice Executes an operator-initiated partition transfer using `msg.sender` as the
     *         operator.
     * @dev    Convenience wrapper over `transferByPartition` that unpacks
     *         `operatorTransferData` and sets `msg.sender` as the operator. All
     *         preconditions and side effects of `transferByPartition` apply.
     *         Emits: `IERC1410Types.TransferByPartition`.
     * @param operatorTransferData  Calldata struct containing from, to, value, partition,
     *                              data, and operatorData.
     * @return The partition identifier under which the transfer was executed.
     */
    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata operatorTransferData
    ) internal returns (bytes32) {
        return
            transferByPartition(
                operatorTransferData.from,
                IERC1410Types.BasicTransferInfo(operatorTransferData.to, operatorTransferData.value),
                operatorTransferData.partition,
                operatorTransferData.data,
                EvmAccessors.getMsgSender(),
                operatorTransferData.operatorData
            );
    }

    /**
     * @notice Issues new tokens to a recipient under the specified partition, updating
     *         total supply and notifying the ERC3643 compliance contract.
     * @dev    Execution order:
     *           1. `validateParams` — reverts on zero value or zero partition.
     *           2. `beforeTokenTransfer` with `from = address(0)`.
     *           3. `increaseBalanceByPartition` or `addPartitionTo` on `tokenHolder`.
     *           4. `increaseTotalSupplyByPartition`.
     *           5. `ICompliance.created` call (default partition only).
     *           6. `afterTokenTransfer`.
     *           7. Emit `IERC1410Types.TransferByPartition` and
     *              `IERC1410Types.IssuedByPartition`.
     *         Reverts with `IERC3643Types.ComplianceCallFailed` if the compliance
     *         callback fails on the default partition.
     *         Emits: `IERC1410Types.TransferByPartition`,
     *                `IERC1410Types.IssuedByPartition`.
     * @param issueData  Struct containing partition, recipient address, amount, and data.
     */
    function issueByPartition(IERC1410Types.IssueData memory issueData) internal {
        validateParams(issueData.partition, issueData.value);
        beforeTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);
        if (!validPartitionForReceiver(issueData.partition, issueData.tokenHolder)) {
            addPartitionTo(issueData.value, issueData.tokenHolder, issueData.partition);
        } else {
            increaseBalanceByPartition(issueData.tokenHolder, issueData.value, issueData.partition);
        }
        increaseTotalSupplyByPartition(issueData.partition, issueData.value);
        if (issueData.partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper.getCompliance().functionCall(
                abi.encodeWithSelector(ICompliance.created.selector, issueData.tokenHolder, issueData.value),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }
        afterTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);
        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410Types.TransferByPartition(
            issueData.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            issueData.tokenHolder,
            issueData.value,
            issueData.data,
            ""
        );
        emit IERC1410Types.IssuedByPartition(
            issueData.partition,
            EvmAccessors.getMsgSender(),
            issueData.tokenHolder,
            issueData.value,
            issueData.data
        );
    }

    /**
     * @notice Redeems tokens from an account under the specified partition, reducing
     *         total supply and notifying the ERC3643 compliance contract.
     * @dev    Execution order:
     *           1. `beforeTokenTransfer` with `to = address(0)`.
     *           2. `reduceBalanceByPartition`.
     *           3. Emit `IERC1410Types.TransferByPartition`.
     *           4. `reduceTotalSupplyByPartition`.
     *           5. `ICompliance.destroyed` call (default partition only).
     *           6. `afterTokenTransfer`.
     *           7. Emit `IERC1410Types.RedeemedByPartition`.
     *         Reverts with `IERC3643Types.ComplianceCallFailed` if the compliance
     *         callback fails on the default partition.
     *         Emits: `IERC1410Types.TransferByPartition`,
     *                `IERC1410Types.RedeemedByPartition`.
     * @param partition     Partition from which tokens are redeemed.
     * @param from          Address whose tokens are redeemed.
     * @param operator      Address initiating the redemption.
     * @param value         Token quantity to redeem.
     * @param data          Arbitrary data associated with the redemption.
     * @param operatorData  Arbitrary operator data.
     */
    function redeemByPartition(
        bytes32 partition,
        address from,
        address operator,
        uint256 value,
        bytes memory data,
        bytes memory operatorData
    ) internal {
        beforeTokenTransfer(partition, from, address(0), value);
        reduceBalanceByPartition(from, value, partition);
        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410Types.TransferByPartition(partition, operator, from, address(0), value, data, operatorData);
        reduceTotalSupplyByPartition(partition, value);
        if (partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper.getCompliance().functionCall(
                abi.encodeWithSelector(ICompliance.destroyed.selector, from, value),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }
        afterTokenTransfer(partition, from, address(0), value);
        emit IERC1410Types.RedeemedByPartition(partition, operator, from, value, data, operatorData);
    }

    /**
     * @notice Executes a signature-protected partition transfer, validating nonce,
     *         deadline, and EIP-712 transfer signature before delegating to
     *         `transferByPartition`.
     * @dev    Validates the nonce and deadline via `_checkNonceAndDeadline`, then
     *         verifies the EIP-712 transfer signature via
     *         `ProtectedPartitionsStorageWrapper.checkTransferSignature` using the stored
     *         token name. The nonce is consumed via `NonceStorageWrapper.setNonceFor`
     *         before the transfer executes, providing replay protection. All downstream
     *         preconditions of `transferByPartition` apply.
     *         Emits: `IERC1410Types.TransferByPartition`.
     * @param partition       Partition under which the transfer is executed.
     * @param from            Source address whose signature authorises the transfer.
     * @param to              Destination address.
     * @param amount          Token quantity to transfer.
     * @param protectionData  Calldata struct containing nonce, deadline, and signature.
     * @return The partition identifier under which the transfer was executed.
     */
    function protectedTransferFromByPartition(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData
    ) internal returns (bytes32) {
        _checkNonceAndDeadline(
            protectionData.nonce,
            from,
            NonceStorageWrapper.getNonceFor(from),
            protectionData.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        ProtectedPartitionsStorageWrapper.checkTransferSignature(
            partition,
            from,
            to,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );
        NonceStorageWrapper.setNonceFor(protectionData.nonce, from);
        return
            transferByPartition(
                from,
                IERC1410Types.BasicTransferInfo(to, amount),
                partition,
                "",
                EvmAccessors.getMsgSender(),
                ""
            );
    }

    /**
     * @notice Executes a signature-protected partition redemption, validating nonce,
     *         deadline, and EIP-712 redeem signature before delegating to
     *         `redeemByPartition`.
     * @dev    Validates the nonce and deadline via `_checkNonceAndDeadline`, then verifies
     *         the EIP-712 redeem signature via
     *         `ProtectedPartitionsStorageWrapper.checkRedeemSignature`. The nonce is
     *         consumed before redemption executes. All downstream preconditions of
     *         `redeemByPartition` apply.
     *         Emits: `IERC1410Types.TransferByPartition`,
     *                `IERC1410Types.RedeemedByPartition`.
     * @param partition       Partition from which tokens are redeemed.
     * @param from            Address whose signature authorises the redemption.
     * @param amount          Token quantity to redeem.
     * @param protectionData  Calldata struct containing nonce, deadline, and signature.
     */
    function protectedRedeemFromByPartition(
        bytes32 partition,
        address from,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData
    ) internal {
        _checkNonceAndDeadline(
            protectionData.nonce,
            from,
            NonceStorageWrapper.getNonceFor(from),
            protectionData.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        ProtectedPartitionsStorageWrapper.checkRedeemSignature(
            partition,
            from,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );
        NonceStorageWrapper.setNonceFor(protectionData.nonce, from);
        redeemByPartition(partition, from, EvmAccessors.getMsgSender(), amount, "", "");
    }

    /**
     * @notice Executes all pre-transfer state synchronisation and holder registry
     *         maintenance required before a partition balance mutation.
     * @dev    Called at the start of every `transferByPartition`, `issueByPartition`, and
     *         `redeemByPartition` invocation. Performs in order:
     *           1. `triggerAndSyncAll` — executes pending scheduled tasks and syncs
     *              balance adjustments for `from`, `to`, and the partition.
     *           2. Snapshot updates for affected accounts and total supply via
     *              `SnapshotsStorageWrapper`.
     *           3. Token holder registry updates: determines whether `to` must be added
     *              (`addTo`) or `from` removed (`removeFrom`) based on their post-transfer
     *              balances. For a simultaneous add/remove, `replaceTokenHolder` is used
     *              to preserve index slots.
     *         The `from == address(0)` path applies to minting; `to == address(0)` to
     *         burning. Balance comparisons use `balanceOf` (raw) for zero checks and
     *         `balanceOfAdjustedAt` for full-balance removal detection.
     * @param partition  Partition involved in the transfer.
     * @param from       Source address; `address(0)` for minting.
     * @param to         Destination address; `address(0)` for burning.
     * @param amount     Token quantity being transferred.
     */
    function beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        triggerAndSyncAll(partition, from, to);
        bool addTo;
        bool removeFrom;
        if (from == address(0)) {
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            if (amount > 0 && ERC20StorageWrapper.balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            if (
                amount > 0 &&
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(from, TimeTravelStorageWrapper.getBlockTimestamp()) ==
                amount
            ) removeFrom = true;
        } else {
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            if (amount > 0 && ERC20StorageWrapper.balanceOf(to) == 0) addTo = true;
            if (
                amount > 0 &&
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(from, TimeTravelStorageWrapper.getBlockTimestamp()) ==
                amount
            ) removeFrom = true;
        }
        if (!(addTo || removeFrom)) return;
        if (addTo && removeFrom) {
            SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
            replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
            addNewTokenHolder(to);
            return;
        }
        SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
        SnapshotsStorageWrapper.updateTokenHolderSnapshot(getTokenHolder(getTotalTokenHolders()));
        SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
        removeTokenHolder(from);
    }

    /**
     * @notice Executes post-transfer hooks after a partition balance mutation completes.
     * @dev    Delegates to `ERC20VotesStorageWrapper.afterTokenTransfer` to update
     *         delegated voting power for the affected addresses. Called after all balance
     *         changes and compliance notifications have been applied.
     * @param partition  Partition involved in the transfer.
     * @param from       Source address; `address(0)` for minting.
     * @param to         Destination address; `address(0)` for burning.
     * @param amount     Token quantity transferred.
     */
    function afterTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        ERC20VotesStorageWrapper.afterTokenTransfer(partition, from, to, amount);
    }

    /**
     * @notice Triggers all pending scheduled cross-ordered tasks and synchronises balance
     *         adjustments for the affected partition and accounts.
     * @dev    Must be called before any balance read that could be affected by pending
     *         scheduled adjustments. Delegates task execution to
     *         `ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks`
     *         then calls `syncBalanceAdjustments`. Both `from` and `to` may be
     *         `address(0)` to skip per-account adjustment.
     * @param partition  Partition whose supply adjustment is to be synchronised.
     * @param from       Account whose balances are adjusted; skipped if `address(0)`.
     * @param to         Account whose balances are adjusted; skipped if `address(0)`.
     */
    function triggerAndSyncAll(bytes32 partition, address from, address to) internal {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        syncBalanceAdjustments(partition, from, to);
    }

    /**
     * @notice Applies any outstanding ABAF adjustments to the partition's total supply
     *         and to the individual balances of `from` and `to`.
     * @dev    Adjusts total and max supply for the partition via
     *         `AdjustBalancesStorageWrapper`, then applies per-account partition and
     *         aggregate balance adjustments via `adjustTotalBalanceAndPartitionBalanceFor`.
     *         Accounts with `address(0)` are skipped.
     * @param partition  Partition whose total supply is to be synchronised.
     * @param from       Account to adjust; skipped if `address(0)`.
     * @param to         Account to adjust; skipped if `address(0)`.
     */
    function syncBalanceAdjustments(bytes32 partition, address from, address to) internal {
        AdjustBalancesStorageWrapper.adjustTotalAndMaxSupplyForPartition(partition);
        if (from != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, from);
        if (to != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, to);
    }

    /**
     * @notice Scales the stored total supply for a partition by a multiplicative factor.
     * @dev    Intended for token adjustment operations such as splits or consolidations.
     *         Callers must ensure `factor` is non-zero and that the partition total supply
     *         has been migrated before calling. Does not update the aggregate ERC20 total
     *         supply; call `adjustTotalSupply` separately if required.
     * @param partition  Partition whose total supply is to be scaled.
     * @param factor     Multiplicative scaling factor to apply.
     */
    function adjustTotalSupplyByPartition(bytes32 partition, uint256 factor) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] *= factor;
    }

    /**
     * @notice Applies the current ABAF to both the partition balance and the aggregate
     *         ERC20 balance of an account.
     * @dev    Reads the current ABAF, delegates partition balance adjustment to the
     *         private `_adjustPartitionBalanceFor`, then delegates aggregate balance
     *         adjustment to `ERC20StorageWrapper.adjustTotalBalanceFor`. Both adjustments
     *         use the same ABAF snapshot to ensure consistency.
     * @param partition  Partition whose balance is to be adjusted.
     * @param account    Account whose balances are to be adjusted.
     */
    function adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        _adjustPartitionBalanceFor(basicStorage, abaf, partition, account);
        ERC20StorageWrapper.adjustTotalBalanceFor(abaf, account);
    }

    /**
     * @notice Decrements the aggregate ERC20 total supply by `value`.
     * @dev    Thin delegation to `ERC20StorageWrapper.reduceTotalSupply`. Does not update
     *         per-partition total supply; use `reduceTotalSupplyByPartition` if both must
     *         be updated atomically.
     * @param value  Amount by which to reduce total supply.
     */
    function reduceTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    /**
     * @notice Increments the aggregate ERC20 total supply by `value`.
     * @dev    Thin delegation to `ERC20StorageWrapper.increaseTotalSupply`. Does not
     *         update per-partition total supply; use `increaseTotalSupplyByPartition` if
     *         both must be updated atomically.
     * @param value  Amount by which to increase total supply.
     */
    function increaseTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    /**
     * @notice Decrements both the per-partition total supply and the aggregate ERC20 total
     *         supply by `value`.
     * @dev    Must be called after the corresponding balance reduction to keep total supply
     *         invariants consistent. Does not validate that the partition supply is
     *         sufficient; callers must ensure the partition has adequate supply.
     * @param partition  Partition whose total supply is reduced.
     * @param value      Amount by which to reduce the partition and aggregate supply.
     */
    function reduceTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] -= value;
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    /**
     * @notice Increments both the per-partition total supply and the aggregate ERC20 total
     *         supply by `value`.
     * @dev    Must be called after the corresponding balance increase to keep total supply
     *         invariants consistent.
     * @param partition  Partition whose total supply is increased.
     * @param value      Amount by which to increase the partition and aggregate supply.
     */
    function increaseTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] += value;
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    /**
     * @notice Sets the legacy `DEPRECATED_totalSupply` field directly.
     * @dev    Intended exclusively for data migration or testing utilities. Writing a
     *         non-zero value to this field will cause `totalSupply` reads to return the
     *         legacy value via the fallback path in `ERC20StorageWrapper` until migration
     *         occurs.
     * @param _value  Value to write to `DEPRECATED_totalSupply`.
     */
    function setLegacyTotalSupply(uint256 _value) internal {
        erc1410BasicStorage().DEPRECATED_totalSupply = _value;
    }

    /**
     * @notice Sets the legacy `DEPRECATED_balances` entry for a specific account directly.
     * @dev    Intended exclusively for data migration or testing utilities. Writing a
     *         non-zero value will cause `balanceOf` reads to return the legacy value via
     *         the fallback path in `ERC20StorageWrapper` until migration occurs.
     * @param _tokenHolder  Account whose legacy balance is to be set.
     * @param _value        Value to write to `DEPRECATED_balances[_tokenHolder]`.
     */
    function setLegacyBalance(address _tokenHolder, uint256 _value) internal {
        erc1410BasicStorage().DEPRECATED_balances[_tokenHolder] = _value;
    }

    /**
     * @notice Migrates the total supply and all token holder balances from legacy ERC1410
     *         storage into `ERC20StorageWrapper` in a single pass.
     * @dev    Calls `ERC20StorageWrapper.migrateTotalSupplyIfNeeded` first, then iterates
     *         over all registered token holders (one-based index) and triggers
     *         `ERC20StorageWrapper.migrateBalanceIfNeeded` for each. Gas cost scales
     *         linearly with `totalTokenHolders`. After this call, all
     *         `DEPRECATED_totalSupply` and `DEPRECATED_balances` entries will be zero.
     */
    function migrateAll() internal {
        ERC20StorageWrapper.migrateTotalSupplyIfNeeded();
        ERC1410BasicStorage storage $ = erc1410BasicStorage();
        uint256 totalTokenHolders = $.totalTokenHolders;
        for (uint256 i; i < totalTokenHolders; ) {
            unchecked {
                ERC20StorageWrapper.migrateBalanceIfNeeded($.tokenHolders[++i]);
            }
        }
    }

    /**
     * @notice Returns the legacy total supply and clears it from ERC1410 storage if
     *         non-zero.
     * @dev    Called by `ERC20StorageWrapper.migrateTotalSupplyIfNeeded`. Returns `0`
     *         immediately if the legacy field is already zero. After this call,
     *         `DEPRECATED_totalSupply` will be zero and the canonical value is expected
     *         to be written to `ERC20Storage` by the caller.
     * @return totalSupply_  The legacy total supply value; `0` if already migrated.
     */
    function deprecateTotalSupplyIfNeeded() internal returns (uint256 totalSupply_) {
        ERC1410BasicStorage storage $ = erc1410BasicStorage();
        totalSupply_ = $.DEPRECATED_totalSupply;
        if (totalSupply_ == 0) return totalSupply_;
        $.DEPRECATED_totalSupply = 0;
    }

    /**
     * @notice Returns the legacy balance for an account and clears it from ERC1410 storage
     *         if non-zero.
     * @dev    Called by `ERC20StorageWrapper.migrateBalanceIfNeeded`. Returns `0`
     *         immediately if the legacy field is already zero. After this call,
     *         `DEPRECATED_balances[_tokenHolder]` will be zero and the canonical value is
     *         expected to be written to `ERC20Storage` by the caller.
     * @param _tokenHolder  Account whose legacy balance is read and cleared.
     * @return balance_  The legacy balance; `0` if already migrated.
     */
    function deprecateBalanceIfNeeded(address _tokenHolder) internal returns (uint256 balance_) {
        ERC1410BasicStorage storage $ = erc1410BasicStorage();
        balance_ = $.DEPRECATED_balances[_tokenHolder];
        if (balance_ == 0) return balance_;
        $.DEPRECATED_balances[_tokenHolder] = 0;
    }

    /**
     * @notice Returns the raw value of the legacy `DEPRECATED_totalSupply` field without
     *         clearing it.
     * @dev    A non-zero return indicates the total supply has not yet been migrated to
     *         `ERC20StorageWrapper`. Used as a fallback signal by `ERC20StorageWrapper
     *         .totalSupply`.
     * @return Raw value of `DEPRECATED_totalSupply`.
     */
    function getDeprecatedTotalSupply() internal view returns (uint256) {
        return erc1410BasicStorage().DEPRECATED_totalSupply;
    }

    /**
     * @notice Returns the raw legacy balance for an account without clearing it.
     * @dev    A non-zero return indicates the account's balance has not yet been migrated
     *         to `ERC20StorageWrapper`. Used as a fallback signal by `ERC20StorageWrapper
     *         .balanceOf`.
     * @param _tokenHolder  Account to query.
     * @return Raw value of `DEPRECATED_balances[_tokenHolder]`.
     */
    function getDeprecatedBalanceOf(address _tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().DEPRECATED_balances[_tokenHolder];
    }

    /**
     * @notice Returns the one-based index of a partition in an account's partition array.
     * @dev    A return value of `0` indicates no position exists for this (account,
     *         partition) pair. Subtract `1` to obtain the zero-based array offset.
     * @param _account    Account to query.
     * @param _partition  Partition identifier to look up.
     * @return One-based index of the partition; `0` if not held.
     */
    function getPartitionToIndex(address _account, bytes32 _partition) internal view returns (uint256) {
        return erc1410BasicStorage().partitionToIndex[_account][_partition];
    }

    /**
     * @notice Returns whether all legacy balance and total supply fields have been
     *         migrated to `ERC20StorageWrapper`.
     * @dev    Checks `DEPRECATED_totalSupply` and iterates over all registered token
     *         holders to verify that each `DEPRECATED_balances` entry is zero. Gas cost
     *         scales linearly with `totalTokenHolders`; avoid calling on-chain in
     *         production flows.
     * @return isMigrated_  True if all legacy fields are zero; false if any remain.
     */
    function isMigrated() internal view returns (bool isMigrated_) {
        ERC1410BasicStorage storage $ = erc1410BasicStorage();
        isMigrated_ = $.DEPRECATED_totalSupply == 0;
        uint256 totalTokenHolders = $.totalTokenHolders;
        for (uint256 i; i < totalTokenHolders && isMigrated_; ) {
            unchecked {
                isMigrated_ = $.DEPRECATED_balances[$.tokenHolders[++i]] == 0;
            }
        }
    }

    /**
     * @notice Returns the total supply for a specific partition as currently stored.
     * @dev    Reads directly from `totalSupplyByPartition` without applying any pending
     *         ABAF adjustment. Use `totalSupplyByPartitionAdjustedAt` for an
     *         adjustment-aware view.
     * @param partition  Partition to query.
     * @return Current total supply for `partition`.
     */
    function totalSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return erc1410BasicStorage().totalSupplyByPartition[partition];
    }

    /**
     * @notice Returns the aggregate total supply as it will appear at a given timestamp,
     *         incorporating any pending scheduled ABAF adjustment.
     * @dev    Retrieves the pending ABAF at `timestamp` from
     *         `ScheduledTasksStorageWrapper` and multiplies by the current ERC20 total
     *         supply. The decimal pending value is intentionally unused here.
     * @param timestamp  Unix timestamp at which to evaluate pending adjustments.
     * @return Adjusted total supply at `timestamp`.
     */
    function totalSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return ERC20StorageWrapper.totalSupply() * pendingABAF;
    }

    /**
     * @notice Returns the total supply for a specific partition as it will appear at a
     *         given timestamp, incorporating any pending ABAF adjustment relative to the
     *         partition's stored LABAF.
     * @dev    Applies `calculateFactor(abafAt(timestamp), labafByPartition)` to the
     *         stored partition supply. Returns a read-only projection; no state mutation
     *         occurs.
     * @param partition  Partition to query.
     * @param timestamp  Unix timestamp at which to evaluate pending adjustments.
     * @return Adjusted total supply for `partition` at `timestamp`.
     */
    function totalSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        return
            totalSupplyByPartition(partition) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByPartition(partition)
            );
    }

    /**
     * @notice Returns the raw stored balance for a specific partition held by an account.
     * @dev    Returns `0` if the account holds no position in `partition`. Does not apply
     *         any ABAF adjustment; use `balanceOfByPartitionAdjustedAt` for an
     *         adjustment-aware view.
     * @param partition    Partition to query.
     * @param tokenHolder  Account to query.
     * @return Raw partition balance; `0` if the account has no holding in `partition`.
     */
    function balanceOfByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        if (!validPartition(partition, tokenHolder)) return 0;
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        return
            erc1410Storage.partitions[tokenHolder][erc1410Storage.partitionToIndex[tokenHolder][partition] - 1].amount;
    }

    /**
     * @notice Returns the aggregate token balance of an account as it will appear at a
     *         given timestamp, incorporating any pending ABAF adjustment.
     * @dev    Applies `calculateFactor(abafAt(timestamp), labafByUser)` to the stored
     *         aggregate balance from `ERC20StorageWrapper`. Returns a read-only
     *         projection; no state mutation occurs.
     * @param tokenHolder  Account to query.
     * @param timestamp    Unix timestamp at which to evaluate pending adjustments.
     * @return Adjusted aggregate balance for `tokenHolder` at `timestamp`.
     */
    function balanceOfAdjustedAt(address tokenHolder, uint256 timestamp) internal view returns (uint256) {
        return
            ERC20StorageWrapper.balanceOf(tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByUser(tokenHolder)
            );
    }

    /**
     * @notice Returns the partition balance of an account as it will appear at a given
     *         timestamp, incorporating any pending ABAF adjustment relative to the
     *         account's partition-specific LABAF.
     * @dev    Applies `calculateFactor(abafAt(timestamp), labafByUserAndPartition)` to
     *         the raw partition balance. Returns `0` if no holding exists. Returns a
     *         read-only projection; no state mutation occurs.
     * @param partition    Partition to query.
     * @param tokenHolder  Account to query.
     * @param timestamp    Unix timestamp at which to evaluate pending adjustments.
     * @return Adjusted partition balance for `tokenHolder` at `timestamp`.
     */
    function balanceOfByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return
            balanceOfByPartition(partition, tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByUserAndPartition(partition, tokenHolder)
            );
    }

    /**
     * @notice Returns the list of partition identifiers currently held by an account.
     * @dev    Iterates over `partitions[tokenHolder]` to extract partition bytes32 values.
     *         Gas cost scales linearly with the number of partitions held. Returns an
     *         empty array if the account holds no partitions.
     * @param tokenHolder  Account to query.
     * @return partitionsList  Array of partition identifiers held by `tokenHolder`.
     */
    function partitionsOf(address tokenHolder) internal view returns (bytes32[] memory partitionsList) {
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 length = erc1410Storage.partitions[tokenHolder].length;
        partitionsList = new bytes32[](length);
        for (uint256 i; i < length; ) {
            partitionsList[i] = erc1410Storage.partitions[tokenHolder][i].partition;
            unchecked {
                ++i;
            }
        }
        return partitionsList;
    }

    /**
     * @notice Returns whether an account currently holds a position in the specified
     *         partition.
     * @dev    Delegates to `validPartitionForReceiver`; the two functions are semantically
     *         equivalent. A `true` return indicates the account has an existing entry in
     *         `partitions[holder]` for `partition`.
     * @param partition  Partition identifier to check.
     * @param holder     Account to check.
     * @return True if the account holds a position in `partition`; false otherwise.
     */
    function validPartition(bytes32 partition, address holder) internal view returns (bool) {
        return validPartitionForReceiver(partition, holder);
    }

    /**
     * @notice Returns whether an account has an existing partition entry that can receive
     *         additional tokens.
     * @dev    A non-zero `partitionToIndex[to][partition]` indicates an existing entry.
     *         Returns `false` when `to` has no prior holding in `partition`, signalling
     *         that `addPartitionTo` must be used instead of `increaseBalanceByPartition`.
     * @param partition  Partition identifier to check.
     * @param to         Account to check.
     * @return True if the account already holds a position in `partition`; false otherwise.
     */
    function validPartitionForReceiver(bytes32 partition, address to) internal view returns (bool) {
        return erc1410BasicStorage().partitionToIndex[to][partition] != 0;
    }

    /**
     * @notice Returns a paginated slice of registered token holder addresses.
     * @dev    Computes page bounds via `Pagination.getStartAndEnd`, clamps to
     *         `getTotalTokenHolders`, then iterates over the one-based `tokenHolders`
     *         mapping. Gas cost scales linearly with `pageLength`.
     * @param pageIndex   Zero-based page number to retrieve.
     * @param pageLength  Maximum number of addresses to return per page.
     * @return holders_  Array of token holder addresses for the requested page.
     */
    function getTokenHolders(uint256 pageIndex, uint256 pageLength) internal view returns (address[] memory holders_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);
        uint256 size = Pagination.getSize(start, end, getTotalTokenHolders());
        holders_ = new address[](size);
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        unchecked {
            for (uint256 i; i < size; ++i) holders_[i] = erc1410Storage.tokenHolders[++start];
        }
    }

    /**
     * @notice Returns the token holder address at the given one-based registry index.
     * @dev    Returns `address(0)` for index `0` or any index beyond `totalTokenHolders`.
     *         Callers should validate `index` is within `[1, totalTokenHolders]`.
     * @param index  One-based position in the token holder registry.
     * @return Address of the token holder at `index`.
     */
    function getTokenHolder(uint256 index) internal view returns (address) {
        return erc1410BasicStorage().tokenHolders[index];
    }

    /**
     * @notice Returns the current total number of registered token holders.
     * @dev    Reads `totalTokenHolders` directly; O(1) gas cost.
     * @return Current token holder count.
     */
    function getTotalTokenHolders() internal view returns (uint256) {
        return erc1410BasicStorage().totalTokenHolders;
    }

    /**
     * @notice Returns the one-based registry index for a token holder.
     * @dev    Returns `0` if the address is not a current token holder.
     * @param tokenHolder  Address to query.
     * @return One-based registry index; `0` if not registered.
     */
    function getTokenHolderIndex(address tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().tokenHolderIndex[tokenHolder];
    }

    /**
     * @notice Returns whether the token operates in multi-partition mode.
     * @dev    Reads `multiPartition` directly from storage.
     * @return True if multi-partition mode is active; false for single-partition mode.
     */
    function isMultiPartition() internal view returns (bool) {
        return erc1410BasicStorage().multiPartition;
    }

    /**
     * @notice Returns whether the ERC1410 subsystem has been initialised.
     * @dev    Returns `false` until `initialize_ERC1410` has been called.
     * @return True if initialised; false otherwise.
     */
    function isERC1410Initialized() internal view returns (bool) {
        return erc1410BasicStorage().initialized;
    }

    /**
     * @notice Returns whether `operator` has been granted cross-partition authority over
     *         `tokenHolder`'s tokens.
     * @dev    Reads `approvals[tokenHolder][operator]` directly.
     * @param operator     Address to check for operator status.
     * @param tokenHolder  Address of the token holder.
     * @return True if `operator` has cross-partition authority; false otherwise.
     */
    function isOperator(address operator, address tokenHolder) internal view returns (bool) {
        return erc1410OperatorStorage().approvals[tokenHolder][operator];
    }

    /**
     * @notice Returns whether `operator` has been granted partition-scoped authority over
     *         `tokenHolder`'s tokens for the given partition.
     * @dev    Reads `partitionApprovals[tokenHolder][partition][operator]` directly.
     * @param partition    Partition to check authority for.
     * @param operator     Address to check for partition-scoped operator status.
     * @param tokenHolder  Address of the token holder.
     * @return True if `operator` has authority for `partition`; false otherwise.
     */
    function isOperatorForPartition(
        bytes32 partition,
        address operator,
        address tokenHolder
    ) internal view returns (bool) {
        return erc1410OperatorStorage().partitionApprovals[tokenHolder][partition][operator];
    }

    /**
     * @notice Returns whether `operator` is authorised to act on behalf of `tokenHolder`
     *         for the given partition, considering both cross-partition and
     *         partition-scoped approvals.
     * @dev    Returns `true` if either `isOperator` or `isOperatorForPartition` is `true`.
     * @param partition    Partition to check authority for.
     * @param operator     Address to check for authorisation.
     * @param tokenHolder  Address of the token holder.
     * @return True if `operator` is authorised for `partition`; false otherwise.
     */
    function isAuthorized(bytes32 partition, address operator, address tokenHolder) internal view returns (bool) {
        return isOperator(operator, tokenHolder) || isOperatorForPartition(partition, operator, tokenHolder);
    }

    /**
     * @notice Reverts if `msg.sender` is not authorised to act on behalf of `from` for
     *         the given partition.
     * @dev    Calls `isAuthorized` with `msg.sender` as the operator candidate. Reverts
     *         with `IERC1410Types.Unauthorized` on failure. Use as a guard before any
     *         operator-initiated state mutation.
     * @param partition  Partition for which operator authorisation is required.
     * @param from       Token holder on whose behalf the operation is being performed.
     */
    function requireOperator(bytes32 partition, address from) internal view {
        if (!isAuthorized(partition, EvmAccessors.getMsgSender(), from))
            revert IERC1410Types.Unauthorized(EvmAccessors.getMsgSender(), from, partition);
    }

    /**
     * @notice Reverts if the token is operating in multi-partition mode.
     * @dev    Use as a guard for functions that are only permitted in single-partition
     *         mode. Reverts with `IERC1410Types.NotAllowedInMultiPartitionMode`.
     */
    function requireWithoutMultiPartition() internal view {
        if (isMultiPartition()) revert IERC1410Types.NotAllowedInMultiPartitionMode();
    }

    /**
     * @notice Reverts if the token is in single-partition mode and `partition` is not
     *         the default partition.
     * @dev    In multi-partition mode all partitions are permitted and this function is a
     *         no-op. Reverts with
     *         `IERC1410Types.PartitionNotAllowedInSinglePartitionMode` on failure.
     * @param partition  Partition identifier to validate.
     */
    function requireDefaultPartitionWithSinglePartition(bytes32 partition) internal view {
        if (!isMultiPartition() && partition != _DEFAULT_PARTITION)
            revert IERC1410Types.PartitionNotAllowedInSinglePartitionMode(partition);
    }

    /**
     * @notice Reverts if `value` is zero or `partition` is `bytes32(0)`.
     * @dev    Called at the entry point of `issueByPartition` to enforce basic parameter
     *         validity before any storage writes occur. Reverts with
     *         `IERC1410Types.ZeroValue` or `IERC1410Types.ZeroPartition` as appropriate.
     * @param partition  Partition identifier to validate.
     * @param value      Token quantity to validate.
     */
    function validateParams(bytes32 partition, uint256 value) internal pure {
        if (value == 0) {
            revert IERC1410Types.ZeroValue();
        }
        if (partition == bytes32(0)) {
            revert IERC1410Types.ZeroPartition();
        }
    }

    /**
     * @notice Reverts if `account` is the zero address.
     * @dev    Delegates to `AddressValidation.checkZeroAddress`. Use as a guard before
     *         any operation that must not target `address(0)`.
     * @param account  Address to validate.
     */
    function requireValidAddress(address account) internal pure {
        AddressValidation.checkZeroAddress(account);
    }

    /**
     * @notice Applies the current ABAF to the partition balance of an account and emits
     *         a `TransferByPartition` event for the delta if the balance changes.
     * @dev    Resolves the one-based partition index from `partitionToIndex`; returns
     *         immediately (no-op) if the account holds no position in `partition`.
     *         The scaling factor is derived per-partition-index via
     *         `calculateFactorByTokenHolderAndPartitionIndex`. If the balance is
     *         unchanged, no event is emitted and no storage write occurs.
     *         `TransferByPartition` is emitted with `address(0)` for both `from` and `to`
     *         to signal a balance adjustment rather than a transfer.
     *         Finalises by calling `updateLabafByTokenHolderAndPartitionIndex` to record
     *         the applied factor.
     * @param basicStorage  Storage pointer to `ERC1410BasicStorage`.
     * @param abaf          Current global adjustment balance factor to apply.
     * @param partition     Partition whose balance entry is to be adjusted.
     * @param account       Account whose partition balance is to be adjusted.
     */
    function _adjustPartitionBalanceFor(
        ERC1410BasicStorage storage basicStorage,
        uint256 abaf,
        bytes32 partition,
        address account
    ) private {
        uint256 partitionsIndex = basicStorage.partitionToIndex[account][partition];
        if (partitionsIndex == 0) return;
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactorByTokenHolderAndPartitionIndex(
            abaf,
            account,
            partitionsIndex
        );
        uint256 oldAmount = basicStorage.partitions[account][partitionsIndex - 1].amount;
        uint256 newAmount = oldAmount * factor;
        if (newAmount != oldAmount) {
            basicStorage.partitions[account][partitionsIndex - 1].amount = newAmount;
            unchecked {
                emit IERC1410Types.TransferByPartition(
                    partition,
                    EvmAccessors.getMsgSender(),
                    address(0),
                    address(0),
                    newAmount - oldAmount,
                    "",
                    ""
                );
            }
        }
        AdjustBalancesStorageWrapper.updateLabafByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC1410BasicStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC1410_BASIC_STORAGE_POSITION`, following the ERC-2535
     *         Diamond Storage Pattern. Must only be called from within this library.
     * @return erc1410BasicStorage_  Storage pointer to `ERC1410BasicStorage`.
     */
    function erc1410BasicStorage() private pure returns (ERC1410BasicStorage storage erc1410BasicStorage_) {
        bytes32 position = _ERC1410_BASIC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC1410OperatorStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC1410_OPERATOR_STORAGE_POSITION`, following the ERC-2535
     *         Diamond Storage Pattern. Must only be called from within this library.
     * @return erc1410OperatorStorage_  Storage pointer to `ERC1410OperatorStorage`.
     */
    function erc1410OperatorStorage() private pure returns (ERC1410OperatorStorage storage erc1410OperatorStorage_) {
        bytes32 position = _ERC1410_OPERATOR_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }
}
