import { Server } from "socket.io";

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

let sharedCount = 0;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("update-count", sharedCount);

  socket.on("increment", () => {
    sharedCount++;
    io.emit("update-count", sharedCount);
  });
});

console.log("Game Server running on port 4000");
