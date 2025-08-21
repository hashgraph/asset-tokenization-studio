"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// contracts/test/unitTests/layer_1/externalKycLists/externalKycList.test.ts
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const isin_generator_1 = require("@thomaschaplin/isin-generator");
const _typechain_1 = require("@typechain");
const _scripts_1 = require("@scripts");
describe('ExternalKycList Management Tests', () => {
    let signer_A;
    let signer_B;
    let account_A;
    let diamond;
    let factory;
    let businessLogicResolver;
    let externalKycListManagement;
    let externalKycListMock1;
    let externalKycListMock2;
    let externalKycListMock3;
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
        // Deploy mock contracts for external kyc list ONCE
        externalKycListMock1 = await new _typechain_1.MockedExternalKycList__factory(signer_A).deploy();
        await externalKycListMock1.deployed();
        externalKycListMock2 = await new _typechain_1.MockedExternalKycList__factory(signer_A).deploy();
        await externalKycListMock2.deployed();
        externalKycListMock3 = await new _typechain_1.MockedExternalKycList__factory(signer_A).deploy();
        await externalKycListMock3.deployed();
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
            name: 'TEST_ExternalKycList',
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
        externalKycListManagement = _typechain_1.ExternalKycListManagement__factory.connect(diamond.address, signer_A);
        // Connect to AccessControlFacet for granting roles
        const accessControlFacet = _typechain_1.AccessControlFacet__factory.connect(diamond.address, signer_A);
        // Grant KYC_MANAGER_ROLE to signer_A
        await accessControlFacet.grantRole(_scripts_1.KYC_MANAGER_ROLE, account_A);
        // Add the default kyc lists needed for most tests using addExternalKycList
        try {
            // Ensure mocks are not already present if deployEquityFromFactory adds defaults
            if (!(await externalKycListManagement.isExternalKycList(externalKycListMock1.address))) {
                await externalKycListManagement.addExternalKycList(externalKycListMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            if (!(await externalKycListManagement.isExternalKycList(externalKycListMock2.address))) {
                await externalKycListManagement.addExternalKycList(externalKycListMock2.address, { gasLimit: _scripts_1.GAS_LIMIT.default });
            }
            // Ensure mock3 is not present at start of tests
            if (await externalKycListManagement.isExternalKycList(externalKycListMock3.address)) {
                await externalKycListManagement.removeExternalKycList(externalKycListMock3.address);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error('Error setting up default kyc lists in beforeEach:', e.message);
            }
            else {
                console.error('Error setting up default kyc lists in beforeEach:', e);
            }
            throw e;
        }
    });
    describe('Add Tests', () => {
        it('GIVEN an unlisted external kyc list WHEN added THEN it is listed and event is emitted', async () => {
            const newKycList = externalKycListMock3.address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(newKycList)).to.be.false;
            const initialCount = await externalKycListManagement.getExternalKycListsCount();
            await (0, chai_1.expect)(externalKycListManagement.addExternalKycList(newKycList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalKycListManagement, 'AddedToExternalKycLists')
                .withArgs(signer_A.address, newKycList);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(newKycList)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.add(1));
        });
        it('GIVEN a listed external kyc WHEN adding it again THEN it reverts with ListedKycList', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalKycListManagement.addExternalKycList(externalKycListMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default })).to.be.revertedWithCustomError(externalKycListManagement, 'ListedKycList');
        });
    });
    describe('Remove Tests', () => {
        it('GIVEN a listed external kyc WHEN removed THEN it is unlisted and event is emitted', async () => {
            const kycListToRemove = externalKycListMock1.address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.true;
            const initialCount = await externalKycListManagement.getExternalKycListsCount();
            await (0, chai_1.expect)(externalKycListManagement.removeExternalKycList(kycListToRemove, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalKycListManagement, 'RemovedFromExternalKycLists')
                .withArgs(signer_A.address, kycListToRemove);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.false;
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.sub(1));
        });
        it('GIVEN an unlisted external kyc WHEN removing THEN it reverts with UnlistedKycList', async () => {
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(randomAddress)).to.be.false;
            await (0, chai_1.expect)(externalKycListManagement.removeExternalKycList(randomAddress, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.revertedWithCustomError(externalKycListManagement, 'UnlistedKycList');
        });
    });
    describe('Update Tests', () => {
        it('GIVEN multiple external kyc WHEN updated THEN their statuses are updated and event is emitted', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.false;
            const initialCount = await externalKycListManagement.getExternalKycListsCount();
            (0, chai_1.expect)(initialCount).to.equal(2);
            const kycListsToUpdate = [
                externalKycListMock2.address,
                externalKycListMock3.address,
            ];
            const activesToUpdate = [false, true];
            await (0, chai_1.expect)(externalKycListManagement.updateExternalKycLists(kycListsToUpdate, activesToUpdate, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(signer_A.address, kycListsToUpdate, activesToUpdate);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.false;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.sub(1).add(1));
        });
        it('GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateKycList = externalKycListMock3.address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(duplicateKycList)).to.be.false;
            const kycLists = [duplicateKycList, duplicateKycList];
            const actives = [true, false];
            await (0, chai_1.expect)(externalKycListManagement.updateExternalKycLists(kycLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalKycListManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateKycList = externalKycListMock1.address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(duplicateKycList)).to.be.true;
            const kycLists = [duplicateKycList, duplicateKycList];
            const actives = [false, true];
            await (0, chai_1.expect)(externalKycListManagement.updateExternalKycLists(kycLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.revertedWithCustomError(externalKycListManagement, 'ContradictoryValuesInArray');
        });
        it('GIVEN empty arrays WHEN updating THEN it succeeds and emits event', async () => {
            const initialCount = await externalKycListManagement.getExternalKycListsCount();
            const kycLists = [];
            const actives = [];
            await (0, chai_1.expect)(externalKycListManagement.updateExternalKycLists(kycLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(signer_A.address, kycLists, actives);
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount);
        });
    });
    describe('View/Getter Functions', () => {
        it('GIVEN listed and unlisted addresses WHEN isExternalKycList is called THEN it returns the correct status', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(randomAddress)).to.be.false;
            await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.true;
        });
        it('GIVEN granted and revoked addresses WHEN isExternallyGranted is called THEN it returns the correct status', async () => {
            const randomAddress = hardhat_1.ethers.Wallet.createRandom().address;
            await externalKycListManagement.removeExternalKycList(externalKycListMock2.address, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            });
            (0, chai_1.expect)(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.false;
            await externalKycListMock1.grantKyc(randomAddress, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            });
            (0, chai_1.expect)(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.true;
            await externalKycListMock1.revokeKyc(randomAddress, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            });
            (0, chai_1.expect)(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.false;
        });
        it('GIVEN external kyc lists WHEN getExternalKycListsCount is called THEN it returns the current count', async () => {
            const initialCount = await externalKycListManagement.getExternalKycListsCount();
            (0, chai_1.expect)(initialCount).to.equal(2);
            await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.add(1));
            await externalKycListManagement.removeExternalKycList(externalKycListMock1.address);
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount);
            await externalKycListManagement.removeExternalKycList(externalKycListMock2.address);
            await externalKycListManagement.removeExternalKycList(externalKycListMock3.address);
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(0);
        });
        it('GIVEN external kyc lists WHEN getExternalKycListsMembers is called THEN it returns paginated members', async () => {
            (0, chai_1.expect)(await externalKycListManagement.getExternalKycListsCount()).to.equal(2);
            let membersPage = await externalKycListManagement.getExternalKycListsMembers(0, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalKycListMock1.address,
                externalKycListMock2.address,
            ]).to.include(membersPage[0]);
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(1, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            (0, chai_1.expect)([
                externalKycListMock1.address,
                externalKycListMock2.address,
            ]).to.include(membersPage[0]);
            (0, chai_1.expect)(membersPage[0]).to.not.equal((await externalKycListManagement.getExternalKycListsMembers(0, 1))[0]);
            let allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 2);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(2);
            (0, chai_1.expect)(allMembers).to.contain(externalKycListMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalKycListMock2.address);
            await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
            allMembers =
                await externalKycListManagement.getExternalKycListsMembers(0, 3);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(3);
            (0, chai_1.expect)(allMembers).to.contain(externalKycListMock1.address);
            (0, chai_1.expect)(allMembers).to.contain(externalKycListMock2.address);
            (0, chai_1.expect)(allMembers).to.contain(externalKycListMock3.address);
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(1, 2);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(1);
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(3, 1);
            (0, chai_1.expect)(membersPage).to.have.lengthOf(0);
            await externalKycListManagement.removeExternalKycList(externalKycListMock1.address);
            await externalKycListManagement.removeExternalKycList(externalKycListMock2.address);
            await externalKycListManagement.removeExternalKycList(externalKycListMock3.address);
            allMembers =
                await externalKycListManagement.getExternalKycListsMembers(0, 5);
            (0, chai_1.expect)(allMembers).to.have.lengthOf(0);
        });
    });
    describe('Access Control Tests', () => {
        it('GIVEN an account without KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it reverts with AccessControl', async () => {
            const newKycList = externalKycListMock3.address;
            await (0, chai_1.expect)(externalKycListManagement
                .connect(signer_B)
                .addExternalKycList(newKycList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it succeeds', async () => {
            const newKycList = externalKycListMock3.address;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(newKycList)).to.be.false;
            await (0, chai_1.expect)(externalKycListManagement.addExternalKycList(newKycList, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            }))
                .to.emit(externalKycListManagement, 'AddedToExternalKycLists')
                .withArgs(account_A, newKycList);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(newKycList)).to.be.true;
        });
        it('GIVEN an account without KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it reverts with AccessControl', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalKycListManagement
                .connect(signer_B)
                .removeExternalKycList(externalKycListMock1.address, {
                gasLimit: _scripts_1.GAS_LIMIT.default,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalKycListManagement.removeExternalKycList(externalKycListMock1.address, { gasLimit: _scripts_1.GAS_LIMIT.default }))
                .to.emit(externalKycListManagement, 'RemovedFromExternalKycLists')
                .withArgs(account_A, externalKycListMock1.address);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.false;
        });
        it('GIVEN an account without KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it reverts with AccessControl', async () => {
            const kycLists = [externalKycListMock1.address];
            const actives = [false];
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            await (0, chai_1.expect)(externalKycListManagement
                .connect(signer_B)
                .updateExternalKycLists(kycLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            })).to.be.rejectedWith('AccountHasNoRole');
        });
        it('GIVEN an account with KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it succeeds', async () => {
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
            const kycLists = [
                externalKycListMock1.address,
                externalKycListMock2.address,
            ];
            const actives = [false, true];
            await (0, chai_1.expect)(externalKycListManagement.updateExternalKycLists(kycLists, actives, {
                gasLimit: _scripts_1.GAS_LIMIT.high,
            }))
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(account_A, kycLists, actives);
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.false;
            (0, chai_1.expect)(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
        });
    });
});
