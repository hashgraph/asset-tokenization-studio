// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { TransferAndLock } from "./TransferAndLock.sol";

/**
 * @title TransferAndLockFacetBase
 * @author Asset Tokenization Studio Team
 * @notice Abstract base that registers the TransferAndLock selectors and interface IDs
 *         for Diamond facets that extend this capability.
 * @dev Concrete subclasses supply the resolver key and initialiser key via overrides.
 */
abstract contract TransferAndLockFacetBase is TransferAndLock, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeTransferAndLock.selector, this.transferAndLock.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ITransferAndLock).interfaceId);
    }
}
