// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TREX_OWNER_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IComplianceFacet } from "./IComplianceFacet.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { IPause } from "../layer_1/pause/IPause.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { ICompliance } from "../layer_1/ERC3643/ICompliance.sol";

/**
 * @title Compliance
 * @notice Abstract implementation of transfer-eligibility checks and compliance contract management.
 * @dev Consolidates `canTransfer`, `canTransferFrom`, `setCompliance`, and `compliance` in a single
 *      abstract contract. Both transfer-check functions are restricted to single-partition mode and
 *      delegate the actual validation to `ERC1594StorageWrapper.isAbleToTransferFromByPartition`.
 *      When the token is paused they short-circuit with the EIP-1066 PAUSED status code.
 */
abstract contract Compliance is IComplianceFacet, Modifiers {
    /**
     * @notice Sets the compliance contract address
     * @param _compliance The address of the new compliance contract
     */
    function setCompliance(address _compliance) external override onlyUnpaused onlyRole(TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setCompliance(_compliance);
    }

    /**
     * @notice Checks if a transfer can be executed
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data for the transfer check
     * @return status True if the transfer can be executed
     * @return code EIP1066 status code indicating the result
     * @return reason Additional reason data for the result
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
     */
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
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

    /**
     * @notice Returns the address of the compliance contract
     * @return ICompliance The compliance contract
     */
    function compliance() external view override returns (ICompliance) {
        return ERC3643StorageWrapper.getCompliance();
    }
}
