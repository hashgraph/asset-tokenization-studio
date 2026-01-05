---
id: managing-payouts
title: Managing Payouts
sidebar_label: Managing Payouts
sidebar_position: 3
---

# Managing Payouts

Learn how to monitor, track, and manage payment distributions.

## Overview

Monitor and manage:

- Active distributions
- Payment progress
- Transaction status
- Failed payment recovery

## Monitoring Active Distributions

### Real-time Progress

View distribution execution:

- Total payments vs. completed
- Success/failure rate
- Estimated time remaining
- Current batch being processed

### Transaction Details

For each payment:

- Recipient address
- Amount sent
- Transaction ID
- Status (pending, success, failed)
- Timestamp

## Managing Failed Payments

### Identifying Failures

Common failure reasons:

- Insufficient gas
- Recipient account invalid
- Network congestion
- Rate limiting

### Retry Mechanisms

**Automatic Retry**:

- System retries failed payments (configurable)
- Exponential backoff strategy
- Maximum retry attempts

**Manual Retry**:

1. Navigate to distribution details
2. Select "Failed Payments" tab
3. Click "Retry Failed"
4. Or retry individual payments

### Canceling Distributions

Stop ongoing distribution:

1. Navigate to active distribution
2. Click "Cancel Distribution"
3. Completed payments remain
4. Pending payments canceled

## Payment History

View complete transaction log:

- All distributions
- Filter by asset, date, status
- Export to CSV for reporting
- Transaction details and receipts

## Batch Management

Understanding batch processing:

- Large distributions split into batches
- Default batch size: 100 transactions
- Configurable in backend settings
- Sequential execution for reliability

### Batch Status

Monitor batch execution:

- Current batch number
- Batch size
- Success rate per batch
- Time per batch

## Reports and Analytics

### Distribution Reports

Generate reports for:

- Total distributed amounts
- Holder payment history
- Tax reporting data
- Audit logs

### Export Options

Export data formats:

- CSV for spreadsheets
- JSON for data processing
- PDF for formal reports

## Notification System

Configure notifications (when available):

- Email on distribution completion
- Alerts for failures
- Scheduled distribution reminders
- System status updates

## Best Practices

### Monitoring

- Check distribution status regularly
- Review failed payments promptly
- Monitor operator account balance
- Track network gas prices

### Recovery

- Investigate failure patterns
- Adjust batch sizes if needed
- Ensure sufficient operator balance
- Plan retry timing strategically

## Troubleshooting

### All Payments Failing

- Check operator account balance
- Verify contract permissions
- Review network connectivity
- Check gas price settings

### Some Payments Failing

- Review recipient addresses
- Check payment token balance
- Verify recipient account exists
- Check account receive permissions

### Distribution Stuck

- Check backend service status
- Review database connectivity
- Verify blockchain connection
- Check for rate limiting

## Next Steps

- [Scheduled Payouts](./scheduled-payouts.md) - Automate recurring distributions
- [Developer Guide: Backend](../developer-guides/backend/index.md) - Technical details

_This guide is under development. More detailed content coming soon._
