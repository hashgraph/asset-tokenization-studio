#!/usr/bin/env python3
"""
Extract public/external methods from ATS contracts.
Improved version with shared configuration and utilities.
"""
import re
import os
import sys
import json
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

# Import shared configuration
from config import AnalysisConfig, normalize_facet_name, strip_comments, normalize_string

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
class NoContractsFoundError(AnalysisError):
    """Raised when no contract facets are found."""
    workspace: Path
    contracts_dir: Path
    scan_dirs: List[str]
    skip_dirs: set
    excluded: Optional[List[str]] = None
    
    def __post_init__(self):
        self.error_type = "NO_CONTRACTS_FOUND"
        self.message = "No contract facets found!"
        self.details = {
            "workspace": str(self.workspace),
            "contracts_dir": str(self.contracts_dir),
            "scan_dirs": self.scan_dirs,
            "skip_dirs": list(self.skip_dirs),
            "excluded": self.excluded or []
        }
        self.solutions = [
            "Check if contracts exist in the directory",
            "Verify scan directories exist and contain .sol files",
            "Try without exclusions: remove --exclude parameter",
            "Check if contracts have public/external methods"
        ]
        super().__post_init__()

@dataclass
class WorkspaceError(AnalysisError):
    """Raised when workspace validation fails."""
    workspace_path: Path
    missing_paths: List[str]
    
    def __post_init__(self):
        self.error_type = "WORKSPACE_VALIDATION_FAILED"
        self.message = "Workspace validation failed"
        self.details = {
            "workspace": str(self.workspace_path),
            "missing_paths": self.missing_paths
        }
        self.solutions = [
            "Verify workspace path is correct",
            "Ensure ATS project structure exists",
            "Use -w/--workspace to specify correct path"
        ]
        super().__post_init__()

def extract_signatures(content, config):
    """Extract function signatures as normalized single-line strings."""
    # Strip comments using shared utility
    content = strip_comments(content)

    results = []
    for m in re.finditer(r'\bfunction\s+(\w+)', content):
        name = m.group(1)
        if name == 'constructor' or name.startswith('_'):
            continue

        # Find opening paren of params
        pos = content.find('(', m.end())
        if pos == -1:
            continue

        # Balance parentheses to find end of params
        depth, i = 0, pos
        while i < len(content):
            if content[i] == '(':
                depth += 1
            elif content[i] == ')':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        else:
            continue
        params_end = i

        # Everything after params up to { or ;
        after_params = content[params_end + 1:]
        end = re.search(r'[{;]', after_params)
        if not end:
            continue

        # Only include configured visibility modifiers
        visibility_zone = after_params[:end.start()]
        modifiers_pattern = r'\b(' + '|'.join(config.visibility_modifiers) + r')\b'
        if not re.search(modifiers_pattern, visibility_zone):
            continue

        sig = content[m.start():params_end + 1 + end.start()]
        results.append((name, normalize_string(sig).strip()))

    return results

def scan_contracts(config, exclude=None):
    """Scan contracts using provided configuration."""
    exclude = {e.lower() for e in (exclude or [])}
    facets = {}
    
    for scan_dir in config.scan_dirs:
        base = config.contracts_dir / scan_dir
        if not base.exists():
            print(f"Warning: Directory {base} does not exist, skipping", file=sys.stderr)
            continue
            
        for root, dirs, files in os.walk(base):
            dirs[:] = sorted(d for d in dirs if d not in config.skip_dirs)
            for file in sorted(files):
                if not file.endswith('.sol') or any(file.endswith(s) for s in config.skip_suffixes):
                    continue
                name = file[:-4]
                if name.lower() in exclude:
                    continue
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        funcs = extract_signatures(f.read(), config)
                    if funcs:
                        entry = facets.setdefault(name, {'methods': set(), 'interfaces': set()})
                        for fn_name, sig in funcs:
                            entry['methods'].add(fn_name)
                            entry['interfaces'].add(sig)
                except Exception as e:
                    print(f"Error processing {file}: {e}", file=sys.stderr)
    return facets

def main():
    parser = argparse.ArgumentParser(description="Extract public methods from ATS contracts.")
    parser.add_argument('--exclude', nargs='+', metavar='FACET', default=[],
                        help='Facet names to exclude (case-insensitive)')
    parser.add_argument('-w', '--workspace', type=Path, 
                        help='Workspace root directory')
    parser.add_argument('--list-dirs', action='store_true',
                        help='List configured directories and exit')
    args = parser.parse_args()

    config = AnalysisConfig(args.workspace)
    
    if args.list_dirs:
        print(f"Workspace: {config.workspace}")
        print(f"Contracts directory: {config.contracts_dir}")
        print(f"Scan directories: {config.scan_dirs}")
        print(f"Skip directories: {config.skip_dirs}")
        print(f"Visibility modifiers: {config.visibility_modifiers}")
        return

    # Validate paths
    missing = config.validate_paths()
    if missing:
        print(f"Warning: Missing paths: {', '.join(missing)}", file=sys.stderr)
        if not config.contracts_dir.exists():
            raise WorkspaceError(
                workspace_path=config.workspace,
                missing_paths=[str(config.contracts_dir)]
            )

    if args.exclude:
        print(f"Excluding: {', '.join(args.exclude)}", file=sys.stderr)

    facets = scan_contracts(config, exclude=args.exclude)
    
    # Check if no contracts were found
    if not facets:
        raise NoContractsFoundError(
            workspace=config.workspace,
            contracts_dir=config.contracts_dir,
            scan_dirs=config.scan_dirs,
            skip_dirs=config.skip_dirs,
            excluded=args.exclude if args.exclude else None
        )
    
    # Log success
    print(f"Found {len(facets)} contract facets", file=sys.stderr)
    
    result = [
        {name: {"methods": sorted(d['methods']), "interfaces": sorted(d['interfaces'])}}
        for name, d in sorted(facets.items())
    ]
    return result

if __name__ == "__main__":
    try:
        result = main()
        print(json.dumps(result, indent=2))
    except AnalysisError as e:
        print(f"ERROR: {e.message}", file=sys.stderr)
        sys.exit(1)
