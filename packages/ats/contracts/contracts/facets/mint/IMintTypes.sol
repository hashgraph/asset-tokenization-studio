// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IMintTypes
 * @author Asset Tokenization Studio Team
 * @notice Issuance domain events shared across the mint facets.
 * @dev Holds the `Issued` event, emitted from both `Mint` (`issue`/`mint`) and `BatchMint`
 *      (`batchMint`), so consumers can monitor every issuance through a single topic. `IMint`
 *      inherits this interface; `BatchMint` imports it directly to reach the event without
 *      depending on the full `IMint` API.
 */
interface IMintTypes {
    /**
     * @notice Emitted when new tokens are issued to a holder.
     * @param operator Account that invoked the issuance (issuer or agent).
     * @param to Recipient of the newly issued tokens.
     * @param value Amount of tokens issued, denominated in base units.
     * @param data Arbitrary payload forwarded alongside the issuance.
     */
    event Issued(address indexed operator, address indexed to, uint256 value, bytes data);

    /**
     * @notice Emitted when token issuance is disabled.
     * @param operator Account that disabled issuance.
     */
    event IssuanceDisabled(address indexed operator);

    /**
     * @notice Emitted when token issuance is finalized.
     * @param operator Account that finalized issuance.
     */
    event IssuanceFinalized(address indexed operator);

    /**
     * @notice Thrown when an issuance operation is attempted after issuance has been permanently disabled.
     */
    error IssuanceIsDisabled();
}
