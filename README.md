# MCP App Workshop

Build interactive UIs that run inside goose Desktop using the Model Context Protocol.

## What We're Building

A **Code Viewer** MCP App with two modes:

### Viewer Mode
- Displays code with syntax highlighting
- Shows line numbers and stats
- **Copy** button to copy code to clipboard
- **Discuss** button to request step-by-step explanation

### Explainer Mode
- Interactive step-by-step code walkthrough
- Highlights relevant lines for each step
- Navigate with arrows or click progress dots
- **Back to Code** to return to viewer

```
┌─────────────────────────────────────────────────┐
│  Quicksort Algorithm              [PYTHON]      │
├─────────────────────────────────────────────────┤
│  1 │ def quicksort(arr):                        │
│  2 │     if len(arr) <= 1:          ◄── highlighted
│  3 │         return arr             ◄── highlighted
│  4 │     pivot = arr[len(arr) // 2]             │
│  ...                                            │
├─────────────────────────────────────────────────┤
│  🎯 Base Case                      Lines 2-3    │
│  Stops recursion when array has 1 or fewer     │
│  elements - already sorted by definition.       │
├─────────────────────────────────────────────────┤
│  [◀ Previous]    ● ● ○ ○ ○       [Next ▶]      │
└─────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ installed
- goose Desktop installed

## Workshop Structure

```
mcp-app-workshop/
├── starter/          # Start here! Skeleton with TODOs
├── solution/         # Complete working code
└── README.md         # You are here
```

## Getting Started

### 1. Navigate to the starter directory

```bash
cd starter
npm install
```

### 2. Follow along with the workshop

The `starter/` directory has skeleton files with `TODO` comments.

**Server-side TODOs (`server.js`):**
1. Define the `show_code` tool
2. Define the `explain_code_steps` tool
3. Handle both tools and return `_meta.ui.resourceUri`
4. List the UI resource
5. Serve the HTML

**Key insight:** Both tools point to the **same UI resource**! The UI detects which type of data it receives and switches modes automatically.

### 3. Test your app

Add your extension to goose Desktop:

1. Open goose Desktop → Settings → Extensions
2. Click "Add custom extension"
3. Configure:
   - **Type**: Standard IO
   - **ID**: `code-viewer`
   - **Name**: Code Viewer
   - **Command**: `node /full/path/to/mcp-app-workshop/starter/server.js`
4. Enable the extension
5. Prompt: *"Show me a quicksort implementation in Python using the code viewer"*
6. Click **Discuss** in the UI to see the explainer mode!

### 4. Stuck? Check the solution

```bash
cd ../solution
npm install
# Update your extension command to point to solution/server.js
```

---

## Core Concept: Tool + Resource + Link

Every MCP App has three parts:

```
TOOL      → Called by the LLM, accepts parameters
RESOURCE  → Serves the HTML UI  
LINK      → Tool's _meta.ui.resourceUri points to the resource
```

### Flow Diagram

```
User: "Show me quicksort in Python"
                ↓
goose calls show_code tool with { code, language, title }
                ↓
Tool returns { content: [...], _meta: { ui: { resourceUri: "ui://code-viewer/main" }}}
                ↓
goose fetches HTML from the resource
                ↓
UI renders in iframe, receives tool args via ui/initialize
                ↓
User clicks "Discuss"
                ↓
UI sends message to chat via ui/message
                ↓
goose calls explain_code_steps tool with { code, steps, summary }
                ↓
Tool returns SAME resourceUri → UI receives new data → switches to explainer mode!
```

---

## The Two Tools

### `show_code`
Displays code in the viewer.

```javascript
{
  name: "show_code",
  inputSchema: {
    properties: {
      code: { type: "string" },      // required
      language: { type: "string" },
      title: { type: "string" }
    }
  }
}
```

### `explain_code_steps`
Provides step-by-step explanation (same UI, different mode).

```javascript
{
  name: "explain_code_steps", 
  inputSchema: {
    properties: {
      code: { type: "string" },      // required
      language: { type: "string" },  // required
      summary: { type: "string" },   // required
      steps: {                       // required
        type: "array",
        items: {
          properties: {
            lines: { type: "array", items: { type: "integer" }},
            title: { type: "string" },
            explanation: { type: "string" }
          }
        }
      }
    }
  }
}
```

---

## Key Patterns

### Server: Link Tool to UI

```javascript
return {
  content: [{ type: "text", text: "Displayed!" }],
  _meta: {
    ui: {
      resourceUri: "ui://code-viewer/main",  // ← The link!
    },
  },
};
```

### Server: Register Resource

```javascript
{
  uri: "ui://code-viewer/main",
  name: "Code Viewer",
  mimeType: "text/html;profile=mcp-app",  // ← Required!
}
```

### Client: Initialize & Get Tool Input

```javascript
const result = await this.request('ui/initialize', {});
const args = result.toolInput.arguments;  // { code, language, title }
```

### Client: Send Message to Chat

```javascript
await this.request('ui/message', { 
  content: [{ type: 'text', text: 'Explain this code...' }]
});
```

### Client: Handle Theme Changes

```javascript
if (data.method === 'ui/notifications/host-context-changed') {
  document.body.className = data.params.theme;  // 'light' or 'dark'
}
```

---

## Exercises

After completing the workshop, try these challenges:

### Beginner
- Add a "Download" button that downloads the code as a file
- Change the syntax highlighting colors

### Intermediate  
- Add a `highlightLines` parameter to `show_code` to pre-highlight specific lines
- Add keyboard shortcuts (Cmd+C to copy)

### Advanced
- Use `ontoolinputpartial` to stream code as the LLM generates it
- Rebuild with the [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- Add a "Run" button for Python snippets

---

## Resources

- [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- [goose Documentation](https://block.github.io/goose)
