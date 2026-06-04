// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey NominalValue
bytes32 constant RESOLVER_KEY_NOMINAL_VALUE = 0xfa54bc09a6a76763f17be0504e29b9c28edd15cdc3432c07f92c2b6962f2fbbe;

/**
 * @title INominalValue
 * @author Asset Tokenization Studio Team
 * @notice External surface for the nominal value capability: declares the per-token nominal value
 *         (amount, decimals, ISO 4217 currency code) and the events emitted when those fields are
 *         initialised or mutated.
 * @dev Implemented by `NominalValueFacet` via the abstract `NominalValue` writer. Events are
 *      declared here (writer interface) per the project's event-emission rule; the abstract is
 *      the sole emit site for each event. Currency uses `bytes3` to hold an ISO 4217 alphabetic
 *      code (e.g. `0x555344` for "USD"), matching the convention shared with security details.
 */
interface INominalValue {
    /**
     * @notice Emitted once when the nominal value capability is initialised on a token.
     * @dev Fires exclusively from `initializeNominalValue` after the storage write succeeds.
     *      Subsequent value or currency updates emit `NominalValueSet` / `NominalValueCurrencySet`
     *      instead, never this event.
     * @param nominalValue The initial nominal value amount.
     * @param nominalValueDecimals The number of decimals applied to `nominalValue`.
     * @param nominalValueCurrency ISO 4217 currency code as `bytes3`; `0x000000` means "unset".
     */
    event NominalValueInitialized(uint256 nominalValue, uint8 nominalValueDecimals, bytes3 nominalValueCurrency);

    /**
     * @notice Emitted when the nominal value amount or its decimals are updated post-initialisation.
     * @dev Fires exclusively from `setNominalValue`.
     * @param operator The caller authorised by `ROLE_NOMINAL_VALUE`.
     * @param nominalValue The new nominal value amount.
     * @param nominalValueDecimals The new decimals applied to `nominalValue`.
     */
    event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals);

    /**
     * @notice Emitted when the ISO 4217 currency code of the nominal value is updated.
     * @dev Fires exclusively from `setNominalValueCurrency`; initialisation goes through
     *      `NominalValueInitialized` instead.
     * @param operator The caller authorised by `ROLE_NOMINAL_VALUE`.
     * @param nominalValueCurrency The new ISO 4217 currency code as `bytes3`.
     */
    event NominalValueCurrencySet(address indexed operator, bytes3 nominalValueCurrency);

    /**
     * @notice Initialises the nominal value capability with amount, decimals, and currency.
     * @dev Callable once per token; subsequent calls revert with `AlreadyInitialized` via the
     *      `onlyNotNominalValueInitialized` modifier on the implementation. The factory calls this
     *      automatically when deploying security tokens, forwarding the currency from the
     *      security details so newly-deployed tokens land with the field populated.
     * @param _nominalValue Initial nominal value amount.
     * @param _nominalValueDecimals Number of decimals applied to `_nominalValue`.
     * @param _nominalValueCurrency ISO 4217 currency code as `bytes3`; pass `0x000000` to leave unset.
     */
    function initializeNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals,
        bytes3 _nominalValueCurrency
    ) external;

    /**
     * @notice Updates the nominal value amount and its decimals.
     * @dev Restricted to holders of `ROLE_NOMINAL_VALUE`.
     * @param _nominalValue New nominal value amount.
     * @param _nominalValueDecimals New decimals applied to `_nominalValue`.
     */
    function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;

    /**
     * @notice Updates the ISO 4217 currency code attached to the nominal value.
     * @dev Restricted to holders of `ROLE_NOMINAL_VALUE`. Does not touch the value/decimals;
     *      callers must update those separately via `setNominalValue` if both change.
     * @param _nominalValueCurrency New ISO 4217 currency code as `bytes3`.
     */
    function setNominalValueCurrency(bytes3 _nominalValueCurrency) external;

    /**
     * @notice Returns the nominal value amount.
     * @return The current nominal value amount.
     */
    function getNominalValue() external view returns (uint256);

    /**
     * @notice Returns the decimals applied to the nominal value.
     * @return The current decimals applied to `getNominalValue`.
     */
    function getNominalValueDecimals() external view returns (uint8);

    /**
     * @notice Returns the ISO 4217 currency code attached to the nominal value.
     * @return The current ISO 4217 currency code as `bytes3`; `0x000000` means "unset".
     */
    function getNominalValueCurrency() external view returns (bytes3);
}
