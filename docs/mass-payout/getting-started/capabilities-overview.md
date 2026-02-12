---
id: capabilities-overview
title: Product Capabilities
sidebar_position: 1
---

# Mass Payout Product Capabilities

Mass Payout enables you to distribute payments to thousands of token holders efficiently and reliably. This guide provides a comprehensive overview of what you can accomplish with Mass Payout.

## At a Glance

| Category               | What You Get                                                 |
| ---------------------- | ------------------------------------------------------------ |
| **Distribution Types** | Dividends, coupon payments, and custom distributions         |
| **Payment Methods**    | HBAR and any HTS token                                       |
| **Automation**         | Scheduled payouts with cron-like scheduling                  |
| **Scale**              | Batch payments to thousands of holders in a single operation |
| **Tracking**           | Real-time monitoring, audit trails, and failure recovery     |
| **Integration**        | Seamless import from ATS tokens or external contracts        |

---

## Payment Distribution

### What You Can Distribute

| Distribution Type        | Description                                          | Best For                                    |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------- |
| **Dividends**            | Share company profits with equity token holders      | Quarterly/annual profit distributions       |
| **Coupon Payments**      | Pay interest to bond token holders                   | Monthly, quarterly, or semi-annual interest |
| **Custom Distributions** | Any payment to token holders based on their holdings | Rewards, rebates, profit sharing            |

### How Payments Are Calculated

| Method                     | Description                                   | Example                                |
| -------------------------- | --------------------------------------------- | -------------------------------------- |
| **Fixed Amount per Token** | Each token receives the same payment          | $0.50 per share dividend               |
| **Percentage of Holdings** | Payment proportional to ownership percentage  | Pro-rata distribution of $100,000 pool |
| **Snapshot-Based**         | Balances captured at a specific point in time | Record date for dividend eligibility   |

---

## Automation & Scheduling

### Scheduled Payouts

Set up payments to run automatically without manual intervention.

| Feature              | What It Does                                               | Business Benefit                         |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Cron Scheduling**  | Define when payouts execute (daily, weekly, monthly, etc.) | "Set and forget" recurring distributions |
| **Auto Snapshots**   | Automatically capture holder balances before distribution  | Ensure accurate record-date calculations |
| **Automatic Retry**  | Failed payments are retried automatically                  | Minimize manual intervention             |
| **Queue Processing** | Large distributions processed in batches                   | Handle thousands of holders efficiently  |

### Scheduling Options

| Schedule      | Example Use Case                                |
| ------------- | ----------------------------------------------- |
| **One-time**  | Special dividend, bonus distribution            |
| **Monthly**   | Monthly interest payments, rental distributions |
| **Quarterly** | Quarterly dividends, coupon payments            |
| **Custom**    | Any cron expression for flexible scheduling     |

---

## Asset Management

### Importing Assets

Connect to your token contracts to start distributing payments.

| Source              | Description                                                 | What Gets Imported                         |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| **ATS Tokens**      | Import equity or bond tokens from Asset Tokenization Studio | Token metadata, holder addresses, balances |
| **External Tokens** | Import any HTS token contract                               | Token ID, holder addresses, balances       |

### Holder Synchronization

| Feature             | What It Does                                        | Business Benefit                             |
| ------------------- | --------------------------------------------------- | -------------------------------------------- |
| **Auto Sync**       | Periodically update holder balances from blockchain | Always have current holder data              |
| **Manual Refresh**  | Trigger sync on demand                              | Get latest data before creating distribution |
| **Balance History** | Track holder balances over time                     | Audit trail and historical reporting         |

---

## Payment Execution

### Batch Processing

Efficiently process large numbers of payments.

| Feature                 | What It Does                                     | Business Benefit                          |
| ----------------------- | ------------------------------------------------ | ----------------------------------------- |
| **Batch Transactions**  | Group multiple payments into single transactions | Reduce gas costs and processing time      |
| **Parallel Processing** | Execute multiple batches simultaneously          | Faster completion for large distributions |
| **Progress Tracking**   | Real-time visibility into execution status       | Know exactly where you are in the process |

### Payment Currencies

| Currency       | Description                                                |
| -------------- | ---------------------------------------------------------- |
| **HBAR**       | Native Hedera currency                                     |
| **HTS Tokens** | Any Hedera Token Service token (USDC, custom tokens, etc.) |

---

## Monitoring & Tracking

### Distribution Status

Track your distributions through their lifecycle.

| Status        | What It Means                  | Actions Available                   |
| ------------- | ------------------------------ | ----------------------------------- |
| **Upcoming**  | Scheduled but not yet executed | Cancel, modify, view details        |
| **Ongoing**   | Currently being processed      | Monitor progress, view transactions |
| **Completed** | Successfully finished          | View history, download reports      |
| **Failed**    | Encountered errors             | View errors, retry failed payments  |

### Reporting & Audit

| Feature                 | What It Provides                | Use Case                           |
| ----------------------- | ------------------------------- | ---------------------------------- |
| **Transaction History** | Complete record of all payments | Audit trail, reconciliation        |
| **Holder Reports**      | Who received what and when      | Investor statements, tax reporting |
| **Error Logs**          | Detailed failure information    | Troubleshooting, support           |

---

## Failure Recovery

### Automatic Retry

| Feature                  | What It Does                                     | Business Benefit                           |
| ------------------------ | ------------------------------------------------ | ------------------------------------------ |
| **Smart Retry**          | Automatically retry failed payments with backoff | Most failures resolve without intervention |
| **Partial Success**      | Successfully paid holders are not re-paid        | No duplicate payments                      |
| **Error Classification** | Categorize failures by type                      | Know which errors need manual attention    |

### Manual Recovery

| Action                  | When to Use                            |
| ----------------------- | -------------------------------------- |
| **Retry Failed**        | Retry only the payments that failed    |
| **Cancel Distribution** | Stop a problematic distribution        |
| **Adjust and Rerun**    | Fix issues and create new distribution |

---

## Integration with ATS

### Seamless Workflow

| Step                       | What Happens                          | Where       |
| -------------------------- | ------------------------------------- | ----------- |
| **1. Create Token**        | Issue equity or bond token            | ATS         |
| **2. Mint to Holders**     | Distribute tokens to investors        | ATS         |
| **3. Import Asset**        | Sync token and holders to Mass Payout | Mass Payout |
| **4. Create Distribution** | Configure payment details             | Mass Payout |
| **5. Execute**             | Payments distributed to all holders   | Mass Payout |

### Required Permissions

| Permission        | Why It's Needed                                       |
| ----------------- | ----------------------------------------------------- |
| **SNAPSHOT_ROLE** | Required for capturing holder balances at record date |

---

## Access Control

### Role-Based Permissions

| Role                      | What They Can Do               | Typical Assignment     |
| ------------------------- | ------------------------------ | ---------------------- |
| **PAYOUT**                | Execute distributions          | Finance team, treasury |
| **CASHOUT**               | Execute bond redemptions       | Finance team           |
| **PAUSER**                | Pause/unpause operations       | Compliance, admin      |
| **PAYMENT_TOKEN_MANAGER** | Manage accepted payment tokens | Admin                  |
| **TRANSFERER**            | Transfer funds                 | Treasury               |

---

## Technical Integration

### For Developers

| Integration        | What It Provides                               | Use Case                        |
| ------------------ | ---------------------------------------------- | ------------------------------- |
| **REST API**       | Complete programmatic access to all operations | Custom applications, automation |
| **TypeScript SDK** | Type-safe client for blockchain operations     | Direct contract interaction     |
| **Webhooks**       | Real-time notifications of events              | Trigger external workflows      |

### API Capabilities

| Endpoint Category | Operations                              |
| ----------------- | --------------------------------------- |
| **Assets**        | Import, sync, list, get details         |
| **Distributions** | Create, schedule, execute, cancel       |
| **Holders**       | List, get balances, view history        |
| **Payouts**       | Track status, retry failed, get reports |

---

## Next Steps

Ready to get started? Choose your path:

- **[Quick Start](./quick-start.md)** - Try the web application
- **[Full Setup](./full-setup.md)** - Set up development environment

Or dive into specific guides:

- **[Importing Assets](../user-guides/importing-assets.md)** - Connect your tokens
- **[Creating Distributions](../user-guides/creating-distributions.md)** - Set up your first payout
