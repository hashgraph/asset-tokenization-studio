// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

// solhint-disable max-line-length

import { IBond } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/bond/IBond.sol";
import { IERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IEquity } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/equity/IEquity.sol";
import { IDividend } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/dividend/IDividend.sol";
import { IVoting } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/voting/IVoting.sol";

interface IAssetMock is IBond, IEquity, IDividend, IVoting, IERC20 {
    error NotImplemented();
}
