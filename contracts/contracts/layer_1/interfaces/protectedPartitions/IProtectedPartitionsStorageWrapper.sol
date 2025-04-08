pragma solidity 0.8.18;

// SPDX-License-Identifier: BSD-3-Clause-Attribution

interface IProtectedPartitionsStorageWrapper {
    event PartitionsProtected(address indexed operator);

    event PartitionsUnProtected(address indexed operator);

    event ProtectedTransferFrom(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        address to,
        uint256 value,
        uint256 deadline,
        uint256 nounce,
        bytes signature
    );

    event ProtectedRedeemFrom(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        uint256 value,
        uint256 deadline,
        uint256 nounce,
        bytes signature
    );

    error PartitionsAreProtectedAndNoRole(address account, bytes32 role);
    error PartitionsAreUnProtected();
    error WrongSignature();
}
