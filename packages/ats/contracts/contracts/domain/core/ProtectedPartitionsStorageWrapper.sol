// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PROTECTED_PARTITIONS_PARTICIPANT_ROLE } from "../../constants/roles.sol";
import { _PROTECTED_PARTITIONS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IProtectedPartitions } from "../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { AccessControlStorageWrapper } from "./AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import {
    _getMessageHashTransfer,
    _getMessageHashRedeem,
    _getMessageHashCreateHold,
    _getMessageHashClearingTransfer,
    _getMessageHashClearingCreateHold,
    _getMessageHashClearingRedeem,
    _verify
} from "../../infrastructure/utils/ERC712.sol";
import { WILD_CARD_ROLE } from "../../constants/roles.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

struct ProtectedPartitionsDataStorage {
    bool initialized;
    bool arePartitionsProtected;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_nonces;
}

library ProtectedPartitionsStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) internal returns (bool success_) {
        ProtectedPartitionsDataStorage storage pps = protectedPartitionsStorage();
        pps.arePartitionsProtected = _protectPartitions;
        pps.initialized = true;
        success_ = true;
    }

    function setProtectedPartitions(bool _protected) internal {
        protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) {
            emit IProtectedPartitions.PartitionsProtected(EvmAccessors.getMsgSender());
            return;
        }
        emit IProtectedPartitions.PartitionsUnProtected(EvmAccessors.getMsgSender());
    }

    function requireProtectedPartitions() internal view {
        if (!arePartitionsProtected()) revert IProtectedPartitions.PartitionsAreUnProtected();
    }

    function arePartitionsProtected() internal view returns (bool) {
        return protectedPartitionsStorage().arePartitionsProtected;
    }

    function isProtectedPartitionInitialized() internal view returns (bool) {
        return protectedPartitionsStorage().initialized;
    }

    function requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(WILD_CARD_ROLE, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitions.PartitionsAreProtectedAndNoRole(EvmAccessors.getMsgSender(), WILD_CARD_ROLE);
        }
    }

    function checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view {
        if (!isTransferSignatureValid(_partition, _from, _to, _amount, _protectionData, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _from,
                _getMessageHashTransfer(
                    _partition,
                    _from,
                    _to,
                    _amount,
                    _protectionData.deadline,
                    _protectionData.nonce
                ),
                _protectionData.signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view {
        if (!isRedeemSignatureValid(_partition, _from, _amount, _protectionData, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _from,
                _getMessageHashRedeem(_partition, _from, _amount, _protectionData.deadline, _protectionData.nonce),
                _protectionData.signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isCreateHoldSignatureValid(_partition, _from, _protectedHold, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _from,
                _getMessageHashCreateHold(_partition, _from, _protectedHold),
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function checkClearingCreateHoldSignature(
        IClearingTypes.ProtectedClearingOperation memory _protectedClearingOperation,
        IHoldTypes.Hold memory _hold,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingCreateHoldSignatureValid(_protectedClearingOperation, _hold, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isClearingCreateHoldSignatureValid(
        IClearingTypes.ProtectedClearingOperation memory _protectedClearingOperation,
        IHoldTypes.Hold memory _hold,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _protectedClearingOperation.from,
                _getMessageHashClearingCreateHold(_protectedClearingOperation, _hold),
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function checkClearingTransferSignature(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingTransferSignatureValid(_protectedClearingOperation, _to, _amount, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isClearingTransferSignatureValid(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        address _to,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _protectedClearingOperation.from,
                _getMessageHashClearingTransfer(_protectedClearingOperation, _to, _amount),
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function checkClearingRedeemSignature(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingRedeemSignatureValid(_protectedClearingOperation, _amount, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    function isClearingRedeemSignatureValid(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view returns (bool) {
        return
            _verify(
                _protectedClearingOperation.from,
                _getMessageHashClearingRedeem(_protectedClearingOperation, _amount),
                _signature,
                _name,
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }

    function protectedPartitionsRole(bytes32 _partition) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _partition));
    }

    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }

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
}
