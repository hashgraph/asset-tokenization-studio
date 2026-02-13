// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC3643Management } from "../../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../../layer_1/interfaces/ERC3643/ICompliance.sol";
import { IssueData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { LowLevelCall } from "../../common/libraries/LowLevelCall.sol";
import { ERC1410OperatorStorageWrapper } from "./ERC1410OperatorStorageWrapper.sol";

abstract contract ERC1410StandardStorageWrapper is ERC1410OperatorStorageWrapper {
    using LowLevelCall for address;

    function _beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal override {
        _triggerAndSyncAll(partition, from, to);

        bool addTo;
        bool removeFrom;

        if (from == address(0)) {
            // mint | issue
            _updateAccountSnapshot(to, partition);
            _updateTotalSupplySnapshot(partition);
            // _balanceOf instead of _balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && _balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            // burn | redeem
            _updateAccountSnapshot(from, partition);
            _updateTotalSupplySnapshot(partition);
            if (amount > 0 && _balanceOfAdjustedAt(from, _blockTimestamp()) == amount) removeFrom = true;
        }
        // transfer
        else {
            _updateAccountSnapshot(from, partition);
            _updateAccountSnapshot(to, partition);
            // _balanceOf instead of _balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && _balanceOf(to) == 0) addTo = true;
            if (amount > 0 && _balanceOfAdjustedAt(from, _blockTimestamp()) == amount) removeFrom = true;
        }

        if (addTo && removeFrom) {
            _updateTokenHolderSnapshot(from);
            _replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            _updateTotalTokenHolderSnapshot();
            _addNewTokenHolder(to);
            return;
        }
        if (removeFrom) {
            _updateTokenHolderSnapshot(from);
            _updateTokenHolderSnapshot(_getTokenHolder(_getTotalTokenHolders()));
            _updateTotalTokenHolderSnapshot();
            _removeTokenHolder(from);
        }
    }

    function _triggerAndSyncAll(bytes32 _partition, address _from, address _to) internal override {
        _callTriggerPendingScheduledCrossOrderedTasks();
        _syncBalanceAdjustments(_partition, _from, _to);
    }

    function _syncBalanceAdjustments(bytes32 _partition, address _from, address _to) internal override {
        // adjust the total supply for the partition
        _adjustTotalAndMaxSupplyForPartition(_partition);

        // adjust "from" total and partition balance
        if (_from != address(0)) _adjustTotalBalanceAndPartitionBalanceFor(_partition, _from);

        // adjust "to" total and partition balance
        if (_to != address(0)) _adjustTotalBalanceAndPartitionBalanceFor(_partition, _to);
    }

    function _addPartitionTo(uint256 _value, address _account, bytes32 _partition) internal override {
        _pushLabafUserPartition(_account, _getAbaf());

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        erc1410Storage.partitions[_account].push(Partition(_value, _partition));
        erc1410Storage.partitionToIndex[_account][_partition] = _erc1410BasicStorage().partitions[_account].length;

        if (_value != 0) _increaseBalance(_account, _value);
    }

    function _issueByPartition(IssueData memory _issueData) internal override {
        _validateParams(_issueData.partition, _issueData.value);

        _beforeTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value);

        if (!_validPartitionForReceiver(_issueData.partition, _issueData.tokenHolder)) {
            _addPartitionTo(_issueData.value, _issueData.tokenHolder, _issueData.partition);
        } else {
            _increaseBalanceByPartition(_issueData.tokenHolder, _issueData.value, _issueData.partition);
        }

        _increaseTotalSupplyByPartition(_issueData.partition, _issueData.value);

        if (_issueData.partition == _DEFAULT_PARTITION) {
            _erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.created.selector, _issueData.tokenHolder, _issueData.value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(_issueData.partition, address(0), _issueData.tokenHolder, _issueData.value);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit TransferByPartition(
            _issueData.partition,
            _msgSender(),
            address(0),
            _issueData.tokenHolder,
            _issueData.value,
            _issueData.data,
            ""
        );

        emit IssuedByPartition(
            _issueData.partition,
            _msgSender(),
            _issueData.tokenHolder,
            _issueData.value,
            _issueData.data
        );
    }

    function _redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal override {
        _beforeTokenTransfer(_partition, _from, address(0), _value);

        _reduceBalanceByPartition(_from, _value, _partition);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit TransferByPartition(_partition, _operator, _from, address(0), _value, _data, _operatorData);

        _reduceTotalSupplyByPartition(_partition, _value);

        if (_partition == _DEFAULT_PARTITION) {
            _erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.destroyed.selector, _from, _value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(_partition, _from, address(0), _value);

        emit RedeemedByPartition(_partition, _operator, _from, _value, _data, _operatorData);
    }

    function _reduceTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal override {
        _erc1410BasicStorage().totalSupplyByPartition[_partition] -= _value;
        _reduceTotalSupply(_value);
    }

    function _increaseTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal override {
        _erc1410BasicStorage().totalSupplyByPartition[_partition] += _value;
        _increaseTotalSupply(_value);
    }

    function _totalSupplyAdjustedAt(uint256 _timestamp) internal view override returns (uint256) {
        (uint256 pendingABAF, ) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return _totalSupply() * pendingABAF;
    }

    function _totalSupplyByPartitionAdjustedAt(
        bytes32 _partition,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getLabafByPartition(_partition));
        return _totalSupplyByPartition(_partition) * factor;
    }

    function _balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getLabafByUser(_tokenHolder));
        return _balanceOf(_tokenHolder) * factor;
    }

    function _balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getLabafByUserAndPartition(_partition, _tokenHolder)
        );
        return _balanceOfByPartition(_partition, _tokenHolder) * factor;
    }

    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }

    function _getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            _balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    function _validateParams(bytes32 _partition, uint256 _value) internal pure override {
        if (_value == uint256(0)) {
            revert ZeroValue();
        }
        if (_partition == bytes32(0)) {
            revert ZeroPartition();
        }
    }
}
