// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IControllerTypes
 * @author Asset Tokenization Studio Team
 * @notice Controller (ERC-1644) domain events shared across facets that perform forced
 *         transfers and redemptions.
 * @dev Holds the `ControllerTransfer` and `ControllerRedemption` events. `ControllerTransfer`
 *      is emitted from `Controller` and `BatchController`; `ControllerRedemption` is emitted
 *      from `Controller`, `Burn` and `BatchBurn`. `IController` inherits this interface; the
 *      other facets import it directly to reach the events without depending on the full
 *      `IController` API.
 */
interface IControllerTypes {
    /**
     * @notice Emitted when an authorised controller transfers tokens between two holders.
     * @param controller The address of the controller that initiated the transfer.
     * @param from The address tokens are transferred from.
     * @param to The address tokens are transferred to.
     * @param value The amount of tokens transferred.
     * @param data Optional data attached to the transfer for validation.
     * @param operatorData Optional data attached by the controller for event attribution.
     */
    event ControllerTransfer(
        address controller,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.
     * @param controller The address of the controller that initiated the redemption.
     * @param tokenHolder The account whose tokens are redeemed.
     * @param value The amount of tokens redeemed.
     * @param data Optional data attached to the redemption for validation.
     * @param operatorData Optional data attached by the controller for event attribution.
     */
    event ControllerRedemption(
        address controller,
        address indexed tokenHolder,
        uint256 value,
        bytes data,
        bytes operatorData
    );
}
