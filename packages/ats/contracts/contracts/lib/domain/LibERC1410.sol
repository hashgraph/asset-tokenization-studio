// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import {
    ERC1410BasicStorage,
    Partition,
    erc1410BasicStorage,
    erc1410OperatorStorage
} from "../../storage/TokenStorage.sol";
import { IERC1410 } from "../../facets/features/interfaces/ERC1400/IERC1410.sol";
import { IERC1410TokenHolder } from "../../facets/features/interfaces/ERC1400/IERC1410TokenHolder.sol";
import { BasicTransferInfo } from "../../facets/features/interfaces/ERC1400/IERC1410Types.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { LibABAF } from "./LibABAF.sol";

/// @title LibERC1410
/// @notice Library for ERC1410 core token operations (partitions, balances, token holders, operators)
/// @dev Extracted from ERC1410BasicStorageWrapperRead + ERC1410OperatorStorageWrapper
///      Note: beforeTokenTransfer/afterTokenTransfer orchestration is handled at facet level.
///      Note: Compliance calls (ICompliance.transferred) are handled at facet level.
library LibERC1410 {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EVENTS (re-emitted from interface)
    // ═══════════════════════════════════════════════════════════════════════════════

    event TransferByPartition(
        bytes32 indexed partition,
        address operator,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    // ═══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════

    error ZeroAddressNotAllowed();

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function initialize(bool _multiPartition) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        s.multiPartition = _multiPartition;
        s.initialized = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BALANCE OPERATIONS (Core state changes)
    // ═══════════════════════════════════════════════════════════════════════════════

    function reduceBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal {
        if (!validPartition(_partition, _from)) {
            revert IERC1410TokenHolder.InvalidPartition(_from, _partition);
        }

        uint256 fromBalance = balanceOfByPartition(_partition, _from);
        if (fromBalance < _value) {
            revert IERC1410TokenHolder.InsufficientBalance(_from, fromBalance, _value, _partition);
        }

        ERC1410BasicStorage storage s = erc1410BasicStorage();
        uint256 index = s.partitionToIndex[_from][_partition] - 1;

        if (s.partitions[_from][index].amount == _value) {
            deletePartitionForHolder(_from, _partition, index);
        } else {
            s.partitions[_from][index].amount -= _value;
        }

        s.balances[_from] -= _value;
    }

    function increaseBalanceByPartition(address _to, uint256 _value, bytes32 _partition) internal {
        if (!validPartition(_partition, _to)) {
            revert IERC1410TokenHolder.InvalidPartition(_to, _partition);
        }

        ERC1410BasicStorage storage s = erc1410BasicStorage();
        uint256 index = s.partitionToIndex[_to][_partition] - 1;

        s.partitions[_to][index].amount += _value;
        s.balances[_to] += _value;
    }

    function addPartitionTo(uint256 _value, address _to, bytes32 _partition) internal {
        LibABAF.pushLabafUserPartition(_to, LibABAF.getAbaf());

        ERC1410BasicStorage storage s = erc1410BasicStorage();
        s.partitions[_to].push(Partition(_value, _partition));
        s.partitionToIndex[_to][_partition] = s.partitions[_to].length;

        if (_value != 0) s.balances[_to] += _value;
    }

    function deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        if (index != s.partitions[_holder].length - 1) {
            s.partitions[_holder][index] = s.partitions[_holder][s.partitions[_holder].length - 1];
            s.partitionToIndex[_holder][s.partitions[_holder][index].partition] = index + 1;
        }
        delete s.partitionToIndex[_holder][_partition];
        s.partitions[_holder].pop();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUPPLY OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function increaseTotalSupply(uint256 _value, bytes32 _partition) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        s.totalSupply += _value;
        s.totalSupplyByPartition[_partition] += _value;
    }

    function reduceTotalSupply(uint256 _value, bytes32 _partition) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        s.totalSupply -= _value;
        s.totalSupplyByPartition[_partition] -= _value;
    }

    function adjustTotalSupply(uint256 factor) internal {
        erc1410BasicStorage().totalSupply *= factor;
    }

    function adjustTotalSupplyByPartition(bytes32 _partition, uint256 _factor) internal {
        erc1410BasicStorage().totalSupplyByPartition[_partition] *= _factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRANSFER (Core logic without orchestration)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Core transfer logic: reduce sender balance, emit event, increase/add receiver partition
    /// @dev Does NOT call beforeTokenTransfer/afterTokenTransfer - facets handle orchestration
    /// @dev Does NOT call compliance.transferred - facets handle compliance
    function transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) internal returns (bytes32) {
        reduceBalanceByPartition(_from, _basicTransferInfo.value, _partition);

        emit TransferByPartition(
            _partition,
            _operator,
            _from,
            _basicTransferInfo.to,
            _basicTransferInfo.value,
            _data,
            _operatorData
        );

        if (!validPartitionForReceiver(_partition, _basicTransferInfo.to)) {
            addPartitionTo(_basicTransferInfo.value, _basicTransferInfo.to, _partition);
        } else {
            increaseBalanceByPartition(_basicTransferInfo.to, _basicTransferInfo.value, _partition);
        }

        return _partition;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOKEN HOLDER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function addNewTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        uint256 nextIndex = ++s.totalTokenHolders;
        s.tokenHolders[nextIndex] = tokenHolder;
        s.tokenHolderIndex[tokenHolder] = nextIndex;
    }

    function removeTokenHolder(address tokenHolder) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        uint256 lastIndex = s.totalTokenHolders;
        if (lastIndex > 1) {
            uint256 holderIndex = s.tokenHolderIndex[tokenHolder];
            if (holderIndex < lastIndex) {
                address lastTokenHolder = s.tokenHolders[lastIndex];
                s.tokenHolderIndex[lastTokenHolder] = holderIndex;
                s.tokenHolders[holderIndex] = lastTokenHolder;
            }
        }
        s.tokenHolderIndex[tokenHolder] = 0;
        s.totalTokenHolders--;
    }

    function replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        uint256 index = s.tokenHolderIndex[oldTokenHolder];
        s.tokenHolderIndex[newTokenHolder] = index;
        s.tokenHolders[index] = newTokenHolder;
        s.tokenHolderIndex[oldTokenHolder] = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // OPERATOR MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function authorizeOperator(address _operator, address _tokenHolder) internal {
        erc1410OperatorStorage().approvals[_tokenHolder][_operator] = true;
    }

    function revokeOperator(address _operator, address _tokenHolder) internal {
        erc1410OperatorStorage().approvals[_tokenHolder][_operator] = false;
    }

    function authorizeOperatorByPartition(bytes32 _partition, address _operator, address _tokenHolder) internal {
        erc1410OperatorStorage().partitionApprovals[_tokenHolder][_partition][_operator] = true;
    }

    function revokeOperatorByPartition(bytes32 _partition, address _operator, address _tokenHolder) internal {
        erc1410OperatorStorage().partitionApprovals[_tokenHolder][_partition][_operator] = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function isInitialized() internal view returns (bool) {
        return erc1410BasicStorage().initialized;
    }

    function isOperator(address _operator, address _tokenHolder) internal view returns (bool) {
        return erc1410OperatorStorage().approvals[_tokenHolder][_operator];
    }

    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view returns (bool) {
        return erc1410OperatorStorage().partitionApprovals[_tokenHolder][_partition][_operator];
    }

    function isAuthorized(bytes32 _partition, address _operator, address _tokenHolder) internal view returns (bool) {
        return isOperator(_operator, _tokenHolder) || isOperatorForPartition(_partition, _operator, _tokenHolder);
    }

    function checkOperator(bytes32 _partition, address _operator, address _from) internal view {
        if (!isAuthorized(_partition, _operator, _from)) {
            revert IERC1410.Unauthorized(_operator, _from, _partition);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BALANCE QUERIES (View functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    function totalSupply() internal view returns (uint256) {
        return erc1410BasicStorage().totalSupply;
    }

    function totalSupplyByPartition(bytes32 _partition) internal view returns (uint256) {
        return erc1410BasicStorage().totalSupplyByPartition[_partition];
    }

    function balanceOf(address _tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().balances[_tokenHolder];
    }

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        if (validPartition(_partition, _tokenHolder)) {
            ERC1410BasicStorage storage s = erc1410BasicStorage();
            return s.partitions[_tokenHolder][s.partitionToIndex[_tokenHolder][_partition] - 1].amount;
        } else {
            return 0;
        }
    }

    function partitionsOf(address _tokenHolder) internal view returns (bytes32[] memory) {
        ERC1410BasicStorage storage s = erc1410BasicStorage();
        bytes32[] memory partitionsList = new bytes32[](s.partitions[_tokenHolder].length);
        for (uint256 i = 0; i < s.partitions[_tokenHolder].length; i++) {
            partitionsList[i] = s.partitions[_tokenHolder][i].partition;
        }
        return partitionsList;
    }

    function isMultiPartition() internal view returns (bool) {
        return erc1410BasicStorage().multiPartition;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOKEN HOLDER QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getTotalTokenHolders() internal view returns (uint256) {
        return erc1410BasicStorage().totalTokenHolders;
    }

    function getTokenHolder(uint256 _index) internal view returns (address) {
        return erc1410BasicStorage().tokenHolders[_index];
    }

    function getTokenHolderIndex(address _tokenHolder) internal view returns (uint256) {
        return erc1410BasicStorage().tokenHolderIndex[_tokenHolder];
    }

    function getTokenHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        (uint256 start, uint256 end) = LibPagination.getStartAndEnd(_pageIndex, _pageLength);
        holders_ = new address[](LibPagination.getSize(start, end, getTotalTokenHolders()));
        start++; // tokenHolders starts from 1

        ERC1410BasicStorage storage s = erc1410BasicStorage();
        for (uint256 i = 0; i < holders_.length; i++) {
            holders_[i] = s.tokenHolders[start + i];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VALIDATION (Guards)
    // ═══════════════════════════════════════════════════════════════════════════════

    function validPartition(bytes32 _partition, address _holder) internal view returns (bool) {
        return erc1410BasicStorage().partitionToIndex[_holder][_partition] != 0;
    }

    function validPartitionForReceiver(bytes32 _partition, address _to) internal view returns (bool) {
        return erc1410BasicStorage().partitionToIndex[_to][_partition] != 0;
    }

    function checkDefaultPartitionWithSinglePartition(bytes32 _partition) internal view {
        if (!isMultiPartition() && _partition != _DEFAULT_PARTITION) {
            revert IERC1410.PartitionNotAllowedInSinglePartitionMode(_partition);
        }
    }

    function checkWithoutMultiPartition() internal view {
        if (isMultiPartition()) revert IERC1410.NotAllowedInMultiPartitionMode();
    }

    function requireValidAddress(address account) internal pure {
        if (account == address(0)) revert ZeroAddressNotAllowed();
    }
}
