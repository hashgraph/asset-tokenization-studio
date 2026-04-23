// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";

interface IHoldRead is IHoldTypes {
    /**
     * @notice Gets the total amount of tokens held for a specific token holder across all partitions.
     * @param _tokenHolder The address of the token holder.
     * @return amount_ The total amount of tokens held for the token holder.
     */
    function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Gets the third-party address associated with a specific hold.
     * @param _holdIdentifier The identifier of the hold.
     * @return thirdParty_ The address of the third party associated with the hold.
     */
    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external view returns (address thirdParty_);
}
