// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IERC1594
 * @author Asset Tokenization Studio Team
 * @notice Interface defining the ERC-1594 issuance and redemption surface for security tokens.
 * @dev Re-exports the canonical ERC-1594 events plus the transfer and redeem variants that carry
 *      an arbitrary `data` payload used by off-chain authorisation flows.
 */
interface IERC1594 {
    /**
     * @notice Emitted when tokens are redeemed from a holder's balance.
     * @param _operator Account that executed the redemption.
     * @param _from Address from which tokens were burnt.
     * @param _value Amount of tokens redeemed, denominated in base units.
     * @param _data Arbitrary payload forwarded alongside the redemption.
     */
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);

    /**
     * @notice Initialises the ERC-1594 facet on the calling contract.
     * @dev Can only be invoked once per contract; subsequent calls revert via the
     *      `onlyNotERC1594Initialized` modifier on the implementation.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external;

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
