// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_ISSUER, ROLE_AGENT, DEFAULT_ADMIN_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IBatchMint, RESOLVER_KEY_BATCH_MINT } from "./IBatchMint.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IMintTypes } from "../mint/IMintTypes.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BatchMint
 * @notice Abstract contract implementing the `batchMint` operation for the ERC-3643 standard.
 * @dev Provides a single external onlyOperational function, `batchMint`, which issues tokens to an ordered
 *      list of recipients in a single transaction. The function enforces two sequential
 *      passes: a validation pass (identity, compliance, and cap checks for every address)
 *      followed by an issuance pass (calling `TokenCoreOps.issue` for each).
 *      Inherits modifier guards from `Modifiers` and is intended to be used only through
 *      the `BatchMintFacet` Diamond facet.
 * @author Asset Tokenization Studio Team
 */
abstract contract BatchMint is IBatchMint, Modifiers {
    /// @inheritdoc IBatchMint
    function initializeBatchMint()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BATCH_MINT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BATCH_MINT);
        emit IBatchMint.BatchMintInitialized();
    }

    /// @inheritdoc IBatchMint
    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(ROLE_ISSUER, ROLE_AGENT))
    {
        uint256 totalAmount;
        uint256 length = _toList.length;
        for (uint256 i; i < length; ) {
            TokenCoreOps.checkIdentity(address(0), _toList[i]);
            TokenCoreOps.checkCompliance(address(0), _toList[i], false);
            totalAmount += _amounts[i];
            unchecked {
                ++i;
            }
        }
        CapStorageWrapper.checkMaxSupply(totalAmount, TimeTravelStorageWrapper.getBlockTimestamp());
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            TokenCoreOps.issue(_toList[i], _amounts[i]);
            emit IMintTypes.Issued(sender, _toList[i], _amounts[i], "");
            unchecked {
                ++i;
            }
        }
    }
}
