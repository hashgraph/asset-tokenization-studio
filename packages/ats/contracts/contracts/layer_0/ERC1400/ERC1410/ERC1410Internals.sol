// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20PermitInternals } from "../ERC20Permit/ERC20PermitInternals.sol";
import { IssueData, BasicTransferInfo } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";

abstract contract ERC1410Internals is ERC20PermitInternals {
    function _addNewTokenHolder(address tokenHolder) internal virtual;
    function _addPartitionTo(uint256 _value, address _account, bytes32 _partition) internal virtual;
    function _afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) internal virtual;
    function _beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal virtual;
    function _deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal virtual;
    function _increaseBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal virtual;
    function _increaseTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1410(bool _multiPartition) internal virtual;
    function _issue(address _tokenHolder, uint256 _value, bytes memory _data) internal virtual;
    function _issueByPartition(IssueData memory _issueData) internal virtual;
    function _reduceBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal virtual;
    function _reduceTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal virtual;
    function _removeTokenHolder(address tokenHolder) internal virtual;
    function _replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal virtual;
    function _transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) internal virtual returns (bytes32);
    function _isERC1410Initialized() internal view virtual returns (bool);
    function _isIssuable() internal view virtual returns (bool);
    function _isMultiPartition() internal view virtual returns (bool);
    function _partitionsOf(address _tokenHolder) internal view virtual returns (bytes32[] memory);
    function _getTokenHolder(uint256 _index) internal view virtual returns (address);
    function _getTokenHolderIndex(address _tokenHolder) internal view virtual returns (uint256);
    function _getTokenHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getTotalTokenHolders() internal view virtual returns (uint256);
    function _checkDefaultPartitionWithSinglePartition(bytes32 _partition) internal view virtual;
    function _validPartition(bytes32 _partition, address _holder) internal view virtual returns (bool);
    function _validPartitionForReceiver(bytes32 _partition, address _to) internal view virtual returns (bool);
    function _validateParams(bytes32 _partition, uint256 _value) internal pure virtual;
}
