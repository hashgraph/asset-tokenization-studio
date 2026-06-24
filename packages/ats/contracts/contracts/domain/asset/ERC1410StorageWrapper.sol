// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "./ERC20VotesStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ICompliance } from "../../facets/compliance/externalInterfaces/ICompliance.sol";
import { IERC3643Types } from "../../facets/commonTypes/IERC3643Types.sol";
import { IProtectedPartitions } from "../../facets/protectedPartitions/IProtectedPartitions.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { _DEFAULT_PARTITION, KPI_ERC1410_REMOVE_HOLDER } from "../../constants/values.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/EIP712.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage Erc1410Basic
bytes32 constant STORAGE_LOCATION_ERC1410_BASIC = 0x2b7b9d433e782d7e5384db9a591ac5085e24b04d9aa9a09e22954f9f253cf000;

/// @custom:hash storage Erc1410Operator
bytes32 constant STORAGE_LOCATION_ERC1410_OPERATOR = 0x2847bc5c05acc04a27b4f2e0fd8d48afe56e923c88ddb18bdee3a9e54ce5ad00;

/// @dev Represents a fungible set of tokens.
struct Partition {
    uint256 amount;
    bytes32 partition;
}

/**
 * @notice Persistent storage backing the ERC-1410 basic partition model.
 * @dev Tracks the multi-partition mode flag, per-partition supplies, the dense token-holder index used
 *      by pagination, and the per-holder partition array plus reverse lookup. New fields land below the
 *      append-only marker to preserve ERC-7201 slot stability.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc1410Basic
 */
struct ERC1410BasicStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool multiPartition;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 totalTokenHolders;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 => uint256) totalSupplyByPartition;
    /// @dev Mapping from investor to their partitions
    mapping(address => Partition[]) partitions;
    /// @dev Mapping from (investor, partition) to index of corresponding partition in partitions
    /// @dev Stored value is always greater by 1 to avoid the 0 value of every index
    mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
    mapping(address => uint256) tokenHolderIndex;
    mapping(uint256 => address) tokenHolders;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @notice Persistent storage backing the ERC-1410 operator authorisation model.
 * @dev Records per-partition operator approvals and global (cross-partition) approvals. Separated from
 *      `ERC1410BasicStorage` so operator-only updates do not collide with the basic partition slot.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc1410Operator
 */
struct ERC1410OperatorStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    /// @dev Mapping from (investor, partition, operator) to approved status
    mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
    /// @dev Mapping from (investor, operator) to approved status (can be used against any partition)
    mapping(address => mapping(address => bool)) approvals;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ERC1410StorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal library that mediates every read and write against the ERC-1410 partition storage.
 * @dev Centralises the partition lifecycle (issue, transfer, redeem), operator authorisation, snapshot
 *      hooks, balance-adjustment factor application and protected (signature-gated) variants. Higher
 *      facets and storage wrappers compose this library to keep partition accounting in lockstep with
 *      ERC-20 supply, ERC-3643 compliance callbacks and the snapshot/scheduled-tasks subsystems.
 */
library ERC1410StorageWrapper {
    using LowLevelCall for address;

    /**
     * @notice Marks the ERC-1410 module as initialised and records whether multi-partition mode is on.
     * @dev Idempotency must be enforced by the caller via the matching `onlyNotERC1410Initialized`
     *      modifier; this helper sets both the mode flag and the lifecycle flag in the basic storage.
     * @param multiPartition When `true`, partitions other than `_DEFAULT_PARTITION` are accepted.
     */
    function initializeERC1410(bool multiPartition) internal {
        erc1410BasicStorage().multiPartition = multiPartition;
    }

    /**
     * @notice Reduces the ERC-1410 partition balance only — does NOT touch ERC-20 storage.
     * @dev Callers are responsible for emitting Transfer via `ERC20StorageWrapper.performTransfer`.
     * @param from      Token holder whose partition balance is reduced.
     * @param value     Amount to deduct.
     * @param partition Partition identifier.
     */
    function reducePartitionOnly(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }

        uint256 fromBalance = balanceOfByPartition(partition, from);

        if (fromBalance < value) {
            revert ITransfer.InsufficientBalance(from, fromBalance, value, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[from][partition] - 1;

        if (erc1410Storage.partitions[from][index].amount == value) {
            deletePartitionForHolder(from, partition, index);
        } else {
            erc1410Storage.partitions[from][index].amount -= value;
        }
    }

    /**
     * @notice Increases the ERC-1410 partition balance only — does NOT touch ERC-20 storage.
     * @dev Callers are responsible for emitting Transfer via `ERC20StorageWrapper.performTransfer`.
     * @param from      Token holder whose partition balance is increased.
     * @param value     Amount to credit.
     * @param partition Partition identifier.
     */
    function increasePartitionOnly(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        erc1410Storage.partitions[from][erc1410Storage.partitionToIndex[from][partition] - 1].amount += value;
    }

    /**
     * @notice Adds a new partition entry for an account — does NOT touch ERC-20 storage.
     * @dev Callers are responsible for emitting Transfer via `ERC20StorageWrapper.performTransfer`.
     *      Captures the holder's partition-list length into the active snapshot BEFORE the push so
     *      `partitionsOfAtSnapshot` knows the pre-mutation size; the new slot itself does not need
     *      a per-index snapshot because it did not exist at snapshot time. Also extends the LABAF
     *      array so the new partition index has a matching adjustment factor entry.
     * @param value     Initial partition amount.
     * @param account   Token holder receiving the partition.
     * @param partition Partition identifier.
     */
    function addPartitionToOnly(uint256 value, address account, bytes32 partition) internal {
        SnapshotsStorageWrapper.updateTotalPartitionsSnapshot(account);
        AdjustBalancesStorageWrapper.pushLabafUserPartition(account, AdjustBalancesStorageWrapper.getAbaf());

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        erc1410Storage.partitions[account].push(Partition(value, partition));
        erc1410Storage.partitionToIndex[account][partition] = erc1410BasicStorage().partitions[account].length;
    }

    /**
     * @notice Re-keys the dense token-holder index from `oldTokenHolder` to `newTokenHolder`.
     * @dev Inherits the existing index slot rather than shrinking the directory; the old holder's
     *      reverse lookup is cleared. Used when an account is fully drained into another in one move.
     * @param newTokenHolder Address that inherits the dense index.
     * @param oldTokenHolder Address whose index is transferred away.
     */
    function replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();

        uint256 index = basicStorage.tokenHolderIndex[oldTokenHolder];
        if (index == 0) revert IERC1410Types.TokenHolderNotFound(oldTokenHolder);
        basicStorage.tokenHolderIndex[newTokenHolder] = index;
        basicStorage.tokenHolders[index] = newTokenHolder;
        basicStorage.tokenHolderIndex[oldTokenHolder] = 0;
    }

    /**
     * @notice Appends a new entry to the dense token-holder directory.
     * @dev Increments `totalTokenHolders` and writes both directions of the index/holder mapping.
     *      Caller must verify the holder is not already present, otherwise the directory becomes sparse.
     * @param tokenHolder Address being added to the holder set.
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
     * @notice Removes a holder from the dense token-holder directory.
     * @dev Performs a swap-with-last to keep the directory dense, then decrements `totalTokenHolders`
     *      and deletes the stale slot. Callers must guarantee the holder is currently present.
     * @param tokenHolder Address being removed from the holder set.
     */
    function removeTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();

        uint256 lastIndex = basicStorage.totalTokenHolders;
        uint256 tokenHolderIndex = basicStorage.tokenHolderIndex[tokenHolder];
        _checkUnexpectedError(tokenHolderIndex == 0, KPI_ERC1410_REMOVE_HOLDER);
        if (lastIndex > 1) {
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
        delete basicStorage.tokenHolders[lastIndex];
    }

    /**
     * @notice Grants `operator` cross-partition authorisation on behalf of the caller.
     * @dev Sets the global approval flag for the calling holder. Does not affect per-partition
     *      approvals — those remain managed by `authorizeOperatorByPartition`. The calling facet
     *      (`Operator`) emits `AuthorizedOperator`.
     * @param operator Address being authorised to act for the caller.
     */
    function authorizeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = true;
    }

    /**
     * @notice Revokes the cross-partition authorisation previously granted to `operator`.
     * @dev Clears the global approval flag for the calling holder. Has no effect on per-partition
     *      approvals. The calling facet (`Operator`) emits `RevokedOperator`.
     * @param operator Address whose cross-partition authorisation is removed.
     */
    function revokeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = false;
    }

    /**
     * @notice Grants `operator` authorisation on `partition` on behalf of the caller.
     * @dev Sets the partition-scoped approval flag for the calling holder. Independent from the
     *      global approval set by `authorizeOperator`. The calling facet (`OperatorByPartition`)
     *      emits `AuthorizedOperatorByPartition`.
     * @param partition Partition identifier whose operator set is updated.
     * @param operator  Address being authorised on the partition.
     */
    function authorizeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = true;
    }

    /**
     * @notice Revokes the authorisation previously granted to `operator` on `partition`.
     * @dev Clears the partition-scoped approval flag for the calling holder. Cross-partition
     *      approvals are untouched. The calling facet (`OperatorByPartition`) emits
     *      `RevokedOperatorByPartition`.
     * @param partition Partition identifier whose operator set is updated.
     * @param operator  Address whose partition-scoped authorisation is removed.
     */
    function revokeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = false;
    }

    /**
     * @notice Transfers `value` tokens of `partition` from `from` to the recipient in `basicTransferInfo`.
     * @dev Runs the snapshot pre-hook, mutates the source partition, credits the destination partition
     *      (creating it when absent), keeps the ERC-20 mirror in sync, emits `TransferByPartition`, then
     *      relays the move to the ERC-3643 compliance hook for non-self transfers before running the
     *      post-hook. Returns the partition that was settled.
     * @param from              Source token holder.
     * @param basicTransferInfo Destination address and amount being moved.
     * @param partition         Partition identifier driving the transfer.
     * @param data              Caller-supplied payload forwarded into `TransferByPartition`.
     * @param operator          Address recorded as the operator on the event.
     * @param operatorData      Operator-supplied payload forwarded into `TransferByPartition`.
     * @return The partition that was settled (mirrors `partition`).
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

        reducePartitionOnly(from, basicTransferInfo.value, partition);

        if (!validPartitionForReceiver(partition, basicTransferInfo.to)) {
            addPartitionToOnly(basicTransferInfo.value, basicTransferInfo.to, partition);
        } else {
            increasePartitionOnly(basicTransferInfo.to, basicTransferInfo.value, partition);
        }

        ERC20StorageWrapper.performTransfer(from, basicTransferInfo.to, basicTransferInfo.value);

        // Emit transfer events AFTER all partition balance changes are complete.
        // This ensures TransferByPartition is emitted when partitions[] changes.
        // ERC-20 Transfer is also required per EIP-20 for off-chain indexer traceability.
        emit IERC1410Types.TransferByPartition(
            partition,
            operator,
            from,
            basicTransferInfo.to,
            basicTransferInfo.value,
            data,
            operatorData
        );

        if (from != basicTransferInfo.to) {
            address(ERC3643StorageWrapper.getCompliance()).functionCall(
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
     * @notice Transfers tokens by partition on behalf of `operatorTransferData.from`.
     * @dev Convenience wrapper that pivots `OperatorTransferData` into the `BasicTransferInfo` shape and
     *      records `msg.sender` as the operator. Authorisation must already be verified by the caller.
     * @param operatorTransferData Bundle holding source, destination, amount, partition and payloads.
     * @return The partition that was settled.
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
     * @notice Mints partition-scoped tokens to a holder.
     * @dev Validates the inputs, runs the snapshot pre-hook against the zero-address source, credits the
     *      destination partition (creating it when absent), keeps the ERC-20 supply mirror in sync,
     *      bumps the per-partition supply, notifies the ERC-3643 compliance hook then emits both
     *      `TransferByPartition` (with the zero-address `from`) and `IssuedByPartition`.
     * @param issueData Bundle holding the recipient, partition, amount and audit payload.
     */
    function issueByPartition(IERC1410Types.IssueData memory issueData) internal {
        validateParams(issueData.partition, issueData.value);

        beforeTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);

        if (!validPartitionForReceiver(issueData.partition, issueData.tokenHolder)) {
            addPartitionToOnly(issueData.value, issueData.tokenHolder, issueData.partition);
        } else {
            increasePartitionOnly(issueData.tokenHolder, issueData.value, issueData.partition);
        }

        ERC20StorageWrapper.performTransfer(address(0), issueData.tokenHolder, issueData.value);

        increaseTotalSupplyByPartition(issueData.partition, issueData.value);

        address(ERC3643StorageWrapper.getCompliance()).functionCall(
            abi.encodeWithSelector(ICompliance.created.selector, issueData.tokenHolder, issueData.value),
            IERC3643Types.ComplianceCallFailed.selector
        );

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
     * @notice Burns partition-scoped tokens from a holder.
     * @dev Runs the snapshot pre-hook, debits the source partition, keeps the ERC-20 supply mirror in
     *      sync, decrements the per-partition supply, notifies the ERC-3643 compliance hook then emits
     *      `TransferByPartition` (with the zero-address `to`) and `RedeemedByPartition`.
     * @param partition    Partition identifier from which value is burnt.
     * @param from         Holder whose balance shrinks.
     * @param operator     Operator recorded on the events.
     * @param value        Amount being burnt.
     * @param data         Caller-supplied payload forwarded onto the events.
     * @param operatorData Operator-supplied payload forwarded onto the events.
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

        reducePartitionOnly(from, value, partition);

        ERC20StorageWrapper.performTransfer(from, address(0), value);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410Types.TransferByPartition(partition, operator, from, address(0), value, data, operatorData);

        reduceTotalSupplyByPartition(partition, value);

        address(ERC3643StorageWrapper.getCompliance()).functionCall(
            abi.encodeWithSelector(ICompliance.destroyed.selector, from, value),
            IERC3643Types.ComplianceCallFailed.selector
        );

        afterTokenTransfer(partition, from, address(0), value);

        emit IERC1410Types.RedeemedByPartition(partition, operator, from, value, data, operatorData);
    }

    /**
     * @notice Executes a signature-protected partition transfer initiated by an off-chain authoriser.
     * @dev Validates the EIP-712 nonce/deadline pair against the holder's current nonce and the
     *      timekeeper, verifies the authoriser signature via `ProtectedPartitionsStorageWrapper`,
     *      consumes the nonce, then delegates the move to `transferByPartition` with `msg.sender` as
     *      the operator. Reverts if the signature, nonce or deadline check fails.
     * @param partition      Partition identifier driving the transfer.
     * @param from           Source holder, whose nonce is advanced.
     * @param to             Destination address.
     * @param amount         Token amount being transferred.
     * @param protectionData Nonce, deadline and signature authorising the transfer.
     * @return The partition that was settled.
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
            EvmAccessors.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkTransferSignature(
            partition,
            from,
            to,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(from);

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
     * @notice Executes a signature-protected partition redemption initiated by an off-chain authoriser.
     * @dev Validates the EIP-712 nonce/deadline pair, verifies the authoriser signature via
     *      `ProtectedPartitionsStorageWrapper`, consumes the nonce, then delegates the burn to
     *      `redeemByPartition` with `msg.sender` as the operator.
     * @param partition      Partition identifier from which value is burnt.
     * @param from           Holder whose balance shrinks and whose nonce is advanced.
     * @param amount         Token amount being burnt.
     * @param protectionData Nonce, deadline and signature authorising the redemption.
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
            EvmAccessors.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkRedeemSignature(
            partition,
            from,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );
        NonceStorageWrapper.setNonceFor(from);

        redeemByPartition(partition, from, EvmAccessors.getMsgSender(), amount, "", "");
    }

    /**
     * @notice Pre-transfer hook that captures snapshots and reconciles the security-holder directory.
     * @dev No-op when `from == to`. Triggers scheduled tasks plus balance adjustments, snapshots both
     *      account balances and total supply on the appropriate flow (mint, burn or transfer), then
     *      runs `updateSecurityHolder` to keep the dense holder set in sync with the new balances.
     * @param partition Partition identifier driving the transfer.
     * @param from      Source address (may be the zero address on a mint).
     * @param to        Destination address (may be the zero address on a burn).
     * @param amount    Token amount about to move.
     */
    function beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        if (from == to) return;
        triggerAndSyncAll(partition, from, to);

        if (from == address(0)) {
            // mint | issue
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
        } else if (to == address(0)) {
            // burn | redeem
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
        }
        // transfer
        else {
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
        }

        updateSecurityHolder(from, to, amount);
    }

    /**
     * @notice Reconciles the dense token-holder directory after a transfer.
     * @dev No-op for self-transfers or zero-amount moves. Detects whether the transfer leaves the source
     *      with a zero balance (`removeFrom`) and whether the destination is brand-new (`addTo`), then
     *      either replaces, adds or removes the relevant directory entry while snapshotting the
     *      affected holders. The total-holder snapshot is captured whenever the count changes.
     * @param from   Source address (or the zero address on a mint).
     * @param to     Destination address (or the zero address on a burn).
     * @param amount Token amount being moved; required to decide if the source is being emptied.
     */
    function updateSecurityHolder(address from, address to, uint256 amount) internal {
        if (from == to) return;
        if (amount == 0) return;

        bool addTo;
        bool removeFrom;

        if (from != address(0)) {
            removeFrom = TokenCoreOps.getTotalBalanceForAdjustedAt(from, EvmAccessors.getBlockTimestamp()) == amount;
        }
        if (to != address(0)) {
            addTo = TokenCoreOps.getTotalBalanceForAdjustedAt(to, EvmAccessors.getBlockTimestamp()) == 0;
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
     * @notice Post-transfer hook that propagates the move to ERC-20 voting bookkeeping.
     * @dev Delegates to `ERC20VotesStorageWrapper.afterTokenTransfer` so `DelegateVotesChanged` is
     *      emitted whenever the voting power of an account changes as a result of the transfer.
     * @param partition Partition identifier the transfer settled on.
     * @param from      Source address (may be the zero address on a mint).
     * @param to        Destination address (may be the zero address on a burn).
     * @param amount    Token amount just moved.
     */
    function afterTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        // Hook for ERC20Votes integration - emit DelegateVotesChanged when voting power changes
        ERC20VotesStorageWrapper.afterTokenTransfer(partition, from, to, amount);
    }

    /**
     * @notice Triggers all pending scheduled tasks and applies pending balance adjustments.
     * @dev Composed of two side effects: (1) `ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks`
     *      flushes any due tasks, and (2) `syncBalanceAdjustments` rebases the partition balances and
     *      supply against the latest adjustment factor.
     * @param partition Partition identifier whose balances are reconciled.
     * @param from      Source address; skipped when zero.
     * @param to        Destination address; skipped when zero.
     */
    function triggerAndSyncAll(bytes32 partition, address from, address to) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        syncBalanceAdjustments(partition, from, to);
    }

    /**
     * @notice Rebases partition supply and the involved balances against the current adjustment factor.
     * @dev Always rebases the partition supply via `AdjustBalancesStorageWrapper`; rebases the source
     *      and destination total/partition balances only when their address is non-zero (skipping the
     *      mint/burn legs that have no real holder).
     * @param partition Partition identifier whose supply is reconciled.
     * @param from      Source address; skipped when zero.
     * @param to        Destination address; skipped when zero.
     */
    function syncBalanceAdjustments(bytes32 partition, address from, address to) internal {
        // adjust the total supply for the partition
        AdjustBalancesStorageWrapper.adjustTotalAndMaxSupplyForPartition(partition);

        // adjust "from" total and partition balance
        if (from != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, from);

        // adjust "to" total and partition balance
        if (to != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, to);
    }

    /**
     * @notice Multiplies the partition supply by an adjustment factor.
     * @dev Pure storage mutation; the caller is responsible for sequencing the LABAF/ABAF bookkeeping.
     * @param partition Partition whose supply is rebased.
     * @param factor    Multiplicative adjustment factor.
     */
    function adjustTotalSupplyByPartition(bytes32 partition, uint256 factor) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] *= factor;
    }

    /**
     * @notice Rebases both the partition balance and the ERC-20 total balance of `account`.
     * @dev Reads the current ABAF, delegates the partition leg to `_adjustPartitionBalanceFor` and the
     *      ERC-20 leg to `ERC20StorageWrapper.adjustTotalBalanceFor`. Used after scheduled balance
     *      adjustments to keep an account fully synchronised before further mutations.
     * @param partition Partition identifier whose balance is rebased.
     * @param account   Account whose balances are rebased.
     */
    function adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        _adjustPartitionBalanceFor(basicStorage, abaf, partition, account);
        ERC20StorageWrapper.adjustTotalBalanceFor(abaf, account);
    }

    /**
     * @notice Reduces the ERC-20 total supply by `value`.
     * @dev Thin delegation to `ERC20StorageWrapper.reduceTotalSupply`; does not touch any partition
     *      supply (use `reduceTotalSupplyByPartition` to keep the partition mirror in sync).
     * @param value Amount to subtract from the global supply.
     */
    function reduceTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    /**
     * @notice Increases the ERC-20 total supply by `value`.
     * @dev Thin delegation to `ERC20StorageWrapper.increaseTotalSupply`; does not touch any partition
     *      supply (use `increaseTotalSupplyByPartition` to keep the partition mirror in sync).
     * @param value Amount to add to the global supply.
     */
    function increaseTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    /**
     * @notice Reduces both the partition supply and the ERC-20 total supply by `value`.
     * @dev Keeps the per-partition supply and the ERC-20 supply mirror in lockstep; callers using this
     *      helper should not also call `reduceTotalSupply` separately.
     * @param partition Partition whose supply shrinks.
     * @param value     Amount to deduct from both ledgers.
     */
    function reduceTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] -= value;
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    /**
     * @notice Increases both the partition supply and the ERC-20 total supply by `value`.
     * @dev Keeps the per-partition supply and the ERC-20 supply mirror in lockstep; callers using this
     *      helper should not also call `increaseTotalSupply` separately.
     * @param partition Partition whose supply grows.
     * @param value     Amount to credit to both ledgers.
     */
    function increaseTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] += value;
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    /**
     * @notice Returns the current ERC-20 total supply.
     * @dev Delegates to `ERC20StorageWrapper.totalSupply`; included so partition-level callers do not
     *      need to import the ERC-20 wrapper directly.
     * @return Total supply held in the ERC-20 mirror.
     */
    function totalSupply() internal view returns (uint256) {
        return ERC20StorageWrapper.totalSupply();
    }

    /**
     * @notice Returns the current supply attributed to `partition`.
     * @dev Reads the dense `totalSupplyByPartition` map; missing partitions return zero.
     * @param partition Partition identifier being queried.
     * @return Supply held by the partition.
     */
    function totalSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return erc1410BasicStorage().totalSupplyByPartition[partition];
    }

    /**
     * @notice Returns the total supply projected onto `timestamp` using any pending balance adjustments.
     * @dev Looks up the pending ABAF at `timestamp` from `ScheduledTasksStorageWrapper`, then multiplies
     *      the current supply by that factor. Used by historical queries that must account for an
     *      adjustment scheduled but not yet applied.
     * @param timestamp Reference timestamp.
     * @return Supply scaled by the pending adjustment factor at `timestamp`.
     */
    function totalSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(
            timestamp,
            false
        );
        return totalSupply() * pendingABAF;
    }

    /**
     * @notice Returns the partition supply projected onto `timestamp` using pending adjustments.
     * @dev Combines the current partition supply with the factor returned by
     *      `AdjustBalancesStorageWrapper.calculateFactor`, comparing the pending ABAF at `timestamp`
     *      against the partition's last-applied LABAF.
     * @param partition Partition identifier being queried.
     * @param timestamp Reference timestamp.
     * @return Partition supply scaled by the pending adjustment factor at `timestamp`.
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
     * @notice Returns the cumulative balance held by `tokenHolder` across every partition.
     * @dev Delegates to `ERC20StorageWrapper.balanceOf`, which mirrors the partition totals.
     * @param tokenHolder Address being queried.
     * @return Cumulative balance of the holder.
     */
    function balanceOf(address tokenHolder) internal view returns (uint256) {
        return ERC20StorageWrapper.balanceOf(tokenHolder);
    }

    /**
     * @notice Returns the balance held by `tokenHolder` on a single partition.
     * @dev Returns zero when the partition is unknown for the holder; otherwise reads the partition's
     *      amount via the reverse index in `partitionToIndex` (stored 1-indexed to distinguish absence).
     * @param partition   Partition identifier being queried.
     * @param tokenHolder Address being queried.
     * @return Balance on the partition, or zero if the holder has no entry.
     */
    function balanceOfByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        if (!validPartition(partition, tokenHolder)) return 0;
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        return
            erc1410Storage.partitions[tokenHolder][erc1410Storage.partitionToIndex[tokenHolder][partition] - 1].amount;
    }

    /**
     * @notice Returns the cumulative balance of `tokenHolder` projected onto `timestamp`.
     * @dev Multiplies the current balance by the factor between the ABAF at `timestamp` and the
     *      holder's last-applied LABAF, so historical readers see the same balance that would have
     *      existed once the pending adjustment lands.
     * @param tokenHolder Address being queried.
     * @param timestamp   Reference timestamp.
     * @return Cumulative balance scaled by the pending adjustment factor at `timestamp`.
     */
    function balanceOfAdjustedAt(address tokenHolder, uint256 timestamp) internal view returns (uint256) {
        return
            balanceOf(tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByUser(tokenHolder)
            );
    }

    /**
     * @notice Returns the partition balance of `tokenHolder` projected onto `timestamp`.
     * @dev Multiplies the current partition balance by the factor between the ABAF at `timestamp` and
     *      the LABAF stored for the (holder, partition) pair, mirroring the rebase that would happen if
     *      the pending adjustment were applied.
     * @param partition   Partition identifier being queried.
     * @param tokenHolder Address being queried.
     * @param timestamp   Reference timestamp.
     * @return Partition balance scaled by the pending adjustment factor at `timestamp`.
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
     * @notice Returns every partition identifier the holder currently owns.
     * @dev Builds and returns a fresh memory array sized to the holder's current partition count;
     *      iteration uses `unchecked` increments because the loop is bounded by the array length.
     * @param tokenHolder Address being queried.
     * @return partitionsList Dense list of partition identifiers held by the account.
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
     * @notice Returns the partition identifier stored at position `index` of `holder`'s partition list.
     * @dev Slot-level accessor used by the per-index partition snapshot reader to avoid copying the
     *      whole array. Reverts via array bounds if `index >= partitions[holder].length`.
     * @param holder Address whose partition list is queried.
     * @param index  Zero-based slot in the holder's partition array.
     * @return The partition identifier stored at that slot.
     */
    function partitionAt(address holder, uint256 index) internal view returns (bytes32) {
        return erc1410BasicStorage().partitions[holder][index].partition;
    }

    /**
     * @notice Returns the current length of `holder`'s partition array.
     * @dev Used by the per-index partition snapshot path to know how many slots to iterate without
     *      materialising the full list.
     * @param holder Address whose partition list is queried.
     * @return The number of partitions currently owned by the holder.
     */
    function partitionsLength(address holder) internal view returns (uint256) {
        return erc1410BasicStorage().partitions[holder].length;
    }

    /**
     * @notice Reports whether `holder` already owns a partition entry for `partition`.
     * @dev Delegates to `validPartitionForReceiver` since the membership test is symmetric.
     * @param partition Partition identifier being checked.
     * @param holder    Address being queried.
     * @return True when the holder has an entry for the partition; false otherwise.
     */
    function validPartition(bytes32 partition, address holder) internal view returns (bool) {
        return validPartitionForReceiver(partition, holder);
    }

    /**
     * @notice Reports whether `to` already has a partition entry for `partition`.
     * @dev Uses the 1-indexed `partitionToIndex` map: a non-zero value means the partition exists for
     *      the address.
     * @param partition Partition identifier being checked.
     * @param to        Recipient candidate being queried.
     * @return True when the recipient already has an entry for the partition.
     */
    function validPartitionForReceiver(bytes32 partition, address to) internal view returns (bool) {
        return erc1410BasicStorage().partitionToIndex[to][partition] != 0;
    }

    /**
     * @notice Returns a page of token holders from the dense directory.
     * @dev Uses `Pagination` helpers to clamp `pageIndex`/`pageLength` against `totalTokenHolders`,
     *      then walks the directory with `unchecked` increments. Returned addresses are 1-indexed in
     *      storage; the offset is handled by `++start`.
     * @param pageIndex  Zero-based page index.
     * @param pageLength Maximum entries per page.
     * @return holders_ Page of holder addresses.
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
     * @notice Returns the holder stored at a one-based directory index.
     * @dev Returns the zero address when the slot has been deleted or never written.
     * @param index One-based directory index.
     * @return Address stored at the index.
     */
    function getTokenHolder(uint256 index) internal view returns (address) {
        return erc1410BasicStorage().tokenHolders[index];
    }

    /**
     * @notice Returns the count of holders currently present in the directory.
     * @dev Mirrors `ERC1410BasicStorage.totalTokenHolders`, which is kept dense by add/remove logic.
     * @return Number of holders in the dense directory.
     */
    function getTotalTokenHolders() internal view returns (uint256) {
        return erc1410BasicStorage().totalTokenHolders;
    }

    /**
     * @notice Returns the dense index assigned to `tokenHolder`.
     * @dev Returns zero when the holder is absent from the directory.
     * @param tokenHolder Address being queried.
     * @return One-based directory index of the holder.
     */
    function getTokenHolderIndex(address tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().tokenHolderIndex[tokenHolder];
    }

    /**
     * @notice Reports whether multi-partition mode is enabled on the token.
     * @dev Read from `ERC1410BasicStorage.multiPartition`; controls whether non-default partitions
     *      are accepted by `requireDefaultPartitionWithSinglePartition` and similar guards.
     * @return True when multi-partition mode is active.
     */
    function isMultiPartition() internal view returns (bool) {
        return erc1410BasicStorage().multiPartition;
    }

    /**
     * @notice Reports whether `operator` holds a cross-partition authorisation for `tokenHolder`.
     * @dev Reads the global approval flag from `ERC1410OperatorStorage.approvals`.
     * @param operator    Candidate operator address.
     * @param tokenHolder Holder whose approval set is checked.
     * @return True when the operator is globally authorised by the holder.
     */
    function isOperator(address operator, address tokenHolder) internal view returns (bool) {
        return erc1410OperatorStorage().approvals[tokenHolder][operator];
    }

    /**
     * @notice Reports whether `operator` is authorised on a specific `partition` for `tokenHolder`.
     * @dev Reads the partition-scoped approval flag from `ERC1410OperatorStorage.partitionApprovals`.
     * @param partition   Partition identifier being checked.
     * @param operator    Candidate operator address.
     * @param tokenHolder Holder whose approval set is checked.
     * @return True when the operator is authorised on the partition.
     */
    function isOperatorForPartition(
        bytes32 partition,
        address operator,
        address tokenHolder
    ) internal view returns (bool) {
        return erc1410OperatorStorage().partitionApprovals[tokenHolder][partition][operator];
    }

    /**
     * @notice Reports whether `operator` may act on `partition` for `tokenHolder`.
     * @dev Combines the global and partition-scoped checks: either authorisation grants permission.
     * @param partition   Partition identifier driving the action.
     * @param operator    Candidate operator address.
     * @param tokenHolder Holder whose approval set is checked.
     * @return True when either authorisation tier permits the operator.
     */
    function isAuthorized(bytes32 partition, address operator, address tokenHolder) internal view returns (bool) {
        return isOperator(operator, tokenHolder) || isOperatorForPartition(partition, operator, tokenHolder);
    }

    // Guard functions (internal view)

    /**
     * @notice Reverts unless `msg.sender` is authorised to act on `partition` for `from`.
     * @dev Guard for operator-driven entry points; combines the global and partition-scoped approval
     *      checks via `isAuthorized`.
     * @param partition Partition identifier driving the action.
     * @param from      Source holder whose approval set must allow `msg.sender`.
     */
    function requireOperator(bytes32 partition, address from) internal view {
        if (!isAuthorized(partition, EvmAccessors.getMsgSender(), from))
            revert IERC1410Types.Unauthorized(EvmAccessors.getMsgSender(), from, partition);
    }

    /**
     * @notice Reverts when multi-partition mode is active.
     * @dev Used to gate single-partition-only entry points; relies on `isMultiPartition`.
     */
    function requireWithoutMultiPartition() internal view {
        if (isMultiPartition()) revert IERC1410Types.NotAllowedInMultiPartitionMode();
    }

    /**
     * @notice Reverts when the token runs in single-partition mode and `partition` is not the default.
     * @dev Enforces that single-partition tokens only ever address `_DEFAULT_PARTITION`; multi-partition
     *      tokens accept any partition.
     * @param partition Partition identifier supplied by the caller.
     */
    function requireDefaultPartitionWithSinglePartition(bytes32 partition) internal view {
        if (!isMultiPartition() && partition != _DEFAULT_PARTITION)
            revert IERC1410Types.PartitionNotAllowedInSinglePartitionMode(partition);
    }

    /**
     * @notice Returns the reverse index of `partition` in `holder`'s partition array.
     * @dev Used by the transfer logic to find the partition slot when the identifier is given; returns
     *      zero when the holder has no entry for the partition, so callers must check for presence via
     *      `validPartition` or similar before using the result.
     * @param holder Address whose partition index is queried.
     * @param partition Partition identifier being queried.
     * @return One-based index of the partition in the holder's array, or zero if absent.
     */
    function partitionsToIndexes(address holder, bytes32 partition) internal view returns (uint256) {
        return erc1410BasicStorage().partitionToIndex[holder][partition];
    }

    /**
     * @notice Rejects zero-value transfers and the zero-partition identifier.
     * @dev Reverts with `ZeroValue` or `ZeroPartition` from `IERC1410Types`; pure check on the inputs.
     * @param partition Partition identifier being validated.
     * @param value     Token amount being validated.
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
     * @notice Rebases an account's partition balance against the active adjustment factor.
     * @dev No-op when the account has no entry for the partition. Otherwise computes the factor for the
     *      (account, partition) pair, scales the stored amount and — when the rebase changes the
     *      balance — emits a `TransferByPartition` with both peers set to the zero address so indexers
     *      can record the adjustment delta. Finally writes the new LABAF for the partition slot.
     * @param basicStorage Storage pointer to the basic partition struct.
     * @param abaf         Current adjustment factor reference.
     * @param partition    Partition whose balance is rebased.
     * @param account      Account whose partition balance is rebased.
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
     * @notice Removes a partition entry from a holder's partition array.
     * @dev Captures the snapshot bookkeeping BEFORE the swap-with-last + pop so historical reads
     *      keep observing the pre-mutation set: the partition-list length, the slot at `index`
     *      (only when distinct from `lastIndex`, since it is about to be overwritten by the swap),
     *      and the slot at `lastIndex` (which is about to be popped). Total cost is O(1) regardless
     *      of the holder's partition count — the per-index pattern mirrors the security-holders
     *      snapshot and closes the partition-spam DoS surface. Then performs the swap-with-last,
     *      repoints the moved entry's reverse index, drops the partition's reverse-index slot,
     *      pops the trailing array element and finally pops the matching LABAF entry tracked by
     *      `AdjustBalancesStorageWrapper`.
     * @param holder    Account whose partition entry is removed.
     * @param partition Partition identifier being removed.
     * @param index     Zero-based position of the partition entry in the holder's array.
     */
    function deletePartitionForHolder(address holder, bytes32 partition, uint256 index) private {
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 lastIndex = erc1410Storage.partitions[holder].length - 1;

        SnapshotsStorageWrapper.updateTotalPartitionsSnapshot(holder);
        if (index != lastIndex) {
            SnapshotsStorageWrapper.updatePartitionAtIndexSnapshot(holder, index);
            erc1410Storage.partitions[holder][index] = erc1410Storage.partitions[holder][lastIndex];
            unchecked {
                AdjustBalancesStorageWrapper.updateLabafByTokenHolderAndPartitionIndex(
                    AdjustBalancesStorageWrapper.getLabafByUserAndPartitionIndex(lastIndex + 1, holder),
                    holder,
                    index + 1
                );
            }

            erc1410Storage.partitionToIndex[holder][erc1410Storage.partitions[holder][index].partition] = index + 1;
        }
        SnapshotsStorageWrapper.updatePartitionAtIndexSnapshot(holder, lastIndex);

        delete erc1410Storage.partitionToIndex[holder][partition];
        erc1410Storage.partitions[holder].pop();
        AdjustBalancesStorageWrapper.popLabafUserPartition(holder);
    }

    /**
     * @notice Returns a storage pointer to the ERC-1410 basic storage namespace.
     * @dev Resolves the ERC-7201 slot constant `STORAGE_LOCATION_ERC1410_BASIC` via inline assembly so
     *      every helper reads and writes the same persistent struct.
     * @return erc1410BasicStorage_ Storage pointer to the basic partition state.
     */
    function erc1410BasicStorage() private pure returns (ERC1410BasicStorage storage erc1410BasicStorage_) {
        bytes32 position = STORAGE_LOCATION_ERC1410_BASIC;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    /**
     * @notice Returns a storage pointer to the ERC-1410 operator storage namespace.
     * @dev Resolves the ERC-7201 slot constant `STORAGE_LOCATION_ERC1410_OPERATOR` via inline assembly
     *      so every authorisation read/write addresses the same persistent struct.
     * @return erc1410OperatorStorage_ Storage pointer to the operator approval state.
     */
    function erc1410OperatorStorage() private pure returns (ERC1410OperatorStorage storage erc1410OperatorStorage_) {
        bytes32 position = STORAGE_LOCATION_ERC1410_OPERATOR;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }
}
