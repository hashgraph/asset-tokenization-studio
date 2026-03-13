// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PROTECTED_PARTITIONS_PARTICIPANT_ROLE } from "../../constants/roles.sol";
import { _PROTECTED_PARTITIONS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IProtectedPartitionsStorageWrapper } from "./protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { Hold, ProtectedHold } from "../../facets/layer_1/hold/IHold.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import {
    getMessageHashTransfer,
    getMessageHashRedeem,
    getMessageHashCreateHold,
    getMessageHashClearingTransfer,
    getMessageHashClearingCreateHold,
    getMessageHashClearingRedeem,
    verify
} from "../../infrastructure/utils/ERC712Lib.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

struct ProtectedPartitionsDataStorage {
    bool initialized;
    bool arePartitionsProtected;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_nounces;
}

library ProtectedPartitionsStorageWrapper {
    function protectedPartitionsStorage()
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

    // --- Guard functions ---

    function requireProtectedPartitions() internal view {
        if (!arePartitionsProtected()) revert IProtectedPartitionsStorageWrapper.PartitionsAreUnProtected();
    }

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) internal returns (bool success_) {
        ProtectedPartitionsDataStorage storage pps = protectedPartitionsStorage();
        pps.arePartitionsProtected = _protectPartitions;
        pps.initialized = true;
        success_ = true;
    }

    // --- State-changing functions ---

    function setProtectedPartitions(bool _protected) internal {
        protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) {
            emit IProtectedPartitionsStorageWrapper.PartitionsProtected(msg.sender);
            return;
        }
        emit IProtectedPartitionsStorageWrapper.PartitionsUnProtected(msg.sender);
    }

    // --- Read functions ---

    function arePartitionsProtected() internal view returns (bool) {
        return protectedPartitionsStorage().arePartitionsProtected;
    }

    function isProtectedPartitionInitialized() internal view returns (bool) {
        return protectedPartitionsStorage().initialized;
    }

    function protectedPartitionsRole(bytes32 _partition) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _partition));
    }

    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }

    // --- Signature verification ---

    function checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view {
        if (!isTransferSignatureValid(_partition, _from, _to, _amount, _protectionData, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view returns (bool) {
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
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }

    function checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view {
        if (!isRedeemSignatureValid(_partition, _from, _amount, _protectionData, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view returns (bool) {
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
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }

    function checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isCreateHoldSignatureValid(_partition, _from, _protectedHold, _signature, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashCreateHold(_partition, _from, _protectedHold);
        return
            verify(
                _from,
                functionHash,
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }

    function checkClearingCreateHoldSignature(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingCreateHoldSignatureValid(_protectedClearingOperation, _hold, _signature, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isClearingCreateHoldSignatureValid(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingCreateHold(_protectedClearingOperation, _hold);
        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }

    function checkClearingTransferSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingTransferSignatureValid(_protectedClearingOperation, _to, _amount, _signature, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isClearingTransferSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        address _to,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingTransfer(_protectedClearingOperation, _to, _amount);
        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }

    function checkClearingRedeemSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingRedeemSignatureValid(_protectedClearingOperation, _amount, _signature, _name))
            revert IProtectedPartitionsStorageWrapper.WrongSignature();
    }

    function isClearingRedeemSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashClearingRedeem(_protectedClearingOperation, _amount);
        return
            verify(
                _protectedClearingOperation.from,
                functionHash,
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }
}
