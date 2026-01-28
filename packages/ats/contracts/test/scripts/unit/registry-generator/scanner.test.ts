// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for registry-generator scanner module.
 *
 * Tests the contract discovery and categorization functionality,
 * particularly the filtering of non-deployable contracts (interfaces, abstract).
 */

import { expect } from "chai";
import * as path from "path";
import { isInterfaceDefinition } from "../../../../scripts/tools/registry-generator/utils/solidityParser";
import { hasTypechainFactory, isDeployableContract } from "../../../../scripts/tools/registry-generator/core/scanner";
import type { ContractFile } from "../../../../scripts/tools/registry-generator/types";

describe("Registry Generator - Scanner", () => {
  describe("isInterfaceDefinition", () => {
    it("should detect simple interface definition", () => {
      const source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMyContract {
    function doSomething() external;
}
`;
      expect(isInterfaceDefinition(source, "IMyContract")).to.be.true;
    });

    it("should detect interface with inheritance", () => {
      const source = `
pragma solidity ^0.8.0;

interface IChild is IParent {
    function childMethod() external;
}
`;
      expect(isInterfaceDefinition(source, "IChild")).to.be.true;
    });

    it("should NOT detect contract as interface", () => {
      const source = `
pragma solidity ^0.8.0;

contract MyContract {
    function doSomething() external {}
}
`;
      expect(isInterfaceDefinition(source, "MyContract")).to.be.false;
    });

    it("should NOT detect abstract contract as interface", () => {
      const source = `
pragma solidity ^0.8.0;

abstract contract MyAbstract {
    function doSomething() external virtual;
}
`;
      expect(isInterfaceDefinition(source, "MyAbstract")).to.be.false;
    });

    it("should NOT detect library as interface", () => {
      const source = `
pragma solidity ^0.8.0;

library MyLibrary {
    function add(uint a, uint b) internal pure returns (uint) {
        return a + b;
    }
}
`;
      expect(isInterfaceDefinition(source, "MyLibrary")).to.be.false;
    });

    it("should handle interface with generic type parameters", () => {
      const source = `
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}
`;
      expect(isInterfaceDefinition(source, "IERC20")).to.be.true;
    });

    it("should correctly identify interface in file with multiple definitions", () => {
      const source = `
pragma solidity ^0.8.0;

interface IBase {
    function base() external;
}

contract Implementation is IBase {
    function base() external {}
}

interface IExtended {
    function extended() external;
}
`;
      expect(isInterfaceDefinition(source, "IBase")).to.be.true;
      expect(isInterfaceDefinition(source, "IExtended")).to.be.true;
      expect(isInterfaceDefinition(source, "Implementation")).to.be.false;
    });

    it("should NOT match partial contract names", () => {
      const source = `
pragma solidity ^0.8.0;

interface IFactoryBase {
    function create() external;
}

contract Factory {
    function create() external {}
}
`;
      // IFactory should not match IFactoryBase
      expect(isInterfaceDefinition(source, "IFactory")).to.be.false;
      expect(isInterfaceDefinition(source, "IFactoryBase")).to.be.true;
    });

    it("should handle interface with comments in between", () => {
      const source = `
pragma solidity ^0.8.0;

// This is a factory interface
/// @title Factory Interface
interface IFactory {
    /// @notice Creates something
    function create() external;
}
`;
      expect(isInterfaceDefinition(source, "IFactory")).to.be.true;
    });

    it("should handle interface with opening brace on same line", () => {
      const source = `interface ICompact { function method() external; }`;
      expect(isInterfaceDefinition(source, "ICompact")).to.be.true;
    });

    it("should handle interface with opening brace on next line", () => {
      const source = `
interface ISpaced
{
    function method() external;
}`;
      expect(isInterfaceDefinition(source, "ISpaced")).to.be.true;
    });
  });

  describe("isDeployableContract", () => {
    it("should return true for contract with valid bytecode", () => {
      const contract: ContractFile = {
        filePath: "/test/Contract.sol",
        relativePath: "Contract.sol",
        directory: "/test",
        fileName: "Contract",
        contractNames: ["Contract"],
        primaryContract: "Contract",
        source: "contract Contract {}",
        artifactData: {
          contractName: "Contract",
          sourceName: "Contract.sol",
          abi: [],
          bytecode: "0x608060405234801561001057600080fd5b50",
          deployedBytecode: "0x608060405234801561001057600080fd5b50",
        },
      };
      expect(isDeployableContract(contract)).to.be.true;
    });

    it("should return false for contract with empty bytecode (0x)", () => {
      const contract: ContractFile = {
        filePath: "/test/IContract.sol",
        relativePath: "IContract.sol",
        directory: "/test",
        fileName: "IContract",
        contractNames: ["IContract"],
        primaryContract: "IContract",
        source: "interface IContract {}",
        artifactData: {
          contractName: "IContract",
          sourceName: "IContract.sol",
          abi: [],
          bytecode: "0x",
          deployedBytecode: "0x",
        },
      };
      expect(isDeployableContract(contract)).to.be.false;
    });

    it("should return false for contract with bytecode 0x0", () => {
      const contract: ContractFile = {
        filePath: "/test/Abstract.sol",
        relativePath: "Abstract.sol",
        directory: "/test",
        fileName: "Abstract",
        contractNames: ["Abstract"],
        primaryContract: "Abstract",
        source: "abstract contract Abstract {}",
        artifactData: {
          contractName: "Abstract",
          sourceName: "Abstract.sol",
          abi: [],
          bytecode: "0x0",
          deployedBytecode: "0x0",
        },
      };
      expect(isDeployableContract(contract)).to.be.false;
    });
  });

  describe("hasTypechainFactory", () => {
    // Use actual typechain-types directory for realistic testing
    const typechainPath = path.resolve(__dirname, "../../../../build/typechain-types");

    it("should return true for contract with existing factory", () => {
      // AccessControlFacet is a known facet with a factory
      expect(hasTypechainFactory("AccessControlFacet", typechainPath)).to.be.true;
    });

    it("should return true for mock contract with existing factory", () => {
      // MockedExternalKycList is a known mock with a factory
      expect(hasTypechainFactory("MockedExternalKycList", typechainPath)).to.be.true;
    });

    it("should return false for non-existent contract", () => {
      expect(hasTypechainFactory("NonExistentContract", typechainPath)).to.be.false;
    });

    it("should return false for invalid typechain path", () => {
      expect(hasTypechainFactory("AccessControlFacet", "/non/existent/path")).to.be.false;
    });
  });

  describe("Bytecode Validation Patterns", () => {
    it("should recognize empty bytecode patterns", () => {
      // These are the patterns used to detect non-deployable contracts
      const emptyBytecodePatterns = ["0x", "0x0", ""];

      for (const pattern of emptyBytecodePatterns) {
        const isEmpty = !pattern || pattern === "0x" || pattern === "0x0";
        expect(isEmpty).to.be.true;
      }
    });

    it("should recognize valid bytecode", () => {
      // A real bytecode starts with 0x and has actual content
      const validBytecode = "0x608060405234801561001057600080fd5b50";
      const isEmpty = !validBytecode || validBytecode === "0x" || validBytecode === "0x0";
      expect(isEmpty).to.be.false;
    });
  });
});
