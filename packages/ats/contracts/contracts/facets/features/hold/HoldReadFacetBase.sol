// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldRead } from "../interfaces/hold/IHoldRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { HoldIdentifier } from "../interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibHold } from "../../../lib/domain/LibHold.sol";
import { LibHoldOps } from "../../../lib/orchestrator/LibHoldOps.sol";

abstract contract HoldReadFacetBase is IHoldRead, IStaticFunctionSelectors {
    function getHeldAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return LibHoldOps.getHeldAmountForAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return LibHoldOps.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return LibHold.getHoldCountForByPartition(_partition, _tokenHolder);
    }

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return LibHold.getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        override
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        )
    {
        return LibHoldOps.getHoldForByPartitionAdjustedAt(_holdIdentifier, _getBlockTimestamp());
    }

    function getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) external view override returns (address thirdParty_) {
        thirdParty_ = LibHold.getHoldThirdParty(_holdIdentifier);
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this.getHeldAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHeldAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldThirdParty.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHoldRead).interfaceId;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIRTUAL
    // ════════════════════════════════════════════════════════════════════════════════════

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
