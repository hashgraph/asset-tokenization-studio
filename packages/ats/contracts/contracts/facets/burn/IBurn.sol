// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IBurn {
    /**
     * @notice Emitted when tokens are redeemed from a holder's balance.
     * @param _operator Account that executed the redemption.
     * @param _from Address from which tokens were burnt.
     * @param _value Amount of tokens redeemed, denominated in base units.
     * @param _data Arbitrary payload forwarded alongside the redemption.
     */
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);

    /**
     * @dev Burns `_amount` tokens from the address `_userAddress`.
     * Only callable by authorized entities (CONTROLLER_ROLE or AGENT_ROLE).
     * Emits a ControllerRedemption event.
     */
    function burn(address _userAddress, uint256 _amount) external;

    /**
     * @notice This function redeem an amount of the token of a msg.sender. For doing so msg.sender may incentivize
     * using different ways that could be implemented with in the `redeem` function definition. But those
     * implementations are out of the scope of the ERC1594.
     * @param _value The amount of tokens need to be redeemed
     * @param _data The `bytes calldata _data` it can be used in the token contract to authenticate the redemption.
     */
    function redeem(uint256 _value, bytes calldata _data) external;

    /**
     * @notice This function redeem an amount of the token of a msg.sender. For doing so msg.sender may incentivize
     * using different ways that could be implemented with in the `redeem` function definition. But those
     * implementations are out of the scope of the ERC1594.
     * @dev It is analogy to `transferFrom`
     * @param _tokenHolder The account whose tokens gets redeemed.
     * @param _value The amount of tokens need to be redeemed
     * @param _data The `bytes calldata _data` it can be used in the token contract to authenticate the redemption.
     */
    function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
}
