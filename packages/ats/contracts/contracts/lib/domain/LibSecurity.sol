// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "./LibRegulation.sol";
import { _SECURITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISecurity } from "../../facets/regulation/interfaces/ISecurity.sol";

/// @title LibSecurity
/// @notice Leaf library for security regulation storage management
/// @dev Extracted from SecurityStorageWrapper for library-based diamond migration
library LibSecurity {
    /// @notice Initializes security regulation data
    /// @param _regulationData The regulation data to store
    /// @param _additionalSecurityData Additional security-specific data
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        storeRegulationData(_regulationData, _additionalSecurityData);
    }

    /// @notice Stores regulation data in storage
    /// @param _regulationData The regulation data to store
    /// @param _additionalSecurityData Additional security-specific data
    function storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        ISecurity.SecurityRegulationData storage data = securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    /// @notice Gets the security regulation data
    /// @return securityRegulationData_ The stored security regulation data
    function getSecurityRegulationData()
        internal
        pure
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = securityStorage();
    }

    /// @notice Gets the security storage pointer
    /// @return securityStorage_ The security storage reference
    function securityStorage() internal pure returns (ISecurity.SecurityRegulationData storage securityStorage_) {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
