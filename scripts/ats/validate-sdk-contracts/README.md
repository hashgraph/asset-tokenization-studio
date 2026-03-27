# ATS SDK Contracts Validation Guide

## Overview

The `validate_sdk_contracts.py` script performs cross-validation between ATS smart contracts and SDK method calls to ensure consistency and completeness of the integration.

## Purpose

The script identifies three types of validation results:

- **missing**: Methods exist in contracts but are never called in SDK
- **diff**: Methods are called in SDK but with wrong number of arguments
- **success**: Methods are called in SDK with the correct number of arguments

## Usage

### Basic Usage

```bash
npm run ats:scritp:validate-sdk-contracts
```

Or directly:

```bash
python3 scripts/ats/validate-sdk-contracts/validate_sdk_contracts.py
```

### With Custom Workspace

```bash
python3 scripts/ats/validate-sdk-contracts/validate_sdk_contracts.py -w /path/to/custom/workspace
```

### With Exclusions

```bash
python3 scripts/ats/validate-sdk-contracts/validate_sdk_contracts.py --exclude ERC20 Factory TREXFactory
```

### Combined Options

```bash
python3 scripts/ats/validate-sdk-contracts/validate_sdk_contracts.py -w /custom/path --exclude CustomFacet --no-default-excludes
```

## Command Line Options

- `-w, --workspace PATH`: Workspace root directory (default: /home/ruben/workspaces/hashgraph/asset-tokenization-studio)
- `--exclude FACET [FACET ...]`: Contract facets to exclude from validation
- `--no-default-excludes`: Clear default excludes (start from empty list)

## Output Files

The script generates timestamped output files in the `output/` directory (created automatically next to the script):

```
scripts/ats/output/
├── validate_YYYYMMDD_HHMMSS.log
└── validate_YYYYMMDD_HHMMSS.json
```

### 1. Log File (`output/validate_YYYYMMDD_HHMMSS.log`)

Contains detailed human-readable validation results including:

- Execution timestamp and workspace path
- Contract and SDK facet counts
- Summary statistics (success/missing/diff percentages)
- Missing methods by facet
- Parameter count differences

### 2. JSON File (`output/validate_YYYYMMDD_HHMMSS.json`)

Structured data with complete validation results:

```json
{
  "missing": [{ "FacetName": [{ "method": "methodName", "signature": "function methodName(...) external" }] }],
  "diff": [{ "FacetName": { "methodName": { "contract_params": 2, "sdk_params": 3 } } }],
  "success": [{ "FacetName": ["method1", "method2"] }],
  "sdk_unmatched": ["SDKFacet1", "SDKFacet2"],
  "contract_no_sdk": ["ContractFacet1", "ContractFacet2"]
}
```

## Common Execution Issues

### Permission Errors

**Problem**: Cannot read/write files
**Solution**: The script provides clear permission error messages with specific solutions:

- File permission checking commands
- Directory permission verification
- User privilege recommendations

### JSON Parsing Errors

**Problem**: Invalid JSON from helper scripts
**Solution**: Enhanced error handling shows:

- Partial output received for debugging
- Common causes of JSON parsing failures
- Specific troubleshooting steps

### Example error output

#### ERROR: No contract facets found

```
Workspace: /home/ruben/workspaces/hashgraph/asset-tokenization-studio
Contracts directory: /workspace/packages/ats/contracts/contracts
Scan directories: ['layer_1', 'layer_2', 'layer_3']
Skip directories: {'interfaces', 'constants', 'mocks', 'test', 'proxies', 'resolver', 'libraries'}

Possible issues:
  1. Contracts directory is empty or missing contract files
  2. All contracts are being skipped by skip patterns
  3. All contracts are excluded by --exclude parameter
  4. Contract files don't have the expected .sol extension
  5. No public/external methods found in contracts

Troubleshooting:
  1. Check if contracts exist: ls -la /workspace/packages/ats/contracts/contracts
  2. Verify scan directories exist:
     ✓ /workspace/packages/ats/contracts/contracts/layer_1
     ✗ /workspace/packages/ats/contracts/contracts/layer_2
     ✓ /workspace/packages/ats/contracts/contracts/layer_3
  3. Try without exclusions: remove --exclude parameter
  4. Use --list-dirs to see configuration
```

#### ERROR: Script not found: analyze_contracts.py

```
Tried locations:
  1. /workspace/packages/ats/sdk/scripts/analyze_contracts.py (workspace scripts)
  2. /workspace/scripts/ats/analyze_contracts.py (script directory)

Solutions:
  1. Ensure workspace path is correct: /workspace
  2. Check that script exists in: workspace/packages/ats/sdk/scripts/
  3. Or place script in the script directory: scripts/ats/
```

## Example Output

```
=== ATS SDK / Contracts validation ===
Date    : 2026-03-10 11:58:23
Workspace: /home/ruben/workspaces/hashgraph/asset-tokenization-studio
Exclude : (none)
Log     : scripts/ats/validate-sdk-contracts/output/validate_20260310_115823.log
JSON    : scripts/ats/validate-sdk-contracts/output/validate_20260310_115823.json

Running contract analysis...
  53 contract facets found
Running SDK analysis...
  55 SDK facets found

── facet discrepancies ───────────────────
  SDK facets with no contract match (7): ...
  Contract facets with no SDK coverage (5): ...

Results: 312 contract methods analysed
  success : 219 (70%)
  missing : 93 (29%)
  diff    : 0

── missing by facet ─────────────────────
  Cap (2):
    ✗ function initialize_Cap( uint256 maxSupply, ... ) external
    ✗ function setMaxSupplyByPartition( bytes32 _partition, ... ) external
  ...

── diff (wrong param count) ─────────────
```

## Notes

### DIFF output

#### Parameter counting

The script counts parameters based on the Solidity function signature (contract side) and the
arguments passed in the SDK call (SDK side). Ethers.js call override objects such as
`{ from: signer, gasLimit: 100000 }` passed as the last argument are automatically excluded
from the SDK parameter count, since they are not part of the contract ABI.
