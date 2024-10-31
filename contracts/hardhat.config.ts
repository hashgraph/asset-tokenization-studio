import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@hashgraph/sdk'
// import '@hashgraph/hardhat-hethers' //! Remove comment only when working with Hedera DLT
// import { getEnvVar } from './scripts/utils' //! Remove comment only when working with Hedera DLT
import './scripts/hardhatTasks'
import 'solidity-coverage'

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
    //! Remove comment only when working with Hedera DLT
    // defaultNetwork: 'testnet',
    // hedera: {
    //     gasLimit: 300000,
    //     networks: {
    //         testnet: {
    //             accounts: [
    //                 {
    //                     account:
    //                         getEnvVar('TESTNET_HEDERA_OPERATOR_ACCOUNT') ?? '',
    //                     privateKey:
    //                         getEnvVar('TESTNET_HEDERA_OPERATOR_PRIVATEKEY') ??
    //                         '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_1'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_1'
    //                         ) ?? '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_2'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_2'
    //                         ) ?? '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_3'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_3'
    //                         ) ?? '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_4'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_4'
    //                         ) ?? '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_5'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_5'
    //                         ) ?? '',
    //                 },
    //                 {
    //                     account:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_6'
    //                         ) ?? '',
    //                     privateKey:
    //                         getEnvVar(
    //                             'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_6'
    //                         ) ?? '',
    //                 },
    //             ],
    //         },
    //     },
    // },
    typechain: {
        outDir: './typechain-types',
    },
    mocha: {
        // Extend the timeout to 60 seconds (adjust as needed)
        timeout: 3000000,
    },
}

export default config
