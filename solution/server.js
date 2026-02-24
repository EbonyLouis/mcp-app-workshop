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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "show_code",
        description: "Display code in an interactive viewer with syntax highlighting",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code to display",
            },
            language: {
              type: "string",
              description: "Programming language for syntax highlighting (e.g., javascript, python, rust)",
            },
            title: {
              type: "string",
              description: "Title for the code snippet",
            },
          },
          required: ["code"],
        },
      },
    ],
  };
});

// Handle tool calls
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
      // This metadata tells goose to render the MCP App
      _meta: {
        ui: {
          resourceUri: "ui://code-viewer/main",
        },
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "ui://code-viewer/main",
        name: "Code Viewer",
        description: "Interactive code viewer with syntax highlighting",
        mimeType: "text/html;profile=mcp-app",
      },
    ],
  };
});

// Read resource content - returns the HTML
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://code-viewer/main") {
    return {
      contents: [
        {
          uri: "ui://code-viewer/main",
          mimeType: "text/html;profile=mcp-app",
          text: APP_HTML,
          _meta: {
            ui: {
              csp: {
                connectDomains: [],
                resourceDomains: [],
                frameDomains: [],
                baseUriDomains: [],
              },
              prefersBorder: true,
            },
          },
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Code Viewer MCP server running on stdio");
}

main().catch(console.error);
