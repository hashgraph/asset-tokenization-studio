// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../layer_0/Internals.sol";
import { IERC20 } from "../../interfaces/ERC1400/IERC20.sol";
import { _DEFAULT_PARTITION } from "../../../layer_0/constants/values.sol";

abstract contract ERC20 is IERC20, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(
        ERC20Metadata calldata erc20Metadata
    ) external override onlyUninitialized(_isERC20Initialized()) {
        _initialize_ERC20(erc20Metadata);
    }

    function approve(
        address spender,
        uint256 value
    )
        external
        override
        onlyUnpaused
        onlyCompliant(_msgSender(), spender, false)
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(spender)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _approve(_msgSender(), spender, value);
    }

    function transfer(
        address to,
        uint256 amount
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_msgSender(), to, _DEFAULT_PARTITION, amount, "", "")
        returns (bool)
    {
        return _transfer(_msgSender(), to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(from, to, _DEFAULT_PARTITION, amount, "", "")
        returns (bool)
    {
        return _transferFrom(_msgSender(), from, to, amount);
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external onlyUnpaused onlyCompliant(_msgSender(), spender, false) onlyWithoutMultiPartition returns (bool) {
        return _increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external onlyUnpaused onlyWithoutMultiPartition onlyCompliant(_msgSender(), spender, false) returns (bool) {
        return _decreaseAllowance(spender, subtractedValue);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowanceAdjusted(owner, spender);
    }

    function name() external view returns (string memory) {
        return _getERC20Metadata().info.name;
    }

    function symbol() external view returns (string memory) {
        return _getERC20Metadata().info.symbol;
    }

    function decimals() external view returns (uint8) {
        return _decimalsAdjusted();
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        return _decimalsAdjustedAt(_timestamp);
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory) {
        return _getERC20MetadataAdjusted();
    }
}
