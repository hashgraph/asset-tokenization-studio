// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AGENT_ROLE, ISSUER_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IMint } from "./IMint.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ITransfer } from "../transfer/ITransfer.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Mint
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the consolidated token issuance operations.
 * @dev Gathers `isIssuable`, `issue` and `mint` on top of `ERC1594StorageWrapper`. Both issuance
 *      entry points enforce the same access-control matrix (issuer or agent), supply ceiling and
 *      compliance checks, and differ only in the calldata payload they accept.
 */
abstract contract Mint is IMint, Modifiers {
    /// @inheritdoc IMint
    /// @dev Reverts via `onlyNotERC1594Initialized` if the facet is already initialised.
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override onlyNotERC1594Initialized {
        ERC1594StorageWrapper.initialize();
    }

    /// @inheritdoc IMint
    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(ISSUER_ROLE, AGENT_ROLE))
        onlyWithinMaxSupply(_value, TimeTravelStorageWrapper.getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _tokenHolder)
        onlyCompliant(address(0), _tokenHolder, false)
    {
        TokenCoreOps.issue(_tokenHolder, _value);
        emit ITransfer.Transfer(address(0), _tokenHolder, _value);
        emit IMint.Issued(EvmAccessors.getMsgSender(), _tokenHolder, _value, _data);
    }

    /// @inheritdoc IMint
    function mint(
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(ISSUER_ROLE, AGENT_ROLE))
        onlyWithinMaxSupply(_amount, TimeTravelStorageWrapper.getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _to)
        onlyCompliant(address(0), _to, false)
    {
        TokenCoreOps.issue(_to, _amount);
        emit ITransfer.Transfer(address(0), _to, _amount);
        emit IMint.Issued(EvmAccessors.getMsgSender(), _to, _amount, "");
    }

    /// @inheritdoc IMint
    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper.isIssuable();
    }
}
