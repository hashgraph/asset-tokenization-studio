// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";

interface IERC1410Issuer is IERC1410Types {
    function issueByPartition(IssueData calldata _issueData) external;
}
