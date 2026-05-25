// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ITransferAndLockByPartition,
    RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION
} from "./ITransferAndLockByPartition.sol";
import { TransferAndLockByPartition } from "./TransferAndLockByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  TransferAndLockByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the partition-aware transfer-and-lock
 *         operation via `ITransferAndLockByPartition`, registered under
 *         `RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION`.
 * @dev    Exposes 1 selector: `transferAndLockByPartition`. Inherits the
 *         implementation from `TransferAndLockByPartition` and satisfies
 *         `IStaticFunctionSelectors` for Diamond proxy selector registration.
 */
contract TransferAndLockByPartitionFacet is TransferAndLockByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.transferAndLockByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ITransferAndLockByPartition).interfaceId);
    }
}
