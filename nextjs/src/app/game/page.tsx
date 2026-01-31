"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to the exposed backend port
const socket = io("http://localhost:4000");

export default function Home() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Listen for updates from the server
    socket.on("update-count", (newCount) => {
      setCount(newCount);
    });

    return () => {
      socket.off("update-count");
    };
  }, []);

  const handleClick = () => {
    socket.emit("increment");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "50px",
      }}
    >
      <h1>Shared Chess Counter</h1>
      <div style={{ fontSize: "100px", fontWeight: "bold" }}>{count}</div>
      <button
        onClick={handleClick}
        style={{ padding: "10px 20px", fontSize: "20px", cursor: "pointer" }}
      >
        Increment
      </button>
    </div>
  );
}
