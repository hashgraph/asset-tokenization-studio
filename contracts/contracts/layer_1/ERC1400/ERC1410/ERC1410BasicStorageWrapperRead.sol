// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IERC1410StorageWrapper
} from '../../interfaces/ERC1400/IERC1410StorageWrapper.sol';
import {
    _ERC1410_BASIC_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {_DEFAULT_PARTITION} from '../../constants/values.sol';

abstract contract ERC1410BasicStorageWrapperRead is IERC1410StorageWrapper {
    // Represents a fungible set of tokens.
    struct Partition {
        uint256 amount;
        bytes32 partition;
    }

    struct ERC1410BasicStorage {
        uint256 totalSupply;
        mapping(bytes32 => uint256) totalSupplyByPartition;
        // Mapping from investor to aggregated balance across all investor token sets
        mapping(address => uint256) balances;
        // Mapping from investor to their partitions
        mapping(address => Partition[]) partitions;
        // Mapping from (investor, partition) to index of corresponding partition in partitions
        // @dev Stored value is always greater by 1 to avoid the 0 value of every index
        mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
        bool multiPartition;
        bool initialized;
    }

    modifier onlyWithoutMultiPartition() {
        if (_isMultiPartition()) {
            revert NotAllowedInMultiPartitionMode();
        }
        _;
    }

    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) {
        if (!_isMultiPartition() && partition != _DEFAULT_PARTITION) {
            revert PartitionNotAllowedInSinglePartitionMode(partition);
        }
        _;
    }

    modifier onlyValidAddress(address account) {
        _checkValidAddress(account);
        _;
    }

    function _reduceBalanceByPartition(
        address _from,
        uint256 _value,
        bytes32 _partition
    ) internal virtual {
        if (!_validPartition(_partition, _from)) {
            revert InvalidPartition(_from, _partition);
        }

        uint256 balance = _getBalanceForByPartition(_partition, _from);

        if (balance < _value) {
            revert InsufficientBalance(_from, balance, _value, _partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;

        erc1410Storage.partitions[_from][index].amount -= _value;
        erc1410Storage.balances[_from] -= _value;
    }

    function _increaseBalanceByPartition(
        address _from,
        uint256 _value,
        bytes32 _partition
    ) internal virtual {
        if (!_validPartition(_partition, _from)) {
            revert InvalidPartition(_from, _partition);
        }

        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;

        erc1410Storage.partitions[_from][index].amount += _value;
        erc1410Storage.balances[_from] += _value;
    }

    function _totalSupply() internal view virtual returns (uint256) {
        return _getERC1410BasicStorage().totalSupply;
    }

    function _isMultiPartition() internal view virtual returns (bool) {
        return _getERC1410BasicStorage().multiPartition;
    }

    function _totalSupplyByPartition(
        bytes32 _partition
    ) internal view virtual returns (uint256) {
        return _getERC1410BasicStorage().totalSupplyByPartition[_partition];
    }

    function _balanceOf(
        address _tokenHolder
    ) internal view virtual returns (uint256) {
        return _getERC1410BasicStorage().balances[_tokenHolder];
    }

    function _balanceOfByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256) {
        if (_validPartition(_partition, _tokenHolder)) {
            ERC1410BasicStorage
                storage erc1410Storage = _getERC1410BasicStorage();
            return
                erc1410Storage
                .partitions[_tokenHolder][
                    erc1410Storage.partitionToIndex[_tokenHolder][_partition] -
                        1
                ].amount;
        } else {
            return 0;
        }
    }

    function _partitionsOf(
        address _tokenHolder
    ) internal view virtual returns (bytes32[] memory) {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        bytes32[] memory partitionsList = new bytes32[](
            erc1410Storage.partitions[_tokenHolder].length
        );
        for (
            uint256 i = 0;
            i < erc1410Storage.partitions[_tokenHolder].length;
            i++
        ) {
            partitionsList[i] = erc1410Storage
            .partitions[_tokenHolder][i].partition;
        }
        return partitionsList;
    }

    function _validPartition(
        bytes32 _partition,
        address _holder
    ) internal view virtual returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        if (erc1410Storage.partitionToIndex[_holder][_partition] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function _validPartitionForReceiver(
        bytes32 _partition,
        address _to
    ) internal view virtual returns (bool) {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        for (uint256 i = 0; i < erc1410Storage.partitions[_to].length; i++) {
            if (erc1410Storage.partitions[_to][i].partition == _partition) {
                return true;
            }
        }

        return false;
    }

    function _getERC1410BasicStorage()
        internal
        pure
        virtual
        returns (ERC1410BasicStorage storage erc1410BasicStorage_)
    {
        bytes32 position = _ERC1410_BASIC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1410BasicStorage_.slot := position
        }
    }

    function _checkValidAddress(address account) internal pure {
        if (account == address(0)) {
            revert ZeroAddressNotAllowed();
        }
    }

    function _getBalanceForByPartition(
        bytes32 _partition,
        address _from
    ) internal view virtual returns (uint256) {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();

        uint256 index = erc1410Storage.partitionToIndex[_from][_partition] - 1;
        return erc1410Storage.partitions[_from][index].amount;
    }
}
