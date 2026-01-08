# Instrucciones para agentes Copilot / AI

Resumen breve
- Monorepo modular para Asset Tokenization Studio (ATS) y Mass Payout. Estructura basada en `npm` workspaces: contratos Solidity, SDKs TypeScript, frontends (React/Vite) y backend (NestJS).

Objetivo inmediato para el agente
- Proponer cambios que sean conscientes del monorepo: usar los scripts del `package.json` raíz o los scripts por workspace para construir/testear/limpiar.

Comandos útiles (ejemplos concretos)
- Instalar dependencias y construir todo: `npm ci` → `npm run setup` (usa `package.json` raíz).
- ATS: `npm run ats:build`, `npm run ats:start`, `npm run ats:test`.
- Contratos ATS: en [packages/ats/contracts](packages/ats/contracts) usar `npm run compile`, `npm run test`, `npm run deploy:local` o `npm run deploy:hedera:previewnet`.
- SDK ATS: en [packages/ats/sdk](packages/ats/sdk) usar `npm run build` y `npm run test`.
- Frontend ATS: en [apps/ats/web](apps/ats/web) usar `npm run dev` (Vite) y `npm run build`.
- Mass Payout: use `npm run mass-payout:build` y los scripts por workspace (backend/frontend/contracts/sdk).

Puntos arquitectónicos importantes
- Diamond pattern en contratos ATS (facets/modularidad). Ver carpeta [packages/ats/contracts/contracts](packages/ats/contracts/contracts) y los scripts en [packages/ats/contracts/scripts](packages/ats/contracts/scripts).
- El SDK (`packages/ats/sdk`) depende de los artefactos/typings de los contratos y expone APIs TypeScript (TypeChain + tsc-alias).
- Frontend ATS (`apps/ats/web`) consume el SDK (`@hashgraph/asset-tokenization-sdk`) como dependencia de workspace.
- Mass Payout separa contratos, SDK y aplicaciones (backend NestJS con PostgreSQL; frontend admin en React).

> Convención práctica: cambiar solo el paquete afectado y usar los scripts raíz para orquestar builds/tests en workspace.

Convenciones de desarrollo relevantes
- Versiones/engines: `packages/ats/sdk` exige Node >=18.20.8; comprobar `package.json` del workspace antes de ejecutar localmente.
- Formato y lint: usar `prettier`, `eslint` y `solhint`. Scripts raíz: `npm run lint`, `npm run format`.
- Hooks/CI: `husky` + `lint-staged` están en uso; los commits pueden fallar si no pasan lint staged.
- Tests Solidity: se ejecutan con `hardhat` (scripts definidos en [packages/ats/contracts/package.json](packages/ats/contracts/package.json)). Tests pueden requerir variables de entorno o nodos locales (ver `local:hardhat`).

Integraciones y puntos de despliegue
- Hedera: Mirror & RPC nodes; WalletConnect y custodian libs (Dfns/Fireblocks) integradas en SDK.
- Deploys: existe un CLI de despliegue en `packages/ats/contracts/scripts/cli` (por ejemplo `standalone.ts`). Preferir los scripts `npm run deploy:*` definidos.

Recomendaciones concretas para PRs y cambios del agente
- Cambios de contratos: compilar + ejecutar tests unitarios (`npm run ats:contracts:build` y `npm run ats:contracts:test`) antes de proponer cambios.
- Cambios en SDK: ejecutar `npm run ats:sdk:build` y tests (`npm run ats:sdk:test`). Ver `tsconfig` y `tsc-alias` si tocas alias de paths.
- Cambios en frontend: usar `npm run ats:web:dev` para pruebas locales y ejecutar `npm run ats:web:test` para pruebas unitarias.
- No publicar paquetes manualmente: la publicación usa `changesets`; los releases deben seguir las workflows en `.github/workflows`.

Dónde mirar para ejemplos y patrones
- Arquitectura y flujos generales: [README.md](README.md)
- Scripts y orquestación monorepo: `package.json` (raíz)
- Contratos (Hardhat + scripts): [packages/ats/contracts/package.json](packages/ats/contracts/package.json)
- SDK build/tests: [packages/ats/sdk/package.json](packages/ats/sdk/package.json)
- Frontend DApp: [apps/ats/web/package.json](apps/ats/web/package.json)

Limitaciones y cosas que NO asumir
- No asumir disponibilidad de nodos Hedera públicos en CI local; revisar `NETWORK` env vars y usar `local:hardhat` para tests que requieran EVM local.
- No publicar paquetes sin `changeset` y aprobación de release workflows.

¿Necesitas que añada ejemplos de PRs automáticos, comandos de debug o snippets para tests específicos (Hardhat/Jest)? Dime qué prefieres y lo agrego.

Snippets de depuración (rápido)
- Ejecutar un nodo Hardhat local (en `packages/ats/contracts`) y dejarlo en background:

	```bash
	# desde la raíz del monorepo
	npm run ats:contracts:compile && npm --workspace=packages/ats/contracts run local:hardhat
	# o ejecutar en background (Linux/mac):
	(cd packages/ats/contracts && npx hardhat node) &
	```

- Desplegar los contratos a la red local y ver logs:

	```bash
	# despliega usando el CLI compilado (usa NETWORK env var)
	NETWORK=local npm run ats:contracts:deploy
	# despliegue automático que arranca hardhat node y luego despliega
	npm --workspace=packages/ats/contracts run deploy:local:auto
	```

- Ejecutar tests Solidity apuntando a un nodo local (si requiere `NETWORK=local`):

	```bash
	# tests unitarios de contratos
	npm run ats:contracts:test
	# tests de scripts/integración
	npm run ats:contracts:test:scripts:integration
	```

- Depurar SDK/JS y pruebas Jest (aumentar memoria si hay OOM):

	```bash
	# desde la raíz (usa workspace scripts)
	npm run ats:sdk:build
	NODE_OPTIONS=--max-old-space-size=16384 npm run ats:sdk:test
	```

- Levantar web app en modo dev (Vite) con variables locales:

	```bash
	# crear/editar apps/ats/web/.env.local antes
	npm run ats:web:dev
	```

- Mass Payout backend (Postgres) — usar `docker-compose` incluido:

	```bash
	# desde apps/mass-payout/backend
	docker compose up -d  # levanta Postgres y dependencias (ver docker-compose.yml)
	npm --workspace=apps/mass-payout/backend run start:dev
	```

- SLITHER / análisis estático (contratos):

	```bash
	# usa el script dockerizado definido en packages/ats/contracts/package.json
	npm --workspace=packages/ats/contracts run slither
	```

- Cobertura y tamaño de contratos:

	```bash
	npm run ats:contracts:test:coverage
	npm run ats:contracts:size
	```

Notas rápidas
- Asegúrate de copiar/llenar los `.env` apropiados antes de ejecutar (ver `apps/ats/web/.env.local`, `apps/mass-payout/backend/.env`).
- Para reproducir CI localmente usa los scripts `:*:ci` (ej. `npm run ats:test:ci`).
- Si tocas `tsconfig` o alias de paths, ejecutar `tsc-alias` (scripts de build ya lo hacen).
