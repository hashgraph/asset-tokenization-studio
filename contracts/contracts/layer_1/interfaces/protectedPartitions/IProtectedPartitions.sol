pragma solidity 0.8.18;

// SPDX-License-Identifier: BSD-3-Clause-Attribution

interface IProtectedPartitions {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(
        bool _arePartitionsProtected
    ) external returns (bool success_);

    function protectPartitions() external returns (bool success_);

    function unprotectPartitions() external returns (bool success_);

    function arePartitionsProtected() external view returns (bool);

    function getNounceFor(address account) external view returns (uint256);

    function calculateRoleForPartition(
        bytes32 _partition
    ) external pure returns (bytes32 roleForPartition_);
}
