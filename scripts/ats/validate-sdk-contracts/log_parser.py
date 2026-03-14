#!/usr/bin/env python3
"""
Log parser and formatter for ATS analysis scripts.
Handles all log generation, file creation, and formatting for validation results.
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, TextIO

class LogParser:
    """Handles all log generation, file creation, and formatting for ATS analysis."""
    
    def __init__(self, log_file: Path, json_file: Path):
        self.log_file = log_file
        self.json_file = json_file
        self.log_fh = None
    
    def __enter__(self):
        self.log_fh = open(self.log_file, 'w', encoding='utf-8')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.log_fh:
            self.log_fh.close()
    
    def log(self, msg: str) -> None:
        """Write message to both stderr and log file."""
        print(msg, file=__import__('sys').stderr)
        print(msg, file=self.log_fh)
        self.log_fh.flush()
    
    def create_validation_log(self, workspace: Path, exclude: List[str], 
                           contracts_result: Dict[str, Any], sdk_result: Dict[str, Any],
                           validation_result: Dict[str, Any]) -> None:
        """Create complete validation log with all results."""
        self._write_header(workspace, exclude)
        self._write_analysis_results(contracts_result, sdk_result)
        self._write_validation_results(validation_result, exclude)
    
    def create_error_log(self, workspace: Path, exclude: List[str], error: Any) -> None:
        """Create error log with structured error information."""
        self._write_header(workspace, exclude)
        self._format_error(error, self.log_fh)
    
    def create_unexpected_error_log(self, workspace: Path, error: Exception) -> None:
        """Create unexpected error log."""
        self._write_header(workspace, exclude=[])
        self.log(f"UNEXPECTED ERROR: {str(error)}")
    
    def save_json_and_log_success(self, result: Dict[str, Any]) -> None:
        """Save JSON result and log success information."""
        # Save JSON file
        self.json_file.write_text(json.dumps(result, indent=2), encoding='utf-8')
        
        # Log success
        print(f"\nSaved: {self.log_file}", file=__import__('sys').stderr)
        print(f"Saved: {self.json_file}", file=__import__('sys').stderr)
    
    def _write_header(self, workspace: Path, exclude: List[str]) -> None:
        """Write log header with execution info."""
        self.log(f"=== ATS SDK / Contracts validation ===")
        self.log(f"Date    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"Workspace: {workspace}")
        self.log(f"Exclude : {', '.join(exclude) if exclude else '(none)'}")
        self.log(f"Log     : {self.log_file}")
        self.log(f"JSON    : {self.json_file}")
        self.log("")
        self.log_fh.flush()
    
    def _write_analysis_results(self, contracts_result: Dict[str, Any], 
                              sdk_result: Dict[str, Any]) -> None:
        """Write analysis results section."""
        self.log("Running contract analysis...")
        self.log(f"  {len(contracts_result)} contract facets found")
        
        self.log("Running SDK analysis...")
        self.log(f"  {len(sdk_result)} SDK facets found")
        self.log("")
    
    def _write_validation_results(self, result: Dict[str, Any], exclude: List[str]) -> None:
        """Write detailed validation results to log."""
        # Facet discrepancies
        self.log("── facet discrepancies ───────────────────")
        sdk_unmatched = result.get('sdk_unmatched', [])
        contract_no_sdk = result.get('contract_no_sdk', [])
        
        if sdk_unmatched:
            self.log(f"  SDK facets with no contract match ({len(sdk_unmatched)}):")
            for name in sdk_unmatched:
                note = " (excluded)" if name.lower() in {e.lower() for e in exclude} else ""
                self.log(f"    {name}{note}")
        
        if contract_no_sdk:
            self.log(f"  Contract facets with no SDK coverage ({len(contract_no_sdk)}):")
            for name in contract_no_sdk:
                self.log(f"    {name}")
        
        if not sdk_unmatched and not contract_no_sdk:
            self.log("  (none)")
        
        self.log("")
        
        # Summary statistics
        total_missing = sum(len(v) for item in result['missing'] for v in item.values())
        total_diff = sum(len(v) for item in result['diff'] for v in item.values())
        total_success = sum(len(v) for item in result['success'] for v in item.values())
        total = total_missing + total_diff + total_success
        
        self.log(f"Results: {total} contract methods analysed")
        if total > 0:
            self.log(f"  success : {total_success} ({100*total_success//total}%)")
            self.log(f"  missing : {total_missing} ({100*total_missing//total}%)")
        else:
            self.log(f"  success : {total_success}")
            self.log(f"  missing : {total_missing}")
        self.log(f"  diff    : {total_diff}")
        self.log("")
        
        # Missing methods by facet
        self.log("── missing by facet ─────────────────────")
        for item in result['missing']:
            name = list(item.keys())[0]
            count = len(list(item.values())[0])
            self.log(f"  {name}: {count} method(s)")
        
        self.log("")
        
        # Parameter differences
        self.log("── diff (wrong param count) ─────────────")
        for item in result['diff']:
            name = list(item.keys())[0]
            for method, info in item[name].items():
                self.log(f"  {name}.{method}: contract={info['contract_params']} params, sdk={info['sdk_params']}")
    
    def _format_error(self, error: Any, log_fh: TextIO) -> None:
        """Format any analysis error for logging using duck typing."""
        
        # Header
        log_fh.write(f"ERROR: {error.message}\n")
        log_fh.write(f"Type: {error.error_type}\n")
        
        # Details based on error type
        error_type = error.error_type
        
        if error_type == "SCRIPT_NOT_FOUND":
            self._format_script_not_found(error, log_fh)
        elif error_type == "SCRIPT_EXECUTION_FAILED":
            self._format_script_execution(error, log_fh)
        elif error_type == "NO_CONTRACTS_FOUND":
            self._format_no_contracts_found(error, log_fh)
        elif error_type == "JSON_PARSING_FAILED":
            self._format_json_parsing(error, log_fh)
        elif error_type == "PERMISSION_DENIED":
            self._format_permission_error(error, log_fh)
        elif error_type == "WORKSPACE_VALIDATION_FAILED":
            self._format_workspace_error(error, log_fh)
        else:
            self._format_generic_error(error, log_fh)
        
        # Solutions
        log_fh.write("\nSolutions:\n")
        for i, solution in enumerate(error.solutions, 1):
            log_fh.write(f"  {i}. {solution}\n")
    
    def _format_script_not_found(self, error: Any, log_fh: TextIO) -> None:
        """Format script not found error."""
        log_fh.write(f"Tried locations:\n")
        for i, location in enumerate(error.tried_locations, 1):
            log_fh.write(f"  {i}. {location}\n")
        log_fh.write(f"Workspace: {error.workspace_path}\n")
    
    def _format_script_execution(self, error: Any, log_fh: TextIO) -> None:
        """Format script execution error."""
        log_fh.write(f"Command: {error.details['command']}\n")
        log_fh.write(f"Exit code: {error.return_code}\n")
        log_fh.write(f"Error output:\n{error.stderr}\n")
    
    def _format_no_contracts_found(self, error: Any, log_fh: TextIO) -> None:
        """Format no contracts found error."""
        log_fh.write(f"Workspace: {error.workspace}\n")
        log_fh.write(f"Contracts directory: {error.contracts_dir}\n")
        log_fh.write(f"Scan directories: {error.scan_dirs}\n")
        log_fh.write(f"Skip directories: {error.skip_dirs}\n")
        if error.excluded:
            log_fh.write(f"Excluded facets: {error.excluded}\n")
        
        log_fh.write("\nPossible issues:\n")
        log_fh.write("  1. Contracts directory is empty or missing contract files\n")
        log_fh.write("  2. All contracts are being skipped by skip patterns\n")
        log_fh.write("  3. All contracts are excluded by --exclude parameter\n")
        log_fh.write("  4. Contract files don't have the expected .sol extension\n")
        log_fh.write("  5. No public/external methods found in contracts\n")
        
        log_fh.write("\nTroubleshooting:\n")
        log_fh.write(f"  1. Check if contracts exist: ls -la {error.contracts_dir}\n")
        log_fh.write("  2. Verify scan directories exist:\n")
        for scan_dir in error.scan_dirs:
            dir_path = error.contracts_dir / scan_dir
            exists = "✓" if dir_path.exists() else "✗"
            log_fh.write(f"     {exists} {dir_path}\n")
        log_fh.write("  3. Try without exclusions: remove --exclude parameter\n")
        log_fh.write("  4. Use --list-dirs to see configuration\n")
    
    def _format_json_parsing(self, error: Any, log_fh: TextIO) -> None:
        """Format JSON parsing error."""
        log_fh.write(f"Output received:\n{error.details['output_preview']}\n")
        log_fh.write("\nCommon issues:\n")
        log_fh.write("  1. Script printed debug messages instead of JSON\n")
        log_fh.write("  2. Script has syntax errors causing incomplete output\n")
        log_fh.write("  3. Script output is not valid JSON format\n")
    
    def _format_permission_error(self, error: Any, log_fh: TextIO) -> None:
        """Format permission error."""
        log_fh.write(f"Operation: {error.operation}\n")
        log_fh.write(f"File path: {error.file_path}\n")
    
    def _format_workspace_error(self, error: Any, log_fh: TextIO) -> None:
        """Format workspace error."""
        log_fh.write(f"Workspace: {error.workspace_path}\n")
        log_fh.write(f"Missing paths: {', '.join(error.missing_paths)}\n")
    
    def _format_generic_error(self, error: Any, log_fh: TextIO) -> None:
        """Format generic error."""
        for key, value in error.details.items():
            log_fh.write(f"{key}: {value}\n")

def create_log_parser(log_file: Path, json_file: Path) -> LogParser:
    """Create a new LogParser instance."""
    return LogParser(log_file, json_file)
