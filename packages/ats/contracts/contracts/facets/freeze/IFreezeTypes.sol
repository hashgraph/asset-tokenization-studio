// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IFreezeTypes
 * @author Asset Tokenization Studio Team
 * @notice Freeze domain events shared across the freeze facets.
 * @dev Holds the `TokensFrozen`, `TokensUnfrozen` and `AddressFrozen` events, emitted from
 *      both `Freeze` (single operations) and `BatchFreeze` (batch operations), so consumers
 *      can monitor every freeze change through a single topic. `IFreeze` inherits this
 *      interface; `BatchFreeze` imports it directly to reach the events without depending on
 *      the full `IFreeze` API.
 */
interface IFreezeTypes {
    /**
     * @notice Emitted when a specific amount of tokens is frozen for a wallet.
     * @param account The wallet address whose tokens were frozen.
     * @param amount The amount of tokens frozen.
     * @param partition The partition from which tokens were frozen.
     */
    event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     * @notice Emitted when a specific amount of previously frozen tokens is unfrozen for a
     *         wallet.
     * @param account The wallet address whose tokens were unfrozen.
     * @param amount The amount of tokens unfrozen.
     * @param partition The partition to which tokens were restored.
     */
    event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     * @notice Emitted when a wallet's address-level frozen status changes.
     * @param userAddress The wallet address whose freeze status was updated.
     * @param isFrozen The new freeze status; `true` means frozen, `false` means unfrozen.
     * @param owner Address of the agent who triggered the status change.
     */
    event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);
}
