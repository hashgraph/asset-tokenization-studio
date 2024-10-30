import { HardhatUserConfig, task, types } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomiclabs/hardhat-ethers'
import '@hashgraph/sdk'
// import '@hashgraph/hardhat-hethers' // remove comment only when working with Hedera DLT
import './scripts/hardhatTasks' // remove comment only when deploying in HEdera DLT after compiling
import * as dotenv from 'dotenv'
import 'solidity-coverage'

dotenv.config()

task('keccak256', 'Prints the keccak256 hash of a string')
    .addPositionalParam(
        'input',
        'The string to be hashed',
        undefined,
        types.string
    )
    .setAction(async ({ input }: { input: string }, hre) => {
        const hash = hre.ethers.utils.keccak256(Buffer.from(input, 'utf-8'))
        console.log(hash)
    })

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    defaultNetwork: 'hardhat',
    networks: {
        // Defines the configuration settings for connecting to Hedera testnet
        testnet: {
            // Specifies URL endpoint for Hedera testnet pulled from the .env file
            url: process.env.JSON_RPC_URL_TESTNET,
            // Your ECDSA testnet account private key pulled from the .env file
            accounts: [process.env.PRIVATE_KEY_0!],
        },
    },
    typechain: {
        outDir: './typechain-types',
    },
    mocha: {
        // Extend the timeout to 60 seconds (adjust as needed)
        timeout: 3000000,
    },
}

export default config
