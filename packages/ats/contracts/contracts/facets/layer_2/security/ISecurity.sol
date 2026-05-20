// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

/**
 * @title ISecurity
 * @author Asset Tokenization Studio Team
 * @notice External surface for the security regulation capability: declares the regulation and
 *         additional security data that govern token transfer restrictions and investor eligibility.
 * @dev Implemented by `Security` (abstract) and exposed on-chain by `SecurityFacet`. Initialisation
 *      is one-shot and gated by `onlyNotSecurityInitialized` on the implementation.
 */
interface ISecurity {
    /**
     * @notice Aggregated view of the regulation data and supplementary security configuration
     *         stored for a token.
     * @dev Returned by `getSecurityRegulationData` as a memory copy of the two flat storage
     *      fields held in `SecurityStorageWrapper`.
     */
    struct SecurityRegulationData {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    /**
     * @notice Initialises the security regulation capability with regulation and additional data.
     * @dev Callable once per token; subsequent calls revert with `AlreadyInitialized` via the
     *      `onlyNotSecurityInitialized` modifier. The factory calls this automatically when
     *      deploying a security token, forwarding the regulation data supplied at deployment time.
     * @param _regulationData Full regulation parameters (type, sub-type, deal size, investor
     *        constraints, resale hold period).
     * @param _additionalSecurityData Supplementary data: country list type, list of countries,
     *        and a free-text info field.
     */
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;

    /**
     * @notice Returns the security regulation data stored for this token.
     * @dev Reads from the dedicated `SecurityStorageWrapper` slot. Zero-value structs are returned
     *      when the slot has never been initialised.
     * @return securityRegulationData_ The packed `SecurityRegulationData` value from storage.
     */
    function getSecurityRegulationData() external view returns (SecurityRegulationData memory securityRegulationData_);
}
