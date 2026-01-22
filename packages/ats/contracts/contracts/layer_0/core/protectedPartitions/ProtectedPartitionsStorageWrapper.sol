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
} from "../../../layer_0/common/libraries/ERC712Lib.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

abstract contract ProtectedPartitionsStorageWrapper is IProtectedPartitionsStorageWrapper, KycStorageWrapper {
    struct ProtectedPartitionsDataStorage {
        bool initialized;
        bool arePartitionsProtected;
        string DEPRECATED_contractName;
        string DEPRECATED_contractVersion;
        mapping(address => uint256) DEPRECATED_nounces;
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

    function _initialize_ProtectedPartitions(bool _protectPartitions) internal override returns (bool success_) {
        ProtectedPartitionsDataStorage storage protectedPartitionsStorage = _protectedPartitionsStorage();
        protectedPartitionsStorage.arePartitionsProtected = _protectPartitions;
        protectedPartitionsStorage.initialized = true;
        success_ = true;
    }

    function _setProtectedPartitions(bool _protected) internal override {
        _protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) {
            emit PartitionsProtected(_msgSender());
            return;
        }
        emit PartitionsUnProtected(_msgSender());
    }

    function _arePartitionsProtected() internal view override returns (bool) {
        return _protectedPartitionsStorage().arePartitionsProtected;
    }

    function _checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override {
        if (!_isTransferSignatureValid(_partition, _from, _to, _amount, _protectionData)) revert WrongSignature();
    }

    function _isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashTransfer(
            _partition,
            _from,
            _to,
            _amount,
            _protectionData.deadline,
            _protectionData.nounce
        );
        return
            verify(
                _from,
                functionHash,
                _protectionData.signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override {
        if (!_isRedeemSignatureValid(_partition, _from, _amount, _protectionData)) revert WrongSignature();
    }

    function _isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashRedeem(
            _partition,
            _from,
            _amount,
            _protectionData.deadline,
            _protectionData.nounce
        );
        return
            verify(
                _from,
                functionHash,
                _protectionData.signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view override {
        if (!_isCreateHoldSignatureValid(_partition, _from, _protectedHold, _signature)) revert WrongSignature();
    }

    function _isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashCreateHold(_partition, _from, _protectedHold);

        return
            verify(
                _from,
                functionHash,
                _signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingCreateHoldSignature(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view override {
        if (!_isClearingCreateHoldSignatureValid(_protectedClearingOperation, _hold, _signature))
            revert WrongSignature();
    }

    function _isClearingCreateHoldSignatureValid(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashClearingCreateHold(_protectedClearingOperation, _hold);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingTransferSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal view override {
        if (!_isClearingTransferSignatureValid(_protectedClearingOperation, _to, _amount, _signature))
            revert WrongSignature();
    }

    function _isClearingTransferSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        address _to,
        uint256 _amount,
        bytes calldata _signature
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashClearingTransfer(_protectedClearingOperation, _to, _amount);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkClearingRedeemSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view override {
        if (!_isClearingRedeemSignatureValid(_protectedClearingOperation, _amount, _signature)) revert WrongSignature();
    }

    function _isClearingRedeemSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view override returns (bool) {
        bytes32 functionHash = getMessageHashClearingRedeem(_protectedClearingOperation, _amount);

        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkRoleForPartition(bytes32 partition, address account) internal view override {
        _checkRole(_calculateRoleForPartition(partition), account);
    }

    function _checkProtectedPartitions() internal view override {
        if (!_arePartitionsProtected()) revert PartitionsAreUnProtected();
    }

    function _isProtectedPartitionInitialized() internal view override returns (bool) {
        return _protectedPartitionsStorage().initialized;
    }

    function _protectedPartitionsRole(bytes32 _partition) internal pure override returns (bytes32) {
        return keccak256(abi.encodePacked(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _partition));
    }

    function _calculateRoleForPartition(bytes32 partition) internal pure override returns (bytes32 role) {
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
