// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "./IERC20.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC20 is IERC20, Modifiers {
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
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(spender)
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return ERC20StorageWrapper.approve(EvmAccessors.getMsgSender(), spender, value);
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
        onlyCanTransferFromByPartition(EvmAccessors.getMsgSender(), to, _DEFAULT_PARTITION, amount)
        returns (bool)
    {
        return TokenCoreOps.transfer(EvmAccessors.getMsgSender(), to, amount);
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
        return TokenCoreOps.transferFrom(EvmAccessors.getMsgSender(), from, to, amount);
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        external
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return ERC20StorageWrapper.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
        external
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return ERC20StorageWrapper.decreaseAllowance(spender, subtractedValue);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return ERC20StorageWrapper.allowanceAdjustedAt(owner, spender, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(_timestamp);
    }
}
