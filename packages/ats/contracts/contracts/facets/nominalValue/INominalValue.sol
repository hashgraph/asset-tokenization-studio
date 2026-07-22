// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey NominalValue
bytes32 constant RESOLVER_KEY_NOMINAL_VALUE = 0xfa54bc09a6a76763f17be0504e29b9c28edd15cdc3432c07f92c2b6962f2fbbe;

/**
 * @title INominalValue
 * @author Asset Tokenization Studio Team
 * @notice External surface for the nominal value capability: declares the per-token nominal value
 *         (amount, decimals, ISO 4217 currency code, effective datetime, and unit/total flag) and
 *         the publish/republish lifecycle keyed on `effectiveDatetime`.
 * @dev Implemented by `NominalValueFacet` via the abstract `NominalValue` writer. Events are
 *      declared here (writer interface) per the project's event-emission rule; the abstract is
 *      the sole emit site for each event. Currency uses `bytes3` to hold an ISO 4217 alphabetic
 *      code (e.g. `0x555344` for "USD"), matching the convention shared with security details.
 */
interface INominalValue {
    /**
     * @notice Emitted once when the nominal value capability is initialised on a token.
     * @dev Fires exclusively from `initializeNominalValue` after the storage write succeeds.
     * @param nominalValue The initial nominal value amount.
     * @param nominalValueDecimals The number of decimals applied to `nominalValue`.
     * @param nominalValueCurrency ISO 4217 currency code as `bytes3`; `0x000000` means "unset".
     */
    event NominalValueInitialized(uint256 nominalValue, uint256 nominalValueDecimals, bytes3 nominalValueCurrency);

    /**
     * @notice Emitted when a new nominal value is published for a new valuation period.
     * @dev Fires exclusively from `publishNominalValue`.
     * @param operator The caller authorised by `ROLE_NOMINAL_VALUE`.
     * @param nominalValue The new nominal value amount.
     * @param effectiveDatetime The new effective datetime.
     */
    event NominalValuePublished(address indexed operator, uint256 nominalValue, uint256 effectiveDatetime);

    /**
     * @notice Emitted when the nominal value for the current valuation period is corrected.
     * @dev Fires exclusively from `republishNominalValue`.
     * @param operator The caller authorised by `ROLE_NOMINAL_VALUE`.
     * @param nominalValue The corrected nominal value amount.
     * @param effectiveDatetime The (unchanged) effective datetime being corrected.
     */
    event NominalValueRepublished(address indexed operator, uint256 nominalValue, uint256 effectiveDatetime);

    /**
     * @notice Raised when `publishNominalValue` is called with an `_effectiveDatetime` that is
     *         not strictly after the currently stored one.
     * @param provided The `_effectiveDatetime` supplied by the caller.
     * @param current The currently stored `effectiveDatetime`.
     */
    error NominalValueEffectiveDatetimeNotAfterCurrent(uint256 provided, uint256 current);

    /**
     * @notice Raised when `republishNominalValue` is called with an `_effectiveDatetime` that
     *         does not exactly match the currently stored one.
     * @param provided The `_effectiveDatetime` supplied by the caller.
     * @param current The currently stored `effectiveDatetime`.
     */
    error NominalValueEffectiveDatetimeMismatch(uint256 provided, uint256 current);

    /**
     * @notice Initialises the nominal value capability with amount, decimals, currency,
     *         effective datetime, and the unit/total flag.
     * @dev Callable once per token; subsequent calls revert with `AlreadyInitialized` via the
     *      `onlyFacetNotRegistered` modifier on the implementation. The `onlyValidTimestamp`
     *      modifier reverts with `ICommonErrors.InvalidTimestamp` if `_effectiveDatetime` is
     *      zero, and the `onlyPastTimestamp` modifier reverts with `ICommonErrors.WrongTimestamp`
     *      unless `_effectiveDatetime` is strictly less than `block.timestamp`.
     * @param _nominalValue Initial nominal value amount.
     * @param _nominalValueDecimals Number of decimals applied to `_nominalValue`. Fixed for the
     *        lifetime of the token.
     * @param _nominalValueCurrency ISO 4217 currency code as `bytes3`; pass `0x000000` to leave unset.
     * @param _effectiveDatetime Timestamp as of which `_nominalValue` is effective; must be
     *        non-zero and strictly less than `block.timestamp`.
     * @param _isUnitNominalValue Whether `_nominalValue` is a per-unit (true) or aggregate
     *        (false) value.
     */
    function initializeNominalValue(
        uint256 _nominalValue,
        uint256 _nominalValueDecimals,
        bytes3 _nominalValueCurrency,
        uint256 _effectiveDatetime,
        bool _isUnitNominalValue
    ) external;

    /**
     * @notice Publishes a new nominal value for a new valuation period.
     * @dev Restricted to holders of `ROLE_NOMINAL_VALUE`. The `onlyValidPublishDatetime` modifier
     *      reverts with `NominalValueEffectiveDatetimeNotAfterCurrent` unless `_effectiveDatetime`
     *      is strictly greater than the currently stored `effectiveDatetime`, and the
     *      `onlyPastTimestamp` modifier reverts with `ICommonErrors.WrongTimestamp` unless it is
     *      also strictly less than `block.timestamp`. Triggers pending scheduled cross-ordered
     *      tasks and emits `NominalValuePublished`.
     * @param _nominalValue New nominal value amount.
     * @param _effectiveDatetime New effective datetime; must satisfy
     *        `storedEffectiveDatetime < _effectiveDatetime < block.timestamp`.
     */
    function publishNominalValue(uint256 _nominalValue, uint256 _effectiveDatetime) external;

    /**
     * @notice Corrects the nominal value already published for the current valuation period.
     * @dev Restricted to holders of `ROLE_NOMINAL_VALUE`. The `onlyValidRepublishDatetime`
     *      modifier reverts with `NominalValueEffectiveDatetimeMismatch` unless
     *      `_effectiveDatetime` exactly equals the currently stored `effectiveDatetime`. Triggers
     *      pending scheduled cross-ordered tasks and emits `NominalValueRepublished`.
     * @param _nominalValue Corrected nominal value amount.
     * @param _effectiveDatetime Effective datetime; must equal the currently stored one.
     */
    function republishNominalValue(uint256 _nominalValue, uint256 _effectiveDatetime) external;

    /**
     * @notice Returns the nominal value amount.
     * @return The current nominal value amount.
     */
    function getNominalValue() external view returns (uint256);

    /**
     * @notice Returns the decimals applied to the nominal value.
     * @return The current decimals applied to `getNominalValue`.
     */
    function getNominalValueDecimals() external view returns (uint256);

    /**
     * @notice Returns the ISO 4217 currency code attached to the nominal value.
     * @return The current ISO 4217 currency code as `bytes3`; `0x000000` means "unset".
     */
    function getNominalValueCurrency() external view returns (bytes3);

    /**
     * @notice Returns whether the nominal value is a per-unit or aggregate value.
     * @dev Set once at `initializeNominalValue` time; unchanged by publish/republish.
     * @return True when the nominal value is expressed per unit; false when aggregate.
     */
    function getIsUnitNominalValue() external view returns (bool);
}
