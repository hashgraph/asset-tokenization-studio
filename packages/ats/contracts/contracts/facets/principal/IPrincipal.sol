// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IPrincipal
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing principal queries for bond tokens, providing the numerator and
 *         denominator required to compute a token holder's principal value.
 * @dev Read-only interface whose single function delegates to `BondStorageWrapper`.
 */
interface IPrincipal {
    /**
     * @notice Encodes a principal value as a fraction.
     * @dev `principal = (numerator / denominator)` expressed in the bond's currency unit.
     *      `denominator` equals `10 ** (nominalValueDecimals + tokenDecimals)` and is constant
     *      for a given bond configuration, so callers may cache it.
     */
    struct PrincipalFor {
        /// @dev Token-holder balance multiplied by the bond's nominal value.
        uint256 numerator;
        /// @dev Scale factor: `10 ** (nominalValueDecimals + tokenDecimals)`.
        uint256 denominator;
    }

    /**
     * @notice Returns the principal numerator and denominator for a given account.
     * @param _account The address of the token holder.
     * @return principalFor_ Struct containing the numerator and denominator of the principal.
     */
    function getPrincipalFor(address _account) external view returns (PrincipalFor memory principalFor_);
}
