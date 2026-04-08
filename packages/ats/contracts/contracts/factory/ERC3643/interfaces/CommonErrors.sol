// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/infrastructure/errors/CommonErrors.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/**
 * @notice File-level common errors used by more than one unrelated domain.
 * @dev    Single source of truth for genuinely cross-domain errors. Domain-specific
 *         errors live in their respective `I<Domain>Types.sol` files (e.g.
 *         `IBondTypes.BondMaturityDateWrong`, `IClearingTypes.ClearingIsActivated`).
 *         Consumers import the error symbol they need by name and revert unqualified:
 *
 *             import { WrongExpirationTimestamp } from
 *                 "../../infrastructure/errors/CommonErrors.sol";
 *             ...
 *             revert WrongExpirationTimestamp();
 *
 *         Adding a new error here is only justified when the same exact symbol with
 *         the same exact signature is needed by ≥2 unrelated domains.
 */

/// @notice Thrown when an expiration timestamp is in the past or otherwise invalid.
error WrongExpirationTimestamp();

/// @notice Thrown when a function receives address(0) where a non-zero address is required.
error ZeroAddressNotAllowed();

/// @notice Thrown when an EIP-712 / partition signature fails verification.
error WrongSignature();

/// @notice Thrown when an EIP-712 signed payload is presented after its deadline.
error ExpiredDeadline(uint256 deadline);

/// @notice Thrown when an EIP-712 signature payload has an invalid byte length.
error WrongSignatureLength();

/// @notice Thrown when an EIP-712 nonce does not match the expected next nonce for the account.
error WrongNounce(uint256 nounce, address account);

/// @notice Thrown when a contract or facet initializer is invoked after it has already been initialized.
error AlreadyInitialized();
