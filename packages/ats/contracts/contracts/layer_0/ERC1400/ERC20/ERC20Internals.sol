// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsInternals } from "../../core/protectedPartitions/ProtectedPartitionsInternals.sol";
import { IERC20 } from "../../../layer_1/interfaces/ERC1400/IERC20.sol";

abstract contract ERC20Internals is ProtectedPartitionsInternals {
    function _approve(address owner, address spender, uint256 value) internal virtual returns (bool);
    function _beforeAllowanceUpdate(address _owner, address _spender) internal virtual;
    function _burn(address from, uint256 value) internal virtual;
    function _burnFrom(address account, uint256 value) internal virtual;
    function _decreaseAllowance(address spender, uint256 subtractedValue) internal virtual returns (bool);
    function _decreaseAllowedBalance(address from, address spender, uint256 value) internal virtual;
    function _increaseAllowance(address spender, uint256 addedValue) internal virtual returns (bool);
    function _increaseAllowedBalance(address from, address spender, uint256 value) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal virtual;
    function _mint(address to, uint256 value) internal virtual;
    function _setName(string calldata _name) internal virtual;
    function _setOnchainID(address _onchainID) internal virtual;
    function _setSymbol(string calldata _symbol) internal virtual;
    function _transfer(address from, address to, uint256 value) internal virtual returns (bool);
    function _transferFrom(address spender, address from, address to, uint256 value) internal virtual returns (bool);
    function _allowance(address _owner, address _spender) internal view virtual returns (uint256);
    function _decimals() internal view virtual returns (uint8);
    function _getERC20Metadata() internal view virtual returns (IERC20.ERC20Metadata memory erc20Metadata_);
    function _getERC20MetadataAdjustedAt(
        uint256 _timestamp
    ) internal view virtual returns (IERC20.ERC20Metadata memory erc20Metadata_);
    function _getName() internal view virtual returns (string memory);
    function _getOnchainID() internal view virtual returns (address);
    function _isERC20Initialized() internal view virtual returns (bool);
}
