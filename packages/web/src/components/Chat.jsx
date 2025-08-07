import { createSignal, For, createEffect } from "solid-js";

export default function Chat() {
  const [messages, setMessages] = createSignal([]);
  const [input, setInput] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);

  let messagesEndRef;
  let textareaRef;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    if (messages().length > 0) {
      scrollToBottom();
    }
  });

  const adjustTextareaHeight = () => {
    if (textareaRef) {
      textareaRef.style.height = "auto";
      textareaRef.style.height = Math.min(textareaRef.scrollHeight, 120) + "px";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = input().trim();
    if (!message || isLoading()) return;

    // Add user message
    const userMessage = { role: "user", content: message };
    setMessages([...messages(), userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages(), userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          // Update the assistant message in real-time
          setMessages([
            ...messages(),
            userMessage,
            { role: "assistant", content: assistantMessage },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...messages(),
        userMessage,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input().trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div class="chat-window">
      <div class="chat-header">
        <div class="model-info">
          <span class="model-icon">🤖</span>
          <span class="model-name">OpenAI</span>
          <span class="model-version">gpt-3.5-turbo</span>
          <span class="model-badge">New</span>
        </div>
        <div class="header-actions">
          <button class="action-btn">Synced</button>
        </div>
      </div>

      <div class="chat-content">
        <div class="messages-container">
          <For each={messages()}>
            {(message) => (
              <div class={`message message-${message.role}`}>
                <div class="message-avatar">
                  {message.role === "user" ? "👤" : "🤖"}
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-author">
                      {message.role === "user" ? "You" : "Assistant"}
                    </span>
                  </div>
                  <div class="message-text">{message.content}</div>
                </div>
              </div>
            )}
          </For>
          {isLoading() && (
            <div class="message message-assistant">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-author">Assistant</span>
                </div>
                <div class="message-text typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} class="chat-input-container">
        <div class="chat-input">
          <div class="input-wrapper">
            <button type="button" class="attach-btn" aria-label="Attach file">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 4.5L5.5 9.5C4.67157 10.3284 4.67157 11.6716 5.5 12.5C6.32843 13.3284 7.67157 13.3284 8.5 12.5L13.5 7.5C14.8807 6.11929 14.8807 3.88071 13.5 2.5C12.1193 1.11929 9.88071 1.11929 8.5 2.5L3.5 7.5C1.567 9.433 1.567 12.567 3.5 14.5C5.433 16.433 8.567 16.433 10.5 14.5L15.5 9.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              class="input-field"
              placeholder="Type your message..."
              value={input()}
              onInput={(e) => {
                setInput(e.currentTarget.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              rows="1"
              disabled={isLoading()}
            />
            <button
              type="submit"
              class="send-btn"
              aria-label="Send message"
              disabled={isLoading() || !input().trim()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 10L2 2L6 10L2 18L18 10Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .model-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .model-icon {
          font-size: 20px;
        }

        .model-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .model-version {
          font-size: 14px;
          color: #6b7280;
        }

        .model-badge {
          background: #10b981;
          color: white;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .chat-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
        }

        .model-details {
          max-width: 600px;
          text-align: center;
          padding: 40px 20px;
          margin: auto;
        }

        .model-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .avatar-icon {
          font-size: 24px;
        }

        .model-label {
          font-size: 14px;
          color: #6b7280;
        }

        .model-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .model-description {
          font-size: 14px;
          line-height: 1.6;
          color: #6b7280;
          margin: 0 0 32px 0;
        }

        .model-stats {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .stat-row:not(:last-child) {
          border-bottom: 1px solid #e5e7eb;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .stat-value {
          font-size: 13px;
          color: #6b7280;
        }

        .message {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          transition: background 0.2s;
        }

        .message:hover {
          background: #f9fafb;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .message-user .message-avatar {
          background: #dbeafe;
        }

        .message-assistant .message-avatar {
          background: #f3e8ff;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .message-author {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .chat-input-container {
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .chat-input {
          padding: 16px 20px;
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #9ca3af;
        }

        .attach-btn,
        .send-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .attach-btn:hover,
        .send-btn:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .send-btn {
          color: #9ca3af;
        }

        .send-btn:hover:not(:disabled) {
          color: #3b82f6;
          background: #dbeafe;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-field {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          line-height: 1.5;
          color: #111827;
          resize: none;
          outline: none;
          padding: 4px 8px;
          min-height: 24px;
          max-height: 120px;
          font-family: inherit;
        }

        .input-field::placeholder {
          color: #9ca3af;
        }

        .input-field:disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

