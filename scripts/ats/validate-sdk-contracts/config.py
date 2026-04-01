#!/usr/bin/env python3
"""
Shared configuration and utilities for ATS analysis scripts.
"""
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any

# ── Default Configuration ───────────────────────────────────────────────────────

DEFAULT_WORKSPACE = Path("/home/ruben/workspaces/hashgraph/asset-tokenization-studio")

# Contract analysis paths
DEFAULT_CONTRACTS_DIR = DEFAULT_WORKSPACE / "packages/ats/contracts/contracts/facets"
DEFAULT_SCAN_DIRS = ["layer_1", "layer_2", "layer_3"]
DEFAULT_SKIP_DIRS = {"interfaces", "constants", "mocks", "test", "proxies", "resolver", "libraries"}
DEFAULT_SKIP_SUFFIXES = ("Facet.sol", "FacetBase.sol")
DEFAULT_VISIBILITY_MODIFIERS = ["public", "external"]

# SDK analysis paths
DEFAULT_SDK_BASE = DEFAULT_WORKSPACE / "packages/ats/sdk/src/port/out/rpc"
DEFAULT_QUERY_FILE = DEFAULT_SDK_BASE / "RPCQueryAdapter.ts"
DEFAULT_TXN_FILE = DEFAULT_SDK_BASE / "RPCTransactionAdapter.ts"

# ── Utility Functions ───────────────────────────────────────────────────────────

def normalize_string(s: str) -> str:
    """Normalize whitespace in string."""
    return re.sub(r'\s+', ' ', s).strip()

def strip_comments(content: str) -> str:
    """Remove both line and block comments from content."""
    content = re.sub(r'//[^\n]*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def normalize_facet_name(name: str) -> str:
    """Canonical name for matching: strip Facet/Ats suffixes, lowercase."""
    name = re.sub(r'Facet$', '', name)
    name = re.sub(r'Ats$', '', name)
    return name.lower()

def count_parameters(interface_sig: str) -> int:
    """Count parameters in a Solidity function signature string."""
    m = re.search(r'\(', interface_sig)
    if not m:
        return 0
    pos, depth = m.start(), 0
    while pos < len(interface_sig):
        c = interface_sig[pos]
        if c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0:
                inner = interface_sig[m.start() + 1:pos].strip()
                if not inner:
                    return 0
                d, n = 0, 1
                for ch in inner:
                    if ch in '([':
                        d += 1
                    elif ch in ')]':
                        d -= 1
                    elif ch == ',' and d == 0:
                        n += 1
                return n
        pos += 1
    return 0

# ── Bracket Matching Utilities ───────────────────────────────────────────────────

def _skip_string(s: str, pos: int) -> int:
    """Skip past a string/template literal starting at s[pos] (the quote char).
    Returns the position immediately after the closing quote.
    Handles: "...", '...', `...${...}...` (including nested template expressions).
    """
    quote = s[pos]
    pos += 1
    if quote == '`':
        while pos < len(s):
            c = s[pos]
            if c == '\\':
                pos += 2
                continue
            if c == '`':
                return pos + 1
            if c == '$' and pos + 1 < len(s) and s[pos + 1] == '{':
                # Template expression: skip balanced braces, respecting nested strings
                pos += 2  # skip ${
                depth = 1
                while pos < len(s) and depth > 0:
                    if s[pos] in ('"', "'", '`'):
                        pos = _skip_string(s, pos)
                        continue
                    if s[pos] == '{':
                        depth += 1
                    elif s[pos] == '}':
                        depth -= 1
                    pos += 1
                continue
            pos += 1
    else:
        while pos < len(s):
            c = s[pos]
            if c == '\\':
                pos += 2
                continue
            if c == quote:
                return pos + 1
            pos += 1
    return pos


def find_matching_bracket(s: str, pos: int) -> int:
    """Find matching close bracket for open bracket at s[pos].
    Skips string literals (including template literals with ${}) so that
    braces inside strings are not counted.
    """
    close = {'(': ')', '[': ']', '{': '}'}[s[pos]]  # noqa: F841
    depth = 0
    i = pos
    while i < len(s):
        c = s[i]
        if c in ('"', "'", '`'):
            i = _skip_string(s, i)
            continue
        if c in '([{':
            depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1

def get_inner_content(s: str, pos: int) -> str:
    """Return content between matching brackets at s[pos]."""
    end = find_matching_bracket(s, pos)
    return s[pos + 1:end] if end != -1 else ""

def split_top_level_commas(s: str) -> List[str]:
    """Split s by comma at bracket depth 0."""
    args, depth, buf = [], 0, []
    for c in s:
        if c in '([{':
            depth += 1
        elif c in ')]}':
            depth -= 1
        if c == ',' and depth == 0:
            a = ''.join(buf).strip()
            if a:
                args.append(a)
            buf = []
        else:
            buf.append(c)
    last = ''.join(buf).strip()
    if last:
        args.append(last)
    return args

# ── Output Formatting ───────────────────────────────────────────────────────────

def format_facet_output(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Format output as list of facet dictionaries."""
    return [
        {facet: methods}
        for facet, methods in sorted(data.items())
    ]

def facet_list_to_dict(facet_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convert [{name: data}, ...] → {name: data}"""
    return {list(f.keys())[0]: list(f.values())[0] for f in facet_list}

# ── Configuration Classes ─────────────────────────────────────────────────────

class AnalysisConfig:
    """Configuration for analysis scripts."""
    
    def __init__(self, workspace: Path = None):
        self.workspace = workspace or DEFAULT_WORKSPACE
        
        # Contract analysis
        self.contracts_dir = self.workspace / "packages/ats/contracts/contracts/facets"
        self.scan_dirs = DEFAULT_SCAN_DIRS
        self.skip_dirs = DEFAULT_SKIP_DIRS
        self.skip_suffixes = DEFAULT_SKIP_SUFFIXES
        self.visibility_modifiers = DEFAULT_VISIBILITY_MODIFIERS
        
        # SDK analysis
        self.sdk_base = self.workspace / "packages/ats/sdk/src/port/out/rpc"
        self.query_file = self.sdk_base / "RPCQueryAdapter.ts"
        self.txn_file = self.sdk_base / "RPCTransactionAdapter.ts"
    
    def validate_paths(self) -> List[str]:
        """Validate that configured paths exist. Returns list of missing paths."""
        missing = []
        
        if not self.contracts_dir.exists():
            missing.append(str(self.contracts_dir))
        
        if not self.query_file.exists():
            missing.append(str(self.query_file))
            
        if not self.txn_file.exists():
            missing.append(str(self.txn_file))
            
        return missing
