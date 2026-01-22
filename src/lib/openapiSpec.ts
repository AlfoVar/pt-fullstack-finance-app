import type { NextApiRequest, NextApiResponse } from "next";

const openapiSpec = {
  openapi: "3.0.1",
  info: {
    title: "PT Fullstack Finance App API",
    version: "1.0.0",
    description: "OpenAPI documentation for Movements and Users endpoints",
  },
  servers: [{ url: process.env.NEXTAUTH_URL ?? "http://localhost:3000", description: "Local" }],
  components: {
    schemas: {
      Movement: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          amount: { type: "string", example: "100.00" },
          concept: { type: "string", example: "Venta" },
          date: { type: "string", format: "date-time", example: "2026-01-21T21:47:04.227Z" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"], example: "INCOME" },
          user: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, email: { type: "string" } } },
        },
      },
      MovementInput: {
        type: "object",
        required: ["amount", "concept", "date", "type"],
        properties: {
          amount: { type: "string", example: "150.00" },
          concept: { type: "string", example: "Pago cliente" },
          date: { type: "string", format: "date", example: "2026-01-21T00:00:00.000Z" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"], example: "INCOME" },
          userId: { type: "string", example: "cmkojzpus0000rw9w5242zt1t" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", nullable: true },
          role: { type: "string", enum: ["ADMIN", "USER"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserInput: {
        type: "object",
        properties: { name: { type: "string" }, role: { type: "string", enum: ["ADMIN", "USER"] }, phone: { type: "string" } },
      },
      Error: { type: "object", properties: { error: { type: "string" } } },
    },
  },
  paths: {
    "/api/movements": {
      get: {
        summary: "List movements",
        responses: {
          "200": { description: "Array of movements", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Movement" } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        summary: "Create movement",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MovementInput" } } } },
        responses: {
          "201": { description: "Created movement", content: { "application/json": { schema: { $ref: "#/components/schemas/Movement" } } } },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/movements/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: { summary: "Get movement by id", responses: { "200": { description: "Movement", content: { "application/json": { schema: { $ref: "#/components/schemas/Movement" } } } }, "404": { description: "Not found" } } },
      put: {
        summary: "Update movement",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { amount: { type: "string" }, concept: { type: "string" }, date: { type: "string" }, type: { type: "string" } } } } } },
        responses: { "200": { description: "Updated movement", content: { "application/json": { schema: { $ref: "#/components/schemas/Movement" } } } }, "400": { description: "Bad request" }, "403": { description: "Forbidden" } },
      },
      delete: { summary: "Delete movement", responses: { "204": { description: "Deleted" }, "403": { description: "Forbidden" } } },
    },
    "/api/users": {
      get: { summary: "List users (ADMIN only)", responses: { "200": { description: "Array of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } }, "403": { description: "Forbidden" } } },
    },
    "/api/users/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Get user by id (ADMIN only)", responses: { "200": { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, "404": { description: "Not found" } } },
      put: { summary: "Update user (ADMIN only)", requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } } }, responses: { "200": { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } } },
      delete: { summary: "Delete user (ADMIN only)", responses: { "204": { description: "Deleted" } } },
    },
  },
};

export default openapiSpec;