// SPDX-License-Identifier: Apache-2.0

/**
 * Solidity parsing utilities for registry generation.
 *
 * @module tools/utils/solidityUtils
 */

import { utils } from "ethers";
import { MethodDefinition, EventDefinition, ErrorDefinition } from "../../infrastructure/types";

/**
 * Infrastructure base classes to exclude from event/error inheritance traversal.
 *
 * These classes aggregate functionality from multiple features and should not
 * contribute their events/errors to individual facets during inheritance extraction.
 */
const BASE_CLASSES_TO_EXCLUDE = new Set([
  "Common",
  "StorageWrapper",
  "TransferAndLockStorageWrapper",
  "ERC20StorageWrapper",
  "CorporateActionStorageWrapper",
  "BondStorageWrapper",
  "EquityStorageWrapper",
  "ComplianceStorageWrapper",
  "ScheduledTaskStorageWrapper",
]);

/**
 * Represents a multi-line comment with its content and position.
 */
interface MultiLineComment {
  /** The content between the comment delimiters (without the delimiters) */
  content: string;
  /** Start position in the source */
  start: number;
  /** End position in the source (after closing delimiter) */
  end: number;
  /** Whether this is a doc comment (starts with /**) */
  isDocComment: boolean;
}

/**
 * Extract all multi-line comments from source code using iterative parsing.
 *
 * This avoids ReDoS vulnerability that can occur with regex patterns like /\/\*[\s\S]*?\*\//g
 * on pathological inputs (e.g., strings with many '/*' sequences).
 *
 * @param source - Source code potentially containing multi-line comments
 * @returns Array of comments with their content and positions
 */
function extractMultiLineComments(source: string): MultiLineComment[] {
  const comments: MultiLineComment[] = [];
  let i = 0;
  while (i < source.length) {
    // Check for start of multi-line comment
    if (source[i] === "/" && i + 1 < source.length && source[i + 1] === "*") {
      const start = i;
      const isDocComment = i + 2 < source.length && source[i + 2] === "*";
      // Skip the opening /* or /**
      i += 2;
      const contentStart = i;
      // Find the closing */
      while (i < source.length) {
        if (source[i] === "*" && i + 1 < source.length && source[i + 1] === "/") {
          const content = source.substring(contentStart, i);
          comments.push({ content, start, end: i + 2, isDocComment });
          i += 2;
          break;
        }
        i++;
      }
    } else {
      i++;
    }
  }
  return comments;
}

/**
 * Remove multi-line comments from source code using iterative parsing.
 *
 * This avoids ReDoS vulnerability that can occur with regex patterns like /\/\*[\s\S]*?\*\//g
 * on pathological inputs (e.g., strings with many '/*' sequences).
 *
 * @param source - Source code potentially containing multi-line comments
 * @returns Source code with multi-line comments removed
 */
function removeMultiLineComments(source: string): string {
  const comments = extractMultiLineComments(source);
  if (comments.length === 0) {
    return source;
  }

  // Build result by copying non-comment parts
  let result = "";
  let lastEnd = 0;
  for (const comment of comments) {
    result += source.substring(lastEnd, comment.start);
    lastEnd = comment.end;
  }
  result += source.substring(lastEnd);
  return result;
}

/**
 * Normalize whitespace in a string by collapsing multiple spaces/tabs to single space.
 * This is a safe operation that doesn't use regex with quantifiers on uncontrolled input.
 */
function normalizeWhitespace(str: string): string {
  let result = "";
  let lastWasSpace = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === " " || char === "\t") {
      if (!lastWasSpace) {
        result += " ";
        lastWasSpace = true;
      }
    } else {
      result += char;
      lastWasSpace = false;
    }
  }
  return result;
}

/**
 * Extract contract names from Solidity source code.
 *
 * Matches: contract ContractName, abstract contract ContractName, interface IName
 *
 * @param source - Solidity source code
 * @returns Array of contract names
 */
export function extractContractNames(source: string): string[] {
  // Remove single-line comments (// ... and /// ...) using line-by-line processing
  // to avoid ReDoS vulnerability with regex on uncontrolled input
  const lines = source.split("\n");
  const cleanLines = lines.map((line) => {
    const commentIndex = line.indexOf("//");
    if (commentIndex !== -1) {
      // Check if // is inside a string literal (simple heuristic)
      const beforeComment = line.substring(0, commentIndex);
      let singleQuotes = 0;
      let doubleQuotes = 0;
      for (const char of beforeComment) {
        if (char === "'") singleQuotes++;
        if (char === '"') doubleQuotes++;
      }
      // If odd number of quotes, we're inside a string - don't remove
      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
        return line.substring(0, commentIndex);
      }
    }
    return line;
  });
  let cleanSource = cleanLines.join("\n");

  // Remove multi-line comments (/* ... */ and /** ... */) using iterative parsing
  // to avoid ReDoS vulnerability with regex on uncontrolled input
  cleanSource = removeMultiLineComments(cleanSource);

  const matches: string[] = [];

  // Process line by line using string operations to avoid ReDoS
  for (const line of cleanSource.split("\n")) {
    const normalized = normalizeWhitespace(line.trim());
    const name = parseContractDeclaration(normalized);
    if (name) {
      matches.push(name);
    }
  }

  return matches;
}

/**
 * Parse a contract/interface/library declaration from a normalized line.
 */
function parseContractDeclaration(line: string): string | null {
  let rest = line;

  // Skip "abstract " if present
  if (rest.startsWith("abstract ")) {
    rest = rest.slice(9);
  }

  // Check for contract, interface, or library
  let keyword: string | null = null;
  for (const kw of ["contract ", "interface ", "library "]) {
    if (rest.startsWith(kw)) {
      keyword = kw;
      rest = rest.slice(kw.length);
      break;
    }
  }

  if (!keyword) {
    return null;
  }

  // Extract the name (word characters until space, { or end)
  let name = "";
  for (const char of rest) {
    if (/\w/.test(char)) {
      name += char;
    } else {
      break;
    }
  }

  return name || null;
}

/**
 * Role definition with name and value.
 */
export interface RoleDefinition {
  /** Role name (e.g., _ISSUER_ROLE) */
  name: string;

  /** bytes32 value (e.g., 0x4be32e8...) */
  value: string;
}

/**
 * Extract role definitions from Solidity code.
 *
 * Matches patterns like:
 * - bytes32 public constant ROLE_NAME = 0x...;
 * - bytes32 constant _ROLE_NAME = keccak256("...");
 *
 * Supports both with and without underscore prefix (underscore is incorrectly
 * used in ATS for public constants - will be removed in future).
 *
 * @param source - Solidity source code
 * @returns Array of role definitions with names and values
 *
 * @example
 * ```typescript
 * const roles = extractRoles(source)
 * // [{name: 'ISSUER_ROLE', value: '0x4be32e8...'}]
 * // [{name: '_ISSUER_ROLE', value: '0x4be32e8...'}] (legacy ATS)
 * ```
 */
export function extractRoles(source: string): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("_ROLE") || !line.includes("bytes32") || !line.includes("constant")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const role = parseConstantDefinition(line, "_ROLE");
    if (role) {
      roles.push(role);
    }
  }

  return roles;
}

/**
 * Parse a constant definition (role or resolver key) using string operations.
 * Matches: bytes32 [public] constant NAME = value;
 */
function parseConstantDefinition(line: string, suffix: string): { name: string; value: string } | null {
  const normalized = normalizeWhitespace(line.trim());

  // Must contain "bytes32 "
  const bytes32Idx = normalized.indexOf("bytes32 ");
  if (bytes32Idx === -1) {
    return null;
  }

  let rest = normalized.slice(bytes32Idx + 8);

  // Skip optional "public "
  if (rest.startsWith("public ")) {
    rest = rest.slice(7);
  }

  // Must have "constant "
  if (!rest.startsWith("constant ")) {
    return null;
  }
  rest = rest.slice(9);

  // Find "="
  const eqIdx = rest.indexOf("=");
  if (eqIdx === -1) {
    return null;
  }

  const name = rest.slice(0, eqIdx).trim();

  // Must end with the expected suffix
  if (!name.endsWith(suffix)) {
    return null;
  }

  // Find ";"
  const afterEq = rest.slice(eqIdx + 1);
  const semiIdx = afterEq.indexOf(";");
  if (semiIdx === -1) {
    return null;
  }

  const value = afterEq.slice(0, semiIdx).trim();

  return { name, value };
}

/**
 * Resolver key definition with name and value.
 */
export interface ResolverKeyDefinition {
  /** Resolver key name (e.g., _ACCESS_CONTROL_RESOLVER_KEY) */
  name: string;

  /** bytes32 value (e.g., 0x011768a41...) */
  value: string;
}

/**
 * Extract resolver key definitions from Solidity code.
 *
 * Matches patterns like:
 * - bytes32 constant FACET_NAME_RESOLVER_KEY = 0x...;
 * - bytes32 constant _FACET_NAME_RESOLVER_KEY = 0x...; (legacy)
 *
 * Supports both with and without underscore prefix (underscore is incorrectly
 * used in ATS for public constants - will be removed in future).
 *
 * @param source - Solidity source code
 * @returns Array of resolver key definitions with names and values
 *
 * @example
 * ```typescript
 * const keys = extractResolverKeys(source)
 * // [{name: 'ACCESS_CONTROL_RESOLVER_KEY', value: '0x011768a41...'}]
 * // [{name: '_ACCESS_CONTROL_RESOLVER_KEY', value: '0x011768a41...'}] (legacy ATS)
 * ```
 */
export function extractResolverKeys(source: string): ResolverKeyDefinition[] {
  const keys: ResolverKeyDefinition[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("_RESOLVER_KEY") || !line.includes("bytes32") || !line.includes("constant")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const key = parseConstantDefinition(line, "_RESOLVER_KEY");
    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Extract description from contract natspec comments.
 *
 * Extracts the description from contract-level natspec documentation.
 * Priority order: @notice > @title
 *
 * @param source - Solidity source code
 * @param contractName - Contract name to locate the correct natspec block
 * @returns Description string or undefined if no natspec found
 *
 * @example
 * ```typescript
 * const source = `
 * /**
 *  * @title FactorySuiteFacet
 *  * @notice Atomic deployment of Bond, Treasury, and KPI contract suites
 *  *\/
 * contract FactorySuiteFacet { }
 * `
 * const desc = extractNatspecDescription(source, 'FactorySuiteFacet')
 * // Returns: "Atomic deployment of Bond, Treasury, and KPI contract suites"
 * ```
 */
export function extractNatspecDescription(source: string, contractName: string): string | undefined {
  // Search line by line to find the contract declaration
  const lines = source.split("\n");
  let charIndex = 0;
  let foundIndex = -1;

  for (const line of lines) {
    const normalized = normalizeWhitespace(line.trim());
    // Check if this line contains the contract declaration
    if (lineContainsContractDeclaration(normalized, contractName)) {
      foundIndex = charIndex;
      break;
    }
    charIndex += line.length + 1; // +1 for newline
  }

  if (foundIndex === -1) {
    return undefined;
  }

  // Extract everything before the contract declaration
  const beforeContract = source.substring(0, foundIndex);

  // Find all natspec comment blocks (/** ... */) before the contract using safe iterative parsing
  const comments = extractMultiLineComments(beforeContract);
  const docComments = comments.filter((c) => c.isDocComment);

  if (docComments.length === 0) {
    return undefined;
  }

  // Get the last doc comment (closest to the contract declaration)
  const lastNatspec = docComments[docComments.length - 1];
  const natspecContent = lastNatspec.content;

  // Try to extract @notice first (priority) using string operations
  const noticeValue = extractNatspecTag(natspecContent, "@notice");
  if (noticeValue) {
    return cleanNatspecValue(noticeValue);
  }

  // Fallback to @title if @notice not found
  const titleValue = extractNatspecTag(natspecContent, "@title");
  if (titleValue) {
    return cleanNatspecValue(titleValue);
  }

  return undefined;
}

/**
 * Check if a normalized line contains a contract declaration for the given name.
 */
function lineContainsContractDeclaration(line: string, contractName: string): boolean {
  let rest = line;

  // Skip "abstract " if present
  if (rest.startsWith("abstract ")) {
    rest = rest.slice(9);
  }

  // Check for contract, interface, or library followed by the name
  for (const kw of ["contract ", "interface ", "library "]) {
    if (rest.startsWith(kw)) {
      rest = rest.slice(kw.length);
      // Check if it starts with the contract name followed by space, {, or end
      if (rest.startsWith(contractName)) {
        const afterName = rest.slice(contractName.length);
        if (afterName.length === 0 || afterName[0] === " " || afterName[0] === "{" || afterName[0] === "(") {
          return true;
        }
      }
      break;
    }
  }

  return false;
}

/**
 * Extract a natspec tag value using string operations.
 */
function extractNatspecTag(content: string, tag: string): string | null {
  const tagIdx = content.indexOf(tag);
  if (tagIdx === -1) {
    return null;
  }

  // Find the start of the value (after tag and whitespace)
  let start = tagIdx + tag.length;
  while (start < content.length && (content[start] === " " || content[start] === "\t")) {
    start++;
  }

  // Find the end (newline or next @tag)
  let end = start;
  while (end < content.length) {
    if (content[end] === "\n") {
      // Check if next non-whitespace is @ (new tag)
      let nextNonWs = end + 1;
      while (
        nextNonWs < content.length &&
        (content[nextNonWs] === " " || content[nextNonWs] === "\t" || content[nextNonWs] === "*")
      ) {
        nextNonWs++;
      }
      if (nextNonWs < content.length && content[nextNonWs] === "@") {
        break;
      }
    }
    if (content[end] === "@" && end > start) {
      break;
    }
    end++;
  }

  return content.slice(start, end);
}

/**
 * Clean a natspec value by removing asterisks and normalizing whitespace.
 */
function cleanNatspecValue(value: string): string {
  let result = "";
  let lastWasSpace = false;

  for (const char of value) {
    if (char === "*") {
      continue; // Skip asterisks
    }
    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      if (!lastWasSpace && result.length > 0) {
        result += " ";
        lastWasSpace = true;
      }
    } else {
      result += char;
      lastWasSpace = false;
    }
  }

  return result.trim();
}

/**
 * Extract resolver key import from facet source.
 *
 * Extracts the specific resolver key name imported by a facet.
 * Also checks for inline definitions if no import found.
 * Useful for matching facets to their resolver keys.
 *
 * @param source - Solidity source code
 * @returns Resolver key name or undefined
 *
 * @example
 * ```typescript
 * const keyName = extractFacetResolverKeyImport(facetSource)
 * // Returns: '_ACCESS_CONTROL_RESOLVER_KEY'
 * ```
 */
export function extractFacetResolverKeyImport(source: string): string | undefined {
  // First try: Look for resolver key in import statements
  // Handle both single-line and multi-line imports
  const keyName = parseResolverKeyFromImports(source);
  if (keyName) {
    return keyName;
  }

  // Second try: Check for inline constant definition (e.g., TimeTravelFacet)
  const inlineKeys = extractResolverKeys(source);
  if (inlineKeys.length > 0) {
    return inlineKeys[0].name;
  }

  return undefined;
}

/**
 * Parse resolver key from import statements, handling multi-line imports.
 */
function parseResolverKeyFromImports(source: string): string | null {
  // Find all import { ... } blocks and look for resolver keys
  let i = 0;
  while (i < source.length) {
    // Find "import"
    const importIdx = source.indexOf("import", i);
    if (importIdx === -1) {
      break;
    }

    // Find opening brace
    const braceStart = source.indexOf("{", importIdx);
    if (braceStart === -1) {
      i = importIdx + 6;
      continue;
    }

    // Make sure the brace is part of this import (not too far away)
    const nextSemi = source.indexOf(";", importIdx);
    if (nextSemi !== -1 && braceStart > nextSemi) {
      i = importIdx + 6;
      continue;
    }

    // Find closing brace
    const braceEnd = source.indexOf("}", braceStart);
    if (braceEnd === -1) {
      i = importIdx + 6;
      continue;
    }

    // Extract content between braces
    const content = source.slice(braceStart + 1, braceEnd);

    // Check if this import contains a resolver key
    if (content.includes("_RESOLVER_KEY")) {
      // Split by comma and find the resolver key
      const parts = content.split(",");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.endsWith("_RESOLVER_KEY")) {
          return trimmed;
        }
      }
    }

    i = braceEnd + 1;
  }

  return null;
}

/**
 * Extract imported contract paths.
 *
 * Matches: import "path/to/Contract.sol"
 *
 * @param source - Solidity source code
 * @returns Array of import paths
 */
export function extractImports(source: string): string[] {
  const imports: string[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("import")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const path = parseSimpleImport(line);
    if (path) {
      imports.push(path);
    }
  }

  return imports;
}

/**
 * Parse a simple import statement using string operations.
 */
function parseSimpleImport(line: string): string | null {
  // Find quote after "import"
  const importIdx = line.indexOf("import");
  if (importIdx === -1) {
    return null;
  }

  const rest = line.slice(importIdx + 6);

  // Find opening quote
  let quoteChar: string | null = null;
  let quoteStart = -1;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '"' || rest[i] === "'") {
      quoteChar = rest[i];
      quoteStart = i;
      break;
    }
  }

  if (!quoteChar || quoteStart === -1) {
    return null;
  }

  // Find closing quote
  const quoteEnd = rest.indexOf(quoteChar, quoteStart + 1);
  if (quoteEnd === -1) {
    return null;
  }

  return rest.slice(quoteStart + 1, quoteEnd);
}

/**
 * Check if contract is a facet based on naming convention.
 *
 * @param contractName - Contract name to check
 * @returns true if name ends with 'Facet'
 */
export function isFacetName(contractName: string): boolean {
  return contractName.endsWith("Facet");
}

/**
 * Check if contract is a TimeTravel variant.
 *
 * @param contractName - Contract name to check
 * @returns true if name ends with 'TimeTravel'
 */
export function isTimeTravelVariant(contractName: string): boolean {
  return contractName.endsWith("TimeTravel");
}

/**
 * Get base contract name from TimeTravel variant.
 *
 * @param contractName - Contract name (potentially TimeTravel)
 * @returns Base contract name without 'TimeTravel' suffix
 */
export function getBaseName(contractName: string): string {
  if (isTimeTravelVariant(contractName)) {
    return contractName.slice(0, -10); // Remove "TimeTravel"
  }
  return contractName;
}

/**
 * Extract pragma Solidity version.
 *
 * @param source - Solidity source code
 * @returns Solidity version or null
 */
export function extractSolidityVersion(source: string): string | null {
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("pragma") || !line.includes("solidity")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const version = parsePragmaVersion(line);
    if (version) {
      return version;
    }
  }

  return null;
}

/**
 * Parse pragma solidity version using string operations.
 */
function parsePragmaVersion(line: string): string | null {
  const pragmaIdx = line.indexOf("pragma");
  if (pragmaIdx === -1) {
    return null;
  }

  const solidityIdx = line.indexOf("solidity", pragmaIdx);
  if (solidityIdx === -1) {
    return null;
  }

  const semiIdx = line.indexOf(";", solidityIdx);
  if (semiIdx === -1) {
    return null;
  }

  // Extract version between "solidity" and ";"
  const version = line.slice(solidityIdx + 8, semiIdx).trim();
  return version || null;
}

/**
 * Check if source contains specific interface implementation.
 *
 * @param source - Solidity source code
 * @param interfaceName - Interface name to check
 * @returns true if contract implements interface
 */
export function implementsInterface(source: string, interfaceName: string): boolean {
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("contract") || !line.includes("is")) {
      continue;
    }

    const normalized = normalizeWhitespace(line.trim());

    // Check if line has "contract X is ... InterfaceName"
    if (lineImplementsInterface(normalized, interfaceName)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a line implements a specific interface.
 */
function lineImplementsInterface(line: string, interfaceName: string): boolean {
  const contractIdx = line.indexOf("contract ");
  if (contractIdx === -1) {
    return false;
  }

  const isIdx = line.indexOf(" is ", contractIdx);
  if (isIdx === -1) {
    return false;
  }

  // Get the inheritance part
  const inheritance = line.slice(isIdx + 4);

  // Check if interfaceName appears as a word boundary
  const idx = inheritance.indexOf(interfaceName);
  if (idx === -1) {
    return false;
  }

  // Check word boundaries
  const before = idx > 0 ? inheritance[idx - 1] : " ";
  const after = idx + interfaceName.length < inheritance.length ? inheritance[idx + interfaceName.length] : " ";

  const isWordBoundary = (c: string) => !/\w/.test(c);

  return isWordBoundary(before) && isWordBoundary(after);
}

/**
 * Extract contract inheritance chain.
 *
 * Matches: contract MyContract is BaseA, BaseB, BaseC
 *
 * @param source - Solidity source code
 * @param contractName - Contract name to find inheritance for
 * @returns Array of parent contract names
 */
export function extractInheritance(source: string, contractName: string): string[] {
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("contract") || !line.includes(contractName) || !line.includes("is")) {
      continue;
    }

    const normalized = normalizeWhitespace(line.trim());
    const parents = parseInheritance(normalized, contractName);
    if (parents.length > 0) {
      return parents;
    }
  }

  return [];
}

/**
 * Parse inheritance from a line using string operations.
 */
function parseInheritance(line: string, contractName: string): string[] {
  // Find "contract ContractName is"
  const pattern = `contract ${contractName} is `;
  const idx = line.indexOf(pattern);
  if (idx === -1) {
    return [];
  }

  // Get everything after "is "
  let rest = line.slice(idx + pattern.length);

  // Remove everything after "{"
  const braceIdx = rest.indexOf("{");
  if (braceIdx !== -1) {
    rest = rest.slice(0, braceIdx);
  }

  // Split by comma and clean up
  return rest
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^\w+$/.test(s));
}

/**
 * Extract public and external method names from Solidity code.
 *
 * Matches function declarations with public or external visibility.
 * Excludes constructors, receive, and fallback functions.
 *
 * @param source - Solidity source code
 * @returns Array of method names
 *
 * @example
 * ```typescript
 * const methods = extractPublicMethods(source)
 * // Returns: ['transfer', 'approve', 'balanceOf', 'allowance']
 * ```
 */
export function extractPublicMethods(source: string): MethodDefinition[] {
  const methods: MethodDefinition[] = [];
  const seen = new Set<string>();
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("function")) {
      continue;
    }
    if (!line.includes("external") && !line.includes("public")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const methodName = parseFunctionName(line);

    if (!methodName) {
      continue;
    }

    // Exclude special functions
    if (methodName === "constructor" || methodName === "receive" || methodName === "fallback") {
      continue;
    }

    // Avoid duplicates (overloaded functions)
    if (!seen.has(methodName)) {
      // Extract full signature
      const signature = extractFunctionSignature(source, methodName);
      if (signature) {
        const selector = calculateSelector(signature);
        methods.push({ name: methodName, signature, selector });
      } else {
        // Fallback: signature extraction failed, use name-only
        methods.push({
          name: methodName,
          signature: `${methodName}()`,
          selector: calculateSelector(`${methodName}()`),
        });
      }
      seen.add(methodName);
    }
  }

  return methods.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse a function name from a line using string operations.
 */
function parseFunctionName(line: string): string | null {
  const funcIdx = line.indexOf("function");
  if (funcIdx === -1) {
    return null;
  }

  // Skip "function " and whitespace
  let start = funcIdx + 8;
  while (start < line.length && (line[start] === " " || line[start] === "\t")) {
    start++;
  }

  // Read the function name (word characters)
  let name = "";
  for (let i = start; i < line.length; i++) {
    if (/\w/.test(line[i])) {
      name += line[i];
    } else {
      break;
    }
  }

  return name || null;
}

/**
 * Extract all methods from Solidity code (including internal/private).
 *
 * Used for StorageWrapper contracts that contain internal helper methods.
 * Matches all function declarations regardless of visibility.
 * Excludes constructors.
 *
 * @param source - Solidity source code
 * @returns Array of MethodDefinition objects
 *
 * @example
 * ```typescript
 * const methods = extractAllMethods(source)
 * // Returns: [
 * //   { name: '_approve', signature: '_approve(address,address,uint256)', selector: '0x...' },
 * //   { name: '_burn', signature: '_burn(address,uint256)', selector: '0x...' },
 * //   { name: '_mint', signature: '_mint(address,uint256)', selector: '0x...' },
 * //   { name: 'balanceOf', signature: 'balanceOf(address)', selector: '0x70a08231' }
 * // ]
 * ```
 */
export function extractAllMethods(source: string): MethodDefinition[] {
  const methods: MethodDefinition[] = [];
  const seen = new Set<string>();
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("function")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const methodName = parseFunctionName(line);

    if (!methodName) {
      continue;
    }

    // Exclude special functions
    if (methodName === "constructor" || methodName === "receive" || methodName === "fallback") {
      continue;
    }

    // Avoid duplicates (overloaded functions)
    if (!seen.has(methodName)) {
      const signature = extractFunctionSignature(source, methodName);
      if (signature) {
        const selector = calculateSelector(signature);
        methods.push({ name: methodName, signature, selector });
      } else {
        // Fallback if signature extraction fails
        methods.push({
          name: methodName,
          signature: `${methodName}()`,
          selector: calculateSelector(`${methodName}()`),
        });
      }
      seen.add(methodName);
    }
  }

  return methods.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract public/external methods from a contract and its entire inheritance chain.
 *
 * This function recursively traverses the inheritance tree to collect ALL business logic
 * methods exposed by the contract. It excludes infrastructure methods like:
 * - getStaticFunctionSelectors
 * - getStaticInterfaceIds
 * - getStaticResolverKey
 *
 * @param contractSource - Source code of the contract
 * @param contractName - Name of the contract to extract methods from
 * @param allContracts - Map of contract name to ContractFile for resolving inheritance
 * @returns Array of unique MethodDefinition objects from contract and all parents
 *
 * @example
 * ```typescript
 * import { ContractFile } from '../scanner/contractFinder'
 *
 * const allContracts = new Map<string, ContractFile>()
 * // ... populate map ...
 *
 * const methods = extractPublicMethodsWithInheritance(
 *     facetSource,
 *     'AccessControlFacet',
 *     allContracts
 * )
 * // Returns: [
 * //   { name: 'applyRoles', signature: 'applyRoles(bytes32,address[])', selector: '0x...' },
 * //   { name: 'grantRole', signature: 'grantRole(bytes32,address)', selector: '0x2f2ff15d' },
 * //   ...
 * // ]
 * // (excludes getStaticFunctionSelectors, getStaticInterfaceIds, getStaticResolverKey)
 * ```
 */
export function extractPublicMethodsWithInheritance(
  contractSource: string,
  contractName: string,
  allContracts: Map<string, { source: string }>,
): MethodDefinition[] {
  // Static methods to exclude (infrastructure, not business logic)
  const STATIC_METHODS_TO_EXCLUDE = new Set([
    "getStaticFunctionSelectors",
    "getStaticInterfaceIds",
    "getStaticResolverKey",
  ]);

  const allMethods = new Map<string, MethodDefinition>();
  const visited = new Set<string>();

  function extractFromContract(source: string, name: string): void {
    // Avoid circular references
    if (visited.has(name)) {
      return;
    }
    visited.add(name);

    // Extract methods from current contract
    const methods = extractPublicMethods(source);
    for (const method of methods) {
      if (!STATIC_METHODS_TO_EXCLUDE.has(method.name)) {
        allMethods.set(method.name, method);
      }
    }

    // Extract inheritance chain
    const parents = extractInheritance(source, name);

    // Recursively extract from parent contracts
    for (const parentName of parents) {
      const parentContract = allContracts.get(parentName);
      if (parentContract) {
        extractFromContract(parentContract.source, parentName);
      }
    }
  }

  // Start extraction from the main contract
  extractFromContract(contractSource, contractName);

  // Return sorted array for deterministic output
  return Array.from(allMethods.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Normalize Solidity type to canonical form for ABI signatures.
 *
 * Converts shorthand types to their full form as required by Solidity ABI spec.
 *
 * @param type - Solidity type (e.g., "uint", "int", "bytes32[] calldata")
 * @returns Normalized type (e.g., "uint256", "int256", "bytes32[]")
 *
 * @example
 * ```typescript
 * normalizeType("uint") // "uint256"
 * normalizeType("int") // "int256"
 * normalizeType("uint[]") // "uint256[]"
 * normalizeType("address calldata") // "address"
 * normalizeType("bytes32[] memory") // "bytes32[]"
 * ```
 */
export function normalizeType(type: string): string {
  // Remove storage location keywords using string operations to avoid ReDoS
  let normalized = type;
  for (const keyword of [" calldata", " memory", " storage"]) {
    const idx = normalized.indexOf(keyword);
    if (idx !== -1) {
      normalized = normalized.slice(0, idx) + normalized.slice(idx + keyword.length);
    }
  }
  normalized = normalized.trim();

  // Normalize uint to uint256
  if (normalized === "uint" || normalized.startsWith("uint[")) {
    normalized = "uint256" + normalized.slice(4);
  }

  // Normalize int to int256
  if (normalized === "int" || normalized.startsWith("int[")) {
    normalized = "int256" + normalized.slice(3);
  }

  return normalized;
}

/**
 * Parse parameter types from function declaration.
 *
 * Extracts types from parameter list, handling arrays, multiple params, etc.
 *
 * @param params - Parameter list string (e.g., "bytes32 _role, address _account")
 * @returns Array of normalized types (e.g., ["bytes32", "address"])
 *
 * @example
 * ```typescript
 * parseParameterTypes("bytes32 _role, address _account")
 * // Returns: ["bytes32", "address"]
 *
 * parseParameterTypes("bytes32[] calldata _data, uint256 _value")
 * // Returns: ["bytes32[]", "uint256"]
 * ```
 */
export function parseParameterTypes(params: string): string[] {
  if (!params || params.trim() === "") {
    return [];
  }

  // Split by comma, but be careful with nested structures
  const paramList = params.split(",").map((p) => p.trim());
  const types: string[] = [];

  for (const param of paramList) {
    // Extract type using string operations
    const type = extractTypeFromParam(param);
    if (type) {
      types.push(normalizeType(type));
    }
  }

  return types;
}

/**
 * Extract type from a parameter string using string operations.
 */
function extractTypeFromParam(param: string): string | null {
  if (!param) {
    return null;
  }

  // Find the first space (type ends at first space or at array brackets)
  let typeEnd = param.length;
  let hasArrayBrackets = false;

  for (let i = 0; i < param.length; i++) {
    if (param[i] === "[") {
      hasArrayBrackets = true;
    } else if (param[i] === "]") {
      // Include the closing bracket
    } else if (param[i] === " " && !hasArrayBrackets) {
      typeEnd = i;
      break;
    } else if (param[i] === " " && hasArrayBrackets) {
      // Check if we've finished the array brackets
      const beforeSpace = param.slice(0, i);
      if (beforeSpace.includes("]")) {
        typeEnd = i;
        break;
      }
    }
  }

  const type = param.slice(0, typeEnd).trim();
  return type || null;
}

/**
 * Calculate 4-byte function selector from signature.
 *
 * Uses keccak256 hash (via ethers) to compute the function selector.
 *
 * @param signature - Canonical function signature (e.g., "grantRole(bytes32,address)")
 * @returns 4-byte hex selector (e.g., "0x2f2ff15d")
 *
 * @example
 * ```typescript
 * calculateSelector("grantRole(bytes32,address)")
 * // Returns: "0x2f2ff15d"
 * ```
 */
export function calculateSelector(signature: string): string {
  const hash = utils.keccak256(utils.toUtf8Bytes(signature));
  return hash.substring(0, 10); // '0x' + 8 hex chars = 4 bytes
}

/**
 * Extract full function signature with parameter types from source code.
 *
 * Finds the function declaration and builds the canonical signature.
 *
 * @param source - Solidity source code
 * @param methodName - Name of the method to find
 * @returns Canonical signature or undefined if not found/parseable
 *
 * @example
 * ```typescript
 * const source = `
 *   function grantRole(bytes32 _role, address _account)
 *       external
 *       returns (bool success_)
 *   { ... }
 * `
 * extractFunctionSignature(source, "grantRole")
 * // Returns: "grantRole(bytes32,address)"
 * ```
 */
export function extractFunctionSignature(source: string, methodName: string): string | undefined {
  // Find "function methodName(" using string operations
  const searchStr = `function ${methodName}`;
  const funcIdx = source.indexOf(searchStr);
  if (funcIdx === -1) {
    return undefined;
  }

  // Find the opening parenthesis
  const parenStart = source.indexOf("(", funcIdx);
  if (parenStart === -1) {
    return undefined;
  }

  // Find the matching closing parenthesis
  let depth = 1;
  let parenEnd = parenStart + 1;
  while (parenEnd < source.length && depth > 0) {
    if (source[parenEnd] === "(") depth++;
    if (source[parenEnd] === ")") depth--;
    parenEnd++;
  }

  if (depth !== 0) {
    return undefined;
  }

  const paramsString = source.slice(parenStart + 1, parenEnd - 1);
  const types = parseParameterTypes(paramsString);

  // Build canonical signature: functionName(type1,type2,...)
  return `${methodName}(${types.join(",")})`;
}

// ============================================================================
// Event Extraction
// ============================================================================

/**
 * Calculate topic0 hash for events.
 *
 * Uses full 32-byte keccak256 hash (NOT truncated like function selectors).
 *
 * @param signature - Canonical event signature (e.g., "Transfer(address,address,uint256)")
 * @returns Full 32-byte hex hash (e.g., "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")
 *
 * @example
 * ```typescript
 * calculateTopic0("Transfer(address,address,uint256)")
 * // Returns: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
 * ```
 */
export function calculateTopic0(signature: string): string {
  return utils.keccak256(utils.toUtf8Bytes(signature));
}

/**
 * Extract event signature from source code.
 *
 * Finds the event declaration and builds the canonical signature.
 *
 * @param source - Solidity source code
 * @param eventName - Name of the event to find
 * @returns Canonical signature or undefined if not found
 *
 * @example
 * ```typescript
 * const source = `
 *   event Transfer(address indexed from, address indexed to, uint256 value);
 * `
 * extractEventSignature(source, "Transfer")
 * // Returns: "Transfer(address,address,uint256)"
 * ```
 */
export function extractEventSignature(source: string, eventName: string): string | undefined {
  // Find "event eventName(" using string operations
  const searchStr = `event ${eventName}`;
  const eventIdx = source.indexOf(searchStr);
  if (eventIdx === -1) {
    return undefined;
  }

  // Find the opening parenthesis
  const parenStart = source.indexOf("(", eventIdx);
  if (parenStart === -1) {
    return undefined;
  }

  // Find the matching closing parenthesis
  let depth = 1;
  let parenEnd = parenStart + 1;
  while (parenEnd < source.length && depth > 0) {
    if (source[parenEnd] === "(") depth++;
    if (source[parenEnd] === ")") depth--;
    parenEnd++;
  }

  if (depth !== 0) {
    return undefined;
  }

  // Remove "indexed" keywords using string operations
  let paramsString = source.slice(parenStart + 1, parenEnd - 1);
  paramsString = removeIndexedKeyword(paramsString);

  const types = parseParameterTypes(paramsString);

  return `${eventName}(${types.join(",")})`;
}

/**
 * Remove "indexed" keyword from parameters using string operations.
 */
function removeIndexedKeyword(params: string): string {
  let result = "";
  let i = 0;
  while (i < params.length) {
    // Check for " indexed " or " indexed," or " indexed)"
    if (i + 8 <= params.length && params.slice(i, i + 8) === " indexed") {
      const nextChar = params[i + 8];
      if (nextChar === " " || nextChar === "," || nextChar === ")" || nextChar === undefined) {
        // Skip " indexed"
        i += 8;
        continue;
      }
    }
    result += params[i];
    i++;
  }
  return result;
}

/**
 * Extract all events from Solidity source code.
 *
 * Matches event declarations and extracts signatures with topic0 hashes.
 *
 * @param source - Solidity source code
 * @returns Array of event definitions sorted by name
 *
 * @example
 * ```typescript
 * const events = extractEvents(source)
 * // Returns: [
 * //   { name: 'RoleGranted', signature: 'RoleGranted(bytes32,address,address)', topic0: '0x2f87...' },
 * //   { name: 'Transfer', signature: 'Transfer(address,address,uint256)', topic0: '0xddf2...' }
 * // ]
 * ```
 */
export function extractEvents(source: string): EventDefinition[] {
  const events: EventDefinition[] = [];
  const seen = new Set<string>();
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("event")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const eventName = parseEventOrErrorName(line, "event");
    if (!eventName || seen.has(eventName)) {
      continue;
    }

    const signature = extractEventSignature(source, eventName);
    if (signature) {
      const topic0 = calculateTopic0(signature);
      events.push({ name: eventName, signature, topic0 });
    } else {
      // Fallback if signature extraction fails
      events.push({
        name: eventName,
        signature: `${eventName}()`,
        topic0: calculateTopic0(`${eventName}()`),
      });
    }
    seen.add(eventName);
  }

  return events.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse an event or error name from a line using string operations.
 */
function parseEventOrErrorName(line: string, keyword: string): string | null {
  const keywordIdx = line.indexOf(keyword);
  if (keywordIdx === -1) {
    return null;
  }

  // Skip keyword and whitespace
  let start = keywordIdx + keyword.length;
  while (start < line.length && (line[start] === " " || line[start] === "\t")) {
    start++;
  }

  // Read the name (word characters)
  let name = "";
  for (let i = start; i < line.length; i++) {
    if (/\w/.test(line[i])) {
      name += line[i];
    } else {
      break;
    }
  }

  return name || null;
}

/**
 * Extract events from a contract and its entire inheritance chain.
 *
 * Recursively traverses the inheritance tree to collect all events.
 *
 * @param contractSource - Source code of the contract
 * @param contractName - Name of the contract
 * @param allContracts - Map of contract name to ContractFile for resolving inheritance
 * @returns Array of unique EventDefinition objects from contract and all parents
 */
export function extractEventsWithInheritance(
  contractSource: string,
  contractName: string,
  allContracts: Map<string, { source: string }>,
): EventDefinition[] {
  const allEvents = new Map<string, EventDefinition>();
  const visited = new Set<string>();

  function extractFromContract(source: string, name: string): void {
    if (visited.has(name)) {
      return;
    }
    visited.add(name);

    // Skip infrastructure base classes that aggregate all events
    if (BASE_CLASSES_TO_EXCLUDE.has(name)) {
      return;
    }

    // Extract events from current contract
    const events = extractEvents(source);
    for (const event of events) {
      allEvents.set(event.name, event);
    }

    // Extract inheritance chain
    const parents = extractInheritance(source, name);

    // Recursively extract from parent contracts
    for (const parentName of parents) {
      const parentContract = allContracts.get(parentName);
      if (parentContract) {
        extractFromContract(parentContract.source, parentName);
      }
    }
  }

  extractFromContract(contractSource, contractName);

  return Array.from(allEvents.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Error Extraction
// ============================================================================

/**
 * Extract error signature from source code.
 *
 * Finds the error declaration and builds the canonical signature.
 *
 * @param source - Solidity source code
 * @param errorName - Name of the error to find
 * @returns Canonical signature or undefined if not found
 *
 * @example
 * ```typescript
 * const source = `
 *   error InsufficientBalance(uint256 available, uint256 required);
 * `
 * extractErrorSignature(source, "InsufficientBalance")
 * // Returns: "InsufficientBalance(uint256,uint256)"
 * ```
 */
export function extractErrorSignature(source: string, errorName: string): string | undefined {
  // Find "error errorName(" using string operations
  const searchStr = `error ${errorName}`;
  const errorIdx = source.indexOf(searchStr);
  if (errorIdx === -1) {
    return undefined;
  }

  // Find the opening parenthesis
  const parenStart = source.indexOf("(", errorIdx);
  if (parenStart === -1) {
    return undefined;
  }

  // Find the matching closing parenthesis
  let depth = 1;
  let parenEnd = parenStart + 1;
  while (parenEnd < source.length && depth > 0) {
    if (source[parenEnd] === "(") depth++;
    if (source[parenEnd] === ")") depth--;
    parenEnd++;
  }

  if (depth !== 0) {
    return undefined;
  }

  const paramsString = source.slice(parenStart + 1, parenEnd - 1);
  const types = parseParameterTypes(paramsString);

  return `${errorName}(${types.join(",")})`;
}

/**
 * Extract all custom errors from Solidity source code.
 *
 * Matches error declarations (Solidity 0.8.4+) and extracts signatures with selectors.
 *
 * @param source - Solidity source code
 * @returns Array of error definitions sorted by name
 *
 * @example
 * ```typescript
 * const errors = extractErrors(source)
 * // Returns: [
 * //   { name: 'InsufficientBalance', signature: 'InsufficientBalance(uint256,uint256)', selector: '0xcf47...' },
 * //   { name: 'Unauthorized', signature: 'Unauthorized()', selector: '0x82b4...' }
 * // ]
 * ```
 */
export function extractErrors(source: string): ErrorDefinition[] {
  const errors: ErrorDefinition[] = [];
  const seen = new Set<string>();
  const lines = source.split("\n");

  for (const line of lines) {
    // Quick check to avoid processing irrelevant lines
    if (!line.includes("error")) {
      continue;
    }

    // Parse using string operations to avoid ReDoS
    const errorName = parseEventOrErrorName(line, "error");
    if (!errorName || seen.has(errorName)) {
      continue;
    }

    const signature = extractErrorSignature(source, errorName);
    if (signature) {
      const selector = calculateSelector(signature);
      errors.push({ name: errorName, signature, selector });
    } else {
      // Fallback if signature extraction fails
      errors.push({
        name: errorName,
        signature: `${errorName}()`,
        selector: calculateSelector(`${errorName}()`),
      });
    }
    seen.add(errorName);
  }

  return errors.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract errors from a contract and its entire inheritance chain.
 *
 * Recursively traverses the inheritance tree to collect all custom errors.
 *
 * @param contractSource - Source code of the contract
 * @param contractName - Name of the contract
 * @param allContracts - Map of contract name to ContractFile for resolving inheritance
 * @returns Array of unique ErrorDefinition objects from contract and all parents
 */
export function extractErrorsWithInheritance(
  contractSource: string,
  contractName: string,
  allContracts: Map<string, { source: string }>,
): ErrorDefinition[] {
  const allErrors = new Map<string, ErrorDefinition>();
  const visited = new Set<string>();

  function extractFromContract(source: string, name: string): void {
    if (visited.has(name)) {
      return;
    }
    visited.add(name);

    // Skip infrastructure base classes that aggregate all errors
    if (BASE_CLASSES_TO_EXCLUDE.has(name)) {
      return;
    }

    // Extract errors from current contract
    const errors = extractErrors(source);
    for (const error of errors) {
      allErrors.set(error.name, error);
    }

    // Extract inheritance chain
    const parents = extractInheritance(source, name);

    // Recursively extract from parent contracts
    for (const parentName of parents) {
      const parentContract = allContracts.get(parentName);
      if (parentContract) {
        extractFromContract(parentContract.source, parentName);
      }
    }
  }

  extractFromContract(contractSource, contractName);

  return Array.from(allErrors.values()).sort((a, b) => a.name.localeCompare(b.name));
}
