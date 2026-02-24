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
    name: "code-viewer",
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
//   - name: "show_code"
//   - description: "Display code in an interactive viewer with syntax highlighting"
//   - inputSchema with properties:
//       - code (string, required): "The code to display"
//       - language (string, optional): "Programming language for syntax highlighting"
//       - title (string, optional): "Title for the code snippet"
//
// Hint: server.setRequestHandler(ListToolsRequestSchema, async () => { ... })

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // TODO: Add your tool definition here
      // {
      //   name: "show_code",
      //   description: "Display code in an interactive viewer with syntax highlighting",
      //   inputSchema: {
      //     type: "object",
      //     properties: {
      //       code: { type: "string", description: "The code to display" },
      //       language: { type: "string", description: "Programming language (e.g., javascript, python)" },
      //       title: { type: "string", description: "Title for the code snippet" },
      //     },
      //     required: ["code"],
      //   },
      // },
    ],
  };
});

// =============================================================================
// TODO 2: Handle tool calls
// =============================================================================
// Register a handler for CallToolRequestSchema
// When the tool "show_code" is called:
//   1. Return content with a text summary (for non-UI hosts)
//   2. Include _meta.ui.resourceUri pointing to "ui://code-viewer/main"
//
// This resourceUri is THE LINK that connects the tool to the UI!

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "show_code") {
    const { code, language, title } = args;
    const lines = code.split("\n").length;
    
    return {
      content: [
        {
          type: "text",
          text: `Displaying ${language || "code"} snippet${title ? `: ${title}` : ""} (${lines} lines)`,
        },
      ],
      // TODO: Add _meta.ui.resourceUri here to link to the UI resource
      // _meta: {
      //   ui: {
      //     resourceUri: "ui://code-viewer/main",
      //   },
      // },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// =============================================================================
// TODO 3: List available resources
// =============================================================================
// Register a handler for ListResourcesRequestSchema
// Return an array with one resource:
//   - uri: "ui://code-viewer/main"
//   - name: "Code Viewer"
//   - description: "Interactive code viewer with syntax highlighting"
//   - mimeType: "text/html;profile=mcp-app"  <-- This mime type is required!

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // TODO: Add your resource definition here
      // {
      //   uri: "ui://code-viewer/main",
      //   name: "Code Viewer",
      //   description: "Interactive code viewer with syntax highlighting",
      //   mimeType: "text/html;profile=mcp-app",
      // },
    ],
  };
});

// =============================================================================
// TODO 4: Serve the HTML resource
// =============================================================================
// Register a handler for ReadResourceRequestSchema
// When uri === "ui://code-viewer/main":
//   Return the HTML content with proper metadata
//
// The response structure:
// {
//   contents: [{
//     uri: "ui://code-viewer/main",
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

  if (uri === "ui://code-viewer/main") {
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
  console.error("Code Viewer MCP server running on stdio");
}

main().catch(console.error);
