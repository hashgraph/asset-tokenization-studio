// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelStorageWrapper } from "./TimeTravelStorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { ITimeTravel } from "../ITimeTravel.sol";
import { _TIME_TRAVEL_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { Common } from "../../../domain/Common.sol";
import { LocalContext } from "../../../infrastructure/utils/LocalContext.sol";

contract TimeTravelFacet is IStaticFunctionSelectors, ITimeTravel, Common, TimeTravelStorageWrapper {
    function changeSystemTimestamp(uint256 newTimestamp) external override {
        _changeSystemTimestamp(newTimestamp);
    }

    function resetSystemTimestamp() external override {
        _resetSystemTimestamp();
    }

    function changeSystemBlocknumber(uint256 _newSystemBlocknumber) external override {
        _changeSystemBlocknumber(_newSystemBlocknumber);
    }

    function resetSystemBlocknumber() external override {
        _resetSystemBlocknumber();
    }
    // Test-only helper function to push coupon IDs into deprecated bond storage for testing migration
    function testOnlyAddDeprecatedCoupon(uint256 _couponID) external {
        _bondStorage().DEPRECATED_couponsOrderedListByIds.push(_couponID);
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

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
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
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.blockTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.checkBlockChainid.selector;
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemBlocknumber.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemBlocknumber.selector;
        staticFunctionSelectors_[selectorIndex++] = this.testOnlyAddDeprecatedCoupon.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITimeTravel).interfaceId;
    }

    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
