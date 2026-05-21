// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";
import { _SECURITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISecurity } from "../../facets/layer_2/security/ISecurity.sol";

/// @title SecurityStorageWrapper
/// @notice Library for managing security regulation storage operations on a security token.
/// @author Asset Tokenization Studio Team
library SecurityStorageWrapper {
    /**
     * @notice Packed storage layout for security regulation state.
     * @dev Stored at `_SECURITY_STORAGE_POSITION` via inline assembly.
     */
    struct SecurityDataStorage {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    /**
     * @notice Initializes the security.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _regulationData The full regulation parameters to persist.
     * @param _additionalSecurityData The supplementary security configuration to persist.
     */
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        storeRegulationData(_regulationData, _additionalSecurityData);
    }

    /**
     * @notice Writes regulation and additional security data to the dedicated storage slot.
     * @param _regulationData The regulation parameters to persist.
     * @param _additionalSecurityData The supplementary security configuration to persist.
     */
    function storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        SecurityDataStorage storage data = securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    /**
     * @notice Reads the full security regulation data from the dedicated storage slot.
     * @return securityRegulationData_ The packed `ISecurity.SecurityRegulationData` value.
     */
    function getSecurityRegulationData()
        internal
        view
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        SecurityDataStorage storage data = securityStorage();
        securityRegulationData_.regulationData = data.regulationData;
        securityRegulationData_.additionalSecurityData = data.additionalSecurityData;
    }

    function securityStorage() internal pure returns (SecurityDataStorage storage securityStorage_) {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
