// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshot, RESOLVER_KEY_FREEZE_AT_SNAPSHOT } from "./IFreezeAtSnapshot.sol";
import { FreezeAtSnapshot } from "./FreezeAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title FreezeAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing snapshot-aware frozen balance queries via
 *         `IFreezeAtSnapshot`, registered under `RESOLVER_KEY_FREEZE_AT_SNAPSHOT`.
 * @dev Consolidates `frozenBalanceOfAtSnapshot` previously hosted in `SnapshotsFacet`.
 *      Exposes 1 selector: `frozenBalanceOfAtSnapshot`.
 */
contract FreezeAtSnapshotFacet is FreezeAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_FREEZE_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeFreezeAtSnapshot.selector, this.frozenBalanceOfAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFreezeAtSnapshot).interfaceId);
    }
}
