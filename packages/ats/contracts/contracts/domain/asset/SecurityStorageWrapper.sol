// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";

/// @custom:hash storage Security
bytes32 constant STORAGE_LOCATION_SECURITY = 0x45ae5065a0bedd1836ba9c199c3e3b4f02a7772289c0a233200f5a4ec7df7e00;

/// @custom:storage-location erc7201:security.token.standard.storage.Security
struct SecurityRegulationDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    // ─── R3 Single-slot scalars / aggregates ─────────────────
    RegulationData regulationData;
    AdditionalSecurityData additionalSecurityData;

    // ─── APPEND-ONLY ZONE BELOW ───
}

library SecurityStorageWrapper {
    /**
     * @notice Initialises the security regulation storage and marks the slot as initialised.
     * @dev Sets both data fields then flips `initialized` to `true`. One-shot guarantee is
     *      enforced by the caller via `onlyNotSecurityInitialized`.
     * @param _regulationData The full regulation parameters to persist.
     * @param _additionalSecurityData The supplementary security configuration to persist.
     */
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        storeRegulationData(_regulationData, _additionalSecurityData);
        securityStorage().initialized = true;
    }

    /**
     * @notice Writes regulation and additional security data to the dedicated storage slot.
     * @dev Does not set the `initialized` flag; use `initializeSecurity` for first-write semantics.
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
     * @notice Returns whether the security regulation capability has been initialised.
     * @return `true` if `initializeSecurity` has been called at least once; `false` otherwise.
     */
    function isSecurityInitialized() internal view returns (bool) {
        return securityStorage().initialized;
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

    function securityStorage() internal pure returns (SecurityRegulationDataStorage storage securityStorage_) {
        bytes32 position = STORAGE_LOCATION_SECURITY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
