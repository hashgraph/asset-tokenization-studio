// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _ISSUER_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IMintFacet } from "./IMintFacet.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title Mint
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the consolidated token issuance operations.
 * @dev Gathers `isIssuable`, `issue` and `mint` on top of `ERC1594StorageWrapper`. Both issuance
 *      entry points enforce the same access-control matrix (issuer or agent), supply ceiling and
 *      compliance checks, and differ only in the calldata payload they accept.
 */
abstract contract Mint is IMintFacet, Modifiers {
    /// @inheritdoc IMintFacet
    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(_ISSUER_ROLE, _AGENT_ROLE))
        onlyWithinMaxSupply(_value, TimeTravelStorageWrapper.getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _tokenHolder)
        onlyCompliant(address(0), _tokenHolder, false)
    {
        ERC1594StorageWrapper.issue(_tokenHolder, _value, _data);
    }

    /// @inheritdoc IMintFacet
    function mint(
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(_ISSUER_ROLE, _AGENT_ROLE))
        onlyWithinMaxSupply(_amount, TimeTravelStorageWrapper.getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _to)
        onlyCompliant(address(0), _to, false)
    {
        ERC1594StorageWrapper.issue(_to, _amount, "");
    }

    /// @inheritdoc IMintFacet
    function isIssuable() external view override returns (bool) {
        return ERC1594StorageWrapper.isIssuable();
    }
}
