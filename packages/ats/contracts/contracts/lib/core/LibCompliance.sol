// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { erc3643Storage } from "../../storage/ExternalStorage.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../facets/features/interfaces/ERC3643/IIdentityRegistry.sol";

/// @title LibCompliance — ERC3643 compliance and identity management library
/// @notice Centralized compliance functionality extracted from ERC3643StorageWrapper.sol
/// @dev Uses free function storage accessors from ExternalStorage.sol, no inheritance
library LibCompliance {
    event ComplianceAdded(address indexed compliance);

    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );

    // State-changing functions
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

    /// @dev Marks an address as recovered
    function setRecovered(address account, bool recovered) internal {
        erc3643Storage().addressRecovered[account] = recovered;
    }

    /// @dev Marks ERC3643 as initialized
    function setERC3643Initialized(bool initialized) internal {
        erc3643Storage().initialized = initialized;
    }

    // View functions
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
}
