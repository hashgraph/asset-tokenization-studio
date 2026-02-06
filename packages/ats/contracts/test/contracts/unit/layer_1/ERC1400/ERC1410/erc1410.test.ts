// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type PauseFacet,
  type AccessControl,
  type Equity,
  type IERC1410,
  KycFacet,
  SsiManagementFacet,
  ERC20Facet,
  ERC1594Facet,
  ERC1644Facet,
  AdjustBalancesFacet,
  Cap,
  IClearing,
  SnapshotsFacet,
  TimeTravelFacet,
  ControlListFacet,
  ProtectedPartitionsFacet,
  DiamondFacet,
} from "@contract-types";
import { grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ClearingActionsFacet } from "@contract-types";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  ZERO,
  EMPTY_STRING,
  ATS_ROLES,
  ADDRESS_ZERO,
  dateToUnixTimestamp,
  EIP1066_CODES,
  DEFAULT_PARTITION,
} from "@scripts";

const amount = 1;
const balanceOf_C_Original = 2 * amount;
const balanceOf_E_Original = 2 * amount;
const data = "0x1234";
const operatorData = "0x5678";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";
const balanceOf_A_Original = [10 * amount, 100 * amount];
const adjustFactor = 253;
const adjustDecimals = 2;
const decimals_Original = 6;
const maxSupply_Original = 1000000 * amount;
const maxSupply_Partition_1_Original = 50000 * amount;
const maxSupply_Partition_Original = ZERO;
const EMPTY_VC_ID = EMPTY_STRING;
interface TransferInfo {
  to: string;
  value: number;
}

interface OperatorTransferData {
  partition: string;
  from: string;
  to: string;
  value: number;
  data: string;
  operatorData: string;
}

let basicTransferInfo: TransferInfo;
let operatorTransferData: OperatorTransferData;

interface BalanceAdjustedValues {
  maxSupply: BigNumber;
  maxSupply_Partition_1: BigNumber;
  maxSupply_Partition: BigNumber;
  totalSupply: BigNumber;
  totalSupply_Partition_1: BigNumber;
  totalSupply_Partition: BigNumber;
  balanceOf_A: BigNumber;
  balanceOf_A_Partition_1: BigNumber;
  balanceOf_A_Partition: BigNumber;
  balanceOf_B: BigNumber;
  balanceOf_B_Partition_1: BigNumber;
  balanceOf_B_Partition: BigNumber;
  decimals: number;
  metadata?: any;
}
const packedData = ethers.utils.defaultAbiCoder.encode(
  ["bytes32", "bytes32"],
  [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
);
const packedDataWithoutPrefix = packedData.slice(2);

const ProtectedPartitionRole_1 = ethers.utils.keccak256("0x" + packedDataWithoutPrefix);

describe("ERC1410 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let signer_D: SignerWithAddress;
  let signer_E: SignerWithAddress;

  let erc1410Facet: IERC1410;
  let accessControlFacet: AccessControl;
  let pauseFacet: PauseFacet;
  let equityFacet: Equity;
  let controlList: ControlListFacet;
  let capFacet: Cap;
  let erc20Facet: ERC20Facet;
  let erc1594Facet: ERC1594Facet;
  let erc1644Facet: ERC1644Facet;
  let adjustBalancesFacet: AdjustBalancesFacet;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;
  let clearingActionsFacet: ClearingActionsFacet;
  let snapshotsFacet: SnapshotsFacet;
  let timeTravelFacet: TimeTravelFacet;
  let diamondCutFacet: DiamondFacet;

  async function setPreBalanceAdjustment(singlePartition?: boolean) {
    await grantRolesToAccounts();
    await grantKycToAccounts();
    await connectFacetsToSigners();
    await setMaxSupply(singlePartition);
    await issueTokens(singlePartition);
  }

  async function grantRolesToAccounts() {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._KYC_ROLE, signer_A.address);
  }

  async function grantKycToAccounts() {
    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.connect(signer_A).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.connect(signer_A).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  async function connectFacetsToSigners() {
    adjustBalancesFacet = adjustBalancesFacet.connect(signer_C);
    erc1410Facet = erc1410Facet.connect(signer_A);
    capFacet = capFacet.connect(signer_A);
  }

  async function setMaxSupply(singlePartition?: boolean) {
    await capFacet.setMaxSupply(maxSupply_Original);
    await capFacet.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);
    if (!singlePartition) {
      await capFacet.setMaxSupplyByPartition(_PARTITION_ID, maxSupply_Partition_Original);
    }
  }

  async function issueTokens(singlePartition?: boolean) {
    await erc1410Facet.issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_A.address,
      value: balanceOf_A_Original[0],
      data: "0x",
    });

    if (!singlePartition) {
      await erc1410Facet.issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: balanceOf_A_Original[1],
        data: "0x",
      });
    }
    await erc1410Facet.issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_B.address,
      value: balanceOf_A_Original[0],
      data: "0x",
    });
    if (!singlePartition) {
      await erc1410Facet.issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_B.address,
        value: balanceOf_A_Original[1],
        data: "0x",
      });
    }
  }

  /**
   * Retrieves and returns various balance and supply values adjusted for partitions.
   */
  async function getBalanceAdjustedValues(): Promise<BalanceAdjustedValues> {
    const [maxSupply, totalSupply, balanceOf_A, balanceOf_B, decimals, metadata] = await Promise.all([
      getMaxSupplyValues(),
      getTotalSupplyValues(),
      getBalanceValues(signer_A.address),
      getBalanceValues(signer_B.address),
      erc20Facet.decimals(),
      erc20Facet.getERC20Metadata(),
    ]);

    return {
      ...maxSupply,
      ...totalSupply,
      balanceOf_A: balanceOf_A[`balanceOf_${signer_A.address}`],
      balanceOf_A_Partition_1: balanceOf_A[`balanceOf_${signer_A.address}_Partition_1`],
      balanceOf_A_Partition: balanceOf_A[`balanceOf_${signer_A.address}_Partition`],
      balanceOf_B: balanceOf_B[`balanceOf_${signer_B.address}`],
      balanceOf_B_Partition_1: balanceOf_B[`balanceOf_${signer_B.address}_Partition_1`],
      balanceOf_B_Partition: balanceOf_B[`balanceOf_${signer_B.address}_Partition`],
      decimals,
      metadata,
    };
  }

  async function getMaxSupplyValues() {
    const maxSupply = await capFacet.getMaxSupply();
    const maxSupply_Partition_1 = await capFacet.getMaxSupplyByPartition(_PARTITION_ID_1);
    const maxSupply_Partition = await capFacet.getMaxSupplyByPartition(_PARTITION_ID);

    return {
      maxSupply,
      maxSupply_Partition_1,
      maxSupply_Partition,
    };
  }

  async function getTotalSupplyValues() {
    const totalSupply = await erc1410Facet.totalSupply();
    const totalSupply_Partition_1 = await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1);
    const totalSupply_Partition = await erc1410Facet.totalSupplyByPartition(_PARTITION_ID);

    return {
      totalSupply,
      totalSupply_Partition_1,
      totalSupply_Partition,
    };
  }

  async function getBalanceValues(account: string) {
    const balance = await erc1410Facet.balanceOf(account);
    const balance_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, account);
    const balance_Partition = await erc1410Facet.balanceOfByPartition(_PARTITION_ID, account);

    return {
      [`balanceOf_${account}`]: balance,
      [`balanceOf_${account}_Partition_1`]: balance_Partition_1,
      [`balanceOf_${account}_Partition`]: balance_Partition,
    };
  }

  async function checkAdjustmentsAfterBalanceAdjustment(after: BalanceAdjustedValues, before: BalanceAdjustedValues) {
    // Has been adjusted 2 times
    const factorSquared = BigNumber.from(adjustFactor).pow(2);
    const doubleDecimals = 2 * adjustDecimals;

    expect(after.maxSupply).to.be.equal(before.maxSupply.mul(factorSquared));
    expect(after.maxSupply_Partition_1).to.be.equal(before.maxSupply_Partition_1.mul(factorSquared));
    expect(after.maxSupply_Partition).to.be.equal(before.maxSupply_Partition.mul(factorSquared));

    expect(after.totalSupply).to.be.equal(before.totalSupply.mul(factorSquared));
    expect(after.totalSupply_Partition_1).to.be.equal(before.totalSupply_Partition_1.mul(factorSquared));
    expect(after.totalSupply_Partition).to.be.equal(before.totalSupply_Partition.mul(factorSquared));

    expect(after.balanceOf_A).to.be.equal(before.balanceOf_A.mul(factorSquared));
    expect(after.balanceOf_A_Partition_1).to.be.equal(before.balanceOf_A_Partition_1.mul(factorSquared));
    expect(after.balanceOf_A_Partition).to.be.equal(before.balanceOf_A_Partition.mul(factorSquared));

    expect(after.balanceOf_B).to.be.equal(before.balanceOf_B.mul(factorSquared));
    expect(after.balanceOf_B_Partition_1).to.be.equal(before.balanceOf_B_Partition_1.mul(factorSquared));
    expect(after.balanceOf_B_Partition).to.be.equal(before.balanceOf_B_Partition.mul(factorSquared));

    expect(after.decimals).to.be.equal(before.decimals + doubleDecimals);
    expect(after.metadata?.info?.decimals).to.be.equal(after.decimals);
  }

  async function checkAdjustmentsAfterTransfer(after: BalanceAdjustedValues, before: BalanceAdjustedValues) {
    await checkAdjustmentsAfterOperations(after, before, amount, amount);
  }

  async function checkAdjustmentsAfterRedeem(after: BalanceAdjustedValues, before: BalanceAdjustedValues) {
    await checkAdjustmentsAfterOperations(after, before, amount, 0);
  }

  async function checkAdjustmentsAfterOperations(
    after: BalanceAdjustedValues,
    before: BalanceAdjustedValues,
    subtractedAmount: number,
    addedAmount: number,
  ) {
    const balanceReduction = subtractedAmount - addedAmount;

    expect(after.maxSupply).to.be.equal(before.maxSupply.mul(adjustFactor));
    expect(after.maxSupply_Partition_1).to.be.equal(before.maxSupply_Partition_1.mul(adjustFactor));
    expect(after.maxSupply_Partition).to.be.equal(before.maxSupply_Partition.mul(adjustFactor));

    expect(after.totalSupply).to.be.equal(before.totalSupply.mul(adjustFactor).sub(balanceReduction));
    expect(after.totalSupply_Partition_1).to.be.equal(
      before.totalSupply_Partition_1.mul(adjustFactor).sub(balanceReduction),
    );
    expect(after.totalSupply_Partition).to.be.equal(before.totalSupply_Partition.mul(adjustFactor));

    expect(after.balanceOf_A).to.be.equal(before.balanceOf_A.mul(adjustFactor).sub(subtractedAmount));
    expect(after.balanceOf_A_Partition_1).to.be.equal(
      before.balanceOf_A_Partition_1.mul(adjustFactor).sub(subtractedAmount),
    );
    expect(after.balanceOf_A_Partition).to.be.equal(before.balanceOf_A_Partition.mul(adjustFactor));

    expect(after.balanceOf_B).to.be.equal(before.balanceOf_B.mul(adjustFactor).add(addedAmount));
    expect(after.balanceOf_B_Partition_1).to.be.equal(
      before.balanceOf_B_Partition_1.mul(adjustFactor).add(addedAmount),
    );
    expect(after.balanceOf_B_Partition).to.be.equal(before.balanceOf_B_Partition.mul(adjustFactor));

    expect(after.decimals).to.be.equal(before.decimals + adjustDecimals);
    expect(after.metadata?.info?.decimals).to.be.equal(after.decimals);
  }

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    const init_rbacs = set_initRbacs();
    await executeRbac(base.accessControlFacet, init_rbacs);

    await setFacets(diamond);
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    const init_rbacs = set_initRbacs();
    await executeRbac(base.accessControlFacet, init_rbacs);

    await setFacets(diamond);
  }

  async function setFacets(diamond: ResolverProxy) {
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.address);

    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.address);

    adjustBalancesFacet = await ethers.getContractAt("AdjustBalancesFacet", diamond.address);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.address);
    capFacet = await ethers.getContractAt("CapFacet", diamond.address);
    erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.address);
    erc1594Facet = await ethers.getContractAt("ERC1594Facet", diamond.address);
    erc1644Facet = await ethers.getContractAt("ERC1644Facet", diamond.address);
    equityFacet = await ethers.getContractAt("Equity", diamond.address);
    kycFacet = await ethers.getContractAt("KycFacet", diamond.address, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.address);
    controlList = await ethers.getContractAt("ControlListFacet", diamond.address, signer_A);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.address, signer_A);
    snapshotsFacet = await ethers.getContractAt("SnapshotsFacet", diamond.address);
    diamondCutFacet = await ethers.getContractAt("DiamondFacet", diamond.address);

    capFacet = await ethers.getContractAt("Cap", diamond.address);

    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    await ssiManagementFacet.addIssuer(signer_E.address);

    await kycFacet.grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);
    await kycFacet.grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);
    await kycFacet.grantKyc(signer_D.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

    await erc1410Facet.issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    await erc1410Facet.issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_E.address,
      value: balanceOf_E_Original,
      data: "0x",
    });
  }

  function set_initRbacs() {
    const rbacPause = {
      role: ATS_ROLES._PAUSER_ROLE,
      members: [signer_B.address],
    };
    const corporateActionPause = {
      role: ATS_ROLES._CORPORATE_ACTION_ROLE,
      members: [signer_B.address],
    };
    const rbacKyc = {
      role: ATS_ROLES._KYC_ROLE,
      members: [signer_B.address],
    };
    const rbacSsi = {
      role: ATS_ROLES._SSI_MANAGER_ROLE,
      members: [signer_A.address],
    };
    const rbacClearingRole = {
      role: ATS_ROLES._CLEARING_ROLE,
      members: [signer_A.address],
    };
    return [
      rbacPause,
      corporateActionPause,
      rbacKyc,
      rbacSsi,
      rbacClearingRole,
      {
        role: ProtectedPartitionRole_1,
        members: [signer_B.address, signer_A.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_B.address],
      },
    ];
  }

  describe("Multi partition ", () => {
    let clearingInterface: IClearing;

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);

      basicTransferInfo = {
        to: signer_D.address,
        value: amount,
      };

      operatorTransferData = {
        partition: _PARTITION_ID_1,
        from: signer_E.address,
        to: signer_D.address,
        value: amount,
        data: data,
        operatorData: operatorData,
      };

      await erc1410Facet.connect(signer_E).authorizeOperatorByPartition(_PARTITION_ID_1, signer_C.address);
      clearingInterface = await ethers.getContractAt("IClearing", diamond.address);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(erc1410Facet.initialize_ERC1410(true)).to.be.rejectedWith("AlreadyInitialized");
    });

    it("GIVEN a multi-partition token WHEN checking isMultiPartition THEN returns true", async () => {
      const isMulti = await erc1410Facet.isMultiPartition();
      expect(isMulti).to.be.equal(true);
    });

    it("GIVEN an account with balance WHEN checking balanceOfAt for a past timestamp THEN returns the balance at that timestamp", async () => {
      // Schedule a snapshot
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_C.address);
      const currentTime = await timeTravelFacet.blockTimestamp();
      const snapshotTime = currentTime.add(100);
      await snapshotsFacet.connect(signer_C).takeSnapshot();

      // Advance time to snapshot
      await timeTravelFacet.changeSystemTimestamp(snapshotTime);
      const erc1410ReadFacet = await ethers.getContractAt("ERC1410ReadFacet", diamond.address);
      // Check balance at snapshot time
      const balanceAt = await erc1410ReadFacet.balanceOfAt(signer_C.address, snapshotTime);
      const currentBalance = await erc1410ReadFacet.balanceOf(signer_C.address);
      expect(balanceAt).to.be.equal(currentBalance);
    });

    it("GIVEN an account WHEN authorizing and revoking operators THEN transaction succeeds", async () => {
      await erc1410Facet.issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });

      // authorize - no need to reassign, just use the appropriate facets with connect
      await erc1410Facet.connect(signer_C).authorizeOperator(signer_D.address);
      await erc1410Facet.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID, signer_E.address);

      // check
      let isOperator_D = await erc1410Facet.isOperator(signer_D.address, signer_C.address);
      const isOperator_E = await erc1410Facet.isOperator(signer_E.address, signer_C.address);
      const isOperatorByPartition_E_1 = await erc1410Facet.isOperatorForPartition(
        _PARTITION_ID_1,
        signer_E.address,
        signer_C.address,
      );
      let isOperatorByPartition_E = await erc1410Facet.isOperatorForPartition(
        _PARTITION_ID,
        signer_E.address,
        signer_C.address,
      );
      expect(isOperator_D).to.be.equal(true);
      expect(isOperator_E).to.be.equal(false);
      expect(isOperatorByPartition_E_1).to.be.equal(false);
      expect(isOperatorByPartition_E).to.be.equal(true);

      await erc1410Facet
        .connect(signer_D)
        .operatorRedeemByPartition(_PARTITION_ID_1, signer_C.address, balanceOf_C_Original, "0x", "0x");
      await erc1410Facet
        .connect(signer_E)
        .operatorRedeemByPartition(_PARTITION_ID, signer_C.address, balanceOf_C_Original, "0x", "0x");

      // revoke
      await erc1410Facet.connect(signer_C).revokeOperator(signer_D.address);
      await erc1410Facet.connect(signer_C).revokeOperatorByPartition(_PARTITION_ID, signer_E.address);

      // check
      isOperator_D = await erc1410Facet.isOperator(signer_D.address, signer_C.address);
      isOperatorByPartition_E = await erc1410Facet.isOperatorForPartition(
        _PARTITION_ID,
        signer_E.address,
        signer_C.address,
      );
      expect(isOperator_D).to.be.equal(false);
      expect(isOperatorByPartition_E).to.be.equal(false);
    });

    it("GIVEN a paused token WHEN authorizeOperator THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(erc1410Facet.connect(signer_C).authorizeOperator(signer_D.address)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN a paused token WHEN revokeOperator THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(erc1410Facet.connect(signer_C).revokeOperator(signer_D.address)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN a paused token WHEN authorizeOperatorByPartition THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(
        erc1410Facet.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_D.address),
      ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN revokeOperatorByPartition THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(
        erc1410Facet.connect(signer_C).revokeOperatorByPartition(_PARTITION_ID_1, signer_D.address),
      ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
    });

    it("GIVEN a blocked account WHEN authorizeOperator THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_C.address);

      await expect(erc1410Facet.connect(signer_C).authorizeOperator(signer_D.address)).to.be.revertedWithCustomError(
        controlList,
        "AccountIsBlocked",
      );
    });

    it("GIVEN a blocked operator WHEN authorizeOperator THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_D.address);

      await expect(erc1410Facet.connect(signer_C).authorizeOperator(signer_D.address)).to.be.revertedWithCustomError(
        controlList,
        "AccountIsBlocked",
      );
    });

    it("GIVEN a blocked account WHEN revokeOperator THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_C.address);

      await expect(erc1410Facet.connect(signer_C).revokeOperator(signer_D.address)).to.be.revertedWithCustomError(
        controlList,
        "AccountIsBlocked",
      );
    });

    it("GIVEN a blocked account WHEN authorizeOperatorByPartition THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_C.address);

      await expect(
        erc1410Facet.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_D.address),
      ).to.be.revertedWithCustomError(controlList, "AccountIsBlocked");
    });

    it("GIVEN a blocked operator WHEN authorizeOperatorByPartition THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_D.address);

      await expect(
        erc1410Facet.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_D.address),
      ).to.be.revertedWithCustomError(controlList, "AccountIsBlocked");
    });

    it("GIVEN a blocked account WHEN revokeOperatorByPartition THEN transaction fails with AccountIsBlocked", async () => {
      await controlList.connect(signer_B).addToControlList(signer_C.address);

      await expect(
        erc1410Facet.connect(signer_C).revokeOperatorByPartition(_PARTITION_ID_1, signer_D.address),
      ).to.be.revertedWithCustomError(controlList, "AccountIsBlocked");
    });

    it("GIVEN an account WHEN triggerAndSyncAll THEN transaction succeeds", async () => {
      const balanceBefore = await erc1410Facet.balanceOf(signer_C.address);

      await expect(
        erc1410Facet.connect(signer_C).triggerAndSyncAll(_PARTITION_ID_1, signer_C.address, signer_D.address),
      ).to.not.be.reverted;

      const balanceAfter = await erc1410Facet.balanceOf(signer_C.address);
      expect(balanceAfter).to.be.equal(balanceBefore);
    });

    it("GIVEN a paused token WHEN triggerAndSyncAll THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      await expect(
        erc1410Facet.connect(signer_C).triggerAndSyncAll(_PARTITION_ID_1, signer_C.address, signer_D.address),
      ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
    });

    it("GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused", async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();

      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      const canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.rejectedWith("TokenIsPaused");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.PAUSED);

      // transfer from with data fails
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejectedWith(
        "TokenIsPaused",
      );
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.PAUSED);
    });

    it("GIVEN a token with clearing active WHEN transfer THEN transaction fails with ClearingIsActivated", async () => {
      await clearingActionsFacet.activateClearing();

      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      const canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      // transfer with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.UNAVAILABLE);
      // transfer from with data fails
      await expect(
        erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData),
      ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.UNAVAILABLE);
    });

    it("GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused", async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();

      // issue fails
      await expect(
        erc1410Facet.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        }),
      ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
    });

    it("GIVEN Token WHEN issue to partition 0 THEN transaction fails with ZeroPartition", async () => {
      // issue fails
      await expect(
        erc1410Facet.connect(signer_A).issueByPartition({
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        }),
      ).to.be.rejectedWith("ZeroPartition");
    });

    it("GIVEN Token WHEN issue amount 0 THEN transaction fails with ZeroValue", async () => {
      // issue fails
      await expect(
        erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: 0,
          data: data,
        }),
      ).to.be.rejectedWith("ZeroValue");
    });

    it("GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused", async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();

      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, amount, data, operatorData);
      const canRedeem_2 = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer with data fails
      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data)).to.be.rejectedWith(
        "TokenIsPaused",
      );
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.PAUSED);

      // transfer from with data fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      ).to.be.rejectedWith("TokenIsPaused");
      expect(canRedeem_2[0]).to.be.equal(false);
      expect(canRedeem_2[1]).to.be.equal(EIP1066_CODES.PAUSED);
    });

    it("GIVEN a token with clearing active WHEN redeem THEN transaction fails with ClearingIsActivated", async () => {
      await clearingActionsFacet.activateClearing();

      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, amount, data, operatorData);
      const canRedeem_2 = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, amount, data, operatorData);

      await expect(
        erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data),
      ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.UNAVAILABLE);

      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
      expect(canRedeem_2[0]).to.be.equal(false);
      expect(canRedeem_2[1]).to.be.equal(EIP1066_CODES.UNAVAILABLE);
    });

    it("GIVEN blocked accounts (sender, to, from) WHEN transfer THEN transaction fails with AccountIsBlocked", async () => {
      // Blacklisting accounts
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
      await controlList.connect(signer_A).addToControlList(signer_C.address);

      // Using account C (with role)
      let canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      let canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.rejectedWith("AccountIsBlocked");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // transfer from with data fails
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      expect(canTransfer_2[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // Update blacklist
      await controlList.connect(signer_A).removeFromControlList(signer_C.address);
      await controlList.connect(signer_A).addToControlList(signer_D.address);
      canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.rejectedWith("AccountIsBlocked");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // transfer from with data fails
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      expect(canTransfer_2[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // Update blacklist
      await controlList.connect(signer_A).removeFromControlList(signer_D.address);
      await controlList.connect(signer_A).addToControlList(signer_E.address);
      canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer from with data fails
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      expect(canTransfer_2[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);
    });

    it("GIVEN non Kyc accounts (to, from) WHEN transfer THEN transaction fails with InvalidKycStatus", async () => {
      await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);
      await erc1410Facet.connect(signer_D).authorizeOperator(signer_C.address);
      await kycFacet.revokeKyc(signer_D.address);

      let canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer from with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      await expect(
        erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      await kycFacet.grantKyc(signer_D.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);
      await kycFacet.revokeKyc(signer_E.address);
      canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // transfer from with data fails
      await expect(
        erc1410Facet.connect(signer_E).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      await expect(
        erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);
    });

    it("GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked", async () => {
      // First deploy a new token using white list
      const newFixtureToken = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            isWhiteList: true,
          },
        },
      });

      await accessControlFacet
        .attach(newFixtureToken.diamond.address)
        .grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);
      await accessControlFacet.attach(newFixtureToken.diamond.address).grantRole(ATS_ROLES._KYC_ROLE, signer_A.address);
      await ssiManagementFacet.attach(newFixtureToken.diamond.address).connect(signer_A).addIssuer(signer_E.address);
      await kycFacet
        .attach(newFixtureToken.diamond.address)
        .connect(signer_A)
        .grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

      // accounts are blacklisted by default (white list)
      await accessControlFacet
        .attach(newFixtureToken.diamond.address)
        .connect(signer_A)
        .grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

      // issue fails
      await expect(
        erc1410Facet.attach(newFixtureToken.diamond.address).connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: amount,
          data: data,
        }),
      ).to.be.rejectedWith("AccountIsBlocked");
    });

    it("GIVEN non Kyc account WHEN issue or redeem THEN transaction fails with InvalidKycStatus", async () => {
      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_D.address,
        value: amount,
        data: data,
      });
      await erc1410Facet.connect(signer_D).authorizeOperator(signer_A.address);
      await kycFacet.revokeKyc(signer_D.address);
      await expect(
        erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_D.address,
          value: amount,
          data: data,
        }),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      const canRedeem = await erc1410Facet
        .connect(signer_A)
        .canRedeemByPartition(signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      await expect(
        erc1410Facet.connect(signer_D).redeemByPartition(_PARTITION_ID_1, amount, data),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      await expect(
        erc1410Facet
          .connect(signer_A)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_D.address, amount, data, operatorData),
      ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);
    });

    it("GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
      // Blacklisting accounts
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
      await controlList.connect(signer_A).addToControlList(signer_C.address);

      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, amount, data, operatorData);
      let canRedeem_2 = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, amount, data, operatorData);

      // redeem with data fails
      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data)).to.be.rejectedWith(
        "AccountIsBlocked",
      );
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // redeem from with data fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      ).to.be.rejectedWith("AccountIsBlocked");
      expect(canRedeem_2[0]).to.be.equal(false);
      expect(canRedeem_2[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);

      // Update blacklist
      await controlList.removeFromControlList(signer_C.address);
      await controlList.addToControlList(signer_E.address);
      canRedeem_2 = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, amount, data, operatorData);

      // redeem from with data fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      ).to.be.rejectedWith("AccountIsBlocked");
      expect(canRedeem_2[0]).to.be.equal(false);
      expect(canRedeem_2[1]).to.be.equal(EIP1066_CODES.DISALLOWED_OR_STOP);
    });

    it("GIVEN wrong partition WHEN transfer THEN transaction fails with InValidPartition", async () => {
      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID, amount, data, operatorData);
      // transfer with data fails
      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID, basicTransferInfo, data),
      ).to.be.rejectedWith("InvalidPartition");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN wrong partition WHEN redeem THEN transaction fails with InValidPartition", async () => {
      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID, amount, data, operatorData);

      // transfer with data fails
      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID, amount, data)).to.be.rejectedWith(
        "InvalidPartition",
      );
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(
        erc1410Facet.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: amount,
          data: data,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account WHEN transfer more than its balance THEN transaction fails", async () => {
      // transfer with data fails
      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(
          signer_C.address,
          signer_D.address,
          _PARTITION_ID_1,
          2 * balanceOf_C_Original,
          data,
          operatorData,
        );
      basicTransferInfo.value = 2 * balanceOf_C_Original;
      await expect(erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data)).to.be
        .rejected;
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);

      // transfer from with data fails
      await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);

      const canTransfer_2 = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(
          signer_E.address,
          signer_D.address,
          _PARTITION_ID_1,
          2 * balanceOf_E_Original,
          data,
          operatorData,
        );

      operatorTransferData.value = 2 * balanceOf_E_Original;
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejected;
      expect(canTransfer_2[0]).to.be.equal(false);
      expect(canTransfer_2[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN an account WHEN redeem more than its balance THEN transaction fails", async () => {
      // transfer with data fails
      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, 2 * balanceOf_C_Original, data, operatorData);

      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, 2 * balanceOf_C_Original, data)).to
        .be.rejected;
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);

      // transfer from with data fails
      await erc1410Facet.connect(signer_C).authorizeOperatorByPartition(_PARTITION_ID_1, signer_E.address);
      const canRedeem_2 = await erc1410Facet
        .connect(signer_E)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, 2 * balanceOf_C_Original, data, operatorData);
      await expect(
        erc1410Facet
          .connect(signer_E)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_C.address, 2 * balanceOf_C_Original, data, operatorData),
      ).to.be.rejected;
      expect(canRedeem_2[0]).to.be.equal(false);
      expect(canRedeem_2[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN an account WHEN transfer from address 0 THEN transaction fails", async () => {
      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(
          ADDRESS_ZERO,
          signer_D.address,
          _PARTITION_ID_1,
          balanceOf_E_Original,
          data,
          operatorData,
        );

      operatorTransferData.from = ADDRESS_ZERO;
      basicTransferInfo.to = ADDRESS_ZERO;

      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejected;
      await expect(erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data)).to.be
        .rejected;
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE);
    });

    it("GIVEN an account WHEN redeem from address 0 THEN transaction fails", async () => {
      const canRedeem = await erc1410Facet
        .connect(signer_E)
        .canRedeemByPartition(ADDRESS_ZERO, _PARTITION_ID_1, amount, data, operatorData);
      await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);
      await expect(
        erc1410Facet
          .connect(signer_E)
          .operatorRedeemByPartition(_PARTITION_ID_1, ADDRESS_ZERO, balanceOf_E_Original, data, operatorData),
      ).to.be.rejected;
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE);
    });

    it("GIVEN an account WHEN operatorTransferByPartition to address 0 THEN transaction fails with ZeroAddressNotAllowed", async () => {
      operatorTransferData.to = ADDRESS_ZERO;
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData)).to.be.rejectedWith(
        "ZeroAddressNotAllowed",
      );
    });

    it("GIVEN protected partitions without wildcard role WHEN transferByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
      // Initialize protected partitions
      const protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitionsFacet", diamond.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
      await protectedPartitionsFacet.connect(signer_A).protectPartitions();

      await expect(
        erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data),
      ).to.be.rejectedWith("PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN protected partitions without wildcard role WHEN redeemByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
      // Initialize protected partitions
      const protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitionsFacet", diamond.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
      await protectedPartitionsFacet.connect(signer_A).protectPartitions();

      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data)).to.be.rejectedWith(
        "PartitionsAreProtectedAndNoRole",
      );
    });

    it("GIVEN an account WHEN transfer THEN transaction succeeds", async () => {
      // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      // scheduling 2 snapshots
      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:08Z");

      const dividendsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:24Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:04:00Z");
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      const dividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      await equityFacet.connect(signer_C).setDividends(dividendData_1);
      await equityFacet.connect(signer_C).setDividends(dividendData);

      //  transfer
      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_C.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      await expect(erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data))
        .to.emit(erc1410Facet, "TransferByPartition")
        .withArgs(_PARTITION_ID_1, ADDRESS_ZERO, signer_C.address, signer_D.address, amount, data, "0x");
      expect(canTransfer[0]).to.be.equal(true);
      // transfer from
      await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);
      const canTransfer_2 = await erc1410Facet
        .connect(signer_E)
        .canTransferByPartition(signer_E.address, signer_D.address, _PARTITION_ID_1, amount, data, operatorData);
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData))
        .to.emit(erc1410Facet, "TransferByPartition")
        .withArgs(_PARTITION_ID_1, signer_C.address, signer_E.address, signer_D.address, amount, data, operatorData);
      expect(canTransfer_2[0]).to.be.equal(true);

      // check amounts
      const balanceOf_C = await erc1410Facet.balanceOf(signer_C.address);
      expect(balanceOf_C).to.equal(balanceOf_C_Original - amount);
      const balanceOf_E = await erc1410Facet.balanceOf(signer_E.address);
      expect(balanceOf_E).to.equal(balanceOf_E_Original - amount);
      const balanceOf_D = await erc1410Facet.balanceOf(signer_D.address);
      expect(balanceOf_D).to.equal(2 * amount);
      let dividend_1 = await equityFacet.getDividends(1);
      let dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(0);
      expect(dividend.snapshotId.toNumber()).to.equal(0);
      let dividend_1_For_C = await equityFacet.getDividendsFor(1, signer_C.address);
      let dividend_1_For_E = await equityFacet.getDividendsFor(1, signer_E.address);
      let dividend_1_For_D = await equityFacet.getDividendsFor(1, signer_D.address);
      expect(dividend_1_For_C.tokenBalance).to.equal(0);
      expect(dividend_1_For_E.tokenBalance).to.equal(0);
      expect(dividend_1_For_D.tokenBalance).to.equal(0);
      expect(dividend_1_For_C.decimals).to.equal(0);
      expect(dividend_1_For_E.decimals).to.equal(0);
      expect(dividend_1_For_D.decimals).to.equal(0);
      expect(dividend_1_For_C.recordDateReached).to.equal(false);
      expect(dividend_1_For_E.recordDateReached).to.equal(false);
      expect(dividend_1_For_D.recordDateReached).to.equal(false);
      // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);

      dividend_1 = await equityFacet.getDividends(1);
      expect(dividend_1.snapshotId.toNumber()).to.equal(0);

      dividend_1_For_C = await equityFacet.getDividendsFor(1, signer_C.address);
      dividend_1_For_E = await equityFacet.getDividendsFor(1, signer_E.address);
      dividend_1_For_D = await equityFacet.getDividendsFor(1, signer_D.address);

      expect(dividend_1_For_C.tokenBalance.toNumber()).to.equal(balanceOf_C.toNumber());
      expect(dividend_1_For_E.tokenBalance.toNumber()).to.equal(balanceOf_E.toNumber());
      expect(dividend_1_For_D.tokenBalance.toNumber()).to.equal(balanceOf_D.toNumber());
      expect(dividend_1_For_C.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_E.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_D.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_C.recordDateReached).to.equal(true);
      expect(dividend_1_For_E.recordDateReached).to.equal(true);
      expect(dividend_1_For_D.recordDateReached).to.equal(true);

      // transfer
      await expect(erc1410Facet.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, data))
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(1);
      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(0);
      dividend_1_For_C = await equityFacet.getDividendsFor(1, signer_C.address);
      dividend_1_For_E = await equityFacet.getDividendsFor(1, signer_E.address);
      dividend_1_For_D = await equityFacet.getDividendsFor(1, signer_D.address);

      expect(dividend_1_For_C.tokenBalance.toNumber()).to.equal(balanceOf_C.toNumber());
      expect(dividend_1_For_E.tokenBalance.toNumber()).to.equal(balanceOf_E.toNumber());
      expect(dividend_1_For_D.tokenBalance.toNumber()).to.equal(balanceOf_D.toNumber());
      expect(dividend_1_For_C.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_E.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_D.decimals).to.equal(decimals_Original);
      expect(dividend_1_For_C.recordDateReached).to.equal(true);
      expect(dividend_1_For_E.recordDateReached).to.equal(true);
      expect(dividend_1_For_D.recordDateReached).to.equal(true);

      // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      // transfer From
      await expect(erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData))
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(2);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(2);
    });

    it("GIVEN an account WHEN issue more than max supply THEN transaction fails with MaxSupplyReached or MaxSupplyReachedForPartition", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);

      await capFacet.connect(signer_A).setMaxSupply(balanceOf_C_Original + balanceOf_E_Original + 2 * amount);
      await capFacet
        .connect(signer_A)
        .setMaxSupplyByPartition(_PARTITION_ID_1, balanceOf_C_Original + balanceOf_E_Original + amount);

      // add to list fails
      await expect(
        erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: 3 * amount,
          data: data,
        }),
      ).to.be.rejectedWith("MaxSupplyReached");

      await expect(
        erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_E.address,
          value: 2 * amount,
          data: data,
        }),
      ).to.be.rejectedWith("MaxSupplyReachedForPartition");
    });

    it("GIVEN an account WHEN issue THEN transaction succeeds", async () => {
      // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // scheduling 2 snapshots
      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:08Z");
      const dividendsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:24Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:04:00Z");
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      const dividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      await equityFacet.connect(signer_C).setDividends(dividendData_1);
      await equityFacet.connect(signer_C).setDividends(dividendData);

      //  transfer
      await expect(
        erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_D.address,
          value: amount,
          data: data,
        }),
      )
        .to.emit(erc1410Facet, "IssuedByPartition")
        .withArgs(_PARTITION_ID_1, signer_A.address, signer_D.address, amount, data);

      // check amounts
      const balanceOf_D = await erc1410Facet.balanceOf(signer_D.address);
      const balanceOf_D_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_D.address);
      const partitionsOf_D = await erc1410Facet.partitionsOf(signer_D.address);
      expect(partitionsOf_D.length).to.equal(1);
      expect(partitionsOf_D[0]).to.equal(_PARTITION_ID_1);
      expect(balanceOf_D).to.equal(amount);
      expect(balanceOf_D_Partition_1).to.equal(balanceOf_D);
      const totalSupply = await erc1410Facet.totalSupply();
      const totalSupplyByPartition = await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1);
      expect(totalSupply).to.equal(balanceOf_C_Original + balanceOf_E_Original + balanceOf_D.toNumber());
      expect(totalSupplyByPartition.toString()).to.equal(totalSupply.toString());
      let dividend_1 = await equityFacet.getDividends(1);
      let dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(0);
      expect(dividend.snapshotId.toNumber()).to.equal(0);

      // Set Max supplies to test
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);

      await capFacet.connect(signer_A).setMaxSupply(balanceOf_C_Original + balanceOf_E_Original + 100 * amount);
      await capFacet
        .connect(signer_A)
        .setMaxSupplyByPartition(_PARTITION_ID_1, balanceOf_C_Original + balanceOf_E_Original + 100 * amount);

      // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);

      // transfer
      await expect(
        erc1410Facet.connect(signer_A).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_D.address,
          value: amount,
          data: data,
        }),
      )
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(1);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(0);
    });

    it("GIVEN an account WHEN redeem THEN transaction succeeds", async () => {
      // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // scheduling 2 snapshots
      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:08Z");
      const dividendsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:24Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:24:00Z");
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      const dividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      await equityFacet.connect(signer_C).setDividends(dividendData_1);
      await equityFacet.connect(signer_C).setDividends(dividendData);

      //  transfer
      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_C.address, _PARTITION_ID_1, amount, data, operatorData);
      expect(canRedeem[0]).to.be.equal(true);
      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data))
        .to.emit(erc1410Facet, "RedeemedByPartition")
        .withArgs(_PARTITION_ID_1, ADDRESS_ZERO, signer_C.address, amount, data, "0x");
      let totalSupply = await erc1410Facet.totalSupply();
      let totalSupplyByPartition = await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1);
      // transfer from
      await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);

      const canRedeem_2 = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_E.address, _PARTITION_ID_1, amount, data, operatorData);
      expect(canRedeem_2[0]).to.be.equal(true);
      expect(totalSupply).to.be.equal(balanceOf_C_Original + balanceOf_E_Original - amount);
      expect(totalSupplyByPartition).to.be.equal(totalSupply);
      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      )
        .to.emit(erc1410Facet, "RedeemedByPartition")
        .withArgs(_PARTITION_ID_1, signer_C.address, signer_E.address, amount, data, operatorData);
      totalSupply = await erc1410Facet.totalSupply();
      totalSupplyByPartition = await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1);

      // check amounts
      const balanceOf_C = await erc1410Facet.balanceOf(signer_C.address);
      const balanceOf_C_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
      const partitionsOf_C = await erc1410Facet.partitionsOf(signer_C.address);
      expect(partitionsOf_C.length).to.equal(1);
      expect(partitionsOf_C[0]).to.equal(_PARTITION_ID_1);
      expect(balanceOf_C).to.equal(balanceOf_C_Original - amount);
      expect(balanceOf_C_Partition_1).to.equal(balanceOf_C);
      const balanceOf_E = await erc1410Facet.balanceOf(signer_E.address);
      const balanceOf_E_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_E.address);
      const partitionsOf_E = await erc1410Facet.partitionsOf(signer_E.address);
      expect(partitionsOf_E.length).to.equal(1);
      expect(partitionsOf_E[0]).to.equal(_PARTITION_ID_1);
      expect(balanceOf_E).to.equal(balanceOf_E_Original - amount);
      expect(balanceOf_E_Partition_1).to.equal(balanceOf_E);
      let dividend_1 = await equityFacet.getDividends(1);
      let dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(0);
      expect(dividend.snapshotId.toNumber()).to.equal(0);
      expect(totalSupply).to.be.equal(balanceOf_C_Original + balanceOf_E_Original - 2 * amount);
      expect(totalSupplyByPartition).to.be.equal(totalSupply);

      // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);

      // transfer
      await expect(erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_1, amount, data))
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(1);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(0);

      // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      // transfer From
      await expect(
        erc1410Facet
          .connect(signer_C)
          .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
      )
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(2);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(2);
    });

    it("GIVEN accounts USING WHITELIST WHEN issue THEN transaction succeeds", async () => {
      // First deploy a new token using white list
      const newTokenFixture = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isWhiteList: true,
            isMultiPartition: true,
          },
        },
      });
      // accounts are blacklisted by default (white list)

      await accessControlFacet
        .attach(newTokenFixture.diamond.address)
        .connect(signer_A)
        .grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await accessControlFacet
        .attach(newTokenFixture.diamond.address)
        .connect(signer_A)
        .grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
      await accessControlFacet
        .attach(newTokenFixture.diamond.address)
        .connect(signer_A)
        .grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);
      await accessControlFacet
        .attach(newTokenFixture.diamond.address)
        .connect(signer_A)
        .grantRole(ATS_ROLES._KYC_ROLE, signer_B.address);

      await ssiManagementFacet.attach(newTokenFixture.diamond.address).connect(signer_A).addIssuer(signer_E.address);
      await kycFacet
        .attach(newTokenFixture.diamond.address)
        .connect(signer_B)
        .grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

      // Using account A (with role)
      await controlList.attach(newTokenFixture.diamond.address).connect(signer_A).addToControlList(signer_A.address);
      await controlList.attach(newTokenFixture.diamond.address).connect(signer_A).addToControlList(signer_E.address);

      // issue succeds
      await erc1410Facet.attach(newTokenFixture.diamond.address).connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_E.address,
        value: amount,
        data: data,
      });
    });

    it("GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      const balanceOf_D_Original = 4 * amount;
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_D.address,
        value: balanceOf_D_Original,
        data: data,
      });

      const canTransfer = await erc1410Facet
        .connect(signer_C)
        .canTransferByPartition(signer_D.address, signer_E.address, _PARTITION_ID_1, amount, data, operatorData);

      // controller transfer fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerTransferByPartition(
            _PARTITION_ID_1,
            signer_D.address,
            signer_E.address,
            amount,
            data,
            operatorData,
          ),
      ).to.be.rejectedWith("AccountHasNoRole");
      expect(canTransfer[0]).to.be.equal(false);
      expect(canTransfer[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      const balanceOf_D_Original = 4 * amount;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_D.address,
        value: balanceOf_D_Original,
        data: "0x",
      });

      const canRedeem = await erc1410Facet
        .connect(signer_C)
        .canRedeemByPartition(signer_D.address, _PARTITION_ID_1, amount, data, operatorData);

      // controller redeem fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerRedeemByPartition(_PARTITION_ID_1, signer_D.address, amount, data, operatorData),
      ).to.be.rejectedWith("AccountHasNoRole");
      expect(canRedeem[0]).to.be.equal(false);
      expect(canRedeem[1]).to.be.equal(EIP1066_CODES.INSUFFICIENT_FUNDS);
    });

    it("GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CONTROLLER_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // controller transfer fails
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerTransferByPartition(_PARTITION_ID_1, signer_D.address, signer_E.address, amount, "0x", "0x"),
      ).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CONTROLLER_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // remove document
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerRedeemByPartition(_PARTITION_ID_1, signer_D.address, amount, "0x", "0x"),
      ).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an account with controller role WHEN controllerTransfer and controllerRedeem THEN transaction succeeds", async () => {
      // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // issueing 2 tokens to account D
      const balanceOf_D_Original = 4 * amount;
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_D.address,
        value: balanceOf_D_Original,
        data: "0x",
      });
      // scheduling 2 snapshots
      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:08Z");
      const dividendsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:24Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:04:00Z");
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      const dividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: 1,
        amountDecimals: 0,
      };
      await equityFacet.connect(signer_C).setDividends(dividendData_1);
      await equityFacet.connect(signer_C).setDividends(dividendData);

      // controller transfer
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerTransferByPartition(
            _PARTITION_ID_1,
            signer_D.address,
            signer_E.address,
            amount,
            data,
            operatorData,
          ),
      )
        .to.emit(erc1410Facet, "TransferByPartition")
        .withArgs(_PARTITION_ID_1, signer_C.address, signer_D.address, signer_E.address, amount, data, operatorData);
      // controller redeem
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerRedeemByPartition(_PARTITION_ID_1, signer_D.address, amount, data, operatorData),
      )
        .to.emit(erc1410Facet, "RedeemedByPartition")
        .withArgs(_PARTITION_ID_1, signer_C.address, signer_D.address, amount, data, operatorData);

      // check amounts
      const balanceOf_D = await erc1410Facet.balanceOf(signer_D.address);
      const balanceOf_D_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_D.address);
      expect(balanceOf_D).to.equal(balanceOf_D_Original - 2 * amount);
      expect(balanceOf_D_Partition_1).to.equal(balanceOf_D);
      const balanceOf_E = await erc1410Facet.balanceOf(signer_E.address);
      const balanceOf_E_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_E.address);
      expect(balanceOf_E).to.equal(balanceOf_E_Original + amount);
      expect(balanceOf_E_Partition_1).to.equal(balanceOf_E);
      let dividend_1 = await equityFacet.getDividends(1);
      let dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(0);
      expect(dividend.snapshotId.toNumber()).to.equal(0);

      // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);

      // controller transfer
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerTransferByPartition(
            _PARTITION_ID_1,
            signer_D.address,
            signer_E.address,
            amount,
            data,
            operatorData,
          ),
      )
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(1);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(0);

      // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      // controller redeem
      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerRedeemByPartition(_PARTITION_ID_1, signer_D.address, amount, data, operatorData),
      )
        .to.emit(snapshotsFacet, "SnapshotTriggered")
        .withArgs(2);

      // check that scheduled snapshots was triggered
      dividend_1 = await equityFacet.getDividends(1);
      dividend = await equityFacet.getDividends(2);
      expect(dividend_1.snapshotId.toNumber()).to.equal(1);
      expect(dividend.snapshotId.toNumber()).to.equal(2);
    });

    it("GIVEN token is not controllable WHEN controllerTransferByPartition THEN transaction fails with TokenIsNotControllable", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
      await erc1644Facet.connect(signer_A).finalizeControllable();

      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerTransferByPartition(_PARTITION_ID_1, signer_C.address, signer_D.address, amount, data, data),
      ).to.be.revertedWithCustomError(erc1644Facet, "TokenIsNotControllable");
    });

    it("GIVEN token is not controllable WHEN controllerRedeemByPartition THEN transaction fails with TokenIsNotControllable", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
      await erc1644Facet.connect(signer_A).finalizeControllable();

      await expect(
        erc1410Facet
          .connect(signer_C)
          .controllerRedeemByPartition(_PARTITION_ID_1, signer_C.address, amount, data, data),
      ).to.be.revertedWithCustomError(erc1644Facet, "TokenIsNotControllable");
    });

    describe("Adjust balances", () => {
      beforeEach(async () => {
        operatorTransferData = {
          partition: _PARTITION_ID_1,
          from: signer_E.address,
          to: signer_D.address,
          value: amount,
          data: data,
          operatorData: operatorData,
        };
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN transaction succeeds", async () => {
        await setPreBalanceAdjustment();

        // Before Values
        const before: BalanceAdjustedValues = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const balanceAdjustmentData = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:00:02Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };

        const balanceAdjustmentData_2 = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:16:40Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        // After Values Before Transaction
        const after: BalanceAdjustedValues = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterBalanceAdjustment(after, before);
      });

      describe("Issues", () => {
        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 IssueByPartition succeeds", async () => {
          await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
          await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
          await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._KYC_ROLE, signer_A.address);

          await grantKycToAccounts();

          await erc1410Facet.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[0],
            data: "0x",
          });
          await erc1410Facet.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[1],
            data: "0x",
          });

          const balanceOf_A_Before = await erc1410Facet.balanceOf(signer_A.address);
          const balanceOf_A_Partition_1_Before = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          // adjustBalances
          await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);
          // issue after adjust
          await erc1410Facet.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[0],
            data: "0x",
          });

          const balanceOf_A_After = await erc1410Facet.balanceOf(signer_A.address);
          const balanceOf_A_Partition_1_After = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balanceOf_A_After).to.be.equal(balanceOf_A_Before.mul(adjustFactor).add(balanceOf_A_Original[0]));
          expect(balanceOf_A_Partition_1_After).to.be.equal(
            balanceOf_A_Partition_1_Before.mul(adjustFactor).add(balanceOf_A_Original[0]),
          );
        });
      });

      describe("Transfers", () => {
        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 transferByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          basicTransferInfo.to = signer_B.address;

          await erc1410Facet.transferByPartition(_PARTITION_ID_1, basicTransferInfo, "0x");

          // After Transaction Partition 1 Values
          const after: BalanceAdjustedValues = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterTransfer(after, before);
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 operatorTransferByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          await erc1410Facet.authorizeOperator(signer_A.address);

          operatorTransferData.from = signer_A.address;
          operatorTransferData.to = signer_B.address;
          operatorTransferData.data = "0x";
          operatorTransferData.operatorData = "0x";

          await erc1410Facet.operatorTransferByPartition(operatorTransferData);

          // After Transaction Partition 1 Values
          const after = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterTransfer(after, before);
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 controllerTransferByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          await erc1410Facet.controllerTransferByPartition(
            _PARTITION_ID_1,
            signer_A.address,
            signer_B.address,
            amount,
            "0x",
            "0x",
          );

          // After Transaction Partition 1 Values
          const after = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterTransfer(after, before);
        });
      });

      describe("Redeems", () => {
        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 redeemByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          await erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount, "0x");

          // After Transaction Partition 1 Values
          const after = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterRedeem(after, before);
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 redeemByPartition with the expected adjusted amount succeeds", async () => {
          await setPreBalanceAdjustment();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          await expect(erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount * adjustFactor, data))
            .to.emit(erc1410Facet, "RedeemedByPartition")
            .withArgs(_PARTITION_ID_1, ADDRESS_ZERO, signer_A.address, amount * adjustFactor, data, "0x");
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 operatorRedeemByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          await erc1410Facet.authorizeOperator(signer_A.address);
          await erc1410Facet.operatorRedeemByPartition(_PARTITION_ID_1, signer_A.address, amount, "0x", "0x");

          // After Transaction Partition 1 Values
          const after = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterRedeem(after, before);
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 operatorRedeemByPartition with the expected adjusted amount succeeds", async () => {
          await setPreBalanceAdjustment();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          const adjustAmount = amount * adjustFactor;

          // Transaction Partition 1
          await erc1410Facet.authorizeOperator(signer_A.address);
          await expect(
            erc1410Facet.operatorRedeemByPartition(_PARTITION_ID_1, signer_A.address, adjustAmount, data, "0x"),
          )
            .to.emit(erc1410Facet, "RedeemedByPartition")
            .withArgs(_PARTITION_ID_1, signer_A.address, signer_A.address, adjustAmount, data, "0x");
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 controllerRedeemByPartition succeeds", async () => {
          await setPreBalanceAdjustment();

          // Before Values
          const before = await getBalanceAdjustedValues();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          // Transaction Partition 1
          await erc1410Facet.controllerRedeemByPartition(_PARTITION_ID_1, signer_A.address, amount, "0x", "0x");

          // After Transaction Partition 1 Values
          const after = await getBalanceAdjustedValues();

          await checkAdjustmentsAfterRedeem(after, before);
        });

        it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1410 controllerRedeemByPartition with the expected adjusted amount succeeds", async () => {
          await setPreBalanceAdjustment();

          // adjustBalances
          await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

          const adjustAmount = amount * adjustFactor;

          // Transaction Partition 1
          await expect(
            erc1410Facet.controllerRedeemByPartition(_PARTITION_ID_1, signer_A.address, adjustAmount, "0x", "0x"),
          )
            .to.emit(erc1410Facet, "RedeemedByPartition")
            .withArgs(_PARTITION_ID_1, signer_A.address, signer_A.address, adjustAmount, "0x", "0x");
        });
      });
    });

    it("GIVEN an unprotected partitions equity WHEN performing a protected transfer THEN transaction fails with PartitionsAreUnProtected", async () => {
      await expect(
        erc1410Facet
          .connect(signer_B)
          .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
            deadline: 1,
            nounce: 0,
            signature: "0x1234",
          }),
      ).to.be.rejectedWith("PartitionsAreUnProtected");
    });

    it("GIVEN an unprotected partitions equity WHEN performing a protected redeem THEN transaction fails with PartitionsAreUnProtected", async () => {
      await expect(
        erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
          deadline: 1,
          nounce: 0,
          signature: "0x1234",
        }),
      ).to.be.rejectedWith("PartitionsAreUnProtected");
    });
    describe("Protected Partitions Tests", () => {
      let protectedPartitionsFacet: ProtectedPartitionsFacet;
      let controlListFacet: ControlListFacet;

      async function protectedPartitionsFixture() {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await protectedPartitionsFacet.connect(signer_A).protectPartitions();
        await ssiManagementFacet.connect(signer_A).addIssuer(signer_B.address);
        await kycFacet.connect(signer_B).grantKyc(signer_B.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_B.address);
        await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
        await kycFacet.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
      }

      beforeEach(async () => {
        // Initialize protected partitions
        protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitionsFacet", diamond.address);
        controlListFacet = await ethers.getContractAt("ControlListFacet", diamond.address);
        await loadFixture(protectedPartitionsFixture);
      });
      async function grant_WILD_CARD_ROLE_and_issue_tokens(
        wildCard_Account: string,
        issue_Account: string,
        issue_Amount: number,
        issue_Partition: string,
      ) {
        accessControlFacet = accessControlFacet.connect(signer_A);
        await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, wildCard_Account);

        await erc1410Facet.issueByPartition({
          partition: issue_Partition,
          tokenHolder: issue_Account,
          value: issue_Amount,
          data: "0x",
        });
      }
      it("GIVEN protected partitions without wildcard role WHEN operatorTransferByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          erc1410Facet.connect(signer_C).operatorTransferByPartition(operatorTransferData),
        ).to.be.rejectedWith("PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions without wildcard role WHEN operatorRedeemByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await erc1410Facet.connect(signer_E).authorizeOperator(signer_C.address);

        await expect(
          erc1410Facet
            .connect(signer_C)
            .operatorRedeemByPartition(_PARTITION_ID_1, signer_E.address, amount, data, operatorData),
        ).to.be.rejectedWith("PartitionsAreProtectedAndNoRole");
      });
      describe("protectedTransferFromByPartition", () => {
        it("GIVEN a paused security role WHEN performing a protected transfer THEN transaction fails with Paused", async () => {
          await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);

          await pauseFacet.connect(signer_B).pause();

          await expect(
            erc1410Facet.protectedTransferFromByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_B.address,
              amount,
              {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              },
            ),
          ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
        });

        it("GIVEN a security with clearing active WHEN performing a protected transfer THEN transaction fails with ClearingIsActivated", async () => {
          await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);
          await clearingActionsFacet.activateClearing();

          await expect(
            erc1410Facet.protectedTransferFromByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_B.address,
              amount,
              {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              },
            ),
          ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
        });

        it("GIVEN a account without the participant role WHEN performing a protected transfer THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            erc1410Facet
              .connect(signer_C)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.rejectedWith("AccountHasNoRole");
        });

        it("GIVEN a blacklisted account WHEN performing a protected transfer from it THEN transaction fails with AccountIsBlocked", async () => {
          await controlListFacet.connect(signer_B).addToControlList(signer_A.address);

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
        });

        it("GIVEN a blacklisted account WHEN performing a protected transfer to it THEN transaction fails with AccountIsBlocked", async () => {
          await controlListFacet.connect(signer_B).addToControlList(signer_B.address);

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
        });

        it("GIVEN a non kyc account WHEN performing a protected transfer from or to THEN transaction fails with InvalidKycStatus", async () => {
          await kycFacet.connect(signer_B).revokeKyc(signer_A.address);

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
        });
        it("GIVEN a wrong deadline WHEN performing a protected transfer THEN transaction fails with ExpiredDeadline", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: 1,
                nounce: 1,
                signature: "0x1234",
              }),
          ).to.be.rejectedWith("ExpiredDeadline");
        });

        it("GIVEN a wrong signature length WHEN performing a protected transfer THEN transaction fails with WrongSignatureLength", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature: "0x01",
              }),
          ).to.be.rejectedWith("WrongSignatureLength");
        });

        it("GIVEN a wrong signature WHEN performing a protected transfer THEN transaction fails with WrongSignature", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: MAX_UINT256,
                nounce: 1,
                signature:
                  "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
              }),
          ).to.be.rejectedWith("WrongSignature");
        });

        it("GIVEN a wrong nounce WHEN performing a protected transfer THEN transaction fails with WrongNounce", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          const deadline = MAX_UINT256;

          await expect(
            erc1410Facet
              .connect(signer_B)
              .protectedTransferFromByPartition(DEFAULT_PARTITION, signer_A.address, signer_B.address, amount, {
                deadline: deadline,
                nounce: 0,
                signature: "0x1234",
              }),
          ).to.be.rejectedWith("WrongNounce");
        });
      });

      describe("protectedRedeemFromByPartition", () => {
        it("GIVEN a paused security role WHEN performing a protected redeem THEN transaction fails with Paused", async () => {
          await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);
          await pauseFacet.connect(signer_B).pause();

          await expect(
            erc1410Facet.protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x1234",
            }),
          ).to.be.rejectedWith("TokenIsPaused");
        });

        it("GIVEN a security with clearing active WHEN performing a protected redeem THEN transaction fails with ClearingIsActivated", async () => {
          await grant_WILD_CARD_ROLE_and_issue_tokens(signer_B.address, signer_B.address, amount, DEFAULT_PARTITION);
          await clearingActionsFacet.activateClearing();

          await expect(
            erc1410Facet.protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(clearingInterface, "ClearingIsActivated");
        });

        it("GIVEN a account without the participant role WHEN performing a protected redeem THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            erc1410Facet.connect(signer_C).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x1234",
            }),
          ).to.be.rejectedWith("AccountHasNoRole");
        });

        it("GIVEN a blacklisted account WHEN performing a protected redeem from it THEN transaction fails with AccountIsBlocked", async () => {
          await controlListFacet.connect(signer_B).addToControlList(signer_A.address);

          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x1234",
            }),
          ).to.be.rejectedWith("AccountIsBlocked");
        });

        it("GIVEN a non kyc account WHEN performing a protected redeem from THEN transaction fails with InvalidKycStatus", async () => {
          await kycFacet.connect(signer_B).revokeKyc(signer_A.address);

          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x1234",
            }),
          ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
        });

        it("GIVEN a wrong deadline WHEN performing a protected redeem THEN transaction fails with ExpiredDeadline", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: 1,
              nounce: 0,
              signature: "0x1234",
            }),
          ).to.be.rejectedWith("ExpiredDeadline");
        });
        it("GIVEN a wrong signature length WHEN performing a protected redeem THEN transaction fails with WrongSignatureLength", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature: "0x01",
            }),
          ).to.be.rejectedWith("WrongSignatureLength");
        });

        it("GIVEN a wrong signature WHEN performing a protected redeem THEN transaction fails with WrongSignature", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: MAX_UINT256,
              nounce: 1,
              signature:
                "0x0011223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344112233441122334411223344",
            }),
          ).to.be.rejectedWith("WrongSignature");
        });

        it("GIVEN a wrong nounce WHEN performing a protected redeem THEN transaction fails with WrongNounce", async () => {
          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });
          const deadline = MAX_UINT256;

          await expect(
            erc1410Facet.connect(signer_B).protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: deadline,
              nounce: 0,
              signature: "0x1234",
            }),
          ).to.be.rejectedWith("WrongNounce");
        });

        it("GIVEN a correct signature WHEN performing a protected redeem THEN transaction succeeds", async () => {
          const deadline = MAX_UINT256;

          const message = {
            _partition: DEFAULT_PARTITION,
            _from: signer_A.address,
            _amount: amount,
            _deadline: deadline,
            _nounce: 1,
          };
          const domain = {
            name: (await erc20Facet.getERC20Metadata()).info.name,
            version: (await diamondCutFacet.getConfigInfo()).version_.toString(),
            chainId: await network.provider.send("eth_chainId"),
            verifyingContract: diamond.address,
          };

          const redeemType = {
            protectedRedeemFromByPartition: [
              { name: "_partition", type: "bytes32" },
              { name: "_from", type: "address" },
              { name: "_amount", type: "uint256" },
              { name: "_deadline", type: "uint256" },
              { name: "_nounce", type: "uint256" },
            ],
          };

          /*const domainSeparator =
                    ethers.utils._TypedDataEncoder.hashDomain(domain)
                const messageHash = ethers.utils._TypedDataEncoder.hash(
                    domain,
                    transferType,
                    message
                )*/

          // Sign the message hash
          const signature = await signer_A._signTypedData(domain, redeemType, message);

          await erc1410Facet.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          await erc1410Facet
            .connect(signer_B)
            .protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_A.address, amount, {
              deadline: deadline,
              nounce: 1,
              signature: signature,
            });
        });
      });
    });
  });
  describe("Single partition ", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(erc1410Facet.initialize_ERC1410(false)).to.be.rejectedWith("AlreadyInitialized");
    });

    it("GIVEN a single-partition token WHEN checking isMultiPartition THEN returns false", async () => {
      const isMulti = await erc1410Facet.isMultiPartition();
      expect(isMulti).to.be.equal(false);
    });

    it("GIVEN an account with balance WHEN checking balanceOfAt for a past timestamp THEN returns the balance at that timestamp", async () => {
      // Schedule a snapshot
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_C.address);
      const currentTime = await timeTravelFacet.blockTimestamp();
      const snapshotTime = currentTime.add(100);
      await snapshotsFacet.connect(signer_C).takeSnapshot();

      // Advance time to snapshot
      await timeTravelFacet.changeSystemTimestamp(snapshotTime);

      const erc1410ReadFacet = await ethers.getContractAt("ERC1410ReadFacet", diamond.address);
      // Check balance at snapshot time
      const balanceAt = await erc1410ReadFacet.balanceOfAt(signer_C.address, snapshotTime);
      const currentBalance = await erc1410ReadFacet.balanceOf(signer_C.address);
      expect(balanceAt).to.be.equal(currentBalance);
    });

    it("GIVEN initialized erc1410 token WHEN don not use default partition THEN fails with InvalidPartition", async () => {
      await expect(erc1410Facet.transferByPartition(_PARTITION_ID, basicTransferInfo, data))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(
        erc1410Facet.controllerTransferByPartition(
          _PARTITION_ID,
          signer_C.address,
          signer_D.address,
          amount,
          data,
          data,
        ),
      )
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(erc1410Facet.controllerRedeemByPartition(_PARTITION_ID, signer_D.address, amount, data, data))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      // TODO canTransferByPartition
      operatorTransferData.partition = _PARTITION_ID;
      operatorTransferData.from = signer_C.address;
      operatorTransferData.operatorData = data;
      await expect(erc1410Facet.operatorTransferByPartition(operatorTransferData))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(erc1410Facet.authorizeOperatorByPartition(_PARTITION_ID, signer_C.address))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(erc1410Facet.revokeOperatorByPartition(_PARTITION_ID, signer_C.address))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(erc1410Facet.redeemByPartition(_PARTITION_ID, amount, data))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(erc1410Facet.operatorRedeemByPartition(_PARTITION_ID, signer_C.address, amount, data, data))
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      await expect(
        erc1410Facet.issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_C.address,
          value: amount,
          data: data,
        }),
      )
        .to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(_PARTITION_ID);
      // TODO canRedeemByPartition
    });

    describe("Issues", async () => {
      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 Issue succeeds", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._KYC_ROLE, signer_A.address);

        await grantKycToAccounts();

        await erc1594Facet.connect(signer_A).issue(signer_A.address, balanceOf_A_Original[0], "0x");

        const balanceOf_A_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balanceOf_A_Partition_1_Before = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // issue after adjust
        await erc1594Facet.connect(signer_A).issue(signer_A.address, balanceOf_A_Original[0], "0x");

        const balanceOf_A_After = await erc1410Facet.balanceOf(signer_A.address);
        const balanceOf_A_Partition_1_After = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balanceOf_A_After).to.be.equal(balanceOf_A_Before.mul(adjustFactor).add(balanceOf_A_Original[0]));
        expect(balanceOf_A_Partition_1_After).to.be.equal(
          balanceOf_A_Partition_1_Before.mul(adjustFactor).add(balanceOf_A_Original[0]),
        );
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 Issue with max supply succeeds", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._KYC_ROLE, signer_A.address);

        await grantKycToAccounts();

        await capFacet.connect(signer_A).setMaxSupply(balanceOf_A_Original[1]);

        await erc1594Facet.connect(signer_A).issue(signer_A.address, balanceOf_A_Original[0], "0x");

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // issue after adjust
        await expect(erc1594Facet.connect(signer_A).issue(signer_A.address, balanceOf_A_Original[0], "0x"))
          .to.emit(erc1594Facet, "Issued")
          .withArgs(signer_A.address, signer_A.address, balanceOf_A_Original[0], "0x");
      });
    });

    describe("Transfers", async () => {
      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1644 controllerTransfer succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await erc1644Facet.connect(signer_A).controllerTransfer(signer_A.address, signer_B.address, amount, "0x", "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterTransfer(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 transferWithData succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await expect(erc1594Facet.connect(signer_A).transferWithData(signer_B.address, amount, "0x"))
          .to.emit(erc1594Facet, "TransferWithData")
          .withArgs(signer_A.address, signer_B.address, amount, "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterTransfer(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 transferFromWithData succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_A.address, amount);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await expect(
          erc1594Facet.connect(signer_A).transferFromWithData(signer_A.address, signer_B.address, amount, "0x"),
        )
          .to.emit(erc1594Facet, "TransferFromWithData")
          .withArgs(signer_A.address, signer_A.address, signer_B.address, amount, "0x");
        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterTransfer(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 transferFromWithData with expected allowance amount succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_A.address, amount);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const expectedAllowance = amount * adjustFactor;

        // Transaction Partition 1
        await erc1594Facet
          .connect(signer_A)
          .transferFromWithData(signer_A.address, signer_B.address, expectedAllowance, "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        expect(after.balanceOf_A).to.equal(before.balanceOf_A.mul(adjustFactor).sub(expectedAllowance));
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 canTransfer succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        expect(
          await erc1594Facet.connect(signer_A).canTransfer(signer_B.address, adjustFactor * amount, "0x"),
        ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.constants.HashZero]);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 canTransferByPartition succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        expect(
          await erc1410Facet.canTransferByPartition(
            signer_A.address,
            signer_B.address,
            _PARTITION_ID_1,
            adjustFactor * amount,
            "0x",
            "0x",
          ),
        ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.constants.HashZero]);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 canTransferFrom succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_A.address, amount);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        expect(
          await erc1594Facet
            .connect(signer_A)
            .canTransferFrom(signer_A.address, signer_B.address, adjustFactor * amount, "0x"),
        ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.constants.HashZero]);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC20 transfer succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await erc20Facet.connect(signer_A).transfer(signer_B.address, amount);

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterTransfer(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC20 transferFrom succeeds", async () => {
        await setPreBalanceAdjustment(true);

        const before = await getBalanceAdjustedValues();

        await erc20Facet.connect(signer_A).approve(signer_B.address, before.balanceOf_A);

        // Before Values

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1 with updated balance
        const updatedBalance = before.balanceOf_A.mul(adjustFactor);

        await erc20Facet.connect(signer_B).transferFrom(signer_A.address, signer_B.address, updatedBalance);

        // // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        expect(after.balanceOf_A).to.equal(0);
      });
    });

    describe("Redeems", async () => {
      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1644 controllerRedeem succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await erc1644Facet.controllerRedeem(signer_A.address, amount, "0x", "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterRedeem(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1644 controllerRedeem with the expected adjusted amount succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const adjustAmount = amount * adjustFactor;

        // Transaction Partition 1
        await expect(erc1644Facet.controllerRedeem(signer_A.address, adjustAmount, "0x", "0x"))
          .to.emit(erc1644Facet, "ControllerRedemption")
          .withArgs(signer_A.address, signer_A.address, adjustAmount, "0x", "0x");
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 redeem succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1

        await erc1594Facet.connect(signer_A).redeem(amount, "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterRedeem(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 redeem with the expected adjusted amount succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const adjustAmount = amount * adjustFactor;

        // Transaction Partition 1
        await expect(erc1594Facet.connect(signer_A).redeem(adjustAmount, "0x"))
          .to.emit(erc1594Facet, "Redeemed")
          .withArgs(ADDRESS_ZERO, signer_A.address, adjustAmount, "0x");
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 redeemFrom succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_A.address, amount);

        // Before Values
        const before = await getBalanceAdjustedValues();

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // Transaction Partition 1
        await erc1594Facet.connect(signer_A).redeemFrom(signer_A.address, amount, "0x");

        // After Transaction Partition 1 Values
        const after = await getBalanceAdjustedValues();

        await checkAdjustmentsAfterRedeem(after, before);
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC1594 redeemFrom with the expected adjusted amount succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_A.address, amount);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const adjustAmount = amount * adjustFactor;

        // Transaction Partition 1
        await expect(erc1594Facet.connect(signer_A).redeemFrom(signer_A.address, adjustAmount, "0x"))
          .to.emit(erc1594Facet, "Redeemed")
          .withArgs(signer_A.address, signer_A.address, adjustAmount, "0x");
      });
    });

    describe("Allowances", () => {
      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC20 allowance succeeds", async () => {
        await setPreBalanceAdjustment(true);

        await erc20Facet.connect(signer_A).approve(signer_B.address, amount);

        const allowance_Before = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        const allowance_After = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        expect(allowance_After).to.be.equal(allowance_Before.mul(adjustFactor));
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC20 increaseAllowance succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // APPROVE 1
        await erc20Facet.connect(signer_A).approve(signer_B.address, amount);

        const allowance_Before = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // APPROVE 2
        await erc20Facet.connect(signer_A).increaseAllowance(signer_B.address, amount);

        const allowance_After = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        expect(allowance_After).to.be.equal(allowance_Before.mul(adjustFactor).add(amount));
      });

      it("GIVEN an account with adjustBalances role WHEN adjustBalances THEN ERC20 decreaseAllowance succeeds", async () => {
        await setPreBalanceAdjustment(true);

        // APPROVE 1
        await erc20Facet.connect(signer_A).approve(signer_B.address, amount);

        const allowance_Before = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // APPROVE 2
        await erc20Facet.connect(signer_A).decreaseAllowance(signer_B.address, allowance_Before.add(amount));

        const allowance_After = await erc20Facet.connect(signer_A).allowance(signer_A.address, signer_B.address);

        expect(allowance_After).to.be.equal(allowance_Before.mul(adjustFactor).sub(allowance_Before.add(amount)));
      });
    });
  });
});
