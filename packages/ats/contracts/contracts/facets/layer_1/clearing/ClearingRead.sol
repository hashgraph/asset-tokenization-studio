// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRead } from "./IClearingRead.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";

abstract contract ClearingRead is IClearingRead {
    function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_) {
        return
            ClearingReadOps.getClearedAmountForAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOpeartionType,
        uint256 _clearingId
    ) external view override returns (address thirdParty_) {
        thirdParty_ = ClearingStorageWrapper.getClearingThirdParty(
            _partition,
            _tokenHolder,
            _clearingOpeartionType,
            _clearingId
        );
    }
}
