// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

/**
 * @title IERC3643Operations
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing the ERC-3643 controller operations split out from the main ERC-3643
 *         facet (burn and forced transfer).
 * @dev Operations are restricted to the controller or agent roles and emit the corresponding
 *      ERC-1644 `ControllerRedemption` / `ControllerTransfer` events.
 */
interface IERC3643Operations is IERC3643Types {
    /**
     * @notice Burns tokens from a holder by controller action.
     * @dev Restricted to the controller or agent role. Requires the token to be unpaused, single
     *      partition and controllable. Emits `IERC1644.ControllerRedemption`.
     * @param _userAddress Address whose balance is debited.
     * @param _amount Amount of tokens to burn, denominated in base units.
     */
    function burn(address _userAddress, uint256 _amount) external;

    /**
     * @notice Transfers tokens between holders by controller action, bypassing allowances.
     * @dev Restricted to the controller or agent role. Requires the token to be unpaused, single
     *      partition and controllable. Emits `IERC1644.ControllerTransfer`.
     * @param _from Address whose balance is debited.
     * @param _to Address whose balance is credited.
     * @param _amount Amount of tokens to transfer, denominated in base units.
     * @return success_ True when the forced transfer completes successfully.
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool success_);
}
