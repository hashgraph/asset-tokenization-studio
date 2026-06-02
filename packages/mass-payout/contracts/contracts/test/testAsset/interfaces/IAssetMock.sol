// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

// solhint-disable max-line-length
import { IBond } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/bond/IBond.sol";
import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/bond/IBondRead.sol";
import { ICoupon } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/coupon/ICoupon.sol";
import { IDividend } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/dividend/IDividend.sol";
import { IERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IEquity } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/equity/IEquity.sol";
import { IVoting } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/voting/IVoting.sol";

/**
 * @title IAssetMock
 * @author Asset Tokenization Studio Team
 * @notice Aggregated test-only interface combining the asset facets that the mass-payout
 *         LifeCycleCashFlow integration tests reach for on an asset token.
 * @dev Mock surface used exclusively by `AssetMock`. Inherits every facet interface the
 *      mass-payout flows interact with so the mock implementation can be typed against a
 *      single handle. Production code MUST NOT depend on this interface — use the ATS
 *      umbrella `IAsset` instead.
 */
interface IAssetMock is IBond, ICoupon, IEquity, IVoting, IERC20, IBondRead, IDividend {
    error NotImplemented();
}
