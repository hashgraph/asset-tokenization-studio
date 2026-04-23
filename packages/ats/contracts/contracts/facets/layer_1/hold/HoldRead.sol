// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldRead } from "./IHoldRead.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract HoldRead is IHoldRead {
    function getHeldAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external view override returns (address) {
        return HoldStorageWrapper.getHoldThirdParty(_holdIdentifier);
    }
}
