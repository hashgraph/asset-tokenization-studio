// SPDX-License-Identifier: Apache-2.0

import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case";
import { UpsertBlockchainEventListenerConfigUseCase } from "@application/use-cases/upsert-blockchain-event-listener-config.use-case";
import { ConfigKeys } from "@config/config-keys";
import { BlockchainEventListenerMirrorNodeUrlNotAllowedError } from "@domain/errors/blockchain-event-error";
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener";
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port";
import { createMock } from "@golevelup/ts-jest";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

describe(UpsertBlockchainEventListenerConfigUseCase.name, () => {
  let useCase: UpsertBlockchainEventListenerConfigUseCase;
  const repositoryMock = createMock<BlockchainEventListenerConfigRepository>();
  let env: Record<string, string | undefined>;
  const configServiceMock = { get: jest.fn((key: string) => env[key]) };

  const newConfig = (mirrorNodeUrl: string): BlockchainEventListenerConfig =>
    Object.assign(new BlockchainEventListenerConfig(), {
      id: crypto.randomUUID(),
      mirrorNodeUrl,
      contractId: "0.0.429274",
      tokenDecimals: 6,
      startTimestamp: "1727191500.000",
    });

  beforeEach(async () => {
    env = { [ConfigKeys.BLOCKCHAIN_MIRROR_NODE_URL]: "http://localhost:5551" };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertBlockchainEventListenerConfigUseCase,
        { provide: "BlockchainEventListenerConfigRepository", useValue: repositoryMock },
        { provide: GetBlockchainEventListenerConfigUseCase, useValue: createMock() },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    useCase = module.get(UpsertBlockchainEventListenerConfigUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("saves a config whose mirror node is a public Hedera mirror node", async () => {
    const config = newConfig("https://testnet.mirrornode.hedera.com");
    repositoryMock.save.mockResolvedValue(config);

    await expect(useCase.execute(config)).resolves.toBe(config);
    expect(repositoryMock.save).toHaveBeenCalledWith(config);
  });

  it("saves a config pointing at the operator-configured default mirror node", async () => {
    const config = newConfig("http://localhost:5551");
    repositoryMock.save.mockResolvedValue(config);

    await expect(useCase.execute(config)).resolves.toBe(config);
  });

  it("rejects a mirror node host outside the allow-list without saving", async () => {
    await expect(useCase.execute(newConfig("http://169.254.169.254"))).rejects.toThrow(
      BlockchainEventListenerMirrorNodeUrlNotAllowedError,
    );
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("honours an explicit BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS", async () => {
    env[ConfigKeys.BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS] = "mirror.internal";
    repositoryMock.save.mockImplementation(async (c) => c);

    await expect(useCase.execute(newConfig("https://mirror.internal"))).resolves.toBeDefined();
    await expect(useCase.execute(newConfig("https://testnet.mirrornode.hedera.com"))).rejects.toThrow(
      BlockchainEventListenerMirrorNodeUrlNotAllowedError,
    );
  });
});
