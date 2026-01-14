// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import { ISnapshotsStorageWrapper } from "./ISnapshotsStorageWrapper.sol";

// Snapshotted values have arrays of ids and the value corresponding to that id. These could be an array of a
// Snapshot struct, but that would impede usage of functions that work on an array.
struct Snapshots {
    uint256[] ids;
    uint256[] values;
}

struct SnapshotsAddress {
    uint256[] ids;
    address[] values;
}

struct ListOfPartitions {
    bytes32[] partitions;
}
struct PartitionSnapshots {
    uint256[] ids;
    ListOfPartitions[] values;
}

interface ISnapshots is ISnapshotsStorageWrapper {
    /**
     * @notice Takes a snapshot of the current balances and total supplies
     * @dev Taking a snapshot means the next time a user modifies their balance, the current balance will be stored
     *      in a mapping for the current snapshot id. The same applies to total supplies.
     */
    function takeSnapshot() external returns (uint256 snapshotID_);

    /**
     * @notice Returns the decimals at the time of a given snapshot
     */
    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);

    /**
     * @notice Returns the balance of an account at the time of a given snapshot
     */
    function balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);

    /**
     * @notice Returns the balance of an account for a given partition at the time of a given snapshot
     */
    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    /**
     * @notice Returns the list of partitions held by an account at the time of a given snapshot
     */
    function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[] memory);

    /**
     * @notice Returns the total supply at the time of a given snapshot
     */
    function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_);

    /**
     * @notice Returns the total supply for a given partition at the time of a given snapshot
     */
    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view returns (uint256 totalSupply_);

    /**
     * @notice Returns the locked balance of an account at the time of a given snapshot
     */
    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    /**
     * @notice Returns the locked balance of an account for a given partition at the time of a given snapshot
     */
    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    /**
     * @notice Returns the list of token holders at the time of a given snapshot
     */
    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of token holders at the time of a given snapshot
     */
    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256);
}
