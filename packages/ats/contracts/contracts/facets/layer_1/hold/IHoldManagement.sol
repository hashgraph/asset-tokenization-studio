// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";

interface IHoldManagement is IHoldTypes {
    /**
     * @notice Creates a hold on the tokens of a token holder, by an operator, on a specific partition
     * @param _partition The partition on which the hold is created
     * @param _from The address from which the tokens will be held
     * @param _hold The hold details
     * @param _operatorData Additional data attached to the hold creation by the operator
     */
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @notice Creates a hold on the tokens of a token holder
     * @dev Can only be called by a user with the protected partitions role
     * @param _partition The partition on which the hold is created
     * @param _from The address from which the tokens will be held
     * @param _protectedHold The protected hold details
     * @param _signature The signature of the token holder authorizing the hold
     */
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 holdId_);
}
