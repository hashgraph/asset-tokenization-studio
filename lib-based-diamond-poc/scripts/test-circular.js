const { ethers } = require("hardhat");

async function main() {
    console.log("=== CIRCULAR FUNCTION DEPENDENCY TEST ===\n");

    // Compile and deploy
    const TestCircularFunctions = await ethers.getContractFactory("TestCircularFunctions");
    const test = await TestCircularFunctions.deploy();
    await test.waitForDeployment();

    console.log("Contract deployed!\n");

    // Test mutual recursion
    console.log("Testing mutual recursion (A ↔ B):\n");

    // processA(4) → processB(3) → processA(2) → processB(1) → processA(0) → 100
    const resultA4 = await test.testFromA(4);
    console.log(`testFromA(4) = ${resultA4}`);
    console.log(`  Path: A(4)→B(3)→A(2)→B(1)→A(0)→100\n`);

    // processB(4) → processA(3) → processB(2) → processA(1) → processB(0) → 200
    const resultB4 = await test.testFromB(4);
    console.log(`testFromB(4) = ${resultB4}`);
    console.log(`  Path: B(4)→A(3)→B(2)→A(1)→B(0)→200\n`);

    // Odd depth - ends at different base case
    const resultA3 = await test.testFromA(3);
    console.log(`testFromA(3) = ${resultA3}`);
    console.log(`  Path: A(3)→B(2)→A(1)→B(0)→200\n`);

    const resultB3 = await test.testFromB(3);
    console.log(`testFromB(3) = ${resultB3}`);
    console.log(`  Path: B(3)→A(2)→B(1)→A(0)→100\n`);

    // Deep recursion
    console.log("Testing deep mutual recursion (100 levels):");
    const resultDeep = await test.testFromA(100);
    console.log(`testFromA(100) = ${resultDeep}`);
    console.log(`  (100 levels of A↔B recursion - works fine!)\n`);

    console.log("===========================================");
    console.log("✅ ALL CIRCULAR FUNCTION CALLS WORK!");
    console.log("===========================================\n");

    console.log("KEY INSIGHT:");
    console.log("────────────");
    console.log("• Compile time: Circular imports + circular calls = OK");
    console.log("• Runtime: Works as long as there's a BASE CASE");
    console.log("• Without base case: OUT OF GAS (infinite recursion)");
    console.log("");
    console.log("This is MUTUAL RECURSION - a valid programming pattern!");
}

main().catch(console.error);
