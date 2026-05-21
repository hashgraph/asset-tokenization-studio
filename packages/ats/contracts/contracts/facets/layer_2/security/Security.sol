// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { ISecurity } from "./ISecurity.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { _SECURITY_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";

/**
 * @title Security
 * @author Asset Tokenization Studio Team
 * @notice Abstract base that implements the security regulation capability declared on `ISecurity`.
 * @dev Concrete facet `SecurityFacet` registers the external selectors. Storage operations
 *      delegate to `SecurityStorageWrapper`, which holds the dedicated diamond storage slot.
 */
abstract contract Security is ISecurity, Modifiers {
    /// @inheritdoc ISecurity
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_SECURITY_RESOLVER_KEY) {
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
        InitializerStorageWrapper.setFacetToReady(_SECURITY_RESOLVER_KEY);
        emit SecurityInitialized(_regulationData, _additionalSecurityData);
    }

    /// @inheritdoc ISecurity
    function getSecurityRegulationData()
        external
        view
        virtual
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = SecurityStorageWrapper.getSecurityRegulationData();
    }
}
