// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshot } from "./IHoldAtSnapshot.sol";
import { HoldAtSnapshot } from "./HoldAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  HoldAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the held-balance-at-snapshot query via
 *         `IHoldAtSnapshot`, registered under `_HOLD_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev    Exposes one selector: `heldBalanceOfAtSnapshot`. Inherits read logic from
 *         `HoldAtSnapshot` and satisfies `IStaticFunctionSelectors` for Diamond proxy
 *         selector registration.
 */
contract HoldAtSnapshotFacet is HoldAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IHoldAtSnapshot).interfaceId;
        }
    }
}
