// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ThirdPartyType } from "../../types/ThirdPartyType.sol";

interface IHoldBase {
    enum OperationType {
        Execute,
        Release,
        Reclaim
    }

    struct HoldIdentifier {
        bytes32 partition;
        address tokenHolder;
        uint256 holdId;
    }

    struct Hold {
        uint256 amount;
        uint256 expirationTimestamp;
        address escrow;
        address to;
        bytes data;
    }

    struct ProtectedHold {
        Hold hold;
        uint256 deadline;
        uint256 nonce;
    }

    struct HoldData {
        uint256 id;
        Hold hold;
        bytes operatorData;
        ThirdPartyType thirdPartyType;
    }
}
