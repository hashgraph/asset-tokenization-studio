import { HardhatUserConfig } from 'hardhat/config'
import {
    HederaAccount,
    HederaNodeConfig,
} from '@hashgraph/hardhat-hethers/src/type-extensions'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import '@hashgraph/sdk'
import { getEnvVar } from './scripts/utils'
// ! Uncomment the following lines to be able to use tasks AFTER compiling the project
// import './tasks/utils'
// import './tasks/deploy'
// import './tasks/update'

if (getEnvVar({ name: 'NETWORK', defaultValue: 'hardhat' }) !== 'hardhat') {
    require('@hashgraph/hardhat-hethers')
}

const HEDERA_ACCOUNTS = [
    {
        account: getEnvVar({ name: 'ACCOUNT_0', defaultValue: '0.0.0' }),
        privateKey: getEnvVar({
            name: 'PRIVATE_KEY_0',
            defaultValue: '0x0000',
        }).replace(/^0x/, ''),
    },
    {
        account: getEnvVar({ name: 'ACCOUNT_1', defaultValue: '0.0.0' }),
        privateKey: getEnvVar({
            name: 'PRIVATE_KEY_1',
            defaultValue: '0x0000',
        }).replace(/^0x/, ''),
    },
]

const HEDERA_NETWORKS = {
    local: {
        accounts: HEDERA_ACCOUNTS,
        mirrorNodeUrl: getEnvVar({
            name: 'MIRROR_NODE_URL_LOCAL',
            defaultValue: 'http://localhost:5551',
        }),
        nodeId: '0.0.3',
    },
    previewnet: {
        accounts: HEDERA_ACCOUNTS,
        mirrorNodeUrl: getEnvVar({
            name: 'MIRROR_NODE_URL_PREVIEWNET',
            defaultValue: 'https://previewnet.mirrornode.hedera.com',
        }),
    },
    testnet: {
        accounts: HEDERA_ACCOUNTS,
        mirrorNodeUrl: getEnvVar({
            name: 'MIRROR_NODE_URL_TESTNET',
            defaultValue: 'https://testnet.mirrornode.hedera.com',
        }),
    },
    mainnet: {
        accounts: HEDERA_ACCOUNTS,
        mirrorNodeUrl: getEnvVar({
            name: 'MIRROR_NODE_URL_MAINNET',
            defaultValue: 'https://mainnet.mirrornode.hedera.com',
        }),
    },
}

// Needed to be able to use the HederaConfig interface
interface ExtendedHardhatUserConfig extends Omit<HardhatUserConfig, 'hedera'> {
    hedera?: {
        gasLimit: number
        networks: {
            [key: string]: {
                accounts: Array<HederaAccount>
                nodeId?: string
                consensusNodes?: Array<HederaNodeConfig>
                mirrorNodeUrl?: string
                chainId?: number
            }
        }
    }
}

let config: ExtendedHardhatUserConfig = {
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
// If we are not using the hardhat network, we need to add the Hedera accounts
if (getEnvVar({ name: 'NETWORK', defaultValue: 'hardhat' }) !== 'hardhat') {
    config = {
        ...config,
        defaultNetwork: getEnvVar({ name: 'NETWORK' }),
        hedera: {
            gasLimit: 300000,
            networks: HEDERA_NETWORKS,
        },
    }
}

export default config
