// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ISSUER_ROLE, _AGENT_ROLE, _WILD_CARD_ROLE } from "../../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { IERC1594 } from "./IERC1594.sol";
import { IProtectedPartitions } from "../../../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";

import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { Eip1066 } from "../../../../constants/eip1066.sol";
import { ProtectedPartitionRoleValidator } from "../../../../infrastructure/utils/ProtectedPartitionRoleValidator.sol";

abstract contract ERC1594 is IERC1594, TimestampProvider, Modifiers, ProtectedPartitionRoleValidator {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override onlyNotERC1594Initialized {
        ERC1594StorageWrapper.initialize();
    }

    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(msg.sender, _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transfer(msg.sender, _to, _value);
        emit TransferWithData(msg.sender, _to, _value, _data);
    }

    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_from)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value);
        emit TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }

    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    ) external override onlyUnpaused onlyWithoutMultiPartition {
        CapStorageWrapper.requireWithinMaxSupply(_value, _getBlockTimestamp());
        ERC1594StorageWrapper.requireIdentified(address(0), _tokenHolder);
        ERC1594StorageWrapper.requireCompliant(address(0), _tokenHolder, false);
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _ISSUER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        ERC1594StorageWrapper.issue(_tokenHolder, _value, _data);
    }

    function redeem(
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(msg.sender, _DEFAULT_PARTITION, _value)
    {
        ERC1594StorageWrapper.redeem(_value, _data);
    }

    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _DEFAULT_PARTITION, _value)
    {
        ERC1594StorageWrapper.redeemFrom(_tokenHolder, _value, _data);
    }

    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper.isIssuable();
    }

    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, PauseStorageWrapper.TokenIsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
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
    ) external view onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, PauseStorageWrapper.TokenIsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }
}
