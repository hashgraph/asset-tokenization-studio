// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore } from "./ICore.sol";
import { TREX_OWNER_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title Core
 * @notice Implementation of the Core domain. Delegates into the existing storage wrappers so
 *         semantics match `ERC20` / `ERC3643Management` / `ERC3643Read` exactly during the
 *         transition period.
 */
abstract contract Core is ICore, Modifiers {
    /// @inheritdoc ICore
    function initializeCore(ICore.ERC20Metadata calldata metadata) external override onlyNotERC20Initialized {
        ERC20StorageWrapper.initializeERC20(metadata);
    }

    /// @inheritdoc ICore
    function setName(string calldata _name) external override onlyUnpaused onlyRole(TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setName(_name);
    }

    /// @inheritdoc ICore
    function setSymbol(string calldata _symbol) external override onlyUnpaused onlyRole(TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setSymbol(_symbol);
    }

    /// @inheritdoc ICore
    function decimals() external view override returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /// @inheritdoc ICore
    function name() external view override returns (string memory) {
        return ERC20StorageWrapper.getERC20Metadata().info.name;
    }

    /// @inheritdoc ICore
    function symbol() external view override returns (string memory) {
        return ERC20StorageWrapper.getERC20Metadata().info.symbol;
    }

    /// @inheritdoc ICore
    function getERC20Metadata() external view override returns (ICore.ERC20Metadata memory) {
        return ERC20StorageWrapper.getERC20MetadataAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /// @inheritdoc ICore
    function version() external view override returns (string memory) {
        return ERC3643StorageWrapper.version();
    }
}
