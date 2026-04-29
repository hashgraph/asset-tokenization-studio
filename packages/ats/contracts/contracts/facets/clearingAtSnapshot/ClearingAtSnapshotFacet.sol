// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingAtSnapshot } from "./IClearingAtSnapshot.sol";
import { ClearingAtSnapshot } from "./ClearingAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ClearingAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted aggregate cleared-balance query through the
 *         `IClearingAtSnapshot` interface, registered under `_CLEARING_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev Inherits read logic from `ClearingAtSnapshot` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes one selector: `clearedBalanceOfAtSnapshot`.
 */
contract ClearingAtSnapshotFacet is ClearingAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.clearedBalanceOfAtSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearingAtSnapshot).interfaceId;
        }
    }
}
