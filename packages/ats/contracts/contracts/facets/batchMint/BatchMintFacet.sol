// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchMint } from "./IBatchMint.sol";
import { BatchMint } from "./BatchMint.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BATCH_MINT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BatchMintFacet
 * @notice Diamond facet that exposes the ERC-3643 `batchMint` operation, registered under
 *         `_BATCH_MINT_RESOLVER_KEY`.
 * @dev Inherits minting logic from `BatchMint` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for static selector registration.
 *      Exposes one selector: `batchMint`.
 *      No library links are required for deployment.
 * @author Hashgraph Asset Tokenization
 */
contract BatchMintFacet is BatchMint, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BATCH_MINT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.batchMint.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBatchMint).interfaceId;
        }
    }
}
