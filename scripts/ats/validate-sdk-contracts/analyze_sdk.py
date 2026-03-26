#!/usr/bin/env python3
"""
Extract contract calls from RPC adapter files, grouped by facet.

Handles two patterns:
  QueryAdapter:       this.connect(Factory__factory, addr).method(args)
  TransactionAdapter: this.executeTransaction(Factory__factory.connect(...), "method", [args], ...)
"""
import re
import json
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Any

# Import shared configuration
from config import AnalysisConfig, find_matching_bracket, get_inner_content, split_top_level_commas, normalize_string, strip_comments

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
class PermissionError(AnalysisError):
    """Raised when file permission issues occur."""
    file_path: Path
    operation: str  # 'read' or 'write'
    
    def __post_init__(self):
        self.error_type = "PERMISSION_DENIED"
        self.message = f"Permission denied {self.operation}ing: {self.file_path}"
        self.details = {
            "file_path": str(self.file_path),
            "operation": self.operation
        }
        self.solutions = [
            f"Check file permissions: ls -la {self.file_path}",
            "Ensure appropriate user privileges",
            "Verify directory write permissions"
        ]
        super().__post_init__()

def find_body_brace(content, start):
    """Find { that opens a method body, skipping TypeScript generics <...>.

    Return types like Promise<{ foo: string }> contain { that must NOT be
    mistaken for the method body opening. Tracking angle-bracket depth
    correctly skips those inner braces.
    """
    pos, angle = start, 0
    while pos < len(content):
        c = content[pos]
        if c == '<':
            angle += 1
        elif c == '>' and angle > 0:
            angle -= 1
        elif c == '{' and angle == 0:
            return pos
        pos += 1
    return -1

def iter_methods(content):
    """Yield (return_type, body) for each top-level async method or non-async
    method that returns Promise<T> (e.g. methods declared without `async` but
    still returning a promise).
    """
    content = strip_comments(content)

    # Collect candidate positions from two patterns:
    #   1. async methods:            async methodName(
    #   2. non-async class methods:  <newline><2 spaces>methodName(
    # Pattern 2 targets class-level methods (2-space indent) specifically to
    # avoid matching function calls or nested code (which would be indented more).
    candidates = {}  # start_pos -> p0

    for m in re.finditer(r'\basync\s+\w+\s*\(', content):
        p0 = content.find('(', m.start())
        candidates[m.start()] = p0

    for m in re.finditer(r'\n  (\w+)\s*\(', content):
        # position of the method name (skip \n + 2 spaces)
        name_start = m.start() + 3
        p0 = m.start() + m.group().index('(')
        candidates.setdefault(name_start, p0)

    for start, p0 in sorted(candidates.items()):
        # balance params  ()
        p1 = find_matching_bracket(content, p0)
        if p1 == -1:
            continue

        # find method body { — must skip generics like Promise<{ foo: string }>
        b0 = find_body_brace(content, p1 + 1)
        if b0 == -1:
            continue

        # return type is the text between ): and {
        between = content[p1 + 1:b0]
        rt = re.match(r'\s*:\s*(.+?)\s*$', between.rstrip(), re.DOTALL)
        return_type = normalize_string(rt.group(1)) if rt else 'unknown'

        # For non-async candidates: only keep if return type is Promise<...>
        chunk = content[max(0, start - 6):p0]
        is_async = bool(re.search(r'\basync\b', chunk))
        if not is_async and 'Promise<' not in return_type:
            continue

        # balance body  {}
        b1 = find_matching_bracket(content, b0)
        if b1 == -1:
            continue

        yield return_type, content[b0 + 1:b1]

def extract_query_calls(body):
    """Extract calls from pattern: this.connect(Factory__factory, addr).method(args)"""
    calls = []
    pat = re.compile(r'\bthis\.connect\(\s*(\w+__factory)\s*,')
    for m in pat.finditer(body):
        factory = m.group(1)

        # balance the connect(...)
        c0 = body.find('(', m.start() + len('this.connect') - 1)
        c1 = find_matching_bracket(body, c0)
        if c1 == -1:
            continue

        # .method(
        rest = body[c1 + 1:]
        mm = re.match(r'\s*\.(\w+)\s*\(', rest)
        if not mm:
            continue

        method = mm.group(1)
        a0 = c1 + 1 + rest.index('(', mm.start())
        params = [p for p in (s.strip() for s in split_top_level_commas(get_inner_content(body, a0))) if p]
        # Strip trailing Ethers.js call overrides object (e.g. { from: signer }) — not a contract param.
        # Identified by containing only known Ethers.js override keys (from, gasLimit, value, nonce, etc.)
        # and no nested braces (struct args can have nested structure or non-Ethers keys).
        _ETHERS_OVERRIDE_KEYS = re.compile(
            r'^\{\s*(?:(?:from|gasLimit|gasPrice|value|nonce|maxFeePerGas|maxPriorityFeePerGas|type|accessList|blockTag)\s*:\s*[^,{}]+,?\s*)+\}$'
        )
        if params and _ETHERS_OVERRIDE_KEYS.match(params[-1]):
            params = params[:-1]
        calls.append((factory[:-len('__factory')], method, params))
    return calls

def extract_transaction_calls(body):
    """Extract calls from pattern: this.executeTransaction(Factory__factory.connect(...), "method", [args], ...)"""
    calls = []
    pat = re.compile(r'\bthis\.executeTransaction\(\s*(\w+__factory)\.connect\(')
    for m in pat.finditer(body):
        factory = m.group(1)

        # balance connect(...)
        c0 = body.find('(', m.end() - 1)
        c1 = find_matching_bracket(body, c0)
        if c1 == -1:
            continue

        # , "methodName" ,  [args]
        after = body[c1 + 1:]
        mm = re.match(r'\s*,\s*"(\w+)"\s*,\s*\[', after)
        if not mm:
            continue

        method = mm.group(1)
        bracket_pos = c1 + 1 + after.index('[', mm.start())
        params = [p for p in (s.strip() for s in split_top_level_commas(get_inner_content(body, bracket_pos))) if p]
        calls.append((factory[:-len('__factory')], method, params))
    return calls

def parse_file(filepath, extractor):
    """Parse a single file using the provided extractor function."""
    result = {}
    try:
        content = filepath.read_text()
    except FileNotFoundError:
        print(f"Warning: File not found: {filepath}", file=sys.stderr)
        return result
    except PermissionError:
        raise PermissionError(file_path=filepath, operation="read")
    except Exception as e:
        print(f"Error reading {filepath}: {e}", file=sys.stderr)
        return result
        
    for return_type, body in iter_methods(content):
        for facet, method, params in extractor(body):
            result.setdefault(facet, []).append({
                'method': method,
                'params': params,
                'response': return_type,
            })
    return result

def main():
    parser = argparse.ArgumentParser(description="Extract contract calls from RPC adapters.")
    parser.add_argument('-w', '--workspace', type=Path, 
                        help='Workspace root directory')
    parser.add_argument('--list-files', action='store_true',
                        help='List configured files and exit')
    parser.add_argument('--query-only', action='store_true',
                        help='Process only query adapter file')
    parser.add_argument('--txn-only', action='store_true',
                        help='Process only transaction adapter file')
    args = parser.parse_args()

    config = AnalysisConfig(args.workspace)
    
    if args.list_files:
        print(f"Workspace: {config.workspace}")
        print(f"Query file: {config.query_file}")
        print(f"Transaction file: {config.txn_file}")
        return

    # Validate paths
    missing = config.validate_paths()
    if missing:
        print(f"Warning: Missing paths: {', '.join(missing)}", file=sys.stderr)

    data = {}
    
    if not args.txn_only:
        if config.query_file.exists():
            query_data = parse_file(config.query_file, extract_query_calls)
            for facet, calls in query_data.items():
                data.setdefault(facet, []).extend(calls)
        else:
            print(f"Warning: Query file not found: {config.query_file}", file=sys.stderr)
    
    if not args.query_only:
        if config.txn_file.exists():
            txn_data = parse_file(config.txn_file, extract_transaction_calls)
            for facet, calls in txn_data.items():
                data.setdefault(facet, []).extend(calls)
        else:
            print(f"Warning: Transaction file not found: {config.txn_file}", file=sys.stderr)

    output = [
        {facet: {'calls': calls}}
        for facet, calls in sorted(data.items())
    ]
    return output

if __name__ == '__main__':
    try:
        result = main()
        print(json.dumps(result, indent=2))
    except AnalysisError as e:
        print(f"ERROR: {e.message}", file=sys.stderr)
        sys.exit(1)
