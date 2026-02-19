// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { ERC20PermitStorage, erc20PermitStorage } from "../../storage/TokenStorage.sol";
import { getDomainHash } from "../core/ERC712.sol";

/// @title LibERC20Permit
/// @notice Library for ERC20 Permit (EIP-2612) storage management
/// @dev Extracts ERC20 Permit storage operations for domain separator computation
/// and permit validation helpers. Nonce storage is managed separately via NonceStorageWrapper.
/// Actual EIP-712 signature validation and ECDSA recovery remain in facets.
library LibERC20Permit {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initializes ERC20 Permit storage
    /// @dev Current ERC20PermitStorage only contains deprecated fields from previous versions.
    ///      Modern permit functionality is stateless on the ERC20Permit side:
    ///      - Nonce storage: Managed by NonceStorageWrapper
    ///      - Domain separator: Computed on-demand via getDomainSeparator()
    ///      No state initialization required.
    // solhint-disable-next-line no-empty-blocks
    function initialize() internal pure {
        // ERC20PermitStorage only has deprecated fields (DEPRECATED_contractName, etc.)
        // Modern permit functionality doesn't require initialization
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STORAGE ACCESSOR
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Check if ERC20 Permit storage has been initialized (deprecated)
    /// @return True if the deprecated initialization flag was set
    function isInitialized() internal view returns (bool) {
        return erc20PermitStorage().DEPRECATED_initialized;
    }

    /// @notice Get the ERC20 Permit storage
    /// @return The ERC20 Permit storage struct
    function getStorage() internal pure returns (ERC20PermitStorage storage) {
        return erc20PermitStorage();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DOMAIN SEPARATOR MANAGEMENT (EIP-712)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Computes the EIP-712 domain separator for permit signature validation
    /// @dev The domain separator prevents signature replay attacks across different chains
    ///      or contract instances. It changes when the contract address or chain ID changes.
    ///      This is a pure computation requiring no storage access.
    /// @param contractName The contract name (used in EIP-712 domain)
    /// @param contractVersion The contract version (used in EIP-712 domain)
    /// @param chainId The blockchain's chain ID
    /// @param contractAddress The address of this contract
    /// @return The computed EIP-712 domain separator hash
    function getDomainSeparator(
        string memory contractName,
        string memory contractVersion,
        uint256 chainId,
        address contractAddress
    ) internal pure returns (bytes32) {
        return getDomainHash(contractName, contractVersion, chainId, contractAddress);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PERMIT VALIDATION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Validates that a permit deadline has not passed
    /// @dev Permits become invalid when block.timestamp > deadline.
    ///      Always check deadlines before signature verification to save gas.
    /// @param deadline The permit deadline timestamp (block.timestamp after which permit is invalid)
    /// @return True if the deadline has not passed and permit is still valid
    function isDeadlineValid(uint256 deadline) internal view returns (bool) {
        return deadline >= block.timestamp;
    }

    /// @notice Gets the current block timestamp
    /// @return The current block.timestamp
    function blockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // NONCE MANAGEMENT (Documentation and Semantics)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Documentation: ERC20 Permit nonce usage
    /// @dev IMPORTANT: Nonce storage is NOT managed by LibERC20Permit.
    ///      Instead, nonces are stored in NonceStorageWrapper's separate storage slot.
    ///
    ///      Permit flow:
    ///      1. User signs permit(owner, spender, value, deadline, nonce, signature)
    ///      2. Facet calls _getNonceFor(owner) to get current nonce for signature validation
    ///      3. After signature verification succeeds, nonce is incremented via _setNonceFor()
    ///      4. Prevents replay: same signature becomes invalid after nonce increment
    ///
    ///      Facet implementations should use parent contract methods:
    ///      - _getNonceFor(address owner) - Get current nonce
    ///      - _setNonceFor(uint256 newNonce, address owner) - Set nonce (from NonceStorageWrapper)
    ///
    ///      External interface:
    ///      - nonces(address owner) external view - Public accessor from Nonces facet
    // solhint-disable-next-line no-empty-blocks
    function nonceDocumentation() internal pure {
        // This function documents the nonce architecture
    }
}
