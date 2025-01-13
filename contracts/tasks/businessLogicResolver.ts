import { task, types } from 'hardhat/config'
import {
    GetConfigurationInfoArgs,
    GetResolverBusinessLogicsArgs,
    GetSignerResult,
    UpdateBusinessLogicKeysArgs,
} from './index'

task('getConfigurationInfo', 'Get all info for a given configuration')
    .addPositionalParam(
        'resolver',
        'The resolver proxy admin address',
        undefined,
        types.string
    )
    .addPositionalParam(
        'configurationId',
        'The config ID',
        undefined,
        types.string
    )
    .setAction(async (args: GetConfigurationInfoArgs, hre) => {
        console.log(`Executing getConfigurationInfo on ${hre.network.name} ...`)

        const {
            getFacetsByConfigurationIdAndVersion,
            GetFacetsByConfigurationIdAndVersionQuery,
        } = await import('../scripts/index')

        const query = new GetFacetsByConfigurationIdAndVersionQuery({
            businessLogicResolverAddress: args.resolver,
            configurationId: args.configurationId,
            provider: hre.ethers.provider,
        })

        const { facetListRecord } = await getFacetsByConfigurationIdAndVersion(
            query
        )

        Object.entries(facetListRecord).forEach(([version, facetList]) => {
            console.log(
                `Number of Facets for Config ${facetList[0].id} and Version ${version}: ${facetList.length}`
            )
            facetList.forEach((facet, index) => {
                console.log(`Facet ${index + 1}:`)
                console.log(`  ID: ${facet.id}`)
                console.log(`  Address: ${facet.addr}`)
                console.log(
                    `  Selectors: ${JSON.stringify(facet.selectors, null, 2)}`
                )
                console.log(
                    `  Interface IDs: ${JSON.stringify(
                        facet.interfaceIds,
                        null,
                        2
                    )}`
                )
                console.log('-------------------------')
            })
        })
    })

task('getResolverBusinessLogics', 'Get business logics from resolver')
    .addPositionalParam(
        'resolver',
        'The resolver proxy admin address',
        undefined,
        types.string
    )
    .addOptionalParam(
        'privateKey',
        'The private key of the account in raw hexadecimal format',
        undefined,
        types.string
    )
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam(
        'signerPosition',
        'The index of the signer in the Hardhat signers array',
        undefined,
        types.int
    )
    .setAction(async (args: GetResolverBusinessLogicsArgs, hre) => {
        console.log(
            `Executing getResolverBusinessLogics on ${hre.network.name} ...`
        )
        const { IBusinessLogicResolver__factory } = await import(
            '../typechain-types'
        )

        // Fetch business logic keys
        const businessLogicKeys = await IBusinessLogicResolver__factory.connect(
            args.resolver,
            hre.ethers.provider
        ).getBusinessLogicKeys(0, 100)

        // Log the business logic keys
        console.log('Business Logic Keys:')
        businessLogicKeys.forEach((key: string, index: number) => {
            console.log(`  Key ${index + 1}: ${key}`)
        })
    })

task('updateBusinessLogicKeys', 'Update the address of a business logic key')
    .addPositionalParam(
        'resolverAddress',
        'The BusinessLogicResolver Contract address',
        undefined,
        types.string
    )
    .addPositionalParam(
        'implementationAddressList',
        'The implementation contract list to update. List of comma separated contract addresses',
        undefined,
        types.string
    )
    .addOptionalParam(
        'privateKey',
        'The private key of the account in raw hexadecimal format',
        undefined,
        types.string
    )
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam(
        'signerPosition',
        'The index of the signer in the Hardhat signers array',
        undefined,
        types.int
    )
    .setAction(async (args: UpdateBusinessLogicKeysArgs, hre) => {
        // Inlined import due to circular dependency
        const { registerBusinessLogics, RegisterBusinessLogicsCommand } =
            await import('../scripts')
        console.log(
            `Executing updateBusinessLogicKeys on ${hre.network.name} ...`
        )
        const {
            privateKey,
            signerAddress,
            signerPosition,
            resolverAddress,
            implementationAddressList,
        } = args
        const { signer }: GetSignerResult = await hre.run('getSigner', {
            privateKey: privateKey,
            signerAddress: signerAddress,
            signerPosition: signerPosition,
        })

        const implementationList = implementationAddressList.split(',')
        await registerBusinessLogics(
            new RegisterBusinessLogicsCommand({
                contractAddressList: implementationList,
                businessLogicResolverProxyAddress: resolverAddress,
                signer,
            })
        )
    })
