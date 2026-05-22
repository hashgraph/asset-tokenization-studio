// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchMint, RESOLVER_KEY_BATCH_MINT } from "./IBatchMint.sol";
import { BatchMint } from "./BatchMint.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BatchMintFacet
 * @notice Diamond facet that exposes the ERC-3643 `batchMint` operation, registered under
 *         `RESOLVER_KEY_BATCH_MINT`.
 * @dev Inherits minting logic from `BatchMint` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for static selector registration.
 *      Exposes one selector: `batchMint`.
 *      No library links are required for deployment.
 * @author Hashgraph Asset Tokenization
 */
contract BatchMintFacet is BatchMint, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BATCH_MINT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.batchMint.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBatchMint).interfaceId);
    }
}
