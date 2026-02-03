import http from "http";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import {fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let connectionCount = 0;
const activeConnections = new Map();

const server = http.createServer((req, res) => {
  const connId = ++connectionCount;
  console.log(
    chalk.red(`[HTTP/1.0] Connection ${connId} - ${req.method} ${req.url}`),
  );

  // Force close connection after response (HTTP/1.0 behaviour)
  res.setHeader("Connection", "close");

  const filePath = path.join(__dirname, "../../public/static", req.url);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error reading file");
        console.log(chalk.yellow(`[HTTP/1.0] Connection ${connId} - CLOSED (error reading file)`));
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(data);
        console.log(
          chalk.red(
            `[HTTP/1.0] Connection ${connId} - CLOSED (new connection per request)`,
          ),
        );
      }
    });
  } else {
    res.writeHead(404);
    res.end("File not found");
    console.log(chalk.yellow(`[HTTP/1.0] Connection ${connId} - CLOSED (file not found)`));
  }
});

server.on("connection", (socket) => {
  const connId = connectionCount + 1;
  activeConnections.set(socket, connId);

  socket.on("close", () => {
    activeConnections.delete(socket);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(chalk.blue(`HTTP/1.0 server running on http://localhost:${PORT}`));
  console.log(chalk.red.bold("Behaviour: New TCP connection for EVERY request"));
});
