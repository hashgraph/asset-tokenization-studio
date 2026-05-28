// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Principal
bytes32 constant RESOLVER_KEY_PRINCIPAL = 0xa3dc20804ebd6f2a06a7e8b8de31712f3d18a73b1963acfa1d25ed86907bd0e6;

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
     * @dev `principal = numerator / denominator` expressed in the bond's currency unit.
     *      The specific decomposition of numerator and denominator is an implementation
     *      detail and may change to preserve precision or overflow safety; only the ratio
     *      is part of the public contract. Callers should never assume that `denominator`
     *      matches any particular power of ten.
     */
    struct PrincipalFor {
        /// @dev Numerator of the principal fraction.
        uint256 numerator;
        /// @dev Denominator of the principal fraction; non-zero when balance > 0.
        uint256 denominator;
    }

    /**
     * @notice Emitted once when the principal capability is initialised on a token.
     * @dev Fires exclusively from `initializePrincipal`.
     */
    event PrincipalInitialized();

    /**
     * @notice Initialises the principal capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializePrincipal() external;

    /**
     * @notice Returns the principal numerator and denominator for a given account.
     * @param _account The address of the token holder.
     * @return principalFor_ Struct containing the numerator and denominator of the principal.
     */
    function getPrincipalFor(address _account) external view returns (PrincipalFor memory principalFor_);
}
