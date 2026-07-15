// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NominalValueStorageWrapper } from "../../domain/asset/NominalValueStorageWrapper.sol";
import { INominalValue } from "../../facets/nominalValue/INominalValue.sol";

/**
 * @title NominalValueModifiers
 * @dev Abstract contract providing nominal-value effective-datetime validation modifiers
 *
 * This contract wraps NominalValueStorageWrapper storage reads into modifiers
 * for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to nominal-value validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract NominalValueModifiers {
    /**
     * @dev Modifier that validates the effective datetime supplied to `publishNominalValue`
     *
     * Requirements:
     * - `_effectiveDatetime` must be strictly greater than the currently stored
     *   `effectiveDatetime`
     *
     * @param _effectiveDatetime The effective datetime to validate
     */
    modifier onlyValidPublishDatetime(uint256 _effectiveDatetime) {
        uint256 stored = NominalValueStorageWrapper.getEffectiveDatetime();
        if (_effectiveDatetime <= stored) {
            revert INominalValue.NominalValueEffectiveDatetimeNotAfterCurrent(_effectiveDatetime, stored);
        }
        _;
    }

    /**
     * @dev Modifier that validates the effective datetime supplied to `republishNominalValue`
     *
     * Requirements:
     * - `_effectiveDatetime` must exactly equal the currently stored `effectiveDatetime`
     *
     * @param _effectiveDatetime The effective datetime to validate
     */
    modifier onlyValidRepublishDatetime(uint256 _effectiveDatetime) {
        uint256 stored = NominalValueStorageWrapper.getEffectiveDatetime();
        if (_effectiveDatetime != stored) {
            revert INominalValue.NominalValueEffectiveDatetimeMismatch(_effectiveDatetime, stored);
        }
        _;
    }
}
