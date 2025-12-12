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
 * Extract contract names from Solidity source code.
 *
 * Matches: contract ContractName, abstract contract ContractName, interface IName
 *
 * @param source - Solidity source code
 * @returns Array of contract names
 */
export function extractContractNames(source: string): string[] {
  // Remove single-line comments (// ...)
  let cleanSource = source.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments (/* ... */)
  cleanSource = cleanSource.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove natspec comments (/// ... and /** ... */)
  cleanSource = cleanSource.replace(/\/\/\/.*$/gm, "");
  cleanSource = cleanSource.replace(/\/\*\*[\s\S]*?\*\//g, "");

  const contractRegex = /(?:abstract\s+)?(?:contract|interface|library)\s+(\w+)/g;
  const matches: string[] = [];

  let match;
  while ((match = contractRegex.exec(cleanSource)) !== null) {
    matches.push(match[1]);
  }

  return matches;
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
  // Match: bytes32 [public] constant [_]ROLE_NAME = value;
  // Underscore prefix is optional (legacy ATS uses it incorrectly)
  const roleRegex = /bytes32\s+(?:public\s+)?constant\s+(_?\w+_ROLE)\s*=\s*([^;]+);/g;
  const roles: RoleDefinition[] = [];

  let match;
  while ((match = roleRegex.exec(source)) !== null) {
    const name = match[1];
    const value = match[2].trim();

    roles.push({ name, value });
  }

  return roles;
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
  // Match: bytes32 [public] constant [_]RESOLVER_KEY_NAME = value;
  // Underscore prefix is optional (legacy ATS uses it incorrectly)
  const keyRegex = /bytes32\s+(?:public\s+)?constant\s+(_?\w+_RESOLVER_KEY)\s*=\s*([^;]+);/g;
  const keys: ResolverKeyDefinition[] = [];

  let match;
  while ((match = keyRegex.exec(source)) !== null) {
    const name = match[1];
    const value = match[2].trim();

    keys.push({ name, value });
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
  // Find contract declaration with optional abstract/interface keywords
  const contractDecl = new RegExp(`(?:abstract\\s+)?(?:contract|interface|library)\\s+${contractName}\\b`, "g");

  const contractMatch = contractDecl.exec(source);
  if (!contractMatch) {
    return undefined;
  }

  // Extract everything before the contract declaration
  const beforeContract = source.substring(0, contractMatch.index);

  // Find the last natspec comment block (/** ... */) before the contract
  // This regex matches multiline comments that start with /**
  const natspecRegex = /\/\*\*([\s\S]*?)\*\//g;
  let lastNatspec: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = natspecRegex.exec(beforeContract)) !== null) {
    lastNatspec = match;
  }

  if (!lastNatspec) {
    return undefined;
  }

  const natspecContent = lastNatspec[1];

  // Try to extract @notice first (priority)
  const noticeMatch = /@notice\s+([^\n@]+)/i.exec(natspecContent);
  if (noticeMatch) {
    return noticeMatch[1]
      .trim()
      .replace(/\s*\*\s*/g, " ") // Remove asterisks from multi-line comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  // Fallback to @title if @notice not found
  const titleMatch = /@title\s+([^\n@]+)/i.exec(natspecContent);
  if (titleMatch) {
    return titleMatch[1]
      .trim()
      .replace(/\s*\*\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return undefined;
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
  // First try: Match import statement
  const importRegex = /import\s+\{([^}]*_RESOLVER_KEY[^}]*)\}\s+from\s+["'][^"']+["']/g;

  const match = importRegex.exec(source);
  if (match) {
    // Extract just the key name (might have whitespace or other imports)
    const importedNames = match[1].split(",").map((s) => s.trim());
    const keyName = importedNames.find((name) => name.endsWith("_RESOLVER_KEY"));
    if (keyName) return keyName;
  }

  // Second try: Check for inline constant definition (e.g., TimeTravelFacet)
  const inlineKeys = extractResolverKeys(source);
  if (inlineKeys.length > 0) {
    return inlineKeys[0].name;
  }

  return undefined;
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
  const importRegex = /import\s+["']([^"']+)["']/g;
  const imports: string[] = [];

  let match;
  while ((match = importRegex.exec(source)) !== null) {
    imports.push(match[1]);
  }

  return imports;
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
    return contractName.replace(/TimeTravel$/, "");
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
  const pragmaRegex = /pragma\s+solidity\s+([^;]+);/;
  const match = source.match(pragmaRegex);
  return match ? match[1].trim() : null;
}

/**
 * Check if source contains specific interface implementation.
 *
 * @param source - Solidity source code
 * @param interfaceName - Interface name to check
 * @returns true if contract implements interface
 */
export function implementsInterface(source: string, interfaceName: string): boolean {
  const implementsRegex = new RegExp(`contract\\s+\\w+\\s+is\\s+[^{]*\\b${interfaceName}\\b`);
  return implementsRegex.test(source);
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
  const regex = new RegExp(`contract\\s+${contractName}\\s+is\\s+([^{]+)`);
  const match = source.match(regex);

  if (!match) {
    return [];
  }

  // Split by comma and clean up whitespace
  return match[1]
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
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
  // Match: function name(...) external|public [view|pure|payable] [...]
  // Exclude: constructor, receive, fallback
  const functionRegex =
    /function\s+(\w+)\s*\([^)]*\)\s+(?:external|public)(?:\s+(?:view|pure|payable|virtual|override|returns))*[^{;]*/g;

  const methods: MethodDefinition[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = functionRegex.exec(source)) !== null) {
    const methodName = match[1];

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
  // Match: function name(...) [visibility] [modifiers] [...]
  // Exclude: constructor, receive, fallback
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;

  const methods: MethodDefinition[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = functionRegex.exec(source)) !== null) {
    const methodName = match[1];

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
  // Remove storage location keywords (calldata, memory, storage)
  let normalized = type.replace(/\s+(calldata|memory|storage)\s*/, "").trim();

  // Normalize uint to uint256
  if (normalized === "uint" || normalized.startsWith("uint[")) {
    normalized = normalized.replace(/^uint/, "uint256");
  }

  // Normalize int to int256
  if (normalized === "int" || normalized.startsWith("int[")) {
    normalized = normalized.replace(/^int/, "int256");
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
    // Extract type (first token before space or array bracket)
    // Handles: "uint256 _value", "bytes32[]  _data", "address"
    const match = param.match(/^([a-zA-Z0-9_]+(?:\[\])?)\s/);
    if (match) {
      const type = match[1];
      types.push(normalizeType(type));
    } else {
      // Fallback: just the type with no parameter name
      const typeOnly = param.split(/\s+/)[0];
      if (typeOnly) {
        types.push(normalizeType(typeOnly));
      }
    }
  }

  return types;
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
  // Match function declaration with parameters
  // Handles multiline, various modifiers, return types
  const functionRegex = new RegExp(
    `function\\s+${methodName}\\s*\\(([^)]*)\\)`,
    "s", // dotall flag - allows . to match newlines
  );

  const match = source.match(functionRegex);
  if (!match) {
    return undefined;
  }

  const paramsString = match[1];
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
  // Match event declaration with parameters
  // Handles indexed keyword and multiline declarations
  const eventRegex = new RegExp(`event\\s+${eventName}\\s*\\(([^)]*)\\)`, "s");

  const match = source.match(eventRegex);
  if (!match) {
    return undefined;
  }

  // Remove "indexed" keywords and parse parameters
  const paramsString = match[1].replace(/\s+indexed\s+/g, " ");
  const types = parseParameterTypes(paramsString);

  return `${eventName}(${types.join(",")})`;
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
  // Match: event EventName(...) [anonymous];
  const eventRegex = /event\s+(\w+)\s*\([^)]*\)/g;

  const events: EventDefinition[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = eventRegex.exec(source)) !== null) {
    const eventName = match[1];

    if (!seen.has(eventName)) {
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
  }

  return events.sort((a, b) => a.name.localeCompare(b.name));
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
  // Match error declaration with parameters
  const errorRegex = new RegExp(`error\\s+${errorName}\\s*\\(([^)]*)\\)`, "s");

  const match = source.match(errorRegex);
  if (!match) {
    return undefined;
  }

  const paramsString = match[1];
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
  // Match: error ErrorName(...);
  const errorRegex = /error\s+(\w+)\s*\([^)]*\)/g;

  const errors: ErrorDefinition[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = errorRegex.exec(source)) !== null) {
    const errorName = match[1];

    if (!seen.has(errorName)) {
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
