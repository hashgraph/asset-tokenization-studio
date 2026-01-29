// SPDX-License-Identifier: Apache-2.0

import { DeployCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/DeployCommandHandler";
import TransactionService from "@app/services/transaction/TransactionService";
import ContractService from "@app/services/contract/ContractService";
import EvmAddress from "@domain/contract/EvmAddress";
import {
  RbacCommand,
  DeployCommand,
  DeployCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/DeployCommand";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { DeployCommandError } from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/error/DeployCommandError";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../../../../fixture/DataFixture";

const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001";
const memberAccountId = "0.0.123456";
const memberEvmAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

jest.mock("@hiero-ledger/sdk", () => ({
  TokenId: {
    fromString: jest.fn().mockReturnValue({
      toSolidityAddress: jest.fn().mockReturnValue("0x1ba302dcf33f7f9fd08be50ddc2bbe44e4cccb3c"),
    }),
  },
}));

describe("DeployCommandHandler", () => {
  let handler: DeployCommandHandler;
  let transactionService: jest.Mocked<TransactionService>;
  let contractService: jest.Mocked<ContractService>;
  let mirrorNodeAdapter: jest.Mocked<MirrorNodeAdapter>;
  let mockDeploy: jest.Mock;

  beforeEach(() => {
    mockDeploy = jest.fn();

    transactionService = {
      getHandler: jest.fn().mockReturnValue({ deploy: mockDeploy }),
    } as any;

    contractService = {
      getContractEvmAddress: jest.fn(),
    } as any;

    mirrorNodeAdapter = {
      getAccountInfo: jest.fn().mockResolvedValue({ evmAddress: memberEvmAddress }),
    } as any;

    handler = new DeployCommandHandler(transactionService, contractService, mirrorNodeAdapter);
  });

  it("should deploy contract without rbac and return DeployCommandResponse", async () => {
    const command: DeployCommand = {
      asset: HederaIdPropsFixture.create().value,
      paymentToken: HederaIdPropsFixture.create().value,
      rbac: [],
    } as any;

    const mockAssetAddress = EvmAddressPropsFixture.create().value;
    const mockDeployedAddress = EvmAddressPropsFixture.create().value;

    contractService.getContractEvmAddress.mockResolvedValue(new EvmAddress(mockAssetAddress));
    mockDeploy.mockResolvedValue(mockDeployedAddress);

    const response = await handler.execute(command);

    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);
    expect(mockDeploy).toHaveBeenCalledWith(new EvmAddress(mockAssetAddress), expect.any(EvmAddress), []);
    expect(response).toBeInstanceOf(DeployCommandResponse);
    expect(response.payload).toBe(mockDeployedAddress);
  });

  it("should deploy contract with rbac and return DeployCommandResponse", async () => {
    const rbacMock: RbacCommand[] = [
      {
        role: roleId,
        members: [memberEvmAddress],
      },
    ];
    const command: DeployCommand = {
      asset: HederaIdPropsFixture.create().value,
      paymentToken: HederaIdPropsFixture.create().value,
      rbac: rbacMock,
    } as any;

    const mockAssetAddress = EvmAddressPropsFixture.create().value;
    const mockDeployedAddress = EvmAddressPropsFixture.create().value;

    contractService.getContractEvmAddress.mockResolvedValue(new EvmAddress(mockAssetAddress));
    mockDeploy.mockResolvedValue(mockDeployedAddress);

    const response = await handler.execute(command);

    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);
    expect(mockDeploy).toHaveBeenCalledWith(new EvmAddress(mockAssetAddress), expect.any(EvmAddress), rbacMock);
    expect(response).toBeInstanceOf(DeployCommandResponse);
    expect(response.payload).toBe(mockDeployedAddress);
  });

  it("should deploy contract with rbac, being the only member in Hedera Id format", async () => {
    const rbacMock: RbacCommand[] = [
      {
        role: roleId,
        members: [memberAccountId],
      },
    ];
    const command: DeployCommand = {
      asset: HederaIdPropsFixture.create().value,
      paymentToken: HederaIdPropsFixture.create().value,
      rbac: rbacMock,
    } as any;

    const mockAssetAddress = EvmAddressPropsFixture.create().value;
    const mockDeployedAddress = EvmAddressPropsFixture.create().value;

    contractService.getContractEvmAddress.mockResolvedValue(new EvmAddress(mockAssetAddress));
    mockDeploy.mockResolvedValue(mockDeployedAddress);

    const response = await handler.execute(command);

    expect(contractService.getContractEvmAddress).toHaveBeenCalledWith(command.asset);
    expect(mockDeploy).toHaveBeenCalledWith(
      new EvmAddress(mockAssetAddress),
      expect.any(EvmAddress),
      rbacMock.map((rbac) => ({
        ...rbac,
        members: rbac.members.map(() => memberEvmAddress),
      })),
    );
    expect(response).toBeInstanceOf(DeployCommandResponse);
    expect(response.payload).toBe(mockDeployedAddress);
  });

  it("should wrap errors in DeployCommandError", async () => {
    const command: DeployCommand = {
      asset: HederaIdPropsFixture.create().value,
      paymentToken: HederaIdPropsFixture.create().value,
    } as any;

    contractService.getContractEvmAddress.mockRejectedValue(new Error("Error getting contract address"));

    await expect(handler.execute(command)).rejects.toThrow(DeployCommandError);
  });
});
