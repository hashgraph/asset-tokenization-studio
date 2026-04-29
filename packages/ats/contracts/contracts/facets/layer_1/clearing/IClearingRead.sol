// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "./IClearingTypes.sol";

interface IClearingRead is IClearingTypes {
    /**
     * @notice Gets the total cleared amount for a token holder across all partitions
     */
    function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Gets the address of the party that initiated the clearing operation
     */
    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 clearingId_
    ) external view returns (address thirdParty_);
}
