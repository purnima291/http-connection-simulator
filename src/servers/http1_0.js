import http from "http";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This code simulates HTTP/1.0 behaviour.
 * Caveat here is that Node.js's http module is HTTP/1.1 under the hood.
 * So protocol wise, this implementation is slightly inaccurate.
 * True HTTP/1.0 simulation would require using raw TCP socket (net module).
 */

let connectionCount = 0;
const activeConnections = new Map();

const server = http.createServer((req, res) => {
  const connId = activeConnections.get(req.socket);
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
        console.log(
          chalk.yellow(
            `[HTTP/1.0] Connection ${connId} - CLOSED (error reading file)`,
          ),
        );
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
    console.log(
      chalk.yellow(`[HTTP/1.0] Connection ${connId} - CLOSED (file not found)`),
    );
  }
});

server.on("connection", (socket) => {
  const connId = ++connectionCount;
  activeConnections.set(socket, connId);
  
  console.log(chalk.green(`[HTTP/1.0] NEW TCP CONNECTION ${connId} established`));
  console.log(chalk.gray(`      Active connections: ${activeConnections.size}`));

  socket.on("close", () => {
    activeConnections.delete(socket)
    console.log(chalk.red(`[HTTP/1.0] TCP connection ${connId} closed`));
    console.log(chalk.gray(`        Active connections: ${activeConnections.size}`));
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(
    chalk.blue(`HTTP/1.0 server running on http://localhost:${PORT}`),
  );
  console.log(
    chalk.red.bold("Behaviour: New TCP connection for EVERY request"),
  );
});
