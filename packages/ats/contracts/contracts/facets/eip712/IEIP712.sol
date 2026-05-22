// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Eip712
bytes32 constant RESOLVER_KEY_EIP712 = 0xaa031e71d3d43f715d16d62c62d7573406d29acdf4c080143dab629e08a8402f;

/**
 * @title  IEIP712
 * @notice Exposes the EIP-712 typed-data domain separator for this contract.
 * @dev    The domain separator encodes the token name, resolver-proxy version, chain ID,
 *         and diamond address. It is consumed by off-chain signers and by permit-style
 *         operations to produce typed-data hashes that are bound to this deployment.
 * @author Asset Tokenization Studio Team
 */
interface IEIP712 {
    /**
     * @notice Returns the EIP-712 domain separator for this contract.
     * @dev    Computed from the token name, resolver-proxy version, chain ID, and the
     *         diamond address. The value changes when any of those inputs change
     *         (e.g. after a chain fork or a proxy version upgrade).
     * @return domainSeparator_ The EIP-712 domain separator hash.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_);
}
