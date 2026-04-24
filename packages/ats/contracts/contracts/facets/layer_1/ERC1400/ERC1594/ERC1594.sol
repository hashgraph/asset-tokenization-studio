// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../../constants/values.sol";
import { IERC1594 } from "./IERC1594.sol";

import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { ProtectedPartitionRoleValidator } from "../../../../infrastructure/utils/ProtectedPartitionRoleValidator.sol";

/**
 * @title ERC1594
 * @author Asset Tokenization Studio Team
 * @notice Implementation of the ERC-1594 standard for security token issuance and redemption.
 * @dev Provides core functionality for issuing, redeeming and transferring security tokens with
 *      support for data attachments. Validates compliance, identity and supply limits.
 */
abstract contract ERC1594 is IERC1594, Modifiers, ProtectedPartitionRoleValidator {
    /// @inheritdoc IERC1594
    /// @dev Reverts via `onlyNotERC1594Initialized` if the facet is already initialised.
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override onlyNotERC1594Initialized {
        ERC1594StorageWrapper.initialize();
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
}
