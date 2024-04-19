// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface ISnapshots {
    function takeSnapshot() external returns (uint256 snapshotID_);

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (bytes32[] memory);

    function totalSupplyAtSnapshot(
        uint256 _snapshotID
    ) external view returns (uint256 totalSupply_);
}
