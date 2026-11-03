// SPDX-License-Identifier: Apache-2.0

import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case";
import { StartBlockchainPollingUseCase } from "@application/use-cases/start-blockchain-polling.use-case";
import { StopBlockchainPollingUseCase } from "@application/use-cases/stop-blockchain-polling.use-case";
import { UpsertBlockchainEventListenerConfigUseCase } from "@application/use-cases/upsert-blockchain-event-listener-config.use-case";
import { BlockchainEventListenerMirrorNodeUrlNotAllowedError } from "@domain/errors/blockchain-event-error";
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener";
import { createMock } from "@golevelup/ts-jest";
import { BlockchainController } from "@infrastructure/rest/blockchain/blockchain.controller";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

describe(BlockchainController.name, () => {
  let app: INestApplication;
  const startUseCaseMock = createMock<StartBlockchainPollingUseCase>();
  const stopUseCaseMock = createMock<StopBlockchainPollingUseCase>();
  const upsertUseCaseMock = createMock<UpsertBlockchainEventListenerConfigUseCase>();
  const getConfigUseCaseMock = createMock<GetBlockchainEventListenerConfigUseCase>();

  const storedConfig = (): BlockchainEventListenerConfig =>
    Object.assign(new BlockchainEventListenerConfig(), {
      id: "32264ce1-76fb-44bb-a8a2-d1a516dcf34d",
      mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
      contractId: "0.0.429274",
      tokenDecimals: 6,
      startTimestamp: "1727191500.000",
    });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        { provide: StartBlockchainPollingUseCase, useValue: startUseCaseMock },
        { provide: StopBlockchainPollingUseCase, useValue: stopUseCaseMock },
        { provide: UpsertBlockchainEventListenerConfigUseCase, useValue: upsertUseCaseMock },
        { provide: GetBlockchainEventListenerConfigUseCase, useValue: getConfigUseCaseMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    getConfigUseCaseMock.execute.mockResolvedValue(storedConfig());
    upsertUseCaseMock.execute.mockImplementation(async (config) => config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /blockchain/config", () => {
    it("merges only the allowed fields over the stored config", async () => {
      const response = await request(app.getHttpServer())
        .post("/blockchain/config")
        .send({ contractId: "0.0.5005", tokenDecimals: 8 })
        .expect(HttpStatus.CREATED);

      expect(upsertUseCaseMock.execute).toHaveBeenCalledWith({
        ...storedConfig(),
        contractId: "0.0.5005",
        tokenDecimals: 8,
      });
      expect(response.body.mirrorNodeUrl).toBe("https://testnet.mirrornode.hedera.com");
    });

    it("accepts an empty body and saves the stored config unchanged", async () => {
      await request(app.getHttpServer()).post("/blockchain/config").send({}).expect(HttpStatus.CREATED);

      expect(upsertUseCaseMock.execute).toHaveBeenCalledWith(storedConfig());
    });

    it.each([
      [{ id: "another-id" }, "property id should not exist"],
      [{ mirrorNodeUrl: "file:///etc/passwd" }, "mirrorNodeUrl must be an http or https URL"],
      [{ mirrorNodeUrl: "not a url" }, "mirrorNodeUrl must be an http or https URL"],
      [{ contractId: "0.0.1/../../admin" }, "contractId must be a valid Hedera address format"],
      [{ tokenDecimals: 99 }, "tokenDecimals must not be greater than 18"],
      [{ startTimestamp: "2025-01-15 13:45:30" }, "startTimestamp must be a consensus timestamp"],
    ])("rejects %j", async (body, message) => {
      const response = await request(app.getHttpServer())
        .post("/blockchain/config")
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(expect.stringContaining(message));
      expect(upsertUseCaseMock.execute).not.toHaveBeenCalled();
    });

    it("returns 400 with a generic message when the mirror node host is not allowed", async () => {
      upsertUseCaseMock.execute.mockRejectedValue(new BlockchainEventListenerMirrorNodeUrlNotAllowedError("host"));

      const response = await request(app.getHttpServer())
        .post("/blockchain/config")
        .send({ mirrorNodeUrl: "http://169.254.169.254" })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request",
        error: BlockchainEventListenerMirrorNodeUrlNotAllowedError.name,
      });
    });
  });

  describe("PATCH /blockchain/polling", () => {
    it("starts and stops polling", async () => {
      await request(app.getHttpServer()).patch("/blockchain/polling/start").expect(HttpStatus.OK);
      await request(app.getHttpServer()).patch("/blockchain/polling/stop").expect(HttpStatus.OK);

      expect(startUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(stopUseCaseMock.execute).toHaveBeenCalledTimes(1);
    });
  });
});
