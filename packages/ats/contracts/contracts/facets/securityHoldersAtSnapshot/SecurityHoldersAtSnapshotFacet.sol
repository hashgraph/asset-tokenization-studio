// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurityHoldersAtSnapshot } from "./ISecurityHoldersAtSnapshot.sol";
import { SecurityHoldersAtSnapshot } from "./SecurityHoldersAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  SecurityHoldersAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes paginated token-holder queries at a given snapshot via
 *         `ISecurityHoldersAtSnapshot`, registered under
 *         `_SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev    Exposes two selectors: `getTokenHoldersAtSnapshot` and
 *         `getTotalTokenHoldersAtSnapshot`. Inherits read logic from
 *         `SecurityHoldersAtSnapshot` and satisfies `IStaticFunctionSelectors` for Diamond
 *         proxy selector registration.
 */
contract SecurityHoldersAtSnapshotFacet is SecurityHoldersAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalTokenHoldersAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTokenHoldersAtSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ISecurityHoldersAtSnapshot).interfaceId;
        }
    }
}
