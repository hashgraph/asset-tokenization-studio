// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshot } from "./IFreezeAtSnapshot.sol";
import { FreezeAtSnapshot } from "./FreezeAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _FREEZE_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title FreezeAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing snapshot-aware frozen balance queries via
 *         `IFreezeAtSnapshot`, registered under `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev Consolidates `frozenBalanceOfAtSnapshot` previously hosted in `SnapshotsFacet`.
 *      Exposes 1 selector: `frozenBalanceOfAtSnapshot`.
 */
contract FreezeAtSnapshotFacet is FreezeAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZE_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.frozenBalanceOfAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFreezeAtSnapshot).interfaceId);
    }
}
