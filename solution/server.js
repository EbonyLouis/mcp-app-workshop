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

// Load HTML file
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
        description: "Display code in an interactive viewer with syntax highlighting. The viewer has a 'Discuss' button that lets users request a step-by-step explanation.",
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
        name: "explain_code_steps",
        description: "Provide a step-by-step explanation of code. This is called by the Code Viewer UI when the user clicks 'Discuss'. Return structured steps that will render as an interactive walkthrough.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code being explained",
            },
            language: {
              type: "string",
              description: "Programming language",
            },
            title: {
              type: "string",
              description: "Title for the explanation",
            },
            summary: {
              type: "string",
              description: "Brief 1-2 sentence summary of what the code does",
            },
            steps: {
              type: "array",
              description: "Array of explanation steps",
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
                    description: "Short title for this step",
                  },
                  explanation: {
                    type: "string",
                    description: "Detailed explanation of these lines",
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
          resourceUri: "ui://code-viewer/main",
        },
      },
    };
  }

  if (name === "explain_code_steps") {
    const { summary, steps } = args;

    return {
      content: [
        {
          type: "text",
          text: `${summary}\n\nExplanation has ${steps.length} steps.`,
        },
      ],
      _meta: {
        ui: {
          resourceUri: "ui://code-viewer/main",  // Same UI - it will switch to explainer mode!
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
        description: "Interactive code viewer with syntax highlighting and explanation",
        mimeType: "text/html;profile=mcp-app",
      },
    ],
  };
});

// Read resource content
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
