// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress, parseUnits } from "ethers";
import { deployLifeCycleCashFlowContracts, deployPrecompiledMock } from "../scripts/deploy";
import DeployContractCommand from "../scripts/commands/DeployContractCommand";
import { type LifeCycleCashFlowTimeTravel } from "../typechain-types/contracts/test/testTimeTravel/LifeCycleCashFlowTimeTravel";
import {
  DEFAULT_ADMIN_ROLE,
  PAUSER_ROLE,
  PAYOUT_ROLE,
  CASHOUT_ROLE,
  TRANSFERER_ROLE,
  PAYMENT_TOKEN_MANAGER_ROLE,
} from "../scripts/constants";

const assetInitialPaymentDate = 1753874807;
const assetPaymentRequestDate = 1749247100;
const bondCashoutInitialDate = 1761823607;
const bondCashoutRequestDate = 1749765500;

let stablecoin;
let signer_A, signer_B;

let lifeCycleCashFlow: LifeCycleCashFlowTimeTravel;
let lifeCycleCashFlowAddress: string;
let amountToBePaid;
let stablecoinMock;
let assetMock;

enum AssetType {
  BOND_VARIABLE_RATE = 0,
  EQUITY = 1,
  BOND_FIXED_RATE = 2,
  BOND_KPI_LINKED_RATE = 3,
  BOND_SPT_RATE = 4,
}

describe("Security operations", () => {
  [
    AssetType.BOND_VARIABLE_RATE,
    AssetType.BOND_FIXED_RATE,
    AssetType.BOND_KPI_LINKED_RATE,
    AssetType.BOND_SPT_RATE,
    AssetType.EQUITY,
  ].forEach((assetType) => {
    describe(`Security operations with assetType: ${assetType}`, () => {
      let asset_A, asset_B;
      let rbacList;

      before(() => {
        // mute | mock console.log
        console.log = () => {};
      });

      beforeEach(async () => {
        await deployPrecompiledMock();

        amountToBePaid = assetType == AssetType.EQUITY ? "10000" : "10000";

        [signer_A, signer_B] = await ethers.getSigners();

        assetMock = await ethers.getContractFactory("AssetMock");
        asset_A = await assetMock.deploy(assetType, true, 100);

        asset_B = await assetMock.deploy(assetType, true, 100);

        stablecoinMock = await ethers.getContractFactory("StablecoinMock");
        stablecoin = await stablecoinMock.deploy(false, false);

        rbacList = [
          {
            role: DEFAULT_ADMIN_ROLE,
            members: [await signer_A.getAddress()],
          },
          {
            role: PAUSER_ROLE,
            members: [await signer_A.getAddress()],
          },
          {
            role: PAYOUT_ROLE,
            members: [await signer_A.getAddress()],
          },
          {
            role: CASHOUT_ROLE,
            members: [await signer_A.getAddress()],
          },
          {
            role: TRANSFERER_ROLE,
            members: [await signer_A.getAddress()],
          },
          {
            role: PAYMENT_TOKEN_MANAGER_ROLE,
            members: [await signer_A.getAddress()],
          },
        ];
        const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
          new DeployContractCommand({
            name: "LifeCycleCashFlowTimeTravel",
            signer: signer_A,
            args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
          }),
        );

        lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

        lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);
      });

      describe("Deploy a LifeCycleCashFlow contract", () => {
        it("A LifeCycleCashFlow contract cannot be deployed with an invalid payment token", async () => {
          await expect(
            deployLifeCycleCashFlowContracts(
              new DeployContractCommand({
                name: "LifeCycleCashFlowTimeTravel",
                signer: signer_A,
                args: [await asset_A.getAddress(), ZeroAddress, rbacList],
              }),
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidPaymentToken")
            .withArgs(ZeroAddress);
        });

        it("A LifeCycleCashFlow contract cannot be initialized twice", async () => {
          await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_A);

          await expect(
            lifeCycleCashFlow.initialize(await asset_A.getAddress(), await stablecoin.getAddress(), rbacList),
          ).to.be.revertedWith("Initializable: contract is already initialized");
        });
      });

      describe("Pause a LifeCycleCashFlow contract", () => {
        it("An account not granted the _PAUSER_ROLE cannot pause the contract", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.pause())
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAUSER_ROLE);
        });

        it("An account granted the _PAUSER_ROLE can pause the contract", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
        });

        it("An account granted the _PAUSER_ROLE cannot pause the contract twice", async () => {
          await lifeCycleCashFlow.pause();

          await expect(lifeCycleCashFlow.pause()).to.be.revertedWithCustomError(
            lifeCycleCashFlow,
            "LifeCycleCashFlowIsPaused",
          );
        });
      });

      describe("Unpause a LifeCycleCashFlow contract", () => {
        it("An account not granted the _PAUSER_ROLE cannot unpause the contract", async () => {
          await lifeCycleCashFlow.pause();

          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.unpause())
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAUSER_ROLE);
        });

        it("An account granted the _PAUSER_ROLE can unpause the contract", async () => {
          await lifeCycleCashFlow.pause();
          await lifeCycleCashFlow.unpause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.false;
        });

        it("An account granted the _PAUSER_ROLE cannot unpause the contract twice", async () => {
          await lifeCycleCashFlow.pause();
          await lifeCycleCashFlow.unpause();

          await expect(lifeCycleCashFlow.unpause()).to.be.revertedWithCustomError(
            lifeCycleCashFlow,
            "LifeCycleCashFlowIsUnpaused",
          );
        });
      });

      describe("Grant role", () => {
        it("An account cannot grant a role if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          await expect(
            lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress()),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the DEFAULT_ADMIN_ROLE cannot grant a role", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), DEFAULT_ADMIN_ROLE);
        });

        it("An account granted the DEFAULT_ADMIN_ROLE cannot grant a role twice", async () => {
          await lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress());

          await expect(lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountAssignedToRole")
            .withArgs(PAUSER_ROLE, await signer_B.getAddress());
        });

        it("An account granted the DEFAULT_ADMIN_ROLE can grant a role", async () => {
          await expect(lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress()))
            .to.emit(lifeCycleCashFlow, "RoleGranted")
            .withArgs(await signer_A.getAddress(), await signer_B.getAddress(), PAUSER_ROLE);

          expect(await lifeCycleCashFlow.hasRole(PAUSER_ROLE, await signer_B.getAddress())).to.be.true;
        });
      });

      describe("Revoke role", () => {
        it("An account cannot revoke a role if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          await expect(
            lifeCycleCashFlow.revokeRole(PAUSER_ROLE, await signer_B.getAddress()),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the DEFAULT_ADMIN_ROLE cannot revoke a role", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.revokeRole(PAUSER_ROLE, await signer_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), DEFAULT_ADMIN_ROLE);
        });

        it("An account granted the DEFAULT_ADMIN_ROLE cannot revoke a role twice", async () => {
          await lifeCycleCashFlow.grantRole(PAUSER_ROLE, await signer_B.getAddress());

          await lifeCycleCashFlow.revokeRole(PAUSER_ROLE, await signer_B.getAddress());
          await expect(lifeCycleCashFlow.revokeRole(PAUSER_ROLE, await signer_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountNotAssignedToRole")
            .withArgs(PAUSER_ROLE, await signer_B.getAddress());
        });

        it("An account granted the DEFAULT_ADMIN_ROLE can revoke a role", async () => {
          await expect(lifeCycleCashFlow.revokeRole(PAUSER_ROLE, await signer_A.getAddress()))
            .to.emit(lifeCycleCashFlow, "RoleRevoked")
            .withArgs(await signer_A.getAddress(), await signer_A.getAddress(), PAUSER_ROLE);

          expect(await lifeCycleCashFlow.hasRole(PAUSER_ROLE, await signer_A.getAddress())).to.be.false;
        });
      });

      describe("Renounce role", () => {
        it("An account cannot renounce a role if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          await expect(lifeCycleCashFlow.renounceRole(PAUSER_ROLE)).to.be.revertedWithCustomError(
            lifeCycleCashFlow,
            "LifeCycleCashFlowIsPaused",
          );
        });

        it("An account granted the DEFAULT_ADMIN_ROLE can renounce a role", async () => {
          await expect(lifeCycleCashFlow.renounceRole(PAUSER_ROLE))
            .to.emit(lifeCycleCashFlow, "RoleRenounced")
            .withArgs(await signer_A.getAddress(), PAUSER_ROLE);

          expect(await lifeCycleCashFlow.hasRole(PAUSER_ROLE, await signer_A.getAddress())).to.be.false;
        });

        it("An account granted the DEFAULT_ADMIN_ROLE cannot renounce a role twice", async () => {
          await lifeCycleCashFlow.renounceRole(PAUSER_ROLE);
          await expect(lifeCycleCashFlow.renounceRole(PAUSER_ROLE))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountNotAssignedToRole")
            .withArgs(PAUSER_ROLE, await signer_A.getAddress());
        });
      });

      describe("Has role", () => {
        it("An account can check whether has a role", async () => {
          expect(await lifeCycleCashFlow.hasRole(PAYOUT_ROLE, await signer_A.getAddress())).to.be.true;
        });
      });

      describe("getRoleCountFor", () => {
        it("An account can get the number of roles an account is granted", async () => {
          expect(await lifeCycleCashFlow.getRoleCountFor(await signer_A.getAddress())).to.equals(6);
        });
      });

      describe("getRoleMemberCount", () => {
        it("An account can get the number accounts a role is granted", async () => {
          expect(await lifeCycleCashFlow.getRoleMemberCount(PAYOUT_ROLE)).to.equals(1);
        });
      });

      describe("getRoleMembers", () => {
        it("An account cannot get the accounts a role is granted if the page index is the max uint256", async () => {
          expect(
            await lifeCycleCashFlow.getRoleMembers(
              PAYOUT_ROLE,
              115792089237316195423570985008687907853269984665640564039457584007913129639935n,
              10,
            ),
          ).to.deep.equals([]);
        });

        it("An account cannot get the accounts a role is granted if the page index and length do not match an existing account", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 1, 2)).to.deep.equals([]);
        });

        it("An account cannot get the accounts a role is granted if the page index and length do not match an existing account 2", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 0, 2)).to.deep.equals([
            await signer_A.getAddress(),
          ]);
        });

        it("An account han get the accounts a role is granted", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 0, 1)).to.deep.equals([
            await signer_A.getAddress(),
          ]);
        });
      });

      describe("getRolesFor", () => {
        it("An account cannot get the accounts a role is granted if the page index is the max uint256", async () => {
          expect(
            await lifeCycleCashFlow.getRoleMembers(
              PAYOUT_ROLE,
              115792089237316195423570985008687907853269984665640564039457584007913129639935n,
              10,
            ),
          ).to.deep.equals([]);
        });

        it("An account cannot get the accounts a role is granted if the page index and length do not match an existing account", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 1, 2)).to.deep.equals([]);
        });

        it("An account cannot get the accounts a role is granted if the page index and length do not match an existing account 2", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 0, 2)).to.deep.equals([
            await signer_A.getAddress(),
          ]);
        });

        it("An account han get the accounts a role is granted", async () => {
          expect(await lifeCycleCashFlow.getRoleMembers(PAYOUT_ROLE, 0, 1)).to.deep.equals([
            await signer_A.getAddress(),
          ]);
        });
      });

      describe("Distribute a coupon by page", () => {
        it("An account cannot distribute a coupon if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot distribute a coupon", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot distribute a coupon", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account cannot distribute a coupon of an asset not managed by the contract", async () => {
          await expect(lifeCycleCashFlow.executeDistribution(await asset_B.getAddress(), 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot distribute a coupon in a date not matches the execution date", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(assetPaymentRequestDate);

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "NotPaymentDate")
            .withArgs(assetInitialPaymentDate, assetPaymentRequestDate);
        });

        it("An account cannot distribute a coupon to a holder if there is not enough balance", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
        });

        it("An account cannot distribute a coupon if there are no holders", async () => {
          const asset_C = await assetMock.deploy(assetType, false, 100);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlowWithoutHolders = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddressWithoutHolders = resultLifeCycleCashFlowWithoutHolders.proxyAddress;

          let lifeCycleCashFlowWithoutHolders = await ethers.getContractAt(
            "LifeCycleCashFlowTimeTravel",
            lifeCycleCashFlowAddressWithoutHolders,
          );

          lifeCycleCashFlowWithoutHolders = lifeCycleCashFlowWithoutHolders.connect(signer_A);

          await lifeCycleCashFlowWithoutHolders.changeSystemTimestamp(1753874807);

          const result = await lifeCycleCashFlowWithoutHolders.executeDistribution.staticCall(
            await asset_C.getAddress(),
            1,
            1,
            1,
          );

          expect(result.executed_).to.equal(false);
        });

        it("An account cannot distribute a coupon if the transfer fails", async () => {
          const stablecoin = await stablecoinMock.deploy(true, false);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, 10000);

          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);
        });

        it("An account cannot distribute a coupon if the transfer reverts", async () => {
          const stablecoin = await stablecoinMock.deploy(false, true);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);
        });

        it("An account can distribute a coupon to a holder with 0 amount", async () => {
          const asset_C = await assetMock.deploy(assetType, true, 0);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          let lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_A);

          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeDistribution(await asset_C.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [ZeroAddress], [await signer_B.getAddress()], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account can distribute a coupon", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [ZeroAddress], [await signer_B.getAddress()], [amountToBePaid]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });

        it("An account can distribute a coupon in the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [ZeroAddress], [await signer_B.getAddress()], [amountToBePaid]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });

        it("An account cannot distribute a certain coupon to a holder twice", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [ZeroAddress], [await signer_B.getAddress()], [parseUnits(amountToBePaid, 0)]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));

          await expect(lifeCycleCashFlow.executeDistribution(await asset_A.getAddress(), 1, 1, 1))
            .to.emit(lifeCycleCashFlow, "DistributionExecuted")
            .withArgs(1, 1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });
      });

      describe("Distribute a coupon by addresses", () => {
        it("An account cannot distribute a coupon by addresses if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await asset_A.getAddress(),
              await asset_B.getAddress(),
            ]),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot distribute a coupon by addresses", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await asset_A.getAddress(),
              await asset_B.getAddress(),
            ]),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot distribute a coupon by addresses", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await asset_A.getAddress(),
              await asset_B.getAddress(),
            ]),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account cannot distribute a coupon by addresses of an asset not managed by the contract", async () => {
          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_B.getAddress(), 1, [
              await asset_A.getAddress(),
              await asset_B.getAddress(),
            ]),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot distribute a coupon by addresses in a date not matches the execution date", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(assetPaymentRequestDate);

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await asset_A.getAddress(),
              await asset_B.getAddress(),
            ]),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "NotPaymentDate")
            .withArgs(assetInitialPaymentDate, assetPaymentRequestDate);
        });

        it("An account cannot distribute a coupon by addresses to a holder if there is not enough balance", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await signer_B.getAddress(),
            ]),
          )
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(1, [await signer_B.getAddress()], [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
        });

        it("An account cannot distribute a coupon by addresses to a zero address holder", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await expect(lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [ZeroAddress]))
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(1, [ZeroAddress], [], [], []);
        });

        it("An account can distribute a coupon by addresses", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await signer_B.getAddress(),
            ]),
          )
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits(amountToBePaid, 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });

        it("An account can distribute a coupon by addresses if the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await signer_B.getAddress(),
            ]),
          )
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits(amountToBePaid, 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });

        it("An account can distribute a certain coupon by addresses to a holder twice", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(1753874807);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await signer_B.getAddress(),
            ]),
          )
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits(amountToBePaid, 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));

          await expect(
            lifeCycleCashFlow.executeDistributionByAddresses(await asset_A.getAddress(), 1, [
              await signer_B.getAddress(),
            ]),
          )
            .to.emit(lifeCycleCashFlow, "DistributionByAddressesExecuted")
            .withArgs(1, [await signer_B.getAddress()], [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits(amountToBePaid, 0));
        });
      });

      if (assetType != AssetType.EQUITY) {
        describe("Cash out a bond by page", () => {
          it("An account cannot cash out a bond if the contract is paused", async () => {
            await lifeCycleCashFlow.pause();

            expect(await lifeCycleCashFlow.isPaused()).to.be.true;

            await expect(
              lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1),
            ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
          });

          it("An account not not grated the _CASHOUT_ROLE role cannot cash out a bond by page", async () => {
            lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
              .withArgs(await signer_B.getAddress(), CASHOUT_ROLE);
          });

          it("An account with the _CASHOUT_ROLE role revoked cannot cash out a bond", async () => {
            await lifeCycleCashFlow.revokeRole(CASHOUT_ROLE, await signer_A.getAddress());

            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
              .withArgs(await signer_A.getAddress(), CASHOUT_ROLE);
          });

          it("An account cannot cash out a bond not managed by the contract", async () => {
            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_B.getAddress(), 1, 1))
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
              .withArgs(await asset_B.getAddress());
          });

          it("An account cannot cash out a bond in a date does not match the maturity date", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutRequestDate);

            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "NotPaymentDate")
              .withArgs(bondCashoutInitialDate, bondCashoutRequestDate);
          });

          it("An account cannot cash out a bond to a holder if there is not enough balance", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
              .to.emit(lifeCycleCashFlow, "CashOutExecuted")
              .withArgs(1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);

            expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
          });

          it("An account cannot cash out if there are no holders", async () => {
            const asset_C = await assetMock.deploy(assetType, false, 100);

            const rbacList = [
              {
                role: CASHOUT_ROLE,
                members: [await signer_A.getAddress()],
              },
            ];

            const resultLifeCycleCashFlowWithoutHolders = await deployLifeCycleCashFlowContracts(
              new DeployContractCommand({
                name: "LifeCycleCashFlowTimeTravel",
                signer: signer_A,
                args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
              }),
            );

            const lifeCycleCashFlowAddressWithoutHolders = resultLifeCycleCashFlowWithoutHolders.proxyAddress;

            let lifeCycleCashFlowWithoutHolders = await ethers.getContractAt(
              "LifeCycleCashFlowTimeTravel",
              lifeCycleCashFlowAddressWithoutHolders,
            );

            lifeCycleCashFlowWithoutHolders = lifeCycleCashFlowWithoutHolders.connect(signer_A);

            await lifeCycleCashFlowWithoutHolders.changeSystemTimestamp(bondCashoutInitialDate);

            const result = await lifeCycleCashFlowWithoutHolders.executeBondCashOut.staticCall(
              await asset_C.getAddress(),
              1,
              1,
            );

            expect(result.executed_).to.equal(false);
          });

          it("An account can cash out a bond if the contract is unpaused", async () => {
            await lifeCycleCashFlow.pause();
            expect(await lifeCycleCashFlow.isPaused()).to.be.true;
            await lifeCycleCashFlow.unpause();
            expect(await lifeCycleCashFlow.isPaused()).to.be.false;

            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

            await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
              .to.emit(lifeCycleCashFlow, "CashOutExecuted")
              .withArgs(1, 1, [ZeroAddress], [await signer_B.getAddress()], [parseUnits("10000", 0)]);

            expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("10000", 0));
          });
        });

        it("An account cannot cash out a bond if the transfer fails", async () => {
          const stablecoin = await stablecoinMock.deploy(false, true);

          const rbacList = [
            {
              role: CASHOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, parseUnits("10000", 0));

          await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

          await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
            .to.emit(lifeCycleCashFlow, "CashOutExecuted")
            .withArgs(1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account cannot cash out a bond if the transfer reverts", async () => {
          const stablecoin = await stablecoinMock.deploy(false, true);

          const rbacList = [
            {
              role: CASHOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, parseUnits("10000", 0));

          await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

          await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
            .to.emit(lifeCycleCashFlow, "CashOutExecuted")
            .withArgs(1, 1, [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account can cash out a bond with 0 amount", async () => {
          const asset_C = await assetMock.deploy(assetType, true, 0);

          const rbacList = [
            {
              role: CASHOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          let lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_A);

          await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeBondCashOut(await asset_C.getAddress(), 1, 1))
            .to.emit(lifeCycleCashFlow, "CashOutExecuted")
            .withArgs(1, 1, [ZeroAddress], [await signer_B.getAddress()], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account can cash out a bond", async () => {
          await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeBondCashOut(await asset_A.getAddress(), 1, 1))
            .to.emit(lifeCycleCashFlow, "CashOutExecuted")
            .withArgs(1, 1, [ZeroAddress], [await signer_B.getAddress()], [parseUnits("10000", 0)]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("10000", 0));
        });

        describe("Cash out a bond by addresses", () => {
          it("An account cannot cash out a bond by addresses if the contract is paused", async () => {
            await lifeCycleCashFlow.pause();

            expect(await lifeCycleCashFlow.isPaused()).to.be.true;

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await asset_A.getAddress(),
                await asset_B.getAddress(),
              ]),
            ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
          });

          it("An account not not grated the _CASHOUT_ROLE role cannot cash out a bond by addresses by page", async () => {
            lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await asset_A.getAddress(),
                await asset_B.getAddress(),
              ]),
            )
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
              .withArgs(await signer_B.getAddress(), CASHOUT_ROLE);
          });

          it("An account with the _CASHOUT_ROLE role revoked cannot cash out a bond by addresses", async () => {
            await lifeCycleCashFlow.revokeRole(CASHOUT_ROLE, await signer_A.getAddress());

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await asset_A.getAddress(),
                await asset_B.getAddress(),
              ]),
            )
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
              .withArgs(await signer_A.getAddress(), CASHOUT_ROLE);
          });

          it("An account cannot cash out a bond by addresses not managed by the contract", async () => {
            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_B.getAddress(), [
                await asset_A.getAddress(),
                await asset_B.getAddress(),
              ]),
            )
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
              .withArgs(await asset_B.getAddress());
          });

          it("An account cannot cash out a bond by addresses in a date does not match the maturity date", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutRequestDate);

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await asset_A.getAddress(),
                await asset_B.getAddress(),
              ]),
            )
              .to.be.revertedWithCustomError(lifeCycleCashFlow, "NotPaymentDate")
              .withArgs(bondCashoutInitialDate, bondCashoutRequestDate);
          });

          it("An account cannot cash out by addresses a bond to a holder if there is not enough balance", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await signer_B.getAddress(),
              ]),
            )
              .to.emit(lifeCycleCashFlow, "CashOutByAddressesExecuted")
              .withArgs([await signer_B.getAddress()], [await signer_B.getAddress()], [ZeroAddress], [0]);

            expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
          });

          it("An account cannot cash out by addresses a bond if the contract is unpaused", async () => {
            await lifeCycleCashFlow.pause();
            expect(await lifeCycleCashFlow.isPaused()).to.be.true;
            await lifeCycleCashFlow.unpause();
            expect(await lifeCycleCashFlow.isPaused()).to.be.false;

            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await signer_B.getAddress(),
              ]),
            )
              .to.emit(lifeCycleCashFlow, "CashOutByAddressesExecuted")
              .withArgs(
                [await signer_B.getAddress()],
                [ZeroAddress],
                [await signer_B.getAddress()],
                [parseUnits("10000", 0)],
              );

            expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("10000", 0));
          });

          it("An account cannot cash out by addresses to a zero address holder", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await expect(lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [ZeroAddress]))
              .to.emit(lifeCycleCashFlow, "CashOutByAddressesExecuted")
              .withArgs([ZeroAddress], [], [], []);
          });

          it("An account can cash out by addresses a bond", async () => {
            await lifeCycleCashFlow.changeSystemTimestamp(bondCashoutInitialDate);

            await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

            await expect(
              lifeCycleCashFlow.executeBondCashOutByAddresses(await asset_A.getAddress(), [
                await signer_B.getAddress(),
              ]),
            )
              .to.emit(lifeCycleCashFlow, "CashOutByAddressesExecuted")
              .withArgs(
                [await signer_B.getAddress()],
                [ZeroAddress],
                [await signer_B.getAddress()],
                [parseUnits("10000", 0)],
              );

            expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("10000", 0));
          });
        });
      }

      describe("Pay amount snapshot", () => {
        it("An account cannot pay the holders a snapshot by amount if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot pay the holders a snapshot by amount", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot pay the holders a snapshot by amount", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account granted the _PAYOUT_ROLE cannot pay the holders a snapshot by amount of an asset not managed by the contract", async () => {
          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_B.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot pay a snapshot to a holder if there is not enough balance", async () => {
          await expect(
            lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("100", 0)),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("100", 0),
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [ZeroAddress, ZeroAddress],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account cannot pay a snapshot if there are no holders", async () => {
          const asset_C = await assetMock.deploy(assetType, false, 100);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlowWithoutHolders = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddressWithoutHolders = resultLifeCycleCashFlowWithoutHolders.proxyAddress;

          let lifeCycleCashFlowWithoutHolders = await ethers.getContractAt(
            "LifeCycleCashFlowTimeTravel",
            lifeCycleCashFlowAddressWithoutHolders,
          );

          lifeCycleCashFlowWithoutHolders = lifeCycleCashFlowWithoutHolders.connect(signer_A);

          await lifeCycleCashFlowWithoutHolders.changeSystemTimestamp(bondCashoutInitialDate);

          const result = await lifeCycleCashFlowWithoutHolders.executeAmountSnapshot.staticCall(
            await asset_C.getAddress(),
            1,
            1,
            1,
            1000,
          );

          expect(result.executed_).to.equal(false);
        });

        it("An account cannot pay a snapshot if the transfer fails", async () => {
          const stablecoin = await stablecoinMock.deploy(true, false);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, parseUnits("10000", 0));

          await expect(
            lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("100", 0)),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("100", 0),
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [ZeroAddress, ZeroAddress],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account cannot pay a snapshot if the transfer reverts", async () => {
          const stablecoin = await stablecoinMock.deploy(false, true);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, parseUnits("10000", 0));

          await expect(
            lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("100", 0)),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("100", 0),
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [ZeroAddress, ZeroAddress],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account can pay a snapshot", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1000))
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              1000,
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("500", 0), parseUnits("500", 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("500", 0));
        });

        it("An account can pay a snapshot if the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1000))
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              1000,
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("500", 0), parseUnits("500", 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("500", 0));
        });

        it("An account cannot pay a snapshot to a holder twice", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1000))
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              1000,
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("500", 0), parseUnits("500", 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("500", 0));

          await expect(lifeCycleCashFlow.executeAmountSnapshot(await asset_A.getAddress(), 1, 1, 1, 1000))
            .to.emit(lifeCycleCashFlow, "AmountSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              1000,
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [ZeroAddress, ZeroAddress],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("500", 0));
        });
      });

      describe("Pay percentage snapshot", () => {
        it("An account cannot pay the holders a snapshot by percentage if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, 1),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot pay the holders a snapshot by percentage", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot pay the holders a snapshot by percentage", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account granted the _PAYOUT_ROLE cannot pay the holders a snapshot by percentage of an asset not managed by the contract", async () => {
          await expect(lifeCycleCashFlow.executePercentageSnapshot(await asset_B.getAddress(), 1, 1, 1, 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot pay more than 100 percentage of the contract payment token balance", async () => {
          await expect(lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, 10100))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidPercentage")
            .withArgs(10100);
        });

        it("An account cannot pay a snapshot by percentage to a holder if there is not enough balance", async () => {
          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("50", 2)),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("50", 2),
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
        });

        it("An account cannot pay a snapshot by percentage if there are no holders", async () => {
          const asset_C = await assetMock.deploy(assetType, false, 100);

          const rbacList = [
            {
              role: PAYOUT_ROLE,
              members: [await signer_A.getAddress()],
            },
          ];

          const resultLifeCycleCashFlowWithoutHolders = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_C.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddressWithoutHolders = resultLifeCycleCashFlowWithoutHolders.proxyAddress;

          let lifeCycleCashFlowWithoutHolders = await ethers.getContractAt(
            "LifeCycleCashFlowTimeTravel",
            lifeCycleCashFlowAddressWithoutHolders,
          );

          lifeCycleCashFlowWithoutHolders = lifeCycleCashFlowWithoutHolders.connect(signer_A);

          await lifeCycleCashFlowWithoutHolders.changeSystemTimestamp(bondCashoutInitialDate);

          const result = await lifeCycleCashFlowWithoutHolders.executePercentageSnapshot.staticCall(
            await asset_C.getAddress(),
            1,
            1,
            1,
            parseUnits("50", 2),
          );

          expect(result.executed_).to.equal(false);
        });

        it("An account can pay a snapshot by percentage", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("50", 2)),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("50", 2),
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("250000", 2), parseUnits("250000", 2)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));
        });

        it("An account can pay a snapshot by percentage if the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("50", 2)),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("50", 2),
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("250000", 2), parseUnits("250000", 2)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));
        });

        it("An account cannot pay a snapshot by percentage to a holder twice", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("50", 2)),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("50", 2),
              [ZeroAddress, ZeroAddress],
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [parseUnits("250000", 2), parseUnits("250000", 2)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshot(await asset_A.getAddress(), 1, 1, 1, parseUnits("50", 2)),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotExecuted")
            .withArgs(
              1,
              1,
              1,
              parseUnits("50", 2),
              [await signer_B.getAddress(), await signer_A.getAddress()],
              [ZeroAddress, ZeroAddress],
              [0, 0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));
        });
      });

      describe("Pay amount snapshot by addresses", () => {
        it("An account cannot pay the holders a snapshot by amount and addresses if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot pay the holders a snapshot by amount and addresses", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot pay the holders a snapshot by amount and addresses", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account granted the _PAYOUT_ROLE cannot pay the holders a snapshot by amount and addresses of an asset not managed by the contract", async () => {
          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_B.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot pay an amount snapshot by addresses to a holder if there is not enough balance", async () => {
          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_B.getAddress()],
              1000,
            ),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotByAddressesExecuted")
            .withArgs(1, [await signer_B.getAddress()], 1000, [await signer_B.getAddress()], [ZeroAddress], [0]);

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("0", 0));
        });

        it("An account cannot pay a snapshot to a zero address holder", async () => {
          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(await asset_A.getAddress(), 1, [ZeroAddress], 1000),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotByAddressesExecuted")
            .withArgs(1, [ZeroAddress], 1000, [], [], []);
        });

        it("An account can pay an amount snapshot by addresses", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executeAmountSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_B.getAddress()],
              1000,
            ),
          )
            .to.emit(lifeCycleCashFlow, "AmountSnapshotByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              1000,
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits("500", 0)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("500", 0));
        });
      });

      describe("Pay percentage snapshot by addresses", () => {
        it("An account cannot pay the holders a snapshot by percentage and addresses if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _PAYOUT_ROLE role cannot pay the holders a snapshot by percentage and addresses", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYOUT_ROLE);
        });

        it("An account with the _PAYOUT_ROLE role revoked cannot pay the holders a snapshot by percentage and addresses", async () => {
          await lifeCycleCashFlow.revokeRole(PAYOUT_ROLE, await signer_A.getAddress());

          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYOUT_ROLE);
        });

        it("An account granted the _PAYOUT_ROLE cannot pay the holders a snapshot by percentage and addresses of an asset not managed by the contract", async () => {
          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_B.getAddress(),
              1,
              [await signer_A.getAddress()],
              1,
            ),
          )
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidAsset")
            .withArgs(await asset_B.getAddress());
        });

        it("An account cannot pay a percentage snapshot by addresses to a holder if there is not enough balance", async () => {
          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_B.getAddress()],
              parseUnits("5000", 2),
            ),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              parseUnits("5000", 2),
              [ZeroAddress],
              [await signer_B.getAddress()],
              [0],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(0);
        });

        it("An account cannot pay a snapshot by addresses to a zero address holder", async () => {
          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [ZeroAddress],
              parseUnits("5000", 2),
            ),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotByAddressesExecuted")
            .withArgs(1, [ZeroAddress], parseUnits("5000", 2), [], [], []);
        });

        it("An account can pay a percentage snapshot by addresses", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_B.getAddress()],
              parseUnits("50", 2),
            ),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              parseUnits("50", 2),
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits("250000", 2)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));
        });

        it("An account can pay a percentage snapshot by addresses if the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1000000", 2));

          await expect(
            lifeCycleCashFlow.executePercentageSnapshotByAddresses(
              await asset_A.getAddress(),
              1,
              [await signer_B.getAddress()],
              parseUnits("50", 2),
            ),
          )
            .to.emit(lifeCycleCashFlow, "PercentageSnapshotByAddressesExecuted")
            .withArgs(
              1,
              [await signer_B.getAddress()],
              parseUnits("50", 2),
              [ZeroAddress],
              [await signer_B.getAddress()],
              [parseUnits("250000", 2)],
            );

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("250000", 2));
        });
      });

      describe("Transfer stablecoins", () => {
        it("An account cannot transfer stablecoins if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 1),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the _TRANSFERER_ROLE role cannot transfer stablecoins", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), TRANSFERER_ROLE);
        });

        it("An account with the _TRANSFERER_ROLE role revoked cannot transfer stablecoins", async () => {
          await lifeCycleCashFlow.revokeRole(TRANSFERER_ROLE, await signer_A.getAddress());

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), TRANSFERER_ROLE);
        });

        it("An account cannot transfer more stablecoins than the balance of the LifeCycleCashFlow contract", async () => {
          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 200))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "NotEnoughBalance")
            .withArgs(200);
        });

        it("When the transfer fail the transaction reverts with a TransferERC20TokenFailed error", async () => {
          const stablecoin = await stablecoinMock.deploy(true, false);

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, 1);

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "TransferERC20TokenFailed")
            .withArgs(await signer_A.getAddress(), 1);
        });

        it("When the transfer reverts the transaction reverts with a TransferERC20TokenFailed error", async () => {
          const stablecoin = await stablecoinMock.deploy(false, true);

          const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
            new DeployContractCommand({
              name: "LifeCycleCashFlowTimeTravel",
              signer: signer_A,
              args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
            }),
          );

          const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;

          lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlowTimeTravel", lifeCycleCashFlowAddress);

          await stablecoin.transferWithoutErrors(lifeCycleCashFlowAddress, 1);

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_A.getAddress(), 1))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "TransferERC20TokenFailed")
            .withArgs(await signer_A.getAddress(), 1);
        });

        it("An account can transfer 1 stablecoin", async () => {
          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1", 2));

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_B.getAddress(), parseUnits("1", 2)))
            .to.emit(lifeCycleCashFlow, "PaymentTokenTransferred")
            .withArgs(await signer_B.getAddress(), parseUnits("1", 2));

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("1", 2));
        });

        it("An account can transfer 1 stablecoin if the contract is unpaused", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await stablecoin.transfer(lifeCycleCashFlowAddress, parseUnits("1", 2));

          await expect(lifeCycleCashFlow.transferPaymentToken(await signer_B.getAddress(), parseUnits("1", 2)))
            .to.emit(lifeCycleCashFlow, "PaymentTokenTransferred")
            .withArgs(await signer_B.getAddress(), parseUnits("1", 2));

          expect(await stablecoin.balanceOf(await signer_B.getAddress())).to.equal(parseUnits("1", 2));
        });
      });

      describe("Update stablecoin", () => {
        let stablecoin_B;

        beforeEach(async () => {
          stablecoin_B = await stablecoinMock.deploy(false, false);
        });

        it("An account cannot update the stablecoin if the contract is paused", async () => {
          await lifeCycleCashFlow.pause();

          expect(await lifeCycleCashFlow.isPaused()).to.be.true;

          await expect(
            lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress()),
          ).to.be.revertedWithCustomError(lifeCycleCashFlow, "LifeCycleCashFlowIsPaused");
        });

        it("An account not granted the PAYMENT_TOKEN_MANAGER_ROLE role cannot set the stablecoin", async () => {
          lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_B);

          await expect(lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_B.getAddress(), PAYMENT_TOKEN_MANAGER_ROLE);
        });

        it("An account with the PAYMENT_TOKEN_MANAGER_ROLE role revoked cannot set the stablecoin", async () => {
          await lifeCycleCashFlow.revokeRole(PAYMENT_TOKEN_MANAGER_ROLE, await signer_A.getAddress());

          await expect(lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress()))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "AccountHasNoRole")
            .withArgs(await signer_A.getAddress(), PAYMENT_TOKEN_MANAGER_ROLE);

          await lifeCycleCashFlow.grantRole(PAYMENT_TOKEN_MANAGER_ROLE, await signer_A.getAddress());
        });

        it("An account cannot set an invalid stablecoin", async () => {
          await expect(lifeCycleCashFlow.updatePaymentToken(ZeroAddress))
            .to.be.revertedWithCustomError(lifeCycleCashFlow, "InvalidPaymentToken")
            .withArgs(ZeroAddress);
        });

        it("An account can set the stablecoin", async () => {
          await lifeCycleCashFlow.pause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.true;
          await lifeCycleCashFlow.unpause();
          expect(await lifeCycleCashFlow.isPaused()).to.be.false;

          await expect(lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress()))
            .to.emit(lifeCycleCashFlow, "PaymentTokenChanged")
            .withArgs(await stablecoin_B.getAddress());

          expect(await lifeCycleCashFlow.getPaymentToken()).to.equal(await stablecoin_B.getAddress());
        });

        it("An account can set the stablecoin if the contract is unpaused", async () => {
          await expect(lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress()))
            .to.emit(lifeCycleCashFlow, "PaymentTokenChanged")
            .withArgs(await stablecoin_B.getAddress());

          expect(await lifeCycleCashFlow.getPaymentToken()).to.equal(await stablecoin_B.getAddress());
        });

        it("An account cannot set the stablecoin if the association fails", async () => {
          const stableCoinToFail = "0x0000000000000000000000000000000000000001";
          await expect(lifeCycleCashFlow.updatePaymentToken(stableCoinToFail)).to.be.revertedWithCustomError(
            lifeCycleCashFlow,
            "AssociateTokenFailed",
          );

          expect(await lifeCycleCashFlow.getPaymentToken()).to.equal(await stablecoin.getAddress());
        });
      });

      describe("Get the stablecoin", () => {
        it("An account can get the stablecoin", async () => {
          const stablecoin_B = await stablecoinMock.deploy(false, false);

          await lifeCycleCashFlow.updatePaymentToken(await stablecoin_B.getAddress());
          expect(await lifeCycleCashFlow.getPaymentToken()).to.equal(await stablecoin_B.getAddress());
        });
      });

      describe("Get the stablecoin decimals", () => {
        it("An account can get the stablecoin decimals", async () => {
          expect(await lifeCycleCashFlow.getPaymentTokenDecimals()).to.equal(2);
        });
      });
    });
  });
});
describe("Real-time contract tests (without TimeTravel)", () => {
  let asset_A;
  let rbacList;
  let stablecoin;
  let lifeCycleCashFlow;
  let signer_A, signer_B;

  beforeEach(async () => {
    await deployPrecompiledMock();

    [signer_A, signer_B] = await ethers.getSigners();

    const assetMock = await ethers.getContractFactory("AssetMock");
    asset_A = await assetMock.deploy(AssetType.EQUITY, true, 100);
    await asset_A.waitForDeployment();

    const stablecoinMock = await ethers.getContractFactory("StablecoinMock");
    stablecoin = await stablecoinMock.deploy(false, false);

    rbacList = [
      {
        role: DEFAULT_ADMIN_ROLE,
        members: [await signer_A.getAddress()],
      },
      {
        role: PAYOUT_ROLE,
        members: [await signer_A.getAddress()],
      },
    ];

    const resultLifeCycleCashFlow = await deployLifeCycleCashFlowContracts(
      new DeployContractCommand({
        name: "LifeCycleCashFlow",
        signer: signer_A,
        args: [await asset_A.getAddress(), await stablecoin.getAddress(), rbacList],
      }),
    );

    const lifeCycleCashFlowAddress = resultLifeCycleCashFlow.proxyAddress;
    lifeCycleCashFlow = await ethers.getContractAt("LifeCycleCashFlow", lifeCycleCashFlowAddress);
  });

  it("Should use real block timestamp for distribution date validation", async () => {
    // This test validates that the real LifeCycleCashFlow contract uses LocalContext._blockTimestamp()
    // The contract will check the current block timestamp against the distribution execution date
    // Since we're using the real contract (not TimeTravel), this will call LocalContext._blockTimestamp()

    // Execute distribution - this will internally call _blockTimestamp() from LocalContext
    // Since the mock returns executionDate in the past and we have holders,
    // the distribution should execute (may succeed or fail based on balance)
    const result = await lifeCycleCashFlow.executeDistribution.staticCall(await asset_A.getAddress(), 1, 0, 1);

    // The important thing is that the function executed without reverting on date check
    // This proves LocalContext._blockTimestamp() was called and worked correctly
    // In ethers v6, staticCall returns an array/tuple, not an object
    expect(result).to.be.an("array");
    expect(result).to.have.length(4); // executed_, failed, succeeded, paidAmount arrays
  });
});
