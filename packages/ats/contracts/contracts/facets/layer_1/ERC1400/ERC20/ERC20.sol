// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "./IERC20.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC20 is IERC20, TimestampProvider, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata erc20Metadata) external override onlyNotERC20Initialized {
        ERC20StorageWrapper.initializeERC20(erc20Metadata);
    }

    function approve(
        address spender,
        uint256 value
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(spender)
        onlyWithoutMultiPartition
        onlyCompliant(msg.sender, spender, false)
        returns (bool)
    {
        return ERC20StorageWrapper.approve(msg.sender, spender, value);
    }

    function transfer(
        address to,
        uint256 amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(msg.sender, to, _DEFAULT_PARTITION, amount)
        returns (bool)
    {
        return TokenCoreOps.transfer(msg.sender, to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(from, to, _DEFAULT_PARTITION, amount)
        returns (bool)
    {
        return TokenCoreOps.transferFrom(msg.sender, from, to, amount);
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external onlyUnpaused onlyWithoutMultiPartition onlyCompliant(msg.sender, spender, false) returns (bool) {
        return ERC20StorageWrapper.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external onlyUnpaused onlyWithoutMultiPartition onlyCompliant(msg.sender, spender, false) returns (bool) {
        return ERC20StorageWrapper.decreaseAllowance(spender, subtractedValue);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return ERC20StorageWrapper.allowanceAdjustedAt(owner, spender, _getBlockTimestamp());
    }

    function name() external view returns (string memory) {
        return ERC20StorageWrapper.getERC20Metadata().info.name;
    }

    function symbol() external view returns (string memory) {
        return ERC20StorageWrapper.getERC20Metadata().info.symbol;
    }

    function decimals() external view returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(_getBlockTimestamp());
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(_timestamp);
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory) {
        return ERC20StorageWrapper.getERC20MetadataAdjustedAt(_getBlockTimestamp());
    }
}
