// SPDX-License-Identifier: Apache-2.0

/**
 * Loans-portfolio domain types.
 *
 * The LoansPortfolio asset type is not deployed through the factory; the LoansPortfolioFacet is
 * exercised by the shared AssetMock mega-asset, and this enum backs its integration suite.
 */

export enum HoldingsAssetType {
  NONE,
  LOAN,
  CASH,
}
