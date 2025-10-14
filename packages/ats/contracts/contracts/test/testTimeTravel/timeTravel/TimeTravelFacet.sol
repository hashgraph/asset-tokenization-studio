// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {TimeTravelStorageWrapper} from './TimeTravelStorageWrapper.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {ITimeTravel} from '../interfaces/ITimeTravel.sol';

contract TimeTravelFacet is
    IStaticFunctionSelectors,
    ITimeTravel,
    TimeTravelStorageWrapper
{
    function changeSystemTimestamp(uint256 newTimestamp) external override {
        _changeSystemTimestamp(newTimestamp);
    }

    function resetSystemTimestamp() external override {
        _resetSystemTimestamp();
    }

    function changeSystemBlocknumber(
        uint256 _newSystemBlocknumber
    ) external override {
        _changeSystemBlocknumber(_newSystemBlocknumber);
    }

    function resetSystemBlocknumber() external override {
        _resetSystemBlocknumber();
    }

    function blockTimestamp() external view override returns (uint256) {
        return _blockTimestamp();
    }

    /*
     * @dev Check the chainId of the current block (only for testing)
     * @param chainId The chainId to check
     */
    function checkBlockChainid(uint256 chainId) external pure {
        _checkBlockChainid(chainId);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _TIME_TRAVEL_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this
            .changeSystemTimestamp
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .resetSystemTimestamp
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .blockTimestamp
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .checkBlockChainid
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .changeSystemBlocknumber
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .resetSystemBlocknumber
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITimeTravel).interfaceId;
    }
}
