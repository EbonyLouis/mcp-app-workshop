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
// TODO 1: Define the tools
// =============================================================================
// Register a handler for ListToolsRequestSchema
// Return an array with TWO tools:
//
// Tool 1: "show_code"
//   - description: "Display code in an interactive viewer with syntax highlighting"
//   - inputSchema properties:
//       - code (string, required): "The code to display"
//       - language (string): "Programming language for syntax highlighting"
//       - title (string): "Title for the code snippet"
//
// Tool 2: "explain_code_steps"
//   - description: "Provide a step-by-step explanation of code"
//   - inputSchema properties:
//       - code (string, required): "The code being explained"
//       - language (string, required): "Programming language"
//       - title (string): "Title for the explanation"
//       - summary (string, required): "Brief summary of what the code does"
//       - steps (array, required): Array of step objects with:
//           - lines (array of integers): Line numbers this step explains
//           - title (string): Short title for this step
//           - explanation (string): Detailed explanation

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // TODO: Add "show_code" tool definition
      // {
      //   name: "show_code",
      //   description: "Display code in an interactive viewer with syntax highlighting",
      //   inputSchema: {
      //     type: "object",
      //     properties: {
      //       code: { type: "string", description: "The code to display" },
      //       language: { type: "string", description: "Programming language" },
      //       title: { type: "string", description: "Title for the code snippet" },
      //     },
      //     required: ["code"],
      //   },
      // },
      
      // TODO: Add "explain_code_steps" tool definition
      // {
      //   name: "explain_code_steps",
      //   description: "Provide a step-by-step explanation of code",
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
      //             lines: { type: "array", items: { type: "integer" }, description: "Line numbers" },
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
// TODO 2: Handle tool calls
// =============================================================================
// Register a handler for CallToolRequestSchema
// 
// For "show_code":
//   1. Return content with a text summary
//   2. Include _meta.ui.resourceUri pointing to "ui://code-viewer/main"
//
// For "explain_code_steps":
//   1. Return content with a text summary
//   2. Include _meta.ui.resourceUri pointing to "ui://code-viewer/main" (SAME UI!)
//
// The resourceUri links the tool to the UI. Both tools use the SAME UI resource,
// but the UI will detect which type of data it receives and switch modes.

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
      // TODO: Add _meta.ui.resourceUri to link to the UI
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
      // TODO: Add _meta.ui.resourceUri - use the SAME resource as show_code!
      // The UI will detect the "steps" property and switch to explainer mode
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
//   - description: "Interactive code viewer with syntax highlighting and explanation"
//   - mimeType: "text/html;profile=mcp-app"  <-- This mime type is REQUIRED!

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      // TODO: Add your resource definition here
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
// TODO 4: Serve the HTML resource
// =============================================================================
// Register a handler for ReadResourceRequestSchema
// When uri === "ui://code-viewer/main":
//   Return the HTML content with proper metadata

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://code-viewer/main") {
    return {
      contents: [
        // TODO: Return the HTML content with metadata
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
