// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRead } from "../interfaces/clearing/IClearingRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibClearingOps } from "../../../lib/orchestrator/LibClearingOps.sol";

abstract contract ClearingReadFacetBase is IClearingRead, IStaticFunctionSelectors {
    function getClearedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return LibClearingOps.getClearedAmountForAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return LibClearingOps.getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType
    ) external view override returns (uint256 clearingCount_) {
        return LibClearing.getClearingCount(_partition, _tokenHolder, _clearingOperationType);
    }

    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory clearingsId_) {
        return LibClearing.getClearingIds(_partition, _tokenHolder, _clearingOperationType, _pageIndex, _pageLength);
    }

    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOpeartionType,
        uint256 _clearingId
    ) external view override returns (address thirdParty_) {
        thirdParty_ = LibClearing.getClearingThirdParty(_partition, _tokenHolder, _clearingOpeartionType, _clearingId);
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingThirdParty.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingRead).interfaceId;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIRTUAL
    // ════════════════════════════════════════════════════════════════════════════════════

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
