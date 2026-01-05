---
id: updating-configuration
title: Updating Token Configuration
sidebar_label: Updating Configuration
sidebar_position: 13
---

# Updating Token Configuration

Learn how to update your token's configuration to point to a specific Business Logic Resolver and configuration version.

## Overview

The configuration settings determine which Business Logic Resolver (BLR) your token uses and which version of the business logic to execute. This allows you to upgrade your token's functionality without redeploying the token contract itself.

## Accessing Configuration Settings

1. Navigate to your token from the dashboard
2. Select **Admin View (green)**
3. Go to **Management** tab
4. Click on **Configuration**

## Configuration Fields

### Resolver ID

**What it is**: The Hedera Contract ID of the Business Logic Resolver (BLR)

**Format**: Hedera ID format (e.g., `0.0.7511642`)

**Purpose**: Points your token to the registry of available business logic implementations

**Example**: `0.0.7511642`

### Configuration ID

**What it is**: The unique identifier for the specific configuration set to use

**Format**: 32-byte hexadecimal format (e.g., `0x0000000000000000000000000000000000000000000000000000000000000001`)

**Purpose**: Specifies which configuration profile to load from the resolver

**Example**: `0x0000000000000000000000000000000000000000000000000000000000000001`

### Configuration Version

**What it is**: The version number of the business logic to use

**Format**: Integer (0 or higher)

**Special behavior**:

- **Version 0**: Always uses the latest version available in the resolver
- **Version 1+**: Uses the specific version number

**Recommendation**: Use `0` to automatically benefit from updates

**Example**: `0`

## Example Configuration

```
Configuration Details

Resolver ID
0.0.7511642

Configuration ID
0x0000000000000000000000000000000000000000000000000000000000000001

Configuration Version
0
```

## How to Update Configuration

1. Navigate to **Management** → **Configuration**
2. Click **"Edit Configuration"** or **"Update"**
3. Enter the configuration values:
   - **Resolver ID**: Enter the Hedera ID of the BLR (e.g., `0.0.7511642`)
   - **Configuration ID**: Enter the configuration ID in hex format (e.g., `0x0000000000000000000000000000000000000000000000000000000000000001`)
   - **Configuration Version**: Enter version number (use `0` for latest)
4. Click **"Save"** or **"Update Configuration"**
5. Approve the transaction in your wallet
6. Wait for confirmation

## When to Update Configuration

### Update Resolver ID

- When a new Business Logic Resolver is deployed
- When migrating to a different resolver instance
- When instructed by ATS platform updates

### Update Configuration ID

- When switching to a different configuration profile
- When changing jurisdiction-specific settings
- When adopting new compliance features

### Update Configuration Version

- To upgrade to newer business logic features
- To roll back to a previous version if needed
- To lock to a specific version for stability

## Version Strategy

### Using Version 0 (Latest)

**Advantages**:

- Automatically receive feature updates
- Bug fixes applied automatically
- Always have latest improvements

**Use when**:

- You want automatic updates
- Development/testing environments
- Trust the resolver maintainer

### Using Specific Version (1+)

**Advantages**:

- Predictable behavior
- No unexpected changes
- Full control over upgrades

**Use when**:

- Production environments requiring stability
- Regulatory audit requirements
- Need to test upgrades before applying

## Requirements

- **CONFIGURATOR_ROLE** permission
- Resolver ID must point to a valid deployed resolver contract
- Configuration ID must exist in the resolver

## Verification

After updating configuration, verify the changes:

1. Check the **Configuration Details** section
2. Confirm all values are correct
3. Test a basic operation (e.g., view token details)
4. Monitor for any errors in token operations

## Common Issues

### Invalid Resolver ID

**Error**: "Resolver contract not found" or similar

**Solution**:

- Verify the Resolver ID is correct
- Check that the resolver is deployed on the current network (testnet/mainnet)
- See [Deployed Addresses](../developer-guides/contracts/deployed-addresses.md) for current resolver addresses

### Invalid Configuration ID

**Error**: "Configuration not found"

**Solution**:

- Verify the configuration ID format is correct (32-byte hex)
- Ensure the configuration exists in the resolver
- Contact ATS support for valid configuration IDs

### Insufficient Permissions

**Error**: "Caller does not have CONFIGURATOR_ROLE"

**Solution**:

- Verify you have CONFIGURATOR_ROLE assigned
- See [Roles and Permissions](./roles-and-permissions.md) for how to grant roles

## Related Resources

- [Deployed Addresses](../developer-guides/contracts/deployed-addresses.md) - Current resolver addresses
- [Roles and Permissions](./roles-and-permissions.md) - Understanding role requirements
- [Developer Guide: Upgrading](../developer-guides/contracts/upgrading.md) - Technical details on upgrades
