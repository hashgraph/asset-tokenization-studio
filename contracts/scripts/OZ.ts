import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'

async function main() {
    console.log(
        '🚀 Starting OpenZeppelin ERC20Votes deployment and interaction...'
    )

    // Get signers
    const [deployer, user1, user2] = await ethers.getSigners()
    console.log('📝 Deployer address:', deployer.address)
    console.log('👤 User1 address:', user1.address)
    console.log('👤 User2 address:', user2.address)

    // Constants for contract deployment
    const TOKEN_NAME = 'VotingToken'
    const TOKEN_SYMBOL = 'VOTE'

    const DELEGATE_DEADLINE = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

    try {
        console.log('\n📦 Deploying TestERC20Votes contract...')
        const TestERC20VotesFactory: ContractFactory =
            await ethers.getContractFactory('TestERC20Votes')
        const testERC20Votes: Contract = await TestERC20VotesFactory.deploy(
            TOKEN_NAME,
            TOKEN_SYMBOL
        )
        await testERC20Votes.deployed()
        console.log('✅ TestERC20Votes deployed to:', testERC20Votes.address)

        console.log('\n🗳️ Executing delegateBySig on TestERC20Votes...')

        const domain = {
            name: 'WrongName', // WRONG NAME PROVIDED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //name: TOKEN_NAME,
            version: '1',
            chainId: await ethers.provider
                .getNetwork()
                .then((net) => net.chainId),
            verifyingContract: testERC20Votes.address,
        }

        const types = {
            Delegation: [
                { name: 'delegatee', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'expiry', type: 'uint256' },
            ],
        }

        const message = {
            delegatee: user2.address,
            nonce: await testERC20Votes.nonces(user1.address),
            expiry: DELEGATE_DEADLINE,
        }

        const signature = await user1._signTypedData(domain, types, message)
        const { v, r, s } = ethers.utils.splitSignature(signature)

        const delegateBySigTx = await testERC20Votes.delegateBySig(
            user2.address,
            message.nonce,
            DELEGATE_DEADLINE,
            v,
            r,
            s
        )
        const response = await delegateBySigTx.wait()

        const delegateChangedEvent = response.events?.find(
            (e: any) => e.event === 'DelegateChanged'
        )

        console.log('✅ delegateBySig executed successfully')
        console.log('   Delegated from:', user1.address)
        console.log('   Delegated to:', user2.address)

        console.log()
        const ErrorMessage =
            user1.address == delegateChangedEvent.args.delegator
                ? '✅ All OK'
                : '❌ WRONG DELEGATOR!!!!!'

        console.log('✅ delegateBySig event reply')
        console.log(
            '   Delegated from:',
            delegateChangedEvent.args.delegator,
            ' ',
            ErrorMessage
        )
        console.log('   Delegated to:', delegateChangedEvent.args.toDelegate)
    } catch (error) {
        console.error('❌ Error during deployment or execution:', error)
        process.exit(1)
    }
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Script failed:', error)
        process.exit(1)
    })
