// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  ICompliance
 * @notice Minimal adapter interface for querying and notifying an external compliance contract.
 * @dev    Implemented by third-party compliance modules whose address is registered on the
 *         token. The token calls these functions on every transfer, issuance, and redemption
 *         so the compliance module can enforce rules and maintain its own internal state.
 */
interface ICompliance {
    /**
     * @notice Notifies the compliance module that a transfer has been executed.
     * @dev The compliance module should update any transfer-tracking state accordingly.
     * @param _from   Address that sent the tokens.
     * @param _to     Address that received the tokens.
     * @param _amount Token quantity transferred.
     */
    function transferred(address _from, address _to, uint256 _amount) external;

    /**
     * @notice Notifies the compliance module that tokens have been issued.
     * @dev The compliance module should update any issuance-tracking state accordingly.
     * @param _to     Address that received the newly issued tokens.
     * @param _amount Token quantity issued.
     */
    function created(address _to, uint256 _amount) external;

    /**
     * @notice Notifies the compliance module that tokens have been redeemed.
     * @dev The compliance module should update any redemption-tracking state accordingly.
     * @param _from   Address whose tokens were redeemed.
     * @param _amount Token quantity redeemed.
     */
    function destroyed(address _from, uint256 _amount) external;

    /**
     * @notice Checks whether a transfer between two addresses is permitted.
     * @param _from   Address sending the tokens.
     * @param _to     Address receiving the tokens.
     * @param _amount Token quantity to transfer.
     * @return `true` if the transfer is allowed; `false` otherwise.
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
}
