// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing, RESOLVER_KEY_CLEARING } from "./IClearing.sol";
import { IClearingTypes } from "./IClearingTypes.sol";
import { ROLE_CLEARING, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";
import { ClearingReadOps } from "../../domain/orchestrator/ClearingReadOps.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Clearing
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the clearing module's global state and account-level reads.
 * @dev Implements the one-shot initializer, the activation lifecycle and the account-scoped
 *      read queries on top of `ClearingStorageWrapper` and `ClearingReadOps`. The activation
 *      toggles enforce the `onlyUnpaused` and `onlyRole(ROLE_CLEARING)` guards;
 *      `initializeClearing` is gated by `onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered`.
 *      by `ClearingFacet`.
 */
abstract contract Clearing is IClearing, Modifiers {
    /// @inheritdoc IClearing
    function initializeClearing(
        bool _activateClearing
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_CLEARING) {
        ClearingStorageWrapper.initializeClearing(_activateClearing);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CLEARING);
        emit ClearingInitialized(_activateClearing);
    }

    /// @inheritdoc IClearing
    function activateClearing()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CLEARING)
        returns (bool success_)
    {
        emit ClearingActivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(true);
    }

    /// @inheritdoc IClearing
    function deactivateClearing()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CLEARING)
        returns (bool success_)
    {
        emit ClearingDeactivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(false);
    }

    /// @inheritdoc IClearing
    function isClearingActivated() external view override returns (bool) {
        return ClearingStorageWrapper.isClearingActivated();
    }

    /// @inheritdoc IClearing
    function getClearedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return ClearingReadOps.getClearedAmountForAdjustedAt(_tokenHolder, EvmAccessors.getBlockTimestamp());
    }

    /// @inheritdoc IClearing
    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _clearingId
    ) external view override returns (address thirdParty_) {
        thirdParty_ = ClearingStorageWrapper.getClearingThirdParty(
            _partition,
            _tokenHolder,
            _clearingOperationType,
            _clearingId
        );
    }
}
