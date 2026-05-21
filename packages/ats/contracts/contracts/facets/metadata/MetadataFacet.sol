// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMetadata } from "./IMetadata.sol";
import { Metadata } from "./Metadata.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _METADATA_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title MetadataFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the key/value metadata operations — set and get — as
 *         selectable proxy functions.
 * @dev Inherits `Metadata` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `_METADATA_RESOLVER_KEY` identifies this
 *      facet within the diamond proxy.
 */
contract MetadataFacet is Metadata, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _METADATA_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(this.initializeMetadata.selector, this.getMetadata.selector, this.setMetadata.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IMetadata).interfaceId);
    }
}
