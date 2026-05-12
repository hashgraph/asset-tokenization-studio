// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "./IERC3643Management.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { _ERC3643_MANAGEMENT_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

abstract contract ERC3643Management is IERC3643Management, Modifiers {
    function initializeERC3643(
        address _compliance,
        address _identityRegistry
    ) external onlyFacetNotRegistered(_ERC3643_MANAGEMENT_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
        ERC3643StorageWrapper.initialize_ERC3643(_compliance, _identityRegistry);
        InitializerStorageWrapper.setFacetToReady(_ERC3643_MANAGEMENT_RESOLVER_KEY);
    }

    /// @inheritdoc IERC3643Management
    function reinitializeERC3643(
        uint256[] calldata fromVersions
    )
        external
        override
        onlyFacetRegistered(_ERC3643_MANAGEMENT_RESOLVER_KEY, fromVersions)
        onlyFacetNotReady(_ERC3643_MANAGEMENT_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_ERC3643_MANAGEMENT_RESOLVER_KEY);
    }
}
