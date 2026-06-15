import {
  DEFAULT_MODEL,
  DEFAULT_RATE_LIMIT_PER_MIN,
  EMBEDDING_DIMENSIONS,
  newId,
} from "@beckon/shared"
import type {
  ActionStatus,
  AgentStatus,
  ApiKeyType,
  ClientActionType,
  ConversationStatus,
  FlowStep,
  FlowTrigger,
  GatewayAuthType,
  HttpMethod,
  JsonSchema,
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  MembershipRole,
  MessageRole,
  ToolCallStatus,
  ToolSpecType,
} from "@beckon/shared"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core"

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull()

// ---------------------------------------------------------------------------
// Auth.js tables (drizzle adapter shape). Kept close to the canonical schema so
// the adapter works without surprises. Column names are snake_case in the db.
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId("user")),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: createdAt(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
)

// ---------------------------------------------------------------------------
// Tenancy
// ---------------------------------------------------------------------------

export const organizations = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId("organization")),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
})

export const memberships = pgTable(
  "memberships",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("membership")),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").$type<MembershipRole>().notNull().default("member"),
    createdAt: createdAt(),
  },
  (t) => ({
    uniqUserOrg: uniqueIndex("memberships_user_org_uniq").on(t.userId, t.orgId),
  }),
)

// ---------------------------------------------------------------------------
// Agents and access
// ---------------------------------------------------------------------------

export const agents = pgTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("agent")),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    model: text("model").notNull().default(DEFAULT_MODEL),
    systemPrompt: text("system_prompt").notNull().default(""),
    persona: text("persona"),
    status: text("status").$type<AgentStatus>().notNull().default("draft"),
    createdAt: createdAt(),
  },
  (t) => ({
    uniqOrgSlug: uniqueIndex("agents_org_slug_uniq").on(t.orgId, t.slug),
    orgIdx: index("agents_org_idx").on(t.orgId),
  }),
)

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("apiKey")),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    agentId: text("agent_id").references(() => agents.id, { onDelete: "cascade" }),
    type: text("type").$type<ApiKeyType>().notNull(),
    keyHash: text("key_hash").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => ({
    orgIdx: index("api_keys_org_idx").on(t.orgId),
    prefixIdx: index("api_keys_prefix_idx").on(t.keyPrefix),
  }),
)

export const allowedOrigins = pgTable(
  "allowed_origins",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("origin")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    origin: text("origin").notNull(),
  },
  (t) => ({
    uniqAgentOrigin: uniqueIndex("allowed_origins_agent_origin_uniq").on(t.agentId, t.origin),
  }),
)

// ---------------------------------------------------------------------------
// Knowledge and retrieval
// ---------------------------------------------------------------------------

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("knowledgeSource")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    type: text("type").$type<KnowledgeSourceType>().notNull(),
    name: text("name").notNull(),
    sourceUri: text("source_uri"),
    status: text("status").$type<KnowledgeSourceStatus>().notNull().default("pending"),
    sizeBytes: integer("size_bytes"),
    error: text("error"),
    createdAt: createdAt(),
  },
  (t) => ({
    agentIdx: index("knowledge_sources_agent_idx").on(t.agentId),
  }),
)

export const chunks = pgTable(
  "chunks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("chunk")),
    sourceId: text("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    tokenCount: integer("token_count").notNull().default(0),
  },
  (t) => ({
    agentIdx: index("chunks_agent_idx").on(t.agentId),
    sourceIdx: index("chunks_source_idx").on(t.sourceId),
    embeddingIdx: index("chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  }),
)

// ---------------------------------------------------------------------------
// Tools, client actions, gateway
// ---------------------------------------------------------------------------

export const toolSpecs = pgTable(
  "tool_specs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("toolSpec")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    type: text("type").$type<ToolSpecType>().notNull(),
    name: text("name").notNull(),
    rawSpec: jsonb("raw_spec").$type<Record<string, unknown>>(),
    serverUrl: text("server_url"),
    createdAt: createdAt(),
  },
  (t) => ({
    agentIdx: index("tool_specs_agent_idx").on(t.agentId),
  }),
)

export const tools = pgTable(
  "tools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("tool")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    toolSpecId: text("tool_spec_id").references(() => toolSpecs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    parametersSchema: jsonb("parameters_schema").$type<JsonSchema>().notNull().default({}),
    httpMethod: text("http_method").$type<HttpMethod>(),
    pathTemplate: text("path_template"),
    sideEffect: boolean("side_effect").notNull().default(false),
    requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
    enabled: boolean("enabled").notNull().default(true),
  },
  (t) => ({
    agentIdx: index("tools_agent_idx").on(t.agentId),
    uniqAgentName: uniqueIndex("tools_agent_name_uniq").on(t.agentId, t.name),
  }),
)

export const clientActions = pgTable(
  "client_actions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("clientAction")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    actionType: text("action_type").$type<ClientActionType>().notNull(),
    target: text("target"),
    paramsSchema: jsonb("params_schema").$type<JsonSchema>().notNull().default({}),
    sideEffect: boolean("side_effect").notNull().default(false),
    requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
    enabled: boolean("enabled").notNull().default(true),
  },
  (t) => ({
    agentIdx: index("client_actions_agent_idx").on(t.agentId),
    uniqAgentName: uniqueIndex("client_actions_agent_name_uniq").on(t.agentId, t.name),
  }),
)

export const gatewayConfigs = pgTable(
  "gateway_configs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("gatewayConfig")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    baseUrl: text("base_url").notNull(),
    authType: text("auth_type").$type<GatewayAuthType>().notNull().default("none"),
    // Encrypted host credential (header value or bearer token). Encrypted at rest.
    authSecretEncrypted: text("auth_secret_encrypted"),
    authHeaderName: text("auth_header_name"),
    sharedSecretHash: text("shared_secret_hash"),
    rateLimitPerMin: integer("rate_limit_per_min").notNull().default(DEFAULT_RATE_LIMIT_PER_MIN),
    allowedOperations: jsonb("allowed_operations").$type<string[]>().notNull().default([]),
    createdAt: createdAt(),
  },
  (t) => ({
    uniqAgent: uniqueIndex("gateway_configs_agent_uniq").on(t.agentId),
  }),
)

// ---------------------------------------------------------------------------
// Flows and guardrails
// ---------------------------------------------------------------------------

export const flows = pgTable(
  "flows",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("flow")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    trigger: jsonb("trigger").$type<FlowTrigger>().notNull(),
    steps: jsonb("steps").$type<FlowStep[]>().notNull().default([]),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => ({
    agentIdx: index("flows_agent_idx").on(t.agentId),
  }),
)

export const guardrails = pgTable(
  "guardrails",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("guardrail")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    allowedTools: jsonb("allowed_tools").$type<string[]>().notNull().default([]),
    blockedTools: jsonb("blocked_tools").$type<string[]>().notNull().default([]),
    confirmOnWrite: boolean("confirm_on_write").notNull().default(true),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
  },
  (t) => ({
    uniqAgent: uniqueIndex("guardrails_agent_uniq").on(t.agentId),
  }),
)

// ---------------------------------------------------------------------------
// Observability
// ---------------------------------------------------------------------------

export const conversations = pgTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("conversation")),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    externalUserId: text("external_user_id"),
    origin: text("origin"),
    status: text("status").$type<ConversationStatus>().notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    agentIdx: index("conversations_agent_idx").on(t.agentId),
  }),
)

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("message")),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").$type<MessageRole>().notNull(),
    content: text("content").notNull(),
    createdAt: createdAt(),
  },
  (t) => ({
    conversationIdx: index("messages_conversation_idx").on(t.conversationId),
  }),
)

export const toolCalls = pgTable(
  "tool_calls",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("toolCall")),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    messageId: text("message_id").references(() => messages.id, { onDelete: "set null" }),
    toolId: text("tool_id").references(() => tools.id, { onDelete: "set null" }),
    name: text("name").notNull().default(""),
    args: jsonb("args").$type<Record<string, unknown>>().notNull().default({}),
    result: jsonb("result").$type<unknown>(),
    status: text("status").$type<ToolCallStatus>().notNull().default("pending"),
    latencyMs: integer("latency_ms"),
    error: text("error"),
    requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => ({
    conversationIdx: index("tool_calls_conversation_idx").on(t.conversationId),
  }),
)

export const actionEvents = pgTable(
  "action_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => newId("actionEvent")),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    actionType: text("action_type").$type<ClientActionType>().notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").$type<ActionStatus>().notNull().default("pending"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    result: jsonb("result").$type<unknown>(),
    createdAt: createdAt(),
  },
  (t) => ({
    conversationIdx: index("action_events_conversation_idx").on(t.conversationId),
  }),
)
