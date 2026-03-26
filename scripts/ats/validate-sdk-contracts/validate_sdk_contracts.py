#!/usr/bin/env python3
"""
Cross-validate contract methods against SDK calls.

Rules:
  missing → method exists in contracts but is never called in SDK
  diff    → method is called in SDK but with wrong number of arguments
  success → method is called in SDK with the correct number of arguments
"""
import re
import json
import sys
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Any

# Import shared configuration
from config import AnalysisConfig, normalize_facet_name, count_parameters, facet_list_to_dict, DEFAULT_WORKSPACE as _CONFIG_DEFAULT_WORKSPACE
from log_parser import create_log_parser
from analyze_contracts import NoContractsFoundError, WorkspaceError
from analyze_sdk import PermissionError

ANALYSIS_DIR     = Path(__file__).parent
OUTPUT_DIR       = ANALYSIS_DIR / 'output'
DEFAULT_WORKSPACE = _CONFIG_DEFAULT_WORKSPACE
TIMESTAMP        = datetime.now().strftime('%Y%m%d_%H%M%S')
OUTPUT_DIR.mkdir(exist_ok=True)
LOG_FILE         = OUTPUT_DIR / f'validate_{TIMESTAMP}.log'
JSON_FILE        = OUTPUT_DIR / f'validate_{TIMESTAMP}.json'
#DEFAULT_EXCLUDES = ['ERC20', 'Factory', 'TREXFactory']
DEFAULT_EXCLUDES = []

# ── Exceptions ────────────────────────────────────────────────────────────

class AnalysisError(Exception):
    """Base class for analysis errors with structured data."""
    error_type: str = ""
    message: str = ""
    details: Dict[str, Any] = None
    solutions: List[str] = None
    
    def __post_init__(self):
        super().__init__(self.message)
    
    def __str__(self):
        return f"{self.error_type}: {self.message}"

@dataclass
class ScriptNotFoundError(AnalysisError):
    """Raised when helper script cannot be found."""
    script_name: str
    workspace_path: Path
    tried_locations: List[Path]
    
    def __post_init__(self):
        self.error_type = "SCRIPT_NOT_FOUND"
        self.message = f"Script not found: {self.script_name}"
        self.details = {
            "script": self.script_name,
            "workspace": str(self.workspace_path),
            "tried_locations": [str(p) for p in self.tried_locations]
        }
        self.solutions = [
            f"Ensure workspace path is correct: {self.workspace_path}",
            f"Check that script exists in: workspace/packages/ats/sdk/scripts/",
            f"Or place script in the analysis directory"
        ]
        super().__post_init__()

@dataclass
class ScriptExecutionError(AnalysisError):
    """Raised when helper script execution fails."""
    script_name: str
    return_code: int
    command: List[str]
    stderr: str
    
    def __post_init__(self):
        self.error_type = "SCRIPT_EXECUTION_FAILED"
        self.message = f"Script '{self.script_name}' failed with exit code {self.return_code}"
        self.details = {
            "script": self.script_name,
            "return_code": self.return_code,
            "command": " ".join(self.command),
            "stderr": self.stderr
        }
        self.solutions = [
            "Check script for syntax errors",
            "Verify all dependencies and imports are available",
            "Ensure workspace path and files are accessible"
        ]
        super().__post_init__()

@dataclass
class JSONParsingError(AnalysisError):
    """Raised when JSON parsing fails."""
    script_name: str
    output: str
    
    def __post_init__(self):
        self.error_type = "JSON_PARSING_FAILED"
        self.message = f"Failed to parse JSON output from '{self.script_name}'"
        self.details = {
            "script": self.script_name,
            "output_preview": self.output[:500] + "..." if len(self.output) > 500 else self.output
        }
        self.solutions = [
            "Check if script printed debug messages instead of JSON",
            "Verify script has no syntax errors",
            "Ensure script output is valid JSON format"
        ]
        super().__post_init__()

# ── helpers ──────────────────────────────────────────────────────────────────

def run(script, extra_args=(), workspace=None):
    """Run analysis script with workspace configuration."""
    workspace_path = workspace or DEFAULT_WORKSPACE
    config = AnalysisConfig(workspace_path)
    
    # Try workspace scripts first, then fallback to analysis dir
    script_path = workspace_path / "packages/ats/sdk/scripts" / script
    fallback_path = ANALYSIS_DIR / script
    
    if not script_path.exists():
        if not fallback_path.exists():
            raise ScriptNotFoundError(
                script_name=script,
                workspace_path=workspace_path,
                tried_locations=[script_path, fallback_path]
            )
        else:
            script_path = fallback_path
            print(f"WARNING: Using fallback script location: {fallback_path}", file=sys.stderr)
    
    cmd = [sys.executable, str(script_path)] + list(extra_args)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise ScriptExecutionError(
            script_name=script,
            return_code=r.returncode,
            command=cmd,
            stderr=r.stderr
        )
    
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        raise JSONParsingError(script, r.stdout)


def method_param_map(contract_data):
    """Build {method_name: param_count} from contract facet data."""
    result = {}
    for iface in contract_data.get('interfaces', []):
        m = re.match(r'function\s+(\w+)\s*\(', iface)
        if m:
            result[m.group(1)] = count_parameters(iface)
    return result


def method_signature_map(contract_data):
    """Build {method_name: full_signature} from contract facet data."""
    result = {}
    for iface in contract_data.get('interfaces', []):
        m = re.match(r'function\s+(\w+)\s*\(', iface)
        if m:
            result[m.group(1)] = iface
    return result


def validate(contracts, sdk):
    """Return {missing, diff, success} grouped by facet.

    Iterates over CONTRACT methods (not SDK calls) so that:
      missing → method exists in contract but is never called in SDK
      diff    → method is called in SDK but with wrong number of arguments
      success → method is called in SDK with the correct number of arguments
    """
    # Build lookup: normalized_name → (original_name, data)
    contract_lookup = {normalize_facet_name(k): (k, v) for k, v in contracts.items()}
    sdk_lookup = {normalize_facet_name(k): (k, v) for k, v in sdk.items()}

    missing_out = {}
    diff_out = {}
    success_out = {}

    # Track unmatched facets for reporting
    sdk_unmatched = []
    contract_no_sdk = []

    # Build SDK method lookup: {norm_facet_name: {method_name: first_call_info}}
    sdk_method_lookup = {}
    for sdk_norm_name, (sdk_name, sdk_data) in sdk_lookup.items():
        sdk_method_lookup[sdk_norm_name] = {}
        for call_info in sdk_data.get('calls', []):
            method = call_info['method']
            # Keep first occurrence; multiple calls to same method are deduplicated
            sdk_method_lookup[sdk_norm_name].setdefault(method, call_info)

    # Process CONTRACT methods — this is the correct direction
    for contract_norm_name, (contract_name, contract_data) in contract_lookup.items():
        if contract_norm_name in sdk_method_lookup:
            contract_methods = method_param_map(contract_data)
            contract_signatures = method_signature_map(contract_data)
            sdk_methods = sdk_method_lookup[contract_norm_name]

            for method, contract_params in contract_methods.items():
                if method in sdk_methods:
                    sdk_params = sdk_methods[method]['params']
                    if contract_params == len(sdk_params):
                        success_out.setdefault(contract_name, []).append(method)
                    else:
                        diff_out.setdefault(contract_name, {})[method] = {
                            'contract_params': contract_params,
                            'sdk_params': len(sdk_params)
                        }
                else:
                    # Method exists in contract but is never called in SDK
                    missing_out.setdefault(contract_name, []).append({
                        'method': method,
                        'signature': contract_signatures.get(method, ''),
                    })
        else:
            # Entire facet has no SDK coverage
            contract_no_sdk.append(contract_name)

    # Find SDK facets with no contract match
    for sdk_norm_name, (sdk_name, _) in sdk_lookup.items():
        if sdk_norm_name not in contract_lookup:
            sdk_unmatched.append(sdk_name)

    return {
        'missing': [
            {name: methods}
            for name, methods in sorted(missing_out.items())
        ],
        'diff': [
            {name: details}
            for name, details in sorted(diff_out.items())
        ],
        'success': [
            {name: methods}
            for name, methods in sorted(success_out.items())
        ],
        'sdk_unmatched': sdk_unmatched,
        'contract_no_sdk': contract_no_sdk,
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Cross-validate ATS contracts vs SDK calls.")
    parser.add_argument('--exclude', nargs='+', metavar='FACET', default=DEFAULT_EXCLUDES,
                        help=f'Contract facets to exclude from validation '
                             f'(default: {" ".join(DEFAULT_EXCLUDES)})')
    parser.add_argument('--no-default-excludes', action='store_true',
                        help='Clear default excludes (start from empty list)')
    parser.add_argument('-w', '--workspace', type=Path, default=DEFAULT_WORKSPACE,
                        help=f'Workspace root directory (default: {DEFAULT_WORKSPACE})')
    args = parser.parse_args()

    exclude = [] if args.no_default_excludes else args.exclude
    workspace = args.workspace

    try:
        # Orchestrate analysis
        contract_args = (['--exclude'] + exclude) if exclude else []
        contracts_raw = run('analyze_contracts.py', contract_args, workspace)
        sdk_raw = run('analyze_sdk.py', (), workspace)
        
        # Convert list format to dict format
        contracts_result = facet_list_to_dict(contracts_raw)
        sdk_result = facet_list_to_dict(sdk_raw)
        validation_result = validate(contracts_result, sdk_result)
        
        # Create complete log using LogParser
        with create_log_parser(LOG_FILE, JSON_FILE) as log_parser:
            log_parser.create_validation_log(
                workspace, exclude, contracts_result, sdk_result, validation_result
            )
            log_parser.save_json_and_log_success(validation_result)

        print(json.dumps(validation_result, indent=2))

    except AnalysisError as e:
        # Handle structured errors
        with create_log_parser(LOG_FILE, JSON_FILE) as log_parser:
            log_parser.create_error_log(workspace, exclude, e)
        
        print(f"ERROR: {e.message}", file=sys.stderr)
        print(f"Details logged to: {LOG_FILE}", file=sys.stderr)
        sys.exit(1)
    
    except Exception as e:
        # Handle unexpected errors
        with create_log_parser(LOG_FILE, JSON_FILE) as log_parser:
            log_parser.create_unexpected_error_log(workspace, e)
        
        print(f"UNEXPECTED ERROR: {str(e)}", file=sys.stderr)
        print(f"Details logged to: {LOG_FILE}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
