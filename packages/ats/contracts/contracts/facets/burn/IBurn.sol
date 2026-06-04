// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Burn
bytes32 constant RESOLVER_KEY_BURN = 0xa9ec330b49ea310aaeba8dae3ba4f2a0b94fd35fafb9d8d8afbb804b73d50ce2;

/**
 * @title IBurn
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing the ERC-1594 redemption and ERC-3643 burn surfaces of the
 *         ATS Diamond. Covers controller/agent-initiated burns, self-redemption, and
 *         operator-initiated redemption on behalf of a token holder.
 */
interface IBurn {
    /**
     * @notice Emitted once when the burn capability is initialised on a token.
     * @dev Fires exclusively from `initializeBurn`.
     */
    event BurnInitialized();

    /**
     * @notice Emitted when tokens are redeemed from a holder's balance.
     * @param _operator Account that executed the redemption.
     * @param _from Address from which tokens were burnt.
     * @param _value Amount of tokens redeemed, denominated in base units.
     * @param _data Arbitrary payload forwarded alongside the redemption.
     */
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);

    /**
     * @notice Initialises the burn capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBurn() external;

    /**
     * @notice Burns `_amount` tokens from `_userAddress` on behalf of a controller or agent.
     * @dev Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. Emits
     *      `IController.ControllerRedemption` rather than `Redeemed`.
     * @param _userAddress Address whose token balance is reduced.
     * @param _amount Amount of tokens to burn, denominated in base units.
     */
    function burn(address _userAddress, uint256 _amount) external;

    /**
     * @notice Redeems `_value` tokens from the caller's own balance under ERC-1594 semantics.
     * @param _value Amount of tokens to redeem, denominated in base units.
     * @param _data Arbitrary payload that implementations may use to authenticate the redemption.
     */
    function redeem(uint256 _value, bytes calldata _data) external;

    /**
     * @notice Redeems `_value` tokens from `_tokenHolder`'s balance, analogous to `transferFrom`.
     * @dev Both `msg.sender` and `_tokenHolder` must not be recovered addresses.
     * @param _tokenHolder Account whose tokens are redeemed.
     * @param _value Amount of tokens to redeem, denominated in base units.
     * @param _data Arbitrary payload that implementations may use to authenticate the redemption.
     */
    function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
}
