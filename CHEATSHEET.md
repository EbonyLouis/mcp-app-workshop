# MCP App Cheatsheet

Quick reference for building MCP Apps.

---

## Core Concept: Tool + Resource + Link

Every MCP App has three parts:

```
1. TOOL      → Called by the LLM, returns data + resourceUri
2. RESOURCE  → Serves the HTML UI
3. LINK      → Tool's _meta.ui.resourceUri points to the resource
```

```
Host calls tool → Server returns result with resourceUri 
               → Host fetches resource HTML → Renders in iframe
               → UI communicates back via postMessage
```

---

## Server-Side Patterns

### Tool Registration

```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "show_my_app",
    description: "Shows the interactive UI",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  }],
}));
```

### Tool Handler (The Link!)

```javascript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "show_my_app") {
    return {
      content: [{ type: "text", text: "App displayed!" }],
      _meta: {
        ui: {
          resourceUri: "ui://my-app/main",  // ← Links to resource
        },
      },
    };
  }
});
```

### Resource Registration

```javascript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "ui://my-app/main",
    name: "My App",
    description: "Interactive UI",
    mimeType: "text/html;profile=mcp-app",  // ← Required mime type
  }],
}));
```

### Resource Handler (Serves HTML)

```javascript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "ui://my-app/main") {
    return {
      contents: [{
        uri: "ui://my-app/main",
        mimeType: "text/html;profile=mcp-app",
        text: HTML_CONTENT,
        _meta: {
          ui: {
            csp: { connectDomains: [], resourceDomains: [] },
            prefersBorder: true,
          },
        },
      }],
    };
  }
});
```

---

## Client-Side Patterns (In Your HTML)

### Basic MCP App Client

```javascript
class McpAppClient {
  constructor() {
    this.pendingRequests = new Map();
    this.requestId = 0;
    window.addEventListener('message', (e) => this.handleMessage(e));
  }

  // Send request, wait for response
  request(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.pendingRequests.set(id, { resolve, reject });
      window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
    });
  }

  // Send notification (no response expected)
  notify(method, params) {
    window.parent.postMessage({ jsonrpc: '2.0', method, params }, '*');
  }

  handleMessage(event) {
    const data = event.data;
    if (data?.id && this.pendingRequests.has(data.id)) {
      const { resolve, reject } = this.pendingRequests.get(data.id);
      this.pendingRequests.delete(data.id);
      data.error ? reject(new Error(data.error.message)) : resolve(data.result);
    }
    // Handle incoming notifications
    if (data?.method === 'ui/notifications/host-context-changed') {
      this.onHostContextChanged(data.params);
    }
  }
}
```

### Key Methods

| Method | Direction | Purpose |
|--------|-----------|---------|
| `ui/initialize` | App → Host | Get initial host context |
| `ui/message` | App → Host | Send message to chat |
| `ui/notifications/initialized` | App → Host | Signal app is ready |
| `ui/notifications/size-changed` | App → Host | Report height change |
| `ui/notifications/host-context-changed` | Host → App | Theme/context updates |

### Initialize Your App

```javascript
async initialize() {
  const result = await this.request('ui/initialize', {});
  this.hostContext = result.hostContext;
  
  if (this.hostContext?.theme) {
    document.body.className = this.hostContext.theme; // 'light' or 'dark'
  }
  
  this.notify('ui/notifications/initialized', {});
}
```

### Send Message to Chat

```javascript
await mcpApp.request('ui/message', { 
  content: { type: 'text', text: 'Hello from the UI!' } 
});
```

### Report Size Changes

```javascript
mcpApp.notify('ui/notifications/size-changed', { 
  height: document.body.scrollHeight 
});
```

---

## CSP Configuration

Control what external resources your app can access:

```javascript
_meta: {
  ui: {
    csp: {
      connectDomains: ['https://api.example.com'],  // fetch/XHR
      resourceDomains: ['https://cdn.example.com'], // scripts, styles, images
      frameDomains: ['https://maps.example.com'],   // nested iframes
    },
  },
}
```

---

## Permissions

Request browser capabilities:

```javascript
_meta: {
  ui: {
    permissions: {
      camera: true,
      microphone: true,
      geolocation: true,
      clipboardWrite: true,
    },
  },
}
```

---

## SDK Approach (Advanced)

For production apps, use the official SDK:

```bash
npm install @modelcontextprotocol/ext-apps
```

### Server Side

```typescript
import { registerAppTool, registerAppResource } from "@modelcontextprotocol/ext-apps";

registerAppTool(server, {
  name: "show_app",
  description: "Shows the app",
  inputSchema: { type: "object", properties: {} },
  resourceUri: "ui://my-app/main",
  handler: async (args) => ({ message: "Hello!" }),
});

registerAppResource(server, {
  uri: "ui://my-app/main",
  name: "My App",
  html: BUNDLED_HTML,
});
```

### Client Side (Vanilla JS)

```typescript
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "My App", version: "1.0.0" });

// Register handlers BEFORE connect!
app.ontoolinput = (params) => { /* tool args received */ };
app.ontoolresult = (result) => { /* tool completed */ };
app.onhostcontextchanged = (ctx) => { /* theme changed */ };
app.onteardown = async () => { return {}; };

await app.connect();
```

### Client Side (React)

```typescript
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";

function MyApp() {
  const { app, toolInput, toolResult } = useApp({
    appInfo: { name: "My App", version: "1.0.0" },
  });
  
  useHostStyles(app); // Auto-applies theme CSS variables
  
  return <div>{toolResult?.message}</div>;
}
```

---

## Host CSS Variables

When using the SDK's `useHostStyles` or `applyHostStyleVariables`:

```css
/* Colors */
--color-background-primary
--color-background-secondary
--color-text-primary
--color-text-secondary
--color-border-primary

/* Fonts */
--font-sans
--font-mono
--font-text-sm-size
--font-text-md-size
--font-heading-lg-size

/* Spacing */
--border-radius-sm
--border-radius-md
--border-radius-lg
```

---

## Common Mistakes

1. **Handlers after connect()** - Register ALL handlers BEFORE `app.connect()`
2. **Missing mime type** - Must be `text/html;profile=mcp-app`
3. **Missing resourceUri** - Tool must have `_meta.ui.resourceUri`
4. **Forgetting text fallback** - Always include `content` array for non-UI hosts
5. **Hardcoded themes** - Use host context for light/dark mode
6. **Not reporting size** - Call `size-changed` after DOM updates

---

## Clone SDK for More Examples

```bash
git clone --branch "v$(npm view @modelcontextprotocol/ext-apps version)" \
  --depth 1 https://github.com/modelcontextprotocol/ext-apps.git /tmp/mcp-ext-apps
```

Examples in `/tmp/mcp-ext-apps/examples/`:
- `basic-server-vanillajs/` - Simple starting point
- `basic-server-react/` - React with hooks
- `shadertoy-server/` - Streaming input + visibility pause
- `wiki-explorer-server/` - `callServerTool` pattern
- `map-server/` - `updateModelContext` pattern
