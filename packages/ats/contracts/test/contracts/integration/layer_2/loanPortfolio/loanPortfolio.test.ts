// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployLoanPortfolioTokenFixture, DEFAULT_LOAN_PORTFOLIO_PARAMS } from "@test";

describe("LoanPortfolio Token Tests", () => {
  it("GIVEN a deployed loanPortfolio token WHEN querying name and symbol THEN returns the configured values", async () => {
    const { erc20Facet, nominalValueFacet } = await loadFixture(deployLoanPortfolioTokenFixture);

    const name = await erc20Facet.name();
    const symbol = await erc20Facet.symbol();
    const nominalValueDecimals = await nominalValueFacet.getNominalValueDecimals();
    const nominalValue = await nominalValueFacet.getNominalValue();

    expect(name).to.equal(DEFAULT_LOAN_PORTFOLIO_PARAMS.name);
    expect(symbol).to.equal(DEFAULT_LOAN_PORTFOLIO_PARAMS.symbol);
    expect(nominalValue).to.equal(DEFAULT_LOAN_PORTFOLIO_PARAMS.nominalValue);
    expect(nominalValueDecimals).to.equal(DEFAULT_LOAN_PORTFOLIO_PARAMS.nominalValueDecimals);
  });
});
