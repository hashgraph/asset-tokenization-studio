import dotenv from 'dotenv'

// Load the `.env` file
dotenv.config()

const EMPTY_STRING = ''
export const NETWORKS = [
    'hardhat',
    'local',
    'previewnet',
    'testnet',
    'mainnet',
] as const
export type Network = (typeof NETWORKS)[number]

export const DEPLOY_TYPES = ['proxy', 'direct'] as const
export type DeployType = (typeof DEPLOY_TYPES)[number]

export const CONTRACT_NAMES = [
    'TransparentUpgradeableProxy',
    'ProxyAdmin',
    'Factory',
    'BusinessLogicResolver',
    'AccessControl',
    'Cap',
    'ControlList',
    'Pause',
    'ERC20',
    'ERC1410ScheduledTasks',
    'ERC1594',
    'ERC1643',
    'ERC1644',
    'DiamondFacet',
    'EquityUSA',
    'BondUSA',
    'ScheduledSnapshots',
    'ScheduledBalanceAdjustments',
    'ScheduledTasks',
    'Snapshots',
    'CorporateActionsSecurity',
    'TransferAndLock',
    'Lock',
    'AdjustBalances',
] as const
export type ContractName = (typeof CONTRACT_NAMES)[number]
export const CONTRACT_NAMES_WITH_PROXY = ['Factory', 'BusinessLogicResolver']

export const CONTRACT_FACTORY_NAMES = CONTRACT_NAMES.map(
    (name) => `${name}__factory`
)
export type ContractFactoryName = (typeof CONTRACT_FACTORY_NAMES)[number]

export interface Endpoints {
    jsonRpc: string
    mirror: string
}

export interface DeployedContract {
    address: string
    proxyAddress?: string
    proxyAdminAddress?: string
}

export interface ContractConfig {
    name: ContractName
    factoryName: ContractFactoryName
    deployType: DeployType
    addresses?: Record<Network, DeployedContract>
}

export default class Configuration {
    // private _privateKeys: Record<Network, string[]>;
    // private _endpoints: Record<Network, Endpoints>;
    // private _contracts: Record<ContractName, ContractConfig>;

    public static get privateKeys(): Record<Network, string[]> {
        return NETWORKS.reduce((result, network) => {
            result[network] = Configuration._getEnvironmentVariableList({
                name: `${network.toUpperCase()}_PRIVATE_KEY_#`,
            })
            return result
        }, {} as Record<Network, string[]>)
    }

    public static get endpoints(): Record<Network, Endpoints> {
        return NETWORKS.reduce((result, network) => {
            result[network] = {
                jsonRpc: Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_JSON_RPC_ENDPOINT`,
                    defaultValue:
                        network === 'local'
                            ? 'http://localhost:7546'
                            : `https://${network}.hash.io/api`,
                }),
                mirror: Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_MIRROR_NODE_ENDPOINT`,
                    defaultValue:
                        network === 'local'
                            ? 'http://localhost:5551'
                            : `https://${network}.mirrornode.hedera.com`,
                }),
            }
            return result
        }, {} as Record<Network, Endpoints>)
    }

    public static get contracts(): Record<ContractName, ContractConfig> {
        const contracts: Record<ContractName, ContractConfig> = {} as Record<
            ContractName,
            ContractConfig
        >
        CONTRACT_NAMES.forEach((contractName) => {
            contracts[contractName] = {
                name: contractName,
                factoryName: `${contractName}__factory`,
                deployType: CONTRACT_NAMES_WITH_PROXY.includes(contractName)
                    ? 'proxy'
                    : 'direct',
                addresses: Configuration._getDeployedAddresses({
                    contractName,
                }),
            }
        })
        return contracts
    }

    // * Private methods

    /**
     * Retrieves the deployed contract addresses for a given contract name across different networks.
     *
     * @param {Object} params - The parameters object.
     * @param {ContractName} params.contractName - The name of the contract to get deployed addresses for.
     * @returns {Record<Network, DeployedContract>} An object mapping each network to its deployed contract details.
     *
     * The function iterates over all available networks and fetches the contract address, proxy address,
     * and proxy admin address from environment variables. If the contract address is found, it adds the
     * details to the returned object.
     */
    private static _getDeployedAddresses({
        contractName,
    }: {
        contractName: ContractName
    }): Record<Network, DeployedContract> {
        const deployedAddresses: Record<Network, DeployedContract> =
            {} as Record<Network, DeployedContract>

        NETWORKS.forEach((network) => {
            const address = Configuration._getEnvironmentVariable({
                name: `${network.toUpperCase()}_${contractName.toUpperCase()}`,
                defaultValue: EMPTY_STRING,
            })

            if (address !== EMPTY_STRING) {
                const proxyAddress = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_${contractName}_PROXY`,
                    defaultValue: EMPTY_STRING,
                })
                const proxyAdminAddress = Configuration._getEnvironmentVariable(
                    {
                        name: `${network.toUpperCase()}_${contractName}_PROXY_ADMIN`,
                        defaultValue: EMPTY_STRING,
                    }
                )

                deployedAddresses[network] = {
                    address,
                    ...(proxyAddress !== EMPTY_STRING && { proxyAddress }),
                    ...(proxyAdminAddress !== EMPTY_STRING && {
                        proxyAdminAddress,
                    }),
                }
            }
        })

        return deployedAddresses
    }

    private static _getEnvironmentVariableList({
        name,
        indexChar = '#',
    }: {
        name: string
        indexChar?: string
    }): string[] {
        let resultList: string[] = []
        let index = 0
        do {
            const env = Configuration._getEnvironmentVariable({
                name: name.replace(indexChar, `${index}`),
                defaultValue: EMPTY_STRING,
            })
            if (env !== EMPTY_STRING) {
                resultList.push(env)
            }
            index++
        } while (resultList.length === index)
        return resultList
    }

    private static _getEnvironmentVariable({
        name,
        defaultValue,
    }: {
        name: string
        defaultValue?: string
    }): string {
        const value = process.env?.[name]
        if (value) {
            return value
        }
        if (defaultValue !== undefined) {
            // console.warn(
            //     `🟠 Environment variable ${name} is not defined, Using default value: ${defaultValue}`
            // )
            return defaultValue
        }
        throw new Error(
            `Environment variable "${name}" is not defined. Please set the "${name}" environment variable.`
        )
    }
}
