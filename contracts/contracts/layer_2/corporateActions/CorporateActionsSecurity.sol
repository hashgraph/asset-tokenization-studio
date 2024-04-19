pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    CorporateActionsStorageWrapperSecurity
} from './CorporateActionsStorageWrapperSecurity.sol';
import {
    CorporateActions
} from '../../layer_1/corporateActions/CorporateActions.sol';
import {
    CorporateActionsStorageWrapper
} from '../../layer_1/corporateActions/CorporateActionsStorageWrapper.sol';

contract CorporateActionsSecurity is
    CorporateActions,
    CorporateActionsStorageWrapperSecurity
{
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        internal
        virtual
        override(
            CorporateActionsStorageWrapper,
            CorporateActionsStorageWrapperSecurity
        )
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        return
            CorporateActionsStorageWrapperSecurity._addCorporateAction(
                _actionType,
                _data
            );
    }
}
