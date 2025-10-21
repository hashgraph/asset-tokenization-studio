// SPDX-License-Identifier: Apache-2.0

/**
 * Hardhat-specific deployment provider implementation.
 *
 * This provider uses Hardhat's ethers integration for contract deployment.
 * It is framework-dependent and requires the Hardhat runtime environment.
 *
 * For framework-independent deployment, use StandaloneProvider instead.
 *
 * @module core/providers/hardhatProvider
 */

import { Contract, ContractFactory, Signer, Overrides, providers } from 'ethers'
import { DeploymentProvider, debug } from '@scripts/infrastructure'
import {
    ProxyAdmin__factory,
    TransparentUpgradeableProxy__factory,
} from '@typechain'

// Dynamically import hardhat ethers to avoid compile-time dependency
const getHardhatEthers = (): any => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const hre = require('hardhat')
    return hre.ethers
}

/**
 * Hardhat-based deployment provider implementation.
 * Uses Hardhat's ethers integration for contract deployment.
 *
 * **Hardhat Dependency**: This provider requires Hardhat runtime and cannot
 * be used from non-Hardhat projects. Use StandaloneProvider for framework-independent deployments.
 */
export class HardhatProvider implements DeploymentProvider {
    private signer?: Signer

    /**
     * Get a signer for transactions.
     * Caches the signer for performance.
     *
     * @returns Promise resolving to a Signer instance
     * @throws Error if no signers available from Hardhat
     */
    async getSigner(): Promise<Signer> {
        if (!this.signer) {
            const ethers = getHardhatEthers()
            debug('[HardhatProvider] Getting signers from ethers...')
            const signers = await ethers.getSigners()
            debug(`[HardhatProvider] Found ${signers.length} signers`)
            if (signers.length === 0) {
                throw new Error('No signers available from Hardhat')
            }
            const signer = signers[0]
            const address = await signer.getAddress()
            debug(`[HardhatProvider] Using signer: ${address}`)
            this.signer = signer
        }
        // TypeScript doesn't know we set this.signer above, so assert it's not undefined
        if (!this.signer) {
            throw new Error('Signer not initialized')
        }
        return this.signer
    }

    /**
     * Get a contract factory by name.
     * Uses Hardhat's ethers.getContractFactory().
     *
     * @param contractName - Name of contract (e.g., 'AccessControlFacet')
     * @returns Promise resolving to ContractFactory instance
     * @throws Error if contract factory cannot be retrieved
     */
    async getFactory(contractName: string): Promise<ContractFactory> {
        try {
            const ethers = getHardhatEthers()
            const signer = await this.getSigner()
            return await ethers.getContractFactory(contractName, signer)
        } catch (error) {
            throw new Error(
                `Failed to get factory for contract '${contractName}': ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Deploy a contract.
     *
     * @param factory - Contract factory
     * @param args - Constructor arguments (optional)
     * @param overrides - Transaction overrides (gas, gasPrice, etc.)
     * @returns Promise resolving to deployed Contract instance
     * @throws Error if deployment fails
     */
    async deploy(
        factory: ContractFactory,
        args: any[] = [],
        overrides?: Overrides
    ): Promise<Contract> {
        try {
            const contract = await factory.deploy(...args, overrides || {})
            await contract.deployed()
            return contract
        } catch (error) {
            throw new Error(
                `Failed to deploy contract: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Deploy a TransparentUpgradeableProxy.
     *
     * @param implementationAddress - Address of implementation contract
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param initData - Initialization data (encoded function call), defaults to '0x'
     * @param overrides - Transaction overrides
     * @returns Promise resolving to deployed proxy Contract
     * @throws Error if proxy deployment fails
     */
    async deployProxy(
        implementationAddress: string,
        proxyAdminAddress: string,
        initData: string = '0x',
        overrides?: Overrides
    ): Promise<Contract> {
        try {
            const signer = await this.getSigner()
            const proxyFactory = new TransparentUpgradeableProxy__factory(
                signer
            )

            const proxy = await proxyFactory.deploy(
                implementationAddress,
                proxyAdminAddress,
                initData,
                overrides || {}
            )
            await proxy.deployed()

            return proxy
        } catch (error) {
            throw new Error(
                `Failed to deploy proxy: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Upgrade a proxy implementation.
     *
     * @param proxyAddress - Address of the proxy to upgrade
     * @param newImplementationAddress - Address of new implementation
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param overrides - Transaction overrides
     * @returns Promise resolving when upgrade is complete
     * @throws Error if upgrade fails
     */
    async upgradeProxy(
        proxyAddress: string,
        newImplementationAddress: string,
        proxyAdminAddress: string,
        overrides?: Overrides
    ): Promise<void> {
        try {
            const signer = await this.getSigner()
            const proxyAdmin = ProxyAdmin__factory.connect(
                proxyAdminAddress,
                signer
            )

            const tx = await proxyAdmin.upgrade(
                proxyAddress,
                newImplementationAddress,
                overrides || {}
            )
            await tx.wait()
        } catch (error) {
            throw new Error(
                `Failed to upgrade proxy: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Get provider for read operations.
     *
     * @returns Provider instance for reading blockchain state
     */
    getProvider(): providers.Provider {
        const ethers = getHardhatEthers()
        return ethers.provider
    }
}
