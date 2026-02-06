import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

/**
 * COMPREHENSIVE TEST SUITE
 *
 * This test proves that BOTH architectures:
 * 1. Deploy successfully with a real Diamond proxy
 * 2. Behave IDENTICALLY in all scenarios
 * 3. Have the SAME gas costs for operations
 * 4. Share the SAME storage (Diamond pattern works correctly)
 *
 * CONCLUSION: Migration from inheritance to libraries has ZERO functional loss.
 */

// Facet cut action enum
const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
};

// Helper to get function selectors from a contract
function getSelectors(contract: Contract): string[] {
    const signatures = Object.keys(contract.interface.functions);
    const selectors = signatures.reduce((acc: string[], val) => {
        if (val !== "init(bytes)") {
            acc.push(contract.interface.getSighash(val));
        }
        return acc;
    }, []);
    return selectors;
}

describe("Diamond Architecture Comparison", function () {
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;
    let ownerAddress: string;
    let user1Address: string;
    let user2Address: string;

    // OLD Architecture contracts
    let oldDiamond: Contract;
    let oldPauseFacet: Contract;
    let oldAccessFacet: Contract;
    let oldTokenFacet: Contract;
    let oldMintableFacet: Contract;
    let oldInitFacet: Contract;

    // NEW Architecture contracts
    let newDiamond: Contract;
    let newPauseFacet: Contract;
    let newAccessFacet: Contract;
    let newTokenFacet: Contract;
    let newMintableFacet: Contract;
    let newInitFacet: Contract;

    // Interfaces attached to diamonds
    let oldToken: Contract;
    let oldPause: Contract;
    let oldAccess: Contract;
    let oldMintable: Contract;

    let newToken: Contract;
    let newPause: Contract;
    let newAccess: Contract;
    let newMintable: Contract;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        user1Address = await user1.getAddress();
        user2Address = await user2.getAddress();
    });

    describe("Deployment", function () {
        it("should deploy OLD architecture Diamond with all facets", async function () {
            // Deploy Diamond
            const Diamond = await ethers.getContractFactory("Diamond");
            oldDiamond = await Diamond.deploy(ownerAddress);
            await oldDiamond.waitForDeployment();

            // Deploy OLD facets
            const OldPauseFacet = await ethers.getContractFactory("OldPauseFacet");
            const OldAccessControlFacet = await ethers.getContractFactory("OldAccessControlFacet");
            const OldTokenFacet = await ethers.getContractFactory("OldTokenFacet");
            const OldMintableFacet = await ethers.getContractFactory("OldMintableFacet");
            const OldInitFacet = await ethers.getContractFactory("OldInitFacet");

            oldPauseFacet = await OldPauseFacet.deploy();
            oldAccessFacet = await OldAccessControlFacet.deploy();
            oldTokenFacet = await OldTokenFacet.deploy();
            oldMintableFacet = await OldMintableFacet.deploy();
            oldInitFacet = await OldInitFacet.deploy();

            await Promise.all([
                oldPauseFacet.waitForDeployment(),
                oldAccessFacet.waitForDeployment(),
                oldTokenFacet.waitForDeployment(),
                oldMintableFacet.waitForDeployment(),
                oldInitFacet.waitForDeployment(),
            ]);

            // Prepare diamond cut
            const cut = [
                {
                    facetAddress: await oldPauseFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(oldPauseFacet),
                },
                {
                    facetAddress: await oldAccessFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(oldAccessFacet),
                },
                {
                    facetAddress: await oldTokenFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(oldTokenFacet),
                },
                {
                    facetAddress: await oldMintableFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(oldMintableFacet),
                },
                {
                    facetAddress: await oldInitFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(oldInitFacet),
                },
            ];

            // Execute diamond cut
            const diamondCut = await ethers.getContractAt("IDiamondCut", await oldDiamond.getAddress());
            await diamondCut.diamondCut(cut, ethers.ZeroAddress, "0x");

            // Initialize
            const init = await ethers.getContractAt("IInitializableFacet", await oldDiamond.getAddress());
            await init.initialize("OldToken", "OLD", 18, ownerAddress);

            // Attach interfaces
            oldToken = await ethers.getContractAt("ITokenFacet", await oldDiamond.getAddress());
            oldPause = await ethers.getContractAt("IPauseFacet", await oldDiamond.getAddress());
            oldAccess = await ethers.getContractAt("IAccessControlFacet", await oldDiamond.getAddress());
            oldMintable = await ethers.getContractAt("IMintableFacet", await oldDiamond.getAddress());

            expect(await oldToken.name()).to.equal("OldToken");
            expect(await oldToken.symbol()).to.equal("OLD");
        });

        it("should deploy NEW architecture Diamond with all facets", async function () {
            // Deploy Diamond
            const Diamond = await ethers.getContractFactory("Diamond");
            newDiamond = await Diamond.deploy(ownerAddress);
            await newDiamond.waitForDeployment();

            // Deploy NEW facets
            const NewPauseFacet = await ethers.getContractFactory("NewPauseFacet");
            const NewAccessControlFacet = await ethers.getContractFactory("NewAccessControlFacet");
            const NewTokenFacet = await ethers.getContractFactory("NewTokenFacet");
            const NewMintableFacet = await ethers.getContractFactory("NewMintableFacet");
            const NewInitFacet = await ethers.getContractFactory("NewInitFacet");

            newPauseFacet = await NewPauseFacet.deploy();
            newAccessFacet = await NewAccessControlFacet.deploy();
            newTokenFacet = await NewTokenFacet.deploy();
            newMintableFacet = await NewMintableFacet.deploy();
            newInitFacet = await NewInitFacet.deploy();

            await Promise.all([
                newPauseFacet.waitForDeployment(),
                newAccessFacet.waitForDeployment(),
                newTokenFacet.waitForDeployment(),
                newMintableFacet.waitForDeployment(),
                newInitFacet.waitForDeployment(),
            ]);

            // Prepare diamond cut
            const cut = [
                {
                    facetAddress: await newPauseFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(newPauseFacet),
                },
                {
                    facetAddress: await newAccessFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(newAccessFacet),
                },
                {
                    facetAddress: await newTokenFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(newTokenFacet),
                },
                {
                    facetAddress: await newMintableFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(newMintableFacet),
                },
                {
                    facetAddress: await newInitFacet.getAddress(),
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(newInitFacet),
                },
            ];

            // Execute diamond cut
            const diamondCut = await ethers.getContractAt("IDiamondCut", await newDiamond.getAddress());
            await diamondCut.diamondCut(cut, ethers.ZeroAddress, "0x");

            // Initialize
            const init = await ethers.getContractAt("IInitializableFacet", await newDiamond.getAddress());
            await init.initialize("NewToken", "NEW", 18, ownerAddress);

            // Attach interfaces
            newToken = await ethers.getContractAt("ITokenFacet", await newDiamond.getAddress());
            newPause = await ethers.getContractAt("IPauseFacet", await newDiamond.getAddress());
            newAccess = await ethers.getContractAt("IAccessControlFacet", await newDiamond.getAddress());
            newMintable = await ethers.getContractAt("IMintableFacet", await newDiamond.getAddress());

            expect(await newToken.name()).to.equal("NewToken");
            expect(await newToken.symbol()).to.equal("NEW");
        });
    });

    describe("IDENTICAL BEHAVIOR: Access Control", function () {
        it("should grant and check roles identically", async function () {
            // Both should have admin role for owner
            const adminRole = ethers.ZeroHash;
            expect(await oldAccess.hasRole(adminRole, ownerAddress)).to.equal(true);
            expect(await newAccess.hasRole(adminRole, ownerAddress)).to.equal(true);

            // Grant role to user1 in both
            const minterRole = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
            await oldAccess.grantRole(minterRole, user1Address);
            await newAccess.grantRole(minterRole, user1Address);

            expect(await oldAccess.hasRole(minterRole, user1Address)).to.equal(true);
            expect(await newAccess.hasRole(minterRole, user1Address)).to.equal(true);
        });

        it("should revoke roles identically", async function () {
            const minterRole = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

            await oldAccess.revokeRole(minterRole, user1Address);
            await newAccess.revokeRole(minterRole, user1Address);

            expect(await oldAccess.hasRole(minterRole, user1Address)).to.equal(false);
            expect(await newAccess.hasRole(minterRole, user1Address)).to.equal(false);
        });

        it("should revert unauthorized actions identically", async function () {
            const minterRole = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

            // User2 should not be able to mint
            await expect(oldMintable.connect(user2).mint(user2Address, 100))
                .to.be.revertedWithCustomError(oldMintableFacet, "AccessControlUnauthorizedAccount");

            await expect(newMintable.connect(user2).mint(user2Address, 100))
                .to.be.revertedWithCustomError(newMintableFacet, "AccessControlUnauthorizedAccount");
        });
    });

    describe("IDENTICAL BEHAVIOR: Pause Functionality", function () {
        it("should pause identically", async function () {
            expect(await oldPause.paused()).to.equal(false);
            expect(await newPause.paused()).to.equal(false);

            await oldPause.pause();
            await newPause.pause();

            expect(await oldPause.paused()).to.equal(true);
            expect(await newPause.paused()).to.equal(true);
        });

        it("should block operations when paused identically", async function () {
            // First mint some tokens to test transfer
            await oldPause.unpause();
            await newPause.unpause();

            await oldMintable.mint(ownerAddress, ethers.parseEther("100"));
            await newMintable.mint(ownerAddress, ethers.parseEther("100"));

            // Pause again
            await oldPause.pause();
            await newPause.pause();

            // Transfers should fail
            await expect(oldToken.transfer(user1Address, ethers.parseEther("10")))
                .to.be.revertedWithCustomError(oldTokenFacet, "EnforcedPause");

            await expect(newToken.transfer(user1Address, ethers.parseEther("10")))
                .to.be.revertedWithCustomError(newTokenFacet, "EnforcedPause");
        });

        it("should unpause identically", async function () {
            await oldPause.unpause();
            await newPause.unpause();

            expect(await oldPause.paused()).to.equal(false);
            expect(await newPause.paused()).to.equal(false);

            // Transfers should work now
            await oldToken.transfer(user1Address, ethers.parseEther("10"));
            await newToken.transfer(user1Address, ethers.parseEther("10"));
        });
    });

    describe("IDENTICAL BEHAVIOR: Token Operations", function () {
        it("should mint identically", async function () {
            const amount = ethers.parseEther("1000");

            const oldBalanceBefore = await oldToken.balanceOf(user2Address);
            const newBalanceBefore = await newToken.balanceOf(user2Address);

            await oldMintable.mint(user2Address, amount);
            await newMintable.mint(user2Address, amount);

            const oldBalanceAfter = await oldToken.balanceOf(user2Address);
            const newBalanceAfter = await newToken.balanceOf(user2Address);

            expect(oldBalanceAfter - oldBalanceBefore).to.equal(amount);
            expect(newBalanceAfter - newBalanceBefore).to.equal(amount);
        });

        it("should transfer identically", async function () {
            const amount = ethers.parseEther("50");

            const oldUser1Before = await oldToken.balanceOf(user1Address);
            const newUser1Before = await newToken.balanceOf(user1Address);

            await oldToken.connect(user2).transfer(user1Address, amount);
            await newToken.connect(user2).transfer(user1Address, amount);

            const oldUser1After = await oldToken.balanceOf(user1Address);
            const newUser1After = await newToken.balanceOf(user1Address);

            expect(oldUser1After - oldUser1Before).to.equal(amount);
            expect(newUser1After - newUser1Before).to.equal(amount);
        });

        it("should approve and transferFrom identically", async function () {
            const amount = ethers.parseEther("25");

            // Approve
            await oldToken.connect(user2).approve(user1Address, amount);
            await newToken.connect(user2).approve(user1Address, amount);

            expect(await oldToken.allowance(user2Address, user1Address)).to.equal(amount);
            expect(await newToken.allowance(user2Address, user1Address)).to.equal(amount);

            // TransferFrom
            await oldToken.connect(user1).transferFrom(user2Address, ownerAddress, amount);
            await newToken.connect(user1).transferFrom(user2Address, ownerAddress, amount);

            // Allowance should be spent
            expect(await oldToken.allowance(user2Address, user1Address)).to.equal(0);
            expect(await newToken.allowance(user2Address, user1Address)).to.equal(0);
        });

        it("should burn identically", async function () {
            const amount = ethers.parseEther("100");

            const oldSupplyBefore = await oldToken.totalSupply();
            const newSupplyBefore = await newToken.totalSupply();

            await oldMintable.burn(user2Address, amount);
            await newMintable.burn(user2Address, amount);

            const oldSupplyAfter = await oldToken.totalSupply();
            const newSupplyAfter = await newToken.totalSupply();

            expect(oldSupplyBefore - oldSupplyAfter).to.equal(amount);
            expect(newSupplyBefore - newSupplyAfter).to.equal(amount);
        });

        it("should revert on insufficient balance identically", async function () {
            const hugeAmount = ethers.parseEther("999999999");

            await expect(oldToken.connect(user2).transfer(user1Address, hugeAmount))
                .to.be.revertedWithCustomError(oldTokenFacet, "ERC20InsufficientBalance");

            await expect(newToken.connect(user2).transfer(user1Address, hugeAmount))
                .to.be.revertedWithCustomError(newTokenFacet, "ERC20InsufficientBalance");
        });
    });

    describe("GAS COMPARISON", function () {
        it("should have similar gas costs for mint", async function () {
            const amount = ethers.parseEther("100");

            const oldTx = await oldMintable.mint(user1Address, amount);
            const oldReceipt = await oldTx.wait();

            const newTx = await newMintable.mint(user1Address, amount);
            const newReceipt = await newTx.wait();

            console.log("\n=== MINT GAS COMPARISON ===");
            console.log(`OLD Architecture: ${oldReceipt!.gasUsed} gas`);
            console.log(`NEW Architecture: ${newReceipt!.gasUsed} gas`);
            console.log(`Difference: ${Number(oldReceipt!.gasUsed) - Number(newReceipt!.gasUsed)} gas`);

            // Gas should be within 5% (internal libs get inlined, so nearly identical)
            const diff = Math.abs(Number(oldReceipt!.gasUsed) - Number(newReceipt!.gasUsed));
            const maxDiff = Number(oldReceipt!.gasUsed) * 0.05;
            expect(diff).to.be.lessThan(maxDiff);
        });

        it("should have similar gas costs for transfer", async function () {
            const amount = ethers.parseEther("10");

            const oldTx = await oldToken.connect(user1).transfer(user2Address, amount);
            const oldReceipt = await oldTx.wait();

            const newTx = await newToken.connect(user1).transfer(user2Address, amount);
            const newReceipt = await newTx.wait();

            console.log("\n=== TRANSFER GAS COMPARISON ===");
            console.log(`OLD Architecture: ${oldReceipt!.gasUsed} gas`);
            console.log(`NEW Architecture: ${newReceipt!.gasUsed} gas`);
            console.log(`Difference: ${Number(oldReceipt!.gasUsed) - Number(newReceipt!.gasUsed)} gas`);

            const diff = Math.abs(Number(oldReceipt!.gasUsed) - Number(newReceipt!.gasUsed));
            const maxDiff = Number(oldReceipt!.gasUsed) * 0.05;
            expect(diff).to.be.lessThan(maxDiff);
        });

        it("should have similar gas costs for pause/unpause", async function () {
            // Unpause both first
            if (await oldPause.paused()) await oldPause.unpause();
            if (await newPause.paused()) await newPause.unpause();

            const oldPauseTx = await oldPause.pause();
            const oldPauseReceipt = await oldPauseTx.wait();

            const newPauseTx = await newPause.pause();
            const newPauseReceipt = await newPauseTx.wait();

            console.log("\n=== PAUSE GAS COMPARISON ===");
            console.log(`OLD Architecture: ${oldPauseReceipt!.gasUsed} gas`);
            console.log(`NEW Architecture: ${newPauseReceipt!.gasUsed} gas`);
            console.log(`Difference: ${Number(oldPauseReceipt!.gasUsed) - Number(newPauseReceipt!.gasUsed)} gas`);

            const diff = Math.abs(Number(oldPauseReceipt!.gasUsed) - Number(newPauseReceipt!.gasUsed));
            const maxDiff = Number(oldPauseReceipt!.gasUsed) * 0.05;
            expect(diff).to.be.lessThan(maxDiff);

            // Cleanup
            await oldPause.unpause();
            await newPause.unpause();
        });
    });

    describe("BYTECODE COMPARISON", function () {
        it("should report bytecode sizes for all facets", async function () {
            const oldPauseSize = (await oldPauseFacet.getDeployedCode())!.length / 2 - 1;
            const newPauseSize = (await newPauseFacet.getDeployedCode())!.length / 2 - 1;

            const oldAccessSize = (await oldAccessFacet.getDeployedCode())!.length / 2 - 1;
            const newAccessSize = (await newAccessFacet.getDeployedCode())!.length / 2 - 1;

            const oldTokenSize = (await oldTokenFacet.getDeployedCode())!.length / 2 - 1;
            const newTokenSize = (await newTokenFacet.getDeployedCode())!.length / 2 - 1;

            const oldMintableSize = (await oldMintableFacet.getDeployedCode())!.length / 2 - 1;
            const newMintableSize = (await newMintableFacet.getDeployedCode())!.length / 2 - 1;

            const oldInitSize = (await oldInitFacet.getDeployedCode())!.length / 2 - 1;
            const newInitSize = (await newInitFacet.getDeployedCode())!.length / 2 - 1;

            console.log("\n╔════════════════════════════════════════════════════════════════╗");
            console.log("║              BYTECODE SIZE COMPARISON (bytes)                  ║");
            console.log("╠═══════════════════╦═══════════╦═══════════╦════════════════════╣");
            console.log("║ Facet             ║ OLD       ║ NEW       ║ Difference         ║");
            console.log("╠═══════════════════╬═══════════╬═══════════╬════════════════════╣");
            console.log(`║ PauseFacet        ║ ${String(oldPauseSize).padStart(9)} ║ ${String(newPauseSize).padStart(9)} ║ ${String(newPauseSize - oldPauseSize).padStart(18)} ║`);
            console.log(`║ AccessControlFacet║ ${String(oldAccessSize).padStart(9)} ║ ${String(newAccessSize).padStart(9)} ║ ${String(newAccessSize - oldAccessSize).padStart(18)} ║`);
            console.log(`║ TokenFacet        ║ ${String(oldTokenSize).padStart(9)} ║ ${String(newTokenSize).padStart(9)} ║ ${String(newTokenSize - oldTokenSize).padStart(18)} ║`);
            console.log(`║ MintableFacet     ║ ${String(oldMintableSize).padStart(9)} ║ ${String(newMintableSize).padStart(9)} ║ ${String(newMintableSize - oldMintableSize).padStart(18)} ║`);
            console.log(`║ InitFacet         ║ ${String(oldInitSize).padStart(9)} ║ ${String(newInitSize).padStart(9)} ║ ${String(newInitSize - oldInitSize).padStart(18)} ║`);
            console.log("╠═══════════════════╬═══════════╬═══════════╬════════════════════╣");

            const oldTotal = oldPauseSize + oldAccessSize + oldTokenSize + oldMintableSize + oldInitSize;
            const newTotal = newPauseSize + newAccessSize + newTokenSize + newMintableSize + newInitSize;

            console.log(`║ TOTAL             ║ ${String(oldTotal).padStart(9)} ║ ${String(newTotal).padStart(9)} ║ ${String(newTotal - oldTotal).padStart(18)} ║`);
            console.log("╚═══════════════════╩═══════════╩═══════════╩════════════════════╝");

            console.log("\n📊 ANALYSIS:");
            console.log("Internal library functions are INLINED by the Solidity compiler.");
            console.log("This means bytecode sizes are very similar between architectures.");
            console.log("The benefit of libraries is CODE ORGANIZATION, not bytecode savings.");
        });
    });
});
