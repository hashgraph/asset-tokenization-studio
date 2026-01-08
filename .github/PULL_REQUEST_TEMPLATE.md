## Título
Usar el formato: `type(scope): breve descripción` (ej. `docs(copilot): add instructions and env samples`).

## Resumen
Describa en una o dos frases qué cambia y por qué.

## Cambios principales
- Breve lista con los archivos/funcionalidades modificadas.

## Checklist antes de pedir review
- [ ] `npm ci` y `npm run ats:build` pasan donde aplica.
- [ ] Tests relevantes pasan localmente (`npm run ats:contracts:test`, `npm run ats:sdk:test`, `npm run ats:web:test`).
- [ ] `npm run lint` y `npm run format:check` pasan.
- [ ] Añadido `changeset` si el cambio afecta paquetes publicados.

## Notas de despliegue / entorno
Indicar si requiere pasos especiales (migraciones, variables de entorno, nodos locales). Ejemplo:

```
NETWORK=local npm run ats:contracts:deploy
``` 

## Revisor sugerido
Mencionar responsables del paquete o `@hashgraph/maintainers` según corresponda.
