// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "./IVotes.sol";

// solhint-disable no-empty-blocks
interface IERC5805 is IERC6372, IVotes {}
