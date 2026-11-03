---
id: roles-and-permissions
title: Roles and Permissions
sidebar_label: Roles and Permissions
sidebar_position: 7
---

# Roles and Permissions

ATS uses role-based access control (RBAC) to manage permissions for security token operations.

## Core Administrative Roles

### DEFAULT_ADMIN_ROLE

- **Purpose**: Super administrator with full control
- **Can do**: Grant/revoke all roles, configure token settings, emergency controls
- **Who needs it**: Token issuer, primary administrator
- ⚠️ **Warning**: Unrestricted access - use multi-signature wallets in production

> **Instant-effect operations.** `DEFAULT_ADMIN_ROLE` can also swap the
> Diamond proxy's resolver and configuration (`updateResolver`,
> `updateConfig`, `updateConfigVersion`), which rewires every facet call in a
> single transaction with no on-chain timelock or user exit window. The
> contracts intentionally rely on the admin account itself — expected to be a
> multisig or governance contract — to provide the delay, review, and
> accountability surface for such changes. Assigning this role to an EOA in
> production is unsupported.

### ROLE_TREX_OWNER

- **Purpose**: Owner of ERC-3643 (T-REX) compliant tokens
- **Can do**: Configure compliance modules, manage identity registry, update token info
- **Who needs it**: Compliance officer for ERC-3643 tokens

## Token Operations

### ROLE_ISSUER

- **Purpose**: Manage token supply and distribution
- **Can do**: Mint/burn tokens, issue to investors, manage supply within cap
- **Use cases**: Initial distribution, funding rounds, token buybacks

### ROLE_CORPORATE_ACTION

- **Purpose**: Execute corporate actions
- **Can do**: Distribute dividends (equity), process coupon payments (bonds), create snapshots
- **Use cases**: Quarterly dividends, bond coupons, special distributions

### ROLE_MATURITY_MANAGER

- **Purpose**: Configure a bond's maturity
- **Can do**: Set and update the maturity date and related bond lifecycle parameters
- **Use cases**: Bond setup, maturity scheduling

> Bonds have no single "bond manager" role — coupon payments use `ROLE_CORPORATE_ACTION`, interest
> rates `ROLE_INTEREST_RATE_MANAGER`, and redemption `ROLE_MATURITY_REDEEMER` (below).

### ROLE_MATURITY_REDEEMER

- **Purpose**: Handle bond maturity redemptions
- **Can do**: Execute maturity redemption, process principal repayment, burn redeemed bonds
- **Use cases**: Bond maturity processing, principal repayment

## Compliance & KYC

### ROLE_KYC

- **Purpose**: Manage investor verification
- **Can do**: Grant/revoke KYC, update investor attributes, mark as accredited
- **Use cases**: Investor onboarding, annual renewal, revocation

### ROLE_KYC_MANAGER

- **Purpose**: Manage external KYC lists
- **Can do**: Add/remove external KYC lists, link to token, query status
- **Use cases**: Third-party KYC providers, shared investor lists

### ROLE_INTERNAL_KYC_MANAGER

- **Purpose**: Control internal KYC system
- **Can do**: Enable/disable internal KYC validation flag
- **Use cases**: Switch between internal and external KYC

### ROLE_SSI_MANAGER

- **Purpose**: Manage Self-Sovereign Identity integration
- **Can do**: Set revocation registry, add/remove credential issuers
- **Use cases**: Terminal 3 integration, SSI configuration

### ROLE_CONTROL_LIST

- **Purpose**: Manage internal transfer restrictions
- **Can do**: Add/remove addresses to whitelist/blacklist
- **Use cases**: Geographic restrictions, investor eligibility

### ROLE_CONTROL_LIST_MANAGER

- **Purpose**: Manage external control lists
- **Can do**: Add/remove external control lists, configure settings
- **Use cases**: Shared regulatory blacklists, multi-token whitelists

## Security & Freeze

### ROLE_PAUSER

- **Purpose**: Emergency pause functionality
- **Can do**: Pause/unpause all token transfers
- **Use cases**: Security incidents, regulatory holds, contract upgrades

### ROLE_PAUSE_MANAGER

- **Purpose**: Manage external pause mechanisms
- **Can do**: Add/remove external pause sources, coordinate cross-token pauses
- **Use cases**: Platform-wide pauses, coordinated security responses

### ROLE_FREEZE_MANAGER

- **Purpose**: Freeze specific accounts or amounts
- **Can do**: Freeze/unfreeze accounts, freeze token amounts, query freeze status
- **Use cases**: Court orders, suspicious activity, lock-up enforcement

### ROLE_LOCKER

- **Purpose**: Create time-locked holdings
- **Can do**: Lock tokens for periods, create vesting schedules, release locked tokens
- **Use cases**: Employee vesting, insider lock-ups, regulatory holding periods

## Administrative Operations

### ROLE_CONTROLLER

- **Purpose**: Forced transfers and balance adjustments
- **Can do**: Force transfer tokens, adjust balances, execute regulatory transfers
- **Use cases**: Court orders, inheritance, lost key recovery
- ⚠️ **Warning**: Powerful role - requires authorization

### ROLE_ADJUSTMENT_BALANCE

- **Purpose**: Adjust token balances
- **Can do**: Modify account balances directly
- **Use cases**: Corrections, regulatory adjustments, special situations

### ROLE_DOCUMENTER

- **Purpose**: Manage token documentation
- **Can do**: Update documents (prospectus), add document hashes, manage disclosures
- **Use cases**: Legal documentation updates, investor relations

### ROLE_CAP

- **Purpose**: Manage token supply cap
- **Can do**: Set maximum supply, update cap limits
- **Use cases**: Initial supply cap, authorized capital increases

### ROLE_SNAPSHOT

- **Purpose**: Create balance snapshots
- **Can do**: Create snapshots, record holder positions at specific times
- **Use cases**: Dividend record dates, voting snapshots, reporting

## Clearing & Settlement

### ROLE_CLEARING

- **Purpose**: Manage clearing operations
- **Can do**: Create holds, execute clearing, coordinate with clearing houses
- **Use cases**: T+2 settlement, clearing house integration

### ROLE_CLEARING_VALIDATOR

- **Purpose**: Validate clearing operations
- **Can do**: Approve clearing, validate settlement instructions
- **Use cases**: Clearing supervision, settlement auditing

## Payment Distribution

### ROLE_PROCEED_RECIPIENT_MANAGER

- **Purpose**: Manage payment recipients
- **Can do**: Configure who receives proceeds from corporate actions
- **Use cases**: Dividend recipients, bond interest recipients

## Specialized Roles

### ROLE_AGENT

- **Purpose**: General operational agent
- **Can do**: Execute transfers on behalf of others, routine administrative tasks
- **Use cases**: Transfer agents, operational team members

### ROLE_PROTECTED_PARTITIONS

- **Purpose**: Manage protected token partitions
- **Can do**: Create protected partitions, manage partition rules
- **Use cases**: Advanced partition management

### ROLE_PROTECTED_PARTITIONS_PARTICIPANT

- **Purpose**: Participate in protected partitions
- **Can do**: Access protected partitions, transfer within partitions
- **Use cases**: Partition access control

### ROLE_WILD_CARD

- **Purpose**: Custom permissions
- **Can do**: Variable based on token configuration
- **Use cases**: Custom implementations only

## Managing Roles

### Granting a Role

1. Navigate to token **Settings** → **Roles**
2. Click **Grant Role**
3. Select role type from dropdown
4. Enter account address
5. Confirm transaction

**Requirements**: Must have DEFAULT_ADMIN_ROLE

### Revoking a Role

1. Go to **Settings** → **Roles**
2. Find account in role members list
3. Click **Revoke**
4. Confirm transaction

### Viewing Role Members

1. Navigate to **Settings** → **Roles**
2. Select role from dropdown
3. View list of accounts with that role

## Common Role Combinations

**Token Issuer Admin**:

```
DEFAULT_ADMIN_ROLE + ROLE_ISSUER + ROLE_CAP
```

**Compliance Officer**:

```
ROLE_KYC + ROLE_CONTROL_LIST + ROLE_FREEZE_MANAGER + ROLE_PAUSER
```

**Corporate Actions Team**:

```
ROLE_CORPORATE_ACTION + ROLE_SNAPSHOT
```

**Bond Administrator**:

```
ROLE_MATURITY_MANAGER + ROLE_MATURITY_REDEEMER + ROLE_CORPORATE_ACTION
```

**External List Manager**:

```
ROLE_KYC_MANAGER + ROLE_CONTROL_LIST_MANAGER + ROLE_PAUSE_MANAGER
```

## Best Practices

### Security

- **Least privilege**: Grant minimum necessary roles
- **Multi-signature**: Use multi-sig for admin roles
- **Regular audits**: Review role assignments quarterly
- **Role separation**: Different people for different roles

### Operational

- **Document assignments**: Maintain off-chain records
- **Backup admins**: Multiple DEFAULT_ADMIN_ROLE holders
- **Emergency procedures**: Clear process for role grants/revokes
- **Role rotation**: Periodic review and rotation

### Compliance

- **Audit trail**: All role changes are on-chain
- **Regulatory alignment**: Match regulatory requirements
- **Clear accountability**: Defined responsibilities per role
- **Segregation of duties**: Prevent conflicts of interest

## Troubleshooting

### Permission Denied

- Check you have the required role
- Verify role was granted (check transaction)
- Confirm using correct account
- Check role wasn't revoked

### Cannot Grant Role

- Only DEFAULT_ADMIN_ROLE can grant roles
- Check recipient address format
- Verify role not already assigned
- Ensure sufficient HBAR for gas

## Next Steps

- [Creating Equity](./creating-equity.md) - Create your first token
- [Managing External KYC Lists](./managing-external-kyc-lists.md) - Use ROLE_KYC_MANAGER
- [Managing External Control Lists](./managing-external-control-lists.md) - Use ROLE_CONTROL_LIST_MANAGER
- [SSI Integration](./ssi-integration.md) - Use ROLE_SSI_MANAGER
