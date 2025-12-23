---
id: protected-partitions
title: Protected Partitions
sidebar_label: Protected Partitions
sidebar_position: 9
---

# Protected Partitions

Learn how to use protected partitions for custodial transfer and redeem operations that require participant approval.

## Overview

Protected partitions emulate traditional financial custody structures where a custodian (participant) validates and submits transactions on behalf of token holders.

### Standard vs Protected Partitions

**Standard Partitions (Unprotected):**

- Token holders directly execute transfers and redeems
- Immediate on-chain execution
- Only basic restrictions apply (KYC, control lists, pause)
- Token holder pays transaction fees

**Protected Partitions:**

- Token holders **sign** transfer/redeem requests off-chain
- Custodian (participant) validates and submits to blockchain
- Additional custodial checks before execution
- Participant pays transaction fees
- Asynchronous process (delay between signing and execution)

### Why Use Protected Partitions?

**Traditional Finance Compatibility:**

- Familiar structure for institutional investors
- Custodian oversight for regulatory compliance
- Additional layer of validation beyond on-chain checks

**Enhanced Security:**

- Custodian can perform additional manual/automated checks
- Review suspicious transactions before submission
- Prevent unauthorized transfers

**Institutional Requirements:**

- Some institutions require custodial approval for all asset movements
- Compliance with internal controls and policies
- Audit trail of custodian reviews

## Key Concepts

### Partitions

Partitions (also called tranches) are subdivisions of a security token:

- Example: "Series A", "Series B", "Restricted Shares", "Free Trading"
- Each partition can have different rules and restrictions
- Token holders can own tokens across multiple partitions

### Protected Status

**All-or-Nothing:**

- When activated, **ALL** partitions become protected
- Cannot have some protected and some unprotected
- Can be toggled on/off during token lifecycle

**Who can toggle:**

- Accounts with PROTECTED_PARTITIONS_ROLE (typically administrators)
- Can activate/deactivate unlimited times

### Participants

**Participant**: Custodian account authorized to submit transactions for a specific partition

**Key characteristics:**

- Each partition has its own participant role
- Account can be participant for one partition but not others
- Participant validates and submits signed transactions to blockchain
- Participant pays gas fees for submission

### Wild Card Role

**PARTITION_RESTRICTION_WILD_CARD_ROLE:**

- Special role that bypasses protected partition restrictions
- Can transfer/redeem as if partitions were unprotected
- Use cases: Emergency operations, administrator actions

## How Protected Partitions Work

### Transfer/Redeem Flow

**Step 1: Token Holder Signs Transaction**

1. Token holder creates transfer/redeem request
2. Signs the request using EIP-712 standard (digital signature)
3. Signature includes:
   - Transfer/redeem details (from, to, amount, partition)
   - Expiration deadline (transaction becomes invalid after this)
   - Network and contract address (prevents replay attacks)
4. Signed request is sent to backend/custodian

**Step 2: Participant Reviews**

1. Custodian (participant) receives signed request
2. Performs additional checks:
   - Internal compliance rules
   - Fraud detection
   - Policy validation
   - Manual review (if needed)

**Step 3: Participant Submits to Blockchain**

1. If approved, participant submits signed transaction to blockchain
2. Participant pays gas fees
3. Smart contract verifies:
   - ✅ Transaction signed by token holder
   - ✅ Signature is valid (EIP-712)
   - ✅ Transaction not expired
   - ✅ Correct network and contract
   - ✅ Submitted by authorized participant for this partition
   - ✅ Passes all on-chain restrictions (KYC, control lists, pause, locks)
4. If all checks pass, transfer/redeem executes

**Step 4: Completion**

- Tokens transfer to destination or are redeemed
- Transaction confirmed on blockchain
- Token holder notified of completion

### If Participant Rejects

- Participant can choose not to submit the signed request
- Transaction never reaches blockchain
- Token holder must create new signed request if issues resolved
- Asynchronous rejection (token holder finds out when transaction doesn't execute)

## Prerequisites

- Security token deployed with partition support
- Protected partitions activated on the token
- Participant accounts configured for each partition
- Backend system to handle signed requests (if using UI)
- Understanding of EIP-712 signature standard (for developers)

## Using Protected Partitions

### As a Token Holder

#### Creating a Protected Transfer

1. Navigate to your security token
2. Go to **"Transfer"** tab
3. Since partitions are protected, you'll see **"Sign Transfer Request"** instead of direct transfer
4. Fill in transfer details:
   - **Partition**: Select the partition to transfer from
   - **Recipient**: Destination account
   - **Amount**: Number of tokens
   - **Expiration**: When signature becomes invalid (e.g., 24 hours)
5. Click **"Sign Request"**
6. Your wallet prompts for EIP-712 signature
7. Sign the request (does not cost gas)
8. Signed request is sent to backend/participant
9. Wait for participant to review and submit

**What happens next:**

- You receive confirmation that request was signed
- Participant reviews the request
- If approved, participant submits to blockchain
- You're notified when transaction executes
- If rejected, you may be notified or request simply doesn't execute

#### Creating a Protected Redeem

1. Navigate to your security token
2. Go to **"Redeem"** tab
3. Fill in redeem details:
   - **Partition**: Select partition to redeem from
   - **Amount**: Number of tokens to redeem
   - **Expiration**: Signature validity period
4. Click **"Sign Redeem Request"**
5. Sign with your wallet (EIP-712 signature)
6. Wait for participant to process

#### Checking Request Status

- Signed requests are stored in backend
- Check status through UI:
  - **Pending**: Awaiting participant review
  - **Submitted**: Participant submitted to blockchain
  - **Executed**: Transaction completed
  - **Rejected**: Participant declined
  - **Expired**: Signature expired before submission

### As a Participant

#### Reviewing Signed Requests

1. Access participant dashboard (backend system)
2. View pending signed requests
3. For each request, review:
   - Token holder identity
   - Transfer/redeem details
   - Compliance status
   - Signature validity
   - Expiration time

#### Approving and Submitting Requests

1. Select a pending request
2. Perform any additional checks (internal policies, fraud detection)
3. If approved:
   - Click **"Submit to Blockchain"**
   - Transaction is sent from your participant account
   - You pay the gas fees
   - Smart contract validates signature and restrictions
   - If valid, transaction executes
4. If rejected:
   - Mark as rejected
   - Optionally notify token holder
   - Request is not submitted

#### Managing Participant Roles

**Prerequisites:**

- Must have PARTICIPANT_ROLE for specific partition

**Operations:**

- Only submit transactions for partitions you're authorized for
- Cannot submit for other partitions
- Each partition can have different participants

## Activating/Deactivating Protected Partitions

### For Administrators

**To Activate Protected Partitions:**

1. Navigate to security token
2. Go to **"Management"** tab
3. Locate **"Protected Partitions"** section
4. Click **"Activate Protected Partitions"**
5. Confirm the action
6. Approve transaction in your wallet

**Effect:**

- **All** partitions become protected
- Token holders can no longer directly transfer/redeem
- Must use signed request flow through participants

**To Deactivate Protected Partitions:**

1. Go to **"Management"** tab → **"Protected Partitions"**
2. Click **"Deactivate Protected Partitions"**
3. Confirm deactivation
4. Approve transaction

**Effect:**

- All partitions become unprotected
- Token holders can directly transfer/redeem again
- Standard transfer restrictions still apply (KYC, control lists, etc.)

> **Note**: You can toggle between protected and unprotected as many times as needed throughout the token's lifecycle.

## Required Roles

**PROTECTED_PARTITIONS_ROLE:**

- Can activate/deactivate protected partitions mode
- Typically held by token administrators
- Controls whether custodial flow is required

**PARTICIPANT_ROLE (per partition):**

- Can submit signed requests for a specific partition
- Example roles: PARTICIPANT_PARTITION_A, PARTICIPANT_PARTITION_B
- Typically held by custodians, brokers, or authorized intermediaries
- Pays gas fees for submissions

**PARTITION_RESTRICTION_WILD_CARD_ROLE:**

- Can bypass protected partition restrictions
- Transfers/redeems work as if partitions were unprotected
- Use for: Emergency operations, admin actions, special circumstances
- Most powerful transfer permission

See [Roles and Permissions](./roles-and-permissions.md) for complete role details.

## Benefits and Trade-offs

### Benefits

**For Institutions:**

- ✅ Familiar custodial model from traditional finance
- ✅ Additional validation layer beyond blockchain
- ✅ Compliance with internal controls
- ✅ Participant oversight of all transactions

**For Token Holders:**

- ✅ Custodian protection against mistakes
- ✅ Additional fraud prevention
- ✅ Institutional-grade security

**For Regulators:**

- ✅ Clear audit trail
- ✅ Custodian accountability
- ✅ Additional compliance checkpoints

### Trade-offs

**Asynchronous Processing:**

- ❌ Delay between signing and execution
- ❌ Not instant like direct transfers
- ❌ Dependent on participant availability

**Gas Fees:**

- ❌ Token holder doesn't control when fees are paid
- ❌ Participant bears gas costs (may charge token holder off-chain)

**Complexity:**

- ❌ More complex than direct transfers
- ❌ Requires backend infrastructure
- ❌ Requires understanding of EIP-712 signatures

**Centralization:**

- ❌ Participant has control over execution
- ❌ Single point of failure if participant is unavailable
- ❌ Requires trust in participant

## Common Use Cases

### Institutional Custody

**Scenario:** Large institutional investor requires custodial approval for all trades

**Solution:**

- Enable protected partitions on token
- Institution's custodian is designated as participant
- All employee/fund transfers require custodian submission
- Custodian validates against internal policies before submitting

### Broker-Dealer Model

**Scenario:** Broker-dealer manages client assets and must approve all movements

**Solution:**

- Protected partitions for client tokens
- Broker-dealer is participant
- Clients sign transfer requests
- Broker validates compliance before submitting to blockchain

### Multi-Partition Compliance

**Scenario:** Token with multiple tranches, each with different custodians

**Solution:**

- Partition A (US investors): US custodian is participant
- Partition B (EU investors): EU custodian is participant
- Each custodian only submits for their partition
- Region-specific compliance enforced by respective custodians

## Common Issues

### Cannot Transfer Directly

**Problem:** Transfer button is disabled or shows "Sign Request" instead

**Solution:**

- Partitions are protected
- Must use signed request flow
- Contact administrator if direct transfers should be allowed

### Signature Expired

**Problem:** Signed request wasn't submitted before expiration

**Solutions:**

- Sign a new request with longer expiration time
- Contact participant to understand delay
- Typical expiration: 24-48 hours

### Request Not Executed

**Problem:** Signed request but transaction never executed

**Possible Reasons:**

- Participant rejected the request (check with custodian)
- Request expired before submission
- On-chain restrictions failed (KYC, control list, pause)
- Technical issue with backend

**Solutions:**

- Check request status in UI
- Contact participant/custodian
- Verify compliance requirements met
- Sign new request if needed

### Wrong Participant

**Problem:** Account trying to submit doesn't have participant role for partition

**Solution:**

- Verify account has PARTICIPANT_ROLE for the specific partition
- Contact administrator to grant role if needed
- Check you're submitting for correct partition

## Best Practices

### For Token Holders

**Set Appropriate Expiration:**

- Give participant enough time to review (24-48 hours typical)
- Consider time zones and business hours
- Too short: Request may expire before review
- Too long: Signature remains valid longer (security consideration)

**Verify Before Signing:**

- Double-check recipient address
- Confirm amount is correct
- Ensure partition is correct
- Review expiration time

**Keep Records:**

- Save confirmation of signed requests
- Track request IDs
- Monitor status until execution

### For Participants

**Timely Processing:**

- Review requests promptly
- Submit approved requests quickly
- Communicate delays to token holders

**Security Checks:**

- Validate signature authenticity
- Verify token holder identity
- Check for suspicious patterns
- Ensure compliance with policies

**Gas Management:**

- Monitor gas fees
- Use appropriate gas prices
- Batch submissions when possible (if system supports)

## Next Steps

- [Hold Operations](./hold-operations.md) - Alternative custody mechanism
- [Clearing Operations](./clearing-operations.md) - Validator approval for transfers
- [Roles and Permissions](./roles-and-permissions.md) - Understanding protected partition roles
- [Token Lifecycle](./token-lifecycle.md) - Complete token management

## Related Resources

- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712) - Typed structured data signing
- [Developer Guide: Protected Partitions](../developer-guides/contracts/index.md)
