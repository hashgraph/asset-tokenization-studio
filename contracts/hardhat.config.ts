import { HardhatUserConfig, task, types } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-contract-sizer'
import '@hashgraph/sdk'
//import '@hashgraph/hardhat-hethers' // remove comment only when working with Hedera DLT
import './scripts/hardhatTasks'
import * as dotenv from 'dotenv'
import 'solidity-coverage'

dotenv.config()

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
    //defaultNetwork: 'testnet', // remove comment only when working with Hedera DLT
    // remove comment only when working with Hedera DLT
    /*hedera: {
        gasLimit: 300000,
        networks: {
            testnet: {
                accounts: [
                    {
                        account:
                            process.env['TESTNET_HEDERA_OPERATOR_ACCOUNT'] ??
                            '',
                        privateKey:
                            process.env['TESTNET_HEDERA_OPERATOR_PRIVATEKEY'] ??
                            '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_1'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_1'
                            ] ?? '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_2'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_2'
                            ] ?? '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_3'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_3'
                            ] ?? '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_4'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_4'
                            ] ?? '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_5'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_5'
                            ] ?? '',
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_ACCOUNT_ECDSA_6'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_OPERATOR_PRIVATEKEY_ECDSA_6'
                            ] ?? '',
                    },
                ],
            },
        },
    },*/
    typechain: {
        outDir: './typechain-types',
    },
    mocha: {
        // Extend the timeout to 60 seconds (adjust as needed)
        timeout: 3000000,
    },
}

export default config
