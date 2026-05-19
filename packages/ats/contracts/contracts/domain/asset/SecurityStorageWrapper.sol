// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";
import { ISecurity } from "../../facets/layer_2/security/ISecurity.sol";

/// @custom:hash storage Security
bytes32 constant STORAGE_LOCATION_SECURITY = 0x45ae5065a0bedd1836ba9c199c3e3b4f02a7772289c0a233200f5a4ec7df7e00;

library SecurityStorageWrapper {
    /**
     * @notice Packed storage layout for security regulation state.
     * @dev Stored at `STORAGE_LOCATION_SECURITY` via inline assembly. `initialized` must be
     *      checked before trusting the regulation fields, as uninitialised storage is
     *      indistinguishable from zero-value structs without this guard.
     */
    struct SecurityDataStorage {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
        bool initialized;
    }

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
        SecurityDataStorage storage data = securityStorage();
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
        bytes32 position = STORAGE_LOCATION_SECURITY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
