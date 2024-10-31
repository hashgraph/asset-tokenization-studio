import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@hashgraph/sdk'
import { getEnvVar } from './scripts/utils'
if (getEnvVar('NETWORK') === 'testnet') {
    require('@hashgraph/hardhat-hedera')
}
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

// To be able to use both Hedera and Ethereum networks, we need to extend the HardhatUserConfig
interface ExtendedHardhatUserConfig extends HardhatUserConfig {
    hedera?: {
        gasLimit: number
        networks: {
            testnet: {
                accounts: { account: string; privateKey: string }[]
            }
        }
    }
}

const plainConfig: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
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

const hederaConfig: ExtendedHardhatUserConfig = {
    ...plainConfig,
    defaultNetwork: 'testnet',
    hedera: {
        gasLimit: 300000,
        networks: {
            testnet: {
                accounts: HEDERA_ACCOUNTS,
            },
        },
    },
}

export default getEnvVar('NETWORK') === 'testnet' ? hederaConfig : plainConfig
