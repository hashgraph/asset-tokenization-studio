// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { LifeCycleCashFlowSdkService } from "@infrastructure/adapters/life-cycle-cash-flow-sdk.service"
import { LifeCycleCashFlow } from "@hashgraph/mass-payout-sdk"
import { HederaService } from "@domain/ports/hedera.port"
import { ConfigService } from "@nestjs/config"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { RbacRequest } from "@hashgraph/mass-payout-sdk"

describe("LifeCycleCashFlowSdkService", () => {
  let service: LifeCycleCashFlowSdkService
  let lifeCycleCashFlow: jest.Mocked<LifeCycleCashFlow>
  let hederaService: jest.Mocked<HederaService>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    // Create mocks
    const lifeCycleCashFlowMock = {
      deploy: jest.fn(),
    } as unknown as jest.Mocked<LifeCycleCashFlow>

    const hederaServiceMock = {
      getHederaAddressFromEvm: jest.fn(),
    } as unknown as jest.Mocked<HederaService>

    const configServiceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifeCycleCashFlowSdkService,
        { provide: LifeCycleCashFlow, useValue: lifeCycleCashFlowMock },
        { provide: "HederaService", useValue: hederaServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile()

    service = module.get(LifeCycleCashFlowSdkService)
    lifeCycleCashFlow = module.get(LifeCycleCashFlow)
    hederaService = module.get("HederaService")
    configService = module.get(ConfigService)
  })

  it("should deploy contract and return LifeCycleCashFlowAddress", async () => {
    const hederaAsset = "0.0.12345"
    const hederaToken = "0.0.54321"
    const evmAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    const hederaAddress = "0.0.98765"

    // Config mock returns a default account ID
    configService.get.mockReturnValue("0.0.99999")

    // LifeCycleCashFlow.deploy mock returns a payload
    lifeCycleCashFlow.deploy.mockResolvedValue({ payload: evmAddress })

    // HederaService mock converts evm -> hedera
    hederaService.getHederaAddressFromEvm.mockResolvedValue(hederaAddress)

    const result = await service.deployContract(hederaAsset, hederaToken)

    // Check result is correct
    expect(result.evmAddress).toBe(evmAddress)
    expect(result.hederaAddress).toBe(hederaAddress)

    // Check that deploy was called with correct DeployRequest
    expect(lifeCycleCashFlow.deploy).toHaveBeenCalledTimes(1)
    const deployArg = lifeCycleCashFlow.deploy.mock.calls[0][0]

    expect(deployArg.asset).toBe(hederaAsset)
    expect(deployArg.paymentToken).toBe(hederaToken)
    expect(deployArg.rbac).toMatchObject(
      service.lifeCycleCashFlowRoles.map((role) => ({
        role,
        members: ["0.0.99999"],
      })),
    )

    // Check HederaService called
    expect(hederaService.getHederaAddressFromEvm).toHaveBeenCalledWith(evmAddress)
  })
})
