// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PROTECTED_PARTITIONS_PARTICIPANT_ROLE } from "../../constants/roles.sol";
import { _PROTECTED_PARTITIONS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";
import { IClearing } from "../../../layer_1/interfaces/clearing/IClearing.sol";
import { Hold, ProtectedHold } from "../../../layer_1/interfaces/hold/IHold.sol";
import { KycStorageWrapper } from "../kyc/KycStorageWrapper.sol";
import {
    getMessageHashTransfer,
    getMessageHashRedeem,
    getMessageHashCreateHold,
    getMessageHashClearingTransfer,
    getMessageHashClearingCreateHold,
    getMessageHashClearingRedeem,
    verify
} from "../../../layer_1/protectedPartitions/signatureVerification.sol";

abstract contract ProtectedPartitionsStorageWrapper is IProtectedPartitionsStorageWrapper, KycStorageWrapper {
    struct ProtectedPartitionsDataStorage {
        bool initialized;
        bool arePartitionsProtected;
        string contractName;
        string contractVersion;
        mapping(address => uint256) nounces;
    }

    // modifiers
    modifier onlyProtectedPartitions() override {
        _checkProtectedPartitions();
        _;
    }

    modifier onlyValidParticipant(bytes32 _partition) override {
        _checkValidPartition(_partition);
        _;
    }

    function _setProtectedPartitions(bool _protected) internal {
        _protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) {
            emit PartitionsProtected(_msgSender());
            return;
        }
        emit PartitionsUnProtected(_msgSender());
    }

    function _setNounce(uint256 _nounce, address _account) internal {
        _protectedPartitionsStorage().nounces[_account] = _nounce;
    }

    function _arePartitionsProtected() internal view returns (bool) {
        return _protectedPartitionsStorage().arePartitionsProtected;
    }

    function _getNounceFor(address _account) internal view returns (uint256) {
        return _protectedPartitionsStorage().nounces[_account];
    }

    function _checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view {
        if (!_isTransferSignatureValid(_partition, _from, _to, _amount, _deadline, _nounce, _signature))
            revert WrongSignature();
    }

    function _isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashTransfer(_partition, _from, _to, _amount, _deadline, _nounce);
        return
            verify(
                _from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view {
        if (!_isRedeemSignatureValid(_partition, _from, _amount, _deadline, _nounce, _signature))
            revert WrongSignature();
    }

    function _isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashRedeem(_partition, _from, _amount, _deadline, _nounce);
        return
            verify(
                _from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view {
        if (!_isCreateHoldSignatureValid(_partition, _from, _protectedHold, _signature)) revert WrongSignature();
    }

    function _isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashCreateHold(_partition, _from, _protectedHold);

        return
            verify(
                _from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingCreateHoldSignature(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view {
        if (!_isClearingCreateHoldSignatureValid(_protectedClearingOperation, _hold, _signature))
            revert WrongSignature();
    }

    function _isClearingCreateHoldSignatureValid(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingCreateHold(_protectedClearingOperation, _hold);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingTransferSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal view {
        if (!_isClearingTransferSignatureValid(_protectedClearingOperation, _to, _amount, _signature))
            revert WrongSignature();
    }

    function _isClearingTransferSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        address _to,
        uint256 _amount,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingTransfer(_protectedClearingOperation, _to, _amount);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingRedeemSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view {
        if (!_isClearingRedeemSignatureValid(_protectedClearingOperation, _amount, _signature)) revert WrongSignature();
    }

    function _isClearingRedeemSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingRedeem(_protectedClearingOperation, _amount);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkRoleForPartition(bytes32 partition, address account) internal view {
        _checkRole(_calculateRoleForPartition(partition), account);
    }

    function _checkProtectedPartitions() internal view {
        if (!_arePartitionsProtected()) revert PartitionsAreUnProtected();
    }

    function _protectedPartitionsRole(bytes32 _partition) internal pure override returns (bytes32) {
        return keccak256(abi.encodePacked(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _partition));
    }

    function _calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }

    function _protectedPartitionsStorage()
        internal
        pure
        returns (ProtectedPartitionsDataStorage storage protectedPartitions_)
    {
        bytes32 position = _PROTECTED_PARTITIONS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            protectedPartitions_.slot := position
        }
    }

    function _checkValidPartition(bytes32 _partition) private view {
        if (_arePartitionsProtected()) _checkRoleForPartition(_partition, _msgSender());
    }
}
