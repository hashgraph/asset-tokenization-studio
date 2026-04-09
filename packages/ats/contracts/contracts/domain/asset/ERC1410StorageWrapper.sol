// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC1410 } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import {
    _ERC1410_BASIC_STORAGE_POSITION,
    _ERC1410_OPERATOR_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "./ERC20VotesStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IProtectedPartitions } from "../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { _checkNounceAndDeadline } from "../../infrastructure/utils/ERC712.sol";

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

    // Guard Functions

    // Initialization

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool multiPartition) internal {
        erc1410BasicStorage().multiPartition = multiPartition;
        erc1410BasicStorage().initialized = true;
    }

    function reduceBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }

        uint256 fromBalance = balanceOfByPartition(partition, from);

        if (fromBalance < value) {
            revert IERC20.InsufficientBalance(from, fromBalance, value, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[from][partition] - 1;

        if (erc1410Storage.partitions[from][index].amount == value) {
            deletePartitionForHolder(from, partition, index);
        } else {
            erc1410Storage.partitions[from][index].amount -= value;
        }
        ERC20StorageWrapper.reduceBalance(from, value);
    }

    function deletePartitionForHolder(address holder, bytes32 partition, uint256 index) internal {
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 lastIndex = erc1410Storage.partitions[holder].length - 1;
        if (index != lastIndex) {
            erc1410Storage.partitions[holder][index] = erc1410Storage.partitions[holder][lastIndex];
            erc1410Storage.partitionToIndex[holder][erc1410Storage.partitions[holder][index].partition] = index + 1;
        }
        delete erc1410Storage.partitionToIndex[holder][partition];
        erc1410Storage.partitions[holder].pop();
    }

    function increaseBalanceByPartition(address from, uint256 value, bytes32 partition) internal {
        if (!validPartition(partition, from)) {
            revert IERC1410Types.InvalidPartition(from, partition);
        }

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        erc1410Storage.partitions[from][erc1410Storage.partitionToIndex[from][partition] - 1].amount += value;
        ERC20StorageWrapper.increaseBalance(from, value);
    }

    function addPartitionTo(uint256 value, address account, bytes32 partition) internal {
        AdjustBalancesStorageWrapper.pushLabafUserPartition(account, AdjustBalancesStorageWrapper.getAbaf());

        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();

        erc1410Storage.partitions[account].push(Partition(value, partition));
        erc1410Storage.partitionToIndex[account][partition] = erc1410BasicStorage().partitions[account].length;

        if (value != 0) ERC20StorageWrapper.increaseBalance(account, value);
    }

    function replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();

        uint256 index = basicStorage.tokenHolderIndex[oldTokenHolder];
        basicStorage.tokenHolderIndex[newTokenHolder] = index;
        basicStorage.tokenHolders[index] = newTokenHolder;
        basicStorage.tokenHolderIndex[oldTokenHolder] = 0;
    }

    function addNewTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();

        unchecked {
            uint256 nextIndex = ++basicStorage.totalTokenHolders;
            basicStorage.tokenHolders[nextIndex] = tokenHolder;
            basicStorage.tokenHolderIndex[tokenHolder] = nextIndex;
        }
    }

    function removeTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();

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
        unchecked {
            --basicStorage.totalTokenHolders;
        }
    }

    function authorizeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = true;
        emit IERC1410Types.AuthorizedOperator(operator, EvmAccessors.getMsgSender());
    }

    function revokeOperator(address operator) internal {
        erc1410OperatorStorage().approvals[EvmAccessors.getMsgSender()][operator] = false;
        emit IERC1410Types.RevokedOperator(operator, EvmAccessors.getMsgSender());
    }

    function authorizeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = true;
        emit IERC1410Types.AuthorizedOperatorByPartition(partition, operator, EvmAccessors.getMsgSender());
    }

    function revokeOperatorByPartition(bytes32 partition, address operator) internal {
        erc1410OperatorStorage().partitionApprovals[EvmAccessors.getMsgSender()][partition][operator] = false;
        emit IERC1410Types.RevokedOperatorByPartition(partition, operator, EvmAccessors.getMsgSender());
    }

    function transferByPartition(
        address from,
        IERC1410Types.BasicTransferInfo memory basicTransferInfo,
        bytes32 partition,
        bytes memory data,
        address operator,
        bytes memory operatorData
    ) internal returns (bytes32) {
        beforeTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);

        reduceBalanceByPartition(from, basicTransferInfo.value, partition);

        if (!validPartitionForReceiver(partition, basicTransferInfo.to)) {
            addPartitionTo(basicTransferInfo.value, basicTransferInfo.to, partition);
        } else {
            increaseBalanceByPartition(basicTransferInfo.to, basicTransferInfo.value, partition);
        }

        // Emit transfer event AFTER all partition balance changes are complete.
        // This ensures TransferByPartition is emitted when partitions[] changes.
        emit IERC1410Types.TransferByPartition(
            partition,
            operator,
            from,
            basicTransferInfo.to,
            basicTransferInfo.value,
            data,
            operatorData
        );

        if (from != basicTransferInfo.to && partition == _DEFAULT_PARTITION) {
            (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    from,
                    basicTransferInfo.to,
                    basicTransferInfo.value
                ),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }

        afterTokenTransfer(partition, from, basicTransferInfo.to, basicTransferInfo.value);

        return partition;
    }

    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata operatorTransferData
    ) internal returns (bytes32) {
        return
            transferByPartition(
                operatorTransferData.from,
                IERC1410Types.BasicTransferInfo(operatorTransferData.to, operatorTransferData.value),
                operatorTransferData.partition,
                operatorTransferData.data,
                EvmAccessors.getMsgSender(),
                operatorTransferData.operatorData
            );
    }

    function issueByPartition(IERC1410Types.IssueData memory issueData) internal {
        validateParams(issueData.partition, issueData.value);

        beforeTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);

        if (!validPartitionForReceiver(issueData.partition, issueData.tokenHolder)) {
            addPartitionTo(issueData.value, issueData.tokenHolder, issueData.partition);
        } else {
            increaseBalanceByPartition(issueData.tokenHolder, issueData.value, issueData.partition);
        }

        increaseTotalSupplyByPartition(issueData.partition, issueData.value);

        if (issueData.partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper.erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.created.selector, issueData.tokenHolder, issueData.value),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }

        afterTokenTransfer(issueData.partition, address(0), issueData.tokenHolder, issueData.value);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410Types.TransferByPartition(
            issueData.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            issueData.tokenHolder,
            issueData.value,
            issueData.data,
            ""
        );

        emit IERC1410Types.IssuedByPartition(
            issueData.partition,
            EvmAccessors.getMsgSender(),
            issueData.tokenHolder,
            issueData.value,
            issueData.data
        );
    }

    function redeemByPartition(
        bytes32 partition,
        address from,
        address operator,
        uint256 value,
        bytes memory data,
        bytes memory operatorData
    ) internal {
        beforeTokenTransfer(partition, from, address(0), value);

        reduceBalanceByPartition(from, value, partition);

        // RULE 2: Emit TransferByPartition when ERC1410BasicStorage.partitions change
        emit IERC1410Types.TransferByPartition(partition, operator, from, address(0), value, data, operatorData);

        reduceTotalSupplyByPartition(partition, value);

        if (partition == _DEFAULT_PARTITION) {
            ERC3643StorageWrapper.erc3643Storage().compliance.functionCall(
                abi.encodeWithSelector(ICompliance.destroyed.selector, from, value),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }

        afterTokenTransfer(partition, from, address(0), value);

        emit IERC1410Types.RedeemedByPartition(partition, operator, from, value, data, operatorData);
    }

    function protectedTransferFromByPartition(
        bytes32 partition,
        address from,
        address to,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData
    ) internal returns (bytes32) {
        _checkNounceAndDeadline(
            protectionData.nounce,
            from,
            NonceStorageWrapper.getNonceFor(from),
            protectionData.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkTransferSignature(
            partition,
            from,
            to,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(protectionData.nounce, from);

        return
            transferByPartition(
                from,
                IERC1410Types.BasicTransferInfo(to, amount),
                partition,
                "",
                EvmAccessors.getMsgSender(),
                ""
            );
    }

    function protectedRedeemFromByPartition(
        bytes32 partition,
        address from,
        uint256 amount,
        IProtectedPartitions.ProtectionData calldata protectionData
    ) internal {
        _checkNounceAndDeadline(
            protectionData.nounce,
            from,
            NonceStorageWrapper.getNonceFor(from),
            protectionData.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkRedeemSignature(
            partition,
            from,
            amount,
            protectionData,
            ERC20StorageWrapper.getName()
        );
        NonceStorageWrapper.setNonceFor(protectionData.nounce, from);

        redeemByPartition(partition, from, EvmAccessors.getMsgSender(), amount, "", "");
    }

    function beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        triggerAndSyncAll(partition, from, to);

        bool addTo;
        bool removeFrom;

        if (from == address(0)) {
            // mint | issue
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            // balanceOf instead of balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && ERC20StorageWrapper.balanceOf(to) == 0) addTo = true;
        } else if (to == address(0)) {
            // burn | redeem
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateTotalSupplySnapshot(partition);
            if (
                amount > 0 &&
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(from, TimeTravelStorageWrapper.getBlockTimestamp()) ==
                amount
            ) removeFrom = true;
        }
        // transfer
        else {
            SnapshotsStorageWrapper.updateAccountSnapshot(from, partition);
            SnapshotsStorageWrapper.updateAccountSnapshot(to, partition);
            // balanceOf instead of balanceOfAdjusted because we are comparing it to 0
            if (amount > 0 && ERC20StorageWrapper.balanceOf(to) == 0) addTo = true;
            if (
                amount > 0 &&
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(from, TimeTravelStorageWrapper.getBlockTimestamp()) ==
                amount
            ) removeFrom = true;
        }

        if (!(addTo || removeFrom)) return;
        if (addTo && removeFrom) {
            SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
            replaceTokenHolder(to, from);
            return;
        }
        if (addTo) {
            SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
            addNewTokenHolder(to);
            return;
        }
        SnapshotsStorageWrapper.updateTokenHolderSnapshot(from);
        SnapshotsStorageWrapper.updateTokenHolderSnapshot(getTokenHolder(getTotalTokenHolders()));
        SnapshotsStorageWrapper.updateTotalTokenHolderSnapshot();
        removeTokenHolder(from);
    }

    function afterTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal {
        // Hook for ERC20Votes integration - emit DelegateVotesChanged when voting power changes
        ERC20VotesStorageWrapper.afterTokenTransfer(partition, from, to, amount);
    }

    function triggerAndSyncAll(bytes32 partition, address from, address to) internal {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        syncBalanceAdjustments(partition, from, to);
    }

    function syncBalanceAdjustments(bytes32 partition, address from, address to) internal {
        // adjust the total supply for the partition
        AdjustBalancesStorageWrapper.adjustTotalAndMaxSupplyForPartition(partition);

        // adjust "from" total and partition balance
        if (from != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, from);

        // adjust "to" total and partition balance
        if (to != address(0)) adjustTotalBalanceAndPartitionBalanceFor(partition, to);
    }

    function adjustTotalSupplyByPartition(bytes32 partition, uint256 factor) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] *= factor;
    }

    function adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        ERC1410BasicStorage storage basicStorage = erc1410BasicStorage();
        _adjustPartitionBalanceFor(basicStorage, abaf, partition, account);
        ERC20StorageWrapper.adjustTotalBalanceFor(abaf, account);
    }

    function reduceTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    function increaseTotalSupply(uint256 value) internal {
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    function reduceTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] -= value;
        ERC20StorageWrapper.reduceTotalSupply(value);
    }

    function increaseTotalSupplyByPartition(bytes32 partition, uint256 value) internal {
        erc1410BasicStorage().totalSupplyByPartition[partition] += value;
        ERC20StorageWrapper.increaseTotalSupply(value);
    }

    function totalSupply() internal view returns (uint256) {
        return ERC20StorageWrapper.totalSupply();
    }

    function totalSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return erc1410BasicStorage().totalSupplyByPartition[partition];
    }

    function totalSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return totalSupply() * pendingABAF;
    }

    function totalSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        return
            totalSupplyByPartition(partition) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByPartition(partition)
            );
    }

    function balanceOf(address tokenHolder) internal view returns (uint256) {
        return ERC20StorageWrapper.balanceOf(tokenHolder);
    }

    function balanceOfByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        if (!validPartition(partition, tokenHolder)) return 0;
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        return
            erc1410Storage.partitions[tokenHolder][erc1410Storage.partitionToIndex[tokenHolder][partition] - 1].amount;
    }

    function balanceOfAdjustedAt(address tokenHolder, uint256 timestamp) internal view returns (uint256) {
        return
            balanceOf(tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByUser(tokenHolder)
            );
    }

    function balanceOfByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return
            balanceOfByPartition(partition, tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getLabafByUserAndPartition(partition, tokenHolder)
            );
    }

    function partitionsOf(address tokenHolder) internal view returns (bytes32[] memory partitionsList) {
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        uint256 length = erc1410Storage.partitions[tokenHolder].length;
        partitionsList = new bytes32[](length);
        for (uint256 i; i < length; ) {
            partitionsList[i] = erc1410Storage.partitions[tokenHolder][i].partition;
            unchecked {
                ++i;
            }
        }
        return partitionsList;
    }

    function validPartition(bytes32 partition, address holder) internal view returns (bool) {
        return validPartitionForReceiver(partition, holder);
    }

    function validPartitionForReceiver(bytes32 partition, address to) internal view returns (bool) {
        return erc1410BasicStorage().partitionToIndex[to][partition] != 0;
    }

    function getTokenHolders(uint256 pageIndex, uint256 pageLength) internal view returns (address[] memory holders_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);
        uint256 size = Pagination.getSize(start, end, getTotalTokenHolders());
        holders_ = new address[](size);
        ERC1410BasicStorage storage erc1410Storage = erc1410BasicStorage();
        unchecked {
            for (uint256 i; i < size; ++i) holders_[i] = erc1410Storage.tokenHolders[++start];
        }
    }

    function getTokenHolder(uint256 index) internal view returns (address) {
        return erc1410BasicStorage().tokenHolders[index];
    }

    function getTotalTokenHolders() internal view returns (uint256) {
        return erc1410BasicStorage().totalTokenHolders;
    }

    function getTokenHolderIndex(address tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().tokenHolderIndex[tokenHolder];
    }

    function isMultiPartition() internal view returns (bool) {
        return erc1410BasicStorage().multiPartition;
    }

    function isERC1410Initialized() internal view returns (bool) {
        return erc1410BasicStorage().initialized;
    }

    function isOperator(address operator, address tokenHolder) internal view returns (bool) {
        return erc1410OperatorStorage().approvals[tokenHolder][operator];
    }

    function isOperatorForPartition(
        bytes32 partition,
        address operator,
        address tokenHolder
    ) internal view returns (bool) {
        return erc1410OperatorStorage().partitionApprovals[tokenHolder][partition][operator];
    }

    function isAuthorized(bytes32 partition, address operator, address tokenHolder) internal view returns (bool) {
        return isOperator(operator, tokenHolder) || isOperatorForPartition(partition, operator, tokenHolder);
    }

    // Guard functions (internal view)

    function requireOperator(bytes32 partition, address from) internal view {
        if (!isAuthorized(partition, EvmAccessors.getMsgSender(), from))
            revert IERC1410Types.Unauthorized(EvmAccessors.getMsgSender(), from, partition);
    }

    function requireWithoutMultiPartition() internal view {
        if (isMultiPartition()) revert IERC1410Types.NotAllowedInMultiPartitionMode();
    }

    function requireDefaultPartitionWithSinglePartition(bytes32 partition) internal view {
        if (!isMultiPartition() && partition != _DEFAULT_PARTITION)
            revert IERC1410Types.PartitionNotAllowedInSinglePartitionMode(partition);
    }

    function validateParams(bytes32 partition, uint256 value) internal pure {
        if (value == 0) {
            revert IERC1410Types.ZeroValue();
        }
        if (partition == bytes32(0)) {
            revert IERC1410Types.ZeroPartition();
        }
    }

    function requireValidAddress(address account) internal pure {
        AddressValidation.checkZeroAddress(account);
    }

    function erc1410BasicStorage() internal pure returns (ERC1410BasicStorage storage erc1410BasicStorage_) {
        bytes32 position = _ERC1410_BASIC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    function erc1410OperatorStorage() internal pure returns (ERC1410OperatorStorage storage erc1410OperatorStorage_) {
        bytes32 position = _ERC1410_OPERATOR_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410OperatorStorage_.slot := position
        }
    }

    function _adjustPartitionBalanceFor(
        ERC1410BasicStorage storage basicStorage,
        uint256 abaf,
        bytes32 partition,
        address account
    ) private {
        uint256 partitionsIndex = basicStorage.partitionToIndex[account][partition];
        if (partitionsIndex == 0) return;
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactorByTokenHolderAndPartitionIndex(
            abaf,
            account,
            partitionsIndex
        );
        uint256 oldAmount = basicStorage.partitions[account][partitionsIndex - 1].amount;
        uint256 newAmount = oldAmount * factor;
        if (newAmount != oldAmount) {
            basicStorage.partitions[account][partitionsIndex - 1].amount = newAmount;
            unchecked {
                emit IERC1410Types.TransferByPartition(
                    partition,
                    EvmAccessors.getMsgSender(),
                    address(0),
                    address(0),
                    newAmount - oldAmount,
                    "",
                    ""
                );
            }
        }
        AdjustBalancesStorageWrapper.updateLabafByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
    }
}
