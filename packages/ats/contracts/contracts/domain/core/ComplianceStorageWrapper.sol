// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC3643 } from "../../facets/core/ERC3643/IERC3643.sol";
import { IERC3643Management } from "../../facets/core/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/core/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../facets/core/ERC3643/IIdentityRegistry.sol";
import { ABAFStorageWrapper } from "../asset/ABAFStorageWrapper.sol";

/// @title ComplianceStorageWrapper — ERC3643 compliance, identity, and freeze management library
/// @notice Centralized compliance functionality extracted from ERC3643StorageWrapper.sol
/// @dev Uses free function storage accessors from ExternalStorage.sol, no inheritance
library ComplianceStorageWrapper {
    event ComplianceAdded(address indexed compliance);

    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL STATE-CHANGING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Sets the compliance contract
    function setCompliance(address compliance) internal {
        erc3643Storage().compliance = compliance;
        emit ComplianceAdded(compliance);
    }

    /// @dev Sets the identity registry contract
    function setIdentityRegistry(address identityRegistry) internal {
        erc3643Storage().identityRegistry = identityRegistry;
    }

    /// @dev Sets the OnchainID address
    function setOnchainID(address onchainID) internal {
        erc3643Storage().onchainID = onchainID;
    }

    /// @dev Sets the frozen amount for an address
    function setFrozenAmountFor(address account, uint256 amount) internal {
        erc3643Storage().frozenTokens[account] = amount;
    }

    /// @dev Sets the frozen amount for an address in a specific partition
    function setFrozenAmountForByPartition(bytes32 partition, address account, uint256 amount) internal {
        erc3643Storage().frozenTokensByPartition[account][partition] = amount;
    }

    /// @dev Increases the frozen amount for an address
    function increaseFrozenAmountFor(address account, uint256 amount) internal {
        erc3643Storage().frozenTokens[account] += amount;
    }

    /// @dev Increases the frozen amount for an address in a specific partition
    function increaseFrozenAmountForByPartition(bytes32 partition, address account, uint256 amount) internal {
        erc3643Storage().frozenTokensByPartition[account][partition] += amount;
    }

    /// @dev Decreases the frozen amount for an address
    function decreaseFrozenAmountFor(address account, uint256 amount) internal {
        erc3643Storage().frozenTokens[account] -= amount;
    }

    /// @dev Decreases the frozen amount for an address in a specific partition
    function decreaseFrozenAmountForByPartition(bytes32 partition, address account, uint256 amount) internal {
        erc3643Storage().frozenTokensByPartition[account][partition] -= amount;
    }

    /// @dev Multiplies the frozen amount for an address by a factor
    function multiplyFrozenAmountFor(address account, uint256 factor) internal {
        erc3643Storage().frozenTokens[account] *= factor;
    }

    /// @dev Multiplies the frozen amount for an address in a specific partition by a factor
    function multiplyFrozenAmountForByPartition(bytes32 partition, address account, uint256 factor) internal {
        erc3643Storage().frozenTokensByPartition[account][partition] *= factor;
    }

    /// @dev Marks an address as recovered
    function setRecovered(address account, bool recovered) internal {
        erc3643Storage().addressRecovered[account] = recovered;
    }

    /// @dev Marks ERC3643 as initialized
    function setERC3643Initialized(bool initialized) internal {
        erc3643Storage().initialized = initialized;
    }

    /// @notice Freeze tokens by partition for an account
    function freezeTokensByPartition(bytes32 partition, address account, uint256 amount) internal {
        increaseFrozenAmountFor(account, amount);
        increaseFrozenAmountForByPartition(partition, account, amount);
    }

    /// @notice Unfreeze tokens by partition for an account
    function unfreezeTokensByPartition(bytes32 partition, address account, uint256 amount) internal {
        decreaseFrozenAmountFor(account, amount);
        decreaseFrozenAmountForByPartition(partition, account, amount);
    }

    /// @notice Update frozen token amounts by factor (for balance adjustments)
    function updateFrozenAmountByFactor(address account, uint256 factor) internal {
        multiplyFrozenAmountFor(account, factor);
    }

    /// @notice Update frozen token amounts by partition by factor
    function updateFrozenAmountByPartitionByFactor(bytes32 partition, address account, uint256 factor) internal {
        multiplyFrozenAmountForByPartition(partition, account, factor);
    }

    /// @notice Sync frozen amount LABAF with current ABAF
    function updateTotalFreeze(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = ABAFStorageWrapper.getAbaf();
        uint256 labaf = ABAFStorageWrapper.getTotalFrozenLabaf(tokenHolder);
        uint256 labafByPartition = ABAFStorageWrapper.getTotalFrozenLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = ABAFStorageWrapper.calculateFactor(abaf_, labaf);
            updateFrozenAmountByFactor(tokenHolder, factor);
            ABAFStorageWrapper.setTotalFreezeLabaf(tokenHolder, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = ABAFStorageWrapper.calculateFactor(abaf_, labafByPartition);
            updateFrozenAmountByPartitionByFactor(partition, tokenHolder, factorByPartition);
            ABAFStorageWrapper.setTotalFreezeLabafByPartition(partition, tokenHolder, abaf_);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Returns the ICompliance contract address
    function getCompliance() internal view returns (ICompliance) {
        return ICompliance(erc3643Storage().compliance);
    }

    /// @dev Returns the IIdentityRegistry contract address
    function getIdentityRegistry() internal view returns (IIdentityRegistry) {
        return IIdentityRegistry(erc3643Storage().identityRegistry);
    }

    /// @dev Returns the OnchainID address for this token
    function getOnchainID() internal view returns (address) {
        return erc3643Storage().onchainID;
    }

    /// @dev Returns the total frozen amount for an address
    function getFrozenAmountFor(address account) internal view returns (uint256) {
        return erc3643Storage().frozenTokens[account];
    }

    /// @dev Returns the frozen amount for an address in a specific partition
    function getFrozenAmountForByPartition(bytes32 partition, address account) internal view returns (uint256) {
        return erc3643Storage().frozenTokensByPartition[account][partition];
    }

    /// @dev Returns true if an address is marked as recovered
    function isRecovered(address account) internal view returns (bool) {
        return erc3643Storage().addressRecovered[account];
    }

    /// @dev Returns true if ERC3643 is initialized
    function isERC3643Initialized() internal view returns (bool) {
        return erc3643Storage().initialized;
    }

    /// @dev Reverts if an address is marked as recovered
    function requireNotRecovered(address account) internal view {
        if (isRecovered(account)) {
            revert IERC3643Management.WalletRecovered();
        }
    }

    /// @notice Get total frozen tokens for an account
    function getFrozenTokens(address account) internal view returns (uint256) {
        return getFrozenAmountFor(account);
    }

    /// @notice Get frozen tokens by partition for an account
    function getFrozenTokensByPartition(address account, bytes32 partition) internal view returns (uint256) {
        return getFrozenAmountForByPartition(partition, account);
    }

    /// @notice Get ABAF-adjusted frozen amount for an account at a timestamp
    function getFrozenAmountAdjustedAt(address account, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = ABAFStorageWrapper.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return getFrozenAmountFor(account) * factor;
    }

    /// @notice Get ABAF-adjusted frozen amount by partition at a timestamp
    function getFrozenAmountByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256) {
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(timestamp),
            ABAFStorageWrapper.getTotalFrozenLabafByPartition(partition, account)
        );
        return getFrozenAmountForByPartition(partition, account) * factor;
    }

    /// @notice Check if unfreeze amount is valid
    function checkUnfreezeAmount(bytes32 partition, address account, uint256 amount) internal view {
        uint256 frozenAmount = getFrozenAmountByPartitionAdjustedAt(partition, account, block.timestamp);
        if (frozenAmount < amount) {
            revert IERC3643.InsufficientFrozenBalance(account, amount, frozenAmount, partition);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL PURE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Access ERC3643 storage
    function erc3643Storage() internal pure returns (IERC3643Management.ERC3643Storage storage erc3643_) {
        bytes32 pos = _ERC3643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643_.slot := pos
        }
    }
}
