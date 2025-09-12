// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC3643Operations {
    /**
     * @dev Burns `_amount` tokens from the address `_userAddress`.
     *
     * This function should only be callable by an authorized entities.
     *
     * Returns `true` if the burn was successful.
     *
     * Emits a redeem event.
     */
    function burn(address _userAddress, uint256 _amount) external;

    /**
     * @dev Mints `_amount` tokens to the address `_to`.
     *
     * This function should only be callable by an authorized entities.
     *
     * Returns `true` if the minting was successful.
     *
     * Emits a Issued event.
     */
    function mint(address _to, uint256 _amount) external;

    /**
     * @dev Performs a forced transfer of `_amount` tokens from `_from` to `_to`.
     * @dev This function should only be callable by an authorized entities.
     *
     * Returns `true` if the transfer was successful.
     *
     * Emits a ControllerTransfer event.
     */
    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool);
}
