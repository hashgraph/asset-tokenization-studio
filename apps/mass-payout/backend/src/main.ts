// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"

function getLogLevels(minLogLevel: LogLevel): LogLevel[] {
  const logLevels: LogLevel[] = ["verbose", "debug", "log", "warn", "error", "fatal"]
  const idx = logLevels.indexOf(minLogLevel as LogLevel)
  return logLevels.slice(idx)
}

function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle("Scheduler Payment Distribution ServiceAPI Docs")
    .setDescription("The Scheduler Payment Distribution Service API description")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // 🔥 Hide entire "Schemas" section
    },
  })
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: getLogLevels((process.env.LOG_LEVEL as LogLevel) || "log"),
  })

  // CORS Configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173"]

  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })

  if (process.env.APP_ENV == "local") {
    setupSwagger(app)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
}

bootstrap()
