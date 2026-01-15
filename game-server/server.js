const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    // Allow connections from any localhost port for development
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

let sharedCount = 0; // In a real app, this would be in Redis/DB

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1. Send current count to the new user immediately
  socket.emit("update-count", sharedCount);

  // 2. Listen for "increment" event
  socket.on("increment", () => {
    sharedCount++;
    // Broadcast new count to EVERYONE (including sender)
    io.emit("update-count", sharedCount);
  });
});

console.log("Game Server running on port 4000");
