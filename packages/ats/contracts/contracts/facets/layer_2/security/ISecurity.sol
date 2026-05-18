// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

/// @custom:hash resolverKey Security
bytes32 constant RESOLVER_KEY_SECURITY = 0x4a0ea8dcc902efa355c705fe7211cb0da08f05ad9fc8888237dd67a8c4dc6f1a;

/**
 * @notice DTO returned by `ISecurity.getSecurityRegulationData`.
 * @dev Public input/output shape only. Persistent on-chain layout is owned by
 *      `SecurityStorageWrapper.SecurityRegulationDataStorage` — a separate type with the
 *      same fields by coincidence, not by inheritance. The facet copies fields at the
 *      boundary.
 */
struct SecurityRegulationData {
    RegulationData regulationData;
    AdditionalSecurityData additionalSecurityData;
}

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
