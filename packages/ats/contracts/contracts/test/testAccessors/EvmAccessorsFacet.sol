// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DatesValidation } from "../../infrastructure/utils/DatesValidation.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IEvmAccessorsFacet } from "./IEvmAccessorsFacet.sol";
import { _EVM_ACCESSORS_RESOLVER_KEY } from "../constants/resolverKeys.sol";

contract EvmAccessorsFacet is IStaticFunctionSelectors, IEvmAccessorsFacet {
    function changeSystemTimestamp(uint256 newTimestamp) external override {
        DatesValidation.checkTimestamp(newTimestamp);

        uint256 oldTimestamp = EvmAccessors.getBlockTimestampOverride();
        EvmAccessors.setBlockTimestampOverride(newTimestamp);

        emit SystemTimestampChanged(oldTimestamp, newTimestamp);
    }

    function resetSystemTimestamp() external override {
        EvmAccessors.setBlockTimestampOverride(0);
        emit SystemTimestampReset();
    }

    function changeSystemBlocknumber(uint256 _newSystemBlocknumber) external override {
        if (_newSystemBlocknumber == 0) {
            revert InvalidBlocknumber(_newSystemBlocknumber);
        }

        uint256 oldBlocknumber = EvmAccessors.getBlockNumberOverride();
        EvmAccessors.setBlockNumberOverride(_newSystemBlocknumber);

        emit SystemBlocknumberChanged(oldBlocknumber, _newSystemBlocknumber);
    }

    function resetSystemBlocknumber() external override {
        EvmAccessors.setBlockNumberOverride(0);
        emit SystemBlocknumberReset();
    }

    function changeSystemChainId(uint256 _newChainId) external override {
        if (_newChainId == 0) {
            revert InvalidChainId(_newChainId);
        }

        uint256 oldChainId = EvmAccessors.getChainIdOverride();
        EvmAccessors.setChainIdOverride(_newChainId);

        emit SystemChainIdChanged(oldChainId, _newChainId);
    }

    function resetSystemChainId() external override {
        EvmAccessors.setChainIdOverride(0);
        emit SystemChainIdReset();
    }

    function blockTimestamp() external view override returns (uint256) {
        return EvmAccessors.getBlockTimestamp();
    }

    /*
     * @dev Check the chainId of the current block (only for testing)
     * @param chainId The chainId to check
     */
    function checkBlockChainid(uint256 chainId) external view {
        if (EvmAccessors.getChainId() != chainId) revert WrongChainId();
    }

    // msg.sender / tx.origin writers intentionally omitted: prefer Hardhat impersonation or signer.connect().

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EVM_ACCESSORS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.blockTimestamp.selector;
        staticFunctionSelectors_[selectorIndex++] = this.checkBlockChainid.selector;
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemBlocknumber.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemBlocknumber.selector;
        staticFunctionSelectors_[selectorIndex++] = this.changeSystemChainId.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSystemChainId.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IEvmAccessorsFacet).interfaceId;
    }
}
