// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsDataStorage, protectedPartitionsStorage } from "../../storage/CoreStorage.sol";
import { _PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _WILD_CARD_ROLE } from "../../constants/roles.sol";
import { LibAccess } from "./LibAccess.sol";
import { IProtectedPartitions } from "../../facets/features/interfaces/IProtectedPartitions.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { Hold, ProtectedHold } from "../../facets/features/interfaces/hold/IHold.sol";
import {
    getMessageHashTransfer,
    getMessageHashRedeem,
    getMessageHashCreateHold,
    getMessageHashClearingTransfer,
    getMessageHashClearingCreateHold,
    getMessageHashClearingRedeem,
    verify
} from "./ERC712.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @title LibProtectedPartitions — Protected partitions and signature verification library
/// @notice Extracted from ProtectedPartitionsStorageWrapper for library-based diamond migration
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
/// @dev Signature verification requires caller to provide tokenName and resolverProxyVersion
/// to avoid cross-domain calls
library LibProtectedPartitions {
    function initializeProtectedPartitions(bool protectPartitions) internal returns (bool) {
        ProtectedPartitionsDataStorage storage pps = protectedPartitionsStorage();
        pps.arePartitionsProtected = protectPartitions;
        pps.initialized = true;
        return true;
    }

    function setProtectedPartitions(bool protected_) internal {
        protectedPartitionsStorage().arePartitionsProtected = protected_;
    }

    function arePartitionsProtected() internal view returns (bool) {
        return protectedPartitionsStorage().arePartitionsProtected;
    }

    function checkUnProtectedPartitionsOrWildCardRole() internal view {
        if (arePartitionsProtected() && !LibAccess.hasRole(_WILD_CARD_ROLE, msg.sender)) {
            revert IProtectedPartitions.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }

    function requireProtectedPartitions() internal view {
        if (!arePartitionsProtected()) {
            revert IProtectedPartitions.PartitionsAreUnProtected();
        }
    }

    function isProtectedPartitionInitialized() internal view returns (bool) {
        return protectedPartitionsStorage().initialized;
    }

    function checkTransferSignature(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isTransferSignatureValid(
                partition,
                from,
                to,
                amount,
                protectionData,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isTransferSignatureValid(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashTransfer(
            partition,
            from,
            to,
            amount,
            protectionData.deadline,
            protectionData.nounce
        );
        return
            verify(
                from,
                functionHash,
                protectionData.signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    function checkRedeemSignature(
        bytes32 partition,
        address from,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isRedeemSignatureValid(
                partition,
                from,
                amount,
                protectionData,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isRedeemSignatureValid(
        bytes32 partition,
        address from,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashRedeem(
            partition,
            from,
            amount,
            protectionData.deadline,
            protectionData.nounce
        );
        return
            verify(
                from,
                functionHash,
                protectionData.signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    function checkCreateHoldSignature(
        bytes32 partition,
        address from,
        ProtectedHold memory protectedHold,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isCreateHoldSignatureValid(
                partition,
                from,
                protectedHold,
                signature,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isCreateHoldSignatureValid(
        bytes32 partition,
        address from,
        ProtectedHold memory protectedHold,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashCreateHold(partition, from, protectedHold);

        return
            verify(
                from,
                functionHash,
                signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    function checkClearingCreateHoldSignature(
        IClearing.ProtectedClearingOperation memory protectedClearingOperation,
        Hold memory hold,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isClearingCreateHoldSignatureValid(
                protectedClearingOperation,
                hold,
                signature,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isClearingCreateHoldSignatureValid(
        IClearing.ProtectedClearingOperation memory protectedClearingOperation,
        Hold memory hold,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashClearingCreateHold(protectedClearingOperation, hold);

        return
            verify(
                protectedClearingOperation.from,
                functionHash,
                signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    function checkClearingTransferSignature(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        address to,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isClearingTransferSignatureValid(
                protectedClearingOperation,
                to,
                amount,
                signature,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isClearingTransferSignatureValid(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        address to,
        uint256 amount,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashClearingTransfer(protectedClearingOperation, to, amount);

        return
            verify(
                protectedClearingOperation.from,
                functionHash,
                signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    function checkClearingRedeemSignature(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure {
        if (
            !isClearingRedeemSignatureValid(
                protectedClearingOperation,
                amount,
                signature,
                tokenName,
                resolverProxyVersion,
                chainId,
                tokenAddress
            )
        ) {
            revert IProtectedPartitions.WrongSignature();
        }
    }

    function isClearingRedeemSignatureValid(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        bytes calldata signature,
        string memory tokenName,
        uint256 resolverProxyVersion,
        uint256 chainId,
        address tokenAddress
    ) internal pure returns (bool) {
        bytes32 functionHash = getMessageHashClearingRedeem(protectedClearingOperation, amount);

        return
            verify(
                protectedClearingOperation.from,
                functionHash,
                signature,
                tokenName,
                Strings.toString(resolverProxyVersion),
                chainId,
                tokenAddress
            );
    }

    /// @dev Calculate protected partition role for a partition
    function protectedPartitionsRole(bytes32 partition) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }

    /// @dev Calculate role for partition using encode instead of encodePacked
    function calculateRoleForPartition(bytes32 partition) internal pure returns (bytes32) {
        return keccak256(abi.encode(_PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partition));
    }
}
