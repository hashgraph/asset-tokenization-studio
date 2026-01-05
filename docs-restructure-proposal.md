# Documentation Restructure Proposal

## Overview

Reorganize documentation to clearly separate ATS and Mass Payout products using:

1. **Header tabs** - Top-level navigation between products
2. **Product-specific sidebars** - Each product has its own documentation structure
3. **User and Developer guides** - Clear separation for users vs developers
4. **Shared content** - Common references accessible from both products

## Proposed Structure

### Header Navigation (Navbar)

```
[Home] [ATS] [Mass Payout] [References] [GitHub]
```

### Directory Structure

```
docs/
├── intro.md                          # Landing page (current location)
├── ats/                             # ATS Documentation
│   ├── intro.md                     # ATS Overview
│   ├── getting-started/
│   │   ├── index.md                 # Getting Started Overview
│   │   ├── quick-start.md           # Try the Web App (for users)
│   │   └── full-setup.md            # Full Development Setup
│   ├── user-guides/
│   │   ├── index.md                 # User Guides Overview
│   │   ├── creating-equity.md       # How to create equity tokens
│   │   ├── creating-bond.md         # How to create bond tokens
│   │   ├── managing-compliance.md   # KYC and compliance management
│   │   ├── corporate-actions.md     # Executing dividends, coupons
│   │   └── token-lifecycle.md       # Pausing, freezing, transferring
│   ├── developer-guides/
│   │   ├── index.md                 # Developer Guides Overview
│   │   ├── sdk-integration.md       # Integrating the SDK
│   │   ├── contracts/
│   │   │   ├── index.md
│   │   │   ├── deployment.md
│   │   │   ├── adding-facets.md
│   │   │   ├── upgrading.md
│   │   │   └── documenting-contracts.md
│   │   └── web-app/
│   │       └── index.md
│   └── api/
│       ├── index.md                 # API Documentation Overview
│       ├── contracts/               # From current api/ats-contracts/
│       └── sdk/                     # Future SDK API docs
│
├── mass-payout/                     # Mass Payout Documentation
│   ├── intro.md                     # Mass Payout Overview
│   ├── getting-started/
│   │   ├── index.md                 # Getting Started Overview
│   │   ├── quick-start.md           # Try the Web App (for users)
│   │   └── full-setup.md            # Full Development Setup (Backend + Frontend)
│   ├── user-guides/
│   │   ├── index.md                 # User Guides Overview
│   │   ├── importing-assets.md      # How to import assets
│   │   ├── creating-distributions.md # Setting up payout distributions
│   │   ├── managing-payouts.md      # Managing and monitoring payouts
│   │   ├── scheduled-payouts.md     # Setting up recurring payments
│   │   └── holders-management.md    # Managing token holders
│   ├── developer-guides/
│   │   ├── index.md                 # Developer Guides Overview
│   │   ├── sdk-integration.md       # Integrating the SDK
│   │   ├── contracts/
│   │   │   └── index.md
│   │   ├── backend/
│   │   │   └── index.md
│   │   └── frontend/
│   │       └── index.md
│   └── api/
│       ├── index.md                 # API Documentation Overview
│       ├── contracts/
│       ├── sdk/
│       └── rest-api/                # Backend REST API docs
│
└── references/                      # Shared References (accessible from both)
    ├── index.md
    ├── adr/                         # Architecture Decision Records
    │   ├── index.md
    │   └── 0001-adopt-docs-as-code-philosophy.md
    ├── proposals/                   # Enhancement Proposals
    │   └── index.md
    └── guides/                      # General/Shared Guides
        ├── monorepo-migration.md
        └── ci-cd-workflows.md
```

## ATS Sidebar Structure

```
ATS Documentation
├── Introduction
├── Getting Started
│   ├── Quick Start (Try the Web App)
│   └── Full Development Setup
├── User Guides
│   ├── Creating Equity Tokens
│   ├── Creating Bond Tokens
│   ├── Managing Compliance (KYC)
│   ├── Corporate Actions (Dividends, Coupons)
│   └── Token Lifecycle Management
├── Developer Guides
│   ├── SDK Integration
│   ├── Smart Contracts
│   │   ├── Overview
│   │   ├── Deployment
│   │   ├── Adding Facets
│   │   ├── Upgrading Contracts
│   │   └── Documenting Contracts
│   └── Web Application
└── API Documentation
    ├── Contracts
    └── SDK
```

## Mass Payout Sidebar Structure

```
Mass Payout Documentation
├── Introduction
├── Getting Started
│   ├── Quick Start (Try the Web App)
│   └── Full Development Setup
├── User Guides
│   ├── Importing Assets
│   ├── Creating Distributions
│   ├── Managing Payouts
│   ├── Scheduled Recurring Payouts
│   └── Managing Token Holders
├── Developer Guides
│   ├── SDK Integration
│   ├── Smart Contracts
│   ├── Backend API
│   └── Frontend Application
└── API Documentation
    ├── Contracts
    ├── SDK
    └── REST API
```

## References Sidebar Structure (Accessible from both)

```
References
├── Overview
├── Architecture Decision Records
│   └── ADR-0001: Docs-as-Code Philosophy
├── Enhancement Proposals
└── General Guides
    ├── Monorepo Migration
    └── CI/CD Workflows
```

## User Journey

### For End Users (Want to use the web application)

1. Land on main intro page → Choose ATS or Mass Payout
2. Click header tab for chosen product
3. Navigate to "Getting Started → Quick Start"
4. Follow quick start guide to run the web application
5. Explore "User Guides" to learn specific features (creating assets, managing distributions, etc.)

### For Developers (Want to integrate SDK/Contracts)

1. Land on main intro page → Choose ATS or Mass Payout
2. Click header tab for chosen product
3. Navigate to "Developer Guides → SDK Integration" or "Developer Guides → Smart Contracts"
4. Access API Documentation for detailed reference

## Implementation Details

### Docusaurus Configuration

Will use **multiple docs plugin instances**:

```typescript
// docusaurus.config.ts
presets: [
  [
    'classic',
    {
      docs: {
        id: 'default',
        path: 'docs',
        routeBasePath: 'docs',
        sidebarPath: './sidebars.ts',
      },
    },
  ],
],
plugins: [
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'ats',
      path: 'docs/ats',
      routeBasePath: 'ats',
      sidebarPath: './sidebars-ats.ts',
    },
  ],
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'mass-payout',
      path: 'docs/mass-payout',
      routeBasePath: 'mass-payout',
      sidebarPath: './sidebars-mass-payout.ts',
    },
  ],
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'references',
      path: 'docs/references',
      routeBasePath: 'references',
      sidebarPath: './sidebars-references.ts',
    },
  ],
],
```

### Navbar Configuration

```typescript
navbar: {
  items: [
    {
      type: 'doc',
      docId: 'intro',
      position: 'left',
      label: 'ATS',
      docsPluginId: 'ats',
    },
    {
      type: 'doc',
      docId: 'intro',
      position: 'left',
      label: 'Mass Payout',
      docsPluginId: 'mass-payout',
    },
    {
      type: 'doc',
      docId: 'index',
      position: 'left',
      label: 'References',
      docsPluginId: 'references',
    },
    {
      href: 'https://github.com/hashgraph/asset-tokenization-studio',
      label: 'GitHub',
      position: 'right',
    },
  ],
},
```

## Migration Steps

1. Create new directory structure (docs/ats/, docs/mass-payout/, docs/references/)
2. Move existing files to appropriate locations:
   - Current `getting-started/ats*.md` → `docs/ats/getting-started/`
   - Current `getting-started/mass-payout*.md` → `docs/mass-payout/getting-started/`
   - Current `guides/developer/ats-contracts/` → `docs/ats/developer-guides/contracts/`
   - Current `api/ats-contracts/` → `docs/ats/api/contracts/`
   - Current `references/` stays as is
3. Create intro.md for each product section
4. Create user guides index pages (content to be written based on application features)
5. Create sidebar configuration files for each section
6. Update docusaurus.config.ts with multiple plugins
7. Update all internal links to reflect new structure
8. Test navigation and verify all pages load correctly

## Benefits

✅ **Clear separation** - Users immediately know which product they're looking at
✅ **User-focused** - User guides help end-users learn the web applications
✅ **Developer-focused** - Developer guides for SDK/contract integration
✅ **Better UX** - Clear distinction between using the app vs integrating it
✅ **Scalable** - Easy to add more products or sections in the future
✅ **Maintains context** - Sidebar remains product-specific while browsing
✅ **Shared content** - Common references accessible without duplication
✅ **SEO friendly** - Clear URL structure: /ats/..., /mass-payout/..., /references/...

## Trade-offs

⚠️ **More complex config** - Multiple plugin instances require more configuration
⚠️ **Link updates** - All internal links need to be updated for new structure
⚠️ **Migration effort** - Requires moving and reorganizing existing files
⚠️ **Content creation** - User guides need to be written

---

## Next Steps

Once approved:

1. I'll create the new directory structure
2. Move existing files to their new locations
3. Update all configurations and links
4. Test the new structure locally
5. Create intro pages for each product section
6. Create placeholder user guide index pages (content to be filled based on features)
