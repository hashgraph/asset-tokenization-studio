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
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IProtectedPartitions } from "../../facets/protectedPartition/IProtectedPartitions.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { NominalValueStorageWrapper } from "../asset/NominalValueStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

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
    ) external returns (bytes32) {
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
    ) external returns (bytes32) {
        return ERC1410StorageWrapper.operatorTransferByPartition(_operatorTransferData);
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external returns (bytes32) {
        return ERC1410StorageWrapper.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function issueByPartition(IERC1410Types.IssueData memory _issueData) external {
        ERC1410StorageWrapper.issueByPartition(_issueData);
    }

    function redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) external {
        ERC1410StorageWrapper.redeemByPartition(_partition, _from, _operator, _value, _data, _operatorData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external {
        ERC1410StorageWrapper.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }

    function transfer(address _from, address _to, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.transfer(_from, _to, _value);
    }

    function transferFrom(address _spender, address _from, address _to, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.transferFrom(_spender, _from, _to, _value);
    }

    function mint(address _to, uint256 _value) external {
        ERC20StorageWrapper.mint(_to, _value);
    }

    function burn(address _from, uint256 _value) external {
        ERC20StorageWrapper.burn(_from, _value);
    }

    function issue(address _tokenHolder, uint256 _value) external {
        ERC1594StorageWrapper.issue(_tokenHolder, _value);
    }

    function redeem(uint256 _value) external {
        ERC1594StorageWrapper.redeem(_value);
    }

    function redeemFrom(address _tokenHolder, uint256 _value) external {
        ERC1594StorageWrapper.redeemFrom(_tokenHolder, _value);
    }

    function approve(address _owner, address _spender, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.approve(_owner, _spender, _value);
    }

    function increaseAllowance(address _spender, uint256 _addedValue) external returns (bool) {
        return ERC20StorageWrapper.increaseAllowance(_spender, _addedValue);
    }

    function decreaseAllowance(address _spender, uint256 _subtractedValue) external returns (bool) {
        return ERC20StorageWrapper.decreaseAllowance(_spender, _subtractedValue);
    }

    function beforeAllowanceUpdate(address _owner, address _spender) external {
        ERC20StorageWrapper.beforeAllowanceUpdate(_owner, _spender);
    }

    /// @notice Transfers tokens on the default partition, delegating to ERC-20 storage.
    /// @dev The `Transfer` event is emitted by `ERC20StorageWrapper.performTransfer` internally.
    /// @param _from    Source address.
    /// @param _to      Destination address.
    /// @param _amount  Amount to transfer.
    function transferDefaultPartition(address _from, address _to, uint256 _amount) external {
        ERC20StorageWrapper.transfer(_from, _to, _amount);
    }

    function increaseAllowedBalance(address _owner, address _spender, uint256 _amount) external {
        ERC20StorageWrapper.increaseAllowedBalance(_owner, _spender, _amount);
    }

    function decreaseAllowedBalance(address _owner, address _spender, uint256 _amount) external {
        ERC20StorageWrapper.decreaseAllowedBalance(_owner, _spender, _amount);
    }

    function updateAccountSnapshot(address _account, bytes32 _partition) external {
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
    }

    function updateAccountClearedBalancesSnapshot(address _account, bytes32 _partition) external {
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(_account, _partition);
    }

    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, _to);
    }

    function checkIdentity(address _from, address _to) external view {
        ERC1594StorageWrapper.checkIdentity(_from, _to);
    }

    function checkCompliance(address _from, address _to, bool _checkSender) external view {
        ERC1594StorageWrapper.checkCompliance(_from, _to, _checkSender);
    }

    // Internal functions (inlined into calling StorageWrappers)

    /// @notice Computes the total adjusted balance for a token holder at a given timestamp.
    /// @dev Sums the spendable balance, locked, held, cleared, and frozen amounts, each
    ///      scaled by their respective ABAF factors.
    /// @param _tokenHolder Address of the token holder.
    /// @param _timestamp   Block timestamp used for the ABAF adjustment calculation.
    /// @return totalBalance_ Aggregate adjusted balance including frozen tokens.
    function getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ClearingReadOps.getClearedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
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

    /**
     * @notice Computes the principal position for `account` at the current block timestamp.
     * @param  account      Token holder address.
     * @return principalFor_ Numerator/denominator pair representing the holder's principal.
     */
    function getPrincipalFor(address account) internal view returns (IPrincipal.PrincipalFor memory principalFor_) {
        uint256 blockTimestamp = EvmAccessors.getBlockTimestamp();

        // Pre-apply the nominal-value scale via 512-bit mulDiv: balance * nominal stays bounded
        // even at high precision, and the equivalent fraction keeps the token-decimal scale on
        // the denominator so sub-unit balances survive (numerator/denominator == old fraction).
        principalFor_.numerator = Math.mulDiv(
            TokenCoreOps.getTotalBalanceForAdjustedAt(account, blockTimestamp),
            NominalValueStorageWrapper.getNominalValue(),
            DecimalsLib.pow10(NominalValueStorageWrapper.getNominalValueDecimals())
        );
        principalFor_.denominator = DecimalsLib.pow10(ERC20StorageWrapper.decimalsAdjustedAt(blockTimestamp));
    }
}
