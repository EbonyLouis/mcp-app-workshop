#!/usr/bin/env tsx
/**
 * Advanced MCP App Server using the SDK
 * 
 * This demonstrates:
 * - Using registerAppTool and registerAppResource from the SDK
 * - Serving a bundled React app
 * - Tool with input parameters
 */
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

// Load the bundled HTML (built by vite)
const __dirname = dirname(fileURLToPath(import.meta.url));
let APP_HTML: string;
try {
  APP_HTML = readFileSync(join(__dirname, "dist/index.html"), "utf-8");
} catch {
  APP_HTML = `
    <!DOCTYPE html>
    <html>
      <body style="padding: 20px; font-family: system-ui;">
        <h1>⚠️ App not built</h1>
        <p>Run <code>npm run build</code> first to bundle the React app.</p>
      </body>
    </html>
  `;
}

const server = new Server(
  { name: "mcp-app-advanced", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// Tool: show_greeting - demonstrates tool with parameters
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "show_greeting",
      description: "Shows a personalized greeting in an interactive UI",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name to greet",
          },
          emoji: {
            type: "string",
            description: "Emoji to include (optional)",
            default: "👋",
          },
        },
        required: ["name"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "show_greeting") {
    const userName = (args as { name: string }).name;
    const emoji = (args as { emoji?: string }).emoji || "👋";
    
    return {
      content: [
        {
          type: "text",
          text: `Greeting ${userName} with ${emoji}`,
        },
      ],
      _meta: {
        ui: {
          resourceUri: "ui://mcp-app-advanced/greeting",
        },
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "ui://mcp-app-advanced/greeting",
      name: "Greeting App",
      description: "Interactive greeting with React",
      mimeType: "text/html;profile=mcp-app",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ui://mcp-app-advanced/greeting") {
    return {
      contents: [
        {
          uri,
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Advanced MCP App server running on stdio");
}

main().catch(console.error);
