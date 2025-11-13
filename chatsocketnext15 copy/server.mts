import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // FE URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Khi client join phòng
    socket.on("joinRoom", ({ room, username }, ack) => {
      if (!room || !username) return ack?.(false);

      socket.join(room);
      socket.data.room = room;
      socket.data.username = username;

      console.log(`${username} joined room: ${room}`);

      // Thông báo cho những người khác trong phòng
      socket.to(room).emit("user_joined", `${username} has joined the room.`);
      ack?.(true);
    });

    // Khi gửi tin nhắn
    socket.on("message", ({ room, message, sender }) => {
      const activeRoom = room || socket.data.room;
      if (!activeRoom) return console.log("No room found for socket", socket.id);

      console.log(`Message from ${sender} in room ${activeRoom}: ${message}`);

      // Gửi lại cho các user khác trong phòng
      socket.to(activeRoom).emit("message", { sender, message });
    });

    // Khi ngắt kết nối
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
  });
});