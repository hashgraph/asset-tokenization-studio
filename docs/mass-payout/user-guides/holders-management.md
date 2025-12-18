---
id: holders-management
title: Managing Token Holders
sidebar_label: Managing Holders
sidebar_position: 5
---

# Managing Token Holders

Learn how to view and manage token holder information.

## Overview

Manage holder data for:

- Viewing holder registry
- Syncing balances
- Tracking holder changes
- Analyzing holder distribution

## Viewing Holder Registry

### Holder List

Access holder information:

1. Navigate to asset details
2. Select "Holders" tab
3. View complete holder list

Displayed information:

- Hedera account ID
- Current token balance
- Percentage of total supply
- Last updated timestamp

### Filtering and Search

Find specific holders:

- Search by account ID
- Filter by balance range
- Sort by balance or date
- Export filtered results

## Syncing Holder Data

### Manual Sync

Update holder information:

1. Navigate to asset holders
2. Click "Sync Holders"
3. System queries blockchain
4. Database updated with latest balances

**When to sync**:

- Before creating distributions
- After significant token transfers
- Periodically for accuracy
- When data appears stale

### Automatic Sync

Configurable automatic updates:

- Blockchain event listener
- Scheduled sync jobs
- Real-time updates (if enabled)
- Configurable sync interval

## Holder Analytics

### Distribution Analysis

View holder distribution:

- Top holders by balance
- Holder count over time
- Average holder balance
- Median holding size

### Concentration Metrics

Analyze ownership concentration:

- Top 10 holders percentage
- Gini coefficient (if available)
- Holder tiers (whales, mid, small)

## Holder History

Track holder changes:

- New holders added
- Holders who exited
- Balance change history
- Transfer activity

## Managing Holder Snapshots

### Creating Snapshots

Capture point-in-time balances:

1. Select "Create Snapshot"
2. Choose snapshot date
3. System captures all balances
4. Snapshot saved for distributions

### Viewing Snapshots

Access historical snapshots:

- List of all snapshots
- Snapshot date and holder count
- Associated distributions
- Holder balances at snapshot time

### Using Snapshots

Apply snapshots to distributions:

- Select snapshot as record date
- Ensures accurate distribution
- Historical accuracy maintained

## Data Export

Export holder data:

### CSV Export

Download spreadsheet:

- Complete holder list
- Balances and percentages
- Custom date ranges
- Distribution history

### JSON Export

Structured data export:

- Machine-readable format
- Integration with other systems
- API responses
- Backup purposes

## Privacy and Compliance

### Data Protection

Holder information handling:

- Account IDs only (pseudonymous)
- No personal information stored
- Blockchain data public
- Comply with data regulations

### Audit Logs

Track holder data access:

- Who accessed holder data
- When data was exported
- Changes to holder records
- Sync operations performed

## Best Practices

### Data Accuracy

- Sync before important operations
- Regular sync schedule
- Verify critical holder balances
- Cross-check with blockchain

### Performance

- Paginate large holder lists
- Index frequent queries
- Archive old snapshots
- Optimize sync intervals

## Troubleshooting

### Holder Count Mismatch

- Sync holder data
- Check blockchain sync status
- Verify account thresholds
- Review zero-balance accounts

### Missing Holders

- Check last sync timestamp
- Verify holder has non-zero balance
- Review sync error logs
- Manual blockchain query

### Balance Discrepancies

- Force full re-sync
- Compare with Mirror Node data
- Check for pending transactions
- Review recent transfers

## Next Steps

- [Creating Distributions](./creating-distributions.md) - Use holder data for payouts
- [Managing Payouts](./managing-payouts.md) - Execute distributions to holders

_This guide is under development. More detailed content coming soon._
