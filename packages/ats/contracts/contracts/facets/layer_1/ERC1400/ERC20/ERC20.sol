// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "./IERC20.sol";
import { _WILD_CARD_ROLE } from "../../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../../domain/core/ERC3643StorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC20 is IERC20, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata erc20Metadata) external override {
        if (ERC20StorageWrapper._isERC20Initialized()) revert AlreadyInitialized();
        ERC20StorageWrapper._initializeERC20(erc20Metadata);
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        PauseStorageWrapper._requireNotPaused();
        ERC1594StorageWrapper._requireCompliant(msg.sender, spender, false);
        ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper._requireUnrecoveredAddress(spender);
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        return ERC20StorageWrapper._approve(msg.sender, spender, value);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanTransferFromByPartition(msg.sender, to, _DEFAULT_PARTITION, amount);
        return TokenCoreOps.transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanTransferFromByPartition(from, to, _DEFAULT_PARTITION, amount);
        return TokenCoreOps.transferFrom(msg.sender, from, to, amount);
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        PauseStorageWrapper._requireNotPaused();
        ERC1594StorageWrapper._requireCompliant(msg.sender, spender, false);
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        return ERC20StorageWrapper._increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        ERC1594StorageWrapper._requireCompliant(msg.sender, spender, false);
        return ERC20StorageWrapper._decreaseAllowance(spender, subtractedValue);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return ERC20StorageWrapper._allowanceAdjustedAt(owner, spender, _getBlockTimestamp());
    }

    function name() external view returns (string memory) {
        return ERC20StorageWrapper._getERC20Metadata().info.name;
    }

    function symbol() external view returns (string memory) {
        return ERC20StorageWrapper._getERC20Metadata().info.symbol;
    }

    function decimals() external view returns (uint8) {
        return ERC20StorageWrapper._decimalsAdjustedAt(_getBlockTimestamp());
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        return ERC20StorageWrapper._decimalsAdjustedAt(_timestamp);
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory) {
        return ERC20StorageWrapper._getERC20MetadataAdjustedAt(_getBlockTimestamp());
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper._arePartitionsProtected() &&
            !AccessControlStorageWrapper._hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
