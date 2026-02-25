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

// =============================================================================
// TODO 1: Define the tools
// =============================================================================
// Tools are what the LLM can call. Each tool has:
//   - name: unique identifier
//   - description: helps the LLM know when to use it
//   - inputSchema: JSON Schema defining the parameters
//
// We're defining TWO tools that both use the SAME UI:
//   1. show_code - displays code in the viewer
//   2. explain_code_steps - shows step-by-step explanation
//
// Uncomment both tool definitions below.

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // TODO: Uncomment the "show_code" tool
      // {
      //   name: "show_code",
      //   description: "Display code in an interactive viewer with syntax highlighting.",
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
      // TODO: Uncomment the "explain_code_steps" tool
      // {
      //   name: "explain_code_steps",
      //   description: "Provide a step-by-step explanation of code with structured steps.",
      //   inputSchema: {
      //     type: "object",
      //     properties: {
      //       code: { type: "string", description: "The code being explained" },
      //       language: { type: "string", description: "Programming language" },
      //       title: { type: "string", description: "Title for the explanation" },
      //       summary: { type: "string", description: "Brief summary of what the code does" },
      //       steps: {
      //         type: "array",
      //         description: "Array of explanation steps",
      //         items: {
      //           type: "object",
      //           properties: {
      //             lines: { type: "array", items: { type: "integer" }, description: "Line numbers (1-indexed)" },
      //             title: { type: "string", description: "Step title" },
      //             explanation: { type: "string", description: "Detailed explanation" },
      //           },
      //           required: ["lines", "title", "explanation"],
      //         },
      //       },
      //     },
      //     required: ["code", "language", "summary", "steps"],
      //   },
      // },
    ],
  };
});

// =============================================================================
// TODO 2: Link tools to the UI (THE KEY PART!)
// =============================================================================
// When a tool is called, we return:
//   - content: text response (for hosts without UI support)
//   - _meta.ui.resourceUri: THE LINK to our UI resource
//
// The resourceUri tells goose "display this UI after the tool runs".
// 
// IMPORTANT: Both tools return the SAME resourceUri!
// The UI is smart - it checks if the data has "steps" and switches modes.
//
// Uncomment the _meta blocks in BOTH handlers below.

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
      // TODO: Uncomment to link this tool to the UI
      // _meta: {
      //   ui: {
      //     resourceUri: "ui://code-viewer/main",
      //   },
      // },
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
      // TODO: Uncomment - same resourceUri! The UI will switch to explainer mode.
      // _meta: {
      //   ui: {
      //     resourceUri: "ui://code-viewer/main",  // Same UI - it will switch to explainer mode!
      //   },
      // },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// =============================================================================
// TODO 3: Register the UI resource
// =============================================================================
// Resources are things the host can fetch. For MCP Apps, we serve HTML.
//
// Key fields:
//   - uri: unique identifier (must match what tools return in resourceUri)
//   - mimeType: MUST be "text/html;profile=mcp-app" for MCP Apps!
//
// Uncomment the resource definition below.

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // TODO: Uncomment the resource definition
      // {
      //   uri: "ui://code-viewer/main",
      //   name: "Code Viewer",
      //   description: "Interactive code viewer with syntax highlighting and explanation",
      //   mimeType: "text/html;profile=mcp-app",
      // },
    ],
  };
});

// =============================================================================
// TODO 4: Serve the HTML content
// =============================================================================
// When goose requests our resource, we return the HTML.
//
// The _meta.ui section configures:
//   - csp: Content Security Policy (what external resources the UI can load)
//   - prefersBorder: whether to show a border around the UI
//
// Uncomment the contents below.

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://code-viewer/main") {
    return {
      contents: [
        // TODO: Uncomment to serve the HTML
        // {
        //   uri: "ui://code-viewer/main",
        //   mimeType: "text/html;profile=mcp-app",
        //   text: APP_HTML,
        //   _meta: {
        //     ui: {
        //       csp: {
        //         connectDomains: [],
        //         resourceDomains: [],
        //         frameDomains: [],
        //         baseUriDomains: [],
        //       },
        //       prefersBorder: true,
        //     },
        //   },
        // },
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
