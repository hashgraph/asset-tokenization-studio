import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@hashgraph/sdk'
import '@hashgraph/hardhat-hethers'
import { getEnvVar } from './scripts/utils'
import './scripts/hardhatTasks'
import 'solidity-coverage'

const HEDERA_ACCOUNTS = [
    {
        account: getEnvVar('ACCOUNT_0'),
        privateKey: getEnvVar('PRIVATE_KEY_0'),
    },
    {
        account: getEnvVar('ACCOUNT_1'),
        privateKey: getEnvVar('PRIVATE_KEY_1'),
    },
]

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
    hedera: {
        gasLimit: 300000,
        networks: {
            testnet: {
                accounts: HEDERA_ACCOUNTS,
            },
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
