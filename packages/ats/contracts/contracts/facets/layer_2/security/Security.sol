// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurity, SecurityRegulationData } from "./ISecurity.sol";
import {
    SecurityStorageWrapper,
    SecurityRegulationDataStorage
} from "../../../domain/asset/SecurityStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

/**
 * @title Security
 * @author Asset Tokenization Studio Team
 * @notice Abstract base that implements the security regulation capability declared on `ISecurity`.
 * @dev Concrete facet `SecurityFacet` registers the external selectors. Storage operations
 *      delegate to `SecurityStorageWrapper`, which holds the dedicated diamond storage slot.
 *      Performs a boundary copy from `SecurityRegulationDataStorage` (storage shape) into
 *      the DTO `SecurityRegulationData` declared on `ISecurity` so the public ABI never
 *      depends on storage-layout types.
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
    /// @dev Reads `SecurityStorageWrapper.getSecurityRegulationData()` and rebuilds the
    ///      public DTO field-by-field; declared `pure` because the wrapper helper resolves
    ///      its storage pointer via inline assembly that Solidity cannot flag as a read.
    function getSecurityRegulationData()
        external
        view
        virtual
        returns (SecurityRegulationData memory securityRegulationData_)
    {
        SecurityRegulationDataStorage memory stored = SecurityStorageWrapper.getSecurityRegulationData();
        securityRegulationData_ = SecurityRegulationData({
            regulationData: stored.regulationData,
            additionalSecurityData: stored.additionalSecurityData
        });
    }
}
