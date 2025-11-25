// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BasicTransferInfo } from "../../interfaces/ERC1400/IERC1410.sol";
import { IERC1410TokenHolder } from "../../interfaces/ERC1400/IERC1410TokenHolder.sol";
import { Common } from "../../common/Common.sol";

/**
 * @title ERC1410TokenHolder
 * @notice This facet handles transfers, operator transfers, redemptions, and issuance
 * @dev Facet containing all transfer-related operations for ERC1410 functionality
 * @dev These methods can by called by any users (token holders).
 */
abstract contract ERC1410TokenHolder is IERC1410TokenHolder, Common {
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    )
        external
        override
        onlyUnProtectedPartitionsOrWildCardRole
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCanTransferFromByPartition(
            _msgSender(),
            _basicTransferInfo.to,
            _partition,
            _basicTransferInfo.value,
            _data,
            ""
        )
        returns (bytes32)
    {
        // Add a function to verify the `_data` parameter
        // TODO: Need to create the bytes division of the `_partition` so it can be easily findout in which receiver's
        // partition token will transfered. For current implementation we are assuming that the receiver's partition
        // will be same as sender's as well as it also pass the `_validPartition()` check. In this particular case we
        // are also assuming that reciever has the some tokens of the same partition as well (To avoid the array index
        // out of bound error).
        // Note- There is no operator used for the execution of this call so `_operator` value in
        // in event is address(0) same for the `_operatorData`
        return _transferByPartition(msg.sender, _basicTransferInfo, _partition, _data, address(0), "");
    }

    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_msgSender(), _partition, _value, _data, "")
    {
        // Add the function to validate the `_data` parameter
        _redeemByPartition(_partition, _msgSender(), address(0), _value, _data, "");
    }

    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external onlyUnpaused {
        _triggerAndSyncAll(_partition, _from, _to);
    }

    function authorizeOperator(
        address _operator
    ) external override onlyUnpaused onlyCompliant(_msgSender(), _operator, false) {
        _authorizeOperator(_operator);
    }

    function revokeOperator(
        address _operator
    ) external override onlyUnpaused onlyCompliant(_msgSender(), address(0), false) {
        _revokeOperator(_operator);
    }

    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCompliant(_msgSender(), _operator, false)
    {
        _authorizeOperatorByPartition(_partition, _operator);
    }

    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCompliant(_msgSender(), address(0), false)
    {
        _revokeOperatorByPartition(_partition, _operator);
    }
}
