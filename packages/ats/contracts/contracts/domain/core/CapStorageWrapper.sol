// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { MAX_UINT256 } from "../../constants/values.sol";
import { ICap } from "../../facets/cap/ICap.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage Cap
bytes32 constant STORAGE_LOCATION_CAP = 0xabd29859a2443302b9905d8be07aab508a353cf611fff647d31b2a10ccb92100;

/**
 * @notice Token supply cap data stored at an ERC-7201 namespace slot.
 * @dev Tracks global and per-partition supply caps, with initialized flag to guard
 *      against double initialisation.
 * @custom:storage-location erc7201:security.token.standard.storage.Cap
 */
struct CapDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 maxSupply;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 => uint256) maxSupplyByPartition;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title Cap Storage Wrapper
 * @notice Library for managing supply cap storage operations.
 * @dev Provides structured access to CapDataStorage at a dedicated storage slot,
 *      enforcing global and per-partition supply caps on token minting and transfers.
 * @author Asset Tokenization Studio Team
 */
library CapStorageWrapper {
    /**
     * @notice Initialises global and per-partition supply caps, guarded by an
     *         `onlyNotCapInitialized` modifier in the calling facet.
     * @dev Sets the `initialized` flag to true once all caps are recorded.
     * @param maxSupply The global supply cap (zero bypasses the global cap check).
     * @param partitionCap Array of partition-specific caps to be recorded.
     */
    function initializeCap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal {
        CapDataStorage storage cs = capStorage();
        cs.maxSupply = maxSupply;
        uint256 length = partitionCap.length;
        for (uint256 i; i < length; ) {
            cs.maxSupplyByPartition[partitionCap[i].partition] = partitionCap[i].maxSupply;
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Updates the global supply cap to a new value.
     * @dev Captures the previous cap (adjusted for pending balance adjustments at
     *      the caller's timestamp) before overwriting in storage.
     * @param _maxSupply The new global supply cap.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     * @return previousMaxSupply The globally adjusted cap prior to this call.
     */
    function setMaxSupply(uint256 _maxSupply, uint256 _timestamp) internal returns (uint256 previousMaxSupply) {
        previousMaxSupply = getMaxSupplyAdjustedAt(_timestamp);
        capStorage().maxSupply = _maxSupply;
    }

    /**
     * @notice Updates the supply cap for a specific partition.
     * @dev Captures the previous partition cap, writes the new cap, and emits
     *      `MaxSupplyByPartitionSet`. No zero-cap bypass for partition-level
     *      constraints (unlike the global cap).
     * @param _partition The partition identifier.
     * @param _maxSupply The new partition supply cap.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     */
    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupplyByPartition = getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        capStorage().maxSupplyByPartition[_partition] = _maxSupply;
        emit ICap.MaxSupplyByPartitionSet(
            EvmAccessors.getMsgSender(),
            _partition,
            _maxSupply,
            previousMaxSupplyByPartition
        );
    }

    /**
     * @notice Scales the global supply cap by a multiplicative factor.
     * @dev Clamps to MAX_UINT256 if overflow would occur. Used by
     *      `AdjustBalancesStorageWrapper` during balance-adjustment cascades.
     * @param factor The scaling factor (e.g., 10x, 100x for decimal adjustments).
     */
    function adjustMaxSupply(uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupply = (cs.maxSupply > limit) ? MAX_UINT256 : cs.maxSupply * factor;
    }

    /**
     * @notice Scales a partition's supply cap by a multiplicative factor.
     * @dev Clamps to MAX_UINT256 if overflow would occur. Used by
     *      `AdjustBalancesStorageWrapper` during balance-adjustment cascades.
     * @param partition The partition identifier.
     * @param factor The scaling factor.
     */
    function adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupplyByPartition[partition] = (cs.maxSupplyByPartition[partition] > limit)
            ? MAX_UINT256
            : cs.maxSupplyByPartition[partition] * factor;
    }

    /**
     * @notice Validates that minting or transferring an amount would not violate
     *         the global supply cap.
     * @dev Reverts with `ICap.MaxSupplyReached` if the check fails. Ignores the
     *      cap if it is zero.
     * @param _amount The amount being minted or transferred.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     */
    function checkMaxSupply(uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupply = getMaxSupplyAdjustedAt(_timestamp);
        uint256 totalSupply = AdjustBalancesStorageWrapper.totalSupplyAdjustedAt(_timestamp);
        if (!isCorrectMaxSupply(totalSupply + _amount, maxSupply)) revert ICap.MaxSupplyReached(maxSupply);
    }

    /**
     * @notice Validates that minting or transferring into a partition would not
     *         violate its supply cap.
     * @dev Reverts with `ICap.MaxSupplyReachedForPartition` if the check fails.
     * @param _partition The partition identifier.
     * @param _amount The amount being minted or transferred.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     */
    function checkMaxSupplyByPartition(bytes32 _partition, uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupplyForPartition = getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        uint256 totalSupplyForPartition = AdjustBalancesStorageWrapper.totalSupplyByPartitionAdjustedAt(
            _partition,
            _timestamp
        );
        if (!isCorrectMaxSupply(totalSupplyForPartition + _amount, maxSupplyForPartition)) {
            revert ICap.MaxSupplyReachedForPartition(_partition, maxSupplyForPartition);
        }
    }

    /**
     * @notice Validates that a proposed new global supply cap is non-zero and
     *         at least as large as the current total supply.
     * @dev Reverts with `ICap.NewMaxSupplyCannotBeZero` or
     *      `ICap.NewMaxSupplyTooLow` if the check fails.
     * @param _newMaxSupply The proposed new supply cap.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     */
    function requireValidNewMaxSupply(uint256 _newMaxSupply, uint256 _timestamp) internal view {
        if (_newMaxSupply == 0) {
            revert ICap.NewMaxSupplyCannotBeZero();
        }
        uint256 totalSupply = AdjustBalancesStorageWrapper.totalSupplyAdjustedAt(_timestamp);
        if (totalSupply > _newMaxSupply) {
            revert ICap.NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
    }

    /**
     * @notice Validates that a proposed new partition supply cap is non-zero and
     *         at least as large as the current partition total supply.
     * @dev Reverts with `ICap.NewMaxSupplyCannotBeZero` or
     *      `ICap.NewMaxSupplyForPartitionTooLow` if the check fails.
     * @param _partition The partition identifier.
     * @param _newMaxSupply The proposed new partition supply cap.
     * @param _timestamp The reference time for balance-adjustment factor lookup.
     */
    function checkValidNewMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _newMaxSupply,
        uint256 _timestamp
    ) internal view {
        if (_newMaxSupply == 0) revert ICap.NewMaxSupplyCannotBeZero();
        uint256 totalSupplyForPartition = AdjustBalancesStorageWrapper.totalSupplyByPartitionAdjustedAt(
            _partition,
            _timestamp
        );
        if (totalSupplyForPartition > _newMaxSupply) {
            revert ICap.NewMaxSupplyForPartitionTooLow(_partition, _newMaxSupply, totalSupplyForPartition);
        }
    }

    /**
     * @notice Returns the effective global supply cap at a given timestamp,
     *         adjusted for pending balance adjustments.
     * @dev Multiplies the stored cap by the pending overall balance adjustment
     *      factor (ABAF), clamping to MAX_UINT256 on overflow.
     * @param timestamp The reference time for balance-adjustment factor lookup.
     * @return The adjusted global supply cap at that timestamp.
     */
    function getMaxSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        (uint256 pendingAbaf, ) = AdjustBalancesStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(
            timestamp,
            false
        );
        return (cs.maxSupply > (MAX_UINT256 / pendingAbaf)) ? MAX_UINT256 : cs.maxSupply * pendingAbaf;
    }

    /**
     * @notice Returns the effective supply cap for a partition at a given timestamp,
     *         adjusted for partition-specific balance adjustments.
     * @dev Multiplies the stored cap by the combined ABAF and LABAF (Locate-specific
     *      Balance Adjustment Factor) for the partition, clamping to MAX_UINT256 on
     *      overflow.
     * @param partition The partition identifier.
     * @param timestamp The reference time for balance-adjustment factor lookup.
     * @return The adjusted partition supply cap at that timestamp.
     */
    function getMaxSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getLabafByPartition(partition)
        );

        uint256 limit = MAX_UINT256 / factor;
        return (cs.maxSupplyByPartition[partition] > limit) ? MAX_UINT256 : cs.maxSupplyByPartition[partition] * factor;
    }

    /**
     * @notice Loads the cap storage struct from its ERC-7201 namespace slot.
     * @dev Uses inline assembly to set the storage slot for the returned reference,
     *      allowing access to the cap data at its designated storage location.
     * @return cap_ A storage reference to `CapDataStorage` at the ERC-7201 slot.
     */
    function capStorage() internal pure returns (CapDataStorage storage cap_) {
        bytes32 position = STORAGE_LOCATION_CAP;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }

    /**
     * @notice Validates whether an amount complies with a supply cap constraint.
     * @dev Returns true if the cap is zero (uncapped) or the amount is at or
     *      below the cap.
     * @param _amount The amount being checked.
     * @param _maxSupply The supply cap limit (zero means unlimited).
     * @return True if the amount is compliant with the cap; false otherwise.
     */
    function isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }
}
