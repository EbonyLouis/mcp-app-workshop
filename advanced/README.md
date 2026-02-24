# Advanced MCP App (React + SDK)

This example demonstrates building an MCP App using:
- **React** for the UI
- **@modelcontextprotocol/ext-apps** SDK for MCP communication
- **Vite** with `vite-plugin-singlefile` for bundling

## Key Differences from Basic Example

| Basic (Vanilla JS) | Advanced (React + SDK) |
|--------------------|------------------------|
| Manual `postMessage` handling | `useApp` hook |
| Manual theme application | `useHostStyles` auto-applies |
| Raw JSON-RPC messages | Typed methods like `app.sendMessage` |
| Single HTML file | Bundled React app |

## Setup

```bash
npm install
```

## Development

```bash
# Run Vite dev server (for UI development only)
npm run dev

# Build the bundled HTML
npm run build

# Build and run the MCP server
npm run serve
```

## Adding to goose

1. Build the app: `npm run build`
2. Add extension in goose Desktop:
   - **Type**: Standard IO
   - **ID**: `mcp-app-advanced`
   - **Name**: MCP App Advanced
   - **Command**: `npx tsx /full/path/to/advanced/server.ts`

## SDK Hooks Used

### `useApp`

Initializes the MCP App connection and provides:
- `app` - The App instance for sending messages
- `toolInput` - The arguments passed to the tool
- `toolResult` - The result after tool execution
- `hostContext` - Theme, safe area insets, etc.

```tsx
const { app, toolInput, hostContext } = useApp({
  appInfo: { name: "My App", version: "1.0.0" },
  capabilities: {},
});
```

### `useHostStyles`

Automatically applies host CSS variables to the document:

```tsx
useHostStyles(app);
// Now you can use var(--color-background-primary), etc.
```

## File Structure

```
advanced/
├── server.ts          # MCP server (serves bundled HTML)
├── index.html         # Vite entry point
├── src/
│   ├── main.tsx       # React entry
│   ├── App.tsx        # Main component
│   └── styles.css     # Styles using CSS variables
├── dist/              # Built output (after npm run build)
│   └── index.html     # Single-file bundle
├── package.json
├── tsconfig.json
└── vite.config.ts
```
