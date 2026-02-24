#!/usr/bin/env node
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Load HTML from file
const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_HTML = readFileSync(join(__dirname, "index.html"), "utf-8");

// Create the MCP server
const server = new Server(
  {
    name: "mcp-app-demo",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// =============================================================================
// TODO 1: List available tools
// =============================================================================
// Register a handler for ListToolsRequestSchema
// Return an array with one tool:
//   - name: "show_demo_app"
//   - description: "Shows an interactive demo MCP App UI in the chat"
//   - inputSchema: { type: "object", properties: {}, required: [] }
//
// Hint: server.setRequestHandler(ListToolsRequestSchema, async () => { ... })

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // TODO: Add your tool definition here
    ],
  };
});

// =============================================================================
// TODO 2: Handle tool calls
// =============================================================================
// Register a handler for CallToolRequestSchema
// When the tool "show_demo_app" is called:
//   1. Return content with a text message
//   2. Include _meta.ui.resourceUri pointing to "ui://mcp-app-demo/main"
//
// This resourceUri is THE LINK that connects the tool to the UI!

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === "show_demo_app") {
    return {
      content: [
        {
          type: "text",
          text: "The demo app is now displayed!",
        },
      ],
      // TODO: Add _meta.ui.resourceUri here to link to the UI resource
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// =============================================================================
// TODO 3: List available resources
// =============================================================================
// Register a handler for ListResourcesRequestSchema
// Return an array with one resource:
//   - uri: "ui://mcp-app-demo/main"
//   - name: "MCP App Demo"
//   - description: "An interactive demo"
//   - mimeType: "text/html;profile=mcp-app"  <-- This mime type is required!

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // TODO: Add your resource definition here
    ],
  };
});

// =============================================================================
// TODO 4: Serve the HTML resource
// =============================================================================
// Register a handler for ReadResourceRequestSchema
// When uri === "ui://mcp-app-demo/main":
//   Return the HTML content with proper metadata
//
// The response structure:
// {
//   contents: [{
//     uri: "ui://mcp-app-demo/main",
//     mimeType: "text/html;profile=mcp-app",
//     text: APP_HTML,
//     _meta: {
//       ui: {
//         csp: { connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [] },
//         prefersBorder: true,
//       },
//     },
//   }],
// }

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://mcp-app-demo/main") {
    return {
      contents: [
        // TODO: Return the HTML content with metadata
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// =============================================================================
// Start the server
// =============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP App Demo server running on stdio");
}

main().catch(console.error);
