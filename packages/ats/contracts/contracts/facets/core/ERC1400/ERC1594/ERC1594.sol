// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1594 } from "../../ERC1400/ERC1594/IERC1594.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { IERC1644Base } from "../../ERC1400/ERC1644/IERC1644Base.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../../domain/core/ComplianceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
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
        if (ERC1594StorageWrapper.isInitialized()) revert AlreadyInitialized();
        ERC1594StorageWrapper.initialize(true);
    }

    function transferWithData(address _to, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
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
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_to);
        ComplianceStorageWrapper.requireNotRecovered(_from);
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value, _getBlockTimestamp(), _getBlockNumber());
        emit TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }

    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        CapStorageWrapper.requireWithinMaxSupply(_value, ERC1410StorageWrapper.totalSupply());
        ERC1594StorageWrapper.checkIdentity(address(0), _tokenHolder);
        ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _tokenHolder, false);
        PauseStorageWrapper.requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.mint(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Issued(msg.sender, _tokenHolder, _value, _data);
    }

    function redeem(uint256 _value, bytes memory _data) external override {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanRedeemFromByPartition(
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
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanRedeemFromByPartition(
            msg.sender,
            _tokenHolder,
            _DEFAULT_PARTITION,
            _value,
            _getBlockTimestamp()
        );
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_tokenHolder);
        TokenCoreOps.decreaseAllowedBalance(_tokenHolder, msg.sender, _value);
        TokenCoreOps.burn(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Redeemed(msg.sender, _tokenHolder, _value, _data);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper.isIssuable();
    }

    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory
    ) external view override returns (bool, bytes1, bytes32) {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
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
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
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
