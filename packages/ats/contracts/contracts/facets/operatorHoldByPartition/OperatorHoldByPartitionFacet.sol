// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorHoldByPartition, RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION } from "./IOperatorHoldByPartition.sol";
import { OperatorHoldByPartition } from "./OperatorHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  OperatorHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes operator-initiated hold creation on a partition via
 *         `IOperatorHoldByPartition`, registered under
 *         `RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION`.
 * @dev    Exposes one selector: `operatorCreateHoldByPartition`.
 *         Must be registered in the BusinessLogicResolver before use.
 */
contract OperatorHoldByPartitionFacet is OperatorHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeOperatorHoldByPartition.selector,
                this.operatorCreateHoldByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IOperatorHoldByPartition).interfaceId);
    }
}
