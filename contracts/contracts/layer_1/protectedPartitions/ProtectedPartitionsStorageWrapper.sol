pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    AccessControlStorageWrapper
} from '../accessControl/AccessControlStorageWrapper.sol';
import {
    IProtectedPartitionsStorageWrapper
} from '../interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol';
import {
    _PROTECTED_PARTITIONS_ROLE,
    _PROTECTED_PARTITIONS_PARTICIPANT_ROLE
} from '../constants/roles.sol';
import {
    _PROTECTED_PARTITIONS_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {
    getMessageHashTransfer,
    getMessageHashRedeem,
    verify
} from './signatureVerification.sol';

abstract contract ProtectedPartitionsStorageWrapper is
    IProtectedPartitionsStorageWrapper,
    AccessControlStorageWrapper
{
    struct ProtectedPartitionsDataStorage {
        bool initialized;
        bool arePartitionsProtected;
        string contractName;
        string contractVersion;
        mapping(address => uint256) nounces;
    }

    // modifiers
    modifier onlyProtectedPartitions() {
        if (!_arePartitionsProtected()) {
            revert PartitionsAreUnProtected();
        }
        _;
    }

    modifier onlyValidParticipant(bytes32 partition) {
        if (_arePartitionsProtected()) {
            _checkRoleForPartition(partition, _msgSender());
        }
        _;
    }

    function _setProtectedPartitions(bool _protected) internal virtual {
        _protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) emit PartitionsProtected(_msgSender());
        else emit PartitionsUnProtected(_msgSender());
    }

    function _setNounce(uint256 _nounce, address _account) internal {
        _protectedPartitionsStorage().nounces[_account] = _nounce;
    }

    function _protectedPartitionsRole(
        bytes32 _partition
    ) internal view virtual returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _PROTECTED_PARTITIONS_PARTICIPANT_ROLE,
                    _partition
                )
            );
    }

    function _arePartitionsProtected() internal view virtual returns (bool) {
        return _protectedPartitionsStorage().arePartitionsProtected;
    }

    function _getNounceFor(
        address _account
    ) internal view virtual returns (uint256) {
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
    ) internal view virtual {
        if (
            !_isTransferSignatureValid(
                _partition,
                _from,
                _to,
                _amount,
                _deadline,
                _nounce,
                _signature
            )
        ) revert WrongSignature();
    }

    function _isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view virtual returns (bool) {
        bytes32 functionHash = getMessageHashTransfer(
            _partition,
            _from,
            _to,
            _amount,
            _deadline,
            _nounce
        );
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
    ) internal view virtual {
        if (
            !_isRedeemSignatureValid(
                _partition,
                _from,
                _amount,
                _deadline,
                _nounce,
                _signature
            )
        ) revert WrongSignature();
    }

    function _isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal view virtual returns (bool) {
        bytes32 functionHash = getMessageHashRedeem(
            _partition,
            _from,
            _amount,
            _deadline,
            _nounce
        );
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

    function _calculateRoleForPartition(
        bytes32 partition
    ) internal pure returns (bytes32 role) {
        role = keccak256(
            abi.encode(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition)
        );
    }

    function _checkRoleForPartition(
        bytes32 partition,
        address account
    ) internal {
        _checkRole(_calculateRoleForPartition(partition), account);
    }

    function _protectedPartitionsStorage()
        internal
        pure
        virtual
        returns (ProtectedPartitionsDataStorage storage protectedPartitions_)
    {
        bytes32 position = _PROTECTED_PARTITIONS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            protectedPartitions_.slot := position
        }
    }
}
