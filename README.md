# MCP App Workshop

Build interactive UIs that run inside goose Desktop using the Model Context Protocol.

## Prerequisites

- Node.js 18+ installed
- goose Desktop 1.19.1+ installed

## Workshop Structure

```
mcp-app-workshop/
├── starter/          # Start here! Skeleton with TODOs
├── solution/         # Complete working demo app
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

### 3. Stuck? Check the solution

If you get stuck, peek at `solution/` for the complete working code.

### 4. Test your app

Add your extension to goose Desktop:
1. Open goose Desktop
2. Click the menu button (top-left) → Extensions
3. Click "Add custom extension"
4. Configure:
   - **Type**: Standard IO
   - **ID**: `mcp-app-demo`
   - **Name**: MCP App Demo
   - **Command**: `node /full/path/to/mcp-app-workshop/starter/server.js`
5. Restart goose
6. Prompt: "Show me the demo app"

## Workshop Outline

1. **Introduction** - What are MCP Apps and why?
2. **Core Concepts** - Tool + Resource + Link
3. **Live Coding** - Build the demo app together
4. **Deep Dive** - SDK patterns and advanced features
5. **Hands-on** - Extend your app
6. **Q&A**

## Resources

- [MCP Apps Specification](https://github.com/modelcontextprotocol/ext-apps)
- [goose MCP Apps Guide](https://block.github.io/goose/docs/tutorials/mcp-apps)
- `CHEATSHEET.md` in this repo

## Exercises

After completing the basic demo, try these challenges:

### Beginner
- Add a "Reset to 10" button
- Change the theme colors

### Intermediate  
- Add a second tool that accepts a `name` parameter and displays a personalized greeting
- Store counter value in localStorage and restore on load

### Advanced
- Rebuild using the SDK with `@modelcontextprotocol/ext-apps`
- Add `ontoolinputpartial` to show streaming input
- Implement `callServerTool` to fetch data from another tool
