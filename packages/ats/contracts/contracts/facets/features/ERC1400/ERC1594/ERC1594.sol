// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1594 } from "../../interfaces/ERC1400/IERC1594.sol";
import { IControlListBase } from "../../interfaces/controlList/IControlListBase.sol";
import { IERC1644Base } from "../../interfaces/ERC1400/IERC1644Base.sol";
import { LibERC1594 } from "../../../../lib/domain/LibERC1594.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../../lib/core/LibCap.sol";
import { LibCompliance } from "../../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../../lib/core/LibProtectedPartitions.sol";
import { TokenCoreOps } from "../../../../lib/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";
import { _ISSUER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";

abstract contract ERC1594 is IERC1594, IControlListBase, IERC1644Base, TimestampProvider {
    error AlreadyInitialized();
    error ZeroAddressNotAllowed();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override {
        if (LibERC1594.isInitialized()) revert AlreadyInitialized();
        LibERC1594.initialize(true);
    }

    function transferWithData(address _to, uint256 _value, bytes calldata _data) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanTransferFromByPartition(
            msg.sender,
            msg.sender,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        TokenCoreOps.transfer(msg.sender, _to, _value, _getBlockTimestamp(), _getBlockNumber());
        emit TransferWithData(msg.sender, _to, _value, _data);
    }

    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanTransferFromByPartition(
            msg.sender,
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_to);
        LibCompliance.requireNotRecovered(_from);
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value, _getBlockTimestamp(), _getBlockNumber());
        emit TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }

    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibCap.requireWithinMaxSupply(_value, LibERC1410.totalSupply());
        LibERC1594.checkIdentity(address(0), _tokenHolder);
        LibERC1594.checkCompliance(msg.sender, address(0), _tokenHolder, false);
        LibPause.requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.mint(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Issued(msg.sender, _tokenHolder, _value, _data);
    }

    function redeem(uint256 _value, bytes memory _data) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanRedeemFromByPartition(
            msg.sender,
            msg.sender,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        TokenCoreOps.burn(msg.sender, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Redeemed(address(0), msg.sender, _value, _data);
    }

    function redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanRedeemFromByPartition(
            msg.sender,
            _tokenHolder,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_tokenHolder);
        TokenCoreOps.decreaseAllowedBalance(_tokenHolder, msg.sender, _value);
        TokenCoreOps.burn(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Redeemed(msg.sender, _tokenHolder, _value, _data);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function isIssuable() external view override returns (bool) {
        return LibERC1594.isIssuable();
    }

    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory
    ) external view override returns (bool, bytes1, bytes32) {
        LibERC1410.checkWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = LibERC1594.isAbleToTransferFromByPartition(
            msg.sender,
            msg.sender,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        return (status, statusCode, reason);
    }

    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory
    ) external view returns (bool, bytes1, bytes32) {
        LibERC1410.checkWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = LibERC1594.isAbleToTransferFromByPartition(
            msg.sender,
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        return (status, statusCode, reason);
    }
}
