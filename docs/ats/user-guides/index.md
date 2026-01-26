---
id: index
title: User Guides
sidebar_position: 3
---

# User Guides

Step-by-step guides for using the Asset Tokenization Studio web application.

![ATS Web Application](../../images/ats-web-dashboard.png)

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
    <h3>📋 Managing External KYC Lists</h3>
    <p>Configure on-chain KYC lists for investor verification</p>
    <ul>
      <li>Create external KYC lists</li>
      <li>Add verified investors</li>
      <li>Share KYC across tokens</li>
      <li>Query verification status</li>
    </ul>
    <a href="./managing-external-kyc-lists" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>🚫 Managing External Control Lists</h3>
    <p>Configure whitelists and blacklists for transfer control</p>
    <ul>
      <li>Create whitelists and blacklists</li>
      <li>Manage approved addresses</li>
      <li>Geographic restrictions</li>
      <li>Regulatory compliance</li>
    </ul>
    <a href="./managing-external-control-lists" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>🔐 SSI Integration</h3>
    <p>Self-Sovereign Identity with Terminal 3 (Optional)</p>
    <ul>
      <li>Configure SSI verification</li>
      <li>Manage credential issuers</li>
      <li>Set revocation registry</li>
      <li>Decentralized identity verification</li>
    </ul>
    <a href="./ssi-integration" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-warning">
    <h3>👥 Roles and Permissions</h3>
    <p>Understand and manage access control</p>
    <ul>
      <li>Learn about each role</li>
      <li>Grant and revoke permissions</li>
      <li>Role combinations</li>
      <li>Security best practices</li>
    </ul>
    <a href="./roles-and-permissions" className="card-link">Read Guide</a>
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

  <div className="card-box card-info">
    <h3>⚙️ Token Operations</h3>
    <p>Manage token operations and controls</p>
    <ul>
      <li>Mint, transfer, and redeem tokens</li>
      <li>Freeze accounts and pause tokens</li>
      <li>Hold, clearing, and partition operations</li>
      <li>Cap management</li>
    </ul>
    <a href="./token-operations" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>🔧 Updating Configuration</h3>
    <p>Update token configuration and resolver settings</p>
    <ul>
      <li>Set Business Logic Resolver</li>
      <li>Configure version settings</li>
      <li>Upgrade token functionality</li>
      <li>Manage configuration profiles</li>
    </ul>
    <a href="./updating-configuration" className="card-link">Read Guide</a>
  </div>
</div>

## Need Help?

- Check the [Developer Guides](../developer-guides/index.md) for technical details
- See the [API Documentation](../api/index.md) for contract references
- [Report issues](https://github.com/hashgraph/asset-tokenization-studio/issues) on GitHub
