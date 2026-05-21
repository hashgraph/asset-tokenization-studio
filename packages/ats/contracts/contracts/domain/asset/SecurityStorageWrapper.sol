// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";

/// @custom:hash storage Security
bytes32 constant STORAGE_LOCATION_SECURITY = 0x45ae5065a0bedd1836ba9c199c3e3b4f02a7772289c0a233200f5a4ec7df7e00;

/**
 * @title SecurityRegulationDataStorage
 * @notice Backing storage for the security regulation configuration of an asset.
 * @dev Sole source of truth for regulation and additional security fields on this asset;
 *      mutated only via `SecurityStorageWrapper` against the deterministic ERC-7201 slot.
 * @custom:storage-location erc7201:security.token.standard.storage.Security
 */
struct SecurityRegulationDataStorage {
    // ─── R2 Single-slot scalars / aggregates ─────────────────
    RegulationData regulationData;
    AdditionalSecurityData additionalSecurityData;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title SecurityStorageWrapper - Security Regulation Storage Wrapper
 * @notice Storage wrapper for security regulation data on a security token.
 * @dev Reads and writes the dedicated storage slot defined by
 *      `STORAGE_LOCATION_SECURITY`. All functions are `internal` — the library
 *      is inlined at every call-site. External callers interact through the
 *      facet layer, never directly.
 * @author Asset Tokenization Studio Team
 */
library SecurityStorageWrapper {
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
        SecurityRegulationDataStorage storage data = securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    /**
     * @notice Reads the full security regulation data from the dedicated storage slot.
     * @return securityRegulationData_ The packed `SecurityRegulationDataStorage` value.
     */
    function getSecurityRegulationData()
        internal
        pure
        returns (SecurityRegulationDataStorage memory securityRegulationData_)
    {
        securityRegulationData_ = securityStorage();
    }

    /**
     * @notice Returns a storage pointer to the ERC-7201 namespaced
     *         `SecurityRegulationDataStorage` slot.
     * @dev Uses inline assembly to set the storage pointer to
     *      `STORAGE_LOCATION_SECURITY`. All other functions in this library
     *      must obtain their storage reference through this accessor.
     * @return securityStorage_ Storage pointer to the security regulation data slot.
     */
    function securityStorage() internal pure returns (SecurityRegulationDataStorage storage securityStorage_) {
        bytes32 position = STORAGE_LOCATION_SECURITY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
