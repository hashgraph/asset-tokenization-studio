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

</div>

## Managing Payouts

After creating distributions, you can manage them through the web interface. Payouts are organized into three categories:

- **Upcoming**: Distributions that are scheduled but not yet executed
  - You can cancel distributions from this view if needed
  - View scheduled execution dates
  - Review distribution details before execution

- **Ongoing**: Distributions currently being processed
  - Monitor real-time execution progress
  - View transaction status
  - Track payment confirmations

- **Completed**: Successfully executed distributions
  - View payment history
  - Check transaction records
  - Generate reports

> **Note**: Only distributions in the "Upcoming" status can be cancelled. Once a distribution moves to "Ongoing" or "Completed", it cannot be cancelled.

## Need Help?

- Check the [Developer Guides](../developer-guides/index.md) for technical details
- See the [API Documentation](../api/index.md) for REST API references
- [Report issues](https://github.com/hashgraph/asset-tokenization-studio/issues) on GitHub
