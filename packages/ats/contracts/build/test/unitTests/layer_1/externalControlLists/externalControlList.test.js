"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const isin_generator_1 = require("@thomaschaplin/isin-generator");
const _typechain_1 = require("@typechain");
const _scripts_1 = require("@scripts");
describe('ExternalControlList Management Tests', () => {
    let signer_A;
    let signer_B;
    let account_A;
    let diamond;
    let factory;
    let businessLogicResolver;
    let externalControlListManagement;
    let externalWhitelistMock1;
    let externalBlacklistMock1;
    let externalWhitelistMock2;
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
        // Deploy mock contracts for external control lists ONCE
        externalWhitelistMock1 = await new _typechain_1.MockedWhitelist__factory(signer_A).deploy();
        await externalWhitelistMock1.deployed();
        externalBlacklistMock1 = await new _typechain_1.MockedBlacklist__factory(signer_A).deploy();
        await externalBlacklistMock1.deployed();
        externalWhitelistMock2 = await new _typechain_1.MockedWhitelist__factory(signer_A).deploy();
        await externalWhitelistMock2.deployed();
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
            name: 'TEST_ExternalControlList',
            symbol: 'TECL',
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
        externalControlListManagement =
            _typechain_1.ExternalControlListManagement__factory.connect(diamond.address, signer_A);
        // Connect to AccessControlFacet for granting roles
        const accessControlFacet = _typechain_1.AccessControlFacet__factory.connect(diamond.address, signer_A);
        // Grant _CONTROL_LIST_MANAGER_ROLE to signer_A
        await accessControlFacet.grantRole(_scripts_1._CONTROL_LIST_MANAGER_ROLE, account_A);
        // Add default control lists needed for most tests using addExternalControlList
        try {
            // Ensure mocks are not already present if deployEquityFromFactory adds defaults
            if (!(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address))) {
                await externalControlListManagement.addExternalControlList(externalWhitelistMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            if (!(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address))) {
                await externalControlListManagement.addExternalControlList(externalBlacklistMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            // Ensure mock2 is not present at start of tests
            if (await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)) {
                await externalControlListManagement.removeExternalControlList(externalWhitelistMock2.address);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error('Error setting up default control lists in beforeEach:', e.message);
            }
            else {
                console.error('Error setting up default control lists in beforeEach:', e);
            }
            throw e;
        }
    });
    describe('Add Tests', () => {
        it('GIVEN an unlisted external control list WHEN added THEN it is listed and event is emitted', async () => {
            const newControlList = externalWhitelistMock2.address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(newControlList)).to.be.false;
            const initialCount = await externalControlListManagement.getExternalControlListsCount();
            await (0, chai_1.expect)(externalControlListManagement.addExternalControlList(newControlList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalControlListManagement, 'AddedToExternalControlLists')
                .withArgs(signer_A.address, newControlList);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(newControlList)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount.add(1));
        });
        it('GIVEN a listed external control list WHEN adding it again THEN it reverts with ListedControlList', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalControlListManagement.addExternalControlList(externalWhitelistMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.revertedWithCustomError(externalControlListManagement, 'ListedControlList');
        });
    });
    describe('Remove Tests', () => {
        it('GIVEN a listed external control list WHEN removed THEN it is unlisted and event is emitted', async () => {
            const controlListToRemove = externalWhitelistMock1.address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(controlListToRemove)).to.be.true;
            const initialCount = await externalControlListManagement.getExternalControlListsCount();
            await (0, chai_1.expect)(externalControlListManagement.removeExternalControlList(controlListToRemove, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalControlListManagement, 'RemovedFromExternalControlLists')
                .withArgs(signer_A.address, controlListToRemove);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(controlListToRemove)).to.be.false;
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount.sub(1));
        });
        it('GIVEN an unlisted external control list WHEN removing THEN it reverts with UnlistedControlList', async () => {
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(randomAddress)).to.be.false;
            await (0, chai_1.expect)(externalControlListManagement.removeExternalControlList(randomAddress, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.revertedWithCustomError(externalControlListManagement, 'UnlistedControlList');
        });
    });
    describe('Update Tests', () => {
        it('GIVEN multiple external control lists WHEN updated THEN their statuses are updated and event is emitted', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.false;
            const initialCount = await externalControlListManagement.getExternalControlListsCount();
            (0, chai_1.expect)(initialCount).to.equal(2);
            const controlListsToUpdate = [
                externalBlacklistMock1.address,
                externalWhitelistMock2.address,
            ];
            const activesToUpdate = [false, true];
            await (0, chai_1.expect)(externalControlListManagement.updateExternalControlLists(controlListsToUpdate, activesToUpdate, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalControlListManagement, 'ExternalControlListsUpdated')
                .withArgs(signer_A.address, controlListsToUpdate, activesToUpdate);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.false;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount.sub(1).add(1));
        });
        it('GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateControlList = externalWhitelistMock2.address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(duplicateControlList)).to.be.false;
            const controlLists = [duplicateControlList, duplicateControlList];
            const actives = [true, false];
            await (0, chai_1.expect)(externalControlListManagement.updateExternalControlLists(controlLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalControlListManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateControlList = externalWhitelistMock1.address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(duplicateControlList)).to.be.true;
            const controlLists = [duplicateControlList, duplicateControlList];
            const actives = [false, true];
            await (0, chai_1.expect)(externalControlListManagement.updateExternalControlLists(controlLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalControlListManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN empty arrays WHEN updating THEN it succeeds and emits event', async () => {
            const initialCount = await externalControlListManagement.getExternalControlListsCount();
            const controlLists = [];
            const actives = [];
            await (0, chai_1.expect)(externalControlListManagement.updateExternalControlLists(controlLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalControlListManagement, 'ExternalControlListsUpdated')
                .withArgs(signer_A.address, controlLists, actives);
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount);
        });
    });
    describe('View/Getter Functions', () => {
        it('GIVEN listed and unlisted addresses WHEN isExternalControlList is called THEN it returns the correct status', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(randomAddress)).to.be.false;
            await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.true;
        });
        it('GIVEN external control lists WHEN getExternalControlListsCount is called THEN it returns the current count', async () => {
            const initialCount = await externalControlListManagement.getExternalControlListsCount();
            (0, chai_1.expect)(initialCount).to.equal(2);
            await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount.add(1));
            await externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address);
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount);
            await externalControlListManagement.removeExternalControlList(externalBlacklistMock1.address);
            await externalControlListManagement.removeExternalControlList(externalWhitelistMock2.address);
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(0);
        });
        it('GIVEN external control lists WHEN getExternalControlListsMembers is called THEN it returns paginated members', async () => {
            (0, chai_1.expect)(await externalControlListManagement.getExternalControlListsCount()).to.equal(2);
            let membersPage = await externalControlListManagement.getExternalControlListsMembers(0, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalWhitelistMock1.address,
                externalBlacklistMock1.address,
            ]).to.include(membersPage[0]);
            membersPage =
                await externalControlListManagement.getExternalControlListsMembers(1, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalWhitelistMock1.address,
                externalBlacklistMock1.address,
            ]).to.include(membersPage[0]);
            (0, chai_1.expect)(membersPage[0]).to.not.equal((await externalControlListManagement.getExternalControlListsMembers(0, 1))[0]);
            let allMembers = await externalControlListManagement.getExternalControlListsMembers(0, 2);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(2);
            (0, chai_1.expect)(allMembers).to.contain(externalWhitelistMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalBlacklistMock1.address);
            await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
            allMembers =
                await externalControlListManagement.getExternalControlListsMembers(0, 3);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(3);
            (0, chai_1.expect)(allMembers).to.contain(externalWhitelistMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalBlacklistMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalWhitelistMock2.address);
            // Adjusting expectation for pagination: getting page 1 (index 1) with length 2 from 3 items
            membersPage =
                await externalControlListManagement.getExternalControlListsMembers(1, 2);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1); // Only the third item remains on the second page (index 1) if pagesize is 2.
            membersPage =
                await externalControlListManagement.getExternalControlListsMembers(3, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(0);
            await externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address);
            await externalControlListManagement.removeExternalControlList(externalBlacklistMock1.address);
            await externalControlListManagement.removeExternalControlList(externalWhitelistMock2.address);
            allMembers =
                await externalControlListManagement.getExternalControlListsMembers(0, 5);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(0);
        });
    });
    describe('Access Control Tests', () => {
        it('GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it reverts', async () => {
            const newControlList = externalWhitelistMock2.address;
            await (0, chai_1.expect)(externalControlListManagement
                .connect(signer_B)
                .addExternalControlList(newControlList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it succeeds', async () => {
            const newControlList = externalWhitelistMock2.address;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(newControlList)).to.be.false;
            await (0, chai_1.expect)(externalControlListManagement.addExternalControlList(newControlList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalControlListManagement, 'AddedToExternalControlLists')
                .withArgs(account_A, newControlList);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(newControlList)).to.be.true;
        });
        it('GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it reverts', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalControlListManagement
                .connect(signer_B)
                .removeExternalControlList(externalWhitelistMock1.address, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default }))
                .to.emit(externalControlListManagement, 'RemovedFromExternalControlLists')
                .withArgs(account_A, externalWhitelistMock1.address);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.false;
        });
        it('GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it reverts', async () => {
            const controlLists = [externalWhitelistMock1.address];
            const actives = [false];
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalControlListManagement
                .connect(signer_B)
                .updateExternalControlLists(controlLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
            const controlLists = [
                externalWhitelistMock1.address,
                externalBlacklistMock1.address,
            ];
            const actives = [false, true]; // Remove whitelist1, keep blacklist1
            await (0, chai_1.expect)(externalControlListManagement.updateExternalControlLists(controlLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalControlListManagement, 'ExternalControlListsUpdated')
                .withArgs(account_A, controlLists, actives);
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.false;
            (0, chai_1.expect)(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
        });
    });
});
