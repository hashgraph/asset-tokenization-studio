// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";

interface IClearingRead is IClearing {
    /**
     * @notice Gets the total cleared amount for a token holder across all partitions
     */
    function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Gets the total cleared amount for a token holder by partition
     */
    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Gets the total clearing count for a token holder by partition and clearing operation type
     */
    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType
    ) external view returns (uint256 clearingCount_);

    /**
     * @notice Gets the ids of the clearings for a token holder by partition and clearing operation type
     */
    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory clearingsId_);

    /**
     * @notice Gets the address of the party that initiated the clearing operation
     */
    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 clearingId_
    ) external view returns (address thirdParty_);
}
