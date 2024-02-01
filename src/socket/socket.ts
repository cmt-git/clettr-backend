const { Server } = require("socket.io");
const http = require("http");
export let io: any = null;
export function setupSocket(_app, _origins) {
  const socket_server = http.createServer(_app);
  io = new Server(socket_server, {
    cors: {
      origin: _origins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  (async () => {
    io.on("connection", async (socket) => {
      console.log("A user connected");

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });

      // while (true) {
      //   console.log("??");
      //   await new Promise((resolve) => setTimeout(resolve, 3000));
      //   io.emit("price", Math.random());
      // }
    });
  })();

  socket_server.listen(3001, "0.0.0.0", () => {
    console.log("Server Socket is running on http://localhost:3001");
  });
}
