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

### TREX_OWNER_ROLE

- **Purpose**: Owner of ERC-3643 (T-REX) compliant tokens
- **Can do**: Configure compliance modules, manage identity registry, update token info
- **Who needs it**: Compliance officer for ERC-3643 tokens

## Token Operations

### ISSUER_ROLE

- **Purpose**: Manage token supply and distribution
- **Can do**: Mint/burn tokens, issue to investors, manage supply within cap
- **Use cases**: Initial distribution, funding rounds, token buybacks

### CORPORATE_ACTION_ROLE

- **Purpose**: Execute corporate actions
- **Can do**: Distribute dividends (equity), process coupon payments (bonds), create snapshots
- **Use cases**: Quarterly dividends, bond coupons, special distributions

### BOND_MANAGER_ROLE

- **Purpose**: Manage bond-specific operations
- **Can do**: Execute coupon payments, process maturity redemption, manage bond lifecycle
- **Use cases**: Bond interest payments, principal repayment at maturity

### MATURITY_REDEEMER_ROLE

- **Purpose**: Handle bond maturity redemptions
- **Can do**: Execute maturity redemption, process principal repayment, burn redeemed bonds
- **Use cases**: Bond maturity processing, principal repayment

## Compliance & KYC

### KYC_ROLE

- **Purpose**: Manage investor verification
- **Can do**: Grant/revoke KYC, update investor attributes, mark as accredited
- **Use cases**: Investor onboarding, annual renewal, revocation

### KYC_MANAGER_ROLE

- **Purpose**: Manage external KYC lists
- **Can do**: Add/remove external KYC lists, link to token, query status
- **Use cases**: Third-party KYC providers, shared investor lists

### INTERNAL_KYC_MANAGER_ROLE

- **Purpose**: Control internal KYC system
- **Can do**: Enable/disable internal KYC validation flag
- **Use cases**: Switch between internal and external KYC

### SSI_MANAGER_ROLE

- **Purpose**: Manage Self-Sovereign Identity integration
- **Can do**: Set revocation registry, add/remove credential issuers
- **Use cases**: Terminal 3 integration, SSI configuration

### CONTROL_LIST_ROLE

- **Purpose**: Manage internal transfer restrictions
- **Can do**: Add/remove addresses to whitelist/blacklist
- **Use cases**: Geographic restrictions, investor eligibility

### CONTROL_LIST_MANAGER_ROLE

- **Purpose**: Manage external control lists
- **Can do**: Add/remove external control lists, configure settings
- **Use cases**: Shared regulatory blacklists, multi-token whitelists

## Security & Freeze

### PAUSER_ROLE

- **Purpose**: Emergency pause functionality
- **Can do**: Pause/unpause all token transfers
- **Use cases**: Security incidents, regulatory holds, contract upgrades

### PAUSE_MANAGER_ROLE

- **Purpose**: Manage external pause mechanisms
- **Can do**: Add/remove external pause sources, coordinate cross-token pauses
- **Use cases**: Platform-wide pauses, coordinated security responses

### FREEZE_MANAGER_ROLE

- **Purpose**: Freeze specific accounts or amounts
- **Can do**: Freeze/unfreeze accounts, freeze token amounts, query freeze status
- **Use cases**: Court orders, suspicious activity, lock-up enforcement

### LOCKER_ROLE

- **Purpose**: Create time-locked holdings
- **Can do**: Lock tokens for periods, create vesting schedules, release locked tokens
- **Use cases**: Employee vesting, insider lock-ups, regulatory holding periods

## Administrative Operations

### CONTROLLER_ROLE

- **Purpose**: Forced transfers and balance adjustments
- **Can do**: Force transfer tokens, adjust balances, execute regulatory transfers
- **Use cases**: Court orders, inheritance, lost key recovery
- ⚠️ **Warning**: Powerful role - requires authorization

### ADJUSTMENT_BALANCE_ROLE

- **Purpose**: Adjust token balances
- **Can do**: Modify account balances directly
- **Use cases**: Corrections, regulatory adjustments, special situations

### DOCUMENTER_ROLE

- **Purpose**: Manage token documentation
- **Can do**: Update documents (prospectus), add document hashes, manage disclosures
- **Use cases**: Legal documentation updates, investor relations

### CAP_ROLE

- **Purpose**: Manage token supply cap
- **Can do**: Set maximum supply, update cap limits
- **Use cases**: Initial supply cap, authorized capital increases

### SNAPSHOT_ROLE

- **Purpose**: Create balance snapshots
- **Can do**: Create snapshots, record holder positions at specific times
- **Use cases**: Dividend record dates, voting snapshots, reporting

## Clearing & Settlement

### CLEARING_ROLE

- **Purpose**: Manage clearing operations
- **Can do**: Create holds, execute clearing, coordinate with clearing houses
- **Use cases**: T+2 settlement, clearing house integration

### CLEARING_VALIDATOR_ROLE

- **Purpose**: Validate clearing operations
- **Can do**: Approve clearing, validate settlement instructions
- **Use cases**: Clearing supervision, settlement auditing

## Payment Distribution

### PROCEED_RECIPIENT_MANAGER_ROLE

- **Purpose**: Manage payment recipients
- **Can do**: Configure who receives proceeds from corporate actions
- **Use cases**: Dividend recipients, bond interest recipients

## Specialized Roles

### AGENT_ROLE

- **Purpose**: General operational agent
- **Can do**: Execute transfers on behalf of others, routine administrative tasks
- **Use cases**: Transfer agents, operational team members

### PROTECTED_PARTITIONS_ROLE

- **Purpose**: Manage protected token partitions
- **Can do**: Create protected partitions, manage partition rules
- **Use cases**: Advanced partition management

### PROTECTED_PARTITIONS_PARTICIPANT_ROLE

- **Purpose**: Participate in protected partitions
- **Can do**: Access protected partitions, transfer within partitions
- **Use cases**: Partition access control

### WILD_CARD_ROLE

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
DEFAULT_ADMIN_ROLE + ISSUER_ROLE + CAP_ROLE
```

**Compliance Officer**:

```
KYC_ROLE + CONTROL_LIST_ROLE + FREEZE_MANAGER_ROLE + PAUSER_ROLE
```

**Corporate Actions Team**:

```
CORPORATE_ACTION_ROLE + SNAPSHOT_ROLE
```

**Bond Administrator**:

```
BOND_MANAGER_ROLE + MATURITY_REDEEMER_ROLE + CORPORATE_ACTION_ROLE
```

**External List Manager**:

```
KYC_MANAGER_ROLE + CONTROL_LIST_MANAGER_ROLE + PAUSE_MANAGER_ROLE
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
- [Managing External KYC Lists](./managing-external-kyc-lists.md) - Use KYC_MANAGER_ROLE
- [Managing External Control Lists](./managing-external-control-lists.md) - Use CONTROL_LIST_MANAGER_ROLE
- [SSI Integration](./ssi-integration.md) - Use SSI_MANAGER_ROLE
