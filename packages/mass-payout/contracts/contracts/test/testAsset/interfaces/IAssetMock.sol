// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

// solhint-disable max-line-length

import { IBond } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBond.sol";
import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";
import { IERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC20.sol";
import { IEquity } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/equity/IEquity.sol";

interface IAssetMock is IBond, IBondRead, IEquity, IERC20 {
    error NotImplemented();
}
