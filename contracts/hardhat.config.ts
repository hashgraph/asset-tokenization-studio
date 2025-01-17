import { HardhatUserConfig } from 'hardhat/config'
import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import '@hashgraph/sdk'
import Configuration from '@configuration'
import '@tasks'

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: 'istanbul',
        },
    },
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 1337,
            blockGasLimit: 30_000_000,
        },
        local: {
            url: Configuration.endpoints.local.jsonRpc,
            accounts: Configuration.privateKeys.local,
        },
        previewnet: {
            url: Configuration.endpoints.previewnet.jsonRpc,
            accounts: Configuration.privateKeys.previewnet,
        },
        testnet: {
            url: Configuration.endpoints.testnet.jsonRpc,
            accounts: Configuration.privateKeys.testnet,
        },
        mainnet: {
            url: Configuration.endpoints.mainnet.jsonRpc,
            accounts: Configuration.privateKeys.mainnet,
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    typechain: {
        outDir: './typechain-types',
        target: 'ethers-v5',
    },
    mocha: {
        timeout: 3000000,
    },
}

export default config
