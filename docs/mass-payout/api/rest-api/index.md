---
id: index
title: REST API
sidebar_label: REST API
---

# REST API

Complete reference for the Mass Payout backend REST API.

## Overview

The backend exposes a RESTful API for managing assets, distributions, and payouts.

## Swagger Documentation

When the backend is running, interactive API documentation is available at:

**http://localhost:3000/api/docs**

## Endpoints

_Coming soon_

## Authentication

The backend has **no built-in authentication or authorization**: every endpoint accepts any request that reaches it. It must run on a private network behind your own API gateway / identity layer, which authenticates callers and authorizes each route. See [Backend > Security and Deployment](../../developer-guides/backend/index.md#security-and-deployment) for the required deployment model and a suggested route policy.

## Rate Limiting

The backend does not rate-limit clients; configure rate limits in your API gateway. On its own it caps list endpoints at `limit=1000` per page and allows at most 10 concurrent `GET /assets/:hederaTokenAddress/metadata` lookups (further requests get `429`).

_This documentation is under development. Use the Swagger UI for current API reference._
