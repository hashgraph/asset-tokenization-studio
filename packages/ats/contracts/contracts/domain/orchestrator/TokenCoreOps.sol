// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingReadOps } from "./ClearingReadOps.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../asset/ERC1594StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IProtectedPartitions } from "../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";

/// @title TokenCoreOps - Orchestrator for core token operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Contains balance operations for ClearingOps to avoid inlining.
library TokenCoreOps {
    function transferByPartition(
        address _from,
        IERC1410Types.BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) public returns (bytes32) {
        return
            ERC1410StorageWrapper.transferByPartition(
                _from,
                _basicTransferInfo,
                _partition,
                _data,
                _operator,
                _operatorData
            );
    }

    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata _operatorTransferData
    ) public returns (bytes32) {
        return ERC1410StorageWrapper.operatorTransferByPartition(_operatorTransferData);
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) public returns (bytes32) {
        return ERC1410StorageWrapper.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function issueByPartition(IERC1410Types.IssueData memory _issueData) public {
        ERC1410StorageWrapper.issueByPartition(_issueData);
    }

    function redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) public {
        ERC1410StorageWrapper.redeemByPartition(_partition, _from, _operator, _value, _data, _operatorData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) public {
        ERC1410StorageWrapper.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }

    function transfer(address _from, address _to, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.transfer(_from, _to, _value);
    }

    function transferFrom(address _spender, address _from, address _to, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.transferFrom(_spender, _from, _to, _value);
    }

    function mint(address _to, uint256 _value) public {
        ERC20StorageWrapper.mint(_to, _value);
    }

    function burn(address _from, uint256 _value) public {
        ERC20StorageWrapper.burn(_from, _value);
    }

    function burnFrom(address _account, uint256 _value) public {
        ERC20StorageWrapper.burnFrom(_account, _value);
    }

    function approve(address _owner, address _spender, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.approve(_owner, _spender, _value);
    }

    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool) {
        return ERC20StorageWrapper.increaseAllowance(_spender, _addedValue);
    }

    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool) {
        return ERC20StorageWrapper.decreaseAllowance(_spender, _subtractedValue);
    }

    function beforeAllowanceUpdate(address _owner, address _spender) public {
        ERC20StorageWrapper.beforeAllowanceUpdate(_owner, _spender);
    }

    // Public functions — Balance Operations (for ClearingOps)

    function reduceBalanceByPartition(address _from, uint256 _amount, bytes32 _partition) public {
        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _amount, _partition);
    }

    function increaseBalanceByPartition(address _to, uint256 _amount, bytes32 _partition) public {
        ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _partition);
    }

    function addPartitionTo(uint256 _amount, address _to, bytes32 _partition) public {
        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _partition);
    }

    function transferDefaultPartition(address _sender, address _from, address _to, uint256 _amount) public {
        ERC20StorageWrapper.transfer(_from, _to, _amount);
        emit IERC20.Transfer(_sender, _to, _amount);
    }

    function increaseAllowedBalance(address _owner, address _spender, uint256 _amount) public {
        ERC20StorageWrapper.increaseAllowedBalance(_owner, _spender, _amount);
    }

    function decreaseAllowedBalance(address _owner, address _spender, uint256 _amount) public {
        ERC20StorageWrapper.decreaseAllowedBalance(_owner, _spender, _amount);
    }

    function updateAccountSnapshot(address _account, bytes32 _partition) public {
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
    }

    function updateAccountClearedBalancesSnapshot(address _account, bytes32 _partition) public {
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(_account, _partition);
    }

    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) public {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, _to);
    }

    function emitTransferByPartition(
        bytes32 _partition,
        address _operator,
        address _from,
        address _to,
        uint256 _amount,
        bytes memory _data,
        bytes memory _operatorData
    ) public {
        emit IERC1410Types.TransferByPartition(_partition, _operator, _from, _to, _amount, _data, _operatorData);
    }

    function emitTransfer(address _from, address _to, uint256 _amount) public {
        emit IERC20.Transfer(_from, _to, _amount);
    }

    function validPartitionForReceiver(bytes32 _partition, address _receiver) public view returns (bool) {
        return ERC1410StorageWrapper.validPartitionForReceiver(_partition, _receiver);
    }

    function getTokenName() public view returns (string memory) {
        return ERC20StorageWrapper.getName();
    }

    function checkIdentity(address _from, address _to) public view {
        ERC1594StorageWrapper.checkIdentity(_from, _to);
    }

    function checkCompliance(address _from, address _to, bool _checkSender) public view {
        ERC1594StorageWrapper.checkCompliance(_from, _to, _checkSender);
    }

    // Internal functions (inlined into calling StorageWrappers)

    function getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ClearingReadOps.getClearedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            ClearingReadOps.getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }
}
