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

// Load HTML files
const __dirname = dirname(fileURLToPath(import.meta.url));
const CODE_VIEWER_HTML = readFileSync(join(__dirname, "code-viewer.html"), "utf-8");
const CODE_EXPLAINER_HTML = readFileSync(join(__dirname, "code-explainer.html"), "utf-8");

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
      {
        name: "explain_code",
        description: "Display an interactive step-by-step code explanation walkthrough. Use this to explain code with highlighted lines and detailed breakdowns.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The original code being explained",
            },
            language: {
              type: "string",
              description: "Programming language (e.g., python, javascript)",
            },
            title: {
              type: "string",
              description: "Title for the code (e.g., 'Quicksort Implementation')",
            },
            summary: {
              type: "string",
              description: "Brief 1-2 sentence summary of what the code does",
            },
            steps: {
              type: "array",
              description: "Array of explanation steps, each covering specific lines",
              items: {
                type: "object",
                properties: {
                  lines: {
                    type: "array",
                    items: { type: "integer" },
                    description: "Line numbers this step explains (1-indexed)",
                  },
                  title: {
                    type: "string",
                    description: "Short title like 'Base Case' or 'Recursive Call'",
                  },
                  explanation: {
                    type: "string",
                    description: "2-4 sentence explanation of what these lines do and why",
                  },
                },
                required: ["lines", "title", "explanation"],
              },
            },
          },
          required: ["code", "language", "summary", "steps"],
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
      _meta: {
        ui: {
          resourceUri: "ui://code-viewer/viewer",
        },
      },
    };
  }

  if (name === "explain_code") {
    const { code, language, title, summary, steps } = args;

    return {
      content: [
        {
          type: "text",
          text: `Code explanation: ${summary} (${steps.length} steps)`,
        },
      ],
      _meta: {
        ui: {
          resourceUri: "ui://code-viewer/explainer",
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
        uri: "ui://code-viewer/viewer",
        name: "Code Viewer",
        description: "Interactive code viewer with syntax highlighting",
        mimeType: "text/html;profile=mcp-app",
      },
      {
        uri: "ui://code-viewer/explainer",
        name: "Code Explainer",
        description: "Interactive step-by-step code explanation",
        mimeType: "text/html;profile=mcp-app",
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://code-viewer/viewer") {
    return {
      contents: [
        {
          uri: "ui://code-viewer/viewer",
          mimeType: "text/html;profile=mcp-app",
          text: CODE_VIEWER_HTML,
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

  if (uri === "ui://code-viewer/explainer") {
    return {
      contents: [
        {
          uri: "ui://code-viewer/explainer",
          mimeType: "text/html;profile=mcp-app",
          text: CODE_EXPLAINER_HTML,
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
