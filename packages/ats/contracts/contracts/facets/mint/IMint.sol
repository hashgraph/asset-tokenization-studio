// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IMint
 * @author Asset Tokenization Studio Team
 * @notice Interface aggregating the token issuance entry points of the ATS Diamond.
 * @dev Consolidates the ERC-1594 `issue`/`isIssuable` pair and the ERC-3643 `mint` operation in a
 *      single facet. Both write operations require the caller to hold either the issuer or agent
 *      role, honour max-supply and compliance checks, and emit the `Issued` event from
 *      `IERC1594`.
 */
interface IMint {
    /**
     * @notice Emitted when new tokens are issued to a holder.
     * @param _operator Account that invoked the issuance (issuer or agent).
     * @param _to Recipient of the newly issued tokens.
     * @param _value Amount of tokens issued, denominated in base units.
     * @param _data Arbitrary payload forwarded alongside the issuance.
     */
    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);

    /**
     * @notice Issues new tokens to a token holder under the ERC-1594 semantics.
     * @dev Restricted to issuer or agent roles. Increases the total supply and emits
     *      `IERC1594.Issued`. Only callable in single-partition mode and when the token is
     *      unpaused; the destination must pass identity and compliance checks.
     * @param _tokenHolder Recipient of the newly issued tokens.
     * @param _value Amount of tokens to issue, denominated in base units.
     * @param _data Arbitrary data forwarded alongside the issuance for off-chain consumers.
     */
    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;

    /**
     * @notice Mints new tokens to a recipient under the ERC-3643 semantics.
     * @dev Behaves as a thin alias over `issue` with an empty `data` payload. Restricted to issuer
     *      or agent roles and subject to the same pause, supply, identity and compliance
     *      constraints. Emits `IERC1594.Issued`.
     * @param _to Recipient of the newly minted tokens.
     * @param _amount Amount of tokens to mint, denominated in base units.
     */
    function mint(address _to, uint256 _amount) external;

    /**
     * @notice Returns whether further issuance is permitted for this security.
     * @dev Once a token returns `false` it must never return `true` again. Implementations read
     *      the issuance flag maintained by `ERC1594StorageWrapper`.
     * @return issuable_ True while new tokens may still be issued or minted.
     */
    function isIssuable() external view returns (bool issuable_);
}
