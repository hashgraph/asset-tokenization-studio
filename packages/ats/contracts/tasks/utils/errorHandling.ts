import { ADDRESS_ZERO } from '@scripts'
import { exec } from 'child_process'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

/**
 * Enhanced exec wrapper with improved error handling
 * @param command - The command to execute
 * @param description - Human-readable description of what the command does
 * @returns Promise that resolves with stdout or rejects with enhanced error
 */
export const execWithErrorHandling = (
    command: string,
    description: string = 'command'
): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to execute ${description}: ${command}`)
                console.error(`Error details: ${error.message}`)
                console.error(`Exit code: ${error.code}`)
                if (error.signal) {
                    console.error(`Killed by signal: ${error.signal}`)
                }
                return reject(
                    new Error(`${description} failed: ${error.message}`)
                )
            }

            if (stderr) {
                console.warn(`${description} warnings/errors: ${stderr}`)
                // Don't reject on stderr alone, as many tools output warnings to stderr
            }

            if (stdout.trim()) {
                console.log(`${description} output: ${stdout}`)
            }

            resolve(stdout)
        })
    })
}

/**
 * Validates Ethereum addresses and provides helpful error messages
 * @param address - The address to validate
 * @param paramName - The parameter name for error messages
 * @param hre - Hardhat runtime environment for address validation
 * @param allowZeroAddress - Whether to allow zero address (default: true)
 */
export const validateAddress = (
    address: string,
    paramName: string,
    hre: HardhatRuntimeEnvironment,
    allowZeroAddress: boolean = true
): void => {
    if (!allowZeroAddress && address === ADDRESS_ZERO) {
        throw new Error(`${paramName} cannot be zero address`)
    }

    if (address !== ADDRESS_ZERO && !hre.ethers.utils.isAddress(address)) {
        throw new Error(`Invalid address format for ${paramName}: ${address}`)
    }
}

/**
 * Validates deployment parameters and provides warnings for zero addresses
 * @param params - Object containing parameter names and addresses to validate
 * @param hre - Hardhat runtime environment
 * @param options - Validation options
 */
export const validateDeploymentParams = (
    params: Record<string, string>,
    hre: HardhatRuntimeEnvironment,
    options: {
        allowZeroAddress?: boolean
        warnOnZeroAddress?: boolean
        strict?: boolean
    } = {}
): void => {
    const {
        allowZeroAddress = true,
        warnOnZeroAddress = true,
        strict = false,
    } = options

    console.log('📋 Deployment Parameter Validation:')

    for (const [paramName, address] of Object.entries(params)) {
        // Validate address format
        validateAddress(address, paramName, hre, allowZeroAddress)

        // Warn about zero addresses if enabled
        if (warnOnZeroAddress && address === ADDRESS_ZERO) {
            const level = strict ? 'ERROR' : 'WARNING'
            console.warn(
                `⚠️  ${level}: ${paramName} is set to zero address. This may not be intended for production deployments.`
            )

            if (strict) {
                throw new Error(
                    `${paramName} cannot be zero address in strict mode`
                )
            }
        }

        console.log(`   ✅ ${paramName}: ${address}`)
    }
}
