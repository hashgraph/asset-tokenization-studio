// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibCorporateActions — Corporate action registry (28 lines of logic)
/// @notice Records corporate actions (coupons, adjustments, snapshots).
/// @dev LEAF NODE: no dependencies on other libraries.
///      Called by: LibScheduledTasks, NewCouponPaymentFacet, NewAdjustBalancesFacet
library LibCorporateActions {
    event CorporateActionRegistered(uint256 indexed actionId, uint8 actionType);

    function registerAction(
        uint8 actionType,
        bytes memory data,
        bytes memory result
    ) internal returns (uint256) {
        CorporateActionsStorage storage cas = corporateActionsStorage();
        cas.actionCount++;
        uint256 actionId = cas.actionCount;
        cas.actions[actionId] = CorporateAction({
            actionType: actionType,
            timestamp: block.timestamp,
            data: data,
            result: result
        });
        emit CorporateActionRegistered(actionId, actionType);
        return actionId;
    }

    function getAction(uint256 actionId)
        internal view returns (CorporateAction memory)
    {
        return corporateActionsStorage().actions[actionId];
    }

    function getActionCount() internal view returns (uint256) {
        return corporateActionsStorage().actionCount;
    }
}
