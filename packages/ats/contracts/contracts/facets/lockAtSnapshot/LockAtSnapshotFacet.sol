// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockAtSnapshot, RESOLVER_KEY_LOCK_AT_SNAPSHOT } from "./ILockAtSnapshot.sol";
import { LockAtSnapshot } from "./LockAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  LockAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the locked-balance-at-snapshot query via
 *         `ILockAtSnapshot`, registered under `RESOLVER_KEY_LOCK_AT_SNAPSHOT`.
 * @dev    Exposes one selector: `lockedBalanceOfAtSnapshot`. Inherits read logic from
 *         `LockAtSnapshot` and satisfies `IStaticFunctionSelectors` for Diamond proxy
 *         selector registration.
 */
contract LockAtSnapshotFacet is LockAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_LOCK_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.lockedBalanceOfAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ILockAtSnapshot).interfaceId);
    }
}
