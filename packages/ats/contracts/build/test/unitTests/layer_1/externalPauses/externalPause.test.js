"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// contracts/test/unitTests/layer_1/externalPauses/externalPause.test.ts
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const isin_generator_1 = require("@thomaschaplin/isin-generator");
const _typechain_1 = require("@typechain");
const _scripts_1 = require("@scripts");
describe('ExternalPause Tests', () => {
    let signer_A;
    let signer_B;
    let account_A;
    let diamond;
    let factory;
    let businessLogicResolver;
    let externalPauseManagement;
    let externalPauseMock1;
    let externalPauseMock2;
    let externalPauseMock3;
    before(async () => {
        // mute | mock console.log
        console.log = () => { };
        [signer_A, signer_B] = await hardhat_1.ethers.getSigners();
        account_A = signer_A.address;
        const { ...deployedContracts } = await (0, _scripts_1.deployAtsFullInfrastructure)(await _scripts_1.DeployAtsFullInfrastructureCommand.newInstance({
            signer: signer_A,
            useDeployed: false,
            useEnvironment: false,
            timeTravelEnabled: true,
        }));
        factory = deployedContracts.factory.contract;
        businessLogicResolver = deployedContracts.businessLogicResolver.contract;
        // Deploy mock contracts for external pauses ONCE
        externalPauseMock1 = await new _typechain_1.MockedExternalPause__factory(signer_A).deploy();
        await externalPauseMock1.deployed();
        externalPauseMock2 = await new _typechain_1.MockedExternalPause__factory(signer_A).deploy();
        await externalPauseMock2.deployed();
        externalPauseMock3 = await new _typechain_1.MockedExternalPause__factory(signer_A).deploy();
        await externalPauseMock3.deployed();
    });
    beforeEach(async () => {
        // Deploy a fresh diamond proxy (implicitly initialized)
        diamond = await (0, _scripts_1.deployEquityFromFactory)({
            adminAccount: account_A,
            isWhiteList: false,
            isControllable: true,
            arePartitionsProtected: false,
            clearingActive: false,
            internalKycActivated: true,
            isMultiPartition: false,
            name: 'TEST_ExternalPause',
            symbol: 'TEP',
            decimals: 6,
            isin: (0, isin_generator_1.isinGenerator)(),
            votingRight: false,
            informationRight: false,
            liquidationRight: false,
            subscriptionRight: true,
            conversionRight: true,
            redemptionRight: true,
            putRight: false,
            dividendRight: 1,
            currency: '0x345678',
            numberOfShares: _scripts_1.MAX_UINT256,
            nominalValue: 100,
            regulationType: _scripts_1.RegulationType.REG_S,
            regulationSubType: _scripts_1.RegulationSubType.NONE,
            countriesControlListType: true,
            listOfCountries: 'ES,FR,CH',
            info: 'nothing',
            factory: factory,
            businessLogicResolver: businessLogicResolver.address,
        });
        externalPauseManagement = _typechain_1.ExternalPauseManagement__factory.connect(diamond.address, signer_A);
        // Grant PAUSE_MANAGER_ROLE to signer_A
        const accessControlFacet = _typechain_1.AccessControlFacet__factory.connect(diamond.address, signer_A);
        await accessControlFacet.grantRole(_scripts_1.PAUSE_MANAGER_ROLE, account_A);
        // Set up the external pause mocks
        await externalPauseMock1.setPaused(false, {
            gasLimit: _scripts_1.GAS_LIMIT.default,
        });
        await externalPauseMock2.setPaused(false, {
            gasLimit: _scripts_1.GAS_LIMIT.default,
        });
        await externalPauseMock3.setPaused(false, {
            gasLimit: _scripts_1.GAS_LIMIT.default,
        });
        // Add the default pauses needed for most tests using addExternalPause
        try {
            // Ensure mocks are not already present if deployEquityFromFactory adds defaults
            if (!(await externalPauseManagement.isExternalPause(externalPauseMock1.address))) {
                await externalPauseManagement.addExternalPause(externalPauseMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            if (!(await externalPauseManagement.isExternalPause(externalPauseMock2.address))) {
                await externalPauseManagement.addExternalPause(externalPauseMock2.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            // Ensure mock3 is not present at start of tests
            if (await externalPauseManagement.isExternalPause(externalPauseMock3.address)) {
                await externalPauseManagement.removeExternalPause(externalPauseMock3.address);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error('Error setting up default pauses in beforeEach:', e.message);
            }
            else {
                console.error('Error setting up default pauses in beforeEach:', e);
            }
            throw e;
        }
    });
    describe('Add Tests', () => {
        it('GIVEN an unlisted external pause WHEN added THEN it is listed and event is emitted', async () => {
            const newPause = externalPauseMock3.address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(newPause)).to
                .be.false;
            const initialCount = await externalPauseManagement.getExternalPausesCount();
            await (0, chai_1.expect)(externalPauseManagement.addExternalPause(newPause, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalPauseManagement, 'AddedToExternalPauses')
                .withArgs(signer_A.address, newPause);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(newPause)).to
                .be.true;
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.add(1));
        });
        it('GIVEN a listed external pause WHEN adding it again THEN it reverts with ListedPause', async () => {
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalPauseManagement.addExternalPause(externalPauseMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.revertedWithCustomError(externalPauseManagement, 'ListedPause');
        });
    });
    describe('Remove Tests', () => {
        it('GIVEN a listed external pause WHEN removed THEN it is unlisted and event is emitted', async () => {
            const pauseToRemove = externalPauseMock1.address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(pauseToRemove))
                .to.be.true;
            const initialCount = await externalPauseManagement.getExternalPausesCount();
            await (0, chai_1.expect)(externalPauseManagement.removeExternalPause(pauseToRemove, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalPauseManagement, 'RemovedFromExternalPauses')
                .withArgs(signer_A.address, pauseToRemove);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(pauseToRemove))
                .to.be.false;
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.sub(1));
        });
        it('GIVEN an unlisted external pause WHEN removing THEN it reverts with UnlistedPause', async () => {
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(randomAddress))
                .to.be.false;
            await (0, chai_1.expect)(externalPauseManagement.removeExternalPause(randomAddress, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.revertedWithCustomError(externalPauseManagement, 'UnlistedPause');
        });
    });
    describe('Update Tests', () => {
        it('GIVEN multiple external pauses WHEN updated THEN their statuses are updated and event is emitted', async () => {
            // Initial state: mock1=true, mock2=true. Verify.
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.false;
            const initialCount = await externalPauseManagement.getExternalPausesCount();
            (0, chai_1.expect)(initialCount).to.equal(2);
            const pausesToUpdate = [
                externalPauseMock2.address,
                externalPauseMock3.address,
            ];
            const activesToUpdate = [false, true]; // Corresponds to removing mock2, adding mock3
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pausesToUpdate, activesToUpdate, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalPauseManagement, 'ExternalPausesUpdated')
                .withArgs(signer_A.address, pausesToUpdate, activesToUpdate);
            // Verify final state
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true; // mock1 untouched
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.false; // mock2 removed
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.true; // mock3 added
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.sub(1).add(1)); // 2 - 1 + 1 = 2
        });
        it('GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicatePause = externalPauseMock3.address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(duplicatePause)).to.be.false;
            const pauses = [duplicatePause, duplicatePause];
            const actives = [true, false];
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalPauseManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicatePause = externalPauseMock1.address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(duplicatePause)).to.be.true;
            const pauses = [duplicatePause, duplicatePause];
            const actives = [false, true];
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalPauseManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN empty arrays WHEN updating THEN it succeeds and emits event', async () => {
            const initialCount = await externalPauseManagement.getExternalPausesCount();
            const pauses = [];
            const actives = [];
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalPauseManagement, 'ExternalPausesUpdated')
                .withArgs(signer_A.address, pauses, actives);
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount);
        });
    });
    describe('View/Getter Functions', () => {
        it('GIVEN listed and unlisted addresses WHEN isExternalPause is called THEN it returns the correct status', async () => {
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(randomAddress))
                .to.be.false;
            await externalPauseManagement.addExternalPause(externalPauseMock3.address);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.true;
        });
        it('GIVEN external pauses WHEN getExternalPausesCount is called THEN it returns the current count', async () => {
            const initialCount = await externalPauseManagement.getExternalPausesCount();
            (0, chai_1.expect)(initialCount).to.equal(2); // From beforeEach
            await externalPauseManagement.addExternalPause(externalPauseMock3.address);
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.add(1)); // 3
            await externalPauseManagement.removeExternalPause(externalPauseMock1.address);
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount); // 2
            await externalPauseManagement.removeExternalPause(externalPauseMock2.address);
            await externalPauseManagement.removeExternalPause(externalPauseMock3.address);
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(0);
        });
        it('GIVEN external pauses WHEN getExternalPausesMembers is called THEN it returns paginated members', async () => {
            (0, chai_1.expect)(await externalPauseManagement.getExternalPausesCount()).to.equal(2); // From beforeEach
            let membersPage = await externalPauseManagement.getExternalPausesMembers(0, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalPauseMock1.address,
                externalPauseMock2.address,
            ]).to.include(membersPage[0]);
            membersPage =
                await externalPauseManagement.getExternalPausesMembers(1, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalPauseMock1.address,
                externalPauseMock2.address,
            ]).to.include(membersPage[0]);
            (0, chai_1.expect)(membersPage[0]).to.not.equal((await externalPauseManagement.getExternalPausesMembers(0, 1))[0]);
            let allMembers = await externalPauseManagement.getExternalPausesMembers(0, 2);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(2);
            (0, chai_1.expect)(allMembers).to.contain(externalPauseMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalPauseMock2.address);
            await externalPauseManagement.addExternalPause(externalPauseMock3.address);
            allMembers = await externalPauseManagement.getExternalPausesMembers(0, 3);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(3);
            (0, chai_1.expect)(allMembers).to.contain(externalPauseMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalPauseMock2.address);
            (0, chai_1.expect)(allMembers).to.contain(externalPauseMock3.address);
            membersPage =
                await externalPauseManagement.getExternalPausesMembers(1, 2);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            membersPage =
                await externalPauseManagement.getExternalPausesMembers(3, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(0);
            await externalPauseManagement.removeExternalPause(externalPauseMock1.address);
            await externalPauseManagement.removeExternalPause(externalPauseMock2.address);
            await externalPauseManagement.removeExternalPause(externalPauseMock3.address);
            allMembers = await externalPauseManagement.getExternalPausesMembers(0, 5);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(0);
        });
    });
    describe('Pause Modifier Tests (onlyUnpaused)', () => {
        it('GIVEN an external pause is paused WHEN calling a function with onlyUnpaused THEN it reverts with TokenIsPaused', async () => {
            await externalPauseMock1.setPaused(true, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            });
            // Use externalPauseManagement instance for error checking as Common interface loading failed
            await (0, chai_1.expect)(externalPauseManagement.addExternalPause(externalPauseMock3.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.revertedWithCustomError(externalPauseManagement, 'TokenIsPaused'); // Assumes TokenIsPaused is inherited/available
            await (0, chai_1.expect)(externalPauseManagement.removeExternalPause(externalPauseMock2.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.revertedWithCustomError(externalPauseManagement, 'TokenIsPaused');
            const pauses = [externalPauseMock2.address];
            const actives = [false];
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalPauseManagement, 'TokenIsPaused');
        });
        it('GIVEN all external pauses are unpaused WHEN calling a function with onlyUnpaused THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalPauseMock1.isPaused()).to.be.false;
            (0, chai_1.expect)(await externalPauseMock2.isPaused()).to.be.false;
            await (0, chai_1.expect)(externalPauseManagement.addExternalPause(externalPauseMock3.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.not.be.reverted;
            await (0, chai_1.expect)(externalPauseManagement.removeExternalPause(externalPauseMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.not.be.reverted;
            const pauses = [externalPauseMock2.address];
            const actives = [false];
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.not.be.reverted;
        });
    });
    describe('Access Control Tests', () => {
        it('GIVEN an account without PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it reverts with AccessControl', async () => {
            const newPause = externalPauseMock3.address;
            await (0, chai_1.expect)(externalPauseManagement
                .connect(signer_B)
                .addExternalPause(newPause, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it succeeds', async () => {
            const newPause = externalPauseMock3.address;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(newPause)).to
                .be.false;
            await (0, chai_1.expect)(externalPauseManagement.addExternalPause(newPause, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalPauseManagement, 'AddedToExternalPauses')
                .withArgs(account_A, newPause);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(newPause)).to
                .be.true;
        });
        it('GIVEN an account without PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it reverts with AccessControl', async () => {
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            // --- FIX: Check for custom error ---
            await (0, chai_1.expect)(externalPauseManagement
                .connect(signer_B)
                .removeExternalPause(externalPauseMock1.address, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalPauseManagement.removeExternalPause(externalPauseMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default }))
                .to.emit(externalPauseManagement, 'RemovedFromExternalPauses')
                .withArgs(account_A, externalPauseMock1.address);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.false;
        });
        it('GIVEN an account without PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it reverts with AccessControl', async () => {
            const pauses = [externalPauseMock1.address];
            const actives = [false];
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalPauseManagement
                .connect(signer_B)
                .updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
            const pauses = [
                externalPauseMock1.address,
                externalPauseMock2.address,
            ];
            const actives = [false, true]; // Remove mock1, keep mock2
            await (0, chai_1.expect)(externalPauseManagement.updateExternalPauses(pauses, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalPauseManagement, 'ExternalPausesUpdated')
                .withArgs(account_A, pauses, actives);
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.false;
            (0, chai_1.expect)(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
        });
    });
});
