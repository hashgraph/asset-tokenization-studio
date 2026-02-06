// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";

/**
 * NEW ARCHITECTURE - LibERC1410Transfer
 *
 * ONLY ERC1410 transfer and redeem logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibERC1410Transfer {
    error InsufficientBalance(address account, uint256 balance, uint256 required);
    error InvalidReceiver(address receiver);

    event TransferByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    event RedeemByPartition(
        bytes32 indexed partition,
        address indexed from,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    function transferByPartition(
        address from,
        BasicTransferInfo memory basicTransferInfo,
        bytes32 partition,
        bytes memory data,
        address operator,
        bytes memory operatorData
    ) internal returns (bytes32) {
        ERC1410Storage storage s = erc1410Storage();

        uint256 fromBalance = s.partitionBalances[partition][from];
        if (fromBalance < basicTransferInfo.value) {
            revert InsufficientBalance(from, fromBalance, basicTransferInfo.value);
        }
        if (basicTransferInfo.to == address(0)) {
            revert InvalidReceiver(address(0));
        }

        unchecked {
            s.partitionBalances[partition][from] = fromBalance - basicTransferInfo.value;
        }
        s.partitionBalances[partition][basicTransferInfo.to] += basicTransferInfo.value;

        emit TransferByPartition(partition, from, basicTransferInfo.to, basicTransferInfo.value, data, operatorData);

        return partition;
    }

    function redeemByPartition(
        bytes32 partition,
        address from,
        address operator,
        uint256 value,
        bytes memory data,
        bytes memory operatorData
    ) internal {
        ERC1410Storage storage s = erc1410Storage();

        uint256 fromBalance = s.partitionBalances[partition][from];
        if (fromBalance < value) {
            revert InsufficientBalance(from, fromBalance, value);
        }

        unchecked {
            s.partitionBalances[partition][from] = fromBalance - value;
            s.partitionTotalSupply[partition] -= value;
            s.totalSupply -= value;
        }

        emit RedeemByPartition(partition, from, value, data, operatorData);
    }

    function balanceOfByPartition(bytes32 partition, address account) internal view returns (uint256) {
        return erc1410Storage().partitionBalances[partition][account];
    }
}
