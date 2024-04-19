// SPDX-License-Identifier: MIT
// Contract copy-pasted form OZ and extended

pragma solidity 0.8.18;

interface IERC20StorageWrapper {
    error InsufficientAllowance(address spender, address from);
    error SpenderWithZeroAddress();

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}
