// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1594StorageWrapper {
    error IssuanceIsClosed();
    event Issued(
        address indexed _operator,
        address indexed _to,
        uint256 _value,
        bytes _data
    );
    event Redeemed(
        address indexed _operator,
        address indexed _from,
        uint256 _value,
        bytes _data
    );
}
