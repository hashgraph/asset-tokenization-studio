// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PROTECTED_PARTITIONS_PARTICIPANT_ROLE } from "../../constants/roles.sol";
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
import { _WILD_CARD_ROLE } from "../../constants/roles.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @notice Storage layout for the protected partitions mechanism.
 * @param initialized                Whether the mechanism has been initialised.
 * @param arePartitionsProtected     Whether partition protection is currently active.
 * @param DEPRECATED_contractName    Previously held the EIP-712 domain name; no longer used.
 * @param DEPRECATED_contractVersion Previously held the EIP-712 domain version; no longer used.
 * @param DEPRECATED_nonces          Previously tracked per-account EIP-712 nonces; no longer used.
 */
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

/**
 * @title ProtectedPartitionsStorageWrapper
 * @notice A library providing structured access to protected partitions storage and associated logic.
 * @dev Handles initialisation, configuration, signature verification, and authorisation checks
 *      for protected partitions. Uses custom storage accessed via assembly at a predetermined slot.
 * @author io.builders
 */
library ProtectedPartitionsStorageWrapper {
    /**
     * @notice Initialises the protected partitions mechanism.
     * @dev Sets the initial state of partition protection based on `_protectPartitions`. Can only be called once.
     * @param _protectPartitions Boolean indicating whether partitions should be protected upon initialisation.
     * @return success_ Indicates successful initialisation.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) internal returns (bool success_) {
        ProtectedPartitionsDataStorage storage pps = protectedPartitionsStorage();
        pps.arePartitionsProtected = _protectPartitions;
        pps.initialized = true;
        success_ = true;
    }

    /**
     * @notice Updates the protection status of partitions.
     * @dev Mutates the storage flag `arePartitionsProtected`. Emits an appropriate event based on the new state.
     * @param _protected The new protection status to apply.
     */
    function setProtectedPartitions(bool _protected) internal {
        protectedPartitionsStorage().arePartitionsProtected = _protected;
        if (_protected) {
            emit IProtectedPartitions.PartitionsProtected(EvmAccessors.getMsgSender());
            return;
        }
        emit IProtectedPartitions.PartitionsUnProtected(EvmAccessors.getMsgSender());
    }

    /**
     * @notice Ensures that partitions are currently protected.
     * @dev Reverts with `PartitionsAreUnProtected` if partitions are not protected.
     */
    function requireProtectedPartitions() internal view {
        if (!arePartitionsProtected()) revert IProtectedPartitions.PartitionsAreUnProtected();
    }

    /**
     * @notice Checks if partitions are currently protected.
     * @dev Reads the `arePartitionsProtected` flag from storage.
     * @return Boolean indicating protection status.
     */
    function arePartitionsProtected() internal view returns (bool) {
        return protectedPartitionsStorage().arePartitionsProtected;
    }

    /**
     * @notice Verifies that the protected partitions mechanism has been initialised.
     * @dev Reads the `initialized` flag from storage.
     * @return Boolean indicating initialisation status.
     */
    function isProtectedPartitionInitialized() internal view returns (bool) {
        return protectedPartitionsStorage().initialized;
    }

    /**
     * @notice Requires either unprotected partitions or a wildcard role for the caller.
     * @dev Reverts with `PartitionsAreProtectedAndNoRole` if partitions are protected and
     *      the caller lacks the wildcard role.
     */
    function requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitions.PartitionsAreProtectedAndNoRole(EvmAccessors.getMsgSender(), _WILD_CARD_ROLE);
        }
    }

    /**
     * @notice Validates a transfer operation's signature.
     * @dev Calls `isTransferSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the transfer.
     * @param _to Address receiving the tokens.
     * @param _amount Quantity of tokens being transferred.
     * @param _protectionData Signature data including deadline, nonce, and signature bytes.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a transfer operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the transfer.
     * @param _to Address receiving the tokens.
     * @param _amount Quantity of tokens being transferred.
     * @param _protectionData Signature data including deadline, nonce, and signature bytes.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Validates a redeem operation's signature.
     * @dev Calls `isRedeemSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the redemption.
     * @param _amount Quantity of tokens being redeemed.
     * @param _protectionData Signature data including deadline, nonce, and signature bytes.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a redeem operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the redemption.
     * @param _amount Quantity of tokens being redeemed.
     * @param _protectionData Signature data including deadline, nonce, and signature bytes.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Validates a create hold operation's signature.
     * @dev Calls `isCreateHoldSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the hold creation.
     * @param _protectedHold Details of the hold being created.
     * @param _signature Signature bytes provided by the holder.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a create hold operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _partition Identifier of the token partition involved.
     * @param _from Address initiating the hold creation.
     * @param _protectedHold Details of the hold being created.
     * @param _signature Signature bytes provided by the holder.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Validates a clearing create hold operation's signature.
     * @dev Calls `isClearingCreateHoldSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _protectedClearingOperation Details of the clearing operation triggering the hold.
     * @param _hold Standard hold parameters.
     * @param _signature Signature bytes provided by the holder.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a clearing create hold operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _protectedClearingOperation Details of the clearing operation triggering the hold.
     * @param _hold Standard hold parameters.
     * @param _signature Signature bytes provided by the holder.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Validates a clearing transfer operation's signature.
     * @dev Calls `isClearingTransferSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _protectedClearingOperation Details of the clearing operation triggering the transfer.
     * @param _amount Quantity of tokens being transferred.
     * @param _to Recipient address.
     * @param _signature Signature bytes provided by the sender.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a clearing transfer operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _protectedClearingOperation Details of the clearing operation triggering the transfer.
     * @param _to Recipient address.
     * @param _amount Quantity of tokens being transferred.
     * @param _signature Signature bytes provided by the sender.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Validates a clearing redeem operation's signature.
     * @dev Calls `isClearingRedeemSignatureValid` and reverts with `WrongSignature` if invalid.
     * @param _protectedClearingOperation Details of the clearing operation triggering the redemption.
     * @param _amount Quantity of tokens being redeemed.
     * @param _signature Signature bytes provided by the redeemer.
     * @param _name Name of the signing domain.
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
     * @notice Checks validity of a clearing redeem operation's signature.
     * @dev Computes the expected message hash and verifies the signature against it using `_verify`.
     * @param _protectedClearingOperation Details of the clearing operation triggering the redemption.
     * @param _amount Quantity of tokens being redeemed.
     * @param _signature Signature bytes provided by the redeemer.
     * @param _name Name of the signing domain.
     * @return Boolean indicating signature validity.
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
     * @notice Generates a role identifier specific to a partition.
     * @dev Concatenates the base participant role with the partition ID and hashes the result.
     * @param _partition The partition identifier.
     * @return Computed role identifier.
     */
    function protectedPartitionsRole(bytes32 _partition) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _partition));
    }

    /**
     * @notice Calculates the role required for operations on a specific partition.
     * @dev Encodes the base participant role and partition together, then hashes them.
     * @param partition The partition identifier.
     * @return role Computed role identifier.
     */
    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32 role) {
        role = keccak256(abi.encode(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }

    /**
     * @notice Retrieves the storage reference for protected partitions data.
     * @dev Uses inline assembly to load the storage at a predefined slot (`_PROTECTED_PARTITIONS_STORAGE_POSITION`).
     * @return protectedPartitions_ Reference to the storage structure.
     */
    function protectedPartitionsStorage()
        private
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
