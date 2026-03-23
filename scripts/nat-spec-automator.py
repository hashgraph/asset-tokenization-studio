#!/usr/bin/env python3
"""
NatSpec Documentation Automator

This script automates the process of scanning Solidity files for NatSpec issues
and applying comprehensive documentation using the provided NatSpec prompt.

Usage:
    python nat-spec-automator.py

Requirements:
    - Node.js and npm (optional, if using --log-file)
    - Ollama with a capable model (e.g., qwen3.5:9b)
    - Ollama API accessible at http://localhost:11434
"""

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

# Default Ollama URL - can be overridden with OLLAMA_URL environment variable
DEFAULT_OLLAMA_URL = "http://localhost:11434"


class NatSpecAutomator:
    """Automates NatSpec documentation for Solidity files."""

    def __init__(
        self,
        project_root: str,
        model_name: str = "qwen3.5:9b",
        debug: bool = False,
        log_file: str = None,
    ):
        """
        Initialize the NatSpec automator.

        Args:
            project_root: Root directory of the project (where package.json is)
            model_name: Ollama model to use for documentation generation
            debug: Enable debug output
            log_file: Path to log file (if using pre-generated lint output)
        """
        self.project_root = Path(project_root).resolve()
        self.model_name = model_name
        self.npm_script = "lint:sol"
        self.debug = debug
        self.log_file = log_file
        # Use OLLAMA_URL from environment or default
        self.ollama_url = os.environ.get("OLLAMA_URL", DEFAULT_OLLAMA_URL)
        self.natspec_prompt_template = self._load_natspec_prompt()

    def _load_natspec_prompt(self) -> str:
        """Load the NatSpec prompt instructions."""
        return """1. Goal Statement

Produce comprehensive, high-quality NatSpec documentation for a given Solidity file.
The output must clearly describe the purpose, behaviour, constraints, and structure of each contract element, ensuring consistency, accuracy, and professional technical communication suitable for production-grade smart contract development.

Your objective is to elevate the clarity, maintainability, and audit-readiness of the codebase through precise and concise documentation.

2. Required Return Format

You must return the final documentation in the exact locations where NatSpec comments should be inserted, organised by Solidity element type and following this order:

Contract / Interface / Library documentation block

Enums

Structs

Events

Custom errors

State variables

Modifiers

Functions (public/external first, then internal/private)

For each element, use the corresponding NatSpec template:

2.1 Contracts, Interfaces, Libraries

/**
 * @title [Descriptive contract title]
 * @notice [High-level summary of contract purpose]
 * @dev [Technical details on design, patterns, or assumptions]
 * @author [Author or team]
 */

2.2 Enums

/**
 * @notice [Purpose of this enum]
 * @param VALUE1 [Explanation of what this value represents]
 * @param VALUE2 [Explanation of what this value represents]
 */

2.3 Structs

/**
 * @notice [Purpose of this struct]
 * @param field1 [Concise, informative description]
 * @param field2 [Concise, informative description]
 */

2.4 Events

/**
 * @notice [When and why this event is emitted]
 * @param parameter1 [Explanation of parameter role]
 * @param parameter2 [Explanation of parameter role]
 */

2.5 Custom Errors

/**
 * @notice [When this error is triggered]
 * @dev [Additional behavioural notes or constraints]
 * @param parameter [Description if applicable]
 */

2.6 State Variables

/**
 * @notice [Purpose of this variable]
 * @dev [Additional context on restrictions or usage]
 */

2.7 Modifiers

/**
 * @notice [Meaning and purpose of the restriction]
 * @dev [Conditions required for correct use]
 * @param parameter [If any]
 */

2.8 Functions

/**
 * @notice [Function purpose stated in present tense]
 * @dev [Technical notes, restrictions, validations]
 * @param param1 [Description of the parameter]
 * @param param2 [Description of the parameter]
 * @return returnName [Description of return value]
 */

3. Warnings, Constraints, and Critical Requirements

3.1 Language & Style Requirements

Use British English spelling

"decentralised", "behaviour", "initialised", "optimise", "authorised", etc.

Maximum 100 characters per line.

Use precise technical terminology relevant to smart contract engineering.

Focus on documentation that emphasises intent and functionality, rather than implementation details.

Use the present tense for function descriptions.

Avoid redundancy; do not restate obvious code behaviour.

3.2 Semantic Requirements

Your documentation must include where relevant:

Access control restrictions

State mutations

Important invariants

Gas considerations

Dependency order or temporal assumptions

Events emitted

Errors potentially thrown

Side effects

Cross-contract interactions

Preconditions/postconditions

3.3 Pitfalls to Avoid

Do not explain the Solidity language itself.

Do not describe self-explanatory code.

Do not introduce assumptions not supported by the code.

Avoid over-verbosity; documentation must be concise but complete.

Do not deviate from the NatSpec format.

4. Contextual Background

The documentation is intended for a codebase maintained by a developer with extensive experience in smart contract engineering.

The model should treat the documentation as part of a long-term, professional, audit-ready project.

The final output must be suitable for:

auditors

future maintainers

automated analysis tools

internal team documentation

The NatSpec generated will be integrated directly into the Solidity file, so clarity and precision are essential.

The goal is to efficiently and consistently self-document smart contracts.

5. Final Instruction to the Model

Apply all the above rules when generating documentation for the provided Solidity file.
Insert each documentation block immediately above the corresponding element, using the correct NatSpec structure and British English conventions."""

    def run_lint(self) -> str:
        """
        Run npm run lint:sol to scan for NatSpec issues.

        If log_file is set, reads from that file instead of running npm.

        Returns:
            Log output from the lint command
        """
        if self.log_file:
            # Read from log file instead of running npm
            if self.debug:
                print(f"DEBUG: Reading from log file: {self.log_file}")

            try:
                with open(self.log_file, "r", encoding="utf-8") as f:
                    output = f.read()

                if self.debug:
                    print(f"DEBUG: Log file length: {len(output)} characters")

                return output
            except FileNotFoundError:
                print(f"ERROR: Log file not found: {self.log_file}")
                return ""
            except Exception as e:
                print(f"ERROR: Failed to read log file: {e}")
                return ""

        # Run npm command
        if self.debug:
            print(f"DEBUG: Running npm run {self.npm_script} in {self.project_root}")

        try:
            result = subprocess.run(
                ["npm", "run", self.npm_script],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minutes timeout
            )
            output = result.stdout + result.stderr

            if self.debug:
                print(f"DEBUG: Lint output length: {len(output)} characters")
                print(f"DEBUG: First 500 chars of output:\n{output[:500]}")

            return output
        except subprocess.TimeoutExpired:
            print("ERROR: Lint command timed out after 5 minutes")
            return ""
        except FileNotFoundError:
            print(
                "ERROR: npm command not found. Please ensure Node.js and npm are installed."
            )
            return ""
        except Exception as e:
            print(f"ERROR: Failed to run lint: {e}")
            return ""

    def parse_solhint_output(self, output: str) -> List[Dict]:
        """
        Parse solhint output and extract files with use-natspec issues.

        Args:
            output: Raw output from npm run lint:sol

        Returns:
            List of dicts with file path, line number, and issue description
        """
        issues = []

        if self.debug:
            print(f"DEBUG: Parsing solhint output, length: {len(output)}")

        # Pattern to match file:line column use-natspec message
        # Example: contracts/constants/eip1066.sol
        #   9:1  warning  Missing @author tag in contract 'Eip1066' use-natspec
        pattern = r"(contracts/[^\s]+\.sol)\s+(\d+):(\d+)\s+(.+?)\s+use-natspec"

        if self.debug:
            print(f"DEBUG: Using pattern: {pattern}")

        for match in re.finditer(pattern, output, re.MULTILINE):
            file_path = match.group(1)
            line_num = int(match.group(2))
            message = match.group(4)

            if self.debug and len(issues) < 5:
                print(
                    f"DEBUG: Found match - file: {file_path}, line: {line_num}, message: {message[:50]}"
                )

            # Extract name from message
            name_match = re.search(r"'([^']+)'", message)
            name = name_match.group(1) if name_match else ""

            # Skip reserved constants (RESERVED_XX)
            if name.startswith("RESERVED"):
                continue

            # Parse issue type
            issue_type = "constant" if "variable" in message else "contract"

            issues.append(
                {
                    "file": file_path,
                    "line": line_num,
                    "message": message,
                    "type": issue_type,
                    "name": name,
                }
            )

        if self.debug:
            print(f"DEBUG: Total issues found: {len(issues)}")
            if issues:
                print(f"DEBUG: First 5 issues: {issues[:5]}")

        return issues

    def format_prompt(self, file_path: str, issues: List[Dict]) -> str:
        """
        Format the prompt for a specific file.

        Args:
            file_path: Path to the file (relative to project root)
            issues: List of issues to document

        Returns:
            Formatted prompt string
        """
        # Read the file content - file_path already includes 'contracts/' prefix
        full_path = self.project_root / file_path

        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Build issue descriptions
        issue_descriptions = []
        for issue in issues:
            if issue["type"] == "constant":
                issue_descriptions.append(
                    f"Line {issue['line']}: Missing @notice tag in constant '{issue['name']}'"
                )
            else:
                issue_descriptions.append(
                    f"Line {issue['line']}: Missing @title, @author, and/or @notice tags in contract"
                )

        # Create the prompt
        prompt = f"""Solidity file to document:

```solidity
{content}
```

Here are the NatSpec issues found:
- {"; ".join(issue_descriptions)}

Please generate comprehensive NatSpec documentation for this file following the guidelines.
Output ONLY the complete file with all the documentation properly inserted.
Do not output any explanations or markdown formatting - just the raw Solidity code."""

        return prompt

    def call_ollama(self, prompt: str) -> Dict:
        """
        Call Ollama API to generate documentation.

        Args:
            prompt: The prompt to send to the model

        Returns:
            Response from Ollama API
        """
        url = f"{self.ollama_url}/api/generate"

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "top_p": 0.9},
        }

        if self.debug:
            print(f"DEBUG: Calling Ollama at {url} with model {self.model_name}")

        try:
            response = subprocess.run(
                [
                    "curl",
                    "-s",
                    "-X",
                    "POST",
                    url,
                    "-H",
                    "Content-Type: application/json",
                    "-d",
                    json.dumps(payload),
                ],
                capture_output=True,
                text=True,
                timeout=120,
            )

            if response.returncode != 0:
                return {"error": response.stderr}

            if self.debug:
                print(f"DEBUG: Ollama response length: {len(response.stdout)}")

            # Extract the generated code (remove markdown code blocks if present)
            output = response.stdout.strip()
            if "```solidity" in output:
                output = re.sub(
                    r"```solidity\s*\n?|```", "", output, flags=re.MULTILINE
                )
            elif "```json" in output:
                output = re.sub(r"```json\s*\n?|```", "", output, flags=re.MULTILINE)

            return {"response": output}

        except subprocess.TimeoutExpired:
            return {"error": "Request timed out"}
        except Exception as e:
            return {"error": str(e)}

    def process_file(self, file_path: str, dry_run: bool = False) -> Tuple[bool, str]:
        """
        Process a single file by reading it, generating documentation, and applying it.

        Args:
            file_path: Path to the Solidity file to process (relative to project root)
            dry_run: If True, don't modify files

        Returns:
            Tuple of (success: bool, message: str)
        """
        # Run lint to get all issues
        all_issues = self.parse_solhint_output(self.run_lint())

        # Filter issues for this specific file
        file_issues = [i for i in all_issues if i["file"] == file_path]

        if not file_issues:
            return True, f"No NatSpec issues found in {file_path}"

        print(f"  Found {len(file_issues)} issues")

        if dry_run:
            for issue in file_issues:
                print(f"    - Line {issue['line']}: {issue['message'][:60]}")
            return True, f"Dry-run: {len(file_issues)} issues found"

        # Create prompt for this file
        prompt = self.format_prompt(file_path, file_issues)

        # Call Ollama
        response = self.call_ollama(prompt)

        if "error" in response:
            return False, response["error"]

        if not response.get("response"):
            return False, "No documentation generated"

        # Apply the documentation - file_path already includes 'contracts/' prefix
        full_path = self.project_root / file_path

        # Clean the response
        new_content = response["response"].strip()

        # Write the file
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        return True, f"Fixed {len(file_issues)} issues"

    def process_all_files(self, dry_run: bool = False) -> Dict[str, int]:
        """
        Process all files with NatSpec issues.

        Args:
            dry_run: If True, don't modify files

        Returns:
            Dictionary mapping file paths to success counts
        """
        # Parse all issues
        all_issues = self.parse_solhint_output(self.run_lint())

        if not all_issues:
            print("\nNo NatSpec issues found!")
            return {}

        # Group issues by file
        file_issues: Dict[str, List[Dict]] = {}
        for issue in all_issues:
            file_path = issue["file"]
            if file_path not in file_issues:
                file_issues[file_path] = []
            file_issues[file_path].append(issue)

        if self.debug:
            print(f"\nDEBUG: Processing {len(file_issues)} files")

        # Process each file
        results = {}
        for file_path, file_issues_list in file_issues.items():
            print(f"\nProcessing {file_path}...")

            # Process the file
            success, result = self.process_file(file_path, dry_run=dry_run)

            if success:
                results[file_path] = len(file_issues_list)
                print(f"  ✓ {result}")
            else:
                print(f"  ✗ Error: {result}")
                results[file_path] = 0

        return results

    def generate_report(self, results: Dict[str, int]) -> str:
        """
        Generate a summary report of the processing results.

        Args:
            results: Dictionary of file paths to number of issues fixed

        Returns:
            Human-readable report string
        """
        if not results:
            return "No files were processed."

        total_files = len(results)
        successful_files = sum(1 for success in results.values() if success > 0)
        total_issues_fixed = sum(results.values())

        report = [
            "=" * 60,
            "NatSpec Documentation Processing Report",
            "=" * 60,
            "",
            f"Total files processed: {total_files}",
            f"Files with documentation added: {successful_files}",
            f"Total issues fixed: {total_issues_fixed}",
            "",
            "Details:",
            "-" * 40,
        ]

        for file_path, issues_fixed in results.items():
            status = "✓" if issues_fixed > 0 else "✗"
            report.append(f"{status} {file_path}")
            report.append(f"    Issues fixed: {issues_fixed}")

        report.extend(["", "=" * 60, "Processing complete!"])

        return "\n".join(report)


def check_ollama_connection(ollama_url: str) -> bool:
    """
    Check if Ollama is running and accessible.

    Args:
        ollama_url: URL of the Ollama API

    Returns:
        True if connection successful, False otherwise
    """
    try:
        result = subprocess.run(
            ["curl", "-s", "-I", f"{ollama_url}/api/tags"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False


def main():
    """Main entry point for the script."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Automate NatSpec documentation for Solidity files"
    )
    parser.add_argument(
        "--project-root",
        type=str,
        default=".",
        help="Root directory of the Solidity project (where package.json is)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="qwen3.5:9b",
        help="Ollama model to use for documentation generation",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in dry-run mode (no files will be modified)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug output",
    )
    parser.add_argument(
        "--log-file",
        type=str,
        default=None,
        help="Path to log file (use existing lint output instead of running npm)",
    )

    args = parser.parse_args()

    # Get Ollama URL from environment or use default
    ollama_url = os.environ.get("OLLAMA_URL", DEFAULT_OLLAMA_URL)

    # Check Ollama connection
    if not check_ollama_connection(ollama_url):
        print("✗ Failed to connect to Ollama. Please ensure Ollama is running.")
        print(f"  Expected at: {ollama_url}")
        return

    print("=" * 60)
    print("NatSpec Documentation Automator")
    print("=" * 60)
    print(f"\nModel: {args.model}")
    print(f"Project: {args.project_root}")
    print(f"Ollama URL: {ollama_url}")
    print(f"Dry-run: {args.dry_run}")
    print(f"Debug: {args.debug}")
    if args.log_file:
        print(f"Log file: {args.log_file}")

    automator = NatSpecAutomator(
        project_root=args.project_root,
        model_name=args.model,
        debug=args.debug,
        log_file=args.log_file,
    )

    # Process all files
    results = automator.process_all_files(dry_run=args.dry_run)

    # Generate and print report
    report = automator.generate_report(results)
    print("\n" + report)

    if results and all(issues_fixed > 0 for issues_fixed in results.values()):
        print("\n✓ All files with NatSpec issues have been processed!")
    elif results:
        print("\n✗ Some files could not be processed. Please review the errors above.")
    else:
        print("\n✗ No files were processed. Check if lint:sol is finding issues.")


if __name__ == "__main__":
    main()
