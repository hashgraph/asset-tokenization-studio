// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_PROTECTED_PARTITIONS_PARTICIPANT } from "../../constants/roles.sol";
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
} from "../../infrastructure/utils/EIP712.sol";
import { ROLE_WILD_CARD } from "../../constants/roles.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage ProtectedPartitions
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_PROTECTED_PARTITIONS = 0x5b38507d21e10ec4c8c85573e8ea591487d38de787e0bb50e4ec54b4affd2900;

/**
 * @notice Storage layout for the protected partitions module.
 * @param initialized Whether the protected partitions feature has been initialised.
 * @param arePartitionsProtected Whether token partitions are currently protected.
 */
/// @custom:storage-location erc7201:security.token.standard.storage.ProtectedPartitions
struct ProtectedPartitionsDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    bool arePartitionsProtected;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ProtectedPartitionsStorageWrapper
 * @notice Library providing storage access and logic for protected partitions.
 * @dev Provides functions to initialise, set, query, and validate protected partition state,
 *      as well as EIP-712 signature verification for transfers, redeems, holds, and clearing
 *      operations. All storage is accessed via a fixed slot defined in
 *      `STORAGE_LOCATION_PROTECTED_PARTITIONS`.
 * @author Asset Tokenization Studio Team
 */
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
            !AccessControlStorageWrapper.hasRole(ROLE_WILD_CARD, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitions.PartitionsAreProtectedAndNoRole(EvmAccessors.getMsgSender(), ROLE_WILD_CARD);
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
        return keccak256(abi.encodePacked(ROLE_PROTECTED_PARTITIONS_PARTICIPANT, _partition));
    }

    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(ROLE_PROTECTED_PARTITIONS_PARTICIPANT, partition));
    }

    function protectedPartitionsStorage()
        internal
        pure
        returns (ProtectedPartitionsDataStorage storage protectedPartitions_)
    {
        bytes32 position = STORAGE_LOCATION_PROTECTED_PARTITIONS;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            protectedPartitions_.slot := position
        }
    }
}
