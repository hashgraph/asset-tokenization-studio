// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { _ERC1410_BASIC_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1410StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC1410StorageWrapper.sol";
import { LockStorageWrapper1 } from "../../lock/LockStorageWrapper1.sol";
import { LibCommon } from "../../../layer_0/common/libraries/LibCommon.sol";

abstract contract ERC1410BasicStorageWrapperRead is IERC1410StorageWrapper, LockStorageWrapper1 {
    // Represents a fungible set of tokens.
    struct Partition {
        uint256 amount;
        bytes32 partition;
    }

    struct ERC1410BasicStorage {
        uint256 totalSupply;
        mapping(bytes32 => uint256) totalSupplyByPartition;
        /// @dev Mapping from investor to aggregated balance across all investor token sets
        mapping(address => uint256) balances;
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

    modifier onlyWithoutMultiPartition() {
        _checkWithoutMultiPartition();
        _;
    }

    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) override {
        _checkDefaultPartitionWithSinglePartition(partition);
        _;
    }

    modifier validateAddress(address account) override {
        _checkValidAddress(account);
        _;
    }

    function _reduceBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal {
        if (!_validPartition(_partition, _from)) {
            revert IERC1410StorageWrapper.InvalidPartition(_from, _partition);
        }

        uint256 fromBalance = _balanceOfByPartition(_partition, _from);

        if (fromBalance < _value) {
            revert IERC1410StorageWrapper.InsufficientBalance(_from, fromBalance, _value, _partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;

        if (erc1410Storage.partitions[_from][index].amount == _value) {
            _deletePartitionForHolder(_from, _partition, index);
        } else {
            erc1410Storage.partitions[_from][index].amount -= _value;
        }

        erc1410Storage.balances[_from] -= _value;
    }

    function _deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        if (index != erc1410Storage.partitions[_holder].length - 1) {
            erc1410Storage.partitions[_holder][index] = erc1410Storage.partitions[_holder][
                erc1410Storage.partitions[_holder].length - 1
            ];
            erc1410Storage.partitionToIndex[_holder][erc1410Storage.partitions[_holder][index].partition] = index + 1;
        }
        delete erc1410Storage.partitionToIndex[_holder][_partition];
        erc1410Storage.partitions[_holder].pop();
    }

    function _increaseBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal {
        if (!_validPartition(_partition, _from)) {
            revert IERC1410StorageWrapper.InvalidPartition(_from, _partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;

        erc1410Storage.partitions[_from][index].amount += _value;
        erc1410Storage.balances[_from] += _value;
    }

    function _adjustTotalSupplyByPartition(bytes32 _partition, uint256 _factor) internal {
        _erc1410BasicStorage().totalSupplyByPartition[_partition] *= _factor;
    }

    function _adjustTotalSupply(uint256 factor) internal {
        _erc1410BasicStorage().totalSupply *= factor;
    }

    function _adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = _getAbaf();
        ERC1410BasicStorage storage basicStorage = _erc1410BasicStorage();
        _adjustPartitionBalanceFor(basicStorage, abaf, partition, account);
        _adjustTotalBalanceFor(basicStorage, abaf, account);
    }

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

    function _getTokenHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        holders_ = new address[](LibCommon.getSize(start, end, _getTotalTokenHolders()));

        start++; // because tokenHolders starts from 1

        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        for (uint256 i = 0; i < holders_.length; i++) {
            holders_[i] = erc1410Storage.tokenHolders[start + i];
        }
    }

    function _getTokenHolder(uint256 _index) internal view returns (address) {
        return _erc1410BasicStorage().tokenHolders[_index];
    }

    function _getTotalTokenHolders() internal view override returns (uint256) {
        return _erc1410BasicStorage().totalTokenHolders;
    }

    function _getTokenHolderIndex(address _tokenHolder) internal view returns (uint256) {
        return _erc1410BasicStorage().tokenHolderIndex[_tokenHolder];
    }

    function _totalSupply() internal view returns (uint256) {
        return _erc1410BasicStorage().totalSupply;
    }

    function _isMultiPartition() internal view returns (bool) {
        return _erc1410BasicStorage().multiPartition;
    }

    function _totalSupplyByPartition(bytes32 _partition) internal view returns (uint256) {
        return _erc1410BasicStorage().totalSupplyByPartition[_partition];
    }

    function _balanceOf(address _tokenHolder) internal view returns (uint256) {
        return _erc1410BasicStorage().balances[_tokenHolder];
    }

    function _balanceOfByPartition(bytes32 _partition, address _tokenHolder) internal view override returns (uint256) {
        if (_validPartition(_partition, _tokenHolder)) {
            ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
            return
                erc1410Storage
                .partitions[_tokenHolder][erc1410Storage.partitionToIndex[_tokenHolder][_partition] - 1].amount;
        } else {
            return 0;
        }
    }

    function _partitionsOf(address _tokenHolder) internal view override returns (bytes32[] memory) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        bytes32[] memory partitionsList = new bytes32[](erc1410Storage.partitions[_tokenHolder].length);
        for (uint256 i = 0; i < erc1410Storage.partitions[_tokenHolder].length; i++) {
            partitionsList[i] = erc1410Storage.partitions[_tokenHolder][i].partition;
        }
        return partitionsList;
    }

    function _validPartition(bytes32 _partition, address _holder) internal view returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();
        if (erc1410Storage.partitionToIndex[_holder][_partition] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function _validPartitionForReceiver(bytes32 _partition, address _to) internal view returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _erc1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_to][_partition];

        return index != 0;
    }

    function _checkDefaultPartitionWithSinglePartition(bytes32 partition) internal view {
        if (!_isMultiPartition() && partition != _DEFAULT_PARTITION)
            revert PartitionNotAllowedInSinglePartitionMode(partition);
    }

    function _erc1410BasicStorage() internal pure returns (ERC1410BasicStorage storage erc1410BasicStorage_) {
        bytes32 position = _ERC1410_BASIC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    function _checkValidAddress(address account) internal pure {
        if (account == address(0)) revert ZeroAddressNotAllowed();
    }

    function _adjustTotalBalanceFor(ERC1410BasicStorage storage basicStorage, uint256 abaf, address account) private {
        uint256 factor = _calculateFactorByAbafAndTokenHolder(abaf, account);
        basicStorage.balances[account] *= factor;
        _updateLabafByTokenHolder(abaf, account);
    }

    function _adjustPartitionBalanceFor(
        ERC1410BasicStorage storage basicStorage,
        uint256 abaf,
        bytes32 partition,
        address account
    ) private {
        uint256 partitionsIndex = basicStorage.partitionToIndex[account][partition];
        if (partitionsIndex == 0) return;
        uint256 factor = _calculateFactorByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
        basicStorage.partitions[account][partitionsIndex - 1].amount *= factor;
        _updateLabafByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
    }

    function _checkWithoutMultiPartition() private view {
        if (_isMultiPartition()) revert NotAllowedInMultiPartitionMode();
    }
}
