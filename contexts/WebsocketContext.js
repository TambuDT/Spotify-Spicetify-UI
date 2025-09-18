import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const websocket = useRef(null);
  const reconnectTimeout = useRef(null);

  const [state, setState] = useState({
    isPlaying: false,
    isLoading: true,
    trackName: "Song Title",
    trackArtists: "Artist Name",
    trackDuration: "0:00",
    trackProgress: "0:00",
    trackPercentage: 0,
    trackImage: "",
    trackHeart: false,
    isMuted: false,
    shuffle: false,
    repeat: 0,
  });

  // Funzione per inviare comandi al WS
  const sendCommand = (command) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({ type: "COMMAND", data: { command } }));
      console.log(`Comando inviato: ${command}`);
    } else {
      console.warn("WebSocket non aperto. Comando non inviato:", command);
    }
  };

  // Funzione wrapper con ottimistic update lato client
  const sendCommandWithStateUpdate = (command) => {
    // Aggiornamento ottimistico
    setState(prev => {
      switch (command) {
        case "play": return { ...prev, isPlaying: true };
        case "pause": return { ...prev, isPlaying: false };
        case "mute": return { ...prev, isMuted: true };
        case "unmute": return { ...prev, isMuted: false };
        case "heart": return { ...prev, trackHeart: !prev.trackHeart };
        case "shuffle": return { ...prev, shuffle: !prev.shuffle };
        case "repeat": return { ...prev, repeat: (prev.repeat + 1) % 3 };
        default: return prev;
      }
    });

    sendCommand(command);
  };

  const connectWebSocket = () => {
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    websocket.current = new WebSocket("ws://192.168.1.62:8766");

    websocket.current.onopen = () => {
      console.log("WebSocket connesso.");
      sendCommand("isplaying");
      setState(prev => ({ ...prev, isLoading: false }));

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };

    websocket.current.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(data);
        switch (message.type) {
          case "TRACK_INFO":
            setState(prev => ({
              ...prev,
              trackName: message.data?.trackName || "Unknown",
              trackArtists: message.data?.trackArtists || "Unknown",
              trackDuration: message.data?.trackDuration || "0:00",
              trackImage: message.data?.trackImage || "",
              trackHeart: !!message.data?.trackHeart,
            }));
            break;
          case "PLAYER_STATE":
            setState(prev => ({
              ...prev,
              isPlaying: message.data?.state === "true",
              isMuted: !!message.data?.mute,
              shuffle: !!message.data?.shuffle,
              repeat: message.data?.repeat ?? prev.repeat,
            }));
            break;
          case "TRACK_PROGRESS":
            setState(prev => ({
              ...prev,
              trackProgress: message.data?.progress || "0:00",
              trackPercentage: message.data?.percentage || 0,
            }));
            break;
          case "REPEAT_STATE":
            setState(prev => ({
              ...prev,
              repeat: message.data?.repeatState || 0,
            }));
            break;
        }
      } catch (err) {
        console.error("Errore parsing JSON:", err);
      }
    };

    websocket.current.onclose = () => {
      console.log("WebSocket disconnesso. Riconnessione in corso...");
      reconnectTimeout.current = setTimeout(connectWebSocket, 2000);
    };

    websocket.current.onerror = (error) => {
      console.error("Errore WebSocket:", error.message);
      websocket.current.close();
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      websocket.current?.close();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (websocket.current?.readyState === WebSocket.OPEN && state.isPlaying) {
      interval = setInterval(() => sendCommand("trackprogress"), 1000);
    }
    return () => clearInterval(interval);
  }, [state.isPlaying]);

  return (
    <WebSocketContext.Provider value={{ state, sendCommandWithStateUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
