// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsInternals } from "../corporateActions/CorporateActionsInternals.sol";
import { ICap } from "../../layer_1/interfaces/cap/ICap.sol";

abstract contract CapInternals is CorporateActionsInternals {
    function _adjustMaxSupply(uint256 factor) internal virtual;
    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal virtual;
    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_Cap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal virtual;
    function _setMaxSupply(uint256 _maxSupply) internal virtual;
    function _setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) internal virtual;
    function _checkNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) internal view virtual;
    function _checkWithinMaxSupply(uint256 _amount) internal view virtual;
    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view virtual returns (uint256);
    function _getMaxSupplyByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view virtual returns (uint256);
    function _isCapInitialized() internal view virtual returns (bool);
    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure virtual returns (bool);
}
