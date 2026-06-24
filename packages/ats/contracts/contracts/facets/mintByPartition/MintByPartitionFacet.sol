// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMintByPartition, RESOLVER_KEY_MINT_BY_PARTITION } from "./IMintByPartition.sol";
import { MintByPartition } from "./MintByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title MintByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the ERC-1410 `issueByPartition` operation, registered
 *         under `RESOLVER_KEY_MINT_BY_PARTITION`.
 * @dev Inherits the issuance logic from `MintByPartition` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for static
 *      selector registration.
 *      Exposes one selector: `issueByPartition`.
 *      No library links are required for deployment beyond TokenCoreOps.
 */
contract MintByPartitionFacet is MintByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_MINT_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeMintByPartition.selector, this.issueByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IMintByPartition).interfaceId);
    }
}
