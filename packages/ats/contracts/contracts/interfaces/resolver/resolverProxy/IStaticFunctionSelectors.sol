// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IStaticFunctionSelectors {
    /**
     * @notice Gets the static resolver key
     * @return staticResolverKey_ Static resolver key
     */
    function getStaticResolverKey()
        external
        pure
        returns (bytes32 staticResolverKey_);

    /**
     * @notice Gets all function selectors of a facet
     * @return staticFunctionSelectors_ Face functions selectors
     */
    function getStaticFunctionSelectors()
        external
        pure
        returns (bytes4[] memory staticFunctionSelectors_);

    /**
     * @notice Gets all interfaces ids of a facet.
     * @return staticInterfaceIds_ Face interface ids
     */
    function getStaticInterfaceIds()
        external
        pure
        returns (bytes4[] memory staticInterfaceIds_);
}
