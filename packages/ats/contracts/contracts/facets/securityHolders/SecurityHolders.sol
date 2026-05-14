// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurityHolders } from "./ISecurityHolders.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";

/**
 * @title SecurityHolders
 * @notice Abstract base contract for security holder operations
 * @dev Provides forward delegation to ERC1410StorageWrapper
 */
abstract contract SecurityHolders is ISecurityHolders {
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
