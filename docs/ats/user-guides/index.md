---
id: index
title: User Guides
sidebar_position: 3
---

# User Guides

Step-by-step guides for using the Asset Tokenization Studio web application.

![ATS Web Application](/img/screenshots/ats/ats-web-dashboard.png)

## Getting Started

Before following these guides, make sure you have:

1. [Set up the ATS web application](../getting-started/quick-start.md)
2. Connected your Hedera wallet (HashPack, Blade, or WalletConnect)
3. Sufficient HBAR for transaction fees

## Available Guides

<div className="card-grid card-grid-2">
  <div className="card-box card-tip">
    <h3>📈 Creating Equity Tokens</h3>
    <p>Issue shares representing company ownership</p>
    <ul>
      <li>Configure token details and supply</li>
      <li>Set up compliance rules</li>
      <li>Enable dividend distributions</li>
      <li>Manage voting rights</li>
    </ul>
    <a href="./creating-equity" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-tip">
    <h3>💰 Creating Bond Tokens</h3>
    <p>Issue bonds with maturity and coupon payments</p>
    <ul>
      <li>Set bond terms and maturity</li>
      <li>Configure coupon rate and frequency</li>
      <li>Schedule interest payments</li>
      <li>Handle maturity redemption</li>
    </ul>
    <a href="./creating-bond" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>🔒 Managing Compliance</h3>
    <p>Set up transfer restrictions and identity verification</p>
    <ul>
      <li>Configure KYC requirements</li>
      <li>Set jurisdiction restrictions</li>
      <li>Manage whitelists</li>
      <li>Generate compliance reports</li>
    </ul>
    <a href="./managing-compliance" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>💼 Corporate Actions</h3>
    <p>Distribute dividends and coupon payments</p>
    <ul>
      <li>Execute dividend distributions</li>
      <li>Process coupon payments</li>
      <li>Handle stock splits</li>
      <li>Manage payment snapshots</li>
    </ul>
    <a href="./corporate-actions" className="card-link">Read Guide</a>
  </div>

  <div className="card-box">
    <h3>♻️ Token Lifecycle</h3>
    <p>Pause, freeze, transfer, and redeem tokens</p>
    <ul>
      <li>Transfer tokens between accounts</li>
      <li>Pause and freeze operations</li>
      <li>Burn and redeem tokens</li>
      <li>Update token metadata</li>
    </ul>
    <a href="./token-lifecycle" className="card-link">Read Guide</a>
  </div>
</div>

## Need Help?

- Check the [Developer Guides](../developer-guides/index.md) for technical details
- See the [API Documentation](../api/index.md) for contract references
- [Report issues](https://github.com/hashgraph/asset-tokenization-studio/issues) on GitHub
