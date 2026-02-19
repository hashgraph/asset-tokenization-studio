// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { Common } from "../../layer_0/common/Common.sol";

/**
 * @dev Test facet for ERC20 storage migration testing.
 * Exposes storage accessors to set up legacy storage state and verify migration behavior.
 * This is an abstract contract to avoid implementing interface requirements not relevant for testing.
 * This facet is for testing purposes only and should not be deployed to production.
 */
contract MigrationFacetTest is Common, IStaticFunctionSelectors {
    // ========================================
    // Legacy Storage Setters (for test setup)
    // ========================================

    /**
     * @dev Sets the legacy totalSupply in ERC1410BasicStorage (for testing).
     * @param _value The totalSupply value to set in legacy storage
     */
    function setLegacyTotalSupply(uint256 _value) external {
        _erc1410BasicStorage().DEPRECATED_totalSupply = _value;
    }

    /**
     * @dev Sets the legacy balance for a specific token holder in ERC1410BasicStorage (for testing).
     * @param _tokenHolder The address of the token holder
     * @param _value The balance value to set in legacy storage
     */
    function setLegacyBalance(address _tokenHolder, uint256 _value) external {
        _erc1410BasicStorage().DEPRECATED_balances[_tokenHolder] = _value;
    }

    // ========================================
    // Migration Functions (for test verification)
    // ========================================

    /**
     * @dev Migrates the totalSupply from legacy to new storage (manually trigger for testing).
     */
    function migrateTotalSupply() external {
        _migrateTotalSupplyIfNeeded();
    }

    /**
     * @dev Migrates the balance for a specific token holder from legacy to new storage (manually trigger for testing).
     * @param _tokenHolder The address of the token holder
     */
    function migrateBalance(address _tokenHolder) external {
        _migrateBalanceIfNeeded(_tokenHolder);
    }

    /**
     * @dev Migrates all balances for all token holders from legacy to new storage.
     */
    function migrateAll() external {
        ERC1410BasicStorage storage $ = _erc1410BasicStorage();

        // Migrate total supply
        if ($.DEPRECATED_totalSupply != 0) {
            _migrateTotalSupplyIfNeeded();
        }

        // Migrate all balances
        uint256 totalTokenHolders = $.totalTokenHolders;
        for (uint256 i = 1; i <= totalTokenHolders; i++) {
            address holder = $.tokenHolders[i];
            _migrateBalanceIfNeeded(holder);
        }
    }

    // ========================================
    // Legacy Storage Getters (for test verification)
    // ========================================

    /**
     * @dev Gets the legacy totalSupply from ERC1410BasicStorage.
     * @return legacyTotalSupply_ The totalSupply in legacy storage
     */
    function getLegacyTotalSupply() external view returns (uint256 legacyTotalSupply_) {
        legacyTotalSupply_ = _erc1410BasicStorage().DEPRECATED_totalSupply;
    }

    /**
     * @dev Gets the legacy balance for a specific token holder from ERC1410BasicStorage.
     * @param _tokenHolder The address of the token holder
     * @return legacyBalance_ The balance in legacy storage
     */
    function getLegacyBalance(address _tokenHolder) external view returns (uint256 legacyBalance_) {
        legacyBalance_ = _erc1410BasicStorage().DEPRECATED_balances[_tokenHolder];
    }

    // ========================================
    // New Storage Getters (for test verification)
    // ========================================

    /**
     * @dev Gets the new totalSupply from ERC20Storage.
     * @return newTotalSupply_ The totalSupply in new storage
     */
    function getNewTotalSupply() external view returns (uint256 newTotalSupply_) {
        newTotalSupply_ = _erc20Storage().totalSupply;
    }

    /**
     * @dev Gets the new balance for a specific token holder from ERC20Storage.
     * @param _tokenHolder The address of the token holder
     * @return newBalance_ The balance in new storage
     */
    function getNewBalance(address _tokenHolder) external view returns (uint256 newBalance_) {
        newBalance_ = _erc20Storage().balances[_tokenHolder];
    }

    /**
     * @dev Checks if the totalSupply has been migrated (legacy is 0 and new is non-zero).
     * @return isMigrated_ True if migrated, false otherwise
     */
    function isMigrated() external view returns (bool isMigrated_) {
        ERC1410BasicStorage storage $ = _erc1410BasicStorage();

        // Check totalSupply migration
        if ($.DEPRECATED_totalSupply != 0) {
            return false;
        }

        // Check if any balances are still in legacy storage
        uint256 totalTokenHolders = $.totalTokenHolders;
        for (uint256 i = 1; i <= totalTokenHolders; i++) {
            address holder = $.tokenHolders[i];
            if ($.DEPRECATED_balances[holder] != 0) {
                return false;
            }
        }

        return true;
    }

    // ========================================
    // IStaticFunctionSelectors Implementation
    // ========================================

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

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](0);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = keccak256("MigrationFacetTest");
    }
}
