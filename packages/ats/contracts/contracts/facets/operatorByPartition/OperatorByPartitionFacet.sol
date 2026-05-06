// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorByPartition } from "./IOperatorByPartition.sol";
import { OperatorByPartition } from "./OperatorByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _OPERATOR_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  OperatorByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes per-partition operator management via
 *         `IOperatorByPartition`, registered under `_OPERATOR_BY_PARTITION_RESOLVER_KEY`.
 * @dev    Exposes five selectors:
 *           - `authorizeOperatorByPartition`
 *           - `revokeOperatorByPartition`
 *           - `isOperatorForPartition`
 *           - `operatorTransferByPartition`
 *           - `operatorRedeemByPartition`
 */
contract OperatorByPartitionFacet is OperatorByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _OPERATOR_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 5;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.operatorRedeemByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.operatorTransferByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isOperatorForPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.revokeOperatorByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.authorizeOperatorByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IOperatorByPartition).interfaceId;
        }
    }
}
