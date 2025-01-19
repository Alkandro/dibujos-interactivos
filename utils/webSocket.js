// /utils/webSocket.js
import { useState, useEffect } from "react";

const WS_URL = "ws://your-websocket-server";

export const useWebSocket = () => {
  const [latestMessage, setLatestMessage] = useState(null);
  const socket = React.useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(WS_URL);

    socket.current.onmessage = (message) => {
      setLatestMessage(message.data);
    };

    return () => {
      socket.current.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(message);
    }
  };

  return { latestMessage, sendMessage };
};
