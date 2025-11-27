// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

interface IERC20StorageWrapper {
    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    error ZeroOwnerAddress();
    error InsufficientAllowance(address spender, address from);
    error SpenderWithZeroAddress();
}
