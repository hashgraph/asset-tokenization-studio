// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "../../../infrastructure/utils/EvmAccessors.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { ITimeTravel } from "../ITimeTravel.sol";
import { TimeTravelProvider } from "./TimeTravelProvider.sol";
import { TimeTravelStorageWrapper } from "./TimeTravelStorageWrapper.sol";
import { _TIME_TRAVEL_RESOLVER_KEY } from "../constants/resolverKeys.sol";

contract TimeTravelFacet is IStaticFunctionSelectors, ITimeTravel, TimeTravelProvider {
    function changeSystemTimestamp(uint256 newTimestamp) external override {
        if (newTimestamp == 0) {
            revert InvalidTimestamp(newTimestamp);
        }

        uint256 oldTimestamp = TimeTravelStorageWrapper.getTimestampOverride();
        TimeTravelStorageWrapper.setTimestampOverride(newTimestamp);

        emit SystemTimestampChanged(oldTimestamp, newTimestamp);
    }

    function resetSystemTimestamp() external override {
        TimeTravelStorageWrapper.setTimestampOverride(0);
        emit SystemTimestampReset();
    }

    function changeSystemBlocknumber(uint256 _newSystemBlocknumber) external override {
        if (_newSystemBlocknumber == 0) {
            revert InvalidBlocknumber(_newSystemBlocknumber);
        }

        uint256 oldBlocknumber = TimeTravelStorageWrapper.getBlockNumberOverride();
        TimeTravelStorageWrapper.setBlockNumberOverride(_newSystemBlocknumber);

        emit SystemBlocknumberChanged(oldBlocknumber, _newSystemBlocknumber);
    }

    function resetSystemBlocknumber() external override {
        TimeTravelStorageWrapper.setBlockNumberOverride(0);
        emit SystemBlocknumberReset();
    }

    function blockTimestamp() external view override returns (uint256) {
        return TimeTravelStorageWrapper.getBlockTimestamp();
    }

    /*
     * @dev Check the chainId of the current block (only for testing)
     * @param chainId The chainId to check
     */
    function checkBlockChainid(uint256 chainId) external view {
        if (EvmAccessors.getChainId() != chainId) revert WrongChainId();
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
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.blockTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.checkBlockChainid.selector;
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemBlocknumber.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemBlocknumber.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITimeTravel).interfaceId;
    }
}
