# MCP App Workshop

Build interactive UIs that run inside goose Desktop using the Model Context Protocol.

## What We're Building

A **Code Viewer** MCP App that:
- Displays code with syntax highlighting
- Shows line numbers and stats
- Has a **Copy** button to copy code to clipboard
- Has a **Discuss** button that sends the code back to goose for explanation
- Syncs with goose's light/dark theme

```
┌─────────────────────────────────────────────────┐
│  quicksort.py                        [JS]       │
│  ┌──────────────────────────────────────────┐   │
│  │ 1 │ def quicksort(arr):                  │   │
│  │ 2 │     if len(arr) <= 1:                │   │
│  │ 3 │         return arr                   │   │
│  │ 4 │     pivot = arr[0]                   │   │
│  │ 5 │     ...                              │   │
│  └──────────────────────────────────────────┘   │
│  12 lines • 284 characters    [📋 Copy] [💬 Discuss]
└─────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ installed
- goose Desktop 1.19.1+ installed

## Workshop Structure

```
mcp-app-workshop/
├── starter/          # Start here! Skeleton with TODOs
├── solution/         # Complete working code viewer
├── advanced/         # SDK-based React example
├── CHEATSHEET.md     # Quick reference guide
└── README.md         # You are here
```

## Getting Started

### 1. Navigate to the starter directory

```bash
cd starter
npm install
```

### 2. Follow along with the workshop

The `starter/` directory has skeleton files with `TODO` comments. Fill these in as we go through the workshop together.

**Server-side TODOs (`server.js`):**
1. List the `show_code` tool with its input schema
2. Handle tool calls and return `_meta.ui.resourceUri`
3. List the UI resource
4. Serve the HTML with proper metadata

**Client-side TODOs (`index.html`):**
5. Initialize the app and get tool input
6. Handle theme change notifications
7. Send messages back to the chat

### 3. Stuck? Check the solution

If you get stuck, peek at `solution/` for the complete working code.

### 4. Test your app

Add your extension to goose Desktop:
1. Open goose Desktop
2. Click the menu button (top-left) → Extensions
3. Click "Add custom extension"
4. Configure:
   - **Type**: Standard IO
   - **ID**: `code-viewer`
   - **Name**: Code Viewer
   - **Command**: `node /full/path/to/mcp-app-workshop/starter/server.js`
5. Restart goose
6. Prompt: "Show me a quicksort implementation in Python using the code viewer"

## Workshop Outline

| Time | Section | What We Cover |
|------|---------|---------------|
| 10 min | **Intro** | What are MCP Apps? Why interactive UIs? |
| 35 min | **Live Coding** | Build the code viewer together |
| 5 min | **Test** | Add to goose, see it work |
| 15 min | **Deep Dive** | SDK patterns, advanced features |
| 20 min | **Hands-on** | Extend your app |
| 5 min | **Q&A** | |

## Core Concepts

### The Tool + Resource + Link Pattern

Every MCP App has three parts:

```
1. TOOL      → Called by the LLM, accepts parameters (code, language, title)
2. RESOURCE  → Serves the HTML UI
3. LINK      → Tool's _meta.ui.resourceUri points to the resource
```

```
User: "Show me a quicksort in Python"
         ↓
goose calls show_code tool with { code: "...", language: "python" }
         ↓
Tool returns _meta.ui.resourceUri: "ui://code-viewer/main"
         ↓
goose fetches the HTML resource
         ↓
UI renders in iframe, receives tool arguments via ui/initialize
         ↓
User clicks "Discuss" → UI sends message back to chat
```

## Resources

- [MCP Apps Specification](https://github.com/modelcontextprotocol/ext-apps)
- [goose MCP Apps Guide](https://block.github.io/goose/docs/tutorials/mcp-apps)
- `CHEATSHEET.md` in this repo

## Exercises

After completing the code viewer, try these challenges:

### Beginner
- Add a "Download" button that downloads the code as a file
- Add more syntax highlighting for additional keywords

### Intermediate  
- Add a `theme` parameter to the tool (e.g., "monokai", "github")
- Add line highlighting - accept a `highlightLines` parameter like `[1, 5, 10]`

### Advanced
- Add `ontoolinputpartial` to show code streaming in as the LLM generates it
- Rebuild using the SDK with `@modelcontextprotocol/ext-apps` (see `advanced/`)
- Add a "Run" button that executes the code (for safe languages like Python snippets)

## Why Code Viewer for Developers?

This example is practical for a developer audience because:

1. **Familiar domain** - Everyone knows what a code viewer should do
2. **Tool parameters** - Shows how to pass structured data (code, language, title)
3. **Bidirectional communication** - "Discuss" button sends code back to chat
4. **Real utility** - You could actually use this to review code with goose
5. **Extensible** - Easy to imagine adding features (run code, diff view, etc.)

Compare to a counter app:
- Counter: Click +/- buttons (toy example)
- Code Viewer: Display code, copy, discuss (real workflow)
