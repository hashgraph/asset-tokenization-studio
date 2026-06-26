// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_PROTECTED_PARTITIONS_PARTICIPANT } from "../../constants/roles.sol";
import { IProtectedPartitions } from "../../facets/protectedPartitions/IProtectedPartitions.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";
import { IClearingTypes } from "../../facets/clearing/IClearingTypes.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
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
 * @notice Storage layout for the protected-partitions module.
 * @dev Tracks whether the feature is initialised and whether partitions are currently protected.
 *      New fields must be appended below the APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.ProtectedPartitions
 */
struct ProtectedPartitionsDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool arePartitionsProtected;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
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
    /**
     * @notice Initialises the protected-partitions module and sets the initial protection flag.
     * @dev Single-shot initialiser; the calling facet enforces the "not yet initialised"
     *      precondition.
     * @param _protectPartitions Initial value of the partition-protection flag.
     * @return success_ Always `true`; preserves the facet's API contract.
     */
    function initializeProtectedPartitions(bool _protectPartitions) internal returns (bool success_) {
        _protectedPartitionsStorage().arePartitionsProtected = _protectPartitions;
        success_ = true;
    }

    /**
     * @notice Sets the partition-protection flag.
     * @dev The calling facet (`ProtectedPartitions`) emits `PartitionsProtected` when the flag
     *      is turned on and `PartitionsUnProtected` when it is turned off.
     * @param _protected New value of the partition-protection flag.
     */
    function setProtectedPartitions(bool _protected) internal {
        _protectedPartitionsStorage().arePartitionsProtected = _protected;
    }

    /**
     * @notice Reverts with `IProtectedPartitions.PartitionsAreUnProtected` when partitions are not
     *         currently protected.
     */
    function requireProtectedPartitions() internal view {
        if (!arePartitionsProtected()) revert IProtectedPartitions.PartitionsAreUnProtected();
    }

    /**
     * @notice Reports whether token partitions are currently protected.
     * @return True when the protection flag is set.
     */
    function arePartitionsProtected() internal view returns (bool) {
        return _protectedPartitionsStorage().arePartitionsProtected;
    }

    /**
     * @notice Reverts when partitions are protected and the caller does not hold the wild-card role.
     * @dev Reverts with `IProtectedPartitions.PartitionsAreProtectedAndNoRole(msgSender, ROLE_WILD_CARD)`.
     */
    function requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(ROLE_WILD_CARD, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitions.PartitionsAreProtectedAndNoRole(EvmAccessors.getMsgSender(), ROLE_WILD_CARD);
        }
    }

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the protected transfer.
     * @param _partition Partition on which the transfer is executed.
     * @param _from Holder authorising the transfer.
     * @param _to Recipient of the transfer.
     * @param _amount Token amount being transferred.
     * @param _protectionData EIP-712 protection envelope (deadline, nonce, signature).
     * @param _name EIP-712 domain name to verify against.
     */
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

    /**
     * @notice Reports whether the EIP-712 signature authorises the protected transfer.
     * @dev Verifies the message hash against `_from`, using the resolver-proxy version as the
     *      EIP-712 version field and the current `chainId` and contract address as the domain
     *      separator inputs.
     * @param _partition Partition on which the transfer is executed.
     * @param _from Holder authorising the transfer.
     * @param _to Recipient of the transfer.
     * @param _amount Token amount being transferred.
     * @param _protectionData EIP-712 protection envelope (deadline, nonce, signature).
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for `_from`.
     */
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

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the protected redeem.
     * @param _partition Partition on which the redeem is executed.
     * @param _from Holder authorising the redeem.
     * @param _amount Token amount being redeemed.
     * @param _protectionData EIP-712 protection envelope (deadline, nonce, signature).
     * @param _name EIP-712 domain name to verify against.
     */
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

    /**
     * @notice Reports whether the EIP-712 signature authorises the protected redeem.
     * @param _partition Partition on which the redeem is executed.
     * @param _from Holder authorising the redeem.
     * @param _amount Token amount being redeemed.
     * @param _protectionData EIP-712 protection envelope (deadline, nonce, signature).
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for `_from`.
     */
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

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the protected hold creation.
     * @param _partition Partition on which the hold is created.
     * @param _from Holder authorising the hold.
     * @param _protectedHold Hold parameters being authorised.
     * @param _signature EIP-712 signature produced by `_from`.
     * @param _name EIP-712 domain name to verify against.
     */
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

    /**
     * @notice Reports whether the EIP-712 signature authorises the protected hold creation.
     * @param _partition Partition on which the hold is created.
     * @param _from Holder authorising the hold.
     * @param _protectedHold Hold parameters being authorised.
     * @param _signature EIP-712 signature produced by `_from`.
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for `_from`.
     */
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

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the clearing hold creation.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _hold Hold parameters being authorised.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     */
    function checkClearingCreateHoldSignature(
        IClearingTypes.ProtectedClearingOperation memory _protectedClearingOperation,
        IHoldTypes.Hold memory _hold,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingCreateHoldSignatureValid(_protectedClearingOperation, _hold, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    /**
     * @notice Reports whether the EIP-712 signature authorises the clearing hold creation.
     * @dev Verifies the message hash against the clearing holder in
     * `_protectedClearingOperation.from`, using the resolver-proxy version and
     * current chain/contract context as EIP-712 domain inputs.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _hold Hold parameters being authorised.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for the clearing holder.
     */
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

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the clearing transfer.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _amount Token amount being transferred.
     * @param _to Recipient address.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     */
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

    /**
     * @notice Reports whether the EIP-712 signature authorises the clearing transfer.
     * @dev Verifies the message hash against the clearing holder in
     * `_protectedClearingOperation.from`, using the resolver-proxy version and
     * current chain/contract context as EIP-712 domain inputs.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _to Recipient address.
     * @param _amount Token amount being transferred.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for the clearing holder.
     */
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

    /**
     * @notice Reverts with `ICommonErrors.WrongSignature` when the EIP-712 signature does not
     *         authorise the clearing redeem.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _amount Token amount being redeemed.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     */
    function checkClearingRedeemSignature(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        string memory _name
    ) internal view {
        if (!isClearingRedeemSignatureValid(_protectedClearingOperation, _amount, _signature, _name))
            revert ICommonErrors.WrongSignature();
    }

    /**
     * @notice Reports whether the EIP-712 signature authorises the clearing redeem.
     * @dev Verifies the message hash against the clearing holder in
     * `_protectedClearingOperation.from`, using the resolver-proxy version and
     * current chain/contract context as EIP-712 domain inputs.
     * @param _protectedClearingOperation Protected clearing metadata including holder.
     * @param _amount Token amount being redeemed.
     * @param _signature EIP-712 signature produced by the clearing holder.
     * @param _name EIP-712 domain name to verify against.
     * @return True when the signature is valid for the clearing holder.
     */
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

    /**
     * @notice Computes the access-control role identifier for a protected partition.
     * @dev Uses keccak256 hashing of the role base and partition selector.
     * @param _partition Partition identifier.
     * @return Role identifier unique to this partition.
     */
    function protectedPartitionsRole(bytes32 _partition) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(ROLE_PROTECTED_PARTITIONS_PARTICIPANT, _partition));
    }

    /**
     * @notice Computes the access-control role identifier for a protected partition.
     * @dev Alternative to `protectedPartitionsRole`, using ABI encoding instead of
     * packed encoding.
     * @param partition Partition identifier.
     * @return role Role identifier unique to this partition.
     */
    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(ROLE_PROTECTED_PARTITIONS_PARTICIPANT, partition));
    }

    /**
     * @notice Returns the protected-partitions storage slot using the predefined
     * position constant.
     * @dev Uses inline assembly to retrieve the storage pointer.
     * @return protectedPartitions_ Storage reference to the
     * `ProtectedPartitionsDataStorage` struct.
     */
    function _protectedPartitionsStorage()
        private
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
