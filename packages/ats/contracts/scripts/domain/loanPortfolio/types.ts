// SPDX-License-Identifier: Apache-2.0

/**
 * Loans-portfolio domain types.
 *
 * The LoansPortfolio asset type is no longer deployed through the factory (BBND-1882), but the
 * LoansPortfolioFacet still exists and is exercised by the shared AssetMock mega-asset, so this
 * enum is retained for the LoansPortfolio facet integration suite.
 */

export enum HoldingsAssetType {
  NONE,
  LOAN,
  CASH,
}
