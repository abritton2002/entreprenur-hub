import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Setting up WebSocket server...");
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("newPost", (post) => {
        socket.broadcast.emit("newPost", post);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
