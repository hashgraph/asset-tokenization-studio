// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title MockBatchFacet
 * @notice Minimal diamond facet for multi-batch initializer testing.
 * @dev Each instance carries a unique resolver key set at deploy time, allowing
 *      registration of >10 distinct facets in a BLR config without selector
 *      collisions.  No function selectors are exposed — the facet only needs
 *      to satisfy BLR registration and config-resolution requirements.
 *
 *      Does NOT inherit IStaticFunctionSelectors because the interface declares
 *      getStaticResolverKey() as `pure`, while reading an `immutable` requires
 *      `view`.  The ABI signatures are identical so the BLR can still call
 *      getStaticResolverKey() via IStaticFunctionSelectors(addr).getStaticResolverKey().
 */
contract MockBatchFacet {
    bytes32 private immutable _resolverKey;

    constructor(bytes32 resolverKey_) {
        _resolverKey = resolverKey_;
    }

    function getStaticResolverKey() external view returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _resolverKey;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        return new bytes4[](0);
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        return new bytes4[](0);
    }
}
