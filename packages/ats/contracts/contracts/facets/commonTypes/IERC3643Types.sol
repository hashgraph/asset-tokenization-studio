// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IERC3643Types
 * @author Asset Tokenization Studio Team
 * @notice Shared events and errors for the ERC-3643 (T-REX) compliant security token
 *         standard. Imported by every facet and storage wrapper that participates in
 *         identity verification, compliance enforcement, agent management, or wallet
 *         recovery.
 */
interface IERC3643Types {
    /**
     * @notice Emitted when core token metadata is updated.
     * @param newName       New token name.
     * @param newSymbol     New token symbol.
     * @param newDecimals   New decimal precision.
     * @param newVersion    New token version string.
     * @param newOnchainID  New onchainID address associated with the token.
     */
    event UpdatedTokenInformation(
        string indexed newName,
        string indexed newSymbol,
        uint8 newDecimals,
        string newVersion,
        address indexed newOnchainID
    );

    /**
     * @notice Emitted when the identity registry contract address is updated.
     * @param identityRegistry Address of the newly wired identity registry.
     */
    event IdentityRegistryAdded(address indexed identityRegistry);

    /**
     * @notice Emitted when an agent is granted transfer-management permissions.
     * @param agent Address of the newly added agent.
     */
    event AgentAdded(address indexed agent);

    /**
     * @notice Emitted when an agent's transfer-management permissions are revoked.
     * @param agent Address of the removed agent.
     */
    event AgentRemoved(address indexed agent);

    /**
     * @notice Emitted when a lost wallet is successfully recovered to a new address.
     * @param lostWallet          Address of the wallet that was lost.
     * @param newWallet           Address of the replacement wallet.
     * @param investorOnchainID   OnchainID of the investor performing the recovery.
     */
    event RecoverySuccess(address lostWallet, address newWallet, address investorOnchainID);

    /**
     * @notice Emitted when the compliance contract address is updated.
     * @param compliance Address of the newly wired compliance contract.
     */
    event ComplianceAdded(address indexed compliance);

    /// @notice Thrown when attempting to recover a wallet that has already been recovered.
    error WalletRecovered();

    /// @notice Thrown when wallet recovery preconditions are not met (e.g. identity mismatch).
    error CannotRecoverWallet();

    /// @notice Thrown when the lengths of two input amount arrays do not match.
    error InputAmountsArrayLengthMismatch();

    /// @notice Thrown when the lengths of two input boolean arrays do not match.
    error InputBoolArrayLengthMismatch();

    /// @notice Thrown when an external call to the compliance contract reverts or returns false.
    error ComplianceCallFailed();

    /// @notice Thrown when a transfer is blocked by the compliance module.
    error ComplianceNotAllowed();

    /// @notice Thrown when an external call to the identity registry reverts or returns false.
    error IdentityRegistryCallFailed();

    /// @notice Thrown when a transfer target address has not passed identity verification.
    error AddressNotVerified();

    /**
     * @notice Thrown when an unfreeze request exceeds the address's available frozen balance.
     * @param user               Address whose frozen balance was checked.
     * @param requestedUnfreeze  Amount the caller attempted to unfreeze.
     * @param availableFrozen    Actual frozen balance available for unfreezing.
     * @param partition          Partition on which the frozen balance was checked.
     */
    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );
}
