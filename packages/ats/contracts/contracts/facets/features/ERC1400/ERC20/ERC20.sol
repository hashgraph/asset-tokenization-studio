// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../../interfaces/ERC1400/IERC20.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC20 } from "../../../../lib/domain/LibERC20.sol";
import { LibABAF } from "../../../../lib/domain/LibABAF.sol";
import { LibERC1594 } from "../../../../lib/domain/LibERC1594.sol";
import { LibCompliance } from "../../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../../lib/core/LibProtectedPartitions.sol";
import { TokenCoreOps } from "../../../../lib/orchestrator/TokenCoreOps.sol";
import { LibTimeTravel } from "../../../../test/timeTravel/LibTimeTravel.sol";
import { IControlListBase } from "../../interfaces/controlList/IControlListBase.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";

abstract contract ERC20 is IERC20, IControlListBase {
    error AlreadyInitialized();
    error WrongExpirationTimestamp();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata erc20Metadata) external override {
        if (LibERC20.isInitialized()) revert AlreadyInitialized();
        LibERC20.initialize(erc20Metadata);
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        LibPause.requireNotPaused();
        LibERC1594.checkCompliance(msg.sender, msg.sender, spender, false);
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(spender);
        LibERC1410.checkWithoutMultiPartition();
        return TokenCoreOps.approve(msg.sender, spender, value);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanTransferFromByPartition(
            msg.sender,
            msg.sender,
            to,
            _DEFAULT_PARTITION,
            amount,
            LibTimeTravel.getBlockTimestamp()
        );
        return TokenCoreOps.transfer(msg.sender, to, amount, LibTimeTravel.getBlockTimestamp());
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanTransferFromByPartition(
            msg.sender,
            from,
            to,
            _DEFAULT_PARTITION,
            amount,
            LibTimeTravel.getBlockTimestamp()
        );
        return TokenCoreOps.transferFrom(msg.sender, from, to, amount, LibTimeTravel.getBlockTimestamp());
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        LibPause.requireNotPaused();
        LibERC1594.checkCompliance(msg.sender, msg.sender, spender, false);
        LibERC1410.checkWithoutMultiPartition();
        return TokenCoreOps.increaseAllowance(msg.sender, spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        LibERC1594.checkCompliance(msg.sender, msg.sender, spender, false);
        return TokenCoreOps.decreaseAllowance(msg.sender, spender, subtractedValue);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function allowance(address owner, address spender) external view override returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(LibTimeTravel.getBlockTimestamp()),
            LibABAF.getAllowanceLabaf(owner, spender)
        );
        return LibERC20.getAllowance(owner, spender) * factor;
    }

    function name() external view returns (string memory) {
        return LibERC20.getName();
    }

    function symbol() external view returns (string memory) {
        return LibERC20.getSymbol();
    }

    function decimals() external view returns (uint8) {
        (, uint8 pendingDecimals) = LibABAF.getPendingAbafAt(LibTimeTravel.getBlockTimestamp());
        return LibERC20.getDecimals() + pendingDecimals;
    }

    function decimalsAt(uint256 _timestamp) external view returns (uint8) {
        (, uint8 pendingDecimals) = LibABAF.getPendingAbafAt(_timestamp);
        return LibERC20.getDecimals() + pendingDecimals;
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory) {
        (, uint8 pendingDecimals) = LibABAF.getPendingAbafAt(LibTimeTravel.getBlockTimestamp());
        ERC20Metadata memory metadata = LibERC20.getMetadata();
        metadata.info.decimals += pendingDecimals;
        return metadata;
    }
}
