// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for registry generator isDeployable logic.
 *
 * Tests the computation of isDeployable in extractMetadata and the
 * conditional factory emission in generateRegistry for mock contracts.
 *
 * @module test/scripts/unit/tools/registryGenerator.test
 */

import { expect } from "chai";

// Registry-generator types and functions are not re-exported from barrel
// with distinct names - import directly for unit testing
import type {
  ContractFile,
  ContractMetadata,
  HardhatArtifact,
} from "../../../../scripts/tools/registry-generator/types";
import { extractMetadata } from "../../../../scripts/tools/registry-generator/core/extractor";
import { generateRegistry } from "../../../../scripts/tools/registry-generator/core/generator";
import { silenceScriptLogging } from "@test";
import { resetLogger } from "@scripts/infrastructure";

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const DEPLOYABLE_BYTECODE = "0x6080604052348015600f57600080fd5b50";

const DEPLOYABLE_ABI = [
  {
    type: "function",
    name: "foo",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const makeArtifact = (overrides: Partial<HardhatArtifact> = {}): HardhatArtifact => ({
  contractName: "TestContract",
  sourceName: "test/TestContract.sol",
  abi: DEPLOYABLE_ABI,
  bytecode: DEPLOYABLE_BYTECODE,
  deployedBytecode: DEPLOYABLE_BYTECODE,
  ...overrides,
});

const makeContractFile = (overrides: Partial<ContractFile> & { artifactData: HardhatArtifact }): ContractFile => ({
  filePath: "/path/to/contracts/mocks/TestContract.sol",
  relativePath: "mocks/TestContract.sol",
  directory: "/path/to/contracts/mocks",
  fileName: "TestContract",
  contractNames: ["TestContract"],
  primaryContract: overrides.primaryContract ?? "TestContract",
  source: overrides.source ?? "contract TestContract { function foo() external {} }",
  ...overrides,
});

const makeMetadata = (overrides: Partial<ContractMetadata> = {}): ContractMetadata => ({
  name: "TestMock",
  contractName: "TestMock",
  sourceFile: "mocks/TestMock.sol",
  layer: 0,
  category: "core",
  hasTimeTravel: false,
  roles: [],
  methods: [],
  events: [],
  errors: [],
  imports: [],
  inheritance: [],
  solidityVersion: "0.8.18",
  upgradeable: false,
  isDeployable: true,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Registry Generator - isDeployable", () => {
  before(silenceScriptLogging);
  after(() => resetLogger());

  // ==========================================================================
  // extractMetadata - isDeployable computation
  // ==========================================================================

  describe("extractMetadata - isDeployable computation", () => {
    it("should set isDeployable=true for contract with non-empty bytecode and non-empty ABI", () => {
      const contract = makeContractFile({
        artifactData: makeArtifact({
          bytecode: DEPLOYABLE_BYTECODE,
          abi: DEPLOYABLE_ABI,
        }),
      });

      const metadata = extractMetadata(contract, false);
      expect(metadata.isDeployable).to.be.true;
    });

    it("should set isDeployable=false for interface (empty bytecode, non-empty ABI)", () => {
      const contract = makeContractFile({
        primaryContract: "ITestInterface",
        source: "interface ITestInterface { function foo() external; }",
        artifactData: makeArtifact({
          contractName: "ITestInterface",
          bytecode: "0x",
          deployedBytecode: "0x",
          abi: DEPLOYABLE_ABI,
        }),
      });

      const metadata = extractMetadata(contract, false);
      expect(metadata.isDeployable).to.be.false;
    });

    it("should set isDeployable=false for internal-only contract (non-empty bytecode, empty ABI)", () => {
      const contract = makeContractFile({
        primaryContract: "InternalOnly",
        source: "contract InternalOnly { function _internal() internal {} }",
        artifactData: makeArtifact({
          contractName: "InternalOnly",
          bytecode: DEPLOYABLE_BYTECODE,
          abi: [],
        }),
      });

      const metadata = extractMetadata(contract, false);
      expect(metadata.isDeployable).to.be.false;
    });

    it("should set isDeployable=false when both bytecode and ABI are empty", () => {
      const contract = makeContractFile({
        primaryContract: "EmptyContract",
        source: "contract EmptyContract {}",
        artifactData: makeArtifact({
          contractName: "EmptyContract",
          bytecode: "0x",
          deployedBytecode: "0x",
          abi: [],
        }),
      });

      const metadata = extractMetadata(contract, false);
      expect(metadata.isDeployable).to.be.false;
    });
  });

  // ==========================================================================
  // generateRegistry - non-deployable mock handling
  // ==========================================================================

  describe("generateRegistry - non-deployable mock handling", () => {
    it("should include factory import and line for deployable mocks", () => {
      const deployableMock = makeMetadata({
        name: "DeployableMock",
        contractName: "DeployableMock",
        isDeployable: true,
      });

      const code = generateRegistry([], [], undefined, undefined, [deployableMock]);

      expect(code).to.include("DeployableMock__factory");
      expect(code).to.include("factory: (signer) => new DeployableMock__factory(signer)");
    });

    it("should NOT include factory import or line for non-deployable mocks", () => {
      const nonDeployableMock = makeMetadata({
        name: "ITestInterface",
        contractName: "ITestInterface",
        isDeployable: false,
      });

      const code = generateRegistry([], [], undefined, undefined, [nonDeployableMock]);

      // Should NOT have factory import
      expect(code).to.not.include("ITestInterface__factory");

      // Should NOT have factory line in the entry
      expect(code).to.not.match(/ITestInterface[\s\S]*?factory:/);

      // But mock entry should still exist with name
      expect(code).to.include("MOCK_CONTRACTS");
      expect(code).to.include("name: 'ITestInterface'");
    });

    it("should handle mixed deployable and non-deployable mocks", () => {
      const deployableMock = makeMetadata({
        name: "DeployableMock",
        contractName: "DeployableMock",
        isDeployable: true,
      });

      const nonDeployableMock = makeMetadata({
        name: "NonDeployableInterface",
        contractName: "NonDeployableInterface",
        isDeployable: false,
      });

      const code = generateRegistry([], [], undefined, undefined, [deployableMock, nonDeployableMock]);

      // Deployable mock should have factory
      expect(code).to.include("DeployableMock__factory");
      expect(code).to.include("factory: (signer) => new DeployableMock__factory(signer)");

      // Non-deployable mock should NOT have factory
      expect(code).to.not.include("NonDeployableInterface__factory");

      // Both mocks should appear in MOCK_CONTRACTS
      expect(code).to.include("name: 'DeployableMock'");
      expect(code).to.include("name: 'NonDeployableInterface'");

      // Total count should include both
      expect(code).to.include("TOTAL_MOCKS = 2");
    });

    it("should not emit factory line at all for non-deployable mock entry", () => {
      const nonDeployableMock = makeMetadata({
        name: "InternalOnlyMock",
        contractName: "InternalOnlyMock",
        isDeployable: false,
      });

      const code = generateRegistry([], [], undefined, undefined, [nonDeployableMock]);

      // Extract the InternalOnlyMock entry
      const entryMatch = code.match(/InternalOnlyMock:\s*\{[\s\S]*?\n\s{4}\}/);
      expect(entryMatch).to.not.be.null;

      const entry = entryMatch![0];
      expect(entry).to.not.include("factory:");
    });
  });
});
