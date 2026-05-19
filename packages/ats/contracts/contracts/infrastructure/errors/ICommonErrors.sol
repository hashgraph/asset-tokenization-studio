// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Common Errors
 * @notice Defines shared custom errors reused by unrelated contract domains.
 * @dev Acts as the single source of truth for cross-domain errors with identical
 *      names and signatures. Domain-specific errors should remain in their own
 *      type interfaces to avoid coupling unrelated modules.
 * @author Asset Tokenization Studio Team
 */
interface ICommonErrors {
    /**
     * @notice Reverts when an expiration timestamp is invalid.
     * @dev Used for expired, past, or otherwise unacceptable expiration values.
     */
    error WrongExpirationTimestamp();

    /**
     * @notice Reverts when a signature fails verification.
     * @dev Applies to shared signature validation flows, including EIP-712 payloads
     *      and partition-based signatures.
     */
    error WrongSignature();

    /**
     * @notice Reverts when a signed payload is submitted after its deadline.
     * @dev The caller must provide and validate deadlines before accepting the
     *      signed operation.
     * @param deadline Expired deadline carried by the signed payload.
     */
    error ExpiredDeadline(uint256 deadline);

    /**
     * @notice Reverts when a signature payload has an invalid byte length.
     * @dev Used before signature recovery or verification to reject malformed input.
     */
    error WrongSignatureLength();

    /**
     * @notice Reverts when a nonce does not match the expected value for an account.
     * @dev Protects signed operations against replay and out-of-order execution.
     * @param nonce Nonce supplied by the caller or signed payload.
     * @param account Account for which the nonce validation failed.
     */
    error WrongNonce(uint256 nonce, address account);

    /**
     * @notice Reverts when an initialisation routine is invoked more than once.
     * @dev Used by contracts or facets that must be initialised exactly once.
     */
    error AlreadyInitialized();

    /**
     * @notice Reverts when an unreachable validation state is detected.
     * @dev Replaces assertions for defensive handling of logically impossible states.
     * @param _errorId Identifier of the unexpected validation condition.
     */
    error UnexpectedError(bytes4 _errorId);

    /**
     * @notice Reverts when two date values fail their required ordering constraint.
     * @dev The expected relationship between both dates is defined by the caller's
     *      validation context.
     * @param firstDate First date participating in the failed comparison.
     * @param secondDate Second date participating in the failed comparison.
     */
    error WrongDates(uint256 firstDate, uint256 secondDate);

    /**
     * @notice Reverts when a date set is invalid.
     * @dev Used when the failing date constraint does not require exposing values.
     */
    error InvalidDates();

    /**
     * @notice Reverts when a timestamp value is invalid.
     * @dev Used for shared timestamp validation that is not tied to expiration.
     */
    error InvalidTimestamp();

    /**
     * @notice Reverts when ordered array values contradict expected ordering.
     * @dev Indicates that two indexed values cannot both satisfy the required
     *      monotonic or range invariant.
     * @param lowerIndex Lower array index involved in the contradiction.
     * @param upperIndex Upper array index involved in the contradiction.
     */
    error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);

    /**
     * @notice Reverts when an operation targets or is requested by a blocked account.
     * @dev The blocking policy is enforced by the domain that performs the check.
     * @param account Account rejected by the blocking validation.
     */
    error AccountIsBlocked(address account);

    /**
     * @notice Reverts when the zero address is supplied where it is not permitted.
     * @dev Prevents invalid account, contract, or recipient references.
     */
    error ZeroAddressNotAllowed();

    /**
     * @notice Reverts when zero is supplied where a positive value is required.
     * @dev Used for shared validation of amounts, limits, factors, or identifiers.
     */
    error ZeroValueNotAllowed();

    /**
     * @notice Reverts when the difference between current decimals and new decimals exceeds the maximum value.
     * @dev Protects decimals amount difference between current and new not te be greater than maximum.
     * @param currentDecimals the current decimals amount.
     * @param newDecimals the new decimals amount.
     */
    error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals);

    /**
     * @notice Reverts when multiplying `amount` by `10 ** decimals` would exceed `uint256` max.
     * @dev Thrown by `DecimalsLib.calculateDecimalsAdjustment` when `amount > MAX_UINT256 / 10 ** decimals`.
     * @param amount The token amount that cannot be scaled up.
     * @param decimals The exponent that causes the overflow.
     */
    error GreaterThanMaxUint256(uint256 amount, uint8 decimals);
}
