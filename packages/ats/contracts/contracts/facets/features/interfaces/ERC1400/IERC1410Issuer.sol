// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { IssueData } from "./IERC1410Types.sol";

interface IERC1410Issuer {
    function issueByPartition(IssueData calldata _issueData) external;
}
