// A small OpenAPI spec used by the openapi-mapping and gateway-guard cases.
export const SAMPLE_SPEC = {
  openapi: "3.0.0",
  info: { title: "Demo CRM" },
  servers: [{ url: "https://api.example.com" }],
  paths: {
    "/clients": {
      get: {
        operationId: "listClients",
        summary: "List clients",
        parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
      },
      post: {
        operationId: "createClient",
        summary: "Create a client",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string" }, email: { type: "string" } },
              },
            },
          },
        },
      },
    },
    "/clients/{id}": {
      get: {
        operationId: "getClient",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      },
      delete: {
        operationId: "deleteClient",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      },
    },
  },
} as const
