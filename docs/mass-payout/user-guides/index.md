---
id: index
title: User Guides
sidebar_position: 3
---

# User Guides

Step-by-step guides for using the Mass Payout web application.

## Getting Started

Before following these guides, make sure you have:

1. [Set up the Mass Payout application](../getting-started/quick-start.md)
2. Backend and frontend services running
3. PostgreSQL database configured
4. Hedera operator account with HBAR

## Available Guides

<div className="card-grid card-grid-2">
  <div className="card-box card-tip">
    <h3>📥 Importing Assets</h3>
    <p>Import token contracts from ATS or other sources</p>
    <ul>
      <li>Import from ATS</li>
      <li>Sync token holder information</li>
      <li>View holder balances</li>
      <li>Update holder data</li>
    </ul>
    <a href="./importing-assets" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-tip">
    <h3>💵 Creating Distributions</h3>
    <p>Set up dividend or coupon payment distributions</p>
    <ul>
      <li>Configure distribution details</li>
      <li>Set record dates</li>
      <li>Calculate payment amounts</li>
      <li>Schedule execution</li>
    </ul>
    <a href="./creating-distributions" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>📊 Managing Payouts</h3>
    <p>Execute, monitor, and track payment distributions</p>
    <ul>
      <li>Monitor active distributions</li>
      <li>Handle failed payments</li>
      <li>View transaction history</li>
      <li>Generate reports</li>
    </ul>
    <a href="./managing-payouts" className="card-link">Read Guide</a>
  </div>

  <div className="card-box card-info">
    <h3>📅 Scheduled Payouts</h3>
    <p>Set up automatic recurring distributions</p>
    <ul>
      <li>Create schedules</li>
      <li>Configure cron expressions</li>
      <li>Monitor executions</li>
      <li>Manage failures</li>
    </ul>
    <a href="./scheduled-payouts" className="card-link">Read Guide</a>
  </div>

  <div className="card-box">
    <h3>👥 Managing Holders</h3>
    <p>View and manage token holder information</p>
    <ul>
      <li>View holder registry</li>
      <li>Sync balances</li>
      <li>Create snapshots</li>
      <li>Export holder data</li>
    </ul>
    <a href="./holders-management" className="card-link">Read Guide</a>
  </div>
</div>

## Need Help?

- Check the [Developer Guides](../developer-guides/index.md) for technical details
- See the [API Documentation](../api/index.md) for REST API references
- [Report issues](https://github.com/hashgraph/asset-tokenization-studio/issues) on GitHub
