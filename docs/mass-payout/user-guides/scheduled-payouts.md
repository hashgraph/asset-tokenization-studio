---
id: scheduled-payouts
title: Scheduled Recurring Payouts
sidebar_label: Scheduled Payouts
sidebar_position: 4
---

# Scheduled Recurring Payouts

Learn how to set up automatic recurring distributions.

## Overview

Automate regular distributions for:

- Monthly coupon payments
- Quarterly dividends
- Annual distributions
- Custom schedules

## Creating Scheduled Payouts

### Step 1: Configure Schedule

1. Navigate to asset details
2. Select "Create Scheduled Payout"
3. Configure schedule parameters

#### Schedule Type

**Cron Expression**: Advanced scheduling

- Example: `0 0 1 * *` (monthly on 1st)
- Example: `0 0 1 */3 *` (quarterly)

**Simple Schedule**: User-friendly options

- Daily, Weekly, Monthly, Quarterly, Annually
- Select day of month/week
- Set time of execution

### Step 2: Distribution Configuration

Configure payment parameters:

- **Amount**: Fixed or percentage-based
- **Payment Token**: Token for distribution
- **Record Date**: Relative or fixed
- **Execution Time**: Preferred time window

### Step 3: Review and Activate

Review schedule:

- Next execution date
- Estimated cost per execution
- Total scheduled executions
- Notification settings

Activate schedule:

- Click "Activate Schedule"
- Schedule begins on next occurrence
- Can be paused/resumed anytime

## Managing Scheduled Payouts

### Viewing Active Schedules

Dashboard shows:

- All active schedules
- Next execution date/time
- Last execution status
- Schedule history

### Pausing Schedules

Temporarily stop schedule:

1. Navigate to schedule details
2. Click "Pause Schedule"
3. Schedule stops executing
4. Resume when ready

### Modifying Schedules

Update schedule parameters:

- Change frequency
- Update amounts
- Modify payment token
- Adjust execution time

**Note**: Changes apply to future executions only.

### Deleting Schedules

Permanently remove schedule:

1. Select schedule
2. Click "Delete Schedule"
3. Confirm deletion
4. Past executions preserved in history

## Execution History

View all past executions:

- Execution timestamp
- Success/failure status
- Amount distributed
- Number of recipients
- Transaction details

## Monitoring

### Execution Notifications

Configure alerts for:

- Successful execution
- Execution failures
- Insufficient balance warnings
- Schedule changes

### Pre-execution Checks

System verifies before execution:

- Operator account balance sufficient
- Holder balances synced
- Payment token available
- Network connectivity

### Failure Handling

If scheduled execution fails:

- Automatic retry (configurable)
- Alert notifications sent
- Logged for review
- Manual intervention may be required

## Best Practices

### Balance Management

- Maintain sufficient operator balance
- Set up balance alerts
- Pre-fund account for multiple executions
- Monitor payment token supply

### Schedule Testing

- Test schedules with small amounts
- Verify execution timing
- Check notification delivery
- Review first execution carefully

### Maintenance Windows

- Avoid scheduling during maintenance
- Account for network upgrades
- Consider timezone differences
- Plan for holidays and weekends

## Use Cases

### Bond Coupon Payments

Monthly interest payments:

```
Schedule: Monthly on 1st
Amount: 5% annual rate / 12
Payment Token: USDC
Record Date: Last day of previous month
```

### Quarterly Dividends

Quarterly earnings distribution:

```
Schedule: Quarterly (Jan, Apr, Jul, Oct)
Amount: Variable per quarter
Payment Token: USDC
Record Date: Last day of quarter
```

### Annual Distributions

Yearly profit sharing:

```
Schedule: Annually on Dec 31
Amount: Percentage of profits
Payment Token: HBAR
Record Date: Dec 30
```

## Troubleshooting

### Schedule Not Executing

- Check schedule is active
- Verify backend cron job running
- Review operator account balance
- Check system logs

### Incorrect Amounts

- Verify amount calculation logic
- Check payment token decimals
- Review holder balance snapshot
- Confirm token supply unchanged

### Missing Recipients

- Ensure holder sync before execution
- Verify record date configuration
- Check minimum balance thresholds
- Review holder eligibility rules

## Next Steps

- [Managing Payouts](./managing-payouts.md) - Monitor scheduled executions
- [Developer Guide: Backend](../developer-guides/backend/index.md) - Configure cron jobs

_This guide is under development. More detailed content coming soon._
