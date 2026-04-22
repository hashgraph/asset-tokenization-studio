// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Common Errors
 * @notice Shared error definitions used by more than one unrelated domain.
 * @dev Single source of truth for genuinely cross-domain errors. Domain-specific
 *      errors live in their respective `I<Domain>Types.sol` files (e.g.
 *      `IBondTypes.BondMaturityDateWrong`, `IClearingTypes.ClearingIsActivated`).
 *      Consumers import the error symbol they need by name and revert unqualified:
 *
 *          import { WrongExpirationTimestamp } from
 *              "../../infrastructure/errors/ICommonErrors.sol";
 *          ...
 *          revert WrongExpirationTimestamp();
 *
 *      Adding a new error here is only justified when the same exact symbol with
 *      the same exact signature is needed by ≥2 unrelated domains.
 * @author io.builders
 */
interface ICommonErrors {
    /// @notice Thrown when an expiration timestamp is in the past or otherwise invalid.
    error WrongExpirationTimestamp();

    /// @notice Thrown when an EIP-712 / partition signature fails verification.
    error WrongSignature();

    /// @notice Thrown when an EIP-712 signed payload is presented after its deadline.
    /// @param deadline The deadline timestamp that was exceeded.
    error ExpiredDeadline(uint256 deadline);

    /// @notice Thrown when an EIP-712 signature payload has an invalid byte length.
    error WrongSignatureLength();

    /// @notice Thrown when an EIP-712 nonce does not match the expected next nonce for the account.
    /// @param nonce   The nonce value presented in the signed payload.
    /// @param account The account whose nonce was checked.
    error WrongNonce(uint256 nonce, address account);

    /// @notice Thrown when a contract or facet initialiser is invoked after it has already been initialised.
    error AlreadyInitialized();

    /// @notice Thrown when an impossible validation state is detected (defensive programming).
    /// @dev Used to replace assert statements for logically impossible conditions.
    /// @param _errorId A short identifier encoding the specific assertion that failed.
    error UnexpectedError(bytes4 _errorId);

    /// @notice Thrown when two dates are provided in an invalid order or combination.
    /// @param firstDate  The first date in the pair that failed validation.
    /// @param secondDate The second date in the pair that failed validation.
    error WrongDates(uint256 firstDate, uint256 secondDate);

    /// @notice Thrown when one or more dates fail a domain-level validity constraint.
    error InvalidDates();

    /// @notice Thrown when a timestamp fails a domain-level validity constraint.
    error InvalidTimestamp();

    /// @notice Thrown when a provided timestamp is not strictly in the future.
    /// @param timeStamp The invalid timestamp that triggered the revert.
    error WrongTimestamp(uint256 timeStamp);

    /// @notice Thrown when two entries in an array are contradictory or mutually exclusive.
    /// @param lowerIndex  Index of the first contradictory element.
    /// @param upperIndex  Index of the second contradictory element.
    error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);

    /// @notice Thrown when an operation is attempted on a blocked account.
    /// @param account The address that is blocked.
    error AccountIsBlocked(address account);

    /// @notice Thrown when the zero address is supplied where a valid address is required.
    error ZeroAddressNotAllowed();
}
