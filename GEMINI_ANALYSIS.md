# Análisis del Proyecto: Asset Tokenization Studio

Este documento resume la estructura, propósito y funcionamiento del proyecto `asset-tokenization-studio`.

## ¿Qué es este proyecto? (Explicación Sencilla)

En pocas palabras, este proyecto es una **"caja de herramientas digital"** para crear y gestionar activos financieros del mundo real (como acciones de una empresa o bonos) en la red de Hedera.

Se compone de dos productos principales:

### 1. Asset Tokenization Studio (ATS)

- **¿Qué hace?:** Permite "tokenizar" activos. Es decir, crear una representación digital de un activo financiero. Piensa en ello como convertir una acción de papel en un "cromo digital" único y seguro que se puede gestionar por internet.
- **¿Para qué sirve?:** Para que empresas, fondos de inversión o instituciones puedan emitir y administrar sus propios activos financieros (como acciones o bonos) de forma digital, cumpliendo con normativas y de manera automatizada.
- **Componentes:**
  - **Aplicación Web (`apps/ats/web`):** Una página web donde el usuario puede crear, ver y gestionar estos activos sin necesidad de tocar código.
  - **Contratos Inteligentes (`packages/ats/contracts`):** El código que define las reglas del activo (quién puede tenerlo, cómo se transfiere, etc.). Es el "ADN" del activo digital.
  - **SDK (`packages/ats/sdk`):** Un kit para que otros programadores puedan construir aplicaciones que interactúen con estos activos.

### 2. Mass Payout (Pago Masivo)

- **¿Qué hace?:** Permite enviar pagos (en HBAR o en cualquier token de la red Hedera) a miles de cuentas de forma simultánea.
- **¿Para qué sirve?:** Es ideal para tareas como el pago de dividendos a accionistas o el pago de intereses de un bono. En lugar de hacer miles de transferencias manuales, esta herramienta lo automatiza.
- **Componentes:**
  - **Frontend y Backend (`apps/mass-payout/`):** Una aplicación web para programar y monitorear los pagos masivos, con un servidor que se encarga de orquestar todo el proceso.
  - **Contratos y SDK (`packages/mass-payout/`):** La lógica y las herramientas de programación para ejecutar los pagos en la red de Hedera de forma eficiente.

## Arquitectura General

- **Monorepo:** Todo el código (frontend, backend, contratos) está organizado en un único repositorio, lo que facilita su gestión.
- **Tecnologías Clave:**
  - **Red:** Hedera
  - **Contratos Inteligentes:** Solidity
  - **Aplicaciones Web (Frontend):** React / TypeScript
  - **Servidor (Backend):** NestJS (Node.js)
  - **Base de Datos:** PostgreSQL (para el servicio de Mass Payout)

## ¿Quién usaría esto?

- **Empresas y Emisores:** Para modernizar la forma en que emiten y gestionan acciones o deuda.
- **Gestores de Activos:** Para administrar carteras de activos digitales.
- **Agentes de Transferencia y Auditores:** Para reemplazar sistemas antiguos con un registro en tiempo real y auditable.
- **Desarrolladores:** Para construir nuevas aplicaciones financieras sobre una base sólida y probada.
