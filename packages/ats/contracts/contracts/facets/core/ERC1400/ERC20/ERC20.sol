// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../../ERC1400/ERC20/IERC20.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../../domain/asset/ABAFStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../../domain/core/ComplianceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";

abstract contract ERC20 is IERC20, IControlListBase, TimestampProvider {
    error AlreadyInitialized();
    error WrongExpirationTimestamp();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata erc20Metadata) external override {
        if (ERC20StorageWrapper.isInitialized()) revert AlreadyInitialized();
        ERC20StorageWrapper.initialize(erc20Metadata);
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        PauseStorageWrapper.requireNotPaused();
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, spender, false);
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(spender);
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        return TokenCoreOps.approve(msg.sender, spender, value);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            msg.sender,
            to,
            _DEFAULT_PARTITION,
            amount,
            _getBlockTimestamp()
        );
        return TokenCoreOps.transfer(msg.sender, to, amount, _getBlockTimestamp(), _getBlockNumber());
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            from,
            to,
            _DEFAULT_PARTITION,
            amount,
            _getBlockTimestamp()
        );
        return TokenCoreOps.transferFrom(msg.sender, from, to, amount, _getBlockTimestamp(), _getBlockNumber());
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        PauseStorageWrapper.requireNotPaused();
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, spender, false);
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        return TokenCoreOps.increaseAllowance(msg.sender, spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, spender, false);
        return TokenCoreOps.decreaseAllowance(msg.sender, spender, subtractedValue);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function allowance(address owner, address spender) external view override returns (uint256) {
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_getBlockTimestamp()),
            ABAFStorageWrapper.getAllowanceLabaf(owner, spender)
        );
        return ERC20StorageWrapper.getAllowance(owner, spender) * factor;
    }

    function name() external view returns (string memory) {
        return ERC20StorageWrapper.getName();
    }

    function symbol() external view returns (string memory) {
        return ERC20StorageWrapper.getSymbol();
    }

    function decimals() external view returns (uint8) {
        (, uint8 pendingDecimals) = ABAFStorageWrapper.getPendingAbafAt(_getBlockTimestamp());
        return ERC20StorageWrapper.getDecimals() + pendingDecimals;
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        (, uint8 pendingDecimals) = ABAFStorageWrapper.getPendingAbafAt(_timestamp);
        return ERC20StorageWrapper.getDecimals() + pendingDecimals;
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory) {
        (, uint8 pendingDecimals) = ABAFStorageWrapper.getPendingAbafAt(_getBlockTimestamp());
        ERC20Metadata memory metadata = ERC20StorageWrapper.getMetadata();
        metadata.info.decimals += pendingDecimals;
        return metadata;
    }
}
