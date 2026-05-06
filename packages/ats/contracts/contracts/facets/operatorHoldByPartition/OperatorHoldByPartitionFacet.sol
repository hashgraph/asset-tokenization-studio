// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorHoldByPartition } from "./IOperatorHoldByPartition.sol";
import { OperatorHoldByPartition } from "./OperatorHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  OperatorHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes operator-initiated hold creation on a partition via
 *         `IOperatorHoldByPartition`, registered under
 *         `_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY`.
 * @dev    Exposes one selector: `operatorCreateHoldByPartition`.
 *         Must be registered in the BusinessLogicResolver before use.
 */
contract OperatorHoldByPartitionFacet is OperatorHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.operatorCreateHoldByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IOperatorHoldByPartition).interfaceId;
        }
    }
}
