// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";
import { _SECURITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISecurity } from "../../facets/layer_2/security/ISecurity.sol";

/**
 * @title Security Storage Wrapper
 * @notice Provides secure access and management of security regulation data within a decentralised storage slot
 * @dev Utilises inline assembly for efficient access to a singleton storage pattern via a predefined storage position
 * @author Hashgraph
 */
library SecurityStorageWrapper {
    /**
     * @notice Initialises and stores security regulation data
     * @dev Delegates to `storeRegulationData` to persist the provided regulation and additional data
     * @param _regulationData The core regulation data to store
     * @param _additionalSecurityData Additional security-specific metadata to store
     */
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        storeRegulationData(_regulationData, _additionalSecurityData);
    }

    /**
     * @notice Persists regulation and additional security data into storage
     * @dev Writes both `_regulationData` and `_additionalSecurityData` to the singleton storage location
     * @param _regulationData The core regulation data to store
     * @param _additionalSecurityData Additional security-specific metadata to store
     */
    function storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        ISecurity.SecurityRegulationData storage data = securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    /**
     * @notice Retrieves the current security regulation data from storage
     * @dev Accesses the singleton storage location to read the full regulation data structure
     * @return securityRegulationData_ The retrieved security regulation data
     */
    function getSecurityRegulationData()
        internal
        pure
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = securityStorage();
    }

    /**
     * @notice Returns a reference to the singleton storage slot for security regulation data
     * @dev Uses inline assembly to load the storage reference at a predefined position
     * @return securityStorage_ A storage reference to the security regulation data
     */
    function securityStorage() private pure returns (ISecurity.SecurityRegulationData storage securityStorage_) {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
