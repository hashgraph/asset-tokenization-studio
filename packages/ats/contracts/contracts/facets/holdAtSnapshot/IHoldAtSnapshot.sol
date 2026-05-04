// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IHoldAtSnapshot
 * @notice Interface for querying a token holder's held (escrowed) balance at the time of a
 *         previously taken snapshot.
 * @dev    Reads are delegated to `SnapshotsStorageWrapper` and depend on the snapshot index
 *         recorded by `takeSnapshot`. The held amount is computed against the adjustment
 *         factor active at the snapshot timestamp via
 *         `HoldStorageWrapper.getHeldAmountForAdjustedAt`.
 *         Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with
 *         `SnapshotIdDoesNotExists` for unknown identifiers.
 * @author Asset Tokenization Studio Team
 */
interface IHoldAtSnapshot {
    /**
     * @notice Returns the held balance of a token holder at the time of a given snapshot.
     * @dev    Sums all hold escrow amounts active at `_snapshotID`, adjusted for any
     *         balance-adjustment factor recorded at that snapshot timestamp.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The held balance of `_tokenHolder` recorded at `_snapshotID`.
     */
    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
