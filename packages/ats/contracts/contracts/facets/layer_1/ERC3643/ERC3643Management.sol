// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "./IERC3643Management.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { _ERC3643_MANAGEMENT_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ERC3643 Management
 * @notice Initialises ERC-3643 compliance and identity registry dependencies for an asset.
 * @dev Implements `IERC3643Management` in a facet-based architecture. Initialisation is
 *      restricted to operational deployments, requires `DEFAULT_ADMIN_ROLE`, and can only be
 *      performed once for the ERC-3643 management resolver key.
 * @author Asset Tokenization Studio Team
 */
abstract contract ERC3643Management is IERC3643Management, Modifiers {
    /// @inheritdoc IERC3643Management
    /// @dev Stores the compliance and identity registry contracts, marks this facet as ready,
    ///      and emits `ERC3643Initialized`.
    function initializeERC3643(
        address _compliance,
        address _identityRegistry
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_ERC3643_MANAGEMENT_RESOLVER_KEY) {
        ERC3643StorageWrapper.initializeERC3643(_compliance, _identityRegistry);
        InitializerStorageWrapper.setFacetToReady(_ERC3643_MANAGEMENT_RESOLVER_KEY);
        emit IERC3643Management.ERC3643Initialized(_compliance, _identityRegistry);
    }
}
