// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ISSUER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { IERC1594 } from "./IERC1594.sol";

import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { IPause } from "../../../../facets/layer_1/pause/IPause.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { Eip1066 } from "../../../../constants/eip1066.sol";
import { ProtectedPartitionRoleValidator } from "../../../../infrastructure/utils/ProtectedPartitionRoleValidator.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ERC1594
 * @notice Implementation of ERC-1594 standard for security token issuance and redemption
 * @dev Provides core functionality for issuing, redeeming, and transferring security tokens
 *      with support for data attachments. Validates compliance, identity, and supply limits.
 */
abstract contract ERC1594 is IERC1594, TimestampProvider, Modifiers, ProtectedPartitionRoleValidator {
    /**
     * @notice Initializes the ERC1594 facet for the calling contract
     * @dev Can only be called once per contract. Sets up the issuance state.
     *      Requires the caller to not have already initialized ERC1594.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override onlyNotERC1594Initialized {
        ERC1594StorageWrapper.initialize();
    }

    /**
     * @notice Transfers tokens to a specified address with attached data
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data attached to the transfer
     * @dev Validates transfer restrictions before executing
     *      Only works in single partition mode
     */
    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(EvmAccessors.getMsgSender(), _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transfer(EvmAccessors.getMsgSender(), _to, _value);
        emit TransferWithData(EvmAccessors.getMsgSender(), _to, _value, _data);
    }

    /**
     * @notice Transfers tokens from one address to another with attached data
     * @param _from The sender address
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data attached to the transfer
     * @dev Validates transfer restrictions and allowances before executing
     *      Only works in single partition mode
     */
    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_from)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value);
        emit TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }

    /**
     * @notice Issues new tokens to a specified token holder
     * @param _tokenHolder The address to receive the issued tokens
     * @param _value The amount of tokens to issue
     * @param _data Additional data attached to the issuance
     * @dev Requires caller to have ISSUER_ROLE or AGENT_ROLE
     *      Validates compliance, identity, and supply limits before issuing
     *      Only works in single partition mode and when not paused
     */
    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithinMaxSupply(_value, _getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _tokenHolder)
        onlyCompliant(address(0), _tokenHolder, false)
    {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _ISSUER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        ERC1594StorageWrapper.issue(_tokenHolder, _value, _data);
    }

    /**
     * @notice Redeems tokens from the caller's balance
     * @param _value The amount of tokens to redeem
     * @param _data Additional data attached to the redemption
     * @dev Burns tokens from the caller's default partition
     *      Only works in single partition mode
     */
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

    /**
     * @notice Redeems tokens from a specified token holder's balance
     * @param _tokenHolder The address to redeem tokens from
     * @param _value The amount of tokens to redeem
     * @param _data Additional data attached to the redemption
     * @dev Requires caller to be authorized to redeem on behalf of the token holder
     *      Only works in single partition mode
     */
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

    /**
     * @notice Checks if the token is currently issuable
     * @return bool True if tokens can be issued
     * @dev Returns the issuance state from storage
     */
    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper.isIssuable();
    }

    /**
     * @notice Checks if a transfer can be executed
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data for the transfer check
     * @return status True if the transfer can be executed
     * @return code EIP1066 status code indicating the result
     * @return reason Additional reason data for the result
     * @dev Performs a static check without executing the transfer
     *      Considers pause state and transfer restrictions
     */
    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.TokenIsPaused.selector);
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

    /**
     * @notice Checks if a transferFrom can be executed
     * @param _from The sender address
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data for the transfer check
     * @return status True if the transfer can be executed
     * @return code EIP1066 status code indicating the result
     * @return reason Additional reason data for the result
     * @dev Performs a static check without executing the transfer
     *      Considers pause state, allowances, and transfer restrictions
     */
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.TokenIsPaused.selector);
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
