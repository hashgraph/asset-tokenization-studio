// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

library LibCheckpoints {
    struct Checkpoint {
        uint256 from;
        uint256 value;
    }

    function checkpointsLookup(
        Checkpoint[] storage self,
        uint256 timepoint
    ) internal view returns (uint256 block_, uint256 vote_) {
        uint256 length = self.length;

        uint256 low = 0;
        uint256 high = length;

        if (length > 5) {
            uint256 mid = length - Math.sqrt(length);
            if (self[mid].from > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (self[mid].from > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        if (high == 0) return (0, 0);

        unchecked {
            return (self[high - 1].from, self[high - 1].value);
        }
    }
}
