import { useState, useEffect, useCallback } from "react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";

interface ToolInput {
  name: string;
  emoji?: string;
}

function App() {
  const [greeting, setGreeting] = useState<{ name: string; emoji: string } | null>(null);
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Initialize the MCP App with the SDK hook
  const { app, toolInput } = useApp({
    appInfo: { name: "Greeting App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      console.log("MCP App created:", app);
    },
  });

  // Auto-apply host styles (theme, fonts, colors)
  useHostStyles(app);

  // Handle tool input when it arrives
  useEffect(() => {
    if (toolInput) {
      const input = toolInput.arguments as ToolInput;
      setGreeting({
        name: input.name || "Friend",
        emoji: input.emoji || "👋",
      });
    }
  }, [toolInput]);

  // Send message to chat
  const sendMessage = useCallback(async () => {
    if (!message.trim()) {
      setStatus({ text: "Please enter a message", type: "error" });
      return;
    }

    try {
      await app?.sendMessage({ content: { type: "text", text: message } });
      setStatus({ text: "Message sent!", type: "success" });
      setMessage("");
    } catch (error) {
      setStatus({ text: `Failed: ${error}`, type: "error" });
    }

    setTimeout(() => setStatus(null), 3000);
  }, [app, message]);

  return (
    <div className="container">
      <header className="header">
        <h1>
          {greeting?.emoji || "👋"} Hello, {greeting?.name || "Friend"}!
        </h1>
        <p className="subtitle">Advanced MCP App with React + SDK</p>
      </header>

      <section className="counter-section">
        <div className="counter-value">{counter}</div>
        <div className="counter-label">Counter</div>
        <div className="button-row">
          <button className="btn btn-decrement" onClick={() => setCounter((c) => c - 1)}>
            −
          </button>
          <button className="btn btn-reset" onClick={() => setCounter(0)}>
            Reset
          </button>
          <button className="btn btn-increment" onClick={() => setCounter((c) => c + 1)}>
            +
          </button>
        </div>
      </section>

      <section className="message-section">
        <h3>💬 Send a message to goose</h3>
        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="btn btn-send" onClick={sendMessage}>
            Send
          </button>
        </div>
        {status && <div className={`status ${status.type}`}>{status.text}</div>}
      </section>

      <section className="info-section">
        <strong>SDK Features Used:</strong>
        <ul>
          <li>
            <code>useApp</code> hook for MCP connection
          </li>
          <li>
            <code>useHostStyles</code> for automatic theming
          </li>
          <li>
            <code>toolInput</code> to receive tool arguments
          </li>
          <li>
            <code>app.sendMessage</code> to communicate with chat
          </li>
        </ul>
      </section>
    </div>
  );
}

export default App;
