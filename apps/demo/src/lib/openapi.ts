// The demo app's own API, described as OpenAPI. An operator imports this into a
// Beckon agent so each operation becomes a tool. Writes (POST) are gated by default.

export function buildOpenApi(baseUrl: string) {
  return {
    openapi: "3.0.0",
    info: { title: "Demo CRM", version: "1.0.0" },
    servers: [{ url: `${baseUrl}/api` }],
    paths: {
      "/clients": {
        get: { operationId: "listClients", summary: "List all clients" },
        post: {
          operationId: "createClient",
          summary: "Create a client",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", description: "The client name" },
                    industry: { type: "string", description: "The client industry" },
                  },
                },
              },
            },
          },
        },
      },
      "/clients/{id}": {
        get: {
          operationId: "getClient",
          summary: "Get one client",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/deals": {
        get: { operationId: "listDeals", summary: "List deals" },
        post: {
          operationId: "createDeal",
          summary: "Create a deal for a client",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["clientId", "title", "amount"],
                  properties: {
                    clientId: { type: "string" },
                    title: { type: "string" },
                    amount: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
      "/tasks": {
        get: { operationId: "listTasks", summary: "List tasks" },
        post: {
          operationId: "createTask",
          summary: "Create a follow up task",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    clientId: { type: "string" },
                    due: { type: "string", description: "Due date, YYYY-MM-DD" },
                  },
                },
              },
            },
          },
        },
      },
      "/pnl": {
        get: { operationId: "getPnl", summary: "Get the profit and loss summary" },
      },
    },
  }
}
