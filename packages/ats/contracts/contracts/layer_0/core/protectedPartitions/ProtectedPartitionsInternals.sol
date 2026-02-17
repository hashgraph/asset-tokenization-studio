// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseInternals } from "../pause/PauseInternals.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

abstract contract ProtectedPartitionsInternals is PauseInternals {
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ProtectedPartitions(bool _protectPartition) internal virtual returns (bool success_);
    function _protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal virtual;
    function _protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal virtual returns (bytes32);
    function _setProtectedPartitions(bool _protected) internal virtual;
    function _arePartitionsProtected() internal view virtual returns (bool);
    function _checkProtectedPartitions() internal view virtual;
    function _checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual;
    function _checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual;
    function _checkUnProtectedPartitionsOrWildCardRole() internal view virtual;
    function _isProtectedPartitionInitialized() internal view virtual returns (bool);
    function _isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual returns (bool);
    function _isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual returns (bool);
    function _protectedPartitionsRole(bytes32 _partition) internal pure virtual returns (bytes32);
}
