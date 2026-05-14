// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

// solhint-disable max-line-length
import { ICore } from "@hashgraph/asset-tokenization-contracts/contracts/facets/core/ICore.sol";
import { ICoupon } from "@hashgraph/asset-tokenization-contracts/contracts/facets/coupon/ICoupon.sol";
import { IEquity } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/equity/IEquity.sol";
import { IVoting } from "@hashgraph/asset-tokenization-contracts/contracts/facets/layer_2/voting/IVoting.sol";
import {
    IAdjustBalances
} from "@hashgraph/asset-tokenization-contracts/contracts/facets/adjustBalances/IAdjustBalances.sol";
import {
    IScheduledBalanceAdjustment
} from "@hashgraph/asset-tokenization-contracts/contracts/facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";

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
interface IAssetMock is ICoupon, IEquity, IVoting, ICore, IAdjustBalances, IScheduledBalanceAdjustment {
    /// @notice Reverts from any mock method that has not been given a canned implementation.
    error NotImplemented();
}
