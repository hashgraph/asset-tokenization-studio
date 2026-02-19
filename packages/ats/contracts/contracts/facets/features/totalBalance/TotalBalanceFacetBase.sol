// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ITotalBalance } from "../interfaces/totalBalance/ITotalBalance.sol";
import { LibTotalBalance } from "../../../lib/orchestrator/LibTotalBalance.sol";

abstract contract TotalBalanceFacetBase is ITotalBalance, IStaticFunctionSelectors {
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return LibTotalBalance.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
    }

    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return LibTotalBalance.getTotalBalanceForByPartitionAdjustedAt(_partition, _account, _getBlockTimestamp());
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITotalBalance).interfaceId;
    }

    function getStaticResolverKey() external pure virtual override returns (bytes32);

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
