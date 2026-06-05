// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "../commonTypes/IERC3643Types.sol";

/// @custom:hash resolverKey Recovery
bytes32 constant RESOLVER_KEY_RECOVERY = 0x087cb866f812745e77608e4eb4b359ae96b8a0ba2ef9fe8336488e479b72d92a;

/// @title IRecovery
/// @author Asset Tokenization Studio Team
/// @notice Interface for the Recovery facet, exposing lost-wallet recovery and recovery-status reads.

interface IRecovery is IERC3643Types {
    /**
     * @notice Emitted once when the recovery capability is initialised on a token.
     * @dev Fires exclusively from `initializeRecovery`.
     */
    event RecoveryInitialized();

    /**
     * @notice Initialises the recovery capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeRecovery() external;

    /// @notice Transfers the token balance and frozen amounts of a lost wallet to a new wallet,
    ///         marking the lost wallet as recovered.
    /// @dev Caller must hold `ROLE_AGENT`. The lost wallet must not have already been recovered,
    ///      must carry no pending locks, holds, or clearings, and the token must be single-partition.
    ///      Emits {RecoverySuccess} on success.
    /// @param _lostWallet Address of the wallet that was lost.
    /// @param _newWallet Address of the replacement wallet that will receive the balances.
    /// @param _investorOnchainID On-chain identity address of the investor (may be zero address).
    /// @return success_ `true` when the recovery completes successfully.
    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool success_);

    /// @notice Returns whether a wallet address has been marked as recovered.
    /// @param _wallet Address to query.
    /// @return `true` if the address has previously been recovered via {recoveryAddress}.
    function isAddressRecovered(address _wallet) external view returns (bool);
}
