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
     * @notice Emitted when tokens are transferred with an attached data payload.
     * @param sender Account that executed the transfer (typically `msg.sender`).
     * @param to Recipient of the transferred tokens.
     * @param amount Amount of tokens transferred, denominated in base units.
     * @param data Arbitrary payload supplied by the caller for off-chain interpretation.
     */
    event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data);

    /**
     * @notice Emitted when tokens are transferred via an allowance with an attached data payload.
     * @param sender Account that executed the transfer (typically `msg.sender`).
     * @param from Address from which tokens were debited.
     * @param to Recipient of the transferred tokens.
     * @param amount Amount of tokens transferred, denominated in base units.
     * @param data Arbitrary payload supplied by the caller for off-chain interpretation.
     */
    event TransferFromWithData(
        address indexed sender,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes data
    );

    /**
     * @notice Emitted when new tokens are issued to a holder.
     * @param _operator Account that invoked the issuance (issuer or agent).
     * @param _to Recipient of the newly issued tokens.
     * @param _value Amount of tokens issued, denominated in base units.
     * @param _data Arbitrary payload forwarded alongside the issuance.
     */
    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);

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
     * @notice Transfer restrictions can take many forms and typically involve on-chain rules or whitelists.
     * However for many types of approved transfers, maintaining an on-chain list of approved transfers can be
     * cumbersome and expensive. An alternative is the co-signing approach, where in addition to the token holder
     * approving a token transfer, and authorised entity provides signed data which further validates the transfer.
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * for the token contract to interpret or record. This could be signed data authorising the transfer
     * (e.g. a dynamic whitelist) but is flexible enough to accomadate other use-cases.
     */
    function transferWithData(address _to, uint256 _value, bytes calldata _data) external;

    /**
     * @notice Transfer restrictions can take many forms and typically involve on-chain rules or whitelists.
     * However for many types of approved transfers, maintaining an on-chain list of approved transfers can be
     * cumbersome and expensive. An alternative is the co-signing approach, where in addition to the token holder
     * approving a token transfer, and authorised entity provides signed data which further validates the transfer.
     * @dev `msg.sender` MUST have a sufficient `allowance` set and this `allowance` must be debited by the `_value`.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * for the token contract to interpret or record. This could be signed data authorising the transfer
     * (e.g. a dynamic whitelist) but is flexible enough to accomadate other use-cases.
     */
    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;

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
