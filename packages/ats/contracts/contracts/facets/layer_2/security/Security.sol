// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { ISecurity } from "./ISecurity.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

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
    ) external override onlyNotSecurityInitialized {
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
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
