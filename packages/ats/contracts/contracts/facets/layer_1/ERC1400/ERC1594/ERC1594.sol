// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ISSUER_ROLE, _AGENT_ROLE, _WILD_CARD_ROLE } from "../../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { IERC1594 } from "./IERC1594.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC1594 is IERC1594, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override {
        if (ERC1594StorageWrapper._isERC1594Initialized()) revert AlreadyInitialized();
        ERC1594StorageWrapper._initialize();
    }

    function transferWithData(address _to, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanTransferFromByPartition(msg.sender, _to, _DEFAULT_PARTITION, _value);
        TokenCoreOps.transfer(msg.sender, _to, _value);
        emit TransferWithData(msg.sender, _to, _value, _data);
    }

    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value);
        {
            ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
            ERC3643StorageWrapper._requireUnrecoveredAddress(_to);
            ERC3643StorageWrapper._requireUnrecoveredAddress(_from);
        }
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value);
        emit TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }

    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        CapStorageWrapper._requireWithinMaxSupply(_value, _getBlockTimestamp());
        ERC1594StorageWrapper._requireIdentified(address(0), _tokenHolder);
        ERC1594StorageWrapper._requireCompliant(address(0), _tokenHolder, false);
        PauseStorageWrapper._requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper._checkAnyRole(roles, msg.sender);
        }
        ERC1594StorageWrapper._issue(_tokenHolder, _value, _data);
    }

    function redeem(uint256 _value, bytes memory _data) external override {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanRedeemFromByPartition(msg.sender, _DEFAULT_PARTITION, _value);
        ERC1594StorageWrapper._redeem(_value, _data);
    }

    function redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) external override {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper._requireCanRedeemFromByPartition(_tokenHolder, _DEFAULT_PARTITION, _value);
        ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper._requireUnrecoveredAddress(_tokenHolder);
        ERC1594StorageWrapper._redeemFrom(_tokenHolder, _value, _data);
    }

    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper._isIssuable();
    }

    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override returns (bool, bytes1, bytes32) {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper._isAbleToTransferFromByPartition(
            msg.sender,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }

    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view returns (bool, bytes1, bytes32) {
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper._isAbleToTransferFromByPartition(
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper._arePartitionsProtected() &&
            !AccessControlStorageWrapper._hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
