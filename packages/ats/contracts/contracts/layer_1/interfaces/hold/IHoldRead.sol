// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ThirdPartyType} from '../../../layer_0/common/types/ThirdPartyType.sol';
import {HoldIdentifier} from './IHold.sol';

interface IHoldRead {
    /**
     * @notice Gets the total amount of tokens held for a specific token holder
     * @param _tokenHolder The address of the token holder
     * @return amount_ The total amount of tokens held for the token holder
     */
    function getHeldAmountFor(
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Gets the total amount of tokens held for a specific token holder on a specific partition
     * @param _partition The partition on which to check the held amount
     * @param _tokenHolder The address of the token holder
     * @return amount_ The total amount of tokens held for the token holder on the specified partition
     */
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Gets the count of holds for a specific token holder
     * @param _tokenHolder The address of the token holder
     * @return holdCount_ The count of holds for the token holder
     */
    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 holdCount_);

    /**
     * @notice Gets the holds IDs for a specific token holder on a specific partition
     * @param _partition The partition on which to get the holds IDs
     * @param _tokenHolder The address of the token holder
     * @param _pageIndex The index of the page to retrieve
     * @param _pageLength The length of the page to retrieve
     * @return holdsId_ The array of holds IDs for the token holder on the specified partition
     */
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory holdsId_);

    /**
     * @notice Gets the details of a specific hold by its identifier
     * @param _holdIdentifier The identifier of the hold
     * @return amount_ The amount of tokens held
     * @return expirationTimestamp_ The expiration timestamp of the hold
     * @return escrow_ The address of the escrow
     * @return destination_ The address of the destination
     * @return data_ Additional data attached to the hold
     * @return operatorData_ Additional data attached to the hold by the operator
     * @return thirdPartyType_ The type of third party associated with the hold
     */
    function getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        );

    function getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) external view returns (address thirdParty_);
}
