// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISSUER_ROLE, AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IBatchMint } from "./IBatchMint.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { ITransfer } from "../transfer/ITransfer.sol";
import { IMint } from "../mint/IMint.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BatchMint
 * @notice Abstract contract implementing the `batchMint` operation for the ERC-3643 standard.
 * @dev Provides a single external function, `batchMint`, which issues tokens to an ordered
 *      list of recipients in a single transaction. The function enforces two sequential
 *      passes: a validation pass (identity, compliance, and cap checks for every address)
 *      followed by an issuance pass (calling `ERC1594StorageWrapper.issue` for each).
 *      Inherits modifier guards from `Modifiers` and is intended to be used only through
 *      the `BatchMintFacet` Diamond facet.
 * @author Asset Tokenization Studio Team
 */
abstract contract BatchMint is IBatchMint, Modifiers {
    /// @inheritdoc IBatchMint
    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(ISSUER_ROLE, AGENT_ROLE))
    {
        uint256 length = _toList.length;
        for (uint256 i; i < length; ) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
            CapStorageWrapper.requireWithinMaxSupply(_amounts[i], TimeTravelStorageWrapper.getBlockTimestamp());
            unchecked {
                ++i;
            }
        }
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            TokenCoreOps.issue(_toList[i], _amounts[i]);
            emit ITransfer.Transfer(address(0), _toList[i], _amounts[i]);
            emit IMint.Issued(sender, _toList[i], _amounts[i], "");
            unchecked {
                ++i;
            }
        }
    }
}
