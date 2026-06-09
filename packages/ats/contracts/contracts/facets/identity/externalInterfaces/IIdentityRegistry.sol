// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IIdentityRegistry
 * @notice Minimal adapter interface for querying an external ERC-3643 identity registry.
 * @dev    Implemented by third-party ONCHAINID-compatible registries whose address is
 *         registered on the token. The token calls `isVerified` before allowing a transfer
 *         to ensure the recipient has passed KYC/AML checks.
 */
interface IIdentityRegistry {
    /**
     * @notice Returns whether `_userAddress` has a verified identity in the registry.
     * @param _userAddress Address to check.
     * @return `true` if the address is verified; `false` otherwise.
     */
    function isVerified(address _userAddress) external view returns (bool);
}
