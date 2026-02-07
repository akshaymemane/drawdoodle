import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
type WsPayload = unknown;

const useWebSocket = (boardId: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<WsPayload>(null);

  useEffect(() => {
    const url = new URL(WS_URL);
    url.searchParams.set("boardId", boardId);
    ws.current = new WebSocket(url.toString());

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch {
        setLastMessage(event.data);
      }
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      ws.current?.close();
    };
  }, [boardId]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.warn("WebSocket is not open. Message not sent.");
    }
  }, []);

  return { sendMessage, lastMessage };
};

export default useWebSocket;
