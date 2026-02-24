// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFactory } from "../../../../factory/IFactory.sol";

interface IERC20 {
    struct ERC20MetadataInfo {
        string name;
        string symbol;
        string isin;
        uint8 decimals;
    }

    struct ERC20Metadata {
        ERC20MetadataInfo info;
        IFactory.SecurityType securityType;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error ZeroOwnerAddress();
    error InsufficientAllowance(address spender, address from);
    error SpenderWithZeroAddress();
    error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition);

    function initialize_ERC20(ERC20Metadata calldata erc1594Metadata) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function decimalsAt(uint256 _timestamp) external view returns (uint8);
    function getERC20Metadata() external view returns (ERC20Metadata memory);
}
