// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurityHolders, RESOLVER_KEY_SECURITYHOLDERS } from "./ISecurityHolders.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title SecurityHolders
 * @notice Abstract contract implementing token-holder enumeration queries for the
 *         Diamond-based token system.
 * @dev Delegates reader methods to `ERC1410StorageWrapper` and is intended to be
 *      inherited by `SecurityHoldersFacet`.
 */
abstract contract SecurityHolders is ISecurityHolders, Modifiers {
    /// @inheritdoc ISecurityHolders
    function initializeSecurityHolders()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_SECURITYHOLDERS)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_SECURITYHOLDERS);
        emit SecurityHoldersInitialized();
    }
    /// @inheritdoc ISecurityHolders
    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory holders) {
        return ERC1410StorageWrapper.getTokenHolders(_pageIndex, _pageLength);
    }

    /// @inheritdoc ISecurityHolders
    function getTotalSecurityHolders() external view virtual override returns (uint256 count) {
        return ERC1410StorageWrapper.getTotalTokenHolders();
    }
}
