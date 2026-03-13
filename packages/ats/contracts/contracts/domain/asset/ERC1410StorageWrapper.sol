// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import {
    _ERC1410_BASIC_STORAGE_POSITION,
    _ERC1410_OPERATOR_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { BasicTransferInfo, IssueData, OperatorTransferData } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { IProtectedPartitionsStorageWrapper } from "../core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { checkNounceAndDeadline } from "../../infrastructure/utils/ERC712Lib.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";

/// @dev Represents a fungible set of tokens.
struct Partition {
    uint256 amount;
    bytes32 partition;
}

struct ERC1410BasicStorage {
    // solhint-disable-next-line var-name-mixedcase
    uint256 DEPRECATED_totalSupply;
    mapping(bytes32 => uint256) totalSupplyByPartition;
    /// @dev Mapping from investor to aggregated balance across all investor token sets
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_balances;
    /// @dev Mapping from investor to their partitions
    mapping(address => Partition[]) partitions;
    /// @dev Mapping from (investor, partition) to index of corresponding partition in partitions
    /// @dev Stored value is always greater by 1 to avoid the 0 value of every index
    mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
    bool multiPartition;
    bool initialized;
    mapping(address => uint256) tokenHolderIndex;
    mapping(uint256 => address) tokenHolders;
    uint256 totalTokenHolders;
}

struct ERC1410OperatorStorage {
    /// @dev Mapping from (investor, partition, operator) to approved status
    mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
    /// @dev Mapping from (investor, operator) to approved status (can be used against any partition)
    mapping(address => mapping(address => bool)) approvals;
}

library ERC1410StorageWrapper {
    using LowLevelCall for address;

    // ============================================================================
    // Storage Accessors
    // ============================================================================

    function _erc1410BasicStorage() internal pure returns (ERC1410BasicStorage storage erc1410BasicStorage_) {
        bytes32 position = _ERC1410_BASIC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    function _erc1410OperatorStorage() internal pure returns (ERC1410OperatorStorage storage erc1410OperatorStorage_) {
        bytes32 position = _ERC1410_OPERATOR_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }

    // ============================================================================
    // Guard Functions
    // ============================================================================

    // solhint-disable-next-line ordering
    function _requireWithoutMultiPartition() internal view {
        if (_isMultiPartition()) revert IERC1410StorageWrapper.NotAllowedInMultiPartitionMode();
    }

    function _requireDefaultPartitionWithSinglePartition(bytes32 partition) internal view {
        if (!_isMultiPartition() && partition != _DEFAULT_PARTITION)
            revert IERC1410StorageWrapper.PartitionNotAllowedInSinglePartitionMode(partition);
    }

    function _requireValidAddress(address account) internal pure {
        if (account == address(0)) revert IERC1410StorageWrapper.ZeroAddressNotAllowed();
    }

    function _requireOperator(bytes32 partition, address from) internal view {
        if (!_isAuthorized(partition, msg.sender, from))
            revert IERC1410StorageWrapper.Unauthorized(msg.sender, from, partition);
    }

    // ============================================================================
    // Initialization
    // ============================================================================

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1410(bool multiPartition) internal {
        _erc1410BasicStorage().multiPartition = multiPartition;
        _erc1410BasicStorage().initialized = true;
    }

    // ============================================================================
    // Core Partition Operations
    // ============================================================================

    function _reduceBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!_validPartition(partition, from)) {
            revert IERC1410StorageWrapper.InvalidPartition(from, partition);
        }

        uint256 fromBalance = _balanceOfByPartition(partition, from);

        if (fromBalance < value) {
            revert IERC1410StorageWrapper.InsufficientBalance(from, fromBalance, value, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[from][partition] - 1;

        if (erc1410Storage.partitions[from][index].amount == value) {
            _deletePartitionForHolder(from, partition, index);
        } else {
            erc1410Storage.partitions[from][index].amount -= value;
        }
        ERC20StorageWrapper._reduceBalance(from, value);
    }

    function _deletePartitionForHolder(address holder, bytes32 partition, uint256 index) internal {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        if (index != erc1410Storage.partitions[holder].length - 1) {
            erc1410Storage.partitions[holder][index] = erc1410Storage.partitions[holder][
                erc1410Storage.partitions[holder].length - 1
            ];
            erc1410Storage.partitionToIndex[holder][erc1410Storage.partitions[holder][index].partition] = index + 1;
        }
        delete erc1410Storage.partitionToIndex[holder][partition];
        erc1410Storage.partitions[holder].pop();
    }

    function _increaseBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!_validPartition(partition, from)) {
            revert IERC1410StorageWrapper.InvalidPartition(from, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[from][partition] - 1;

        erc1410Storage.partitions[from][index].amount += value;
        ERC20StorageWrapper._increaseBalance(from, value);
    }

    function _addPartitionTo(uint256 value, address account, bytes32 partition) internal {
        AdjustBalancesStorageWrapper._pushLabafUserPartition(account, AdjustBalancesStorageWrapper._getAbaf());

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        erc1410Storage.partitions[account].push(Partition(value, partition));
        erc1410Storage.partitionToIndex[account][partition] = _erc1410BasicStorage().partitions[account].length;

        if (value != 0) ERC20StorageWrapper._increaseBalance(account, value);
    }

    // ============================================================================
    // Token Holder Management
    // ============================================================================

    function _replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = _erc1410BasicStorage();

        uint256 index = basicStorage.tokenHolderIndex[oldTokenHolder];
        basicStorage.tokenHolderIndex[newTokenHolder] = index;
        basicStorage.tokenHolders[index] = newTokenHolder;
        basicStorage.tokenHolderIndex[oldTokenHolder] = 0;
    }

    function _addNewTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = _erc1410BasicStorage();

        uint256 nextIndex = ++basicStorage.totalTokenHolders;
        basicStorage.tokenHolders[nextIndex] = tokenHolder;
        basicStorage.tokenHolderIndex[tokenHolder] = nextIndex;
    }

    function _removeTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = _erc1410BasicStorage();

        uint256 lastIndex = basicStorage.totalTokenHolders;
        if (lastIndex > 1) {
            uint256 tokenHolderIndex = basicStorage.tokenHolderIndex[tokenHolder];
            if (tokenHolderIndex < lastIndex) {
                address lastTokenHolder = basicStorage.tokenHolders[lastIndex];

                basicStorage.tokenHolderIndex[lastTokenHolder] = tokenHolderIndex;
                basicStorage.tokenHolders[tokenHolderIndex] = lastTokenHolder;
            }
        }

        basicStorage.tokenHolderIndex[tokenHolder] = 0;
        basicStorage.totalTokenHolders--;
    }

    // ============================================================================
    // Operator Functions
    // ============================================================================

    function _authorizeOperator(address operator) internal {
        _erc1410OperatorStorage().approvals[msg.sender][operator] = true;
        emit IERC1410StorageWrapper.AuthorizedOperator(operator, msg.sender);
    }

    function _revokeOperator(address operator) internal {
        _erc1410OperatorStorage().approvals[msg.sender][operator] = false;
        emit IERC1410StorageWrapper.RevokedOperator(operator, msg.sender);
    }

    function _authorizeOperatorByPartition(bytes32 partition, address operator) internal {
        _erc1410OperatorStorage().partitionApprovals[msg.sender][partition][operator] = true;
        emit IERC1410StorageWrapper.AuthorizedOperatorByPartition(partition, operator, msg.sender);
    }

    function _revokeOperatorByPartition(bytes32 partition, address operator) internal {
        _erc1410OperatorStorage().partitionApprovals[msg.sender][partition][operator] = false;
        emit IERC1410StorageWrapper.RevokedOperatorByPartition(partition, operator, msg.sender);
    }

    function _isOperator(address operator, address tokenHolder) internal view returns (bool) {
        return _erc1410OperatorStorage().approvals[tokenHolder][operator];
    }

    function _isOperatorForPartition(
        bytes32 partition,
        address operator,
        address tokenHolder
    ) internal view returns (bool) {
        return _erc1410OperatorStorage().partitionApprovals[tokenHolder][partition][operator];
    }

    function _isAuthorized(bytes32 partition, address operator, address tokenHolder) internal view returns (bool) {
        return _isOperator(operator, tokenHolder) || _isOperatorForPartition(partition, operator, tokenHolder);
    }

    // ============================================================================
    // Transfer Operations
    // ============================================================================

    function _transferByPartition(
        address from,
        BasicTransferInfo memory basicTransferInfo,
        bytes32 partition,
        bytes memory data,
        address operator,
        bytes memory operatorData
    ) internal returns (bytes32) {
        _beforeTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);

        _reduceBalanceByPartition(from, basicTransferInfo.value, partition);

        if (!_validPartitionForReceiver(partition, basicTransferInfo.to)) {
            _addPartitionTo(basicTransferInfo.value, basicTransferInfo.to, partition);
        } else {
            _increaseBalanceByPartition(basicTransferInfo.to, basicTransferInfo.value, partition);
        }

        // Emit transfer event AFTER all partition balance changes are complete.
        // This ensures TransferByPartition is emitted when partitions[] changes.
        emit IERC1410StorageWrapper.TransferByPartition(
            partition,
            operator,
            from,
            basicTransferInfo.to,
            basicTransferInfo.value,
            data,
            operatorData
        );

        if (from != basicTransferInfo.to && partition == _DEFAULT_PARTITION) {
            (ERC3643StorageWrapper._erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    from,
                    basicTransferInfo.to,
                    basicTransferInfo.value
                ),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);

        return partition;
    }

    function _operatorTransferByPartition(
        OperatorTransferData calldata operatorTransferData
    ) internal returns (bytes32) {
        return
            _transferByPartition(
                operatorTransferData.from,
                BasicTransferInfo(operatorTransferData.to, operatorTransferData.value),
                operatorTransferData.partition,
                operatorTransferData.data,
                msg.sender,
                operatorTransferData.operatorData
            );
    }

    // ============================================================================
    // Issue / Redeem Operations
    // ============================================================================

    function _issueByPartition(IssueData memory issueData) internal {
        _validateParams(issueData.partition, issueData.value);

        _beforeTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);

        if (!_validPartitionForReceiver(issueData.partition, issueData.tokenHolder)) {
            _addPartitionTo(issueData.value, issueData.tokenHolder, issueData.partition);
        } else {
            _increaseBalanceByPartition(issueData.tokenHolder, issueData.value, issueData.partition);
        }

        _increaseTotalSupplyByPartition(issueData.partition, issueData.value);

        if (issueData.partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper._erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.created.selector, issueData.tokenHolder, issueData.value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410StorageWrapper.TransferByPartition(
            issueData.partition,
            msg.sender,
            address(0),
            issueData.tokenHolder,
            issueData.value,
            issueData.data,
            ""
        );

        emit IERC1410StorageWrapper.IssuedByPartition(
            issueData.partition,
            msg.sender,
            issueData.tokenHolder,
            issueData.value,
            issueData.data
        );
    }

    function _redeemByPartition(
        bytes32 partition,
        address from,
        address operator,
        uint256 value,
        bytes memory data,
        bytes memory operatorData
    ) internal {
        _beforeTokenTransfer(partition, from, address(0), value);

        _reduceBalanceByPartition(from, value, partition);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410StorageWrapper.TransferByPartition(
            partition,
            operator,
            from,
            address(0),
            value,
            data,
            operatorData
        );

        _reduceTotalSupplyByPartition(partition, value);

        if (partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper._erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.destroyed.selector, from, value),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(partition, from, address(0), value);

        emit IERC1410StorageWrapper.RedeemedByPartition(partition, operator, from, value, data, operatorData);
    }

    // ============================================================================
    // Protected Partitions Operations
    // ============================================================================

    function _protectedTransferFromByPartition(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata protectionData
    ) internal returns (bytes32) {
        checkNounceAndDeadline(
            protectionData.nounce,
            from,
            NonceStorageWrapper._getNonceFor(from),
            protectionData.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkTransferSignature(partition, from, to, amount, protectionData);

        NonceStorageWrapper._setNonceFor(protectionData.nounce, from);

        return _transferByPartition(from, BasicTransferInfo(to, amount), partition, "", msg.sender, "");
    }

    function _protectedRedeemFromByPartition(
        bytes32 partition,
        address from,
        uint256 amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata protectionData
    ) internal {
        checkNounceAndDeadline(
            protectionData.nounce,
            from,
            NonceStorageWrapper._getNonceFor(from),
            protectionData.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkRedeemSignature(partition, from, amount, protectionData);
        NonceStorageWrapper._setNonceFor(protectionData.nounce, from);

        _redeemByPartition(partition, from, msg.sender, amount, "", "");
    }

    // ============================================================================
    // Sync / Trigger Functions
    // ============================================================================

    function _beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        _triggerAndSyncAll(partition, from, to);

        bool addTo;
        bool removeFrom;

        if (from == address(0)) {
            // mint | issue
            SnapshotsStorageWrapper._updateAccountSnapshot(to, partition);
            SnapshotsStorageWrapper._updateTotalSupplySnapshot(partition);
            // balanceOf instead of balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && ERC20StorageWrapper._balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            // burn | redeem
            SnapshotsStorageWrapper._updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper._updateTotalSupplySnapshot(partition);
            if (amount > 0 && AdjustBalancesStorageWrapper._balanceOfAdjustedAt(from, block.timestamp) == amount)
                removeFrom = true;
        }
        // transfer
        else {
            SnapshotsStorageWrapper._updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper._updateAccountSnapshot(to, partition);
            // balanceOf instead of balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && ERC20StorageWrapper._balanceOf(to) == 0) addTo = true;
            if (amount > 0 && AdjustBalancesStorageWrapper._balanceOfAdjustedAt(from, block.timestamp) == amount)
                removeFrom = true;
        }

        if (addTo && removeFrom) {
            SnapshotsStorageWrapper._updateTokenHolderSnapshot(from);
            _replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            SnapshotsStorageWrapper._updateTotalTokenHolderSnapshot();
            _addNewTokenHolder(to);
            return;
        }
        if (removeFrom) {
            SnapshotsStorageWrapper._updateTokenHolderSnapshot(from);
            SnapshotsStorageWrapper._updateTokenHolderSnapshot(_getTokenHolder(_getTotalTokenHolders()));
            SnapshotsStorageWrapper._updateTotalTokenHolderSnapshot();
            _removeTokenHolder(from);
        }
    }

    // solhint-disable-next-line no-empty-blocks
    function _afterTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        // Hook for future extensions (e.g., ERC20VotesStorageWrapper)
        // Currently a no-op
    }

    function _triggerAndSyncAll(bytes32 partition, address from, address to) internal {
        ScheduledTasksStorageWrapper._callTriggerPendingScheduledCrossOrderedTasks();
        _syncBalanceAdjustments(partition, from, to);
    }

    function _syncBalanceAdjustments(bytes32 partition, address from, address to) internal {
        // adjust the total supply for the partition
        AdjustBalancesStorageWrapper._adjustTotalAndMaxSupplyForPartition(partition);

        // adjust "from" total and partition balance
        if (from != address(0)) _adjustTotalBalanceAndPartitionBalanceFor(partition, from);

        // adjust "to" total and partition balance
        if (to != address(0)) _adjustTotalBalanceAndPartitionBalanceFor(partition, to);
    }

    // ============================================================================
    // Read Functions - Supply
    // ============================================================================

    function _totalSupply() internal view returns (uint256) {
        return ERC20StorageWrapper._totalSupply();
    }

    function _totalSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return _erc1410BasicStorage().totalSupplyByPartition[partition];
    }

    function _totalSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = ScheduledTasksStorageWrapper._getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return _totalSupply() * pendingABAF;
    }

    function _totalSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getLabafByPartition(partition)
        );
        return _totalSupplyByPartition(partition) * factor;
    }

    // ============================================================================
    // Read Functions - Balance
    // ============================================================================

    function _balanceOf(address tokenHolder) internal view returns (uint256) {
        return ERC20StorageWrapper._balanceOf(tokenHolder);
    }

    function _balanceOfByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        if (_validPartition(partition, tokenHolder)) {
            ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
            return
                erc1410Storage
                .partitions[tokenHolder][erc1410Storage.partitionToIndex[tokenHolder][partition] - 1].amount;
        } else {
            return 0;
        }
    }

    function _balanceOfAdjustedAt(address tokenHolder, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getLabafByUser(tokenHolder)
        );
        return _balanceOf(tokenHolder) * factor;
    }

    function _balanceOfByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getLabafByUserAndPartition(partition, tokenHolder)
        );
        return _balanceOfByPartition(partition, tokenHolder) * factor;
    }

    // ============================================================================
    // Read Functions - Partitions
    // ============================================================================

    function _partitionsOf(address tokenHolder) internal view returns (bytes32[] memory) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        bytes32[] memory partitionsList = new bytes32[](erc1410Storage.partitions[tokenHolder].length);
        for (uint256 i = 0; i < erc1410Storage.partitions[tokenHolder].length; i++) {
            partitionsList[i] = erc1410Storage.partitions[tokenHolder][i].partition;
        }
        return partitionsList;
    }

    function _validPartition(bytes32 partition, address holder) internal view returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        if (erc1410Storage.partitionToIndex[holder][partition] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function _validPartitionForReceiver(bytes32 partition, address to) internal view returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[to][partition];

        return index != 0;
    }

    // ============================================================================
    // Read Functions - Token Holders
    // ============================================================================

    function _getTokenHolders(uint256 pageIndex, uint256 pageLength) internal view returns (address[] memory holders_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        holders_ = new address[](Pagination.getSize(start, end, _getTotalTokenHolders()));

        start++; // because tokenHolders starts from 1

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        for (uint256 i = 0; i < holders_.length; i++) {
            holders_[i] = erc1410Storage.tokenHolders[start + i];
        }
    }

    function _getTokenHolder(uint256 index) internal view returns (address) {
        return _erc1410BasicStorage().tokenHolders[index];
    }

    function _getTotalTokenHolders() internal view returns (uint256) {
        return _erc1410BasicStorage().totalTokenHolders;
    }

    function _getTokenHolderIndex(address tokenHolder) internal view returns (uint256) {
        return _erc1410BasicStorage().tokenHolderIndex[tokenHolder];
    }

    // ============================================================================
    // Read Functions - Mode & State
    // ============================================================================

    function _isMultiPartition() internal view returns (bool) {
        return _erc1410BasicStorage().multiPartition;
    }

    function _isERC1410Initialized() internal view returns (bool) {
        return _erc1410BasicStorage().initialized;
    }

    // ============================================================================
    // Adjustment Functions
    // ============================================================================

    function _adjustTotalSupplyByPartition(bytes32 partition, uint256 factor) internal {
        _erc1410BasicStorage().totalSupplyByPartition[partition] *= factor;
    }

    function _adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = AdjustBalancesStorageWrapper._getAbaf();
        ERC1410BasicStorage storage basicStorage = _erc1410BasicStorage();
        _adjustPartitionBalanceFor(basicStorage, abaf, partition, account);
        ERC20StorageWrapper._adjustTotalBalanceFor(abaf, account);
    }

    function _reduceTotalSupply(uint256 value) internal {
        ERC20StorageWrapper._reduceTotalSupply(value);
    }

    function _increaseTotalSupply(uint256 value) internal {
        ERC20StorageWrapper._increaseTotalSupply(value);
    }

    function _reduceTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        _erc1410BasicStorage().totalSupplyByPartition[partition] -= value;
        ERC20StorageWrapper._reduceTotalSupply(value);
    }

    function _increaseTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        _erc1410BasicStorage().totalSupplyByPartition[partition] += value;
        ERC20StorageWrapper._increaseTotalSupply(value);
    }

    // ============================================================================
    // Validation
    // ============================================================================

    function _validateParams(bytes32 partition, uint256 value) internal pure {
        if (value == uint256(0)) {
            revert IERC1410StorageWrapper.ZeroValue();
        }
        if (partition == bytes32(0)) {
            revert IERC1410StorageWrapper.ZeroPartition();
        }
    }

    // ============================================================================
    // Private Helpers
    // ============================================================================

    function _adjustPartitionBalanceFor(
        ERC1410BasicStorage storage basicStorage,
        uint256 abaf,
        bytes32 partition,
        address account
    ) private {
        uint256 partitionsIndex = basicStorage.partitionToIndex[account][partition];
        if (partitionsIndex == 0) return;
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactorByTokenHolderAndPartitionIndex(
            abaf,
            account,
            partitionsIndex
        );
        uint256 oldAmount = basicStorage.partitions[account][partitionsIndex - 1].amount;
        uint256 newAmount = oldAmount * factor;
        if (newAmount != oldAmount) {
            basicStorage.partitions[account][partitionsIndex - 1].amount = newAmount;
            unchecked {
                emit IERC1410StorageWrapper.TransferByPartition(
                    partition,
                    msg.sender,
                    address(0),
                    address(0),
                    newAmount - oldAmount,
                    "",
                    ""
                );
            }
        }
        AdjustBalancesStorageWrapper._updateLabafByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
    }

    // Missing error definition in interface - adding as fallback
    error ZeroAddressNotAllowed();
}
