// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { ERC1410StorageWrapper, ERC1410BasicStorage } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";

/**
 * @title Migration Facet Test Contract
 * @notice Provides testing utilities for ERC20 storage migration functionality
 * @dev Abstract contract exposing storage accessors to simulate legacy states and verify migration behaviour
 * @author Hashgraph
 */
contract MigrationFacetTest is IStaticFunctionSelectors {
    // Legacy Storage Setters (for test setup)

    /**
     * @notice Sets the legacy total supply value for testing purposes
     * @dev Mutates the deprecated storage directly to simulate pre-migration state
     * @param _value The total supply amount to set in legacy storage
     */
    function setLegacyTotalSupply(uint256 _value) external {
        ERC1410StorageWrapper.setLegacyTotalSupply(_value);
    }

    /**
     * @notice Sets the legacy balance for a specific account for testing purposes
     * @dev Mutates the deprecated storage directly to simulate pre-migration state
     * @param _tokenHolder The address whose legacy balance is being set
     * @param _value The balance amount to set in legacy storage
     */
    function setLegacyBalance(address _tokenHolder, uint256 _value) external {
        ERC1410StorageWrapper.setLegacyBalance(_tokenHolder, _value);
    }

    // Migration Functions (for test verification)

    /**
     * @notice Manually triggers migration of total supply from legacy to new storage
     * @dev Callable only for testing to verify migration logic independently
     */
    function migrateTotalSupply() external {
        ERC20StorageWrapper.migrateTotalSupplyIfNeeded();
    }

    /**
     * @notice Manually triggers migration of a specific account's balance from legacy to new storage
     * @dev Callable only for testing to verify migration logic independently
     * @param _tokenHolder The address whose balance should be migrated
     */
    function migrateBalance(address _tokenHolder) external {
        ERC20StorageWrapper.migrateBalanceIfNeeded(_tokenHolder);
    }

    /**
     * @notice Triggers migration of all account balances from legacy to new storage
     * @dev Performs full data migration across all registered token holders
     */
    function migrateAll() external {
        ERC1410StorageWrapper.migrateAll();
    }

    // Legacy Storage Getters (for test verification)

    /**
     * @notice Retrieves the current legacy total supply value
     * @dev Reads directly from the deprecated storage slot for verification
     * @return legacyTotalSupply_ The total supply stored in legacy storage
     */
    function getLegacyTotalSupply() external view returns (uint256 legacyTotalSupply_) {
        legacyTotalSupply_ = ERC1410StorageWrapper.getDeprecatedTotalSupply();
    }

    /**
     * @notice Retrieves the current legacy balance for a specific account
     * @dev Reads directly from the deprecated storage mapping for verification
     * @param _tokenHolder The address whose legacy balance is retrieved
     * @return legacyBalance_ The balance stored in legacy storage
     */
    function getLegacyBalance(address _tokenHolder) external view returns (uint256 legacyBalance_) {
        legacyBalance_ = ERC1410StorageWrapper.getDeprecatedBalanceOf(_tokenHolder);
    }

    // New Storage Getters (for test verification)

    /**
     * @notice Retrieves the current new total supply value
     * @dev Reads from the updated storage structure post-migration
     * @return newTotalSupply_ The total supply stored in new storage
     */
    function getNewTotalSupply() external view returns (uint256 newTotalSupply_) {
        newTotalSupply_ = ERC20StorageWrapper.getNewTotalSuppl();
    }

    /**
     * @notice Retrieves the current new balance for a specific account
     * @dev Reads from the updated storage mapping post-migration
     * @param _tokenHolder The address whose new balance is retrieved
     * @return newBalance_ The balance stored in new storage
     */
    function getNewBalance(address _tokenHolder) external view returns (uint256 newBalance_) {
        newBalance_ = ERC20StorageWrapper.getNewBalanceOf(_tokenHolder);
    }

    /**
     * @notice Verifies whether the total supply has been successfully migrated
     * @dev Checks that legacy storage is zeroed and new storage contains the expected value
     * @return isMigrated_ True if migration is complete, false otherwise
     */
    function isMigrated() external view returns (bool isMigrated_) {
        isMigrated_ = ERC1410StorageWrapper.isMigrated();
    }

    /**
     * @notice Returns function selectors supported by this facet for proxy resolution
     * @dev Implements IStaticFunctionSelectors to enable deterministic proxy routing
     * @return staticFunctionSelectors_ Array of function selectors managed by this facet
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](10);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.setLegacyTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setLegacyBalance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLegacyTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLegacyBalance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNewTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNewBalance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.migrateTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.migrateBalance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.migrateAll.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isMigrated.selector;
    }

    /**
     * @notice Returns interface IDs supported by this facet
     * @dev Currently returns empty array as no additional interfaces are implemented
     * @return staticInterfaceIds_ Empty array of interface IDs
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](0);
    }

    /**
     * @notice Returns resolver key used for identifying this facet in proxy deployments
     * @dev Uses keccak256 hash of contract name for deterministic identification
     * @return staticResolverKey_ Unique identifier for this facet
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = keccak256("MigrationFacetTest");
    }
}
