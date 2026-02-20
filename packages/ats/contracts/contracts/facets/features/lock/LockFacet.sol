// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Lock } from "./Lock.sol";
import { ILock } from "../interfaces/ILock.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _LOCK_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract LockFacet is Lock, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](12);
        staticFunctionSelectors_[selectorIndex++] = this.lockByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.releaseByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockedAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.release.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockCountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockFor.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ILock).interfaceId;
    }
}
