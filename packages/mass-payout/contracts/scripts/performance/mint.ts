import {ethers} from "hardhat";

const bondAddress = "0xc6a17afa8211d9d4ad9d64163eda8a105a79e631"
const numberOfMintings = 15

async function mint(): Promise<void> {
    const bond = await ethers.getContractAt(
        "IERC3643Operations",
        bondAddress,
    );

    console.log(`Minting tokens for bond ${bondAddress} for ${numberOfMintings} accounts`)
    for (let i = 0; i < numberOfMintings; i++) {
        const account = ethers.Wallet.createRandom().address
        await bond.mint(account, 10000) // 0.01 with 6 decimals
        console.log(`Token minted for account ${i + 1} - ${account}`)
    }
}

mint()

