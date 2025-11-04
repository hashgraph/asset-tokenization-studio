// SPDX-License-Identifier: Apache-2.0

/**
 * ProxyAdmin deployment module.
 *
 * High-level operation for deploying ProxyAdmin using TypeChain.
 *
 * @module core/operations/proxyAdminDeployment
 */

import { Overrides, Signer } from 'ethers'
import { ProxyAdmin, ProxyAdmin__factory } from '@contract-types'
import {
    error as logError,
    extractRevertReason,
    getProxyAdmin,
    info,
    section,
    success,
    validateAddress,
} from '@scripts/infrastructure'

/**
 * Deploy ProxyAdmin contract.
 *
 * Returns typed ProxyAdmin contract instance for proxy management.
 *
 * @param signer - Ethers.js signer
 * @param overrides - Optional transaction overrides
 * @returns Typed ProxyAdmin contract instance
 *
 * @example
 * ```typescript
 * import { ethers } from 'hardhat'
 * import { deployProxyAdmin } from '@scripts/infrastructure'
 *
 * const signer = (await ethers.getSigners())[0]
 * const proxyAdmin = await deployProxyAdmin(signer)
 *
 * console.log(`ProxyAdmin: ${proxyAdmin.address}`)
 * ```
 */
export async function deployProxyAdmin(
    signer: Signer,
    overrides?: Overrides
): Promise<ProxyAdmin> {
    section('Deploying ProxyAdmin')

    try {
        info('Deploying ProxyAdmin...')

        const proxyAdmin = await new ProxyAdmin__factory(signer).deploy(
            overrides || {}
        )
        await proxyAdmin.deployed()

        success('ProxyAdmin deployment complete')
        info(`  ProxyAdmin: ${proxyAdmin.address}`)

        return proxyAdmin
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        logError(`ProxyAdmin deployment failed: ${errorMessage}`)

        throw new Error(`ProxyAdmin deployment failed: ${errorMessage}`)
    }
}

/**
 * Transfer proxy admin ownership.
 *
 * Changes the admin of a proxy to a new address. This is useful when
 * consolidating multiple proxies under a single ProxyAdmin.
 *
 * @param proxyAdmin - Typed ProxyAdmin contract
 * @param proxyAddress - Proxy address whose admin to transfer
 * @param newAdmin - New admin address
 * @param overrides - Optional transaction overrides
 * @returns true if transfer succeeded
 *
 * @example
 * ```typescript
 * await transferProxyAdmin(proxyAdmin, '0x456...', '0x789...')
 * ```
 */
export async function transferProxyAdmin(
    proxyAdmin: ProxyAdmin,
    proxyAddress: string,
    newAdmin: string,
    overrides?: Overrides
): Promise<boolean> {
    try {
        info('Transferring proxy admin...')

        validateAddress(proxyAddress, 'proxy address')
        validateAddress(newAdmin, 'new admin address')

        const tx = await proxyAdmin.changeProxyAdmin(
            proxyAddress,
            newAdmin,
            overrides || {}
        )
        await tx.wait()

        success('Proxy admin transferred')
        info(`  Proxy: ${proxyAddress}`)
        info(`  New Admin: ${newAdmin}`)

        return true
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Transfer proxy admin failed: ${errorMessage}`)
        return false
    }
}

/**
 * Transfer ownership of a ProxyAdmin.
 *
 * @param proxyAdmin - Typed ProxyAdmin contract
 * @param newOwner - New owner address
 * @param overrides - Optional transaction overrides
 * @returns true if transfer succeeded
 *
 * @example
 * ```typescript
 * await transferProxyAdminOwnership(proxyAdmin, '0x456...')
 * ```
 */
export async function transferProxyAdminOwnership(
    proxyAdmin: ProxyAdmin,
    newOwner: string,
    overrides?: Overrides
): Promise<boolean> {
    try {
        info('Transferring ProxyAdmin ownership...')

        validateAddress(newOwner, 'new owner address')

        const tx = await proxyAdmin.transferOwnership(newOwner, overrides || {})
        await tx.wait()

        success('ProxyAdmin ownership transferred')
        info(`  New Owner: ${newOwner}`)

        return true
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Transfer ownership failed: ${errorMessage}`)
        return false
    }
}

/**
 * Verify ProxyAdmin controls a proxy.
 *
 * @param proxyAdmin - Typed ProxyAdmin contract
 * @param proxyAddress - Proxy address
 * @param signer - Signer to read proxy admin (needed for getProxyAdmin call)
 * @returns true if ProxyAdmin controls the proxy
 *
 * @example
 * ```typescript
 * const controls = await verifyProxyAdminControls(
 *   proxyAdmin,
 *   '0xProxy...',
 *   signer
 * )
 * ```
 */
export async function verifyProxyAdminControls(
    proxyAdmin: ProxyAdmin,
    proxyAddress: string,
    signer: Signer
): Promise<boolean> {
    try {
        validateAddress(proxyAddress, 'proxy address')

        const actualAdmin = await getProxyAdmin(signer.provider!, proxyAddress)

        return actualAdmin.toLowerCase() === proxyAdmin.address.toLowerCase()
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Verification failed: ${errorMessage}`)
        return false
    }
}
